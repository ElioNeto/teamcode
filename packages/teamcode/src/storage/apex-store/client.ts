/** HTTP REST client for the ApexStore LSM-Tree KV engine */

export interface ApexStoreConfig {
  host?: string
  port?: number
  token?: string
}

export interface ApexStoreStats {
  sst_files: number
  sst_kb: number
  mem_records: number
  mem_kb: number
  wal_kb: number
  total_records: number
  max_levels_reached: number
}

export interface AdminCompactResult {
  compactions: Array<{
    cf: string
    files_merged: number
    bytes_read: number
    bytes_written: number
  }>
}

export class ApexStoreClient {
  private baseUrl: string
  private headers: Record<string, string>

  constructor(config: ApexStoreConfig = {}) {
    const host = config.host ?? "127.0.0.1"
    const port = config.port ?? 8080
    this.baseUrl = `http://${host}:${port}`
    // ApexStore uses actix-web-httpauth which requires a Bearer token
    // header to be present in ALL requests, even when auth is disabled.
    // When auth is disabled, any non-empty token passes validation.
    this.headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.token ?? "teamcode-apexstore"}`,
    }
  }

  // KV Operations

  async get(key: string): Promise<string | null> {
    const res = await fetch(`${this.baseUrl}/keys/${encodeURIComponent(key)}`, {
      method: "GET",
      headers: this.headers,
      signal: AbortSignal.timeout(5000),
    })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`ApexStore GET failed: ${res.status} ${await res.text()}`)
    const data = await res.json()
    return data.value ?? null
  }

  async set(key: string, value: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/keys/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`ApexStore SET failed: ${res.status} ${await res.text()}`)
  }

  async delete(key: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/keys/${encodeURIComponent(key)}`, {
      method: "DELETE",
      headers: this.headers,
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`ApexStore DELETE failed: ${res.status} ${await res.text()}`)
  }

  async list(prefix?: string, limit?: number): Promise<string[]> {
    const params = new URLSearchParams()
    if (prefix) params.set("prefix", prefix)
    if (limit !== undefined) params.set("limit", String(limit))
    const url = `${this.baseUrl}/keys${params.toString() ? `?${params}` : ""}`
    const res = await fetch(url, {
      method: "GET",
      headers: this.headers,
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`ApexStore LIST failed: ${res.status} ${await res.text()}`)
    const data = await res.json()
    return data.keys ?? []
  }

  // Health & Metrics

  async health(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health/liveness`, {
        method: "GET",
        headers: this.headers,
        signal: AbortSignal.timeout(3000),
      })
      return res.ok
    } catch {
      return false
    }
  }

  async readiness(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health/readiness`, {
        method: "GET",
        headers: this.headers,
        signal: AbortSignal.timeout(3000),
      })
      return res.ok
    } catch {
      return false
    }
  }

  async stats(): Promise<ApexStoreStats> {
    const res = await fetch(`${this.baseUrl}/stats`, {
      method: "GET",
      headers: this.headers,
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`ApexStore STATS failed: ${res.status}`)
    return res.json()
  }

  // Admin

  async flush(): Promise<void> {
    const res = await fetch(`${this.baseUrl}/admin/flush`, {
      method: "POST",
      headers: this.headers,
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) throw new Error(`ApexStore FLUSH failed: ${res.status}`)
  }

  async compact(): Promise<AdminCompactResult> {
    const res = await fetch(`${this.baseUrl}/admin/compact`, {
      method: "POST",
      headers: this.headers,
      signal: AbortSignal.timeout(300000), // compaction can take a while
    })
    if (!res.ok) throw new Error(`ApexStore COMPACT failed: ${res.status}`)
    return res.json()
  }

  async close(): Promise<void> {
    // no-op for HTTP client; the server handles its own lifecycle
  }
}
