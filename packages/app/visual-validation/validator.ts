/**
 * Visual validation agent.
 *
 * Uses Playwright to navigate configured routes, capture screenshots,
 * compare against baselines and report visual differences.
 *
 * Designed to run both locally (reuse dev server) and in CI.
 */

import { Browser, BrowserContext, ConsoleMessage, Page, chromium } from "@playwright/test"
import { join, resolve } from "path"
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs"
import type { ValidationRoute, ValidationResult, ValidationReport } from "./routes"
import { ROUTES } from "./routes"
import { writeJsonReport, writeHtmlReport, writeMarkdownSummary } from "./reporter"

export interface ValidatorOptions {
  /** Base URL of the app under test */
  baseUrl?: string
  /** Directory for artifact output (screenshots, reports) */
  outputDir?: string
  /** Directory for baseline screenshots */
  baselineDir?: string
  /** Pixel-match tolerance (0-1, default 0) */
  tolerance?: number
  /** Only run routes matching these tags */
  tags?: string[]
  /** Skip comparison, only capture (sets new baselines) */
  captureOnly?: boolean
  /** Collect console errors */
  collectConsole?: boolean
  /** Collect network failures */
  collectNetwork?: boolean
  /** Callback after each validation */
  onResult?: (result: ValidationResult) => void
  /** Custom routes (defaults to ROUTES) */
  routes?: ValidationRoute[]
}

const DEFAULT_OPTIONS: ValidatorOptions = {
  baseUrl: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
  outputDir: resolve(process.cwd(), "visual-validation-output"),
  baselineDir: resolve(process.cwd(), "visual-validation", "baseline"),
  tolerance: 0,
  captureOnly: false,
  collectConsole: true,
  collectNetwork: true,
}

export interface ValidationArtifacts {
  report: ValidationReport
  jsonPath: string
  htmlPath: string
  summaryPath: string
  screenshotDir: string
  diffDir: string
}

/**
 * Run the full visual validation suite.
 */
export async function runValidation(options: ValidatorOptions = {}): Promise<ValidationArtifacts> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const routes = opts.routes ?? ROUTES
  const filtered = opts.tags?.length ? routes.filter((r) => r.tags?.some((t) => opts.tags!.includes(t))) : routes

  const screenshotDir = join(opts.outputDir, "screenshots")
  const diffDir = join(opts.outputDir, "diffs")
  for (const dir of [opts.outputDir, screenshotDir, diffDir, opts.baselineDir]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  }

  const start = Date.now()
  const results: ValidationResult[] = []

  const browser: Browser = await chromium.launch({ headless: true })
  const context: BrowserContext = await browser.newContext({
    ignoreHTTPSErrors: true,
  })

  const consoleErrors: string[] = []
  const networkErrors: string[] = []

  for (const route of filtered) {
    const page: Page = await context.newPage()

    if (opts.collectConsole) {
      page.on("console", (msg: ConsoleMessage) => {
        if (msg.type() === "error") consoleErrors.push(msg.text())
      })
    }
    if (opts.collectNetwork) {
      page.on("requestfailed", (req) => {
        networkErrors.push(`${req.url()}: ${req.failure()?.errorText ?? "unknown"}`)
      })
    }

    const viewport = { width: route.width ?? 1280, height: route.height ?? 800 }
    await page.setViewportSize(viewport)

    const result: ValidationResult = {
      route: route.path,
      label: route.label,
      status: "error",
      viewport,
      tags: route.tags ?? [],
      timestamp: new Date().toISOString(),
    }

    try {
      // Navigate
      await page.goto(route.path, { waitUntil: "networkidle", timeout: 30000 })

      // Wait for optional selector
      if (route.waitFor) {
        await page.waitForSelector(route.waitFor, { timeout: 15000 })
      }

      // Perform interactions
      if (route.interactions) {
        for (const interaction of route.interactions) {
          switch (interaction.type) {
            case "click":
              if (interaction.selector) await page.click(interaction.selector)
              break
            case "fill":
              if (interaction.selector && interaction.value != null) await page.fill(interaction.selector, interaction.value)
              break
            case "hover":
              if (interaction.selector) await page.hover(interaction.selector)
              break
            case "scrollTo":
              if (interaction.x != null || interaction.y != null) await page.evaluate(({ x, y }) => window.scrollTo(x ?? 0, y ?? 0), interaction)
              break
            case "keyboard":
              if (interaction.key) await page.keyboard.press(interaction.key)
              break
          }
        }
      }

      // Settle
      if (route.settleMs) await page.waitForTimeout(route.settleMs)

      // Capture screenshot
      const screenshotPath = join(screenshotDir, `${route.baseline}.png`)
      await page.screenshot({ path: screenshotPath, fullPage: false })
      result.screenshot = screenshotPath

      // Compare with baseline
      const baselinePath = join(opts.baselineDir, `${route.baseline}.png`)
      if (opts.captureOnly || !existsSync(baselinePath)) {
        // Save as new baseline
        writeFileSync(baselinePath, readFileSync(screenshotPath))
        result.status = "new-baseline"
      } else {
        result.baselineScreenshot = baselinePath
        // Pixel-level comparison
        const diff = await compareScreenshots(screenshotPath, baselinePath, diffDir, route.baseline, opts.tolerance ?? 0)
        result.pixelDiff = diff.pixels
        result.diffPercent = diff.percent
        result.diffScreenshot = diff.diffPath
        result.status = diff.pixels > 0 ? "fail" : "pass"
      }

      result.consoleErrors = consoleErrors.splice(0)
      result.networkErrors = networkErrors.splice(0)
    } catch (e) {
      result.error = e instanceof Error ? e.message : String(e)
      result.status = "error"
    }

    results.push(result)
    opts.onResult?.(result)
    await page.close()
  }

  await browser.close()

  const report: ValidationReport = {
    summary: {
      total: results.length,
      passed: results.filter((r) => r.status === "pass").length,
      failed: results.filter((r) => r.status === "fail").length,
      newBaselines: results.filter((r) => r.status === "new-baseline").length,
      errors: results.filter((r) => r.status === "error").length,
      durationMs: Date.now() - start,
    },
    results,
    createdAt: new Date().toISOString(),
    ciRunId: process.env.GITHUB_RUN_ID,
  }

  const jsonPath = writeJsonReport(report, opts.outputDir)
  const htmlPath = writeHtmlReport(report, opts.outputDir)
  const summaryPath = writeMarkdownSummary(report, opts.outputDir)

  return { report, jsonPath, htmlPath, summaryPath, screenshotDir, diffDir }
}

// ---------------------------------------------------------------------------
// Pixel comparison
// ---------------------------------------------------------------------------

interface DiffResult {
  pixels: number
  percent: number
  diffPath?: string
}

async function compareScreenshots(
  actualPath: string,
  baselinePath: string,
  diffDir: string,
  name: string,
  tolerance: number,
): Promise<DiffResult> {
  // Use Playwright's built-in screenshot comparison (via pixelmatch)
  const { PNG } = await import("pngjs")
  const pixelmatch = (await import("pixelmatch")).default

  const actual = PNG.sync.read(readFileSync(actualPath))
  const baseline = PNG.sync.read(readFileSync(baselinePath))

  const { width, height } = actual
  const diff = new PNG({ width, height })

  const pixels = pixelmatch(actual.data, baseline.data, diff.data, width, height, {
    threshold: tolerance,
    includeAA: true,
  })

  const totalPixels = width * height
  const percent = totalPixels > 0 ? (pixels / totalPixels) * 100 : 0

  if (pixels > 0) {
    const diffPath = join(diffDir, `${name}-diff.png`)
    writeFileSync(diffPath, PNG.sync.write(diff))
    return { pixels, percent, diffPath }
  }

  return { pixels: 0, percent: 0 }
}
