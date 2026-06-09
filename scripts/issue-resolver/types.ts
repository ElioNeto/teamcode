/**
 * Types for the autonomous issue resolver.
 */

export type IssueStatus = "open" | "closed"
export type Priority = "low" | "medium" | "high" | "critical"
export type Phase = "p0-critical" | "p1-high" | "p2-medium" | "p3-low" | "unphased"

export interface GitHubIssue {
  number: number
  title: string
  body: string
  state: IssueStatus
  labels: string[]
  html_url: string
  created_at: string
  updated_at: string
  /** Whether this issue is a bug */
  isBug: boolean
  priority: Priority
  /** Phase label (p0-critical, p1-high, etc.) */
  phase: Phase
  /** Scope labels (scope:core-engine, scope:providers, etc.) */
  scopes: string[]
}

export type PipelineStage =
  | "fetch"
  | "select"
  | "plan"
  | "implement"
  | "validate"
  | "review"
  | "commit"
  | "close"
  | "done"

export interface IssueContext {
  issue: GitHubIssue
  /** Current attempt number (starts at 1) */
  attempt: number
  /** Max attempts before giving up */
  maxAttempts: number
  /** Current pipeline stage */
  stage: PipelineStage
  /** Error from last failed stage */
  lastError?: string
  /** Whether the issue was deemed too complex for automatic resolution */
  tooComplex?: boolean
  /** Files changed during implementation */
  changedFiles?: string[]
  /** Commit hash after successful commit */
  commitHash?: string
}

export interface PipelineResult {
  issue: GitHubIssue
  success: boolean
  skipped: boolean
  tooComplex: boolean
  attempts: number
  error?: string
  commitHash?: string
  durationMs: number
}

export interface ResolverState {
  /** Batch configuration */
  batchSize: number
  /** Number of parallel workers */
  parallel: number
  /** Labels to prefer (sorted first) */
  preferLabels: string[]
  /** Labels to exclude */
  excludeLabels: string[]
  /** Only bugs */
  bugsOnly: boolean
  /** Max attempts per issue */
  maxAttempts: number
  /** Max complexity score before skipping */
  maxComplexity: number
  /** Whether to skip issues without clear reproduction steps */
  requireReproduction: boolean
  /** Filter by phase (p0-critical, p1-high, etc.) */
  phaseFilter?: Phase
  /** Filter by scope (core-engine, providers, etc.) */
  scopeFilter?: string
  /** Path to checkpoint file */
  checkpointFile: string
  /** Current phase being processed */
  currentPhase: Phase
}

/**
 * Snapshot of resolver progress for checkpointing.
 */
export interface Checkpoint {
  updatedAt: string
  currentPhase: Phase
  processedIssues: number[]
  skippedIssues: number[]
  failedIssues: number[]
  stats: {
    totalProcessed: number
    totalSuccess: number
    totalSkipped: number
    totalFailed: number
    totalTooComplex: number
  }
}

export const PHASE_ORDER: Phase[] = ["p0-critical", "p1-high", "p2-medium", "p3-low", "unphased"]
export const SCOPE_ORDER = [
  "core-engine",
  "agent-system",
  "providers",
  "code-tools",
  "tui",
  "desktop",
  "stability",
  "infrastructure",
  "features",
  "plugins",
  "mcp",
  "web",
  "platform",
]
