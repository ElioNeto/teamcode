import { beforeEach, describe, expect, test } from "bun:test"
import { eq } from "drizzle-orm"
import { Database } from "@/storage/db"
import { SessionTable } from "@/session/session.sql"
import { Import } from "@/import/import"
import { ImportCli } from "@/import/cli"
import { Session } from "@/session/session"
import { Origin } from "@/import/origin"
import { resetDatabase } from "../fixture/db"
import { CLAUDE_SESSION, CODEX_SESSION, HOME, PROJECT, ensureProject } from "./fixture"

beforeEach(async () => {
  await resetDatabase()
  ensureProject()
})

describe("import.run", () => {
  test("dry run reports without writing", async () => {
    const report = await Import.run({ from: ["claude"], projectID: PROJECT, home: HOME, dryRun: true })
    expect(report.scanned).toBe(2)
    expect(report.sessions.map((s) => s.key)).toEqual([CLAUDE_SESSION, "agent-a1b2c3"])
    expect(report.sessions[0]!.messages).toBe(3)
    expect(Database.use((db) => db.select().from(SessionTable).all())).toHaveLength(0)
  })

  test("imports Claude Code sessions with subagents as children", async () => {
    const report = await Import.run({ from: ["claude"], projectID: PROJECT, home: HOME })
    expect(report.errors).toEqual([])
    const [parent, child] = report.sessions
    expect(parent!.created).toBe(true)
    const rows = Database.use((db) => db.select().from(SessionTable).all())
    expect(rows).toHaveLength(2)
    const childRow = rows.find((r) => r.id === child!.sessionID)!
    expect(childRow.parent_id).toBe(parent!.sessionID)
    expect(childRow.title).toBe("Explore the repo layout.")
    // The cwd /home/dev/acme has no project row, so one is created for it.
    expect(rows[0]!.project_id).toStartWith("ext-")
    expect(rows[0]!.project_id).toBe(rows[1]!.project_id)
  })

  test("imports Codex rollouts and filters by session prefix", async () => {
    const none = await Import.run({ from: ["codex"], projectID: PROJECT, home: HOME, session: "nope" })
    expect(none.sessions).toEqual([])
    const report = await Import.run({ from: ["codex"], projectID: PROJECT, home: HOME, session: "rollout-2026-09-22" })
    expect(report.sessions).toHaveLength(1)
    expect(report.sessions[0]!.origin).toBe("codex")
    const row = Database.use((db) =>
      db.select().from(SessionTable).where(eq(SessionTable.id, report.sessions[0]!.sessionID)).get(),
    )!
    expect(row.version).toBe("codex@0.42.0")
    expect(row.slug).toBe(`codex-${CODEX_SESSION.slice(0, 8)}`)
  })

  test("second run is idempotent and sessions list with their origin", async () => {
    await Import.run({ from: ["claude", "codex"], projectID: PROJECT, home: HOME })
    const again = await Import.run({ from: ["claude", "codex"], projectID: PROJECT, home: HOME })
    expect(again.sessions.every((s) => s.messages === 0 && !s.created)).toBe(true)
    const listed = Session.listGlobal({ roots: true })
    expect(listed.map((s) => Origin.of(s)).toSorted()).toEqual(["claude", "codex"])
  })

  test("cli format summarizes the report", async () => {
    const report = await Import.run({ from: ["claude"], projectID: PROJECT, home: HOME, dryRun: true })
    const text = ImportCli.format({ from: "claude-code", dryRun: true }, report)
    expect(text).toContain("would import 2 of 2 claude-code sessions")
    expect(text).toContain("3 new messages")
    expect(text).toContain("warning abc12345-0000-4000-8000-000000000001: line 10: invalid JSON")
  })
})
