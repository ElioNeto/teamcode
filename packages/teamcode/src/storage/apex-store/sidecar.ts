/** Sidecar process manager for ApexStore server */

import { spawn, type ChildProcess } from "node:child_process"
import { existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { ApexStoreClient } from "./client"

export interface SidecarOptions {
  dataDir: string
  port?: number
  host?: string
  memtableMaxSize?: number
  blockCacheSizeMb?: number
  binaryPath?: string
  onStdout?: (line: string) => void
  onStderr?: (line: string) => void
}

export interface SidecarHandle {
  client: ApexStoreClient
  stop: () => Promise<void>
  port: number
}

function resolveBinary(): string {
  const dir = dirname(fileURLToPath(import.meta.url))
  // Walk up from apex-store/ -> storage/ -> src/ -> teamcode/ -> bin/apexstore-server
  const candidates = [
    join(dir, "..", "..", "..", "bin", "apexstore-server"),
    join(dir, "..", "..", "..", "..", "bin", "apexstore-server"),
    join(dir, "..", "..", "..", "..", "..", "bin", "apexstore-server"),
    "/tmp/ApexStore/target/release/apexstore-server",
  ]
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }
  throw new Error(
    `apexstore-server binary not found. Searched:\n${candidates.join("\n")}\n\nBuild it with:\n  cd /tmp && git clone https://github.com/ElioNeto/ApexStore.git && cd ApexStore && cargo build --release --bin apexstore-server`,
  )
}

const DEFAULT_PORT = 0 // OS picks a free port

function pickPort(desired: number | undefined): number {
  return desired ?? DEFAULT_PORT
}

export async function startSidecar(opts: SidecarOptions): Promise<SidecarHandle> {
  const binaryPath = opts.binaryPath ?? resolveBinary()
  const port = pickPort(opts.port)

  if (!existsSync(binaryPath)) {
    throw new Error(`ApexStore binary not found at: ${binaryPath}`)
  }

  const env: Record<string, string> = {
    DATA_DIR: opts.dataDir,
    PORT: String(port === 0 ? 8080 : port),
    HOST: opts.host ?? "127.0.0.1",
    RATE_LIMIT_ENABLED: "false",
    CORS_ENABLED: "false",
    API_AUTH_ENABLED: "false",
    MEMTABLE_MAX_SIZE: String(opts.memtableMaxSize ?? 4 * 1024 * 1024),
    BLOCK_CACHE_SIZE_MB: String(opts.blockCacheSizeMb ?? 64),
    BLOOM_FALSE_POSITIVE_RATE: "0.01",
    PREFIX_COMPRESSION_ENABLED: "true",
  }

  const child = spawn(binaryPath, [], {
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  })

  child.stdout?.on("data", (chunk: Buffer) => {
    const line = chunk.toString("utf8").trimEnd()
    opts.onStdout?.(line)
  })

  child.stderr?.on("data", (chunk: Buffer) => {
    const line = chunk.toString("utf8").trimEnd()
    opts.onStderr?.(line)
  })

  // Wait for server to become ready
  const actualPort = port === 0 ? 8080 : port
  const client = new ApexStoreClient({ host: opts.host ?? "127.0.0.1", port: actualPort })

  const ready = await waitForHealth(client, 30_000)
  if (!ready) {
    child.kill()
    throw new Error("ApexStore sidecar failed to start within 30 seconds")
  }

  const sidecarPort = actualPort // For simplicity, we use the configured port

  return {
    client,
    port: sidecarPort,
    stop: () =>
      new Promise<void>((resolve) => {
        child.on("exit", () => resolve())
        child.kill("SIGTERM")
        // Force kill after 5 seconds
        setTimeout(() => {
          if (child.exitCode === null) child.kill("SIGKILL")
          resolve()
        }, 5000)
      }),
  }
}

async function waitForHealth(client: ApexStoreClient, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await client.health()) return true
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  return false
}
