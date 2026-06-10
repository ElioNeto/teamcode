/**
 * Go core HTTP client.
 * Routes requests to the go-core server when enabled by feature flags.
 *
 * Parity with packages/core/src/filesystem.ts AppFileSystem.Interface
 */

import { flag, setFlag, getFlag } from "./flag"

const GO_CORE_PORT = process.env["GO_CORE_PORT"] ?? "43001"
const BASE_URL = `http://127.0.0.1:${GO_CORE_PORT}`

const CB_POLL_INTERVAL = parseInt(process.env["GO_CORE_CB_POLL"] ?? "30000", 10)
const CB_ERROR_RATE_THRESHOLD = 1.0 // 1% error rate triggers circuit breaker
const CB_RECOVERY_POLLS = 1 // consecutive healthy polls to re-enable

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: { sessionID?: string; traceId?: string },
): Promise<T> {
  const traceId = options?.traceId ?? crypto.randomUUID()
  const resp = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Trace-ID": traceId,
      ...(options?.sessionID ? { "X-Session-ID": options.sessionID } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!resp.ok) {
    const errBody = await resp.json().catch(() => ({ error: resp.statusText }))
    const msg = typeof errBody === "object" && errBody && "error" in errBody ? String(errBody.error) : resp.statusText
    throw new Error(msg)
  }

  if (resp.status === 204) return undefined as T
  return resp.json() as Promise<T>
}

// ---- Circuit breaker state ----
//
// The circuit breaker polls GET /metrics on the Go core every 30s.
// If error_rate > 1%, it disables Go core via setFlag("go-core-available", false).
// After 2 consecutive healthy polls, it re-enables via setFlag("go-core-available", true).

let healthyCount = 0
let cbStarted = false

// Start the circuit breaker polling loop on module load
startCircuitBreaker()

/** Metrics snapshot returned by GET /metrics */
export interface GoCoreMetrics {
  request_count: number
  error_count: number
  error_rate: number
  avg_latency_ms: number
}

/**
 * Start the circuit breaker polling loop.
 * Called once at module load time; idempotent.
 */
function startCircuitBreaker(): void {
  if (cbStarted) return
  cbStarted = true

  // Don't start if explicitly disabled
  if (process.env["GO_CORE_CB_DISABLED"] === "true" || process.env["GO_CORE_CB_DISABLED"] === "1") return

  const poll = async () => {
    try {
      const metrics = await request<GoCoreMetrics>("GET", "/metrics")

      if (metrics.error_rate > CB_ERROR_RATE_THRESHOLD) {
        // Trip breaker — disable Go core
        setFlag("go-core-available", false)
        healthyCount = 0
      } else {
        healthyCount++
        if (healthyCount >= CB_RECOVERY_POLLS) {
          // Re-enable after consecutive healthy polls
          setFlag("go-core-available", true)
        }
      }
    } catch {
      // If we can't reach the Go core at all, disable it
      setFlag("go-core-available", false)
      healthyCount = 0
    }
  }

  // Immediate first poll, then repeat
  poll()
  // Use unref so this timer doesn't keep subprocesses alive
  const timer = setInterval(poll, CB_POLL_INTERVAL)
  timer.unref()

}

/** Trigger an immediate circuit breaker health check.
 *  Called by startGoCore() after the Go core becomes ready. */
export function triggerCbPoll(): void {
  if (!cbStarted) return
  const poll = async () => {
    try {
      const metrics = await request<GoCoreMetrics>("GET", "/metrics")
      if (metrics.error_rate > CB_ERROR_RATE_THRESHOLD) {
        setFlag("go-core-available", false)
        healthyCount = 0
      } else {
        healthyCount++
        if (healthyCount >= CB_RECOVERY_POLLS) setFlag("go-core-available", true)
      }
    } catch {
      setFlag("go-core-available", false)
      healthyCount = 0
    }
  }
  poll()
}

// ---------------------------------------------------------------------------
// Types (parity with filesystem.ts)
// ---------------------------------------------------------------------------

export interface GoCoreReadResult {
  content: string
  size: number
  mime_type: string
  binary: boolean
}

export interface GoCoreStatResult {
  name: string
  size: number
  mode: string
  modtime: string
  dir: boolean
}

export interface GoCoreDirEntry {
  name: string
  type: "file" | "directory" | "symlink" | "other"
}

export interface GoCoreGlobResponse {
  matches: string[]
}

export interface GoCoreFindUpResponse {
  results: string[]
}

export interface GoCoreProcessResult {
  stdout: string
  stderr: string
  exit_code: number
  timeout: boolean
  error?: string
}

export interface GoCoreMessagesResponse {
  session_id: string
  messages: unknown[]
}

export interface GoCoreSession {
  id: string
  title: string
  directory: string
  agent: string
  model: string
  created_at: string
  updated_at: string
}

export interface GoCoreSessionListResponse {
  sessions: GoCoreSession[]
  count: number
}

export interface GoCoreProvider {
  id: string
  name: string
  description?: string
  website?: string
  model_count: number
  models?: GoCoreModel[]
}

export interface GoCoreModel {
  id: string
  name: string
  provider: string
  description?: string
  context_length: number
  max_output?: number
  input_price?: string
  output_price?: string
}

export interface GoCoreProviderListResponse {
  providers: GoCoreProvider[]
  count: number
}

export interface GoCoreProviderModelsResponse {
  provider: string
  name: string
  models: GoCoreModel[]
  count: number
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export const GoCoreClient = {
  /** Health check */
  health: () => request<{ status: string; version: string; time: string }>("GET", "/health"),

  /** Get current health metrics for circuit breaker */
  metrics: () => request<GoCoreMetrics>("GET", "/metrics"),

  /** Feature flag to check if go-core is available (updated by circuit breaker) */
  isAvailable: flag<boolean>("go-core-available", false),

  /** Feature flag to enable go-core filesystem (0-100 canary %) */
  filesystemCanary: flag<number>("go-core-filesystem", 0),

  /** Feature flag to enable go-core session streaming */
  sessionCanary: flag<number>("go-core-session", 0),

  // ---- Filesystem (parity with AppFileSystem.Interface) ----

  fs: {
    /** Read a file with optional offset/limit. */
    read: (path: string, offset?: number, limit?: number) =>
      request<GoCoreReadResult>("POST", "/fs/read", { path, offset, limit }),

    /** Read a file safely — returns { content, found } instead of throwing on ENOENT. */
    readSafe: (path: string) =>
      request<{ content: string; found: boolean }>("POST", "/fs/read-safe", { path }),

    /** Read and parse a JSON file. */
    readJSON: (path: string) =>
      request<unknown>("POST", "/fs/read-json", { path }),

    /** Write content to a file (creates parent dirs). */
    write: (path: string, content: string) =>
      request<void>("POST", "/fs/write", { path, content }),

    /** Write data as indented JSON to a file. */
    writeJSON: (path: string, data: unknown) =>
      request<void>("POST", "/fs/write-json", { path, data }),

    /** List files in a directory, optionally recursive with pattern filter. */
    list: (path: string, pattern?: string, recursive?: boolean) =>
      request<{ files: string[] }>("POST", "/fs/list", { path, pattern, recursive }),

    /** Get file/directory metadata. */
    stat: (path: string) =>
      request<GoCoreStatResult>("POST", "/fs/stat", { path }),

    /** Check if a path exists. */
    exists: (path: string) =>
      request<{ exists: boolean }>("POST", "/fs/exists", { path }),

    /** Check if path is a directory. */
    isDir: (path: string) =>
      request<{ dir: boolean }>("POST", "/fs/is-dir", { path }),

    /** Check if path is a file. */
    isFile: (path: string) =>
      request<{ file: boolean }>("POST", "/fs/is-file", { path }),

    /** Create a directory and all parents. */
    ensureDir: (path: string) =>
      request<void>("POST", "/fs/ensure-dir", { path }),

    /** Read directory entries with type information. */
    readdir: (path: string) =>
      request<{ entries: GoCoreDirEntry[] }>("POST", "/fs/readdir", { path }),

    /** Glob files matching a pattern. */
    glob: (pattern: string, cwd?: string, dot?: boolean) =>
      request<GoCoreGlobResponse>("POST", "/fs/glob", { pattern, cwd, dot }),

    /** Check if a path matches a glob pattern. */
    globMatch: (pattern: string, path: string) =>
      request<{ match: boolean }>("POST", "/fs/glob-match", { pattern, path }),

    /** Walk up from start looking for target file. */
    findUp: (target: string, start: string, stop?: string) =>
      request<GoCoreFindUpResponse>("POST", "/fs/find-up", { target, start, stop }),

    /** Walk up from start looking for multiple targets. */
    up: (targets: string[], start: string, stop?: string) =>
      request<GoCoreFindUpResponse>("POST", "/fs/up", { targets, start, stop }),

    /** Walk up from start globbing for files. */
    globUp: (pattern: string, start: string, stop?: string) =>
      request<GoCoreFindUpResponse>("POST", "/fs/glob-up", { pattern, start, stop }),

    /** Copy a file. */
    copy: (src: string, dst: string) =>
      request<void>("POST", "/fs/copy", { src, dst }),

    /** Move (rename) a file. */
    move: (src: string, dst: string) =>
      request<void>("POST", "/fs/move", { src, dst }),

    /** Remove a file or empty directory. */
    remove: (path: string) =>
      request<void>("POST", "/fs/remove", { path }),

    /** Remove a file or directory tree. */
    removeAll: (path: string) =>
      request<void>("POST", "/fs/remove-all", { path }),

    /** Watch a file or directory for changes via SSE. */
    watch: (path: string, intervalMs?: number): EventSource => {
      const params = new URLSearchParams({ path })
      if (intervalMs) params.set("interval_ms", String(intervalMs))
      const url = `${BASE_URL}/fs/watch?${params.toString()}`
      return new (EventSource as any)(url)
    },
  },

  // ---- Process Spawning (parity with cross-spawn-spawner.ts + npm.ts) ----

  process: {
    /** Spawn a process with args, env, cwd, and timeout. */
    spawn: (command: string, args?: string[], env?: Record<string, string>, cwd?: string, timeoutMs?: number) =>
      request<GoCoreProcessResult>("POST", "/process/spawn", { command, args, env, cwd, timeout_ms: timeoutMs }),

    /** Run npm install in a directory, optionally adding packages. */
    npmInstall: (dir: string, add?: string[]) =>
      request<GoCoreProcessResult>("POST", "/process/npm-install", { dir, args: add, timeout_ms: 300000 }),

    /** Run a command via npx. */
    npx: (dir: string, args: string[], timeoutMs?: number) =>
      request<GoCoreProcessResult>("POST", "/process/npx", { dir, args, timeout_ms: timeoutMs }),
  },

  // ---- Provider Catalog ----

  providers: {
    /** List all providers. */
    list: () =>
      request<GoCoreProviderListResponse>("GET", "/providers"),

    /** Get models for a provider. */
    models: (name: string) =>
      request<GoCoreProviderModelsResponse>("GET", `/providers/${encodeURIComponent(name)}/models`),
  },

  // ---- Config System ----

  config: {
    /** Get merged config for a directory. */
    get: (directory: string) =>
      request<Record<string, unknown>>("POST", "/config/get", { directory }),

    /** Invalidate cached config for a directory. */
    invalidate: (directory: string) =>
      request<void>("POST", "/config/invalidate", { directory }),
  },

  // ---- Session Events ----

  session: {
    /** Publish a session event to the Go core event bus. */
    publish: (sessionID: string, eventType: string, data: unknown) =>
      request<void>("POST", "/session/event", { session_id: sessionID, event_type: eventType, data }),

    /** Get the status of the event streaming system. */
    status: () =>
      request<{ status: string; sessions: number }>("GET", "/session/events-status"),

    /** Create an SSE EventSource for a session's event stream. */
    stream: (sessionID: string): EventSource => {
      const url = `${BASE_URL}/session/events?session_id=${encodeURIComponent(sessionID)}`
      return new (EventSource as any)(url)
    },

    /** Get consolidated messages for a session (processed by session message updater). */
    messages: (sessionID: string) =>
      request<GoCoreMessagesResponse>("GET", `/session/messages?session_id=${encodeURIComponent(sessionID)}`),

    // ---- Session CRUD Lifecycle ----

    /** Create a new session with metadata. */
    create: (sessionID: string, title: string, directory: string, agent: string, model: string) =>
      request<GoCoreSession>("POST", "/session/create", {
        session_id: sessionID,
        title,
        directory,
        agent,
        model,
      }),

    /** Get session metadata by ID. */
    get: (sessionID: string) =>
      request<GoCoreSession>("GET", `/session/get?session_id=${encodeURIComponent(sessionID)}`),

    /** Update session title. */
    update: (sessionID: string, title: string) =>
      request<GoCoreSession>("POST", "/session/update", {
        session_id: sessionID,
        title,
      }),

    /** Delete a session. */
    delete: (sessionID: string) =>
      request<void>("POST", "/session/delete", { session_id: sessionID }),

    /** List sessions, optionally filtered by directory. */
    list: (directory?: string) =>
      request<GoCoreSessionListResponse>("GET", `/session/list${directory ? `?directory=${encodeURIComponent(directory)}` : ""}`),
  },
}
