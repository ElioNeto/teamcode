// Cache the core base URL after first resolution
let cachedBase: string | null = null

async function getCoreBase(): Promise<string> {
  if (cachedBase) return cachedBase
  try {
    const port = await window.api.getServerPort()
    if (port) {
      cachedBase = `http://127.0.0.1:${port}`
      return cachedBase
    }
  } catch {}
  cachedBase = "http://127.0.0.1:43001"
  return cachedBase
}

// ── Types ────────────────────────────────────────────────────────────────────

export type Session = {
  id: string
  title: string
  directory: string
  agent: string
  model: string
  created_at: string
  updated_at: string
}

export type SessionListResponse = {
  sessions: Session[]
  count: number
}

export type Message = {
  id: string
  type: string
  text?: string
  agent?: string
  model?: string
  content?: ContentBlock[]
  error?: { type: string; message: string }
  time: { created: number; completed?: number }
  [key: string]: unknown
}

export type ContentBlock = {
  type: string
  text?: string
}

export type SwarmRunResponse = {
  swarm_id: string
}

export type HealthResponse = {
  status: string
  version: string
  time: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(5000),
    ...init,
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`HTTP ${res.status}${body ? ": " + body : ""}`)
  }
  return res.json()
}

// ── API ──────────────────────────────────────────────────────────────────────

export const api = {
  // Health
  health: async (): Promise<HealthResponse> => {
    const base = await getCoreBase()
    return fetchJSON(`${base}/health`)
  },

  // Session CRUD
  listSessions: async (directory?: string): Promise<SessionListResponse> => {
    const base = await getCoreBase()
    const params = directory ? `?directory=${encodeURIComponent(directory)}` : ""
    return fetchJSON(`${base}/session/list${params}`)
  },

  getSession: async (sessionId: string): Promise<Session> => {
    const base = await getCoreBase()
    return fetchJSON(`${base}/session/get?session_id=${encodeURIComponent(sessionId)}`)
  },

  createSession: async (data: {
    session_id: string
    title: string
    directory: string
    agent: string
    model: string
  }): Promise<Session> => {
    const base = await getCoreBase()
    return fetchJSON(`${base}/session/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    const base = await getCoreBase()
    await fetchJSON(`${base}/session/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    })
  },

  // Session messages
  getMessages: async (sessionId: string): Promise<{ session_id: string; messages: Message[] }> => {
    const base = await getCoreBase()
    return fetchJSON(`${base}/session/messages?session_id=${encodeURIComponent(sessionId)}`)
  },

  // Session events (publish)
  sendEvent: async (sessionId: string, eventType: string, data: Record<string, unknown>): Promise<void> => {
    const base = await getCoreBase()
    await fetch(`${base}/session/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        event_type: eventType,
        data,
      }),
    })
  },

  // Swarm
  runSwarm: async (agents: { id: string; name: string; input: unknown }[]): Promise<SwarmRunResponse> => {
    const base = await getCoreBase()
    return fetchJSON(`${base}/swarm/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agents }),
    })
  },

  // SSE stream for session events
  sseUrl: async (sessionId: string): Promise<string> => {
    const base = await getCoreBase()
    return `${base}/session/events?session_id=${encodeURIComponent(sessionId)}`
  },
}
