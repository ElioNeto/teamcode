/**
 * Visual validation report generator.
 *
 * Produces a structured JSON report and a self-contained HTML report
 * that can be served as a CI artifact or opened locally.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { basename, join, resolve } from "path"

export interface ValidationResult {
  route: string
  label: string
  status: "pass" | "fail" | "new-baseline" | "error"
  viewport: { width: number; height: number }
  tags: string[]
  /** Absolute path to the captured screenshot */
  screenshot?: string
  /** Absolute path to the baseline screenshot (if exists) */
  baselineScreenshot?: string
  /** Absolute path to the diff image (if comparison ran) */
  diffScreenshot?: string
  /** Pixel difference count (0 = identical) */
  pixelDiff?: number
  /** Difference percentage (0-100) */
  diffPercent?: number
  /** Console errors captured during the visit */
  consoleErrors?: string[]
  /** Network failures captured during the visit */
  networkErrors?: string[]
  /** Error message if an exception occurred */
  error?: string
  /** Timestamp of capture */
  timestamp: string
}

export interface ValidationReport {
  summary: {
    total: number
    passed: number
    failed: number
    newBaselines: number
    errors: number
    durationMs: number
  }
  results: ValidationResult[]
  createdAt: string
  ciRunId?: string
}

/**
 * Generate a JSON report file.
 */
export function writeJsonReport(report: ValidationReport, outputDir: string): string {
  const filePath = join(outputDir, "visual-validation-report.json")
  writeFileSync(filePath, JSON.stringify(report, null, 2))
  return filePath
}

/**
 * Generate a self-contained HTML report file.
 */
export function writeHtmlReport(report: ValidationReport, outputDir: string): string {
  const passed = report.summary.passed
  const failed = report.summary.failed
  const total = report.summary.total
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0
  const color = failed > 0 ? "#ef4444" : passed > 0 ? "#22c55e" : "#6b7280"

  const rows = report.results
    .map(
      (r) => `
<tr style="border-bottom:1px solid #e5e7eb">
  <td style="padding:8px 12px">${r.label}</td>
  <td style="padding:8px 12px"><span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;color:#fff;background:${r.status === "pass" ? "#22c55e" : r.status === "new-baseline" ? "#3b82f6" : "#ef4444"}">${r.status}</span></td>
  <td style="padding:8px 12px;font-variant-numeric:tabular-nums">${r.pixelDiff ?? "-"}</td>
  <td style="padding:8px 12px;font-variant-numeric:tabular-nums">${r.diffPercent != null ? r.diffPercent.toFixed(2) + "%" : "-"}</td>
  <td style="padding:8px 12px">${r.viewport.width}x${r.viewport.height}</td>
  <td style="padding:8px 12px">${r.error ? `<span title="${r.error}">⚠</span>` : r.consoleErrors?.length ? `<span title="${r.consoleErrors.join("; ")}">${r.consoleErrors.length} console</span>` : "-"}</td>
  <td style="padding:8px 12px">${r.screenshot ? `<a href="${r.screenshot}" target="_blank" style="color:#3b82f6">view</a>` : "-"}</td>
  <td style="padding:8px 12px">${r.diffScreenshot ? `<a href="${r.diffScreenshot}" target="_blank" style="color:#3b82f6">diff</a>` : "-"}</td>
</tr>`,
    )
    .join("\n")

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Visual Validation Report</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;margin:0;padding:24px;background:#f9fafb;color:#111}
h1{margin:0 0 4px;font-size:24px}
.subtitle{color:#6b7280;font-size:14px;margin-bottom:24px}
.summary{display:flex;gap:16px;margin-bottom:24px}
.stat{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px 24px;flex:1;text-align:center}
.stat-value{font-size:32px;font-weight:700;line-height:1;margin-bottom:4px}
.stat-label{font-size:13px;color:#6b7280}
.pass-bar{height:8px;border-radius:4px;background:${color};width:${passRate}%;margin-bottom:24px;transition:width .5s}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)}
th{text-align:left;padding:10px 12px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;background:#f3f4f6;border-bottom:2px solid #e5e7eb}
td{font-size:13px}
a{text-decoration:none}
a:hover{text-decoration:underline}
</style>
</head>
<body>
<h1>Visual Validation Report</h1>
<p class="subtitle">${report.createdAt}${report.ciRunId ? " · CI run: " + report.ciRunId : ""} · ${report.summary.durationMs}ms</p>
<div class="summary">
  <div class="stat"><div class="stat-value" style="color:${color}">${passRate}%</div><div class="stat-label">Pass rate</div></div>
  <div class="stat"><div class="stat-value" style="color:#22c55e">${passed}</div><div class="stat-label">Passed</div></div>
  <div class="stat"><div class="stat-value" style="color:#ef4444">${failed}</div><div class="stat-label">Failed</div></div>
  <div class="stat"><div class="stat-value">${total}</div><div class="stat-label">Total</div></div>
</div>
<div class="pass-bar"></div>
<table>
<thead><tr><th>Route</th><th>Status</th><th>Pixels diff</th><th>Diff %</th><th>Viewport</th><th>Issues</th><th>Screenshot</th><th>Diff</th></tr></thead>
<tbody>${rows}</tbody>
</table>
</body>
</html>`

  const filePath = join(outputDir, "visual-validation-report.html")
  writeFileSync(filePath, html)
  return filePath
}

/**
 * Generate a markdown summary suitable for CI PR comments.
 */
export function writeMarkdownSummary(report: ValidationReport, outputDir: string): string {
  const lines: string[] = [
    "## Visual Validation Report",
    "",
    `| Metric | Value |`,
    `|--------|-------|`,
    `| **Pass rate** | ${report.summary.total > 0 ? Math.round((report.summary.passed / report.summary.total) * 100) : 0}% |`,
    `| **Passed** | ${report.summary.passed} |`,
    `| **Failed** | ${report.summary.failed} |`,
    `| **New baselines** | ${report.summary.newBaselines} |`,
    `| **Errors** | ${report.summary.errors} |`,
    `| **Total** | ${report.summary.total} |`,
    `| **Duration** | ${report.summary.durationMs}ms |`,
    "",
  ]

  const failed = report.results.filter((r) => r.status === "fail")
  if (failed.length > 0) {
    lines.push("### ❌ Failures", "")
    for (const f of failed) {
      lines.push(`- **${f.label}** (${f.viewport.width}x${f.viewport.height}) — ${f.error ?? `${f.pixelDiff} pixels differ (${f.diffPercent?.toFixed(2)}%)`}`)
    }
    lines.push("")
  }

  const filePath = join(outputDir, "visual-validation-summary.md")
  writeFileSync(filePath, lines.join("\n"))
  return filePath
}

export { existsSync, mkdirSync, resolve, join, basename, readFileSync, writeFileSync }
