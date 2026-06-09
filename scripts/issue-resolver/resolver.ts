#!/usr/bin/env bun
/**
 * Issue Resolver — Autonomous GitHub issue resolution pipeline.
 *
 * Continuously fetches open issues, prioritizes them by phase and scope,
 * and runs each through a Plan → Implement → Validate → Review → Commit → Close cycle.
 *
 * Supports:
 *   - Parallel batch processing
 *   - Phase-based triage (p0-critical → p1-high → p2-medium → p3-low → unphased)
 *   - Scope filtering
 *   - Checkpoint/resume
 *   - Rate limiting and retry
 *
 * Usage:
 *   export GH_TOKEN=github_pat_...
 *   bun run scripts/issue-resolver/resolver.ts
 *
 * Flags:
 *   --bugs-only           Only process issues labeled as bugs
 *   --labels=bug,ui       Only process issues with these labels
 *   --phase=p0-critical   Only process issues of this phase
 *   --scope=core-engine   Only process issues of this scope
 *   --batch=10            Issues per batch (default: 10)
 *   --parallel=3          Parallel issue processing (default: 3)
 *   --max-attempts=3      Max attempts per issue (default: 3)
 *   --resume              Resume from last checkpoint
 *   --once                Process one batch and exit
 *   --dry-run             Fetch and select issues without processing
 *   --dashboard           Show progress dashboard and exit
 *   --help                Show this help
 */

import { fetchAllIssues, fetchIssuesByPhase, estimateComplexity, hasSufficientInfo, countByPhase } from "./github"
import { processBatch, loadCheckpoint, printCheckpointSummary, DEFAULT_STATE } from "./pipeline"
import type { ResolverState, Phase, Checkpoint, GitHubIssue, PipelineResult } from "./types"
import { PHASE_ORDER } from "./types"

// ---- CLI ARGS ----

const args = process.argv.slice(2)
const flags: Record<string, string | boolean | number> = {}
for (const arg of args) {
  if (arg === "--bugs-only") flags.bugsOnly = true
  else if (arg === "--once") flags.once = true
  else if (arg === "--dry-run") flags.dryRun = true
  else if (arg === "--resume") flags.resume = true
  else if (arg === "--dashboard") flags.dashboard = true
  else if (arg.startsWith("--labels=")) flags.labels = arg.split("=")[1]
  else if (arg.startsWith("--phase=")) flags.phase = arg.split("=")[1]
  else if (arg.startsWith("--scope=")) flags.scope = arg.split("=")[1]
  else if (arg.startsWith("--batch=")) flags.batch = Number(arg.split("=")[1])
  else if (arg.startsWith("--parallel=")) flags.parallel = Number(arg.split("=")[1])
  else if (arg.startsWith("--max-attempts=")) flags.maxAttempts = Number(arg.split("=")[1])
  else if (arg === "--help" || arg === "-h") {
    console.log(`
Issue Resolver — Autonomous GitHub issue resolution pipeline.

Usage:  bun run scripts/issue-resolver/resolver.ts [flags]

Flags:
  --bugs-only           Only process issues labeled as bugs
  --labels=X,Y          Only process issues with these labels
  --phase=p0-critical   Only process issues of this phase (p0-critical|p1-high|p2-medium|p3-low)
  --scope=core-engine   Only process issues of this scope
  --batch=N             Issues per batch (default: 10)
  --parallel=N          Parallel issue processing (default: 3)
  --max-attempts=N      Max attempts per issue (default: 3)
  --resume              Resume from last checkpoint
  --once                Process one batch and exit
  --dry-run             Fetch and select issues without processing
  --dashboard           Show progress dashboard and exit
  --help                Show this help

Phases (processed in order):
  1. p0-critical — Critical bugs that block usage
  2. p1-high     — High-priority bugs
  3. p2-medium   — Medium-priority bugs
  4. p3-low      — Low-priority / platform-specific
  5. unphased    — Issues without phase label (needs triage)

Environment:
  GH_TOKEN          GitHub personal access token (required for closing issues)
  GITHUB_TOKEN      Alternative for GH_TOKEN
`)
    process.exit(0)
  }
}

// Check for dashboard mode
if (flags.dashboard) {
  await showDashboard()
  process.exit(0)
}

// ---- STATE ----

const checkpoint = flags.resume ? loadCheckpoint(DEFAULT_STATE.checkpointFile) : null

const state: ResolverState & { processedNumbers?: Set<number> } = {
  ...DEFAULT_STATE,
  bugsOnly: flags.bugsOnly === true,
  preferLabels: typeof flags.labels === "string" ? flags.labels.split(",") : DEFAULT_STATE.preferLabels,
  batchSize: typeof flags.batch === "number" ? flags.batch : DEFAULT_STATE.batchSize,
  parallel: typeof flags.parallel === "number" ? flags.parallel : DEFAULT_STATE.parallel,
  maxAttempts: typeof flags.maxAttempts === "number" ? flags.maxAttempts : DEFAULT_STATE.maxAttempts,
  currentPhase: checkpoint?.currentPhase ?? (typeof flags.phase === "string" ? (flags.phase as Phase) : DEFAULT_STATE.currentPhase),
  phaseFilter: typeof flags.phase === "string" ? (flags.phase as Phase) : undefined,
  scopeFilter: typeof flags.scope === "string" ? flags.scope : undefined,
  processedNumbers: checkpoint ? new Set(checkpoint.processedIssues) : new Set(),
}

// ---- MAIN LOOP ----

let totalProcessed = checkpoint?.stats.totalProcessed ?? 0
let totalSuccess = checkpoint?.stats.totalSuccess ?? 0
let totalSkipped = checkpoint?.stats.totalSkipped ?? 0
let totalFailed = checkpoint?.stats.totalFailed ?? 0
let totalTooComplex = checkpoint?.stats.totalTooComplex ?? 0

async function main() {
  console.log(`\n${"█".repeat(72)}`)
  console.log(`  🤖 Issue Resolver v2 — ${new Date().toISOString()}`)
  console.log(`  Phase: ${state.currentPhase}${state.phaseFilter ? ` (filtered: ${state.phaseFilter})` : ""}`)
  console.log(`  Batch: ${state.batchSize} | Parallel: ${state.parallel}`)
  console.log(`  Max attempts: ${state.maxAttempts} | Bugs only: ${state.bugsOnly}`)
  if (state.scopeFilter) console.log(`  Scope filter: ${state.scopeFilter}`)
  if (checkpoint) printCheckpointSummary(checkpoint)
  console.log(`${"█".repeat(72)}\n`)

  if (flags.dryRun) {
    console.log("🔍 Dry run mode — will fetch and show eligible issues without processing.\n")
  }

  // Determine which phases to process
  const phasesToProcess = state.phaseFilter
    ? [state.phaseFilter]
    : PHASE_ORDER

  for (const phase of phasesToProcess) {
    state.currentPhase = phase
    console.log(`\n${"🟡".repeat(36)}`)
    console.log(`  PHASE: ${phase}`)
    console.log(`${"🟡".repeat(36)}\n`)

    await processPhase(phase, state)
  }

  // FINAL REPORT
  console.log(`\n${"🌟".repeat(36)}`)
  console.log(`🏁 Issue Resolver finished`)
  console.log(`   Total processed: ${totalProcessed}`)
  console.log(`   Success: ${totalSuccess}`)
  console.log(`   Skipped: ${totalSkipped}`)
  console.log(`   Too complex: ${totalTooComplex}`)
  console.log(`   Failed:  ${totalFailed}`)
  console.log(`   Time: ${new Date().toISOString()}`)
}

async function processPhase(phase: Phase, state: ResolverState & { processedNumbers?: Set<number> }) {
  let iteration = 0

  while (true) {
    iteration++
    printPhaseHeader(phase, iteration)

    const allIssues = await fetchPhaseIssues(phase, state)
    console.log(`   Found ${allIssues.length} ${phase} issues remaining`)

    const eligible = filterAndSortIssues(allIssues, state)
    console.log(`   Eligible for processing: ${eligible.length}`)
    console.log(`   Filtered out: ${allIssues.length - eligible.length}`)

    if (eligible.length === 0) {
      if (flags.dryRun) break
      console.log(`\n✅ No eligible ${phase} issues remaining.`)
      break
    }

    printBatchInfo(phase, iteration, eligible, state.batchSize)

    if (flags.dryRun) {
      console.log("\n🔍 Dry run — no issues were processed.")
      break
    }

    const batch = eligible.slice(0, state.batchSize)
    console.log(`\n🚀 Processing batch of ${batch.length} issues (parallel=${state.parallel})...`)
    const results = await processBatch(batch, state)
    updateStats(results, state)
    printProgressReport(totalProcessed, eligible.length, batch.length, phase)

    if (flags.once) return
  }
}

function printPhaseHeader(phase: string, iteration: number) {
  console.log(`\n${"#".repeat(72)}`)
  console.log(`Iteration ${iteration} — Fetching ${phase} issues...`)
  console.log(`${"#".repeat(72)}`)
}

async function fetchPhaseIssues(phase: Phase, state: ResolverState & { processedNumbers?: Set<number> }) {
  let issues = phase === "unphased"
    ? (await fetchAllIssues({ state: "open", sort: "created", direction: "desc" }))
        .filter((i) => i.phase === "unphased")
    : await fetchIssuesByPhase(phase, { sort: "created", direction: "desc" })

  if (state.scopeFilter) {
    issues = issues.filter((i) => i.scopes.includes(state.scopeFilter!))
  }
  if (state.processedNumbers && state.processedNumbers.size > 0) {
    issues = issues.filter((i) => !state.processedNumbers!.has(i.number))
  }
  return issues
}

function filterAndSortIssues(allIssues: GitHubIssue[], state: ResolverState) {
  const eligible = allIssues.filter((issue) => {
    if (!hasSufficientInfo(issue)) return false
    if (state.excludeLabels.some((l) => issue.labels.includes(l))) return false
    if (state.bugsOnly && !issue.isBug) return false
    if (estimateComplexity(issue) > state.maxComplexity) return false
    return true
  })

  const prioOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  const scopeOrder = ["core-engine", "agent-system", "providers", "code-tools", "tui", "desktop", "stability", "infrastructure"]

  eligible.sort((a, b) => {
    const prioDiff = (prioOrder[a.priority] ?? 2) - (prioOrder[b.priority] ?? 2)
    if (prioDiff !== 0) return prioDiff
    const aIdx = scopeOrder.indexOf(a.scopes[0] ?? "")
    const bIdx = scopeOrder.indexOf(b.scopes[0] ?? "")
    return (aIdx >= 0 ? aIdx : 99) - (bIdx >= 0 ? bIdx : 99)
  })

  return eligible
}

function printBatchInfo(phase: string, iteration: number, eligible: GitHubIssue[], batchSize: number) {
  const batch = eligible.slice(0, batchSize)
  console.log(`\n📋 Batch for ${phase} iteration ${iteration}:`)
  for (const issue of batch) {
    const complexity = estimateComplexity(issue)
    const scopes = issue.scopes.join(", ") || "no-scope"
    console.log(`   #${issue.number} [${issue.priority}] [scope: ${scopes}] [cpx: ${complexity}] ${issue.title.slice(0, 80)}`)
  }
}

function updateStats(results: PipelineResult[], state: ResolverState & { processedNumbers?: Set<number> }) {
  for (const r of results) {
    totalProcessed++
    if (state.processedNumbers) state.processedNumbers.add(r.issue.number)
    if (r.success) totalSuccess++
    else if (r.tooComplex) totalTooComplex++
    else if (r.skipped) totalSkipped++
    else totalFailed++
  }
}

function printProgressReport(processed: number, remaining: number, batchSize: number, phase: string): void {
  const total = processed + remaining
  const pct = total > 0 ? ((processed / total) * 100).toFixed(1) : "0.0"

  console.log(`\n${"=".repeat(72)}`)
  console.log(`📊 Progress Report — Phase: ${phase}`)
  console.log(`   Total in phase: ${total}`)
  console.log(`   Processed: ${processed} (${pct}%)`)
  console.log(`   Remaining: ${remaining}`)
  console.log(`   ✅ Success: ${totalSuccess}`)
  console.log(`   ⏭️  Skipped: ${totalSkipped}`)
  console.log(`   🧠 Too complex: ${totalTooComplex}`)
  console.log(`   ❌ Failed:  ${totalFailed}`)

  // Progress bar
  const barWidth = 30
  const filled = Math.floor((processed / Math.max(1, total)) * barWidth)
  const bar = "▓".repeat(filled) + "░".repeat(barWidth - filled)
  console.log(`\n   Phase progress: [${bar}] ${pct}%`)

  // ETA
  if (totalSuccess > 0) {
    const issuesPerMin = totalSuccess / ((Date.now() - startTime) / 60000)
    const remainingMins = issuesPerMin > 0 ? remaining / issuesPerMin : 0
    console.log(`   Speed: ${issuesPerMin.toFixed(1)} issues/min | ETA: ${formatDuration(remainingMins * 60)}`)
  }
  console.log(`${"=".repeat(72)}`)
}

let startTime = Date.now()

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const mins = Math.floor(seconds / 60)
  const hrs = Math.floor(mins / 60)
  if (hrs > 0) return `${hrs}h ${mins % 60}m`
  return `${mins}m ${Math.round(seconds % 60)}s`
}

// ---- DASHBOARD ----

async function showDashboard(): Promise<void> {
  console.log(`\n${"█".repeat(72)}`)
  console.log(`  📊 Issue Resolver Dashboard — ${new Date().toISOString()}`)
  console.log(`${"█".repeat(72)}\n`)

  const allIssues = await fetchAllIssues({ state: "open" })
  const phaseCounts = countByPhase(allIssues)

  console.log("Phase Distribution:")
  console.log("  Phase           Count     Bar")
  console.log("  " + "─".repeat(50))
  for (const phase of PHASE_ORDER) {
    const count = phaseCounts[phase] ?? 0
    const pct = allIssues.length > 0 ? ((count / allIssues.length) * 100).toFixed(1) : "0.0"
    const bar = "▓".repeat(Math.floor((count / Math.max(1, allIssues.length)) * 30))
    console.log(`  ${phase.padEnd(16)} ${String(count).padStart(5)} (${pct}%)  ${bar}`)
  }
  console.log(`  ${"─".repeat(50)}`)
  console.log(`  Total:           ${allIssues.length}`)

  // Scope distribution (top 10)
  console.log("\nScope Distribution (top 10):")
  const scopeCounts: Record<string, number> = {}
  for (const issue of allIssues) {
    for (const scope of issue.scopes) {
      scopeCounts[scope] = (scopeCounts[scope] ?? 0) + 1
    }
  }
  const sortedScopes = Object.entries(scopeCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
  for (const [scope, count] of sortedScopes) {
    const pct = allIssues.length > 0 ? ((count / allIssues.length) * 100).toFixed(1) : "0.0"
    const bar = "▓".repeat(Math.floor((count / Math.max(1, sortedScopes[0][1])) * 20))
    console.log(`  ${scope.padEnd(20)} ${String(count).padStart(4)} (${pct}%)  ${bar}`)
  }

  // Bug vs Enhancement
  const bugs = allIssues.filter((i) => i.isBug).length
  const enhancements = allIssues.filter((i) => !i.isBug).length
  console.log(`\nType Distribution:`)
  console.log(`  Bugs:         ${bugs} (${allIssues.length > 0 ? ((bugs / allIssues.length) * 100).toFixed(1) : "0"}%)`)
  console.log(`  Enhancements: ${enhancements} (${allIssues.length > 0 ? ((enhancements / allIssues.length) * 100).toFixed(1) : "0"}%)`)

  // Checkpoint info
  const cp = loadCheckpoint(DEFAULT_STATE.checkpointFile)
  if (cp) {
    console.log(`\nLast checkpoint: ${cp.updatedAt}`)
    console.log(`  Phase: ${cp.currentPhase}`)
    console.log(`  Processed: ${cp.stats.totalProcessed}`)
    console.log(`  Success: ${cp.stats.totalSuccess}`)
    console.log(`  Skipped: ${cp.stats.totalSkipped}`)
    console.log(`  Failed: ${cp.stats.totalFailed}`)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

main().catch((error) => {
  console.error("\n💥 Fatal error:", error)
  process.exit(1)
})
