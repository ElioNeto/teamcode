/**
 * Parity Test Harness — Reusable setup/teardown for Go core parity tests.
 *
 * Usage:
 *   import { describeParity } from "./harness"
 *
 *   describeParity("my feature", (goCoreAvailable) => {
 *     test("something", () => {
 *       if (!goCoreAvailable) return
 *       // ... test using GoCoreClient
 *     })
 *   })
 *
 * Each describeParity call starts its own Go core server instance.
 * The server is automatically killed when the describe block completes.
 *
 * Run with:
 *   GO_CORE_BINARY=../../go-core/server bun test test/parity/
 */
import { describe, beforeAll, afterAll } from "bun:test"
import path from "path"
import fs from "fs/promises"

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_BINARY = path.join(import.meta.dir, "..", "..", "..", "..", "go-core", "server")
const DEFAULT_PORT = "43001"

// ---------------------------------------------------------------------------
// Resolve Go core binary path
// ---------------------------------------------------------------------------

function resolveBinary(): string {
  return process.env["GO_CORE_BINARY"] ?? DEFAULT_BINARY
}

// ---------------------------------------------------------------------------
// Start the Go core server and wait for it to be ready
// Returns cleanup function
// ---------------------------------------------------------------------------

async function startGoCore(): Promise<{
  available: boolean
  cleanup: () => void
}> {
  const binary = resolveBinary()
  const port = process.env["GO_CORE_PORT"] ?? DEFAULT_PORT
  let goProcess: ReturnType<typeof Bun.spawn> | null = null

  try {
    await fs.access(binary, fs.constants.X_OK)
  } catch {
    console.log(`[harness] Go core binary not found: ${binary}`)
    return { available: false, cleanup: () => {} }
  }

  try {
    goProcess = Bun.spawn([binary], {
      env: { ...process.env, GO_CORE_PORT: port },
      stdout: "pipe",
      stderr: "pipe",
    })

    let available = false
    for (let attempt = 0; attempt < 15; attempt++) {
      try {
        const resp = await fetch(`http://127.0.0.1:${port}/health`)
        if (resp.ok) {
          available = true
          break
        }
      } catch {
        // server not ready yet
      }
      await new Promise((r) => setTimeout(r, 300))
    }

    if (available) {
      console.log(`[harness] Go core server ready on port ${port}.`)
    } else {
      console.warn(`[harness] Go core server did not become ready.`)
    }

    const cleanup = () => {
      if (goProcess) {
        goProcess.kill()
        goProcess = null
      }
    }

    return { available, cleanup }
  } catch (err) {
    console.warn(`[harness] Error starting Go core: ${err}`)
    return { available: false, cleanup: () => {} }
  }
}

// ---------------------------------------------------------------------------
// describeParity — Wraps a describe block with Go core lifecycle
//
// Starts the Go server before all tests and kills it after.
// Tests access goCoreAvailable via the closure — no parameter needed.
//
// Usage:
//   describeParity("my tests", () => {
//     test("something", () => {
//       if (!goCoreAvailable) return
//     })
//   })
//
// goCoreAvailable is automatically available to all tests in the block.
// ---------------------------------------------------------------------------

let goCoreAvailable = false

export function getGoCoreAvailable(): boolean {
  return goCoreAvailable
}

export function describeParity(name: string, fn: () => void): void {
  describe(name, () => {
    let cleanup: (() => void) | null = null

    beforeAll(async () => {
      const result = await startGoCore()
      goCoreAvailable = result.available
      cleanup = result.cleanup
    })

    afterAll(() => {
      cleanup?.()
      goCoreAvailable = false
    })

    fn()
  })
}
