import { afterAll, describe, expect, test } from "bun:test"
import fs from "fs"
import path from "path"
import { Effect, Layer } from "effect"
import { Session as SessionNs } from "@/session/session"
import { MessageV2 } from "@/session/message-v2"
import { Todo } from "@/session/todo"
import { MessageID, PartID } from "@/session/schema"
import { Bus } from "@/bus"
import { Storage } from "@/storage/storage"
import { SyncEvent } from "@/sync"
import { RuntimeFlags } from "@/effect/runtime-flags"
import { BackgroundJob } from "@/background/job"
import { Database } from "@/storage/db"
import { CrossSpawnSpawner } from "@teamcode-ai/core/cross-spawn-spawner"
import { InstallationVersion } from "@teamcode-ai/core/installation/version"
import { InstanceState } from "@/effect/instance-state"
import { testEffect } from "../lib/effect"
import { api, dumpTables, goCoreBinary, startGoCore, useSharedGocoreDatabase } from "./harness"

const it = testEffect(
  Layer.mergeAll(
    SessionNs.layer.pipe(
      Layer.provide(Bus.layer),
      Layer.provide(Storage.defaultLayer),
      Layer.provide(SyncEvent.defaultLayer),
      Layer.provide(RuntimeFlags.layer({ experimentalWorkspaces: false })),
      Layer.provide(BackgroundJob.defaultLayer),
    ),
    Todo.defaultLayer,
    CrossSpawnSpawner.defaultLayer,
  ),
)

const userInfo = (sessionID: string, created: number) => ({
  id: MessageID.ascending(),
  sessionID,
  role: "user" as const,
  time: { created },
  agent: "build",
  model: { providerID: "p", modelID: "m" },
})

const assistantInfo = (sessionID: string, parentID: string, created: number) => ({
  id: MessageID.ascending(),
  sessionID,
  role: "assistant" as const,
  time: { created },
  parentID,
  modelID: "m",
  providerID: "p",
  mode: "build",
  agent: "build",
  path: { cwd: "/", root: "/" },
  cost: 0,
  tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
})

const stepFinish = (sessionID: string, messageID: string, cost: number, input: number) => ({
  id: PartID.ascending(),
  sessionID,
  messageID,
  type: "step-finish" as const,
  reason: "stop",
  cost,
  tokens: { input, output: 2, reasoning: 3, cache: { read: 4, write: 5 } },
})

const scenario = {
  async run(ops: {
    create: (input: { title?: string; parentID?: string }) => Promise<{ id: string }>
    setTitle: (id: string, title: string) => Promise<void>
    message: (sessionID: string, info: Record<string, unknown>) => Promise<{ id: string }>
    part: (sessionID: string, messageID: string, part: Record<string, unknown>) => Promise<{ id: string }>
    removePart: (sessionID: string, messageID: string, partID: string) => Promise<void>
    removeMessage: (sessionID: string, messageID: string) => Promise<void>
    todos: (sessionID: string, todos: { content: string; status: string; priority: string }[]) => Promise<void>
    remove: (id: string) => Promise<void>
  }) {
    const root = await ops.create({ title: "Parity root" })
    await ops.setTitle(root.id, "Parity root renamed")
    const user = await ops.message(root.id, userInfo(root.id, 1_000))
    const assistant = await ops.message(root.id, assistantInfo(root.id, user.id, 1_001))
    await ops.part(root.id, assistant.id, { id: PartID.ascending(), sessionID: root.id, messageID: assistant.id, type: "text", text: "hello" })
    const finish = await ops.part(root.id, assistant.id, stepFinish(root.id, assistant.id, 0.25, 10))
    const finish2 = await ops.part(root.id, assistant.id, stepFinish(root.id, assistant.id, 0.5, 20))
    await ops.removePart(root.id, assistant.id, finish2.id)
    const stray = await ops.message(root.id, userInfo(root.id, 1_002))
    await ops.part(root.id, stray.id, stepFinish(root.id, stray.id, 9, 900))
    await ops.removeMessage(root.id, stray.id)
    await ops.todos(root.id, [
      { content: "second", status: "pending", priority: "low" },
      { content: "first", status: "completed", priority: "high" },
    ])
    const child = await ops.create({ title: "Parity child", parentID: root.id })
    await ops.message(child.id, userInfo(child.id, 2_000))
    const doomed = await ops.create({ title: "Doomed" })
    await ops.create({ title: "Doomed child", parentID: doomed.id })
    await ops.remove(doomed.id)
    void finish
  },
}

describe("go-core session parity", () => {
  const binary = goCoreBinary()
  if (!binary) {
    test.skip("GO_CORE_BINARY not set; skipping parity", () => {})
    return
  }

  const restoreTeamcodeDb = useSharedGocoreDatabase()

  afterAll(() => {
    restoreTeamcodeDb()
  })

  it.instance("TS and Go produce the same tables for the same scenario", () =>
    Effect.gen(function* () {
      const session = yield* SessionNs.Service
      const todo = yield* Todo.Service
      const ctx = yield* InstanceState.context

      const ambientInstanceContext = yield* Effect.context()
      const run = <A, E>(effect: Effect.Effect<A, E>) => Effect.runPromiseWith(ambientInstanceContext)(effect)

      const tsDb = Database.getPath()
      const goDb = tsDb.replace(/\.db$/, "-go.db")
      Database.use((db) => db.run("DELETE FROM session"))
      Database.use((db) => db.run("PRAGMA wal_checkpoint(TRUNCATE)"))
      fs.copyFileSync(tsDb, goDb)

      yield* Effect.promise(() =>
        scenario.run({
          create: (input) => run(session.create({ title: input.title, parentID: input.parentID as never })),
          setTitle: (id, title) => run(session.setTitle({ sessionID: id as never, title })),
          message: (_, info) => run(session.updateMessage(info as MessageV2.Info)),
          part: (_, __, part) => run(session.updatePart(part as MessageV2.Part)),
          removePart: (sessionID, messageID, partID) =>
            run(session.removePart({ sessionID: sessionID as never, messageID: messageID as never, partID: partID as never })).then(() => undefined),
          removeMessage: (sessionID, messageID) =>
            run(session.removeMessage({ sessionID: sessionID as never, messageID: messageID as never })).then(() => undefined),
          todos: (sessionID, todos) => run(todo.update({ sessionID: sessionID as never, todos })),
          remove: (id) => run(session.remove(id as never)),
        }),
      )

      const go = yield* Effect.promise(() => startGoCore({ dbPath: goDb }))
      try {
        yield* Effect.promise(() =>
          scenario.run({
            create: (input) =>
              api(go.baseUrl, "POST", "/v1/session", {
                projectID: ctx.project.id,
                directory: ctx.directory,
                path: path.relative(path.resolve(ctx.worktree), ctx.directory).replaceAll("\\", "/"),
                version: InstallationVersion,
                title: input.title,
                parentID: input.parentID,
              }),
            setTitle: (id, title) => api(go.baseUrl, "PATCH", `/v1/session/${id}`, { title }).then(() => undefined),
            message: (sessionID, info) => api(go.baseUrl, "PUT", `/v1/session/${sessionID}/message/${String(info.id)}`, info),
            part: (sessionID, messageID, part) => api(go.baseUrl, "PUT", `/v1/session/${sessionID}/message/${messageID}/part/${String(part.id)}`, part),
            removePart: (sessionID, messageID, partID) =>
              api(go.baseUrl, "DELETE", `/v1/session/${sessionID}/message/${messageID}/part/${partID}`).then(() => undefined),
            removeMessage: (sessionID, messageID) =>
              api(go.baseUrl, "DELETE", `/v1/session/${sessionID}/message/${messageID}`).then(() => undefined),
            todos: (sessionID, todos) => api(go.baseUrl, "PUT", `/v1/session/${sessionID}/todo`, todos).then(() => undefined),
            remove: (id) => api(go.baseUrl, "DELETE", `/v1/session/${id}`).then(() => undefined),
          }),
        )
      } finally {
        yield* Effect.promise(() => go.stop())
      }

      Database.use((db) => db.run("PRAGMA wal_checkpoint(TRUNCATE)"))
      const tsDump = dumpTables(tsDb)
      const goDump = dumpTables(goDb)
      expect(goDump.sessions).toEqual(tsDump.sessions)
      expect(goDump.messages).toEqual(tsDump.messages)
      expect(goDump.parts).toEqual(tsDump.parts)
      expect(goDump.todos).toEqual(tsDump.todos)
      expect(tsDump.sessions.length).toBe(2)
      expect(tsDump.sessions[0]["cost"]).toBe(0.25)
    }),
    { timeout: 30000 },
  )
})
