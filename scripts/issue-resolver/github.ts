/**
 * GitHub API client for the issue resolver.
 *
 * Uses the GH_TOKEN environment variable for authentication.
 * Falls back to unauthenticated requests if no token is set.
 */

import type { GitHubIssue, IssueStatus, Phase, Priority } from "./types"

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

async function apiPost(path: string, body: unknown): Promise<void> {
  const response = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(`GitHub API POST ${response.status}: ${response.statusText} — ${text.slice(0, 200)}`)
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
 * Fetch all issues from the repository, paginating through all pages.
 */
export async function fetchAllIssues(options: FetchIssuesOptions = {}): Promise<GitHubIssue[]> {
  const all: GitHubIssue[] = []
  let page = options.page ?? 1
  const perPage = options.perPage ?? 100
  let totalFetched = 0

  while (true) {
    const params = new URLSearchParams()
    params.set("state", options.state ?? "open")
    params.set("per_page", String(perPage))
    params.set("page", String(page))
    params.set("sort", options.sort ?? "created")
    params.set("direction", options.direction ?? "desc")
    if (options.labels?.length) params.set("labels", options.labels.join(","))

    const raw = await apiGet<any[]>(`/repos/${REPO}/issues?${params}`)
    if (raw.length === 0) break

    const mapped = raw.filter((i) => !i.pull_request).map(mapIssue)
    all.push(...mapped)
    totalFetched += raw.length
    page++

    // If we got fewer results than requested, we've reached the end
    if (raw.length < perPage) break

    // Safety limit — don't fetch more than 10k issues
    if (totalFetched > 10_000) break
  }

  return all
}

/**
 * Fetch issues from the repository (single page).
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
 * Fetch issues by phase label (p0-critical, p1-high, etc.)
 * The GitHub label is stored as "phase:p0-critical", so we prefix accordingly.
 */
export async function fetchIssuesByPhase(phase: Phase, options: Omit<FetchIssuesOptions, "labels"> = {}): Promise<GitHubIssue[]> {
  const label = phase === "unphased" ? "" : `phase:${phase}`
  if (!label) {
    // For unphased, fetch all and filter
    const all = await fetchAllIssues(options)
    return all.filter((i) => i.phase === "unphased")
  }
  return fetchAllIssues({ ...options, labels: [label] })
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
    await apiPost(`/repos/${REPO}/issues/${number}/comments`, { body: comment })
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
  await apiPost(`/repos/${REPO}/issues/${number}/comments`, { body })
}

function inferPhase(labels: string[]): Phase {
  if (labels.some((l) => /p0-critical/i.test(l))) return "p0-critical"
  if (labels.some((l) => /p1-high/i.test(l))) return "p1-high"
  if (labels.some((l) => /p2-medium/i.test(l))) return "p2-medium"
  if (labels.some((l) => /p3-low/i.test(l))) return "p3-low"
  return "unphased"
}

function inferScopes(labels: string[]): string[] {
  return labels
    .filter((l) => l.startsWith("scope:"))
    .map((l) => l.replace("scope:", ""))
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
    phase: inferPhase(labels),
    scopes: inferScopes(labels),
  }
}

function inferPriority(labels: string[], title: string): Priority {
  if (labels.some((l) => /critical/i.test(l))) return "critical"
  if (labels.some((l) => /high/i.test(l))) return "high"
  if (labels.some((l) => /low/i.test(l))) return "low"
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
  // Phase-based adjustments
  if (issue.phase === "p0-critical") score -= 1 // critical = more context
  if (issue.phase === "p3-low") score += 1 // low priority = often niche
  // Platform issues are harder
  if (issue.scopes.includes("platform")) score += 1
  return Math.max(1, Math.min(10, score))
}

/**
 * Check if an issue has enough information to work on.
 */
export function hasSufficientInfo(issue: GitHubIssue): boolean {
  if (!issue.body || issue.body.trim().length < 50) return false
  return true
}

/**
 * Count issues by phase from a list.
 */
export function countByPhase(issues: GitHubIssue[]): Record<Phase, number> {
  const counts: Record<string, number> = { "p0-critical": 0, "p1-high": 0, "p2-medium": 0, "p3-low": 0, unphased: 0 }
  for (const issue of issues) {
    counts[issue.phase] = (counts[issue.phase] ?? 0) + 1
  }
  return counts as Record<Phase, number>
}
