// v2 provider parity plugin: model filtering
// Ported from legacy provider.ts model filtering logic (lines 1455-1471)
import { Effect } from "effect"
import { PluginV2 } from "@teamcode-ai/core/plugin"
import { extraPluginRegistrations } from "@teamcode-ai/core/location-layer"
import { RuntimeFlags } from "@/effect/runtime-flags"
import { Config } from "@/config/config"

// Provider IDs used for gpt-5-chat-latest filtering
const WELL_KNOWN_PROVIDERS = ["openai", "github-copilot", "openrouter"] as const

/**
 * Convenience effect that reads application-layer services (RuntimeFlags, Config,
 * PluginV2) and registers the model-filtering hooks via `extraPluginRegistrations`.
 *
 * Run this early during application initialization, before any
 * LocationServiceMap.get() call.
 */
export const setupModelFiltering = Effect.gen(function* () {
  const pluginSvc = yield* PluginV2.Service
  const runtimeFlags = yield* RuntimeFlags.Service
  const config = yield* Config.Service
  const configInfo = yield* config.get()

  extraPluginRegistrations.push(
    registerFilteringHooks(pluginSvc, runtimeFlags, configInfo.provider ?? {}),
  )
})

/**
 * Returns true for models IDs that are chat-latest aliases with special handling
 * in built-in providers. These aliases are filtered out because custom providers
 * are the only valid use case.
 */
function isChatLatestAlias(modelID: string, providerID: string): boolean {
  return (
    (modelID === "gpt-5-chat-latest" &&
      (providerID === "openai" || providerID === "github-copilot" || providerID === "openrouter")) ||
    (providerID === "openrouter" && modelID === "openai/gpt-5-chat")
  )
}

/**
 * Registers the model.update hook that filters models by:
 * 1. gpt-5-chat-latest / openai/gpt-5-chat aliases for well-known providers
 * 2. Alpha/experimental status (unless enableExperimentalModels is set)
 * 3. Deprecated status
 * 4. Config whitelist
 * 5. Config blacklist
 *
 * The hook runs inside PluginV2's `model.update` event, called from
 * catalog.model.update(). By setting `evt.cancel = true`, the model is
 * filtered BEFORE it's stored in the catalog.
 */
export const ModelFilteringPlugin = PluginV2.define({
  id: PluginV2.ID.make("model-filtering-parity"),
  effect: Effect.gen(function* () {
    const flags = yield* RuntimeFlags.Service
    const config = yield* Config.Service
    const configInfo = yield* config.get()

    return {
      "model.update": Effect.fn(function* (evt: PluginV2.Hooks["model.update"]) {
        // 0. gpt-5-chat-latest / openai/gpt-5-chat filtering
        if (isChatLatestAlias(evt.model.id, evt.model.providerID)) {
          evt.cancel = true
          return
        }

        // 1. Alpha / experimental filtering
        if (evt.model.status === "alpha" && !flags.enableExperimentalModels) {
          evt.cancel = true
          return
        }

        // 2. Deprecated filtering
        if (evt.model.status === "deprecated") {
          evt.cancel = true
          return
        }

        // 3 & 4. Config whitelist / blacklist
        const providerConfig = configInfo.provider?.[evt.model.providerID]
        if (providerConfig) {
          if (
            Array.isArray(providerConfig.blacklist) &&
            (providerConfig.blacklist as string[]).includes(evt.model.id)
          ) {
            evt.cancel = true
            return
          }
          if (
            Array.isArray(providerConfig.whitelist) &&
            (providerConfig.whitelist as string[]).length > 0 &&
            !(providerConfig.whitelist as string[]).includes(evt.model.id)
          ) {
            evt.cancel = true
            return
          }
        }
      }),
    }
  }),
})

function registerFilteringHooks(
  pluginSvc: PluginV2.Interface,
  runtimeFlags: RuntimeFlags.Info,
  providerConfigs: Record<string, unknown>,
): Effect.Effect<void> {
  return pluginSvc.add({
    id: PluginV2.ID.make("model-filtering"),
    effect: Effect.succeed({
      "model.update": Effect.fn(function* (evt: PluginV2.Hooks["model.update"]) {
        // 0. gpt-5-chat-latest / openai/gpt-5-chat filtering
        if (isChatLatestAlias(evt.model.id, evt.model.providerID)) {
          evt.cancel = true
          return
        }

        // 1. Alpha / experimental filtering
        if (evt.model.status === "alpha" && !runtimeFlags.enableExperimentalModels) {
          evt.cancel = true
          return
        }

        // 2. Deprecated filtering
        if (evt.model.status === "deprecated") {
          evt.cancel = true
          return
        }

        // 3 & 4. Config whitelist / blacklist
        const providerConfig = providerConfigs[evt.model.providerID] as
          | { whitelist?: string[]; blacklist?: string[] }
          | undefined
        if (providerConfig) {
          if (providerConfig.blacklist?.includes(evt.model.id)) {
            evt.cancel = true
            return
          }
          if (
            providerConfig.whitelist &&
            providerConfig.whitelist.length > 0 &&
            !providerConfig.whitelist.includes(evt.model.id)
          ) {
            evt.cancel = true
            return
          }
        }
      }),
    }),
  })
}
