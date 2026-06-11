/**
 * Go Core spawner — detects and manages the Go core server process.
 *
 * At startup, this module:
 * 1. Finds the go-core-server binary relative to the teamcode binary
 * 2. Spawns it as a child process on localhost:43001
 * 3. Waits for the health endpoint to respond
 * 4. Exports the process handle for graceful shutdown
 *
 * If the binary is not found, Go core features are simply unavailable
 * (feature flags default to false) and the system runs 100% TypeScript.
 */
import { spawn, type ChildProcess } from "child_process"
import path from "path"
import fs from "fs"
import { triggerCbPoll } from "./client"

const GO_CORE_PORT = process.env["GO_CORE_PORT"] ?? "43001"
const HEALTH_TIMEOUT = 5000 // 5 seconds to wait for Go core to be ready
const POLL_INTERVAL = 200 // 200ms between health checks

let goCoreProcess: ChildProcess | null = null
let goCoreReady = false
let goCorePort: string = GO_CORE_PORT

/**
 * Find an available port starting from the given base port.
 * Checks if the health endpoint of the port responds — if another Go core
 * instance is already running on that port, try the next one.
 * Avoids the race condition of TCP-bind-then-release by looking for
 * a running Go core rather than a free TCP port.
 */
async function findAvailablePort(base: number, maxAttempts = 100): Promise<number> {
  for (let port = base; port < base + maxAttempts; port++) {
    try {
      const resp = await fetch(`http://127.0.0.1:${port}/health`, {
        signal: AbortSignal.timeout(1000),
      })
      if (resp.ok) {
        // Another Go core is running on this port — try the next
        continue
      }
    } catch {
      // Connection refused — port is free
    }
    return port
  }
  return base // fallback: let Go core try the base port
}

/**
 * Resolve the path to the go-core-server binary.
 *
 * Search order:
 * 1. GO_CORE_BINARY env var (explicit override)
 * 2. Next to the current binary (bundled deployment)
 * 3. Next to the current script (dev mode)
 */
function resolveBinary(): string | null {
  // 1. Environment variable override
  const fromEnv = process.env["GO_CORE_BINARY"]
  if (fromEnv) {
    if (fs.existsSync(fromEnv)) return fromEnv
    console.warn(`[go-core] GO_CORE_BINARY set but not found: ${fromEnv}`)
  }

  // 2. Next to the current binary (compiled deployment)
  const binaryName = process.platform === "win32" ? "go-core-server.exe" : "go-core-server"
  const binaryDir = path.dirname(process.execPath || "")
  if (binaryDir) {
    const bundled = path.join(binaryDir, binaryName)
    if (fs.existsSync(bundled)) return bundled
  }

  // 3. Look in the package directory (npm install)
  try {
    const pkgDir = path.dirname(require.resolve("@teamcode-ai/teamcode/package.json"))
    const inPkg = path.join(pkgDir, "bin", binaryName)
    if (fs.existsSync(inPkg)) return inPkg
  } catch {
    // not installed via npm
  }

  return null
}

/**
 * Start the Go core server. Returns true if started successfully.
 */
export async function startGoCore(): Promise<boolean> {
  if (goCoreReady) return true
  if (goCoreProcess) return true // already starting

  const binary = resolveBinary()
  if (!binary) {
    console.log("[go-core] binary not found — running without Go core")
    return false
  }

  console.log(`[go-core] starting server from ${binary}`)

  try {
    // Find an available port by checking health endpoints of running Go cores
    const basePort = parseInt(GO_CORE_PORT, 10)
    const availablePort = await findAvailablePort(basePort)
    goCorePort = String(availablePort)
    const healthUrl = `http://127.0.0.1:${goCorePort}/health`

    goCoreProcess = spawn(binary, [], {
      env: { ...process.env, GO_CORE_PORT: goCorePort },
      stdio: ["ignore", "pipe", "pipe"],
    })

    goCoreProcess.on("error", (err) => {
      console.warn(`[go-core] failed to start: ${err.message}`)
      goCoreProcess = null
    })

    goCoreProcess.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        console.warn(`[go-core] exited with code ${code}`)
      }
      goCoreProcess = null
      goCoreReady = false
    })

    // Wait for health endpoint, but bail early if the process dies
    const deadline = Date.now() + HEALTH_TIMEOUT
    while (Date.now() < deadline) {
      if (!goCoreProcess) {
        console.warn("[go-core] process exited before health check succeeded")
        return false
      }
      try {
        const resp = await fetch(healthUrl)
        if (resp.ok) {
          goCoreReady = true
          console.log(`[go-core] server ready on port ${goCorePort}`)
          // Trigger immediate circuit breaker poll so Go core becomes available now
          triggerCbPoll()
          return true
        }
      } catch {
        // server not ready yet
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL))
    }

    console.warn("[go-core] health check timed out")
    stopGoCore()
    return false
  } catch (err) {
    console.warn(`[go-core] error: ${err}`)
    return false
  }
}

/**
 * Stop the Go core server.
 */
export function stopGoCore(): void {
  if (goCoreProcess) {
    goCoreProcess.kill()
    goCoreProcess = null
  }
  goCoreReady = false
}

/**
 * Check if the Go core server is currently running and healthy.
 */
export function isGoCoreReady(): boolean {
  return goCoreReady
}
