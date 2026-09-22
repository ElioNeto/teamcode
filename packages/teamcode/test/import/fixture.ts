import path from "path"
import { Database } from "@/storage/db"
import { ProjectTable } from "@/project/project.sql"
import { ProjectID } from "@/project/schema"

export const HOME = path.join(import.meta.dir, "fixture", "home")
export const CLAUDE_SESSION = "abc12345-0000-4000-8000-000000000001"
export const CLAUDE_FILE = path.join(HOME, ".claude", "projects", "-home-dev-acme", `${CLAUDE_SESSION}.jsonl`)
export const CLAUDE_APPENDED = path.join(import.meta.dir, "fixture", "appended", `${CLAUDE_SESSION}.jsonl`)
export const CLAUDE_SUBAGENT = path.join(
  HOME,
  ".claude",
  "projects",
  "-home-dev-acme",
  CLAUDE_SESSION,
  "subagents",
  "agent-a1b2c3.jsonl",
)
export const CODEX_SESSION = "019a0b1c-2d3e-4f50-8a9b-c0d1e2f3a4b5"
export const CODEX_FILE = path.join(
  HOME,
  ".codex",
  "sessions",
  "2026",
  "09",
  "22",
  `rollout-2026-09-22T14-00-00-${CODEX_SESSION}.jsonl`,
)

export const PROJECT = ProjectID.make("import-test-project")

/** Inserts the fallback project row that imported sessions reference through the FK. */
export function ensureProject(id = PROJECT, worktree = "/tmp/import-test-project") {
  Database.use((db) =>
    db
      .insert(ProjectTable)
      .values({ id, worktree, sandboxes: [], time_created: 1, time_updated: 1 })
      .onConflictDoNothing()
      .run(),
  )
  return id
}
