#!/usr/bin/env bun
/**
 * Publish @teamcode-ai packages to npm.
 *
 * This handles:
 *   1. @teamcode-ai/plugin        — TUI plugin SDK
 *   2. @teamcode-ai/sdk           — JavaScript SDK (OpenAPI client)
 *   3. @teamcode-ai/teamcode      — CLI meta-package
 *   4. @teamcode-ai/{linux,darwin,windows}-*  — platform binaries
 *
 * Only packages with changes since the last release tag are published.
 *
 * Expects env vars:
 *   TEAMCODE_VERSION  - version to publish (e.g. "1.0.0")
 *   TEAMCODE_RELEASE  - "true" if this is a real release
 *   GH_REPO           - "owner/repo" for GitHub Release uploads
 *   GITHUB_TOKEN      - GitHub token for uploads
 */

import { $ } from "bun"
import { fileURLToPath } from "url"
import { validatePkg, resolveWorkspaceDeps } from "../scripts/dep-matrix"

const dir = fileURLToPath(new URL("..", import.meta.url))
process.chdir(dir)

const version = process.env.TEAMCODE_VERSION
if (!version) throw new Error("TEAMCODE_VERSION is required")

const currentTag = `v${version}`

console.log(`\n=== publishing v${version} ===\n`)

// ── Determine previous release tag ─────────────────────────────────────────
const { stdout: tagsOut } = await $`git tag --sort=-version:refname`.nothrow().quiet()
const allTags = tagsOut.toString().trim().split("\n").filter(Boolean)
const prevTag = allTags.find((t) => t !== currentTag && t.startsWith("v"))

/**
 * Check whether a directory subtree has changed since the previous release tag.
 * Returns true when there is no previous tag (first release) or changes exist.
 */
async function packageChanged(pkgDir: string): Promise<boolean> {
  if (!prevTag) {
    console.log(`  ⏮  No previous tag found — publishing ${pkgDir}`)
    return true
  }
  const result = await $`git diff ${prevTag}..HEAD --name-only -- ${pkgDir}`.nothrow().quiet()
  return result.stdout.toString().trim().length > 0
}

// ── Dependency matrix validation ──────────────────────────────────────────
/**
 * Before publishing, validate that all `workspace:*` references in the
 * package are registered in the compatibility matrix (scripts/dep-matrix.ts).
 * This prevents publishing packages with unresolvable internal deps.
 */
async function validatePkgJson(pkgDir: string): Promise<void> {
  const pkgPath = `${pkgDir}/package.json`
  try {
    const content = await Bun.file(pkgPath).json()
    validatePkg(content)
  } catch (e) {
    console.error(`\n  ❌ Dependency validation failed for ${pkgPath}:`)
    console.error(`     ${(e as Error).message}`)
    console.error(`\n  Add the missing entry to scripts/dep-matrix.ts or skip this package.`)
    process.exit(1)
  }
}

// ── Publish helpers ────────────────────────────────────────────────────────

type PublishFn = () => Promise<unknown>

/**
 * Temporarily patch a package.json: resolve `workspace:*` references to
 * proper semver ranges from the dep-matrix, run the publish function,
 * then restore the original. This ensures npm consumers get valid ranges
 * instead of `workspace:*`.
 */
async function withResolvedDeps(pkgDir: string, fn: () => Promise<unknown>): Promise<void> {
  const pkgPath = `${pkgDir}/package.json`
  const original = await Bun.file(pkgPath).text()
  const pkg = JSON.parse(original)
  const resolved = resolveWorkspaceDeps(pkg)
  const needsPatch = JSON.stringify(resolved) !== JSON.stringify(pkg)
  if (!needsPatch) {
    await fn()
    return
  }
  console.log(`  🔧 Resolving workspace:* references...`)
  await Bun.write(pkgPath, JSON.stringify(resolved, null, 2) + "\n")
  try {
    await fn()
  } finally {
    await Bun.write(pkgPath, original)
  }
}

async function publishIfChanged(name: string, pkgDir: string, fn: PublishFn) {
  console.log(`\n=== ${name} ===`)
  const changed = await packageChanged(pkgDir)
  if (!changed) {
    console.log(`  ⏭  No changes in ${pkgDir} since ${prevTag} — skipping`)
    return
  }
  console.log(`  📦 Changes detected — validating deps...`)
  await validatePkgJson(pkgDir)
  console.log(`  ✅ Deps validated — publishing...`)
  await withResolvedDeps(pkgDir, fn)
}

// ── CLI (builds 12 platform binaries + publishes to npm + GitHub Release) ──
await publishIfChanged("cli", "packages/teamcode", () =>
  $`bun ./packages/teamcode/script/publish.ts`,
)

// ── SDK ────────────────────────────────────────────────────────────────────
await publishIfChanged("sdk", "packages/sdk/js", () =>
  $`bun ./packages/sdk/js/script/publish.ts`,
)

// ── Plugin ─────────────────────────────────────────────────────────────────
await publishIfChanged("plugin", "packages/plugin", () =>
  $`bun ./packages/plugin/script/publish.ts`,
)

// ── Finalize GitHub Release (publish draft) ────────────────────────────────
if (process.env.GH_REPO) {
  const { exitCode } = await $`gh release edit ${currentTag} --draft=false --repo ${process.env.GH_REPO}`.nothrow()
  if (exitCode !== 0) {
    // Release not found — create it now. The build step may have failed to
    // create the draft but npm packages are already pushed, so we still need
    // a GitHub Release for this tag.
    await $`gh release create ${currentTag} --title "${currentTag}" --generate-notes --repo ${process.env.GH_REPO}`
  }
}
