/**
 * Pipeline orchestrator for the issue resolver.
 *
 * Manages the Plan → Implement → Validate → Review → Commit → Close cycle.
 * Supports parallel batch processing, checkpointing, and phase-based triage.
 */

import type { GitHubIssue, IssueContext, PipelineResult, ResolverState, Checkpoint, Phase } from "./types"
import { PHASE_ORDER } from "./types"
import { estimateComplexity, hasSufficientInfo, closeIssue, commentOnIssue } from "./github"
import { execSync } from "child_process"
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs"
import { resolve, dirname } from "path"

const DEFAULT_STATE: ResolverState = {
  batchSize: 10,
  parallel: 3,
  preferLabels: ["bug"],
  excludeLabels: ["wontfix", "duplicate", "invalid"],
  bugsOnly: false,
  maxAttempts: 3,
  maxComplexity: 7,
  requireReproduction: false,
  checkpointFile: ".issue-resolver-checkpoint.json",
  currentPhase: "p0-critical",
}

export { DEFAULT_STATE }
export type { ResolverState }

/**
 * Process a batch of issues through the full pipeline.
 * Issues within a batch are processed in parallel (up to `state.parallel` at a time).
 */
export async function processBatch(issues: GitHubIssue[], state: ResolverState): Promise<PipelineResult[]> {
  const results: PipelineResult[] = []
  const queue = [...issues]
  const inFlight = new Set<Promise<void>>()
  const semaphore = state.parallel ?? 3

  console.log(`\n🚀 Processing batch of ${queue.length} issues (parallel=${semaphore})`)

  // Process issues concurrently using a simple semaphore
  while (queue.length > 0 || inFlight.size > 0) {
    // Fill up to the semaphore limit
    while (queue.length > 0 && inFlight.size < semaphore) {
      const issue = queue.shift()!
      const promise = processIssueWithLogging(issue, state).then((result) => {
        results.push(result)
        inFlight.delete(promise)
      })
      inFlight.add(promise)
    }

    // Wait for at least one to finish
    if (inFlight.size > 0) {
      await Promise.race(inFlight)
    }
  }

  // Save checkpoint after batch
  saveCheckpoint(results, state)

  // Print batch summary
  printBatchSummary(results)

  return results
}

async function processIssueWithLogging(issue: GitHubIssue, state: ResolverState): Promise<PipelineResult> {
  const startTime = Date.now()
  console.log(`\n${"=".repeat(72)}`)
  console.log(`[${new Date().toISOString()}] Processing #${issue.number}: ${issue.title}`)
  console.log(`  Phase: ${issue.phase} | Scopes: ${issue.scopes.join(", ") || "none"} | Priority: ${issue.priority}`)
  console.log(`  URL: ${issue.html_url}`)
  console.log(`${"=".repeat(72)}\n`)

  const result = await processIssue(issue, state)
  result.durationMs = Date.now() - startTime

  if (result.success) {
    console.log(`\n✅ #${issue.number} — SUCCESS${result.commitHash ? ` (${result.commitHash})` : ""} [${(result.durationMs / 1000).toFixed(1)}s]`)
  } else if (result.tooComplex) {
    console.log(`\n⏭️  #${issue.number} — TOO COMPLEX (skipped) [${(result.durationMs / 1000).toFixed(1)}s]`)
  } else if (result.skipped) {
    console.log(`\n⏭️  #${issue.number} — SKIPPED: ${result.error} [${(result.durationMs / 1000).toFixed(1)}s]`)
  } else {
    console.log(`\n❌ #${issue.number} — FAILED after ${result.attempts} attempts: ${result.error} [${(result.durationMs / 1000).toFixed(1)}s]`)
  }

  return result
}

/**
 * Process a single issue through Plan → Implement → Validate → Review → Commit → Close.
 */
async function processIssue(issue: GitHubIssue, state: ResolverState): Promise<PipelineResult> {
  const ctx: IssueContext = {
    issue,
    attempt: 0,
    maxAttempts: state.maxAttempts,
    stage: "select",
  }

  // --- SELECTION GATES ---

  if (!hasSufficientInfo(issue)) {
    return { issue, success: false, skipped: true, tooComplex: false, attempts: 0, error: "Insufficient information in issue description", durationMs: 0 }
  }

  const complexity = estimateComplexity(issue)
  if (complexity > state.maxComplexity) {
    return { issue, success: false, skipped: false, tooComplex: true, attempts: 0, error: `Complexity score ${complexity} exceeds max ${state.maxComplexity}`, durationMs: 0 }
  }

  if (state.excludeLabels.some((l) => issue.labels.includes(l))) {
    return { issue, success: false, skipped: true, tooComplex: false, attempts: 0, error: `Excluded by label`, durationMs: 0 }
  }

  if (state.bugsOnly && !issue.isBug) {
    return { issue, success: false, skipped: true, tooComplex: false, attempts: 0, error: "Not a bug (bug-only mode)", durationMs: 0 }
  }

  ctx.stage = "plan"
  ctx.attempt = 1

  while (ctx.attempt <= ctx.maxAttempts) {
    try {
      // --- PLAN ---
      console.log(`\n📋 Stage: PLAN (attempt ${ctx.attempt}/${ctx.maxAttempts})`)
      await stagePlan(ctx)
      ctx.stage = "implement"

      // --- IMPLEMENT ---
      console.log(`\n🔧 Stage: IMPLEMENT (attempt ${ctx.attempt}/${ctx.maxAttempts})`)
      const implementOk = await stageImplement(ctx)
      if (!implementOk) {
        ctx.lastError = "Implementation stage returned failure"
        ctx.attempt++
        ctx.stage = "plan"
        continue
      }
      ctx.stage = "validate"

      // --- VALIDATE ---
      console.log(`\n🔍 Stage: VALIDATE (attempt ${ctx.attempt}/${ctx.maxAttempts})`)
      const validateOk = await stageValidate(ctx)
      if (!validateOk) {
        ctx.lastError = "Validation failed"
        ctx.attempt++
        ctx.stage = "implement"
        continue
      }
      ctx.stage = "review"

      // --- REVIEW ---
      console.log(`\n👁️  Stage: REVIEW (attempt ${ctx.attempt}/${ctx.maxAttempts})`)
      const reviewOk = await stageReview(ctx)
      if (!reviewOk) {
        ctx.lastError = "Review failed"
        if (complexity >= 5) {
          ctx.stage = "plan"
        } else {
          ctx.stage = "implement"
        }
        ctx.attempt++
        continue
      }
      ctx.stage = "commit"

      // --- COMMIT ---
      console.log(`\n💾 Stage: COMMIT`)
      await stageCommit(ctx)
      ctx.stage = "close"

      // --- CLOSE ---
      console.log(`\n✅ Stage: CLOSE`)
      await stageClose(ctx)
      ctx.stage = "done"

      return {
        issue,
        success: true,
        skipped: false,
        tooComplex: false,
        attempts: ctx.attempt,
        commitHash: ctx.commitHash,
        durationMs: 0,
      }
    } catch (error) {
      ctx.lastError = error instanceof Error ? error.message : String(error)
      console.error(`\n⚠️  Error during ${ctx.stage}: ${ctx.lastError}`)

      if (ctx.attempt >= ctx.maxAttempts) {
        // Comment on issue explaining failure
        try {
          await commentOnIssue(issue.number, `Automatic resolution attempted ${ctx.maxAttempts} times without success.\n\nLast error: ${ctx.lastError}\n\nSkipping — needs manual triage.`)
        } catch { /* ignore comment errors */ }

        return {
          issue,
          success: false,
          skipped: false,
          tooComplex: false,
          attempts: ctx.attempt,
          error: ctx.lastError,
          durationMs: 0,
        }
      }

      ctx.attempt++
      if (ctx.stage === "plan" || complexity >= 5) {
        ctx.stage = "plan"
      } else {
        ctx.stage = "implement"
      }
    }
  }

  return {
    issue,
    success: false,
    skipped: false,
    tooComplex: false,
    attempts: ctx.attempt,
    error: ctx.lastError,
    durationMs: 0,
  }
}

// --- STAGE HELPERS ---

async function stagePlan(ctx: IssueContext): Promise<void> {
  const { issue } = ctx
  console.log(`\nIssue #${issue.number}: ${issue.title}`)
  console.log(`URL: ${issue.html_url}`)
  console.log(`Labels: ${issue.labels.join(", ") || "none"}`)
  console.log(`Priority: ${issue.priority}`)
  console.log(`Phase: ${issue.phase}`)
  console.log(`Scopes: ${issue.scopes.join(", ") || "none"}`)
  console.log(`Bug: ${issue.isBug}`)
  console.log(`\nDescription:`)
  console.log(issue.body.slice(0, 3000))
  if (issue.body.length > 3000) console.log(`... (${issue.body.length - 3000} more chars)`)
}

async function stageImplement(_ctx: IssueContext): Promise<boolean> {
  const status = execSync("git status --porcelain", { encoding: "utf-8" }).trim()
  if (!status) {
    console.warn("⚠️  No changes detected after implementation stage")
    return false
  }
  const changed = status.split("\n").filter(Boolean)
  console.log(`📝 Changed files (${changed.length}):`)
  for (const line of changed) {
    console.log(`   ${line}`)
  }
  return true
}

async function stageValidate(ctx: IssueContext): Promise<boolean> {
  const errors: string[] = []

  const changedFiles = execSync("git diff --name-only", { encoding: "utf-8" })
    .trim()
    .split("\n")
    .filter(Boolean)
  ctx.changedFiles = changedFiles

  const changedPackages = new Set<string>()
  for (const file of changedFiles) {
    const match = file.match(/^packages\/([^/]+)/)
    if (match) changedPackages.add(match[1])
  }

  console.log("Running root typecheck...")
  try {
    execSync("bun run typecheck 2>&1", { encoding: "utf-8", timeout: 120_000, stdio: "pipe" })
    console.log("  ✅ Typecheck passed")
  } catch (e) {
    const output = e instanceof Error ? e.message : String(e)
    console.error(`  ❌ Typecheck failed`)
    errors.push(`Typecheck: ${output.slice(0, 500)}`)
  }

  for (const pkg of changedPackages) {
    const pkgPath = `packages/${pkg}`
    if (!existsSync(resolve(pkgPath, "package.json"))) continue

    console.log(`Running tests in ${pkgPath}...`)
    try {
      execSync(`bun run test 2>&1`, { encoding: "utf-8", timeout: 120_000, stdio: "pipe", cwd: resolve(pkgPath) })
      console.log(`  ✅ Tests passed in ${pkgPath}`)
    } catch (e) {
      const output = e instanceof Error ? e.message : String(e)
      if (!output.includes("no tests")) {
        console.error(`  ❌ Tests failed in ${pkgPath}`)
        errors.push(`Tests (${pkgPath}): ${output.slice(0, 500)}`)
      }
    }
  }

  if (errors.length > 0) {
    ctx.lastError = errors.join("\n")
    return false
  }

  return true
}

async function stageReview(ctx: IssueContext): Promise<boolean> {
  const errors: string[] = []

  const diff = execSync("git diff", { encoding: "utf-8" })
  if (/console\.log\(|debugger|TODO|FIXME|XXX:/i.test(diff) && !/\/\/\s*(TODO|FIXME)/i.test(diff)) {
    console.warn("  ⚠️  Possible debug artifacts in diff")
  }

  const binaryFiles = execSync("git diff --diff-filter=A --name-only", { encoding: "utf-8" })
    .trim()
    .split("\n")
    .filter((f) => /\.(png|jpg|jpeg|gif|ico|pdf|zip|tar|gz)$/i.test(f))
  if (binaryFiles.length > 0) {
    console.warn(`  ⚠️  Binary files added: ${binaryFiles.join(", ")}`)
  }

  const diffLines = diff.split("\n").length
  if (diffLines > 1000) {
    console.warn(`  ⚠️  Large diff: ${diffLines} lines (consider splitting into smaller PRs)`)
  }

  if (errors.length > 0) {
    ctx.lastError = errors.join("\n")
    return false
  }

  return true
}

async function stageCommit(ctx: IssueContext): Promise<void> {
  const { issue } = ctx

  execSync("git add -A", { encoding: "utf-8" })

  const type = issue.isBug ? "fix" : "feat"
  const scope = determineScope(issue)

  const message = `${type}(${scope}): ${issue.title.split("—").pop()?.trim() ?? issue.title}

Resolves #${issue.number}

Automatic resolution via issue-resolver pipeline.
`

  execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { encoding: "utf-8" })

  ctx.commitHash = execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim()
  console.log(`  ✅ Commit: ${ctx.commitHash}`)
}

async function stageClose(ctx: IssueContext): Promise<void> {
  const { issue } = ctx

  const branch = execSync("git branch --show-current", { encoding: "utf-8" }).trim()
  const remote = execSync("git remote get-url origin", { encoding: "utf-8" }).trim()

  if (process.env.GH_TOKEN || process.env.GITHUB_TOKEN) {
    execSync(`git push origin ${branch} 2>&1`, { encoding: "utf-8", timeout: 60_000 })
    console.log(`  ✅ Pushed to ${branch}`)
  } else {
    console.warn("  ⚠️  No GITHUB_TOKEN set, skipping push")
  }

  if (process.env.GH_TOKEN) {
    await closeIssue(
      issue.number,
      `Resolved automatically by issue-resolver pipeline.\n\nCommit: ${ctx.commitHash ?? "unknown"}`,
    )
    console.log(`  ✅ Issue #${issue.number} closed`)
  } else {
    console.warn("  ⚠️  No GH_TOKEN set, skipping issue close")
  }
}

function determineScope(issue: GitHubIssue): string {
  if (issue.scopes.includes("core-engine")) return "core"
  if (issue.scopes.includes("providers")) return "provider"
  if (issue.scopes.includes("code-tools")) return "tools"
  if (issue.scopes.includes("tui")) return "tui"
  if (issue.scopes.includes("desktop")) return "desktop"
  if (issue.scopes.includes("agent-system")) return "agent"
  if (issue.scopes.includes("plugins")) return "plugins"
  if (issue.scopes.includes("mcp")) return "mcp"
  if (issue.scopes.includes("web")) return "web"
  if (issue.scopes.includes("infrastructure")) return "infra"
  if (issue.scopes.includes("stability")) return "stability"
  if (issue.scopes.includes("features")) return "features"
  if (issue.scopes.includes("platform")) return "platform"
  return "core"
}

// --- CHECKPOINT SYSTEM ---

export function loadCheckpoint(checkpointFile: string): Checkpoint | null {
  try {
    if (existsSync(checkpointFile)) {
      const data = readFileSync(checkpointFile, "utf-8")
      return JSON.parse(data) as Checkpoint
    }
  } catch (e) {
    console.warn(`⚠️  Could not load checkpoint: ${e}`)
  }
  return null
}

export function saveCheckpoint(results: PipelineResult[], state: ResolverState): void {
  try {
    const existing = loadCheckpoint(state.checkpointFile)
    const checkpoint: Checkpoint = {
      updatedAt: new Date().toISOString(),
      currentPhase: state.currentPhase,
      processedIssues: [
        ...(existing?.processedIssues ?? []),
        ...results.filter((r) => r.success).map((r) => r.issue.number),
      ],
      skippedIssues: [
        ...(existing?.skippedIssues ?? []),
        ...results.filter((r) => r.skipped || r.tooComplex).map((r) => r.issue.number),
      ],
      failedIssues: [
        ...(existing?.failedIssues ?? []),
        ...results.filter((r) => !r.success && !r.skipped && !r.tooComplex).map((r) => r.issue.number),
      ],
      stats: {
        totalProcessed: (existing?.stats.totalProcessed ?? 0) + results.length,
        totalSuccess: (existing?.stats.totalSuccess ?? 0) + results.filter((r) => r.success).length,
        totalSkipped: (existing?.stats.totalSkipped ?? 0) + results.filter((r) => r.skipped || r.tooComplex).length,
        totalFailed: (existing?.stats.totalFailed ?? 0) + results.filter((r) => !r.success && !r.skipped && !r.tooComplex).length,
        totalTooComplex: (existing?.stats.totalTooComplex ?? 0) + results.filter((r) => r.tooComplex).length,
      },
    }

    const dir = dirname(resolve(state.checkpointFile))
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(state.checkpointFile, JSON.stringify(checkpoint, null, 2))
    console.log(`\n💾 Checkpoint saved to ${state.checkpointFile}`)
  } catch (e) {
    console.warn(`⚠️  Could not save checkpoint: ${e}`)
  }
}

export function printCheckpointSummary(checkpoint: Checkpoint): void {
  console.log(`\n📊 Checkpoint Summary:`)
  console.log(`   Last updated: ${checkpoint.updatedAt}`)
  console.log(`   Current phase: ${checkpoint.currentPhase}`)
  console.log(`   Total processed: ${checkpoint.stats.totalProcessed}`)
  console.log(`   Success: ${checkpoint.stats.totalSuccess}`)
  console.log(`   Skipped: ${checkpoint.stats.totalSkipped}`)
  console.log(`   Too complex: ${checkpoint.stats.totalTooComplex}`)
  console.log(`   Failed: ${checkpoint.stats.totalFailed}`)
  console.log(`   Processed issues: ${checkpoint.processedIssues.length}`)
  console.log(`   Skipped issues: ${checkpoint.skippedIssues.length}`)
  console.log(`   Failed issues: ${checkpoint.failedIssues.length}`)
}

function printBatchSummary(results: PipelineResult[]): void {
  const success = results.filter((r) => r.success).length
  const skipped = results.filter((r) => r.skipped || r.tooComplex).length
  const failed = results.filter((r) => !r.success && !r.skipped && !r.tooComplex).length
  const totalTime = results.reduce((acc, r) => acc + r.durationMs, 0)

  console.log(`\n${"=".repeat(72)}`)
  console.log(`📊 Batch Complete`)
  console.log(`   Total: ${results.length}`)
  console.log(`   ✅ Success: ${success}`)
  console.log(`   ⏭️  Skipped: ${skipped}`)
  console.log(`   ❌ Failed:  ${failed}`)
  console.log(`   ⏱  Total time: ${(totalTime / 1000).toFixed(1)}s`)
  console.log(`   ⏱  Avg time: ${(totalTime / 1000 / Math.max(1, results.length)).toFixed(1)}s`)
  console.log(`${"=".repeat(72)}`)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
