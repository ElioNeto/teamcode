/**
 * Go core HTTP client.
 * Routes requests to the go-core server when enabled by feature flags.
 *
 * Parity with packages/core/src/filesystem.ts AppFileSystem.Interface
 */

import { flag } from "./flag"

const GO_CORE_PORT = process.env["GO_CORE_PORT"] ?? "43001"
const BASE_URL = `http://127.0.0.1:${GO_CORE_PORT}`

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: { sessionID?: string },
): Promise<T> {
  const resp = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
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

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export const GoCoreClient = {
  /** Health check */
  health: () => request<{ status: string; version: string; time: string }>("GET", "/health"),

  /** Feature flag to check if go-core is available */
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
  },
}
