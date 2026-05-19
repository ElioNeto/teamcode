import { Effect, Layer, LayerMap } from "effect"
import { Location } from "./location"
import { Catalog } from "./catalog"
import { PluginBoot } from "./plugin/boot"

/**
 * Extra plugin registrations that run before ModelsDevPlugin in every location.
 * The host application (e.g. teamcode) should populate this array during init
 * with effects that capture application-layer services (Config, RuntimeFlags)
 * and register hooks via PluginV2.Service.add().
 *
 * Each effect must have type Effect<void, never, never> — any required services
 * should be captured in a closure, not yielded.
 */
export const extraPluginRegistrations: Effect.Effect<void, never, never>[] = []

export class LocationServiceMap extends LayerMap.Service<LocationServiceMap>()("@opencode/example/LocationServiceMap", {
  lookup: (ref: Location.Ref) => {
    const location = Layer.succeed(Location.Service, Location.Service.of(ref))
    const base = Layer.mergeAll(Catalog.defaultLayer, PluginBoot.defaultLayer)
    if (extraPluginRegistrations.length > 0) {
      return Layer.mergeAll(base, Layer.succeed(PluginBoot.ExtraPlugins, extraPluginRegistrations)).pipe(
        Layer.provide(location),
      )
    }
    return base.pipe(Layer.provide(location))
  },
  idleTimeToLive: "5 minutes",
}) {}
