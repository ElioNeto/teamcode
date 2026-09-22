import { afterEach, beforeEach, describe, expect } from "bun:test"
import { Cause, Effect, Exit, Layer } from "effect"
import { Agent } from "@/agent/agent"
import { Bus } from "@/bus"
import { CrossSpawnSpawner } from "@teamcode-ai/core/cross-spawn-spawner"
import { Session } from "@/session/session"
import { MessageID } from "@/session/schema"
import { ExternalSessionTool } from "@/tool/external_session"
import { Truncate } from "@/tool/truncate"
import { RuntimeFlags } from "@/effect/runtime-flags"
import { Import } from "@/import/import"
import { disposeAllInstances } from "../fixture/fixture"
import { resetDatabase } from "../fixture/db"
import { testEffect } from "../lib/effect"
import { HOME, PROJECT, ensureProject } from "./fixture"

beforeEach(async () => {
  await resetDatabase()
  ensureProject()
})

afterEach(async () => {
  await disposeAllInstances()
})

const layer = Layer.mergeAll(
  Agent.defaultLayer,
  Bus.defaultLayer,
  CrossSpawnSpawner.defaultLayer,
  Session.defaultLayer,
  Truncate.defaultLayer,
  RuntimeFlags.layer({}),
)

const it = testEffect(layer)

const ctx = (sessionID: Session.Info["id"]) => ({
  sessionID,
  messageID: MessageID.ascending(),
  agent: "build",
  abort: new AbortController().signal,
  messages: [],
  metadata: () => Effect.void,
  ask: () => Effect.void,
})

describe("tool.external_session", () => {
  it.instance("lists imported sessions by origin next to native ones", () =>
    Effect.gen(function* () {
      yield* Effect.promise(() => Import.run({ from: ["claude", "codex"], projectID: PROJECT, home: HOME }))
      const sessions = yield* Session.Service
      const native = yield* sessions.create({ title: "native work" })
      const def = yield* (yield* ExternalSessionTool).init()

      const all = yield* def.execute({ action: "list" }, ctx(native.id))
      expect(all.metadata.count).toBe(3)
      expect(all.output).toContain("native work")
      expect(all.output).toContain("claude    ")
      expect(all.output).toContain("codex     ")

      const claude = yield* def.execute({ action: "list", origin: "claude" }, ctx(native.id))
      expect(claude.metadata.count).toBe(1)
      expect(claude.output).toContain("List the files in the repo")
      expect(claude.output).not.toContain("native work")

      const search = yield* def.execute({ action: "list", search: "failing test" }, ctx(native.id))
      expect(search.metadata.count).toBe(1)
      expect(search.output).toContain("codex")

      const empty = yield* def.execute({ action: "list", origin: "codex", search: "zzz" }, ctx(native.id))
      expect(empty.output).toContain("teamcode import --from codex")
    }),
  )

  it.instance("reads an imported transcript with tool calls", () =>
    Effect.gen(function* () {
      const report = yield* Effect.promise(() => Import.run({ from: ["claude"], projectID: PROJECT, home: HOME }))
      const sessions = yield* Session.Service
      const native = yield* sessions.create({})
      const def = yield* (yield* ExternalSessionTool).init()

      const result = yield* def.execute({ action: "read", session_id: report.sessions[0]!.sessionID }, ctx(native.id))
      expect(result.metadata.origin).toBe("claude")
      expect(result.metadata.messages).toBe(3)
      expect(result.output).toContain("origin: claude")
      expect(result.output).toContain("## user")
      expect(result.output).toContain("## assistant (claude-fable-5-1)")
      expect(result.output).toContain("[reasoning] I should look at the directory first.")
      expect(result.output).toContain('[tool Bash] {"command":"ls"')
      expect(result.output).toContain("→ README.md")
      expect(result.output).toContain("✗ <tool_use_error>File does not exist.")
      expect(result.output).toContain("It is a small Node project")
    }),
  )

  it.instance("fails clearly for unknown or missing session ids", () =>
    Effect.gen(function* () {
      const sessions = yield* Session.Service
      const native = yield* sessions.create({})
      const def = yield* (yield* ExternalSessionTool).init()

      // Tool errors surface as defects (`Effect.orDie`), like every other builtin tool.
      const missing = yield* def.execute({ action: "read", session_id: "ses_nope" }, ctx(native.id)).pipe(Effect.exit)
      expect(Exit.isFailure(missing) && Cause.pretty(missing.cause)).toContain("Session not found: ses_nope")

      const none = yield* def.execute({ action: "read" }, ctx(native.id)).pipe(Effect.exit)
      expect(Exit.isFailure(none) && Cause.pretty(none.cause)).toContain("session_id is required")
    }),
  )
})
