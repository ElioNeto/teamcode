/**
 * Parity tests for the feature flag system.
 * Verifies that RouterFlag behaves correctly in the TS side
 * before routing decisions are made.
 */
import { describe, expect, test } from "bun:test"
import { flag, listFlags } from "@teamcode-ai/core/router"

// Save original env
const OLD_ENV = { ...process.env }

describe("RouterFlag", () => {
  test("flag returns a Flag object with correct key and default", () => {
    const f = flag<boolean>("test-flag", true)
    expect(f.key).toBe("test-flag")
    expect(f.defaultValue).toBe(true)
  })

  test("boolean flag isEnabled returns default value", () => {
    const t = flag<boolean>("bool-true", true)
    expect(t.isEnabled()).toBe(true)

    const f = flag<boolean>("bool-false", false)
    expect(f.isEnabled()).toBe(false)
  })

  test("numeric flag uses canary percentage", () => {
    // 0% = always off
    const off = flag<number>("canary-off", 0)
    expect(off.isEnabled()).toBe(false)

    // 100% = always on
    const on = flag<number>("canary-on", 100)
    expect(on.isEnabled()).toBe(true)

    // 50% with session ID for consistent routing
    const half = flag<number>("canary-half", 50)
    const result1 = half.isEnabled({ sessionID: "session-1" })
    const result2 = half.isEnabled({ sessionID: "session-1" })
    // Same session should always return the same result
    expect(result1).toBe(result2)
  })

  test("flag is memoized (same key returns same object)", () => {
    const f1 = flag<boolean>("memo-test", true)
    const f2 = flag<boolean>("memo-test", false) // different default, but same key
    expect(f1).toBe(f2)
    expect(f1.defaultValue).toBe(true) // original default preserved
  })

  test("listFlags returns all registered flags", () => {
    // Register some test flags
    flag<boolean>("list-flag-a", true)
    flag<boolean>("list-flag-b", false)
    const all = listFlags()
    const keys = all.map((f) => f.key)
    expect(keys).toContain("list-flag-a")
    expect(keys).toContain("list-flag-b")
  })

  describe("environment variable override", () => {
    test("FLAG_ prefixed env vars override boolean defaults", () => {
      const key = "env-override-bool"
      process.env[`FLAG_${key.replace(/-/g, "_")}`] = "true"
      const f = flag<boolean>(key, false)
      expect(f.isEnabled()).toBe(true)
      delete process.env[`FLAG_${key.replace(/-/g, "_")}`]
    })

    test("FLAG_ prefixed env vars override numeric defaults", () => {
      const key = "env-override-num"
      process.env[`FLAG_${key.replace(/-/g, "_")}`] = "75"
      const f = flag<number>(key, 0)
      expect(f.defaultValue).toBe(75)
      delete process.env[`FLAG_${key.replace(/-/g, "_")}`]
    })
  })
})
