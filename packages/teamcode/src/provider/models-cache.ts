// ApexStore-backed persistence for the models.dev catalog.
//
// The ModelsDev service in @teamcode-ai/core optionally accepts a ModelCache
// service. When provided, the model catalog is persisted — and reloaded from —
// ApexStore, so the ~1 MiB models.dev response survives application restarts
// and is typically available in under 1 ms on the next launch.
//
// This layer is safe to compose unconditionally: if ApexStore is not available
// in the runtime context, a no-op cache is provided instead, and the model
// catalog falls through to the existing disk/API fetch path.
//
// Usage in layer composition:
//
//   Layer.mergeAll(
//     ModelsDev.defaultLayer,
//     ModelCacheApexStore.layer,
//     ...
//   )

import { Effect, Layer, Option } from "effect"
import { ModelsDev } from "@teamcode-ai/core/models"
import { ApexStore } from "@/storage/apex-store"

export const layer: Layer.Layer<ModelsDev.ModelCache> = Layer.effect(
  ModelsDev.ModelCache,
  Effect.gen(function* () {
    const storeOpt = yield* Effect.serviceOption(ApexStore.Service)
    if (Option.isNone(storeOpt)) {
      return ModelsDev.ModelCache.of({
        get: () => Effect.succeed(null),
        set: () => Effect.void,
      })
    }
    const store = storeOpt.value
    return ModelsDev.ModelCache.of({
      get: (ns, key) => store.cacheGet(ns, key).pipe(Effect.catch(() => Effect.succeed(null))),
      set: (ns, key, value) => store.cacheSet(ns, key, value).pipe(Effect.catch(() => Effect.void)),
    })
  }),
)

export * as ModelCacheApexStore from "./models-cache"
