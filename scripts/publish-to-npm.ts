#!/usr/bin/env bun
/**
 * Publish @teamcode-ai packages to npm.
 *
 * This script handles:
 *   1. @teamcode-ai/plugin    — TUI plugin SDK
 *   2. @teamcode-ai/sdk       — JavaScript SDK (OpenAPI client)
 *
 * The main `teamcode` CLI is published through the CI pipeline
 * (`.github/workflows/publish.yml`) which builds native binaries
 * for all platforms. Run `bun run script/build.ts` in `packages/teamcode`
 * for a local build.
 *
 * Usage:
 *   bun run scripts/publish-to-npm.ts          # dry run (pack only)
 *   FORCE_PUBLISH=true bun run scripts/publish-to-npm.ts   # actually publish
 */

import { $ } from "bun"
import { existsSync } from "fs"
import path from "path"
import { fileURLToPath } from "url"

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)))
const FORCE = process.env.FORCE_PUBLISH === "true"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function published(name: string, version: string) {
  return (await $`npm view ${name}@${version} version`.nothrow()).exitCode === 0
}

/**
 * Transform `exports` from dev-style `./src/*.ts` paths to
 * npm-style `./dist/*.js` + `./dist/*.d.ts` paths.
 */
function transformExports(exports: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(exports).map(([key, value]) => {
      if (typeof value === "string") {
        const file = value.replace("./src/", "./dist/").replace(/\.ts$/i, "")
        return [key, { import: file + ".js", types: file + ".d.ts" }]
      }
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        return [key, transformExports(value as Record<string, unknown>)]
      }
      return [key, value]
    }),
  )
}

async function packAndPublish(dir: string, pkgName: string) {
  const pkgPath = path.join(dir, "package.json")
  const originalText = await Bun.file(pkgPath).text()
  const pkg = JSON.parse(originalText) as {
    name: string
    version: string
    private?: boolean
    exports?: Record<string, unknown>
    files?: string[]
  }

  if (pkg.private) {
    console.log(`  ⏭  ${pkgName} is private — skipping`)
    return
  }

  if (await published(pkg.name, pkg.version)) {
    console.log(`  ✅ ${pkg.name}@${pkg.version} already published — skipping`)
    return
  }

  // Transform exports for npm
  const hadExports = !!pkg.exports
  if (pkg.exports) {
    pkg.exports = transformExports(pkg.exports)
  }

  // Also add a main/types field if exporting
  const distIndex = path.join(dir, "dist", "index.js")
  if (existsSync(distIndex)) {
    pkg.main = "./dist/index.js"
    pkg.types = "./dist/index.d.ts"
  }

  await Bun.write(pkgPath, JSON.stringify(pkg, null, 2) + "\n")

  try {
    // Pack
    const packResult = await $`bun pm pack`.cwd(dir).text()
    const tgzMatch = packResult.match(/(\/.*\.tgz|teamcode-.*\.tgz)/)
    const tgz = tgzMatch?.[0] ?? `${pkg.name.replace("/", "-").replace("@", "")}-${pkg.version}.tgz`

    console.log(`  📦 Packed: ${tgz}`)

    if (FORCE) {
      console.log(`  🚀 Publishing ${pkg.name}@${pkg.version}...`)
      const channel = process.env.NPM_CHANNEL ?? "latest"
      const otp = process.env.NPM_OTP ? `--otp ${process.env.NPM_OTP}` : ""
      const result = await $`npm publish ${tgz} --tag ${channel} --access public ${otp}`.cwd(dir).nothrow()
      if (result.exitCode === 0) {
        console.log(`  ✅ Published ${pkg.name}@${pkg.version}`)
      } else {
        console.log(`  ❌ Failed to publish ${pkg.name}@${pkg.version}`)
        console.log(`     ${result.stderr.toString().split("\n").slice(-3).join("\n").trim()}`)
        console.log(`     If 2FA is required, set NPM_OTP=<one-time-password>`)
      }
    } else {
      const cmd = `npm publish ${tgz} --tag latest --access public`
      console.log(`  🔍 Dry run — run this to publish:`)
      console.log(`     cd ${dir} && ${cmd}`)
    }
  } finally {
    // Restore package.json
    if (hadExports) {
      await Bun.write(pkgPath, originalText)
    } else {
      delete pkg.main
      delete pkg.types
      await Bun.write(pkgPath, JSON.stringify(pkg, null, 2) + "\n")
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("")
  console.log("╔══════════════════════════════════════════╗")
  console.log("║   @teamcode-ai npm publish preparation  ║")
  console.log("╚══════════════════════════════════════════╝")
  console.log("")

  if (!FORCE) {
    console.log("ℹ️  DRY RUN — set FORCE_PUBLISH=true to actually publish")
    console.log("")
  }

  // ── 1. @teamcode-ai/plugin ──────────────────────────────────────────
  console.log("── Plugin (@teamcode-ai/plugin) ─────────────────────")
  const pluginDir = path.join(ROOT, "packages", "plugin")

  // Build
  console.log("   Building...")
  await $`bun run build`.cwd(pluginDir).nothrow()
  console.log("   ✅ Build complete")

  await packAndPublish(pluginDir, "@teamcode-ai/plugin")

  // ── 2. @teamcode-ai/sdk ────────────────────────────────────────────
  console.log("")
  console.log("── SDK (@teamcode-ai/sdk) ───────────────────────────")
  const sdkDir = path.join(ROOT, "packages", "sdk", "js")

  // Try to build (may fail if dev server not running)
  console.log("   Building (requires teamcode dev server running)...")
  const buildOk = await $`bun run build`.cwd(sdkDir).nothrow().then((r) => r.exitCode === 0).catch(() => false)
  if (!buildOk) {
    console.log("   ⚠️  SDK build requires the teamcode dev server.")
    console.log("      Build manually:")
    console.log(`      cd ${sdkDir} && bun run script/build.ts`)
    console.log("")
    console.log("   Packing from existing dist/ or src/...")

    // Check if dist already exists
    if (existsSync(path.join(sdkDir, "dist"))) {
      console.log("   Found existing dist/ — packing...")
      await packAndPublish(sdkDir, "@teamcode-ai/sdk")
    } else {
      console.log("   ⏭  Skipping SDK — no dist/ available")
    }
  } else {
    await packAndPublish(sdkDir, "@teamcode-ai/sdk")
  }

  // ── 3. teamcode CLI ────────────────────────────────────────────────
  console.log("")
  console.log("── CLI (teamcode) ───────────────────────────────────")
  console.log("   The main teamcode CLI is distributed as platform-specific")
  console.log("   binary packages via the CI pipeline.")
  console.log("")
  console.log("   To publish a new version:")
  console.log("     1. Push to dev branch → triggers CI")
  console.log("     2. Or run manually:")
  console.log(`        cd ${path.join(ROOT, "packages", "teamcode")} && bun run script/publish.ts`)
  console.log("")
  console.log("   This builds native binaries for all platforms and publishes:")
  console.log("     - teamcode-darwin-arm64")
  console.log("     - teamcode-darwin-x64")
  console.log("     - teamcode-linux-arm64")
  console.log("     - teamcode-linux-x64")
  console.log("     - teamcode-windows-x64")
  console.log("     - teamcode-ai (meta-package with postinstall)")
  console.log("")

  // ── Summary ────────────────────────────────────────────────────────
  console.log("╔══════════════════════════════════════════╗")
  console.log("║   Summary                               ║")
  console.log("╚══════════════════════════════════════════╝")
  console.log("")
  if (!FORCE) {
    console.log("🔍 Dry run completed. To publish for real:")
    console.log("")
    console.log("   1. Log in to npm:")
    console.log("      npm login")
    console.log("")
    console.log("   2. Set npm token (CI usage):")
    console.log('      export NPM_TOKEN="npm_..."')
    console.log('      echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > ~/.npmrc')
    console.log("")
    console.log("   3. Run with FORCE_PUBLISH=true:")
    console.log("      FORCE_PUBLISH=true bun run scripts/publish-to-npm.ts")
    console.log("")
    console.log("   4. For the CLI binary, use CI pipeline")
  } else {
    console.log("✅ All publishable packages published!")
  }
  console.log("")
}

main().catch((err) => {
  console.error("Fatal:", err)
  process.exit(1)
})
