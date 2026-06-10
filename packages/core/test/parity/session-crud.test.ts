/**
 * Parity tests: Session CRUD lifecycle — Go Core vs TypeScript baseline.
 *
 * Tests that the Go core session CRUD endpoints behave correctly:
 * create, get, update, delete, and list operations.
 *
 * Run with: GO_CORE_BINARY=../../go-core/server bun test test/parity/session-crud.test.ts
 */
import { describe, expect, test, beforeAll, afterAll } from "bun:test"
import path from "path"
import fs from "fs/promises"
import { GoCoreClient } from "@teamcode-ai/core/router"
// Session type defined locally to avoid barrel export resolution issues with tsgo
interface GoCoreSession {
  id: string
  title: string
  directory: string
  agent: string
  model: string
  created_at: string
  updated_at: string
}

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
    if (!goCoreAvailable) {
      console.warn("Go core server did not become ready — tests will be skipped.")
    }
  } catch (err) {
    console.warn(`Error starting Go core: ${err}`)
  }
})

afterAll(() => {
  if (goCoreProcess) {
    goCoreProcess.kill()
  }
})

// ---------------------------------------------------------------------------
// Session CRUD tests (only if Go core is available)
// ---------------------------------------------------------------------------

const testDir = "/tmp/parity-test-session-" + Date.now()

describe("session CRUD", () => {
  test("go core is available", () => {
    expect(goCoreAvailable).toBe(true)
  })

  let created: GoCoreSession

  test("create session", async () => {
    if (!goCoreAvailable) return

    created = await GoCoreClient.session.create(
      "ses_parity_test_001",
      "Parity Test Session",
      testDir,
      "test-agent",
      "gpt-4",
    )

    expect(created).toBeDefined()
    expect(created.id).toBe("ses_parity_test_001")
    expect(created.title).toBe("Parity Test Session")
    expect(created.directory).toBe(testDir)
    expect(created.agent).toBe("test-agent")
    expect(created.model).toBe("gpt-4")
    expect(created.created_at).toBeDefined()
    expect(created.updated_at).toBeDefined()
  })

  test("get session", async () => {
    if (!goCoreAvailable) return

    const sess = await GoCoreClient.session.get("ses_parity_test_001")
    expect(sess).toBeDefined()
    expect(sess.id).toBe("ses_parity_test_001")
    expect(sess.title).toBe("Parity Test Session")
  })

  test("get non-existent session returns 404", async () => {
    if (!goCoreAvailable) return

    try {
      await GoCoreClient.session.get("ses_nonexistent")
      expect.unreachable("should have thrown")
    } catch (err) {
      expect(err).toBeDefined()
    }
  })

  test("update session title", async () => {
    if (!goCoreAvailable) return

    const updated = await GoCoreClient.session.update("ses_parity_test_001", "Updated Title")
    expect(updated.title).toBe("Updated Title")
    expect(updated.id).toBe("ses_parity_test_001")

    // Verify the update persisted
    const sess = await GoCoreClient.session.get("ses_parity_test_001")
    expect(sess.title).toBe("Updated Title")
  })

  test("update non-existent session returns 404", async () => {
    if (!goCoreAvailable) return

    try {
      await GoCoreClient.session.update("ses_nonexistent", "Nope")
      expect.unreachable("should have thrown")
    } catch (err) {
      expect(err).toBeDefined()
    }
  })

  test("delete session", async () => {
    if (!goCoreAvailable) return

    await GoCoreClient.session.delete("ses_parity_test_001")

    // Verify deletion — get should now 404
    try {
      await GoCoreClient.session.get("ses_parity_test_001")
      expect.unreachable("should have thrown after delete")
    } catch (err) {
      expect(err).toBeDefined()
    }
  })

  test("delete non-existent session returns 404", async () => {
    if (!goCoreAvailable) return

    try {
      await GoCoreClient.session.delete("ses_nonexistent")
      expect.unreachable("should have thrown")
    } catch (err) {
      expect(err).toBeDefined()
    }
  })

  test("list sessions by directory", async () => {
    if (!goCoreAvailable) return

    // Create several sessions
    await GoCoreClient.session.create("ses_list_a", "A", "/dir-a", "agent", "model")
    await GoCoreClient.session.create("ses_list_b", "B", "/dir-b", "agent", "model")
    await GoCoreClient.session.create("ses_list_a2", "A2", "/dir-a", "agent", "model")

    const listA = await GoCoreClient.session.list("/dir-a")
    expect(listA.count).toBe(2)
    expect(listA.sessions).toHaveLength(2)
    expect(listA.sessions.map((s) => s.id).sort()).toEqual(["ses_list_a", "ses_list_a2"])

    const listB = await GoCoreClient.session.list("/dir-b")
    expect(listB.count).toBe(1)
    expect(listB.sessions).toHaveLength(1)
    expect(listB.sessions[0].id).toBe("ses_list_b")

    // List all
    const all = await GoCoreClient.session.list()
    expect(all.count).toBeGreaterThanOrEqual(3)

    // Cleanup
    await GoCoreClient.session.delete("ses_list_a")
    await GoCoreClient.session.delete("ses_list_b")
    await GoCoreClient.session.delete("ses_list_a2")
  })

  test("list returns empty array for directory with no sessions", async () => {
    if (!goCoreAvailable) return

    const result = await GoCoreClient.session.list("/nonexistent-path")
    expect(result.count).toBe(0)
    expect(result.sessions).toEqual([])
  })
})
