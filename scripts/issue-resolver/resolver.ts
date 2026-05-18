#!/usr/bin/env bun
/**
 * Issue Resolver — Autonomous GitHub issue resolution pipeline.
 *
 * Continuously fetches open issues, prioritizes them, and runs each
 * through a Plan → Implement → Validate → Review → Commit → Close cycle.
 *
 * Usage:
 *   export GH_TOKEN=github_pat_...
 *   bun run scripts/issue-resolver/resolver.ts
 *
 * Flags:
 *   --bugs-only       Only process issues labeled as bugs
 *   --labels=bug,ui   Only process issues with these labels
 *   --batch=5         Process N issues per batch (default: 10)
 *   --max-attempts=5  Max attempts per issue (default: 3)
 *   --once            Process one batch and exit
 *   --dry-run         Fetch and select issues without processing
 *
 * The resolver runs until one of:
 *   - No more open issues remain
 *   - The user interrupts (Ctrl+C)
 *   - --once is specified and one batch completes
 */

import { fetchIssues, estimateComplexity, hasSufficientInfo } from "./github"
import { processBatch, DEFAULT_STATE } from "./pipeline"
import type { ResolverState } from "./types"

// ---- CLI ARGS ----

const args = process.argv.slice(2)
const flags: Record<string, string | boolean> = {}
for (const arg of args) {
  if (arg === "--bugs-only") flags.bugsOnly = true
  else if (arg === "--once") flags.once = true
  else if (arg === "--dry-run") flags.dryRun = true
  else if (arg.startsWith("--labels=")) flags.labels = arg.split("=")[1]
  else if (arg.startsWith("--batch=")) flags.batch = Number(arg.split("=")[1])
  else if (arg.startsWith("--max-attempts=")) flags.maxAttempts = Number(arg.split("=")[1])
  else if (arg === "--help" || arg === "-h") {
    console.log(`
Issue Resolver — Autonomous GitHub issue resolution pipeline.

Usage:  bun run scripts/issue-resolver/resolver.ts [flags]

Flags:
  --bugs-only       Only process issues labeled as bugs
  --labels=X,Y      Only process issues with these labels
  --batch=N         Issues per batch (default: 10)
  --max-attempts=N  Max attempts per issue (default: 3)
  --once            Process one batch and exit
  --dry-run         Fetch and select issues without processing
  --help            Show this help

Environment:
  GH_TOKEN          GitHub personal access token (required for closing issues)
`)
    process.exit(0)
  }
}

// ---- STATE ----

const state: ResolverState = {
  ...DEFAULT_STATE,
  bugsOnly: flags.bugsOnly === true,
  preferLabels: typeof flags.labels === "string" ? flags.labels.split(",") : DEFAULT_STATE.preferLabels,
  batchSize: typeof flags.batch === "number" ? flags.batch : DEFAULT_STATE.batchSize,
  maxAttempts: typeof flags.maxAttempts === "number" ? flags.maxAttempts : DEFAULT_STATE.maxAttempts,
}

// ---- MAIN LOOP ----

let totalProcessed = 0
let totalSuccess = 0
let totalSkipped = 0
let totalFailed = 0

async function main() {
  console.log(`🤖 Issue Resolver — ${new Date().toISOString()}`)
  console.log(`   Batch size: ${state.batchSize}`)
  console.log(`   Max attempts: ${state.maxAttempts}`)
  console.log(`   Bugs only: ${state.bugsOnly}`)
  console.log(`   Prefer labels: ${state.preferLabels.join(", ") || "none"}`)
  console.log(`   Exclude labels: ${state.excludeLabels.join(", ") || "none"}`)

  let iteration = 0

  while (true) {
    iteration++
    console.log(`\n${"#".repeat(72)}`)
    console.log(`Iteration ${iteration} — Fetching open issues...`)
    console.log(`${"#".repeat(72)}`)

    // 1. FETCH
    const allIssues = await fetchIssues({
      state: "open",
      perPage: Math.max(state.batchSize * 2, 50),
      sort: "created",
      direction: "desc",
    })

    console.log(`   Found ${allIssues.length} open issues`)

    // 2. FILTER & PRIORITIZE
    const eligible = allIssues.filter((issue) => {
      if (!hasSufficientInfo(issue)) return false
      if (state.excludeLabels.some((l) => issue.labels.includes(l))) return false
      if (state.bugsOnly && !issue.isBug) return false
      if (estimateComplexity(issue) > state.maxComplexity) return false
      return true
    })

    console.log(`   Eligible for processing: ${eligible.length}`)

    if (eligible.length === 0) {
      if (flags.dryRun) break
      console.log("\n✅ No eligible issues remaining. Waiting 60s before next check...")
      await sleep(60_000)
      continue
    }

    // Sort: bugs first, then by priority
    eligible.sort((a, b) => {
      // Bugs first
      if (a.isBug && !b.isBug) return -1
      if (!a.isBug && b.isBug) return 1
      // Then by priority
      const prioOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return (prioOrder[a.priority] ?? 2) - (prioOrder[b.priority] ?? 2)
    })

    // Take the batch
    const batch = eligible.slice(0, state.batchSize)

    console.log(`\n📋 Batch for iteration ${iteration}:`)
    for (const issue of batch) {
      const complexity = estimateComplexity(issue)
      console.log(`   #${issue.number} [${issue.priority}] [complexity: ${complexity}] ${issue.title.slice(0, 80)}`)
    }

    if (flags.dryRun) {
      console.log("\n🔍 Dry run — no issues were processed.")
      break
    }

    // 3. PROCESS BATCH
    console.log(`\n🚀 Processing batch of ${batch.length} issues...`)
    const results = await processBatch(batch, state)

    // 4. REPORT
    for (const r of results) {
      totalProcessed++
      if (r.success) totalSuccess++
      else if (r.skipped || r.tooComplex) totalSkipped++
      else totalFailed++
    }

    console.log(`\n${"=".repeat(72)}`)
    console.log(`📊 Batch ${iteration} complete`)
    console.log(`   Total processed: ${totalProcessed}`)
    console.log(`   Success: ${totalSuccess}`)
    console.log(`   Skipped: ${totalSkipped}`)
    console.log(`   Failed:  ${totalFailed}`)
    console.log(`   Remaining issues: ${eligible.length - batch.length} eligible not yet processed`)
    console.log(`${"=".repeat(72)}`)

    if (flags.once) break

    // Check if we've exhausted all issues
    const remaining = allIssues.length - batch.length
    if (remaining <= 0) {
      console.log("\n✅ All eligible issues processed. Waiting 120s before next check...")
      await sleep(120_000)
    }
  }

  // FINAL REPORT
  console.log(`\n${"🌟".repeat(36)}`)
  console.log(`🏁 Issue Resolver finished`)
  console.log(`   Total processed: ${totalProcessed}`)
  console.log(`   Success: ${totalSuccess}`)
  console.log(`   Skipped: ${totalSkipped}`)
  console.log(`   Failed:  ${totalFailed}`)
  console.log(`   Time: ${new Date().toISOString()}`)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

main().catch((error) => {
  console.error("\n💥 Fatal error:", error)
  process.exit(1)
})
