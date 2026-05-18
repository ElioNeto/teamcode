/**
 * Visual validation Playwright test suite.
 *
 * This spec drives the visual validation agent: navigates configured
 * routes, captures screenshots, compares against baselines, and
 * produces a structured report with diff images.
 *
 * Run:  bun run test:e2e:visual             # local (reuses dev server)
 *       CI=1 bun run test:e2e:visual:ci     # CI (fresh server, JUnit output)
 */

import { test, expect } from "@playwright/test"
import { resolve } from "path"
import { runValidation } from "../visual-validation/validator"
import type { ValidationRoute } from "../visual-validation/routes"
import { ROUTES } from "../visual-validation/routes"

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"
const OUTPUT_DIR = resolve(process.cwd(), "visual-validation-output")
const BASELINE_DIR = resolve(process.cwd(), "visual-validation", "baseline")
const CAPTURE_ONLY = process.env.VISUAL_CAPTURE_ONLY === "1"
const TAGS = process.env.VISUAL_TAGS?.split(",").filter(Boolean)

const FAIL_THRESHOLD_PCT = Number(process.env.VISUAL_FAIL_THRESHOLD ?? "1") // fail if >1% diff

test.describe("Visual Validation", () => {
  let report: Awaited<ReturnType<typeof runValidation>>["report"]
  let artifacts: Awaited<ReturnType<typeof runValidation>>

  test.beforeAll(async () => {
    artifacts = await runValidation({
      baseUrl: BASE_URL,
      outputDir: OUTPUT_DIR,
      baselineDir: BASELINE_DIR,
      captureOnly: CAPTURE_ONLY,
      tags: TAGS,
      routes: process.env.VISUAL_ROUTES ? loadFilteredRoutes() : undefined,
    })
    report = artifacts.report

    // Print summary to stdout for CI logs
    console.log(`\nVisual Validation Report:`)
    console.log(`  Passed: ${report.summary.passed}/${report.summary.total}`)
    console.log(`  Failed: ${report.summary.failed}`)
    console.log(`  New baselines: ${report.summary.newBaselines}`)
    console.log(`  Errors: ${report.summary.errors}`)
    console.log(`  Duration: ${report.summary.durationMs}ms`)
    console.log(`  Report: ${artifacts.htmlPath}`)
    console.log(`  JSON:   ${artifacts.jsonPath}\n`)
  })

  test("all routes pass visual validation within threshold", () => {
    // This single assertion covers the whole suite.
    // Individual route results are in the report artifacts.
    const failures = report.results.filter((r) => r.status === "fail")
    const errors = report.results.filter((r) => r.status === "error")

    // Log individual failures
    for (const f of failures) {
      console.error(`❌ ${f.label} (${f.viewport.width}x${f.viewport.height}): ${f.pixelDiff} pixels differ (${f.diffPercent?.toFixed(2)}%)`)
      if (f.diffScreenshot) console.error(`   Diff: ${f.diffScreenshot}`)
    }
    for (const e of errors) {
      console.error(`⚠  ${e.label}: ${e.error}`)
    }

    expect(failures.length).toBe(0)
    expect(errors.length).toBe(0)
  })

  test("no route exceeds per-route diff threshold", () => {
    const overThreshold = report.results.filter(
      (r) => r.diffPercent != null && r.diffPercent > FAIL_THRESHOLD_PCT,
    )
    for (const r of overThreshold) {
      console.error(`❌ ${r.label}: ${r.diffPercent?.toFixed(2)}% diff exceeds ${FAIL_THRESHOLD_PCT}% threshold`)
    }
    expect(overThreshold.length).toBe(0)
  })

  test("report artifacts exist", () => {
    expect(artifacts.jsonPath).toBeTruthy()
    expect(artifacts.htmlPath).toBeTruthy()
    expect(artifacts.summaryPath).toBeTruthy()
  })
})

/**
 * Load routes from a JSON file specified by VISUAL_ROUTES env var.
 * Useful for CI-driven targeted validation (e.g. only changed pages).
 */
function loadFilteredRoutes(): ValidationRoute[] {
  const filePath = process.env.VISUAL_ROUTES!
  try {
    const data = JSON.parse(require("fs").readFileSync(filePath, "utf-8"))
    if (Array.isArray(data)) return data as ValidationRoute[]
    if (data.routes) return data.routes as ValidationRoute[]
  } catch {
    console.warn(`Could not load routes from ${filePath}, using defaults`)
  }
  return ROUTES
}
