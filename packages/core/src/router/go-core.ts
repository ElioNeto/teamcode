/**
 * DEPRECATION NOTICE
 * ==================
 * The TypeScript core (packages/core/) is DEPRECATED as of v2.4.0.
 * All new feature development must target the Go core (go-core/).
 * Only bug fixes and security patches are accepted for this package.
 * ==================
 *
 * Go Core spawner — detects and manages the Go core server process.
 *
 * At startup, this module:
 * 1. Finds the go-core-server binary relative to the teamcode binary
 * 2. If not found, auto-downloads it from GitHub releases
 * 3. Spawns it as a child process on localhost:43001
 * 4. Waits for the health endpoint to respond
 * 5. Exports the process handle for graceful shutdown
 *
 * If the binary cannot be obtained, Go core features are simply unavailable
 * (feature flags default to false) and the system runs 100% TypeScript.
 */
import { spawn, spawnSync, type ChildProcess } from "child_process"
import path from "path"
import fs from "fs"
import os from "os"
import { triggerCbPoll } from "./client"

const GO_CORE_PORT = process.env["GO_CORE_PORT"] ?? "43001"
const HEALTH_TIMEOUT = 5000 // 5 seconds to wait for Go core to be ready
const POLL_INTERVAL = 200 // 200ms between health checks
const DOWNLOAD_TIMEOUT = 30_000 // 30 seconds for download

const GITHUB_REPO = process.env["GITHUB_REPOSITORY"] ?? "ElioNeto/teamcode"

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

function binaryName(): string {
  return process.platform === "win32" ? "go-core-server.exe" : "go-core-server"
}

/**
 * Resolve the path to the go-core-server binary.
 *
 * Search order:
 * 1. GO_CORE_BINARY env var (explicit override)
 * 2. Next to the current binary (bundled deployment)
 * 3. Next to the current script (dev mode)
 * 4. In the user cache directory (auto-downloaded)
 */
function resolveBinary(): string | null {
  // 1. Environment variable override
  const fromEnv = process.env["GO_CORE_BINARY"]
  if (fromEnv) {
    if (fs.existsSync(fromEnv)) return fromEnv
    console.warn(`[go-core] GO_CORE_BINARY set but not found: ${fromEnv}`)
  }

  // 2. Next to the current binary (compiled deployment)
  const name = binaryName()
  const binaryDir = path.dirname(process.execPath || "")
  if (binaryDir) {
    const bundled = path.join(binaryDir, name)
    if (fs.existsSync(bundled)) return bundled
  }

  // 3. Look in the package directory (npm install)
  try {
    const pkgDir = path.dirname(require.resolve("@teamcode-ai/teamcode/package.json"))
    const inPkg = path.join(pkgDir, "bin", name)
    if (fs.existsSync(inPkg)) return inPkg
  } catch {
    // not installed via npm
  }

  // 4. Check the cache directory (auto-downloaded by previous run)
  const cached = path.join(cacheDir(), name)
  if (fs.existsSync(cached)) return cached

  return null
}

// ---------------------------------------------------------------------------
// Auto-download
// ---------------------------------------------------------------------------

function cacheDir(): string {
  const home = process.env.HOME || process.env.USERPROFILE || os.homedir()
  const xdgCache = process.env.XDG_CACHE_HOME || path.join(home, ".cache")
  return path.join(xdgCache, "teamcode", "bin")
}

function archiveName(): string | null {
  const osMap: Record<string, string> = {
    darwin: "darwin",
    linux: "linux",
    win32: "windows",
  }
  const targetOs = osMap[process.platform]
  if (!targetOs) {
    console.warn(`[go-core] unsupported platform: ${process.platform}`)
    return null
  }

  const arch = process.arch === "arm64" ? "arm64" : "x64"
  const ext = targetOs === "windows" ? "zip" : "tar.gz"

  // Determine whether AVX2 is available (only matters for x64)
  const baseline = arch === "x64" && targetOs !== "darwin" && !hasAvx2()
  const suffix = baseline ? "-baseline" : ""

  return `teamcode-${targetOs}-${arch}${suffix}.${ext}`
}

function hasAvx2(): boolean {
  if (process.platform === "linux") {
    try {
      return /(^|\s)avx2(\s|$)/i.test(fs.readFileSync("/proc/cpuinfo", "utf8"))
    } catch {
      return false
    }
  }
  if (process.platform === "darwin") {
    try {
      const result = spawnSync("sysctl", ["-n", "hw.optional.avx2_0"], {
        encoding: "utf8",
        timeout: 1500,
      })
      if (result.status !== 0) return true // assume AVX2 on modern macOS
      return (result.stdout || "").trim() === "1"
    } catch {
      return true
    }
  }
  // Windows: assume AVX2 (most Windows 11 machines support it)
  return true
}

function findFile(dir: string, name: string): string | null {
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        const found = findFile(fullPath, name)
        if (found) return found
      } else if (entry.name === name) {
        return fullPath
      }
    }
  } catch {
    // permission errors, etc.
  }
  return null
}

async function downloadGoCore(): Promise<string | null> {
  const name = binaryName()
  const dest = path.join(cacheDir(), name)

  // Already downloaded?
  if (fs.existsSync(dest)) return dest

  const archive = archiveName()
  if (!archive) return null

  // For local/dev builds use the latest release; for released versions pin the tag
  const isLatest = typeof TEAMCODE_VERSION !== "string" || TEAMCODE_VERSION === "local"
  const url = isLatest
    ? `https://github.com/${GITHUB_REPO}/releases/latest/download/${archive}`
    : `https://github.com/${GITHUB_REPO}/releases/download/v${TEAMCODE_VERSION}/${archive}`

  console.log(`[go-core] downloading ${url}`)

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "go-core-"))
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT),
    })
    if (!response.ok) {
      console.warn(`[go-core] download failed: ${response.status} ${response.statusText}`)
      return null
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const archivePath = path.join(tmpDir, archive)
    fs.writeFileSync(archivePath, buffer)

    // Extract based on archive type
    if (archive.endsWith(".tar.gz")) {
      const result = spawnSync("tar", ["-xzf", archivePath, "-C", tmpDir], {
        stdio: "pipe",
        timeout: 15_000,
      })
      if (result.status !== 0) {
        console.warn(`[go-core] tar extraction failed: ${result.stderr?.toString() || ""}`)
        return null
      }
    } else {
      // Windows zip — try `tar` first (built-in since Windows 10 build 17063)
      let extracted = false
      const tarResult = spawnSync("tar", ["-xf", archivePath, "-C", tmpDir], {
        stdio: "pipe",
        timeout: 15_000,
      })
      if (tarResult.status === 0) {
        extracted = true
      } else {
        // Fallback: use PowerShell Expand-Archive
        const psCmd = `Expand-Archive -Path '${archivePath.replace(/'/g, "''")}' -DestinationPath '${tmpDir.replace(/'/g, "''")}' -Force`
        const psResult = spawnSync("powershell", ["-NoProfile", "-Command", psCmd], {
          stdio: "pipe",
          timeout: 30_000,
        })
        if (psResult.status === 0) {
          extracted = true
        }
      }
      if (!extracted) {
        console.warn(`[go-core] zip extraction failed`)
        return null
      }
    }

    // Find the Go binary inside the extracted contents
    const extracted = findFile(tmpDir, name)
    if (!extracted) {
      console.warn(`[go-core] extracted archive does not contain ${name}`)
      return null
    }

    // Install to cache directory
    fs.mkdirSync(cacheDir(), { recursive: true })
    fs.copyFileSync(extracted, dest)
    fs.chmodSync(dest, 0o755)

    console.log(`[go-core] installed to ${dest}`)
    return dest
  } catch (err) {
    console.warn(`[go-core] download failed: ${err}`)
    return null
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

// ---------------------------------------------------------------------------
// Start / Stop
// ---------------------------------------------------------------------------

/**
 * Start the Go core server. Returns true if started successfully.
 */
export async function startGoCore(): Promise<boolean> {
  if (goCoreReady) return true
  if (goCoreProcess) return true // already starting

  let binary = resolveBinary()
  if (!binary) {
    console.log("[go-core] binary not found locally — attempting auto-download")
    binary = await downloadGoCore()
    if (!binary) {
      console.log("[go-core] could not obtain binary — running without Go core")
      return false
    }
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
