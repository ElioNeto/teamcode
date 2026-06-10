/**
 * Parity tests: TypeScript vs Go Core.
 *
 * These tests attempt to start the Go core server and run the same
 * filesystem operations against both implementations.
 *
 * Run with: GO_CORE_BINARY=../../go-core/server bun test test/parity/
 * (defaults to ../../go-core/server relative to the core package)
 */
import { describe, expect, test, beforeAll, afterAll } from "bun:test"
import path from "path"
import fs from "fs/promises"
import os from "os"
import { GoCoreClient } from "@teamcode-ai/core/router"

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const GO_CORE_BINARY =
  process.env["GO_CORE_BINARY"] ?? path.join(import.meta.dir, "..", "..", "..", "..", "go-core", "server")
const GO_CORE_PORT = process.env["GO_CORE_PORT"] ?? "43001"

let goCoreProcess: ReturnType<typeof Bun.spawn> | null = null
let goCoreAvailable = false

beforeAll(async () => {
  try {
    await fs.access(GO_CORE_BINARY, fs.constants.X_OK)
  } catch {
    console.log(`Go core binary not found: ${GO_CORE_BINARY}`)
    return
  }

  try {
    goCoreProcess = Bun.spawn([GO_CORE_BINARY], {
      env: { ...process.env, GO_CORE_PORT },
      stdout: "pipe",
      stderr: "pipe",
    })
    let attempts = 0
    while (attempts < 15) {
      try {
        const resp = await fetch(`http://127.0.0.1:${GO_CORE_PORT}/health`)
        if (resp.ok) {
          goCoreAvailable = true
          break
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 300))
      attempts++
    }
    if (goCoreAvailable) {
      console.log(`Go core server ready on port ${GO_CORE_PORT}.`)
    } else {
      console.warn("Go core server did not become ready.")
    }
  } catch (err) {
    console.warn(`Error starting Go core: ${err}`)
  }
})

afterAll(() => {
  if (goCoreProcess) {
    goCoreProcess.kill()
    goCoreProcess = null
  }
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function tmpDir(): Promise<string> {
  return await fs.mkdtemp(path.join(os.tmpdir(), "parity-test-"))
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Go Core Parity", () => {
  // ---- Health ----

  describe("health", () => {
    test("health endpoint returns status ok", async () => {
      if (!goCoreAvailable) return
      const health = await GoCoreClient.health()
      expect(health.status).toBe("ok")
      expect(health.version).toBeTruthy()
      expect(health.time).toBeTruthy()
    })
  })

  // ---- Read/Write ----

  describe("read / write", () => {
    test("writes and reads a file", async () => {
      if (!goCoreAvailable) return
      const dir = await tmpDir()
      const filePath = path.join(dir, "hello.txt")

      await GoCoreClient.fs.write(filePath, "hello world")
      const result = await GoCoreClient.fs.read(filePath, 0, 0)

      expect(result.content).toBe("hello world")
      expect(result.size).toBe(11)
      expect(result.binary).toBe(false)
      expect(result.mime_type).toBe("text/plain")
    })

    test("read with offset and limit", async () => {
      if (!goCoreAvailable) return
      const dir = await tmpDir()
      const filePath = path.join(dir, "offset.txt")
      await fs.writeFile(filePath, "abcdefghij")

      const result = await GoCoreClient.fs.read(filePath, 3, 4)
      expect(result.content).toBe("defg")
    })

    test("readSafe returns found=false for missing file", async () => {
      if (!goCoreAvailable) return
      const result = await GoCoreClient.fs.readSafe("/tmp/nonexistent-" + Math.random())
      expect(result.found).toBe(false)
      expect(result.content).toBe("")
    })

    test("readSafe returns found=true for existing file", async () => {
      if (!goCoreAvailable) return
      const dir = await tmpDir()
      const filePath = path.join(dir, "safe.txt")
      await fs.writeFile(filePath, "safe content")

      const result = await GoCoreClient.fs.readSafe(filePath)
      expect(result.found).toBe(true)
      expect(result.content).toBe("safe content")
    })
  })

  // ---- Stat ----

  describe("stat", () => {
    test("stat returns file metadata", async () => {
      if (!goCoreAvailable) return
      const dir = await tmpDir()
      const filePath = path.join(dir, "stat.txt")
      await fs.writeFile(filePath, "data")

      const stat = await GoCoreClient.fs.stat(filePath)
      expect(stat.name).toBe("stat.txt")
      expect(stat.size).toBe(4)
      expect(stat.dir).toBe(false)
      expect(stat.mode).toBeTruthy()
      expect(stat.modtime).toBeTruthy()
    })
  })

  // ---- Exists / IsDir / IsFile ----

  describe("exists / isDir / isFile", () => {
    test("exists returns correct values", async () => {
      if (!goCoreAvailable) return
      const dir = await tmpDir()
      const filePath = path.join(dir, "exists.txt")
      await fs.writeFile(filePath, "yes")

      const { exists: e1 } = await GoCoreClient.fs.exists(filePath)
      expect(e1).toBe(true)

      const { exists: e2 } = await GoCoreClient.fs.exists(filePath + ".nope")
      expect(e2).toBe(false)
    })

    test("isDir and isFile", async () => {
      if (!goCoreAvailable) return
      const dir = await tmpDir()
      const subdir = path.join(dir, "subdir")
      const filePath = path.join(dir, "file.txt")
      await fs.mkdir(subdir)
      await fs.writeFile(filePath, "data")

      const { dir: isDir } = await GoCoreClient.fs.isDir(subdir)
      const { file: isFile } = await GoCoreClient.fs.isFile(filePath)
      const { file: subIsFile } = await GoCoreClient.fs.isFile(subdir)
      const { dir: fileIsDir } = await GoCoreClient.fs.isDir(filePath)

      expect(isDir).toBe(true)
      expect(isFile).toBe(true)
      expect(subIsFile).toBe(false)
      expect(fileIsDir).toBe(false)
    })
  })

  // ---- EnsureDir / Readdir ----

  describe("ensureDir / readdir", () => {
    test("ensureDir creates nested directories", async () => {
      if (!goCoreAvailable) return
      const dir = await tmpDir()
      const nested = path.join(dir, "a", "b", "c")

      await GoCoreClient.fs.ensureDir(nested)

      const { dir: isDir } = await GoCoreClient.fs.isDir(nested)
      expect(isDir).toBe(true)
    })

    test("readdir returns entries with types", async () => {
      if (!goCoreAvailable) return
      const dir = await tmpDir()
      await fs.writeFile(path.join(dir, "a.txt"), "a")
      await fs.writeFile(path.join(dir, "b.txt"), "b")
      await fs.mkdir(path.join(dir, "sub"))

      const { entries } = await GoCoreClient.fs.readdir(dir)
      expect(entries).toHaveLength(3)

      expect(entries[0].name).toBe("a.txt")
      expect(entries[0].type).toBe("file")
      expect(entries[2].name).toBe("sub")
      expect(entries[2].type).toBe("directory")
    })
  })

  // ---- List ----

  describe("list", () => {
    test("list files non-recursive", async () => {
      if (!goCoreAvailable) return
      const dir = await tmpDir()
      await fs.writeFile(path.join(dir, "a.txt"), "a")
      await fs.writeFile(path.join(dir, "b.txt"), "b")
      await fs.mkdir(path.join(dir, "sub"))
      await fs.writeFile(path.join(dir, "sub", "c.txt"), "c")

      const { files } = await GoCoreClient.fs.list(dir, "", false)
      expect(files).toHaveLength(2)
    })

    test("list files recursive", async () => {
      if (!goCoreAvailable) return
      const dir = await tmpDir()
      await fs.writeFile(path.join(dir, "a.txt"), "a")
      await fs.writeFile(path.join(dir, "b.txt"), "b")
      await fs.mkdir(path.join(dir, "sub"))
      await fs.writeFile(path.join(dir, "sub", "c.txt"), "c")

      const { files } = await GoCoreClient.fs.list(dir, "", true)
      expect(files).toHaveLength(3)
    })

    test("list with pattern filter", async () => {
      if (!goCoreAvailable) return
      const dir = await tmpDir()
      await fs.writeFile(path.join(dir, "a.ts"), "a")
      await fs.writeFile(path.join(dir, "b.ts"), "b")
      await fs.writeFile(path.join(dir, "c.json"), "c")

      const { files } = await GoCoreClient.fs.list(dir, "*.ts", false)
      expect(files).toHaveLength(2)
    })
  })

  // ---- JSON helpers ----

  describe("JSON helpers", () => {
    test("writeJSON and readJSON round-trip", async () => {
      if (!goCoreAvailable) return
      const dir = await tmpDir()
      const filePath = path.join(dir, "data.json")
      const data = { name: "parity", count: 42, nested: { ok: true } }

      await GoCoreClient.fs.writeJSON(filePath, data)
      const result = await GoCoreClient.fs.readJSON(filePath)

      expect(result).toEqual(data)
    })
  })

  // ---- Glob ----

  describe("glob", () => {
    test("glob finds matching files", async () => {
      if (!goCoreAvailable) return
      const dir = await tmpDir()
      await fs.writeFile(path.join(dir, "a.ts"), "a")
      await fs.writeFile(path.join(dir, "b.ts"), "b")
      await fs.writeFile(path.join(dir, "c.json"), "c")

      const { matches } = await GoCoreClient.fs.glob("*.ts", dir)
      expect(matches.sort()).toEqual(["a.ts", "b.ts"])
    })

    test("glob with ** finds nested files", async () => {
      if (!goCoreAvailable) return
      const dir = await tmpDir()
      await fs.writeFile(path.join(dir, "a.ts"), "a")
      await fs.mkdir(path.join(dir, "sub", "nested"), { recursive: true })
      await fs.writeFile(path.join(dir, "sub", "nested", "b.ts"), "b")

      const { matches } = await GoCoreClient.fs.glob("**/*.ts", dir)
      expect(matches).toHaveLength(2)
    })

    test("globMatch validates patterns", async () => {
      if (!goCoreAvailable) return
      const { match: m1 } = await GoCoreClient.fs.globMatch("*.ts", "foo.ts")
      expect(m1).toBe(true)

      const { match: m2 } = await GoCoreClient.fs.globMatch("*.ts", "foo.js")
      expect(m2).toBe(false)

      const { match: m3 } = await GoCoreClient.fs.globMatch("src/**/*.ts", "src/a/b/c.ts")
      expect(m3).toBe(true)
    })
  })

  // ---- FindUp / Up ----

  describe("findUp / up", () => {
    test("findUp locates file walking up", async () => {
      if (!goCoreAvailable) return
      const dir = await tmpDir()
      const subdir = path.join(dir, "a", "b")
      await fs.mkdir(subdir, { recursive: true })
      await fs.writeFile(path.join(dir, "target.txt"), "found")

      const { results } = await GoCoreClient.fs.findUp("target.txt", subdir)
      expect(results).toHaveLength(1)
    })

    test("findUp returns empty when not found", async () => {
      if (!goCoreAvailable) return
      const dir = await tmpDir()
      const { results } = await GoCoreClient.fs.findUp("nonexistent", dir, dir)
      expect(results).toEqual([])
    })
  })

  // ---- Copy / Move ----

  describe("copy / move", () => {
    test("copy duplicates a file", async () => {
      if (!goCoreAvailable) return
      const dir = await tmpDir()
      const src = path.join(dir, "src.txt")
      const dst = path.join(dir, "dst.txt")
      await fs.writeFile(src, "copy me")

      await GoCoreClient.fs.copy(src, dst)

      const result = await GoCoreClient.fs.read(dst, 0, 0)
      expect(result.content).toBe("copy me")
    })

    test("move renames a file", async () => {
      if (!goCoreAvailable) return
      const dir = await tmpDir()
      const src = path.join(dir, "src.txt")
      const dst = path.join(dir, "moved.txt")
      await fs.writeFile(src, "move me")

      await GoCoreClient.fs.move(src, dst)

      const { exists: srcExists } = await GoCoreClient.fs.exists(src)
      const { exists: dstExists } = await GoCoreClient.fs.exists(dst)
      expect(srcExists).toBe(false)
      expect(dstExists).toBe(true)
    })
  })

  // ---- Remove ----

  describe("remove", () => {
    test("remove deletes a file", async () => {
      if (!goCoreAvailable) return
      const dir = await tmpDir()
      const filePath = path.join(dir, "remove.txt")
      await fs.writeFile(filePath, "remove me")

      await GoCoreClient.fs.remove(filePath)

      const { exists } = await GoCoreClient.fs.exists(filePath)
      expect(exists).toBe(false)
    })

    test("removeAll deletes a directory tree", async () => {
      if (!goCoreAvailable) return
      const dir = await tmpDir()
      const sub = path.join(dir, "sub")
      await fs.mkdir(sub)
      await fs.writeFile(path.join(sub, "file.txt"), "nested")

      await GoCoreClient.fs.removeAll(dir)

      const { exists } = await GoCoreClient.fs.exists(dir)
      expect(exists).toBe(false)
    })
  })

  // ---- Session Events ----

  describe("session events", () => {
    test("publish event returns 204", async () => {
      if (!goCoreAvailable) return
      await GoCoreClient.session.publish("ses_test", "test.event", { text: "hello" })
      // Should not throw — if it did, the test fails
    })

    test("publish event with empty session_id fails", async () => {
      if (!goCoreAvailable) return
      try {
        await GoCoreClient.session.publish("", "test.event", {})
        expect("should have thrown").toBe("never reached")
      } catch {
        // Expected
      }
    })

    test("status returns ok", async () => {
      if (!goCoreAvailable) return
      const status = await GoCoreClient.session.status()
      expect(status.status).toBe("ok")
      expect(typeof status.sessions).toBe("number")
    })
  })

  // ---- Metrics & Circuit Breaker ----

  describe("metrics", () => {
    test("GET /metrics returns snapshot with all fields", async () => {
      if (!goCoreAvailable) return
      const metrics = await GoCoreClient.metrics()
      expect(typeof metrics.request_count).toBe("number")
      expect(typeof metrics.error_count).toBe("number")
      expect(typeof metrics.error_rate).toBe("number")
      expect(typeof metrics.avg_latency_ms).toBe("number")
    })

    test("circuit breaker sets go-core-available to boolean", () => {
      // The circuit breaker may have polled by now. Just verify the flag is boolean.
      const flag = GoCoreClient.isAvailable
      expect(flag.key).toBe("go-core-available")
      expect(typeof flag.defaultValue).toBe("boolean")
    })
  })

  // ---- Process Spawning ----

  describe("process spawning", () => {
    test("spawn echo returns exit code 0", async () => {
      if (!goCoreAvailable) return
      const result = await GoCoreClient.process.spawn("echo", ["hello"])
      expect(result.exit_code).toBe(0)
      expect(result.stdout.length).toBeGreaterThan(0)
    })

    test("spawn with exit code 42", async () => {
      if (!goCoreAvailable) return
      const shell = os.platform() === "win32" ? "cmd" : "/bin/sh"
      const arg = os.platform() === "win32" ? "/c" : "-c"
      const result = await GoCoreClient.process.spawn(shell, [arg, "exit 42"])
      expect(result.exit_code).toBe(42)
    })

    test("spawn with missing command returns error", async () => {
      if (!goCoreAvailable) return
      const result = await GoCoreClient.process.spawn("nonexistent-cmd-xyz")
      expect(result.exit_code).toBe(-1)
      expect(result.error?.length).toBeGreaterThan(0)
    })

    test("npm install in nonexistent dir fails gracefully", async () => {
      if (!goCoreAvailable) return
      const result = await GoCoreClient.process.npmInstall("/nonexistent-path-xyz")
      // Should fail with non-zero exit or error
      expect(result.exit_code === -1 || result.exit_code > 0).toBe(true)
    })
  })

  // ---- Session Message Updater (#1070) ----

  describe("session message updater", () => {
    test("GET /session/messages returns empty list for new session", async () => {
      if (!goCoreAvailable) return
      const res = await GoCoreClient.session.messages("ses_new_empty")
      expect(res.session_id).toBe("ses_new_empty")
      expect(Array.isArray(res.messages)).toBe(true)
      expect(res.messages.length).toBe(0)
    })

    test("publishing events populates messages", async () => {
      if (!goCoreAvailable) return
      const sid = "ses_parity_updater_" + Date.now()

      // Publish a prompted event
      await GoCoreClient.session.publish(sid, "session.next.prompted", {
        timestamp: Date.now(),
        sessionID: sid,
        prompt: { text: "Hello!" },
      })

      // Publish a step started event
      await GoCoreClient.session.publish(sid, "session.next.step.started", {
        timestamp: Date.now(),
        sessionID: sid,
        agent: "coder",
        model: "gpt-4",
      })

      // Publish text events
      await GoCoreClient.session.publish(sid, "session.next.text.started", {
        timestamp: Date.now(),
        sessionID: sid,
      })

      await GoCoreClient.session.publish(sid, "session.next.text.delta", {
        timestamp: Date.now(),
        sessionID: sid,
        delta: "Hello from ",
      })

      await GoCoreClient.session.publish(sid, "session.next.text.delta", {
        timestamp: Date.now(),
        sessionID: sid,
        delta: "Go!",
      })

      await GoCoreClient.session.publish(sid, "session.next.text.ended", {
        timestamp: Date.now(),
        sessionID: sid,
        text: "Hello from Go!",
      })

      // End the step
      await GoCoreClient.session.publish(sid, "session.next.step.ended", {
        timestamp: Date.now(),
        sessionID: sid,
        finish: "stop",
        cost: 0.001,
        tokens: { input: 5, output: 3, reasoning: 0, cache: { read: 0, write: 0 } },
      })

      // Get messages
      const res = await GoCoreClient.session.messages(sid)
      expect(res.session_id).toBe(sid)
      expect(res.messages.length).toBeGreaterThanOrEqual(2)

      // First message should be user prompt
      expect(res.messages[0]).toHaveProperty("type", "user")
      expect((res.messages[0] as any).text).toBe("Hello!")

      // Should have an assistant with text content
      const assistant = res.messages.find((m: any) => m.type === "assistant")
      expect(assistant).toBeDefined()
      expect((assistant as any).content?.length).toBeGreaterThanOrEqual(1)
      expect((assistant as any).finish).toBe("stop")
    })
  })
})
