// Effect service layer for ApexStore.
//
// Wraps the raw ApexStoreClient (async/await) behind proper Effect
// interfaces with lifecycle management via acquireRelease.

import { Effect, Context, Layer, Schema } from "effect"
import { startSidecar, type SidecarOptions } from "./sidecar"
import { ApexStoreClient } from "./client"
import type { ApexStoreStats, AdminCompactResult } from "./client"

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface ApexStoreConfig {
  readonly enabled: boolean
  readonly dataDir?: string
  readonly port?: number
  readonly memtableMaxSize?: number
  readonly blockCacheSizeMb?: number
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class ApexStoreError extends Schema.TaggedErrorClass<ApexStoreError>()("ApexStoreError", {
  message: Schema.String,
}) {}

// ---------------------------------------------------------------------------
// Service interface
// ---------------------------------------------------------------------------

export interface ApexStoreInterface {
  readonly get: (key: string) => Effect.Effect<string | null, ApexStoreError>
  readonly set: (key: string, value: string) => Effect.Effect<void, ApexStoreError>
  readonly delete: (key: string) => Effect.Effect<void, ApexStoreError>
  readonly list: (prefix?: string, limit?: number) => Effect.Effect<string[], ApexStoreError>
  readonly health: () => Effect.Effect<boolean>
  readonly stats: () => Effect.Effect<ApexStoreStats | null>
  readonly compact: () => Effect.Effect<AdminCompactResult, ApexStoreError>
  readonly cacheGet: (namespace: string, key: string) => Effect.Effect<string | null, ApexStoreError>
  readonly cacheSet: (namespace: string, key: string, value: string) => Effect.Effect<void, ApexStoreError>
  readonly cacheDelete: (namespace: string, key: string) => Effect.Effect<void, ApexStoreError>
  readonly cacheList: (namespace: string) => Effect.Effect<string[], ApexStoreError>
}

export class Service extends Context.Service<Service, ApexStoreInterface>()("@teamcode/ApexStore") {}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CACHE_PREFIX = "tc:cache:"

const tryCatch = <A>(f: () => Promise<A>): Effect.Effect<A, ApexStoreError> =>
  Effect.tryPromise({ try: f, catch: (err) => new ApexStoreError({ message: String(err) }) })

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

function makeService(client: ApexStoreClient): ApexStoreInterface {
  return {
    get: (key) => tryCatch(() => client.get(key)),
    set: (key, value) => tryCatch(() => client.set(key, value)),
    delete: (key) => tryCatch(() => client.delete(key)),
    list: (prefix, limit) => tryCatch(() => client.list(prefix, limit)),
    health: () => Effect.promise(() => client.health()).pipe(Effect.catch(() => Effect.succeed(false))),
    stats: () =>
      Effect.tryPromise({ try: () => client.stats() as Promise<ApexStoreStats>, catch: () => null }).pipe(
        Effect.catch(() => Effect.succeed(null as ApexStoreStats | null)),
      ),
    compact: () => tryCatch(() => client.compact()),
    cacheGet: (ns, key) => tryCatch(() => client.get(`${CACHE_PREFIX}${ns}:${key}`)),
    cacheSet: (ns, key, value) => tryCatch(() => client.set(`${CACHE_PREFIX}${ns}:${key}`, value)),
    cacheDelete: (ns, key) => tryCatch(() => client.delete(`${CACHE_PREFIX}${ns}:${key}`)),
    cacheList: (ns) =>
      tryCatch(() =>
        client.list(`${CACHE_PREFIX}${ns}:`).then((keys) =>
          keys.map((k: string) => k.slice(`${CACHE_PREFIX}${ns}:`.length)),
        ),
      ),
  }
}

// ---------------------------------------------------------------------------
// Layer
// ---------------------------------------------------------------------------

/**
 * Live layer that starts the ApexStore sidecar process and provides
 * the service. The sidecar is started on acquisition and killed on release.
 * Disabled by default — enable via config.
 */
export const layer = (config: ApexStoreConfig) =>
  Layer.effect(
    Service,
    Effect.gen(function* () {
      if (!config.enabled) {
        return Service.of(makeService(new ApexStoreClient({
          host: "127.0.0.1",
          port: config.port ?? 8080,
        })))
      }

      const sidecarOpts: SidecarOptions = {
        dataDir: config.dataDir ?? "",
        port: config.port,
        memtableMaxSize: config.memtableMaxSize,
        blockCacheSizeMb: config.blockCacheSizeMb,
      }

      const handle = yield* Effect.acquireRelease(
        Effect.tryPromise({
          try: () => startSidecar(sidecarOpts),
          catch: (err) => new ApexStoreError({ message: `Failed to start ApexStore: ${err}` }),
        }),
        (h) => Effect.promise(() => h.stop()),
      )

      return Service.of(makeService(handle.client))
    }),
  )

/**
 * No-op layer for when ApexStore is disabled or unavailable.
 */
const noopImpl: ApexStoreInterface = {
  get: () => Effect.succeed(null),
  set: () => Effect.void,
  delete: () => Effect.void,
  list: () => Effect.succeed([]),
  health: () => Effect.succeed(false),
  stats: () => Effect.succeed(null),
  compact: () => Effect.succeed({ compactions: [] }),
  cacheGet: () => Effect.succeed(null),
  cacheSet: () => Effect.void,
  cacheDelete: () => Effect.void,
  cacheList: () => Effect.succeed([]),
}

export const noopLayer = Layer.succeed(Service, Service.of(noopImpl))

export * as ApexStoreService from "./service"
