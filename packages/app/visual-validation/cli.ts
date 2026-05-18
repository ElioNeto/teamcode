#!/usr/bin/env bun
/**
 * Visual validation CLI.
 *
 * Allows running the visual validation agent manually, outside of
 * Playwright, e.g. during development or in CI scripts that need
 * the raw exit code.
 *
 * Usage:
 *   bun run visual-validation           # run against existing dev server
 *   bun run visual-validation --capture # capture new baselines
 *   bun run visual-validation --tags desktop,session  # filter routes
 */

import { runValidation } from "./validator"

const captureOnly = process.argv.includes("--capture")
const tagIndex = process.argv.indexOf("--tags")
const tags = tagIndex >= 0 && tagIndex < process.argv.length - 1
  ? process.argv[tagIndex + 1].split(",")
  : undefined

const { report } = await runValidation({
  captureOnly,
  tags,
})

const { passed, failed, errors, newBaselines, total, durationMs } = report.summary

console.log(`\nVisual Validation — ${failed > 0 ? "❌ FAILED" : "✅ PASSED"}`)
console.log(`  Total: ${total} | Passed: ${passed} | Failed: ${failed} | New: ${newBaselines} | Errors: ${errors}`)
console.log(`  Duration: ${durationMs}ms\n`)

if (failed > 0 || errors > 0) process.exit(1)
