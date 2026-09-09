import { afterAll, describe, expect, test } from "bun:test"
import fs from "fs"
import os from "os"
import path from "path"
import { Effect, Layer } from "effect"
import { Session as SessionNs } from "@/session/session"
import { MessageV2 } from "@/session/message-v2"
import { MessageID, PartID } from "@/session/schema"
import { Bus } from "@/bus"
import { Storage } from "@/storage/storage"
import { SyncEvent } from "@/sync"
import { RuntimeFlags } from "@/effect/runtime-flags"
import { BackgroundJob } from "@/background/job"
import { Database } from "@/storage/db"
import { CrossSpawnSpawner } from "@teamcode-ai/core/cross-spawn-spawner"
import { testEffect } from "../lib/effect"
import { api, goCoreBinary, startGoCore } from "./harness"

const it = testEffect(
  Layer.mergeAll(
    SessionNs.layer.pipe(
      Layer.provide(Bus.layer),
      Layer.provide(Storage.defaultLayer),
      Layer.provide(SyncEvent.defaultLayer),
      Layer.provide(RuntimeFlags.layer({ experimentalWorkspaces: false })),
      Layer.provide(BackgroundJob.defaultLayer),
    ),
    CrossSpawnSpawner.defaultLayer,
  ),
)

const PARTS_PER_SIDE = 500

const stepFinish = (sessionID: string, messageID: string, id: string) => ({
  id,
  sessionID,
  messageID,
  type: "step-finish" as const,
  reason: "stop",
  cost: 1,
  tokens: { input: 1, output: 1, reasoning: 1, cache: { read: 1, write: 1 } },
})

describe("go-core and TS writing the same SQLite file", () => {
  const binary = goCoreBinary()
  if (!binary) {
    test.skip("GO_CORE_BINARY not set; skipping concurrency", () => {})
    return
  }

  const realFileDbDirOverridingInMemoryPreload = path.join(process.env["XDG_DATA_HOME"] ?? os.tmpdir(), "gocore-concurrency")
  fs.mkdirSync(realFileDbDirOverridingInMemoryPreload, { recursive: true })
  const teamcodeDbBeforeOverride = process.env["TEAMCODE_DB"]
  process.env["TEAMCODE_DB"] = path.join(realFileDbDirOverridingInMemoryPreload, "opencode.db")

  afterAll(() => {
    if (teamcodeDbBeforeOverride === undefined) delete process.env["TEAMCODE_DB"]
    else process.env["TEAMCODE_DB"] = teamcodeDbBeforeOverride
  })

  it.instance(
    "no lost writes and consistent usage counters",
    () =>
      Effect.gen(function* () {
        const session = yield* SessionNs.Service
        const ambientInstanceContext = yield* Effect.context()
        const run = <A, E>(effect: Effect.Effect<A, E>) => Effect.runPromiseWith(ambientInstanceContext)(effect)

        const info = yield* session.create({ title: "Concurrency" })
        const message = yield* session.updateMessage({
          id: MessageID.ascending(),
          sessionID: info.id,
          role: "user" as const,
          time: { created: Date.now() },
          agent: "build",
          model: { providerID: "p", modelID: "m" },
        })

        const go = yield* Effect.promise(() => startGoCore({ dbPath: Database.getPath() }))
        try {
          const tsWrites = Array.from({ length: PARTS_PER_SIDE }, () =>
            run(session.updatePart(stepFinish(info.id, message.id, PartID.ascending()) as MessageV2.Part)),
          )
          const goWrites = Array.from({ length: PARTS_PER_SIDE }, () => {
            const id = PartID.ascending()
            return api(go.baseUrl, "PUT", `/v1/session/${info.id}/message/${message.id}/part/${id}`, stepFinish(info.id, message.id, id))
          })
          yield* Effect.promise(() => Promise.all([...tsWrites, ...goWrites]))

          const stored = yield* Effect.promise(() => api(go.baseUrl, "GET", `/v1/session/${info.id}`))
          expect(stored.cost).toBe(PARTS_PER_SIDE * 2)
          expect(stored.tokens.input).toBe(PARTS_PER_SIDE * 2)

          const page = yield* Effect.promise(() => api(go.baseUrl, "GET", `/v1/session/${info.id}/messages?limit=10`))
          expect(page.messages[0].parts.length).toBe(PARTS_PER_SIDE * 2)

          const fromTs = yield* session.messages({ sessionID: info.id })
          expect(fromTs[0].parts.length).toBe(PARTS_PER_SIDE * 2)
        } finally {
          yield* Effect.promise(() => go.stop())
        }
      }),
    { timeout: 30000 },
  )
})
