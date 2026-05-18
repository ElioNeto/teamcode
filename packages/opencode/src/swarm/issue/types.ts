// Issue types and schemas for the local issue tracker.
//
// Issues are stored as markdown files under `<worktree>/.opencode/data/`
// organized by priority and category directory layout:
//
//   .opencode/data/
//     summary.md
//     duplicates.md
//     01-critical/bugs.md
//     02-high/bugs.md
//     03-medium/bugs.md
//     03-medium/features.md
//     04-low/debt.md
//     04-low/docs.md
//     04-low/questions.md
//     04-low/uncategorized.md
import { Schema } from "effect"

// ---------------------------------------------------------------------------
// Priority & Category — map 1:1 to the directory layout
// ---------------------------------------------------------------------------

export const IssuePriority = Schema.Literals(["01-critical", "02-high", "03-medium", "04-low"])
export type IssuePriority = Schema.Schema.Type<typeof IssuePriority>

/** Human-readable label per priority level. */
export function priorityLabel(p: IssuePriority): string {
  switch (p) {
    case "01-critical": return "critical"
    case "02-high":     return "high"
    case "03-medium":   return "medium"
    case "04-low":      return "low"
  }
}

/** The subdirectory name under `.opencode/data/` for a given priority. */
export function priorityDir(priority: IssuePriority): string {
  return priority
}

export const IssueCategory = Schema.Literals([
  "bugs",
  "features",
  "debt",
  "docs",
  "questions",
  "uncategorized",
])
export type IssueCategory = Schema.Schema.Type<typeof IssueCategory>

/** The file name (without `.md` extension) for a given category. */
export function categoryFile(category: IssueCategory): string {
  return category
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export const IssueStatus = Schema.Literals([
  "open",
  "in_progress",
  "resolved",
  "closed",
  "wontfix",
  "duplicate",
])
export type IssueStatus = Schema.Schema.Type<typeof IssueStatus>

// ---------------------------------------------------------------------------
// Issue
// ---------------------------------------------------------------------------

export const IssueID = Schema.String.pipe(Schema.brand("IssueID"))
export type IssueID = Schema.Schema.Type<typeof IssueID>

export const IssueAuthor = Schema.Struct({
  login: Schema.String,
  url: Schema.optional(Schema.String),
})
export type IssueAuthor = Schema.Schema.Type<typeof IssueAuthor>

export const IssueComment = Schema.Struct({
  id: Schema.String,
  author: Schema.String,
  body: Schema.String,
  createdAt: Schema.String,
})
export type IssueComment = Schema.Schema.Type<typeof IssueComment>

export const Issue = Schema.Struct({
  /** Unique numeric identifier, e.g. "28065" from `#28065`. */
  id: IssueID,
  /** Short title (first line of the issue). */
  title: Schema.String,
  /** Full description / body. */
  description: Schema.String,
  /** Priority determines which subdirectory the issue lives in. */
  priority: IssuePriority,
  /** Category determines which file within the priority directory. */
  category: IssueCategory,
  /** Current status. */
  status: IssueStatus,
  /** Issue author metadata. */
  author: IssueAuthor,
  /** ISO date string of when the issue was created. */
  createdAt: Schema.String,
  /** ISO date string of last update (optional, inferred from file mtime). */
  updatedAt: Schema.optional(Schema.String),
  /** Number of comments (from metadata line). */
  commentCount: Schema.optional(Schema.Number),
  /** External URL (e.g. GitHub issue link). */
  url: Schema.optional(Schema.String),
  /** Inline comments stored with the issue. */
  comments: Schema.optional(Schema.Array(IssueComment)),
  /** Arbitrary labels/tags. */
  labels: Schema.optional(Schema.Array(Schema.String)),
  /** Opaque markdown sections that don't fit the standard fields. */
  sections: Schema.optional(Schema.Record(Schema.String, Schema.String)),
})
export type Issue = Schema.Schema.Type<typeof Issue>

// ---------------------------------------------------------------------------
// Issue file index — describes where each priority/category combo lives
// ---------------------------------------------------------------------------

/**
 * Every valid (priority, category) pair and the relative path of its
 * markdown file under `.opencode/data/`.
 */
export const ISSUE_FILE_INDEX: ReadonlyArray<{
  readonly priority: IssuePriority
  readonly category: IssueCategory
  readonly relativePath: string
}> = [
  { priority: "01-critical", category: "bugs",         relativePath: "01-critical/bugs.md" },
  { priority: "02-high",     category: "bugs",         relativePath: "02-high/bugs.md" },
  { priority: "03-medium",   category: "bugs",         relativePath: "03-medium/bugs.md" },
  { priority: "03-medium",   category: "features",     relativePath: "03-medium/features.md" },
  { priority: "04-low",      category: "debt",         relativePath: "04-low/debt.md" },
  { priority: "04-low",      category: "docs",         relativePath: "04-low/docs.md" },
  { priority: "04-low",      category: "questions",    relativePath: "04-low/questions.md" },
  { priority: "04-low",      category: "uncategorized", relativePath: "04-low/uncategorized.md" },
]

// ---------------------------------------------------------------------------
// Summary & duplicates
// ---------------------------------------------------------------------------

export const IssueSummary = Schema.Struct({
  /** Markdown content of the summary file. */
  content: Schema.String,
  /** ISO date when the summary was last generated. */
  generatedAt: Schema.optional(Schema.String),
})
export type IssueSummary = Schema.Schema.Type<typeof IssueSummary>

export const IssueDuplicates = Schema.Struct({
  /** Markdown content of the duplicates file. */
  content: Schema.String,
})
export type IssueDuplicates = Schema.Schema.Type<typeof IssueDuplicates>

export const DataDirFiles = Schema.Struct({
  summary: Schema.optional(Schema.String),
  duplicates: Schema.optional(Schema.String),
  issues: Schema.Array(Issue),
})

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export const IssueFilter = Schema.Struct({
  priority: Schema.optional(IssuePriority),
  category: Schema.optional(IssueCategory),
  status: Schema.optional(IssueStatus),
  search: Schema.optional(Schema.String),
})
export type IssueFilter = Schema.Schema.Type<typeof IssueFilter>

// ---------------------------------------------------------------------------
// Swarm integration — an issue provides context for swarm execution
// ---------------------------------------------------------------------------

/**
 * When a swarm is created from an issue, this payload describes the
 * relationship between the swarm run and the issue.
 */
export const IssueSwarmContext = Schema.Struct({
  issueID: IssueID,
  swarmID: Schema.String,
  action: Schema.Literals(["resolve", "investigate", "review", "triage"]),
  title: Schema.String,
})
export type IssueSwarmContext = Schema.Schema.Type<typeof IssueSwarmContext>

export * as IssueTypes from "./types"
