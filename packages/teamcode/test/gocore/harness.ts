import { Database } from "bun:sqlite"
import fs from "fs"
import net from "net"
import os from "os"
import path from "path"

export function goCoreBinary(): string | undefined {
  const binary = process.env["GO_CORE_BINARY"]
  if (!binary || !fs.existsSync(binary)) return undefined
  return binary
}

export function useSharedGocoreDatabase(): () => void {
  const dir = path.join(process.env["XDG_DATA_HOME"] ?? os.tmpdir(), "gocore")
  fs.mkdirSync(dir, { recursive: true })
  const before = process.env["TEAMCODE_DB"]
  process.env["TEAMCODE_DB"] = path.join(dir, "opencode.db")
  return () => {
    if (before === undefined) delete process.env["TEAMCODE_DB"]
    else process.env["TEAMCODE_DB"] = before
  }
}

async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.listen(0, "127.0.0.1", () => {
      const address = server.address()
      server.close(() => (typeof address === "object" && address ? resolve(address.port) : reject(new Error("no port"))))
    })
  })
}

export async function startGoCore(input: { dbPath: string }) {
  const binary = goCoreBinary()
  if (!binary) throw new Error("GO_CORE_BINARY not set")
  const port = await freePort()
  const proc = Bun.spawn([binary], {
    env: { ...process.env, GO_CORE_PORT: String(port), TEAMCODE_DB: input.dbPath, GO_CORE_PARENT_PID: String(process.pid) },
    stdout: "pipe",
    stderr: "pipe",
  })
  const baseUrl = `http://127.0.0.1:${port}`
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const resp = await fetch(`${baseUrl}/health`)
      if (resp.ok) {
        const body = (await resp.json()) as { status: string }
        if (body.status !== "ok") throw new Error(`go-core health ${body.status}`)
        return {
          baseUrl,
          stop: async () => {
            proc.kill()
            await proc.exited
          },
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("go-core health")) {
        proc.kill()
        throw error
      }
    }
    await new Promise((r) => setTimeout(r, 100))
  }
  proc.kill()
  throw new Error("go-core did not become healthy")
}

export async function api(baseUrl: string, method: string, path: string, body?: unknown) {
  const resp = await fetch(baseUrl + path, {
    method,
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await resp.text()
  if (!resp.ok) throw new Error(`${method} ${path} -> ${resp.status} ${text}`)
  return text ? JSON.parse(text) : undefined
}

type Row = Record<string, unknown>

const idColumns = new Set(["id", "session_id", "message_id", "parent_id"])
const ignoredColumns = new Set(["slug"])

type TimePolicy = "exact" | "order" | "presence"

const timePolicies: Record<string, Record<string, TimePolicy>> = {
  session: { time_created: "presence", time_updated: "presence", time_compacting: "presence", time_archived: "presence" },
  message: { time_created: "exact", time_updated: "presence" },
  part: { time_created: "order", time_updated: "presence" },
  todo: { time_created: "presence", time_updated: "presence" },
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseObject(value: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(value)
  return isRecord(parsed) ? parsed : {}
}

function normalizeIDs(value: string, idMap: Map<string, string>): string {
  let out = value
  for (const [from, to] of idMap) out = out.split(from).join(to)
  return out
}

function atLeastCreated(row: Row, value: unknown): boolean | null {
  const created = row["time_created"]
  if (typeof value !== "number" || typeof created !== "number") return null
  return value >= created
}

export function dumpTables(dbPath: string) {
  const db = new Database(dbPath, { readonly: true })
  const idMap = new Map<string, string>()
  const label = (prefix: string, rows: Row[], key: string) => rows.forEach((row, i) => idMap.set(String(row[key]), `${prefix}#${i}`))
  const sessions = db.query("SELECT * FROM session ORDER BY time_created, title").all() as Row[]
  const messages = db.query("SELECT * FROM message ORDER BY time_created, id").all() as Row[]
  const parts = db.query("SELECT * FROM part ORDER BY time_created, id").all() as Row[]
  const todos = db.query("SELECT * FROM todo ORDER BY session_id, position").all() as Row[]
  label("ses", sessions, "id")
  label("msg", messages, "id")
  label("prt", parts, "id")
  db.close()
  const strip = (table: string, rows: Row[]) => {
    const policies = timePolicies[table] ?? {}
    return rows.map((row, position) => {
      const out: Row = {}
      for (const [column, value] of Object.entries(row)) {
        if (ignoredColumns.has(column)) continue
        if (idColumns.has(column)) {
          if (typeof value === "string" && idMap.has(value)) out[column] = idMap.get(value)
          continue
        }
        const policy = policies[column]
        if (policy === "exact") {
          out[column] = value
          continue
        }
        if (policy === "order") {
          out[column] = typeof value === "number" ? `t#${position}` : value
          continue
        }
        if (policy === "presence") {
          out[`${column}_present`] = value !== null
          if (column === "time_updated") out["time_updated_ge_created"] = atLeastCreated(row, value)
          continue
        }
        if (column === "data" && typeof value === "string") {
          out[column] = parseObject(normalizeIDs(value, idMap))
          continue
        }
        out[column] = value
      }
      return out
    })
  }
  return { sessions: strip("session", sessions), messages: strip("message", messages), parts: strip("part", parts), todos: strip("todo", todos) }
}
