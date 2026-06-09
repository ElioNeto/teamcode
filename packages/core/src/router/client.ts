/**
 * Go core HTTP client.
 * Routes requests to the go-core server when enabled by feature flags.
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

export const GoCoreClient = {
  health: () => request<{ status: string }>("GET", "/health"),

  fs: {
    read: (path: string, offset?: number, limit?: number) =>
      request<{ content: string; size: number; mime_type: string }>("POST", "/fs/read", { path, offset, limit }),

    write: (path: string, content: string) =>
      request<void>("POST", "/fs/write", { path, content }),

    list: (path: string, pattern?: string, recursive?: boolean) =>
      request<{ files: string[] }>("POST", "/fs/list", { path, pattern, recursive }),

    stat: (path: string) =>
      request<{ name: string; size: number; mode: string; modtime: string; dir: boolean }>("POST", "/fs/stat", { path }),
  },
}
