import "./init-projectors"

import { NodeHttpServer } from "@effect/platform-node"
import * as Log from "@teamcode-ai/core/util/log"
import { ConfigProvider, Context, Duration, Effect, Exit, Layer, Scope } from "effect"
import { HttpRouter, HttpServer } from "effect/unstable/http"
import { OpenApi } from "effect/unstable/httpapi"
import { createServer, type Server } from "node:http"
import { MDNS } from "./mdns"
import { HttpApiApp } from "./routes/instance/httpapi/server"
import { disposeMiddleware } from "./routes/instance/httpapi/lifecycle"
import { WebSocketTracker } from "./routes/instance/httpapi/websocket-tracker"
import { PublicApi } from "./routes/instance/httpapi/public"
import type { CorsOptions } from "./cors"
import { InstanceLayer } from "@/project/instance-layer"
import { RuntimeFlags } from "@/effect/runtime-flags"
import { lazy } from "@/util/lazy"

// @ts-ignore This global is needed to prevent ai-sdk from logging warnings to stdout https://github.com/vercel/ai/blob/2dc67e0ef538307f21368db32d5a12345d98831b/packages/ai/src/logger/log-warnings.ts#L85
globalThis.AI_SDK_LOG_WARNINGS = false

const log = Log.create({ service: "server" })

export type Listener = {
  hostname: string
  port: number
  url: URL
  stop: (close?: boolean) => Promise<void>
}

type ServerApp = {
  fetch(request: Request): Response | Promise<Response>
  request(input: string | URL | Request, init?: RequestInit): Response | Promise<Response>
}

type ListenOptions = CorsOptions & {
  port: number
  hostname: string
  mdns?: boolean
  mdnsDomain?: string
}
type ListenerState = {
  scope: Scope.Scope
  server: Context.Service.Shape<typeof HttpServer.HttpServer>
  http: ListenerServer
  websockets: WebSocketTracker.Interface
}
type EffectListener = Omit<Listener, "stop"> & {
  stop: (close?: boolean) => Effect.Effect<void>
}

interface ListenerServer {
  readonly closeAll: Effect.Effect<void>
}

class ListenerServerService extends Context.Service<ListenerServerService, ListenerServer>()(
  "@teamcode/ListenerServer",
) {}

export const Default = lazy(() => {
  const handler = HttpApiApp.webHandler().handler
  const app: ServerApp = {
    fetch: (request: Request) => handler(request, HttpApiApp.context),
    request(input, init) {
      return app.fetch(input instanceof Request ? input : new Request(new URL(input, "http://localhost"), init))
    },
  }
  return { app }
})

export async function openapi() {
  return OpenApi.fromApi(PublicApi)
}

export let url: URL

export async function listen(opts: ListenOptions): Promise<Listener> {
  const listener = await Effect.runPromise(listenEffect(opts))
  return {
    hostname: listener.hostname,
    port: listener.port,
    url: listener.url,
    stop: (close?: boolean) => Effect.runPromiseExit(listener.stop(close)).then(() => undefined),
  }
}

const listenEffect: (opts: ListenOptions) => Effect.Effect<EffectListener, unknown> = Effect.fn("Server.listen")(
  function* (opts: ListenOptions) {
    const state = yield* startWithPortFallback(opts)
    const address = yield* tcpAddress(state)
    const listenerUrl = makeURL(opts.hostname, address.port)
    url = listenerUrl

    const unpublishMdns = yield* setupMdns(opts, address.port, state.scope)

    // Periodic health check to detect epoll fd polling stall (Bun runtime workaround)
    yield* Effect.forkIn(state.scope)(
      Effect.gen(function* () {
        const healthUrl = `${listenerUrl.protocol}//${listenerUrl.host}/global/health`
        let failCount = 0

        while (true) {
          yield* Effect.sleep(Duration.seconds(30))
          const response = yield* Effect.tryPromise({
            try: () => fetch(healthUrl, { signal: AbortSignal.timeout(5000) }),
            catch: (e) => e,
          })
          if (response instanceof Error || !response.ok) {
            failCount++
            log.warn("server health check failed", { failCount, healthUrl, status: response instanceof Error ? response.message : response.status })
            if (failCount >= 2) {
              log.error("server unresponsive, restarting listener", { healthUrl })
              const entry = serverRegistry.get(`${opts.hostname}:${address.port}`)
              if (entry) {
                entry.server.closeAllConnections()
                entry.server.close()
                serverRegistry.delete(`${opts.hostname}:${address.port}`)
              }
              failCount = 0
            }
          } else {
            failCount = 0
          }
        }
      }),
    )

    return {
      hostname: opts.hostname,
      port: address.port,
      url: listenerUrl,
      stop: yield* makeStop(state, unpublishMdns),
    }
  },
)

function listenerLayer(opts: ListenOptions, port: number) {
  return HttpRouter.serve(HttpApiApp.createRoutes(opts), {
    middleware: disposeMiddleware,
    disableLogger: true,
    disableListenLog: true,
  }).pipe(
    Layer.provideMerge(WebSocketTracker.layer),
    Layer.provideMerge(serverLayer({ port, hostname: opts.hostname })),
    Layer.provideMerge(RuntimeFlags.defaultLayer),
    Layer.provideMerge(InstanceLayer.layer),
    // Install a fresh `ConfigProvider` per listener so `Config.string(...)`
    // reads reflect the current `process.env`. Effect's default
    // `ConfigProvider` snapshots `process.env` on first read and caches the
    // result on a module-singleton Reference; without overriding it here,
    // every later `Server.listen()` keeps observing that initial snapshot.
    Layer.provide(ConfigProvider.layer(ConfigProvider.fromEnv())),
  )
}

function startWithPortFallback(opts: ListenOptions) {
  if (opts.port !== 0) return startListener(opts, opts.port)
  // Match the legacy listener port-resolution behavior: explicit `0` prefers
  // 4096 first, then any free port.
  return startListener(opts, 4096).pipe(Effect.catch(() => startListener(opts, 0)))
}

function startListener(opts: ListenOptions, port: number) {
  const scope = Scope.makeUnsafe()
  return Layer.buildWithMemoMap(listenerLayer(opts, port), Layer.makeMemoMapUnsafe(), scope).pipe(
    Effect.provide(HttpApiApp.context),
    Effect.onError(() => Scope.close(scope, Exit.void).pipe(Effect.ignore)),
    Effect.map(
      (ctx): ListenerState => ({
        scope,
        server: Context.get(ctx, HttpServer.HttpServer),
        http: Context.get(ctx, ListenerServerService),
        websockets: Context.get(ctx, WebSocketTracker.Service),
      }),
    ),
  )
}

function tcpAddress(state: ListenerState) {
  return Effect.gen(function* () {
    if (state.server.address._tag === "TcpAddress") return state.server.address
    yield* Scope.close(state.scope, Exit.void).pipe(Effect.ignore)
    return yield* Effect.die(new Error(`Unexpected HttpServer address tag: ${state.server.address._tag}`))
  })
}

function makeURL(hostname: string, port: number) {
  const result = new URL("http://localhost")
  result.hostname = hostname
  result.port = String(port)
  return result
}

function setupMdns(opts: ListenOptions, port: number, scope: Scope.Scope) {
  return Effect.gen(function* () {
    const publish =
      opts.mdns && port && opts.hostname !== "127.0.0.1" && opts.hostname !== "localhost" && opts.hostname !== "::1"
    if (publish) {
      const unpublish = yield* Effect.cached(Effect.sync(() => MDNS.unpublish()))
      yield* Effect.sync(() => MDNS.publish(port, opts.mdnsDomain))
      yield* Scope.addFinalizer(scope, unpublish)
      return unpublish
    }
    if (opts.mdns) log.warn("mDNS enabled but hostname is loopback; skipping mDNS publish")
    return Effect.void
  })
}

function makeStop(state: ListenerState, unpublishMdns: Effect.Effect<void>) {
  return Effect.gen(function* () {
    const forceCloseOnce = yield* Effect.cached(forceClose(state).pipe(Effect.ignore))
    const closeScopeOnce = yield* Effect.cached(Scope.close(state.scope, Exit.void).pipe(Effect.ignore))

    return (close?: boolean) =>
      Effect.gen(function* () {
        yield* unpublishMdns
        if (close) yield* forceCloseOnce
        yield* closeScopeOnce
      })
  })
}

function forceClose(state: ListenerState) {
  return Effect.all([state.http.closeAll, state.websockets.closeAll], { concurrency: "unbounded", discard: true })
}

const serverRegistry = new Map<string, { server: Server; url: URL }>()

function serverLayer(opts: { port: number; hostname: string }) {
  const server = createServer()
  const serverRef = { closeStarted: false, forceStop: false }
  const close = server.close.bind(server)
  // Keep shutdown owned by NodeHttpServer, but honor listener.stop(true) by
  // force-closing active HTTP sockets when its finalizer calls server.close().
  // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- Node's overloads don't preserve a monkey-patched method assignment.
  server.close = ((callback?: Parameters<typeof server.close>[0]) => {
    serverRef.closeStarted = true
    const result = close(callback)
    if (serverRef.forceStop) server.closeAllConnections()
    return result
  }) as typeof server.close

  const key = `${opts.hostname}:${opts.port}`
  server.on("listening", () => {
    const addr = server.address()
    if (addr && typeof addr === "object") {
      const u = makeURL(opts.hostname, addr.port)
      serverRegistry.set(key, { server, url: u })
    }
  })

  return Layer.mergeAll(
    NodeHttpServer.layer(() => server, { port: opts.port, host: opts.hostname, gracefulShutdownTimeout: "1 second" }),
    Layer.succeed(ListenerServerService)(
      ListenerServerService.of({
        closeAll: Effect.sync(() => {
          serverRef.forceStop = true
          if (serverRef.closeStarted) server.closeAllConnections()
        }),
      }),
    ),
  )
}

export * as Server from "./server"
