import type { SQLiteBunDatabase } from "drizzle-orm/bun-sqlite"
import { type SQLiteTransaction } from "drizzle-orm/sqlite-core"
import { migrate as drizzleMigrate } from "drizzle-orm/bun-sqlite/migrator"
import { RuntimeFlags } from "@/effect/runtime-flags"
import { LocalContext } from "@/util/local-context"
import { Global } from "@teamcode-ai/core/global"
import * as Log from "@teamcode-ai/core/util/log"
import path from "path"
import { readFileSync, readdirSync, existsSync, mkdirSync, unlinkSync } from "fs"
import { InstallationChannel } from "@teamcode-ai/core/installation/version"
import { EffectBridge } from "@/effect/bridge"
import { init } from "#db"
import { Effect, Schema } from "effect"

declare const TEAMCODE_MIGRATIONS: { sql: string; timestamp: number; name: string }[] | undefined

export class NotFoundError extends Schema.TaggedErrorClass<NotFoundError>()("NotFoundError", {
  message: Schema.String,
}) {}

const log = Log.create({ service: "db" })

type DatabaseFlags = Pick<RuntimeFlags.Info, "disableChannelDb" | "skipMigrations" | "db">

const readRuntimeFlags = () =>
  Effect.runSync(RuntimeFlags.Service.useSync((flags) => flags).pipe(Effect.provide(RuntimeFlags.defaultLayer)))

export function getChannelPath(flags: Pick<DatabaseFlags, "disableChannelDb"> = readRuntimeFlags()) {
  if (["latest", "beta", "prod"].includes(InstallationChannel) || flags.disableChannelDb)
    return path.join(Global.Path.data, "opencode.db")
  const safe = InstallationChannel.replace(/[^a-zA-Z0-9._-]/g, "-")
  return path.join(Global.Path.data, `opencode-${safe}.db`)
}

export const getPath = (flags?: Pick<DatabaseFlags, "disableChannelDb">) => {
  const runtimeFlags = readRuntimeFlags()
  if (runtimeFlags.db) {
    if (runtimeFlags.db === ":memory:" || path.isAbsolute(runtimeFlags.db)) return runtimeFlags.db
    return path.join(Global.Path.data, runtimeFlags.db)
  }
  return getChannelPath(flags ?? runtimeFlags)
}

export type Transaction = SQLiteTransaction<"sync", void>

type Client = ReturnType<typeof init>

type Journal = { sql: string; timestamp: number; name: string }[]

/**
 * Remove stale WAL/SHM files left by a prior crash. These prevent SQLite
 * from opening the database cleanly and manifest as "malformed database"
 * errors until the user manually deletes .local/teamcode/opencode.db{-wal,-shm}.
 */
function removeStaleWalFiles(dbPath: string) {
  for (const ext of ["-wal", "-shm"]) {
    const p = dbPath + ext
    try {
      if (existsSync(p)) {
        unlinkSync(p)
        log.warn("removed stale WAL file", { path: p })
      }
    } catch {
      // best-effort — another process may hold a lock on -shm
    }
  }
}

/**
 * Attempt integrity_check. If corruption is detected, try WAL truncation first,
 * then stale WAL file removal as last resort. Returns true if repair was needed.
 */
function tryRepairDatabase(db: ReturnType<typeof init>, dbPath: string): boolean {
  try {
    db.run("PRAGMA integrity_check")
    return false
  } catch {
    log.error("database integrity check failed — attempting recovery")
  }

  // First attempt: full WAL checkpoint + truncation
  try {
    db.run("PRAGMA wal_checkpoint(TRUNCATE)")
    db.run("PRAGMA integrity_check")
    log.info("database recovered after WAL truncation")
    return true
  } catch {
    // WAL recovery failed
  }

  // Last resort: close, remove stale -wal/-shm files, and re-open
  db.$client.close()
  removeStaleWalFiles(dbPath)
  const reopened = init(dbPath)
  reopened.run("PRAGMA journal_mode = WAL")
  reopened.run("PRAGMA wal_checkpoint(TRUNCATE)")
  log.warn("database re-opened after removing stale WAL files")
  return true
}

// Drizzle's migrate overloads trigger expensive variance checks here; narrow to the journal overload we actually use.
const migrateFromJournal = drizzleMigrate as unknown as (db: SQLiteBunDatabase, entries: Journal) => void

function applyMigrations(db: SQLiteBunDatabase, entries: Journal) {
  // Normalize SQL so each statement is separated by ;--> statement-breakpoint
  // Required by better-sqlite3 which rejects multi-statement SQL per prepare() call
  const normalized = entries.map((entry) => {
    if (entry.sql.includes("--> statement-breakpoint")) return entry
    const parts = entry.sql.split(";").map((s) => s.trim()).filter(Boolean)
    if (parts.length <= 1) return entry
    return { ...entry, sql: parts.join(";--> statement-breakpoint") }
  })
  migrateFromJournal(db, normalized)
}

function time(tag: string) {
  const match = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/.exec(tag)
  if (!match) return 0
  return Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6]),
  )
}

function migrations(dir: string): Journal {
  const dirs = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)

  const sql = dirs
    .map((name) => {
      const file = path.join(dir, name, "migration.sql")
      if (!existsSync(file)) return
      return {
        sql: readFileSync(file, "utf-8"),
        timestamp: time(name),
        name,
      }
    })
    .filter(Boolean) as Journal

  return sql.sort((a, b) => a.timestamp - b.timestamp)
}

let client: Client | undefined
let loaded = false

export const Client = Object.assign(
  (flags: DatabaseFlags = readRuntimeFlags()): Client => {
    if (loaded) return client as Client

    // Ensure Global paths exist before opening the database
    mkdirSync(Global.Path.data, { recursive: true })

    const dbPath = getPath(flags)
    log.info("opening database", { path: dbPath })

    // Check for stale -wal/-shm files from a prior crash BEFORE opening.
    // If they exist and the DB opens fine, do a TRUNCATE checkpoint to flush them.
    const hadStaleWal = existsSync(dbPath + "-wal") || existsSync(dbPath + "-shm")
    if (hadStaleWal) log.warn("stale WAL journal files detected", { path: dbPath })

    let db: ReturnType<typeof init>
    try {
      db = init(dbPath)
    } catch (err) {
      log.error("failed to open database, attempting WAL recovery", { error: err })
      removeStaleWalFiles(dbPath)
      db = init(dbPath)
      log.warn("database opened after WAL cleanup")
    }

    db.run("PRAGMA journal_mode = WAL")
    db.run("PRAGMA synchronous = NORMAL")
    db.run("PRAGMA busy_timeout = 10000") // increased from 5000 to reduce SQLITE_BUSY under concurrent access
    db.run("PRAGMA cache_size = -64000")
    db.run("PRAGMA foreign_keys = ON")

    // Full WAL checkpoint on open — truncates the WAL so it doesn't grow unbounded
    // between restarts. Use TRUNCATE (mode 2) instead of PASSIVE to really flush it.
    db.run("PRAGMA wal_checkpoint(TRUNCATE)")

    // Verify integrity and repair if needed
    tryRepairDatabase(db, dbPath)

    // Apply schema migrations
    const entries =
      typeof TEAMCODE_MIGRATIONS !== "undefined"
        ? TEAMCODE_MIGRATIONS
        : migrations(path.join(import.meta.dirname, "../../migration"))
    if (entries.length > 0) {
      log.info("applying migrations", {
        count: entries.length,
        mode: typeof TEAMCODE_MIGRATIONS !== "undefined" ? "bundled" : "dev",
      })
      if (flags.skipMigrations) {
        for (const item of entries) {
          item.sql = "select 1;"
        }
      }
      applyMigrations(db, entries)
    }

    client = db
    loaded = true
    return db
  },
  {
    reset: () => {
      loaded = false
      client = undefined
    },
    loaded: () => loaded,
  },
)

/**
 * Close the database cleanly. Runs a full WAL checkpoint + truncation first
 * so the WAL is fully merged on disk, preventing stale -wal/-shm files after
 * a normal exit.
 */
export function close() {
  if (!Client.loaded()) return
  const db = Client()
  try {
    db.run("PRAGMA wal_checkpoint(TRUNCATE)")
  } catch {
    // best-effort checkpoint on close
  }
  db.$client.close()
  Client.reset()
}

export type TxOrDb = Transaction | Client

const ctx = LocalContext.create<{
  tx: TxOrDb
  effects: (() => void | Promise<void>)[]
}>("database")

export function use<T>(callback: (trx: TxOrDb) => T): T {
  try {
    return callback(ctx.use().tx)
  } catch (err) {
    if (err instanceof LocalContext.NotFound) {
      const effects: (() => void | Promise<void>)[] = []
      const result = ctx.provide({ effects, tx: Client() }, () => callback(Client()))
      for (const effect of effects) effect()
      return result
    }
    throw err
  }
}

export function effect(fn: () => any | Promise<any>) {
  const bound = EffectBridge.bind(fn)
  try {
    ctx.use().effects.push(bound)
  } catch {
    bound()
  }
}

type NotPromise<T> = T extends Promise<any> ? never : T

export function transaction<T>(
  callback: (tx: TxOrDb) => NotPromise<T>,
  options?: {
    behavior?: "deferred" | "immediate" | "exclusive"
  },
): NotPromise<T> {
  try {
    return callback(ctx.use().tx)
  } catch (err) {
    if (err instanceof LocalContext.NotFound) {
      const effects: (() => void | Promise<void>)[] = []
      const txCallback = EffectBridge.bind((tx: TxOrDb) => ctx.provide({ tx, effects }, () => callback(tx)))
      const result = Client().transaction(txCallback, { behavior: options?.behavior })
      for (const effect of effects) effect()
      return result as NotPromise<T>
    }
    throw err
  }
}

export * as Database from "./db"
