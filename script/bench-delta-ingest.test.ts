import { describe, expect, test } from "bun:test"
import { percentile, summarize } from "./bench-delta-ingest"

describe("percentile", () => {
  test("interpolates between neighbours", () => {
    expect(percentile([1, 2, 3, 4], 50)).toBe(2.5)
  })

  test("returns an exact element when the rank lands on one", () => {
    expect(percentile([10, 20, 30], 50)).toBe(20)
  })

  test("handles the upper tail without overrunning the array", () => {
    const sample = Array.from({ length: 100 }, (_, i) => i + 1)
    expect(percentile(sample, 99)).toBeCloseTo(99.01, 5)
  })

  test("p100 is the maximum", () => {
    expect(percentile([5, 9, 42], 100)).toBe(42)
  })

  test("throws on an empty sample rather than returning NaN", () => {
    expect(() => percentile([], 50)).toThrow("empty sample")
  })
})

describe("summarize", () => {
  test("does not mutate the caller's array", () => {
    const input = [3, 1, 2]
    summarize(input)
    expect(input).toEqual([3, 1, 2])
  })

  test("reports count, bounds and mean", () => {
    const s = summarize([4, 1, 3, 2])
    expect(s.count).toBe(4)
    expect(s.min).toBe(1)
    expect(s.max).toBe(4)
    expect(s.mean).toBe(2.5)
  })
})
