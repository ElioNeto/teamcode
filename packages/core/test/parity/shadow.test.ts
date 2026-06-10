import { describe, expect, test, afterAll, beforeAll } from "bun:test"
import { deepEqual, isShadow, setShadow, clearShadow, getFlag, setFlag, clearFlag, routeFilesystemOp } from "../../src/router"
import { GoCoreClient } from "../../src/router/client"

const goCoreAvailable = !!process.env["GO_CORE_BINARY"]

// Start Go core server
const serverProcess = goCoreAvailable
  ? Bun.spawn([process.env["GO_CORE_BINARY"] as string], {
      env: { ...process.env, GO_CORE_PORT: "43001" },
    })
  : null

beforeAll(async () => {
  if (serverProcess) {
    // Wait for the server to be ready
    for (let i = 0; i < 20; i++) {
      try {
        const res = await fetch("http://127.0.0.1:43001/health")
        if (res.ok) break
      } catch {
        // server not ready yet
      }
      await new Promise((r) => setTimeout(r, 200))
    }
  }
})

afterAll(() => {
  serverProcess?.kill()
})

describe("shadow mode", () => {

  test("isShadow returns false by default", () => {
    setShadow("test-module", false)
    expect(isShadow("test-module")).toBe(false)
  })

  test("isShadow returns true when set", () => {
    setShadow("test-module", true)
    expect(isShadow("test-module")).toBe(true)
    clearShadow("test-module")
  })

  test("setFlag/getFlag roundtrip", () => {
    const key = "shadow-test-roundtrip"

    setFlag(key, "disabled")
    expect(getFlag(key)).toBe("disabled")

    setFlag(key, 50)
    expect(getFlag(key)).toBe(50)

    setFlag(key, true)
    expect(getFlag(key)).toBe(true)

    // Clear override
    clearFlag(key)
    // After clearing the override and with no registered flag, should be undefined
    expect(getFlag(key)).toBeUndefined()
  })

  test("deepEqual detects equality", () => {
    expect(deepEqual(1, 1)).toBe(true)
    expect(deepEqual("a", "a")).toBe(true)
    expect(deepEqual(null, null)).toBe(true)
    expect(deepEqual({ a: 1 }, { a: 1 })).toBe(true)
    expect(deepEqual({ a: { b: 2 } }, { a: { b: 2 } })).toBe(true)
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true)
  })

  test("deepEqual detects inequality", () => {
    expect(deepEqual(1, 2)).toBe(false)
    expect(deepEqual("a", "b")).toBe(false)
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false)
    expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false)
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false)
    expect(deepEqual(null, undefined)).toBe(false)
  })

  test("routeFilesystemOp returns legacy result when not in shadow", async () => {
    setShadow("filesystem", false)
    const result = await routeFilesystemOp(
      "test",
      [],
      async () => "legacy-result",
      async () => "go-result",
    )
    expect(result).toBe("legacy-result")
  })

  test("routeFilesystemOp returns legacy result in shadow mode (discards go)", async () => {
    setShadow("filesystem", true)
    try {
      const result = await routeFilesystemOp(
        "test",
        [],
        async () => "legacy-result",
        async () => "go-result",
      )
      expect(result).toBe("legacy-result")
    } finally {
      setShadow("filesystem", false)
    }
  })

  test("routeFilesystemOp handles go error in shadow mode gracefully", async () => {
    setShadow("filesystem", true)
    try {
      const result = await routeFilesystemOp(
        "test",
        [],
        async () => "legacy-result",
        async () => { throw new Error("go crashed") },
      )
      expect(result).toBe("legacy-result")
    } finally {
      setShadow("filesystem", false)
    }
  })

  test("routeFilesystemOp propagates TS error even in shadow mode", async () => {
    setShadow("filesystem", true)
    try {
      await expect(
        routeFilesystemOp(
          "test",
          [],
          async () => { throw new Error("ts crashed") },
          async () => "go-result",
        ),
      ).rejects.toThrow("ts crashed")
    } finally {
      setShadow("filesystem", false)
    }
  })

})

describe("X-Trace-ID", () => {
  test("health endpoint receives X-Trace-ID", async () => {
    if (!goCoreAvailable) return
    const traceId = crypto.randomUUID()
    const res = await fetch("http://127.0.0.1:43001/health", {
      headers: { "X-Trace-ID": traceId },
    })
    expect(res.ok).toBe(true)
    const body = await res.json() as { status: string }
    expect(body.status).toBe("ok")
  })

  test("X-Trace-ID is included in GoCoreClient requests", async () => {
    if (!goCoreAvailable) return
    const result = await GoCoreClient.health()
    expect(result.status).toBe("ok")
  })
})
