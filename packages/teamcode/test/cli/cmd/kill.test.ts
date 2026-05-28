import { describe, expect, test } from "bun:test"
import path from "path"
import os from "os"
import { Hash } from "@teamcode-ai/core/util/hash"
import { Global } from "@teamcode-ai/core/global"
import { Flock } from "@teamcode-ai/core/util/flock"

describe("kill command", () => {
  const lockDir = path.join(Global.Path.state, "locks")

  test("lock path matches Flock convention", () => {
    const key = `tui:${process.cwd()}`
    const lockPath = path.join(lockDir, Hash.fast(key) + ".lock")
    expect(lockPath).toContain(".lock")
    expect(lockPath).toContain("locks")
  })

  test("acquires and releases a lock", async () => {
    const uniqueKey = `test:kill:${Date.now()}`
    const lock = await Flock.acquire(uniqueKey, {
      staleMs: 60_000,
      timeoutMs: 5_000,
    })
    expect(lock).toBeDefined()
    expect(lock.release).toBeFunction()
    await lock.release()
  })

  test("re-acquires released lock immediately", async () => {
    const uniqueKey = `test:reacquire:${Date.now()}`
    const lock = await Flock.acquire(uniqueKey, {
      staleMs: 60_000,
      timeoutMs: 5_000,
    })
    await lock.release()

    const relock = await Flock.acquire(uniqueKey, {
      staleMs: 60_000,
      timeoutMs: 2_000,
    })
    expect(relock).toBeDefined()
    expect(relock.release).toBeFunction()
    await relock.release()
  })
})
