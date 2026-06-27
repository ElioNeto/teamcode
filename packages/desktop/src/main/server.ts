import { execFile, type ChildProcess } from "node:child_process"
import { createServer } from "node:net"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { app } from "electron"

const SIDECAR_START_STALL_TIMEOUT = 60_000
const SIDECAR_STOP_TIMEOUT = 6_000

export type ServerHandle = { stop: () => Promise<void>; kill: () => void; port: number }

type SpawnServerOptions = {
  onStdout?: (message: string) => void
  onStderr?: (message: string) => void
  onExit?: (code: number | null) => void
}

/**
 * Resolve the Go core binary path.
 * In dev, look relative to the monorepo root.
 * In production, check bundled resources.
 */
function resolveBinary(): string {
  const envPath = process.env.GO_CORE_PATH
  if (envPath) return envPath

  if (!app.isPackaged) {
    // In dev, look for the binary relative to the monorepo root
    // import.meta.url is packages/desktop/src/main/server.ts → go up 4 levels to repo root
    const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../")
    return join(repoRoot, "go-core/build/go-core-server")
  }

  // Production: bundled via electron-builder extraResources
  const ext = process.platform === "win32" ? ".exe" : ""
  return join(process.resourcesPath, `go-core-server${ext}`)
}

function checkHealth(port: number, signal?: AbortSignal): Promise<boolean> {
  return fetch(`http://127.0.0.1:${port}/health`, {
    signal: signal ?? AbortSignal.timeout(3000),
  })
    .then((r) => r.ok)
    .catch(() => false)
}

export async function spawnServer(
  port: number,
  options: SpawnServerOptions = {},
): Promise<ServerHandle> {
  const binary = resolveBinary()
  const env = {
    ...process.env,
    GO_CORE_PORT: String(port),
  }

  const child: ChildProcess = execFile(binary, [], {
    env: env as Record<string, string>,
    stdio: ["ignore", "pipe", "pipe"],
  } as any)

  let exited = false

  child.stdout?.on("data", (chunk: Buffer) => {
    options.onStdout?.(chunk.toString("utf8").trimEnd())
  })

  child.stderr?.on("data", (chunk: Buffer) => {
    options.onStderr?.(chunk.toString("utf8").trimEnd())
  })

  child.on("exit", (code) => {
    exited = true
    options.onExit?.(code)
  })

  child.on("error", (err) => {
    options.onStderr?.(`go-core process error: ${err.message}`)
  })

  // Wait for health check
  const abort = new AbortController()
  const healthOk = await waitForHealth(port, abort.signal)

  if (!healthOk) {
    if (!exited) child.kill()
    throw new Error(`Go core server failed to start on port ${port}`)
  }

  let stopping: Promise<void> | undefined

  return {
    port,
    stop: () => {
      if (stopping) return stopping
      if (exited) return Promise.resolve()
      child.kill("SIGTERM")
      stopping = new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          if (!exited) child.kill("SIGKILL")
          resolve()
        }, SIDECAR_STOP_TIMEOUT)

        child.on("exit", () => {
          clearTimeout(timeout)
          resolve()
        })
      })
      return stopping
    },
    kill: () => {
      if (exited) return
      child.kill("SIGKILL")
    },
  }
}

async function waitForHealth(port: number, signal: AbortSignal): Promise<boolean> {
  const deadline = Date.now() + SIDECAR_START_STALL_TIMEOUT

  while (Date.now() < deadline) {
    if (signal.aborted) return false
    const ok = await checkHealth(port)
    if (ok) return true
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  return false
}

/**
 * Find an available port starting from the preferred port.
 * Uses OS-assigned port (0) to probe, then uses the assigned number.
 */
export async function findAvailablePort(): Promise<number> {
  const fromEnv = process.env.TEAMCODE_PORT
  if (fromEnv) {
    const parsed = Number.parseInt(fromEnv, 10)
    if (!Number.isNaN(parsed)) return parsed
  }

  const preferred = Number.parseInt(process.env.GO_CORE_PORT ?? "43001", 10)

  return new Promise((resolve, reject) => {
    const server = createServer()
    server.on("error", reject)
    server.listen(preferred, "127.0.0.1", () => {
      const address = server.address()
      if (!address || typeof address !== "object") {
        server.close()
        reject(new Error("Failed to get port"))
        return
      }
      const port = address.port
      server.close(() => resolve(port))
    })
  })
}
