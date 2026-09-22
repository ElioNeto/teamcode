import { beforeEach, describe, expect, test } from "bun:test"
import { eq } from "drizzle-orm"
import { Database } from "@/storage/db"
import { MessageTable, PartTable, SessionTable } from "@/session/session.sql"
import { ProjectTable } from "@/project/project.sql"
import { ProjectID } from "@/project/schema"
import type { SessionID } from "@/session/schema"
import { Import } from "@/import/import"
import { ImportStorage } from "@/import/storage"
import { resetDatabase } from "../fixture/db"
import { CLAUDE_APPENDED, CLAUDE_FILE, PROJECT, ensureProject } from "./fixture"

const normalize = async (file: string) =>
  Import.normalize({ origin: "claude" }, await Bun.file(file).text(), { key: "k", projectID: PROJECT })

const counts = (sessionID: SessionID) =>
  Database.use((db) => ({
    session: db.select().from(SessionTable).where(eq(SessionTable.id, sessionID)).all(),
    messages: db.select().from(MessageTable).where(eq(MessageTable.session_id, sessionID)).all(),
    parts: db.select().from(PartTable).where(eq(PartTable.session_id, sessionID)).all(),
  }))

beforeEach(async () => {
  await resetDatabase()
  ensureProject()
})

describe("import.storage", () => {
  test("first import writes session, messages and parts", async () => {
    const out = await normalize(CLAUDE_FILE)
    const result = ImportStorage.upsert(out)
    expect(result).toEqual({ sessionID: out.session.id, created: true, messages: 3, parts: 9, skipped: 0 })
    const rows = counts(out.session.id)
    expect(rows.session).toHaveLength(1)
    expect(rows.session[0]!.version).toBe("claude-code@2.1.278")
    expect(rows.session[0]!.tokens_cache_read).toBe(11000)
    expect(rows.messages).toHaveLength(3)
    expect(rows.parts).toHaveLength(9)
    expect(rows.messages.every((m) => !("id" in m.data) && !("sessionID" in m.data))).toBe(true)
    expect(rows.parts.every((p) => !("messageID" in p.data))).toBe(true)
  })

  test("re-importing the same file is a no-op", async () => {
    const out = await normalize(CLAUDE_FILE)
    ImportStorage.upsert(out)
    const before = counts(out.session.id)
    const again = ImportStorage.upsert(await normalize(CLAUDE_FILE))
    expect(again.created).toBe(false)
    expect(again.messages).toBe(0)
    expect(again.skipped).toBe(3)
    const after = counts(out.session.id)
    expect(after.messages).toHaveLength(before.messages.length)
    expect(after.parts).toHaveLength(before.parts.length)
    expect(after.session[0]!.time_updated).toBe(before.session[0]!.time_updated)
  })

  test("incremental import only adds the new turn and advances the session", async () => {
    const first = ImportStorage.upsert(await normalize(CLAUDE_FILE))
    const second = ImportStorage.upsert(await normalize(CLAUDE_APPENDED))
    expect(second.sessionID).toBe(first.sessionID)
    expect(second.created).toBe(false)
    expect(second.messages).toBe(2)
    expect(second.skipped).toBe(3)
    const rows = counts(first.sessionID)
    expect(rows.messages).toHaveLength(5)
    expect(rows.session[0]!.time_updated).toBe(Date.parse("2026-09-22T13:25:02.000Z"))
    expect(rows.session[0]!.tokens_input).toBe(8)
  })

  test("refreshes the newest existing message so late tool results land", async () => {
    const out = await normalize(CLAUDE_FILE)
    // Simulate a previous import that caught the last assistant turn mid-flight.
    const last = out.messages.at(-1)!
    const truncated = {
      ...out,
      messages: [...out.messages.slice(0, -1), { info: last.info, parts: last.parts.slice(0, 1) }],
    }
    ImportStorage.upsert(truncated)
    expect(counts(out.session.id).parts).toHaveLength(7)
    const result = ImportStorage.upsert(out)
    expect(result.messages).toBe(0)
    expect(counts(out.session.id).parts).toHaveLength(9)
  })

  test("resolveProject matches an existing worktree or creates a project row", () => {
    ensureProject(ProjectID.make("acme"), "/home/dev/acme")
    expect(ImportStorage.resolveProject("/home/dev/acme", PROJECT)).toBe(ProjectID.make("acme"))
    expect(ImportStorage.resolveProject("/home/dev/acme/packages/x", PROJECT)).toBe(ProjectID.make("acme"))
    expect(ImportStorage.resolveProject("", PROJECT)).toBe(PROJECT)
    const created = ImportStorage.resolveProject("/somewhere/else", PROJECT)
    expect(created).toStartWith("ext-")
    expect(ImportStorage.resolveProject("/somewhere/else", PROJECT)).toBe(created)
    const row = Database.use((db) => db.select().from(ProjectTable).where(eq(ProjectTable.id, created)).get())
    expect(row?.worktree).toBe("/somewhere/else")
    expect(row?.name).toBe("else")
  })

  test("rejects payloads that do not fit the schemas", async () => {
    const out = await normalize(CLAUDE_FILE)
    const broken = { ...out, session: { ...out.session, title: 42 as unknown as string } }
    expect(() => ImportStorage.upsert(broken)).toThrow()
  })
})
