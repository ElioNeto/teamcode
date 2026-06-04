import { describe, it, expect, beforeAll, afterAll } from "bun:test"
import { existsSync, mkdtempSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { tmpdir } from "node:os"
import { startSidecar, type SidecarHandle } from "./sidecar"

// Skip integration tests when the ApexStore Rust binary is not available.
// The `beforeAll` hook would fail fast with a descriptive error, but this
// keeps test output clean in environments that don't build the Rust sidecar.
const sidecarDir = dirname(fileURLToPath(import.meta.url))
const candidatePaths = [
  join(sidecarDir, "..", "..", "..", "bin", "apexstore-server"),
  join(sidecarDir, "..", "..", "..", "..", "bin", "apexstore-server"),
  join(sidecarDir, "..", "..", "..", "..", "..", "bin", "apexstore-server"),
  "/tmp/ApexStore/target/release/apexstore-server",
]
const apeStoreAvailable = candidatePaths.some(existsSync)

const describeFn = apeStoreAvailable ? describe : describe.skip

describeFn("ApexStore integration", () => {
  let tmpDir: string
  let handle: SidecarHandle

  beforeAll(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), "apexstore-test-"))
    const logs: string[] = []
    handle = await startSidecar({
      dataDir: tmpDir,
      port: 0, // let the system pick
      memtableMaxSize: 1024 * 1024, // 1MB for testing
      blockCacheSizeMb: 4,
      onStderr: (line) => {
        logs.push(line)
        console.error("[apexstore]", line)
      },
      onStdout: (line) => {
        logs.push(line)
        console.log("[apexstore]", line)
      },
    }).catch((e) => {
      console.error("Sidecar start failed. Logs:", logs.join("\n"))
      throw e
    })
  }, 60_000) // allow up to 60s for sidecar startup

  afterAll(async () => {
    if (!handle) return
    await handle.stop()
    rmSync(tmpDir, { recursive: true, force: true })
  }, 60_000) // allow up to 60s for sidecar shutdown

  it("should report healthy", async () => {
    const healthy = await handle.client.health()
    expect(healthy).toBe(true)
  })

  it("should set and get a value", async () => {
    await handle.client.set("hello", "world")
    const value = await handle.client.get("hello")
    expect(value).toBe("world")
  })

  it("should return null for missing keys", async () => {
    const value = await handle.client.get("nonexistent")
    expect(value).toBeNull()
  })

  it("should list keys with prefix", async () => {
    await handle.client.set("test:foo", "1")
    await handle.client.set("test:bar", "2")
    await handle.client.set("other:baz", "3")

    const testKeys = await handle.client.list("test:")
    expect(testKeys).toContain("test:foo")
    expect(testKeys).toContain("test:bar")
    expect(testKeys).not.toContain("other:baz")
  })

  it("should delete a key", async () => {
    await handle.client.set("todelete", "value")
    expect(await handle.client.get("todelete")).toBe("value")

    await handle.client.delete("todelete")
    expect(await handle.client.get("todelete")).toBeNull()
  })

  it("should return stats", async () => {
    const stats = await handle.client.stats()
    expect(stats).toHaveProperty("total_records")
    expect(stats).toHaveProperty("sst_files")
    expect(stats).toHaveProperty("mem_records")
  })

  it("should handle concurrent operations", async () => {
    const ops = Array.from({ length: 50 }, (_, i) =>
      handle.client.set(`concurrent:key${i}`, `value${i}`),
    )
    await Promise.all(ops)

    const values = await Promise.all(
      Array.from({ length: 50 }, (_, i) => handle.client.get(`concurrent:key${i}`)),
    )
    for (let i = 0; i < 50; i++) {
      expect(values[i]).toBe(`value${i}`)
    }
  })
})
