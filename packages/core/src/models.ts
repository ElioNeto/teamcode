import path from "path"
import { Context, Duration, Effect, Layer, Option, Schedule, Schema } from "effect"
import { FetchHttpClient, HttpClient, HttpClientRequest } from "effect/unstable/http"
import { Global } from "./global"
import { Flag } from "./flag/flag"
import { Flock } from "./util/flock"
import { Hash } from "./util/hash"
import { AppFileSystem } from "./filesystem"
import { InstallationChannel, InstallationVersion } from "./installation/version"

// ---------------------------------------------------------------------------
// Optional cache service — provided by the host application (e.g. ApexStore
// in the teamcode package) to make the model catalog survive restarts.
// ---------------------------------------------------------------------------

export interface ModelCacheInterface {
  readonly get: (ns: string, key: string) => Effect.Effect<string | null>
  readonly set: (ns: string, key: string, value: string) => Effect.Effect<void>
}

export class ModelCache extends Context.Service<ModelCache, ModelCacheInterface>()("@opencode/ModelCache") {}

const noopModelCache: ModelCacheInterface = {
  get: () => Effect.succeed(null),
  set: () => Effect.void,
}

export const noopModelCacheLayer = Layer.succeed(ModelCache, ModelCache.of(noopModelCache))

export const CatalogModelStatus = Schema.Literals(["alpha", "beta", "deprecated"])
export type CatalogModelStatus = typeof CatalogModelStatus.Type

const USER_AGENT = `opencode/${InstallationChannel}/${InstallationVersion}/${Flag.TEAMCODE_CLIENT}`

const CostTier = Schema.Struct({
  input: Schema.Finite,
  output: Schema.Finite,
  cache_read: Schema.optional(Schema.Finite),
  cache_write: Schema.optional(Schema.Finite),
  tier: Schema.Struct({
    type: Schema.Literal("context"),
    size: Schema.Finite,
  }),
})

const Cost = Schema.Struct({
  input: Schema.Finite,
  output: Schema.Finite,
  cache_read: Schema.optional(Schema.Finite),
  cache_write: Schema.optional(Schema.Finite),
  tiers: Schema.optional(Schema.Array(CostTier)),
  context_over_200k: Schema.optional(
    Schema.Struct({
      input: Schema.Finite,
      output: Schema.Finite,
      cache_read: Schema.optional(Schema.Finite),
      cache_write: Schema.optional(Schema.Finite),
    }),
  ),
})

export const Model = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  family: Schema.optional(Schema.String),
  release_date: Schema.String,
  attachment: Schema.Boolean,
  reasoning: Schema.Boolean,
  temperature: Schema.Boolean,
  tool_call: Schema.Boolean,
  interleaved: Schema.optional(
    Schema.Union([
      Schema.Literal(true),
      Schema.Struct({
        field: Schema.Literals(["reasoning_content", "reasoning_details"]),
      }),
    ]),
  ),
  cost: Schema.optional(Cost),
  limit: Schema.Struct({
    context: Schema.Finite,
    input: Schema.optional(Schema.Finite),
    output: Schema.Finite,
  }),
  modalities: Schema.optional(
    Schema.Struct({
      input: Schema.Array(Schema.Literals(["text", "audio", "image", "video", "pdf"])),
      output: Schema.Array(Schema.Literals(["text", "audio", "image", "video", "pdf"])),
    }),
  ),
  experimental: Schema.optional(
    Schema.Struct({
      modes: Schema.optional(
        Schema.Record(
          Schema.String,
          Schema.Struct({
            cost: Schema.optional(Cost),
            provider: Schema.optional(
              Schema.Struct({
                body: Schema.optional(Schema.Record(Schema.String, Schema.MutableJson)),
                headers: Schema.optional(Schema.Record(Schema.String, Schema.String)),
              }),
            ),
          }),
        ),
      ),
    }),
  ),
  status: Schema.optional(CatalogModelStatus),
  provider: Schema.optional(
    Schema.Struct({ npm: Schema.optional(Schema.String), api: Schema.optional(Schema.String) }),
  ),
})
export type Model = Schema.Schema.Type<typeof Model>

export const Provider = Schema.Struct({
  api: Schema.optional(Schema.String),
  name: Schema.String,
  env: Schema.Array(Schema.String),
  id: Schema.String,
  npm: Schema.optional(Schema.String),
  models: Schema.Record(Schema.String, Model),
})

export type Provider = Schema.Schema.Type<typeof Provider>

export interface Interface {
  readonly get: () => Effect.Effect<Record<string, Provider>>
  readonly refresh: (force?: boolean) => Effect.Effect<void>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/ModelsDev") {}

type Requirements = AppFileSystem.Service | HttpClient.HttpClient

export const layer: Layer.Layer<Service, never, Requirements> = Layer.effect(
  Service,
  Effect.gen(function* () {
    const fs = yield* AppFileSystem.Service
    const http = HttpClient.filterStatusOk(
      (yield* HttpClient.HttpClient).pipe(
        HttpClient.retryTransient({
          retryOn: "errors-and-responses",
          times: 2,
          schedule: Schedule.exponential(200).pipe(Schedule.jittered),
        }),
      ),
    )

    const source = Flag.TEAMCODE_MODELS_URL || "https://models.dev"
    const filepath = path.join(
      Global.Path.cache,
      source === "https://models.dev" ? "models.json" : `models-${Hash.fast(source)}.json`,
    )
    const ttl = Duration.minutes(60)
    const lockKey = `models-dev:${filepath}`

    const fresh = Effect.fnUntraced(function* () {
      const stat = yield* fs.stat(filepath).pipe(Effect.catch(() => Effect.succeed(undefined)))
      if (!stat) return false
      const mtime = Option.getOrElse(stat.mtime, () => new Date(0)).getTime()
      return Date.now() - mtime < Duration.toMillis(ttl)
    })

    const fetchApi = Effect.fn("ModelsDev.fetchApi")(function* () {
      return yield* HttpClientRequest.get(`${source}/api.json`).pipe(
        HttpClientRequest.setHeader("User-Agent", USER_AGENT),
        http.execute,
        Effect.flatMap((res) => res.text),
        Effect.timeout("10 seconds"),
      )
    })

    const loadFromDisk = fs.readJson(Flag.TEAMCODE_MODELS_PATH ?? filepath).pipe(
      Effect.catch(() => Effect.succeed(undefined)),
      Effect.map((v) => v as Record<string, Provider> | undefined),
    )

    // Bundled at build time; absent in dev — `tryPromise` covers both.
    const loadSnapshot = Effect.tryPromise({
      // @ts-ignore — generated at build time, may not exist in dev
      try: () => import("./models-snapshot.js").then((m) => m.snapshot as Record<string, Provider> | undefined),
      catch: () => undefined,
    }).pipe(Effect.catch(() => Effect.succeed(undefined)))

    const fetchAndWrite = Effect.fn("ModelsDev.fetchAndWrite")(function* () {
      const text = yield* fetchApi()
      yield* fs.writeWithDirs(filepath, text)
      return text
    })

    const populate = Effect.gen(function* () {
      // Check the optional persistent cache (e.g. ApexStore) before disk/API.
      // This survives restarts, unlike the file-system cache which is per-machine.
      const cacheOpt = yield* Effect.serviceOption(ModelCache)
      if (Option.isSome(cacheOpt)) {
        const cached = yield* cacheOpt.value.get("models", "catalog").pipe(
          Effect.catch(() => Effect.succeed(null)),
        )
        if (cached) {
          const parsed = JSON.parse(cached) as { fetchedAt: number; data: Record<string, Provider> | undefined }
          if (parsed.data && Date.now() - parsed.fetchedAt < Duration.toMillis(ttl)) {
            return parsed.data
          }
        }
      }

      const fromDisk = yield* loadFromDisk
      if (fromDisk) return fromDisk
      const snapshot = yield* loadSnapshot
      if (snapshot) return snapshot
      if (Flag.TEAMCODE_DISABLE_MODELS_FETCH) return {}
      // Flock is cross-process: concurrent opencode CLIs can race on this cache file.
      // Use a per-file lock with a timeout matching the TTL so stale lock holders
      // do not block process startup for more than 60 seconds.
      const text = yield* Effect.scoped(
        Effect.gen(function* () {
          yield* Flock.effect(lockKey, { timeoutMs: 60_000, staleMs: 60_000 })
          return yield* fetchAndWrite()
        }),
      )
      const data = JSON.parse(text) as Record<string, Provider>

      // Persist to the optional cache (fire-and-forget).
      if (Option.isSome(cacheOpt)) {
        yield* cacheOpt.value
          .set("models", "catalog", JSON.stringify({ fetchedAt: Date.now(), data }))
          .pipe(Effect.catch(() => Effect.void))
      }

      return data
    }).pipe(Effect.withSpan("ModelsDev.populate"), Effect.orDie)

    const [cachedGet, invalidate] = yield* Effect.cachedInvalidateWithTTL(populate, Duration.infinity)

    const get = (): Effect.Effect<Record<string, Provider>> => cachedGet

    const refresh = Effect.fn("ModelsDev.refresh")(function* (force = false) {
      if (!force && (yield* fresh())) return
      const cacheOpt = yield* Effect.serviceOption(ModelCache)
      yield* Effect.scoped(
        Effect.gen(function* () {
          yield* Flock.effect(lockKey)
          // Re-check under the lock: another process may have refreshed between
          // our outer check and lock acquisition.
          if (!force && (yield* fresh())) return
          const text = yield* fetchAndWrite()
          yield* invalidate
          // Keep the persistent cache in sync so refresh + subsequent get()
          // returns the latest data rather than stale ApexStore content.
          if (Option.isSome(cacheOpt)) {
            yield* Effect.forkScoped(
              cacheOpt.value
                .set("models", "catalog", JSON.stringify({ fetchedAt: Date.now(), data: JSON.parse(text) }))
                .pipe(Effect.catch(() => Effect.void)),
            )
          }
        }),
      ).pipe(
        Effect.tapCause((cause) =>
          Effect.logError("Failed to fetch models.dev").pipe(Effect.annotateLogs("cause", cause)),
        ),
        Effect.ignore,
      )
    })

    if (!Flag.TEAMCODE_DISABLE_MODELS_FETCH && !process.argv.includes("--get-yargs-completions")) {
      // Schedule.spaced runs the effect once, then waits between completions.
      yield* Effect.forkScoped(refresh().pipe(Effect.repeat(Schedule.spaced("60 minutes")), Effect.ignore))
    }

    return Service.of({ get, refresh })
  }),
)

export const defaultLayer: Layer.Layer<Service> = layer.pipe(
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(AppFileSystem.defaultLayer),
)

export * as ModelsDev from "./models"
