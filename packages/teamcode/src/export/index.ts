export type ExportFormat = "html" | "pdf"

export interface ScanSessionData {
  id: string
  target: string
  scanDate: string
  riskLevel?: string
  summary?: string
  aiAnalysis?: string
}

export interface VulnerabilityData {
  id: string
  vulnName: string
  severity: string
  owasp?: string
  cvss?: string
  port?: string
  service?: string
  evidence?: string
  description?: string
}

export interface FixData {
  id: string
  vulnId?: string
  fixText: string
  source?: string
}

export interface ExploitData {
  id: string
  exploitName: string
  toolUsed?: string
  payload?: string
  result?: string
}

export interface ReportData {
  session: ScanSessionData
  vulnerabilities: VulnerabilityData[]
  fixes: FixData[]
  exploits: ExploitData[]
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#eab308",
  low: "#22c55e",
}

const SEVERITY_BG: Record<string, string> = {
  critical: "rgba(220, 38, 38, 0.15)",
  high: "rgba(234, 88, 12, 0.15)",
  medium: "rgba(234, 179, 8, 0.15)",
  low: "rgba(34, 197, 94, 0.15)",
}

function severityBadge(severity: string): string {
  const s = severity.toLowerCase()
  const color = SEVERITY_COLORS[s] ?? "#6b7280"
  const bg = SEVERITY_BG[s] ?? "rgba(107, 114, 128, 0.15)"
  return `<span style="background:${bg};color:${color};padding:2px 8px;border-radius:4px;font-weight:600;font-size:12px">${s.toUpperCase()}</span>`
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export function generateHtmlReport(data: ReportData): string {
  const { session, vulnerabilities, fixes, exploits } = data
  const scanDate = session.scanDate

  const vulnRows = vulnerabilities
    .map(
      (v) => `
      <tr>
        <td>${escapeHtml(v.vulnName)}</td>
        <td>${severityBadge(v.severity)}</td>
        <td>${v.port ? escapeHtml(v.port) : "-"}</td>
        <td>${v.service ? escapeHtml(v.service) : "-"}</td>
        <td>${v.cvss ?? "-"}</td>
        <td>${v.description ? escapeHtml(v.description) : "-"}</td>
      </tr>`,
    )
    .join("")

  const fixRows = fixes
    .map(
      (f) => `
      <tr>
        <td>${f.vulnId ? `<code>${escapeHtml(f.vulnId.substring(0, 8))}...</code>` : "-"}</td>
        <td>${escapeHtml(f.fixText)}</td>
        <td>${f.source ? escapeHtml(f.source) : "-"}</td>
      </tr>`,
    )
    .join("")

  const exploitRows = exploits
    .map(
      (e) => `
      <tr>
        <td>${escapeHtml(e.exploitName)}</td>
        <td>${e.toolUsed ? escapeHtml(e.toolUsed) : "-"}</td>
        <td>${e.payload ? `<code>${escapeHtml(e.payload.substring(0, 80))}${e.payload.length > 80 ? "..." : ""}</code>` : "-"}</td>
        <td>${e.result ? escapeHtml(e.result) : "-"}</td>
      </tr>`,
    )
    .join("")

  const counts = { critical: 0, high: 0, medium: 0, low: 0 }
  for (const v of vulnerabilities) {
    const key = v.severity.toLowerCase()
    if (key in counts) (counts as Record<string, number>)[key]++
  }

  const riskLabel = session.riskLevel ?? "UNKNOWN"
  const riskColor = SEVERITY_COLORS[riskLabel.toLowerCase()] ?? "#6b7280"

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pentest Report — ${escapeHtml(session.target)}</title>
<style>
  :root {
    --bg: #0f172a;
    --surface: #1e293b;
    --surface-hover: #334155;
    --text: #f8fafc;
    --text-muted: #94a3b8;
    --border: #334155;
    --accent: #38bdf8;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 1.6;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
  h2 { font-size: 1.25rem; margin: 2rem 0 1rem; color: var(--accent); border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
  .header { margin-bottom: 2rem; }
  .meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin: 1.5rem 0;
  }
  .meta-card {
    background: var(--surface);
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid var(--border);
  }
  .meta-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
  .meta-value { font-size: 1rem; font-weight: 600; margin-top: 0.25rem; }
  .counts { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.75rem; margin: 1rem 0; }
  .count-card { padding: 0.75rem; border-radius: 8px; text-align: center; font-weight: 700; font-size: 1.5rem; }
  .count-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.875rem; }
  th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--border); }
  th { background: var(--surface); color: var(--text-muted); font-weight: 600; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; }
  tr:hover td { background: var(--surface-hover); }
  code { background: rgba(56, 189, 248, 0.1); color: var(--accent); padding: 1px 6px; border-radius: 4px; font-family: "JetBrains Mono", monospace; font-size: 0.8rem; }
  .summary { background: var(--surface); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border); white-space: pre-wrap; font-size: 0.9rem; line-height: 1.8; }
  .footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border); text-align: center; color: var(--text-muted); font-size: 0.8rem; }
  @media print { body { background: white; color: #111827; } :root { --bg: white; --surface: #f3f4f6; --text: #111827; --text-muted: #6b7280; --border: #d1d5db; --accent: #0284c7; --surface-hover: #e5e7eb; } }
</style>
</head>
<body>

<div class="header">
  <h1>Pentest Report</h1>
  <p style="color:var(--text-muted)">Generated by TeamCode Pentest Agent</p>
</div>

<div class="meta">
  <div class="meta-card"><div class="meta-label">Target</div><div class="meta-value">${escapeHtml(session.target)}</div></div>
  <div class="meta-card"><div class="meta-label">Scan Date</div><div class="meta-value">${scanDate}</div></div>
  <div class="meta-card"><div class="meta-label">Risk Level</div><div class="meta-value" style="color:${riskColor}">${riskLabel.toUpperCase()}</div></div>
  <div class="meta-card"><div class="meta-label">Session ID</div><div class="meta-value"><code>${escapeHtml(session.id)}</code></div></div>
</div>

<div class="counts">
  <div class="count-card" style="background:${SEVERITY_BG.critical};color:${SEVERITY_COLORS.critical}">${counts.critical}<div class="count-label">Critical</div></div>
  <div class="count-card" style="background:${SEVERITY_BG.high};color:${SEVERITY_COLORS.high}">${counts.high}<div class="count-label">High</div></div>
  <div class="count-card" style="background:${SEVERITY_BG.medium};color:${SEVERITY_COLORS.medium}">${counts.medium}<div class="count-label">Medium</div></div>
  <div class="count-card" style="background:${SEVERITY_BG.low};color:${SEVERITY_COLORS.low}">${counts.low}<div class="count-label">Low</div></div>
</div>

${session.aiAnalysis ? `<h2>AI Analysis</h2><div class="summary">${escapeHtml(session.aiAnalysis)}</div>` : ""}
${session.summary ? `<h2>Summary</h2><div class="summary">${escapeHtml(session.summary)}</div>` : ""}

<h2>Vulnerabilities (${vulnerabilities.length})</h2>
<table><thead><tr><th>Name</th><th>Severity</th><th>Port</th><th>Service</th><th>CVSS</th><th>Description</th></tr></thead>
<tbody>${vulnRows || '<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">No vulnerabilities found</td></tr>'}</tbody></table>

<h2>Fixes (${fixes.length})</h2>
<table><thead><tr><th>Vulnerability</th><th>Fix</th><th>Source</th></tr></thead>
<tbody>${fixRows || '<tr><td colspan="3" style="text-align:center;color:var(--text-muted)">No fixes recorded</td></tr>'}</tbody></table>

<h2>Exploits Attempted (${exploits.length})</h2>
<table><thead><tr><th>Exploit</th><th>Tool</th><th>Payload</th><th>Result</th></tr></thead>
<tbody>${exploitRows || '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">No exploits attempted</td></tr>'}</tbody></table>

<div class="footer">Generated by TeamCode Pentest Agent &bull; ${new Date().toISOString()}</div>
</body></html>`
}
