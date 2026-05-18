/**
 * Types for the autonomous issue resolver.
 */

export type IssueStatus = "open" | "closed"
export type Priority = "low" | "medium" | "high" | "critical"

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
}
