import { describe, expect, test } from "bun:test"
import { Origin } from "@/import/origin"

describe("import.origin", () => {
  test("derives the origin from the version column", () => {
    expect(Origin.of({ version: "claude-code@2.1.278" })).toBe("claude")
    expect(Origin.of({ version: "codex@0.42.0" })).toBe("codex")
    expect(Origin.of({ version: "1.2.0" })).toBe("teamcode")
    expect(Origin.of({ version: "" })).toBe("teamcode")
  })

  test("round-trips through version()", () => {
    expect(Origin.of({ version: Origin.version("claude", "2.1.278") })).toBe("claude")
    expect(Origin.version("codex", undefined)).toBe("codex@unknown")
    expect(Origin.version("codex", "  ")).toBe("codex@unknown")
  })
})
