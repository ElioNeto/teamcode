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

import { Config, Effect } from "effect"

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

export * as RouterFlag from "./flag"
