import { describe, expect, test } from "bun:test"
import path from "path"
import { Scanner } from "@/import/scanner"
import { CLAUDE_FILE, CLAUDE_SESSION, CLAUDE_SUBAGENT, CODEX_FILE, HOME } from "./fixture"

describe("import.scanner", () => {
  test("finds Claude Code and Codex transcripts under a home directory", () => {
    const sources = Scanner.discover({ home: HOME })
    expect(sources.map((s) => s.path).toSorted()).toEqual([CLAUDE_FILE, CLAUDE_SUBAGENT, CODEX_FILE].toSorted())
    const claude = sources.find((s) => s.path === CLAUDE_FILE)!
    expect(claude.origin).toBe("claude")
    expect(claude.key).toBe(CLAUDE_SESSION)
    expect(claude.parentKey).toBeUndefined()
    const sub = sources.find((s) => s.path === CLAUDE_SUBAGENT)!
    expect(sub.parentKey).toBe(CLAUDE_SESSION)
    expect(sub.key).toBe("agent-a1b2c3")
    expect(sources.indexOf(claude)).toBeLessThan(sources.indexOf(sub))
    const codex = sources.find((s) => s.path === CODEX_FILE)!
    expect(codex.origin).toBe("codex")
  })

  test("filters by origin and tolerates missing directories", () => {
    expect(Scanner.discover({ home: HOME, origins: ["codex"] }).map((s) => s.origin)).toEqual(["codex"])
    expect(Scanner.discover({ home: path.join(HOME, "does-not-exist") })).toEqual([])
  })
})
