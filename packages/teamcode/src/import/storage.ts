import { createHash } from "crypto"
import path from "path"
import { eq, sql } from "drizzle-orm"
import { Schema } from "effect"
import { Database } from "@/storage/db"
import { ProjectTable } from "@/project/project.sql"
import { ProjectID } from "@/project/schema"
import { MessageTable, PartTable, SessionTable } from "@/session/session.sql"
import { Session } from "@/session/session"
import { MessageV2 } from "@/session/message-v2"
import type { Normalized } from "./normalizer"

// The only module in `src/import` that touches SQLite. It writes through the same
// drizzle tables the TS `Session` service owns, without changing them (spike §0).
// When M2 routes writes through go-core, this file is what changes.

export type Result = {
  sessionID: Normalized["session"]["id"]
  created: boolean
  messages: number
  parts: number
  skipped: number
}

const decodeSession = Schema.decodeUnknownSync(Session.Info)
const decodeMessage = Schema.decodeUnknownSync(MessageV2.Info)
const decodePart = Schema.decodeUnknownSync(MessageV2.Part)

/** Asserts the normalized payload round-trips through the TeamCode schemas. */
export function validate(normalized: Normalized) {
  decodeSession(normalized.session)
  for (const message of normalized.messages) {
    decodeMessage(message.info)
    for (const part of message.parts) decodePart(part)
  }
  return normalized
}

/**
 * Finds the project whose worktree contains `directory`, or creates a project row for
 * it so the session shows up in the per-project list (spike §5.2). Sessions with no
 * recorded directory go to `fallback`.
 */
export function resolveProject(directory: string, fallback: ProjectID): ProjectID {
  if (!directory) return fallback
  const dir = path.resolve(directory)
  return Database.use((db) => {
    const rows = db.select({ id: ProjectTable.id, worktree: ProjectTable.worktree }).from(ProjectTable).all()
    const match = rows
      .filter((row) => row.id !== ProjectID.global)
      .filter((row) => dir === path.resolve(row.worktree) || dir.startsWith(path.resolve(row.worktree) + path.sep))
      .toSorted((a, b) => b.worktree.length - a.worktree.length)[0]
    if (match) return match.id
    const id = ProjectID.make("ext-" + createHash("sha256").update(dir).digest("hex").slice(0, 16))
    const now = Date.now()
    db.insert(ProjectTable)
      .values({
        id,
        worktree: dir,
        vcs: null,
        name: path.basename(dir),
        sandboxes: [],
        time_created: now,
        time_updated: now,
      })
      .onConflictDoNothing()
      .run()
    return id
  })
}

/**
 * Idempotent, incremental write. Messages whose id already exists are skipped; the
 * newest existing message is refreshed because it may have been imported while its
 * tool calls were still pending. The session row is only touched when something new
 * arrived, so `time_updated` never moves on a no-op re-import (M1 §3.5).
 */
export function upsert(normalized: Normalized): Result {
  const { session, messages } = validate(normalized)
  return Database.transaction((tx) => {
    const existingSession = tx
      .select({ id: SessionTable.id })
      .from(SessionTable)
      .where(eq(SessionTable.id, session.id))
      .get()
    const existing = new Set(
      tx
        .select({ id: MessageTable.id })
        .from(MessageTable)
        .where(eq(MessageTable.session_id, session.id))
        .all()
        .map((row) => row.id),
    )
    const newest = [...existing].toSorted().at(-1)
    const fresh = messages.filter((message) => !existing.has(message.info.id))
    const refresh = messages.filter((message) => message.info.id === newest)
    if (existingSession && fresh.length === 0 && refresh.length === 0) {
      return { sessionID: session.id, created: false, messages: 0, parts: 0, skipped: messages.length }
    }

    const row = Session.toRow(session)
    tx.insert(SessionTable)
      .values(row)
      .onConflictDoUpdate({
        target: SessionTable.id,
        set: {
          title: row.title,
          directory: row.directory,
          version: row.version,
          agent: row.agent,
          model: row.model,
          tokens_input: row.tokens_input,
          tokens_output: row.tokens_output,
          tokens_reasoning: row.tokens_reasoning,
          tokens_cache_read: row.tokens_cache_read,
          tokens_cache_write: row.tokens_cache_write,
          time_updated: sql`max(${SessionTable.time_updated}, ${row.time_updated})`,
        },
      })
      .run()

    let parts = 0
    for (const message of [...fresh, ...refresh]) {
      const { id, sessionID: _s, ...data } = message.info
      tx.insert(MessageTable)
        .values({
          id,
          session_id: session.id,
          time_created: message.info.time.created,
          time_updated: message.info.time.created,
          data,
        })
        .onConflictDoUpdate({ target: MessageTable.id, set: { data } })
        .run()
      for (const part of message.parts) {
        const { id: partID, sessionID: _ps, messageID, ...partData } = part
        const created = partTime(part)
        tx.insert(PartTable)
          .values({
            id: partID,
            message_id: messageID,
            session_id: session.id,
            time_created: created,
            time_updated: partUpdated(part) ?? created,
            data: partData,
          })
          .onConflictDoUpdate({
            target: PartTable.id,
            set: { data: partData, time_updated: partUpdated(part) ?? created },
          })
          .run()
        parts++
      }
    }
    return {
      sessionID: session.id,
      created: !existingSession,
      messages: fresh.length,
      parts,
      skipped: messages.length - fresh.length,
    }
  })
}

function partTime(part: MessageV2.Part) {
  return Number(BigInt("0x" + part.id.slice(4, 16)) / BigInt(0x1000))
}

function partUpdated(part: MessageV2.Part) {
  if (part.type !== "tool") return undefined
  if (part.state.status === "completed" || part.state.status === "error") return part.state.time.end
  return undefined
}

export * as ImportStorage from "./storage"
