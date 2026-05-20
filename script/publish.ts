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
 * Expects env vars:
 *   OPENCODE_VERSION  - version to publish (e.g. "1.0.0")
 *   OPENCODE_RELEASE  - "true" if this is a real release
 *   GH_REPO           - "owner/repo" for GitHub Release uploads
 *   GITHUB_TOKEN      - GitHub token for uploads
 */

import { $ } from "bun"
import { fileURLToPath } from "url"

const dir = fileURLToPath(new URL("..", import.meta.url))
process.chdir(dir)

const version = process.env.OPENCODE_VERSION
if (!version) throw new Error("OPENCODE_VERSION is required")

console.log(`\n=== publishing v${version} ===\n`)

// ── CLI (builds 12 platform binaries + publishes to npm + GitHub Release) ──
console.log("=== cli ===\n")
await $`bun ./packages/teamcode/script/publish.ts`

// ── SDK ────────────────────────────────────────────────────────────────────
console.log("=== sdk ===\n")
await $`bun ./packages/sdk/js/script/publish.ts`

// ── Plugin ─────────────────────────────────────────────────────────────────
console.log("=== plugin ===\n")
await $`bun ./packages/plugin/script/publish.ts`

// ── Finalize GitHub Release (publish draft) ────────────────────────────────
if (process.env.GH_REPO) {
  await $`gh release edit v${version} --draft=false --repo ${process.env.GH_REPO}`
}
