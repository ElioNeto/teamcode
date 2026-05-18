// Shared Memory — ephemeral, swarm-scoped knowledge store.
//
// Swarm agents use this module to share context, findings, and intermediate
// results. Every write publishes a bus event so the observability layer and
// other subscribers can react.
//
// Entries are stored in-memory and scoped to the current InstanceState
// (per-project directory). When the instance disposes, all entries are lost.
import { Bus } from "@/bus"
import { BusEvent } from "@/bus/bus-event"
import { Effect, Layer, Schema, Context } from "effect"
import * as Log from "@teamcode-ai/core/util/log"

const log = Log.create({ service: "memory" })

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export const Event = {
  Written: BusEvent.define(
    "memory.written",
    Schema.Struct({
      key: Schema.String,
      source: Schema.String,
      tags: Schema.optional(Schema.Array(Schema.String)),
      timestamp: Schema.Finite,
    }),
  ),
  Cleared: BusEvent.define(
    "memory.cleared",
    Schema.Struct({
      source: Schema.String,
      timestamp: Schema.Finite,
    }),
  ),
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const MemoryEntry = Schema.Struct({
  key: Schema.String,
  value: Schema.String,
  source: Schema.String,
  tags: Schema.Array(Schema.String),
  timestamp: Schema.Finite,
})
export type MemoryEntry = Schema.Schema.Type<typeof MemoryEntry>

export const WriteInput = Schema.Struct({
  key: Schema.String,
  value: Schema.String,
  source: Schema.String,
  tags: Schema.optional(Schema.Array(Schema.String)),
})
export type WriteInput = Schema.Schema.Type<typeof WriteInput>

export const SearchQuery = Schema.Struct({
  key: Schema.optional(Schema.String),
  tag: Schema.optional(Schema.String),
  source: Schema.optional(Schema.String),
  limit: Schema.optional(Schema.Finite),
})
export type SearchQuery = Schema.Schema.Type<typeof SearchQuery>

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export interface Interface {
  /** Write a value to shared memory. */
  readonly write: (input: WriteInput) => Effect.Effect<MemoryEntry>
  /** Read the latest entry for a key. */
  readonly read: (key: string) => Effect.Effect<MemoryEntry | undefined>
  /** Search entries by key pattern, tag, or source. */
  readonly search: (query: SearchQuery) => Effect.Effect<readonly MemoryEntry[]>
  /** List all entries. */
  readonly entries: () => Effect.Effect<readonly MemoryEntry[]>
  /** Clear all entries. */
  readonly clear: (source: string) => Effect.Effect<void>
  /** Remove a single entry. */
  readonly remove: (key: string) => Effect.Effect<boolean>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/SharedMemory") {}

// ---------------------------------------------------------------------------
// Layer
// ---------------------------------------------------------------------------

export const layer: Layer.Layer<Service, never, Bus.Service> = Layer.effect(
  Service,
  Effect.gen(function* () {
    const bus = yield* Bus.Service

    // In-memory store: Map<key, MemoryEntry>  (latest write per key wins)
    const store = new Map<string, MemoryEntry>()

    // -----------------------------------------------------------------------
    // write
    // -----------------------------------------------------------------------

    const write = Effect.fn("Memory.write")(function* (input: WriteInput) {
      const entry: MemoryEntry = {
        key: input.key,
        value: input.value,
        source: input.source,
        tags: input.tags ?? [],
        timestamp: Date.now(),
      }
      store.set(input.key, entry)

      yield* bus.publish(Event.Written, {
        key: input.key,
        source: input.source,
        tags: entry.tags.length > 0 ? entry.tags : undefined,
        timestamp: entry.timestamp,
      })

      log.info("memory written", { key: input.key, source: input.source })
      return entry
    })

    // -----------------------------------------------------------------------
    // read
    // -----------------------------------------------------------------------

    const read = Effect.fn("Memory.read")(function* (key: string) {
      return store.get(key)
    })

    // -----------------------------------------------------------------------
    // search
    // -----------------------------------------------------------------------

    const search = Effect.fn("Memory.search")(function* (query: SearchQuery) {
      let results = Array.from(store.values())

      if (query.key) {
        const pattern = query.key.replace(/\*/g, ".*").toLowerCase()
        results = results.filter((e) => e.key.toLowerCase().match(pattern))
      }
      if (query.tag) {
        results = results.filter((e) => e.tags.some((t) => t.toLowerCase() === query.tag!.toLowerCase()))
      }
      if (query.source) {
        results = results.filter((e) => e.source.toLowerCase() === query.source!.toLowerCase())
      }

      // Sort by most recent first
      results.sort((a, b) => b.timestamp - a.timestamp)

      if (query.limit && query.limit > 0) {
        results = results.slice(0, query.limit)
      }

      return results
    })

    // -----------------------------------------------------------------------
    // entries
    // -----------------------------------------------------------------------

    const entries = Effect.fn("Memory.entries")(function* () {
      return Array.from(store.values()).sort((a, b) => b.timestamp - a.timestamp)
    })

    // -----------------------------------------------------------------------
    // clear
    // -----------------------------------------------------------------------

    const clear = Effect.fn("Memory.clear")(function* (source: string) {
      store.clear()
      yield* bus.publish(Event.Cleared, { source, timestamp: Date.now() })
      log.info("memory cleared", { source })
    })

    // -----------------------------------------------------------------------
    // remove
    // -----------------------------------------------------------------------

    const remove = Effect.fn("Memory.remove")(function* (key: string) {
      return store.delete(key)
    })

    return Service.of({ write, read, search, entries, clear, remove })
  }),
)

export const defaultLayer = layer

export * as SharedMemory from "."
