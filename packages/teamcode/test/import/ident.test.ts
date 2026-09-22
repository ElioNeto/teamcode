import { describe, expect, test } from "bun:test"
import { ImportIdent } from "@/import/ident"
import { Identifier } from "@/id/id"

describe("import.ident", () => {
  test("is deterministic and prefixed", () => {
    const a = ImportIdent.deterministic("message", { timestamp: 1758546000000, seed: "claude-code:u1" })
    const b = ImportIdent.deterministic("message", { timestamp: 1758546000000, seed: "claude-code:u1" })
    expect(a).toBe(b)
    expect(a).toMatch(/^msg_[0-9a-f]{12}[0-9A-Za-z]{14}$/)
    expect(ImportIdent.deterministic("part", { timestamp: 1, seed: "x" })).toStartWith("prt_")
    expect(ImportIdent.deterministic("session", { timestamp: 1, seed: "x" })).toStartWith("ses_")
  })

  test("different seeds at the same millisecond do not collide", () => {
    const a = ImportIdent.deterministic("message", { timestamp: 5, seed: "a" })
    const b = ImportIdent.deterministic("message", { timestamp: 5, seed: "b" })
    expect(a).not.toBe(b)
  })

  test("ascending ids sort chronologically and keep the TS timestamp encoding", () => {
    const early = ImportIdent.deterministic("message", { timestamp: 1758546000000, seed: "zzz" })
    const late = ImportIdent.deterministic("message", { timestamp: 1758546000001, seed: "aaa" })
    expect(early < late).toBe(true)
    // Same 48-bit time encoding as `id.ts`, so the TS decoder reads both the same way.
    expect(Identifier.timestamp(early)).toBe(Identifier.timestamp(Identifier.create("msg", "ascending", 1758546000000)))
    const counter0 = ImportIdent.deterministic("part", { timestamp: 7, seed: "s", counter: 0 })
    const counter9 = ImportIdent.deterministic("part", { timestamp: 7, seed: "s", counter: 9 })
    expect(counter0 < counter9).toBe(true)
  })

  test("session ids sort newest-first like Identifier.descending", () => {
    const early = ImportIdent.deterministic("session", { timestamp: 1758546000000, seed: "a" })
    const late = ImportIdent.deterministic("session", { timestamp: 1758546000001, seed: "a" })
    expect(late < early).toBe(true)
  })
})
