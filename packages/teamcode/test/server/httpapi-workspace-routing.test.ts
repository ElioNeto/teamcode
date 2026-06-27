import { NodeHttpServer, NodeServices } from "@effect/platform-node"
import { describe, expect } from "bun:test"
import { Context, Effect, Layer, Queue, Ref } from "effect"
import { FetchHttpClient, HttpClient, HttpClientRequest, HttpRouter, HttpServer, HttpServerRequest, HttpServerResponse } from "effect/unstable/http"
import * as Socket from "effect/unstable/socket/Socket"
import Http from "node:http"
import { mkdir } from "node:fs/promises"
import path from "node:path"
import { registerAdapter, clearAllAdapters } from "../../src/control-plane/adapters"
import { WorkspaceID } from "../../src/control-plane/schema"
import type { WorkspaceAdapter } from "../../src/control-plane/types"
import { Workspace } from "../../src/control-plane/workspace"
import { WorkspaceTable } from "../../src/control-plane/workspace.sql"
import { Project } from "../../src/project/project"
import { WorkspacePaths } from "../../src/server/routes/instance/httpapi/groups/workspace"
import { WorkspaceRouteContext, workspaceRouterMiddleware } from "../../src/server/routes/instance/httpapi/middleware/workspace-routing"
import { HEADER as FenceHeader } from "../../src/server/shared/fence"
import { Database } from "../../src/storage/db"
import { resetDatabase } from "../fixture/db"
import { workspaceLayerWithRuntimeFlags } from "../fixture/workspace"
import { tmpdirScoped } from "../fixture/fixture"
import { testEffect, BeforeEach } from "../lib/effect"

const workspaceLayer = workspaceLayerWithRuntimeFlags({ experimentalWorkspaces: true })

// Custom server layer with disablePreemptiveShutdown so that server.serve()'s
// finalizer does NOT call server.close() and kill the test server for all
// remaining tests.
const serverLayer = NodeHttpServer.layer(
  Http.createServer,
  { host: "127.0.0.1", port: 0, disablePreemptiveShutdown: true },
)

const it = testEffect(
  Layer.mergeAll(
    Layer.effectDiscard(Effect.gen(function* () {
      yield* Effect.promise(() => resetDatabase())
      yield* Effect.addFinalizer(() => Effect.promise(() => resetDatabase()))
    })),
    serverLayer,
    NodeServices.layer,
    FetchHttpClient.layer,
    Project.defaultLayer,
    workspaceLayer,
    Socket.layerWebSocketConstructorGlobal,
    Layer.succeed(BeforeEach, Effect.sync(() => clearAllAdapters())),
  ),
)

// Helper to get the test server URL
const baseUrl = HttpServer.HttpServer.use((s) => Effect.succeed(HttpServer.formatAddress(s.address)))

const mwLayer = workspaceRouterMiddleware.layer.pipe(
  Layer.provide([Socket.layerWebSocketConstructorGlobal, FetchHttpClient.layer]),
)

const requestURL = (request: { readonly url: string }) => new URL(request.url, "http://localhost")

type TestHandler<E, R> = (request: HttpServerRequest.HttpServerRequest) => Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>

const listenAdditionalServer = <E, R>(handler: TestHandler<E, R>) =>
  Effect.gen(function* () {
    const ctx = yield* Layer.build(NodeHttpServer.layer(Http.createServer, { host: "127.0.0.1", port: 0 }))
    const server = Context.get(ctx, HttpServer.HttpServer)
    yield* server.serve(HttpServerRequest.HttpServerRequest.use(handler))
    return HttpServer.formatAddress(server.address)
  })

const localAdapter = (directory: string): WorkspaceAdapter => ({
  name: "Local Test", description: "Create a local test workspace",
  configure: (info) => ({ ...info, name: "local-test", directory }),
  create: async () => { await mkdir(directory, { recursive: true }) },
  async remove() {},
  target: () => ({ type: "local" as const, directory }),
})

const remoteAdapter = (directory: string, url: string, headers?: HeadersInit): WorkspaceAdapter => ({
  name: "Remote Test", description: "Create a remote test workspace",
  configure: (info) => ({ ...info, name: "remote-test", directory }),
  create: async () => { await mkdir(directory, { recursive: true }) },
  async remove() {},
  target: () => ({ type: "remote" as const, url, headers }),
})

const eventStreamResponse = () =>
  HttpServerResponse.text('data: {"payload":{"type":"server.connected","properties":{}}}\n\n', { contentType: "text/event-stream" })

const syncResponse = (request: HttpServerRequest.HttpServerRequest) => {
  const url = requestURL(request)
  if (url.pathname === "/base/global/event") return Effect.succeed(eventStreamResponse())
  if (url.pathname === "/base/sync/history") return HttpServerResponse.json([])
  return undefined
}

const createWorkspace = (input: { projectID: Project.Info["id"]; type: string; adapter: WorkspaceAdapter }) =>
  Effect.acquireRelease(
    Effect.gen(function* () {
      registerAdapter(input.projectID, input.type, input.adapter)
      const workspace = yield* Workspace.Service
      return yield* workspace.create({ type: input.type, branch: null, extra: null, projectID: input.projectID })
    }),
    (info) => Workspace.Service.use((workspace) => workspace.remove(info.id)).pipe(Effect.ignore),
  )

const createRemoteWorkspace = (input: { dir: string; projectID: Project.Info["id"]; type: string; url: string; headers?: HeadersInit }) =>
  createWorkspace({
    projectID: input.projectID, type: input.type,
    adapter: remoteAdapter(path.join(input.dir, `.${input.type}`), input.url, input.headers),
  })

const createLocalWorkspace = (input: { projectID: Project.Info["id"]; type: string; directory: string }) =>
  createWorkspace({ projectID: input.projectID, type: input.type, adapter: localAdapter(input.directory) })

const insertRemoteWorkspaceWithoutSync = (input: { dir: string; projectID: Project.Info["id"]; type: string; url: string }) =>
  Effect.sync(() => {
    const id = WorkspaceID.ascending()
    registerAdapter(input.projectID, input.type, remoteAdapter(path.join(input.dir, `.${input.type}`), input.url))
    Database.use((db) => db.insert(WorkspaceTable).values({ id, type: input.type, project_id: input.projectID }).run())
    return id
  })

const startRemoteWorkspaceHttpServer = <E, R>(handler: (request: { url: string; method: string; headers: Record<string, string> }) => Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>) =>
  listenAdditionalServer((request) => Effect.gen(function* () {
    const sync = syncResponse(request)
    if (sync) return yield* sync
    return yield* handler({ url: request.url, method: request.method, headers: request.headers })
  }))

const listenRemoteWebSocket = () =>
  listenAdditionalServer((request) => {
    const sync = syncResponse(request)
    if (sync) return sync
    if (requestURL(request).pathname !== "/base/probe") return Effect.succeed(HttpServerResponse.empty({ status: 404 }))
    return echoWebSocket(request)
  })

const echoWebSocket = (request: HttpServerRequest.HttpServerRequest) =>
  Effect.gen(function* () {
    const socket = yield* Effect.orDie(request.upgrade)
    const write = yield* socket.writer
    yield* socket.runRaw((message) => write(`echo:${String(message)}`), {
      onOpen: write(`protocol:${request.headers["sec-websocket-protocol"] ?? "none"}`).pipe(Effect.catch(() => Effect.void)),
    }).pipe(Effect.catch(() => Effect.void))
    return HttpServerResponse.empty()
  })

const probeHandler = Effect.gen(function* () {
  const route = yield* WorkspaceRouteContext
  return yield* HttpServerResponse.json({ directory: route.directory, workspaceID: route.workspaceID })
})

describe("HttpApi workspace routing middleware", () => {
  it.live("proxies remote workspace HTTP requests through the selected workspace target", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      let forwarded: { url: string; method: string; headers: Record<string, string> } | undefined

      const remoteUrl = yield* startRemoteWorkspaceHttpServer((request) => {
        forwarded = request
        const url = requestURL(request)
        return HttpServerResponse.json(
          { proxied: true, path: url.pathname, keep: url.searchParams.get("keep"), workspace: url.searchParams.get("workspace") },
          { status: 201, headers: { "x-remote": "yes" } },
        )
      })
      const workspace = yield* createRemoteWorkspace({
        dir, projectID: project.project.id, type: "remote-http-target", url: `${remoteUrl}/base`, headers: { "x-target-auth": "secret" },
      })

      const url = yield* baseUrl
      yield* HttpRouter.add("PATCH", "/probe", HttpServerResponse.text("route called")).pipe(
        Layer.provide(mwLayer), HttpRouter.serve, Layer.build,
      )

      const response = yield* HttpClientRequest.patch(`${url}/probe?workspace=${workspace.id}&keep=yes`).pipe(
        HttpClientRequest.setHeaders({
          "content-type": "application/json", "x-teamcode-directory": "/secret/path", "x-teamcode-workspace": "internal",
        }),
        HttpClient.execute,
      )

      expect(response.status).toBe(201)
      expect(response.headers["x-remote"]).toBe("yes")
      expect(yield* response.json).toEqual({ proxied: true, path: "/base/probe", keep: "yes", workspace: null })
      const fu = forwarded ? requestURL(forwarded) : undefined
      expect(fu?.pathname).toBe("/base/probe")
      expect(fu?.searchParams.get("keep")).toBe("yes")
      expect(fu?.searchParams.get("workspace")).toBeNull()
      expect(forwarded?.method).toBe("PATCH")
      expect(forwarded?.headers["content-type"]).toBe("application/json")
      expect(forwarded?.headers["x-target-auth"]).toBe("secret")
      expect(forwarded?.headers["x-teamcode-directory"]).toBeUndefined()
      expect(forwarded?.headers["x-teamcode-workspace"]).toBeUndefined()
    }),
  )

  it.live("waits for sync fence headers from remote workspace HTTP responses", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      const workspaceID = WorkspaceID.ascending()
      const type = "remote-http-fence-target"
      const waited = yield* Ref.make<{ workspaceID: WorkspaceID; state: Record<string, number> } | undefined>(undefined)

      const remoteUrl = yield* startRemoteWorkspaceHttpServer(() =>
        HttpServerResponse.json({ proxied: true }, { status: 202, headers: { [FenceHeader]: JSON.stringify({ aggregate: 3 }) } }),
      )
      registerAdapter(project.project.id, type, remoteAdapter(path.join(dir, `.${type}`), `${remoteUrl}/base`))

      const mockWorkspace = Workspace.Service.of({
        create: () => Effect.die("unused"), sessionWarp: () => Effect.die("unused"),
        list: () => Effect.die("unused"), syncList: () => Effect.die("unused"),
        get: (id) => Effect.succeed(id === workspaceID ? {
          id: workspaceID, type, branch: null, name: "remote-http-fence-target", directory: null,
          extra: null, projectID: project.project.id, timeUsed: Date.now(),
        } : undefined),
        remove: () => Effect.die("unused"), status: () => Effect.die("unused"),
        isSyncing: () => Effect.succeed(true),
        waitForSync: (id, state) => Ref.set(waited, { workspaceID: id, state }),
        startWorkspaceSyncing: () => Effect.die("unused"),
      })

      // Provide mock workspace directly via the middleware layer so the
      // middleware's init effect captures it instead of the real service.
      const fenceMwLayer = workspaceRouterMiddleware.layer.pipe(
        Layer.provide([Socket.layerWebSocketConstructorGlobal, FetchHttpClient.layer, Layer.succeed(Workspace.Service, mockWorkspace)]),
      )
      yield* HttpRouter.add("PATCH", "/probe", HttpServerResponse.text("route called")).pipe(
        Layer.provide(fenceMwLayer), HttpRouter.serve, Layer.build,
      )

      const url = yield* baseUrl
      const response = yield* HttpClientRequest.patch(`${url}/probe?workspace=${workspaceID}`).pipe(HttpClient.execute)

      expect(response.status).toBe(202)
      expect(yield* response.json).toEqual({ proxied: true })
      expect(yield* Ref.get(waited)).toEqual({ workspaceID, state: { aggregate: 3 } })
    }),
  )

  it.live("returns 503 when a remote workspace is not actively syncing", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      const workspaceID = yield* insertRemoteWorkspaceWithoutSync({
        dir, projectID: project.project.id, type: "remote-not-syncing", url: "http://127.0.0.1:1/base",
      })

      const url = yield* baseUrl
      yield* HttpRouter.add("GET", "/probe", HttpServerResponse.text("route called")).pipe(
        Layer.provide(mwLayer), HttpRouter.serve, Layer.build,
      )

      const response = yield* HttpClient.get(`${url}/probe?workspace=${workspaceID}`)

      expect(response.status).toBe(503)
      expect(yield* response.text).toBe(`broken sync connection for workspace: ${workspaceID}`)
    }),
  )

  it.live("proxies remote workspace WebSocket requests through the selected workspace target", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      const remoteUrl = yield* listenRemoteWebSocket()
      const workspace = yield* createRemoteWorkspace({ dir, projectID: project.project.id, type: "remote-websocket-target", url: `${remoteUrl}/base` })

      const url = yield* baseUrl
      yield* HttpRouter.add("GET", "/probe", HttpServerResponse.text("route called")).pipe(
        Layer.provide(mwLayer), HttpRouter.serve, Layer.build,
      )

      const socket = yield* Socket.makeWebSocket(
        `${url.replace(/^http/, "ws")}/probe?workspace=${workspace.id}`,
        { closeCodeIsError: () => false, protocols: "chat" },
      )
      const messages = yield* Queue.unbounded<string>()
      yield* socket.runRaw((message) => Queue.offer(messages, String(message))).pipe(Effect.forkScoped)
      const write = yield* socket.writer

      expect(yield* Queue.take(messages)).toBe("protocol:chat")
      yield* write("hello")
      expect(yield* Queue.take(messages)).toBe("echo:hello")
    }),
  )

  it.live("returns a missing workspace response for unknown workspace ids", () =>
    Effect.gen(function* () {
      const workspaceID = WorkspaceID.ascending("wrk_missing")

      const url = yield* baseUrl
      yield* HttpRouter.add("GET", "/probe", HttpServerResponse.text("route called")).pipe(
        Layer.provide(mwLayer), HttpRouter.serve, Layer.build,
      )

      const response = yield* HttpClient.get(`${url}/probe?workspace=${workspaceID}`)

      expect(response.status).toBe(500)
      expect(yield* response.text).toBe(`Workspace not found: ${workspaceID}`)
    }),
  )

  it.live("keeps control-plane routes local even when workspace is selected", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      const workspaceDir = path.join(dir, ".workspace-local")
      const workspace = yield* createLocalWorkspace({ projectID: project.project.id, type: "control-plane-target", directory: workspaceDir })

      const sessionHandler = Effect.gen(function* () {
        const route = yield* WorkspaceRouteContext
        return yield* HttpServerResponse.json({ directory: route.directory, workspaceID: route.workspaceID })
      })
      const url = yield* baseUrl
      yield* HttpRouter.add("GET", "/session", sessionHandler).pipe(
        Layer.provide(mwLayer), HttpRouter.serve, Layer.build,
      )

      const response = yield* HttpClient.get(`${url}/session?workspace=${workspace.id}`)

      expect(response.status).toBe(200)
      expect(yield* response.json).toEqual({ directory: process.cwd(), workspaceID: workspace.id })
    }),
  )

  it.live("keeps workspace control routes local even when workspace is selected", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      const workspaceDir = path.join(dir, ".workspace-local")
      const workspace = yield* createLocalWorkspace({ projectID: project.project.id, type: "workspace-control-plane-target", directory: workspaceDir })

      const listHandler = Effect.gen(function* () {
        const route = yield* WorkspaceRouteContext
        return yield* HttpServerResponse.json({ directory: route.directory, workspaceID: route.workspaceID })
      })
      const url = yield* baseUrl
      yield* HttpRouter.add("GET", WorkspacePaths.list, listHandler).pipe(
        Layer.provide(mwLayer), HttpRouter.serve, Layer.build,
      )

      const response = yield* HttpClient.get(`${url}${WorkspacePaths.list}?workspace=${workspace.id}`)

      expect(response.status).toBe(200)
      expect(yield* response.json).toEqual({ directory: process.cwd(), workspaceID: workspace.id })
    }),
  )

  it.live("uses directory query/header fallback when no workspace is selected", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped()
      const queryDir = path.join(dir, "query-target")
      const headerDir = path.join(dir, "header-target")

      const url = yield* baseUrl
      yield* HttpRouter.add("GET", "/probe", probeHandler).pipe(
        Layer.provide(mwLayer), HttpRouter.serve, Layer.build,
      )

      const queryResponse = yield* HttpClient.get(`${url}/probe?directory=${encodeURIComponent(queryDir)}`)
      const headerResponse = yield* HttpClientRequest.get(`${url}/probe`).pipe(
        HttpClientRequest.setHeader("x-teamcode-directory", headerDir), HttpClient.execute,
      )

      expect(queryResponse.status).toBe(200)
      expect(yield* queryResponse.json).toEqual({ directory: queryDir })
      expect(headerResponse.status).toBe(200)
      expect(yield* headerResponse.json).toEqual({ directory: headerDir })
    }),
  )

  it.live("routes local workspace requests through WorkspaceRouteContext", () =>
    Effect.gen(function* () {
      const dir = yield* tmpdirScoped({ git: true })
      const project = yield* Project.use.fromDirectory(dir)
      const workspaceDir = path.join(dir, ".workspace-local")
      const workspace = yield* createLocalWorkspace({ projectID: project.project.id, type: "local-target", directory: workspaceDir })

      const url = yield* baseUrl
      yield* HttpRouter.add("GET", "/probe", probeHandler).pipe(
        Layer.provide(mwLayer), HttpRouter.serve, Layer.build,
      )

      const response = yield* HttpClient.get(`${url}/probe?workspace=${workspace.id}`)

      expect(response.status).toBe(200)
      expect(yield* response.json).toEqual({ directory: workspaceDir, workspaceID: workspace.id })
    }),
  )
})
