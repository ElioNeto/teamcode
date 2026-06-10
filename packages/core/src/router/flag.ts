/**
 * Feature flag system for routing between legacy TypeScript core
 * and new Go core implementation.
 *
 * Usage:
 *   import { flag } from "@teamcode-ai/core/router"
 *
 *   const useGoCore = flag<boolean>("go-core-enabled", false)
 *   if (useGoCore()) {
 *     return yield* goCore.readFile(path)
 *   }
 *   return yield* legacy.readFile(path)
 */

export interface Flag<T> {
  readonly key: string
  readonly defaultValue: T
  readonly isEnabled: (options?: { sessionID?: string }) => boolean
}

const registry = new Map<string, Flag<unknown>>()

/**
 * Define a feature flag with a default value.
 * Flags can be overridden via environment variables:
 *   FLAG_go_core_enabled=true
 *   FLAG_go_core_filesystem=0.05  (5% canary)
 */
export function flag<T extends boolean | number>(
  key: string,
  defaultValue: T,
): Flag<T> {
  const existing = registry.get(key)
  if (existing) return existing as Flag<T>

  const envKey = `FLAG_${key.replace(/-/g, "_")}`
  const envValue = typeof process !== "undefined" ? process.env[envKey] : undefined

  let parsedDefault: T
  if (envValue !== undefined) {
    if (typeof defaultValue === "boolean") {
      parsedDefault = (envValue === "true" || envValue === "1") as T
    } else {
      parsedDefault = Number(envValue) as T
    }
  } else {
    parsedDefault = defaultValue
  }

  const f: Flag<T> = {
    key,
    defaultValue: parsedDefault,
    isEnabled: (options) => {
      // For numeric flags (canary percentage), use sessionID for consistent routing
      if (typeof parsedDefault === "number") {
        if (!options?.sessionID) return parsedDefault > 0
        const hash = hashString(options.sessionID)
        return (hash % 100) < parsedDefault
      }
      return parsedDefault as boolean
    },
  }

  registry.set(key, f)
  return f
}

function hashString(s: string): number {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * List all registered flags and their current values.
 */
export function listFlags(): Array<{ key: string; value: unknown }> {
  return Array.from(registry.entries()).map(([key, flag]) => ({
    key,
    value: flag.defaultValue,
  }))
}

// ---------------------------------------------------------------------------
// Shadow mode — run Go in parallel, compare results, always use TS output
// ---------------------------------------------------------------------------

const shadowRegistry = new Map<string, boolean>()
const flagOverride = new Map<string, string | number | boolean>()

/**
 * Check if a module is in shadow mode.
 *
 * Shadow mode can be enabled via environment variable:
 *   FLAG_filesystem_shadow=true
 *
 * Or programmatically via setFlag():
 *   setFlag("go-core-filesystem", "shadow")
 */
export function isShadow(module: string): boolean {
  const fromOverride = shadowRegistry.get(module)
  if (fromOverride !== undefined) return fromOverride

  const envKey = `FLAG_${module}_shadow`
  const envValue = typeof process !== "undefined" ? process.env[envKey] : undefined
  return envValue === "true" || envValue === "1"
}

/**
 * Get the current value of a flag (respecting runtime overrides).
 */
export function getFlag(key: string): string | number | boolean | undefined {
  if (flagOverride.has(key)) return flagOverride.get(key)

  const f = registry.get(key)
  if (!f) return undefined
  return f.defaultValue as string | number | boolean
}

/**
 * Set a flag value at runtime (overrides env vars and defaults).
 * Used by circuit breaker to disable flags on error.
 *
 * Set to undefined to clear the override.
 */
export function setFlag(key: string, value: string | number | boolean): void {
  flagOverride.set(key, value)
}

/**
 * Clear a runtime flag override (reverts to env var / registered default).
 */
export function clearFlag(key: string): void {
  flagOverride.delete(key)
}

/**
 * Enable or disable shadow mode for a module at runtime.
 * Use clearFlag to reset shadow mode.
 */
export function setShadow(module: string, enabled: boolean): void {
  shadowRegistry.set(module, enabled)
}

/**
 * Clear a shadow mode override (reverts to env var).
 */
export function clearShadow(module: string): void {
  shadowRegistry.delete(module)
}

export * as RouterFlag from "./flag"
