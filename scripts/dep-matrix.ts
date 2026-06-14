#!/usr/bin/env bun
/**
 * Compatibility matrix for @teamcode-ai inter-package dependencies.
 *
 * Defines the minimum semver range for each inter-package dependency edge.
 * Used by script/publish.ts to replace `workspace:*` with proper ranges
 * before publishing, ensuring users never get incompatible transitive deps.
 *
 * ## Convention
 *
 * Each entry maps (package → dependency) to a semver range. The range should
 * be MINIMAL — it reflects the oldest version of the dependency that the
 * current version of the package is compatible with.
 *
 * When you bump a dependency's API surface (breaking change or new feature),
 * you MUST bump the range here for all packages that depend on it.
 *
 * ## Validation
 *
 * Before publishing, publish.ts calls validatePkg() for each package. It
 * errors out if any `workspace:*` reference lacks a matrix entry.
 *
 * @example
 *   import { getRange, validatePkg } from "../scripts/dep-matrix"
 *   getRange("@teamcode-ai/plugin", "@teamcode-ai/sdk")   // ">=1.0.0"
 *   validatePkg("packages/plugin")                         // throws if unknown workspace:*
 */

// ---------------------------------------------------------------------------
// Matrix
// ---------------------------------------------------------------------------
// Key format: `${packageName}:${dependencyName}` → semver range

const matrix: Record<string, string> = {
  // ── Currently published ──────────────────────────────────────────────
  "@teamcode-ai/plugin:@teamcode-ai/sdk": ">=1.0.0",

  // ── Published (meta-package @teamcode-ai/teamcode) ─────────────────────
  // (the private `teamcode` CLI package is skipped — see skipPackages below)
  // The meta-package only has optionalDependencies on platform binary packages,
  // which get their versions from the build step — no matrix entries needed.

  // ── Ready for future publishing ────────────────────────────────────────
  "@teamcode-ai/slack:@teamcode-ai/sdk": ">=1.0.0",
  "@teamcode-ai/app:@teamcode-ai/core":  ">=1.0.0",
  "@teamcode-ai/app:@teamcode-ai/sdk":   ">=1.0.0",
  "@teamcode-ai/app:@teamcode-ai/ui":    ">=1.0.0",
  "@teamcode-ai/ui:@teamcode-ai/core":   ">=1.0.0",
  "@teamcode-ai/ui:@teamcode-ai/sdk":    ">=1.0.0",
}

// ── Packages that don't need matrix entries
// - sdk, script, mcp-security-tools: no inter-package deps
// - teamcode (CLI): private, published only as platform binaries + meta-package
//   its workspace:* deps (@teamcode-ai/plugin, @teamcode-ai/script, etc.)
//   are never shipped to npm — only the @teamcode-ai/teamcode meta-package,
//   which has no such deps, is published.
const skipPackages = new Set([
  "@teamcode-ai/sdk",
  "@teamcode-ai/script",
  "@teamcode-ai/mcp-security-tools",
  "teamcode",
])

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

/**
 * Return the minimum semver range for a (package → dependency) edge.
 * Throws if the edge is not in the matrix.
 */
export function getRange(pkgName: string, depName: string): string {
  const key = `${pkgName}:${depName}`
  const range = matrix[key]
  if (!range) {
    throw new Error(
      `[dep-matrix] Missing matrix entry: ${key}\n` +
        `  Add an entry to scripts/dep-matrix.ts before publishing.\n` +
        `  Example: "${key}": ">=1.0.0"`,
    )
  }
  return range
}

/**
 * Validate a package's `workspace:*` references against the matrix.
 * Throws on any unknown reference.
 */
export function validatePkg(pkgJson: {
  name?: string
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
}): void {
  const name = pkgJson.name
  if (!name) return

  if (skipPackages.has(name)) return

  const allDeps = {
    ...pkgJson.dependencies,
    ...pkgJson.peerDependencies,
    ...pkgJson.optionalDependencies,
  }

  for (const [depName, spec] of Object.entries(allDeps)) {
    if (spec === "workspace:*") {
      getRange(name, depName) // throws if missing
    }
  }
}

/**
 * Given a package's parsed package.json, replace `workspace:*` references
 * with the appropriate semver range from the matrix. Returns a new copy.
 */
export function resolveWorkspaceDeps(pkgJson: Record<string, unknown>): Record<string, unknown> {
  const result = { ...pkgJson }
  const name = result.name as string | undefined
  if (!name) return result

  for (const section of ["dependencies", "peerDependencies", "optionalDependencies"] as const) {
    const deps = result[section] as Record<string, string> | undefined
    if (!deps) continue
    const resolved: Record<string, string> = {}
    for (const [depName, spec] of Object.entries(deps)) {
      resolved[depName] = spec === "workspace:*" ? getRange(name, depName) : spec
    }
    result[section] = resolved
  }

  return result
}

// ── CLI usage: validate all packages ────────────────────────────────────
if (import.meta.main) {
  const { globSync } = await import("fs")
  const path = await import("path")

  const pkgFiles = [
    ...globSync("packages/*/package.json"),
    ...globSync("packages/sdk/*/package.json"),
  ]

  let errors = 0
  for (const file of pkgFiles) {
    const content = await Bun.file(file).json()
    try {
      validatePkg(content)
    } catch (e) {
      console.error(`❌ ${file}: ${(e as Error).message}`)
      errors++
    }
  }

  if (errors > 0) {
    console.error(`\n${errors} package(s) have unresolved workspace:* references.`)
    process.exit(1)
  }
  console.log(`✅ All ${pkgFiles.length} packages validated — no unregistered workspace:* references.`)
}
