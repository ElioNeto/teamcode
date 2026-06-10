/**
 * Router module — feature flags, Go core client, and shadow routing.
 *
 * This file is the entry point for `@teamcode-ai/core/router`.
 * Shadow mode runs both legacy TS and Go core in parallel,
 * compares results, and always returns the TS output.
 * Divergences are logged with a trace ID for debugging.
 */

import { isShadow } from "./router/flag"

export { flag, listFlags, isShadow, setShadow, clearShadow, getFlag, setFlag, clearFlag } from "./router/flag"
export type { Flag } from "./router/flag"
export { GoCoreClient } from "./router/client"
export type {
  GoCoreReadResult,
  GoCoreStatResult,
  GoCoreDirEntry,
  GoCoreGlobResponse,
  GoCoreFindUpResponse,
} from "./router/client"

// ---------------------------------------------------------------------------
// Shadow routing for filesystem operations
// ---------------------------------------------------------------------------

/**
 * Execute a filesystem operation in shadow mode.
 *
 * Calls both legacy TS and Go core in parallel, compares results,
 * logs divergences with a trace ID. Always returns the TS result.
 *
 * Usage:
 * ```typescript
 * const result = await routeFilesystemOp(
 *   "read",
 *   [path],
 *   () => legacyFs.read(path),
 *   () => GoCoreClient.fs.read(path),
 * )
 * ```
 */
export async function routeFilesystemOp<T>(
  opName: string,
  _args: unknown[],
  legacyFn: () => Promise<T>,
  goFn: () => Promise<T>,
): Promise<T> {
  if (!isShadow("filesystem")) {
    return legacyFn()
  }

  const traceId = crypto.randomUUID()
  const [tsResult, goResult] = await Promise.allSettled([legacyFn(), goFn()])

  if (tsResult.status === "fulfilled" && goResult.status === "fulfilled") {
    if (!deepEqual(tsResult.value, goResult.value)) {
      console.warn(
        `[shadow] divergence filesystem.${opName} trace=${traceId}`,
        {
          ts: tsResult.value,
          go: goResult.value,
        },
      )
    }
  } else if (goResult.status === "rejected") {
    console.warn(
      `[shadow] go_error filesystem.${opName} trace=${traceId}`,
      { error: String(goResult.reason) },
    )
  }

  if (tsResult.status === "fulfilled") return tsResult.value
  throw tsResult.reason
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Shallow structural comparison for shadow mode divergence detection.
 * Returns true if both values are structurally equal (JSON-comparable).
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a == null || b == null) return a === b
  if (typeof a !== typeof b) return false
  if (typeof a !== "object") return a === b

  // Both are objects
  const keysA = Object.keys(a as Record<string, unknown>)
  const keysB = Object.keys(b as Record<string, unknown>)
  if (keysA.length !== keysB.length) return false

  return keysA.every((key) => deepEqual(
    (a as Record<string, unknown>)[key],
    (b as Record<string, unknown>)[key],
  ))
}
