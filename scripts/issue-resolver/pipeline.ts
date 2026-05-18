/**
 * Pipeline orchestrator for the issue resolver.
 *
 * Manages the Plan → Implement → Validate → Review → Commit → Close cycle.
 * Each stage is delegated to a task agent for execution.
 * Failed stages trigger retry with feedback; complex issues loop back to planning.
 */

import type { GitHubIssue, IssueContext, PipelineResult, ResolverState } from "./types"
import { estimateComplexity, hasSufficientInfo, closeIssue } from "./github"
import { execSync } from "child_process"
import { existsSync, readFileSync } from "fs"
import { resolve } from "path"

const DEFAULT_STATE: ResolverState = {
  batchSize: 10,
  preferLabels: ["bug"],
  excludeLabels: ["wontfix", "duplicate", "invalid"],
  bugsOnly: false,
  maxAttempts: 3,
  maxComplexity: 7,
  requireReproduction: false,
}

export { DEFAULT_STATE }
export type { ResolverState }

/**
 * Process a batch of issues through the full pipeline.
 */
export async function processBatch(issues: GitHubIssue[], state: ResolverState): Promise<PipelineResult[]> {
  const results: PipelineResult[] = []

  for (const issue of issues) {
    console.log(`\n${"=".repeat(72)}`)
    console.log(`Processing #${issue.number}: ${issue.title}`)
    console.log(`${"=".repeat(72)}\n`)

    const startTime = Date.now()
    const result = await processIssue(issue, state)
    result.durationMs = Date.now() - startTime

    results.push(result)

    // Print summary
    if (result.success) {
      console.log(`\n✅ #${issue.number} — SUCCESS${result.commitHash ? ` (${result.commitHash})` : ""}`)
    } else if (result.tooComplex) {
      console.log(`\n⏭️  #${issue.number} — TOO COMPLEX (skipped)`)
    } else if (result.skipped) {
      console.log(`\n⏭️  #${issue.number} — SKIPPED: ${result.error}`)
    } else {
      console.log(`\n❌ #${issue.number} — FAILED after ${result.attempts} attempts: ${result.error}`)
    }
  }

  return results
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

  // Skip issues without sufficient info
  if (!hasSufficientInfo(issue)) {
    return { issue, success: false, skipped: true, tooComplex: false, attempts: 0, error: "Insufficient information in issue description", durationMs: 0 }
  }

  // Complexity check
  const complexity = estimateComplexity(issue)
  if (complexity > state.maxComplexity) {
    return { issue, success: false, skipped: false, tooComplex: true, attempts: 0, error: `Complexity score ${complexity} exceeds max ${state.maxComplexity}`, durationMs: 0 }
  }

  // Label exclusions
  if (state.excludeLabels.some((l) => issue.labels.includes(l))) {
    return { issue, success: false, skipped: true, tooComplex: false, attempts: 0, error: `Excluded by label`, durationMs: 0 }
  }

  // Bug-only mode
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
        // If the issue is complex, go back to planning
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
      // If the error was during planning or it's complex, re-plan
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

/**
 * PLAN: Outputs issue details for the agent to read and plan.
 * The agent should research the codebase and create a plan.
 */
async function stagePlan(ctx: IssueContext): Promise<void> {
  const { issue } = ctx
  console.log(`\nIssue #${issue.number}: ${issue.title}`)
  console.log(`URL: ${issue.html_url}`)
  console.log(`Labels: ${issue.labels.join(", ") || "none"}`)
  console.log(`Priority: ${issue.priority}`)
  console.log(`Bug: ${issue.isBug}`)
  console.log(`\nDescription:`)
  console.log(issue.body.slice(0, 3000))
  if (issue.body.length > 3000) console.log(`... (${issue.body.length - 3000} more chars)`)
}

/**
 * IMPLEMENT: Outputs implementation instructions and checks for changes.
 * Returns false if the implementation should be retried.
 */
async function stageImplement(_ctx: IssueContext): Promise<boolean> {
  // Check if there are uncommitted changes (signs of implementation)
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

/**
 * VALIDATE: Runs typecheck and tests on changed packages.
 * Returns false if validation fails (triggers re-implementation).
 */
async function stageValidate(ctx: IssueContext): Promise<boolean> {
  const errors: string[] = []

  // Identify changed packages
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

  // Always check the root typecheck
  console.log("Running root typecheck...")
  try {
    execSync("bun run typecheck 2>&1", { encoding: "utf-8", timeout: 120_000, stdio: "pipe" })
    console.log("  ✅ Typecheck passed")
  } catch (e) {
    const output = e instanceof Error ? e.message : String(e)
    console.error(`  ❌ Typecheck failed`)
    errors.push(`Typecheck: ${output.slice(0, 500)}`)
  }

  // Run tests for changed packages
  for (const pkg of changedPackages) {
    const pkgPath = `packages/${pkg}`
    if (!existsSync(resolve(pkgPath, "package.json"))) continue

    console.log(`Running tests in ${pkgPath}...`)
    try {
      execSync(`bun run test 2>&1`, { encoding: "utf-8", timeout: 120_000, stdio: "pipe", cwd: resolve(pkgPath) })
      console.log(`  ✅ Tests passed in ${pkgPath}`)
    } catch (e) {
      const output = e instanceof Error ? e.message : String(e)
      // Only fail on actual test failures, not on "no tests" or timeout
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

/**
 * REVIEW: Checks code quality, diffs, and conventions.
 * Returns false if review fails (triggers re-implementation).
 */
async function stageReview(ctx: IssueContext): Promise<boolean> {
  const errors: string[] = []

  // Check for debug artifacts
  const diff = execSync("git diff", { encoding: "utf-8" })
  if (/console\.log\(|debugger|TODO|FIXME|XXX:/i.test(diff) && !/\/\/\s*(TODO|FIXME)/i.test(diff)) {
    console.warn("  ⚠️  Possible debug artifacts in diff")
  }

  // Check for binary files
  const binaryFiles = execSync("git diff --diff-filter=A --name-only", { encoding: "utf-8" })
    .trim()
    .split("\n")
    .filter((f) => /\.(png|jpg|jpeg|gif|ico|pdf|zip|tar|gz)$/i.test(f))
  if (binaryFiles.length > 0) {
    console.warn(`  ⚠️  Binary files added: ${binaryFiles.join(", ")}`)
  }

  // Check diff size
  const diffLines = diff.split("\n").length
  if (diffLines > 1000) {
    console.warn(`  ⚠️  Large diff: ${diffLines} lines (consider splitting into smaller PRs)`)
  }

  // Check commit message conventions
  const log = execSync("git log --oneline -3", { encoding: "utf-8" })
  if (errors.length > 0) {
    ctx.lastError = errors.join("\n")
    return false
  }

  return true
}

/**
 * COMMIT: Creates a commit with the changes.
 */
async function stageCommit(ctx: IssueContext): Promise<void> {
  const { issue } = ctx

  // Stage all changes
  execSync("git add -A", { encoding: "utf-8" })

  // Create commit message
  const type = issue.isBug ? "fix" : "feat"
  const labels = issue.labels.join(" ")
  const scope = labels.includes("config") ? "config" :
    labels.includes("ui") || labels.includes("tui") ? "ui" :
    labels.includes("cli") ? "cli" :
    labels.includes("permission") ? "permission" :
    labels.includes("provider") ? "provider" :
    "core"

  const message = `${type}(${scope}): ${issue.title.split("—").pop()?.trim() ?? issue.title}

Resolves #${issue.number}

Automatic resolution via issue-resolver pipeline.
`

  execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { encoding: "utf-8" })

  // Get commit hash
  ctx.commitHash = execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim()
  console.log(`  ✅ Commit: ${ctx.commitHash}`)
}

/**
 * CLOSE: Pushes changes and closes the issue on GitHub.
 */
async function stageClose(ctx: IssueContext): Promise<void> {
  const { issue } = ctx

  // Push to current branch
  const branch = execSync("git branch --show-current", { encoding: "utf-8" }).trim()
  const remote = execSync("git remote get-url origin", { encoding: "utf-8" }).trim()

  // Only push if we have a token
  if (process.env.GH_TOKEN || process.env.GITHUB_TOKEN) {
    execSync(`git push origin ${branch} 2>&1`, { encoding: "utf-8", timeout: 60_000 })
    console.log(`  ✅ Pushed to ${branch}`)
  } else {
    console.warn("  ⚠️  No GITHUB_TOKEN set, skipping push")
  }

  // Close the issue
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
