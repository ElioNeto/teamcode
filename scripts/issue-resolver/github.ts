/**
 * GitHub API client for the issue resolver.
 *
 * Uses the GH_TOKEN environment variable for authentication.
 * Falls back to unauthenticated requests if no token is set.
 */

import type { GitHubIssue, IssueStatus } from "./types"

const REPO = "ElioNeto/teamcode"
const API = "https://api.github.com"

function authHeaders(): Record<string, string> {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API}${path}`, { headers: authHeaders() })
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${response.statusText} — ${path}`)
  }
  return response.json() as Promise<T>
}

async function apiPatch(path: string, body: unknown): Promise<void> {
  const response = await fetch(`${API}${path}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(`GitHub API PATCH ${response.status}: ${response.statusText} — ${text.slice(0, 200)}`)
  }
}

export interface FetchIssuesOptions {
  state?: "open" | "closed"
  labels?: string[]
  perPage?: number
  page?: number
  sort?: "created" | "updated" | "comments"
  direction?: "asc" | "desc"
}

/**
 * Fetch issues from the repository.
 */
export async function fetchIssues(options: FetchIssuesOptions = {}): Promise<GitHubIssue[]> {
  const params = new URLSearchParams()
  params.set("state", options.state ?? "open")
  params.set("per_page", String(options.perPage ?? 50))
  params.set("page", String(options.page ?? 1))
  params.set("sort", options.sort ?? "created")
  params.set("direction", options.direction ?? "desc")
  if (options.labels?.length) params.set("labels", options.labels.join(","))

  const raw = await apiGet<any[]>(`/repos/${REPO}/issues?${params}`)
  return raw
    .filter((i) => !i.pull_request) // exclude PRs
    .map(mapIssue)
}

/**
 * Fetch a single issue by number.
 */
export async function fetchIssue(number: number): Promise<GitHubIssue> {
  const raw = await apiGet<any>(`/repos/${REPO}/issues/${number}`)
  return mapIssue(raw)
}

/**
 * Close an issue with a comment.
 */
export async function closeIssue(number: number, comment?: string): Promise<void> {
  if (comment) {
    await apiPatch(`/repos/${REPO}/issues/${number}/comments`, { body: comment })
  }
  await apiPatch(`/repos/${REPO}/issues/${number}`, {
    state: "closed",
    state_reason: "completed",
  })
}

/**
 * Reopen an issue.
 */
export async function reopenIssue(number: number): Promise<void> {
  await apiPatch(`/repos/${REPO}/issues/${number}`, { state: "open" })
}

/**
 * Add a comment to an issue.
 */
export async function commentOnIssue(number: number, body: string): Promise<void> {
  await apiPatch(`/repos/${REPO}/issues/${number}/comments`, { body })
}

function mapIssue(raw: any): GitHubIssue {
  const labels: string[] = raw.labels?.map((l: any) => l.name ?? l) ?? []
  const title = raw.title ?? ""
  return {
    number: raw.number,
    title,
    body: raw.body ?? "",
    state: raw.state,
    labels,
    html_url: raw.html_url,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    isBug: labels.some((l) => /bug/i.test(l)) || /bug/i.test(title),
    priority: inferPriority(labels, title),
  }
}

function inferPriority(labels: string[], title: string): "low" | "medium" | "high" | "critical" {
  if (labels.some((l) => /critical/i.test(l))) return "critical"
  if (labels.some((l) => /high/i.test(l))) return "high"
  if (labels.some((l) => /low/i.test(l))) return "low"
  // Bugs default to medium-high
  if (labels.some((l) => /bug/i.test(l))) return "medium"
  return "medium"
}

/**
 * Estimate issue complexity based on body length, labels, and description detail.
 * Returns a score 1-10.
 */
export function estimateComplexity(issue: GitHubIssue): number {
  let score = 3 // base
  if (issue.isBug) score += 1
  if (issue.labels.includes("enhancement")) score += 2
  if (issue.labels.includes("feature")) score += 3
  // Longer descriptions usually mean more well-defined issues
  if (issue.body.length > 500) score -= 1
  if (issue.body.length > 2000) score -= 1
  // Issues with reproduction steps are easier
  if (/steps to reproduce/i.test(issue.body)) score -= 1
  if (/expected/i.test(issue.body) && /actual/i.test(issue.body)) score -= 1
  return Math.max(1, Math.min(10, score))
}

/**
 * Check if an issue has enough information to work on.
 */
export function hasSufficientInfo(issue: GitHubIssue): boolean {
  if (!issue.body || issue.body.trim().length < 50) return false
  // Must have at least a title and some body content
  return true
}
