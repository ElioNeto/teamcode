// Issue Swarm Templates — predefined swarm configurations for issue-driven
// workflows. Each template produces a `SwarmDefinition` that the orchestrator
// can run against a specific issue.
import { SwarmDefinition, SwarmMode, type SwarmAgent } from "../types"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type AgentSeed = {
  id: string
  role: string
  prompt?: string
}

function agents(seeds: AgentSeed[]): SwarmAgent[] {
  const ts = Date.now()
  return seeds.map((s, i) => ({
    id: `${ts}-${s.id}`,
    role: s.role,
    status: "pending" as const,
    prompt: s.prompt,
  }))
}

function issuePrompt(issueTitle: string, issueDescription: string): string {
  return `## Issue Context\n\n**Title:** ${issueTitle}\n\n**Description:**\n${issueDescription}`
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export const templates: Record<string, (...args: any[]) => SwarmDefinition> = {
  "issue-resolve": issueResolve,
  "issue-investigate": issueInvestigate,
  "issue-review": issueReview,
  "issue-triage": issueTriage,
  "issue-plan": issuePlan,
}

export type IssueTemplateName = keyof typeof templates

// ---------------------------------------------------------------------------
// issue-resolve
// ---------------------------------------------------------------------------

/**
 * Resolve a bug or feature issue: investigate → plan → implement → review.
 */
function issueResolve(options?: {
  issueTitle?: string
  issueDescription?: string
  description?: string
  timeout?: number
}): SwarmDefinition {
  const issueCtx = options?.issueTitle
    ? issuePrompt(options.issueTitle, options.issueDescription ?? "")
    : ""

  return {
    id: `swarm-issue-resolve-${Date.now()}`,
    mode: "sequential",
    agents: agents([
      {
        id: "researcher",
        role: "researcher",
        prompt: `Investigate the following issue in the codebase.\n\n${issueCtx}\n\nFind root cause, affected areas, and suggest a fix strategy. Write findings to 'issue:analysis'.`,
      },
      {
        id: "planner",
        role: "planner",
        prompt: `Based on the issue analysis in 'issue:analysis', design a step-by-step plan to resolve the issue.\n\n${issueCtx}\n\nWrite the plan to 'issue:plan'.`,
      },
      {
        id: "executor",
        role: "executor",
        prompt: `Implement the fix or feature described in the issue.\n\n${issueCtx}\n\nFollow the plan in 'issue:plan'. Write tests and ensure they pass. Use 'bun test' and 'bun typecheck' to verify.`,
      },
      {
        id: "reviewer",
        role: "reviewer",
        prompt: `Review the implemented fix/feature for the following issue.\n\n${issueCtx}\n\nCheck test coverage, code quality, and that the issue is properly addressed. Write your review to 'issue:review'.`,
      },
    ]),
    description: options?.description ?? "Resolve issue: investigate → plan → implement → review",
    timeout: options?.timeout,
  }
}

// ---------------------------------------------------------------------------
// issue-investigate
// ---------------------------------------------------------------------------

/**
 * Investigate an issue to understand root cause and impact.
 */
function issueInvestigate(options?: {
  issueTitle?: string
  issueDescription?: string
  description?: string
  timeout?: number
}): SwarmDefinition {
  const issueCtx = options?.issueTitle
    ? issuePrompt(options.issueTitle, options.issueDescription ?? "")
    : ""

  return {
    id: `swarm-issue-investigate-${Date.now()}`,
    mode: "parallel",
    agents: agents([
      {
        id: "code-researcher",
        role: "researcher",
        prompt: `Investigate the root cause of the following issue in the codebase.\n\n${issueCtx}\n\nTrace the code paths involved and identify where the problem originates. Write findings to 'issue:root-cause'.`,
      },
      {
        id: "impact-researcher",
        role: "researcher",
        prompt: `Analyze the impact of the following issue.\n\n${issueCtx}\n\nIdentify affected areas, users, and potential side effects. Write findings to 'issue:impact'.`,
      },
      {
        id: "test-researcher",
        role: "researcher",
        prompt: `Check if the following issue has existing test coverage.\n\n${issueCtx}\n\nIdentify missing test cases that would have caught this issue. Write findings to 'issue:tests'.`,
      },
    ]),
    description: options?.description ?? "Investigate issue: root cause, impact, and test coverage",
    timeout: options?.timeout,
  }
}

// ---------------------------------------------------------------------------
// issue-review
// ---------------------------------------------------------------------------

/**
 * Review a proposed fix for an issue.
 */
function issueReview(options?: {
  issueTitle?: string
  issueDescription?: string
  description?: string
  timeout?: number
}): SwarmDefinition {
  const issueCtx = options?.issueTitle
    ? issuePrompt(options.issueTitle, options.issueDescription ?? "")
    : ""

  return {
    id: `swarm-issue-review-${Date.now()}`,
    mode: "sequential",
    agents: agents([
      {
        id: "code-reviewer",
        role: "reviewer",
        prompt: `Review the proposed changes for the following issue.\n\n${issueCtx}\n\nCheck correctness, edge cases, and adherence to coding standards. Write review to 'issue:code-review'.`,
      },
      {
        id: "security-reviewer",
        role: "reviewer",
        prompt: `Perform a security review of the changes for the following issue.\n\n${issueCtx}\n\nCheck for common vulnerabilities, injection risks, and data handling issues. Write findings to 'issue:security-review'.`,
      },
    ]),
    description: options?.description ?? "Review issue fix: code review and security review",
    timeout: options?.timeout,
  }
}

// ---------------------------------------------------------------------------
// issue-triage
// ---------------------------------------------------------------------------

/**
 * Triage multiple issues — categorize, prioritize, and deduplicate.
 */
function issueTriage(options?: {
  description?: string
  timeout?: number
}): SwarmDefinition {
  return {
    id: `swarm-issue-triage-${Date.now()}`,
    mode: "sequential",
    agents: agents([
      {
        id: "classifier",
        role: "planner",
        prompt: `Review all open issues in the local issue tracker (.opencode/data/). For each issue:\n1. Determine the correct priority (critical/high/medium/low)\n2. Determine the correct category (bug/feature/debt/docs/question)\n3. Check for duplicates\n4. Suggest appropriate labels\n\nWrite the triage report to 'issue:triage-report'.`,
      },
      {
        id: "deduplicator",
        role: "researcher",
        prompt: `Review all open issues and the triage report in 'issue:triage-report'. Identify duplicate issues that can be merged or closed. For each duplicate, reference the primary issue it duplicates. Write findings to 'issue:duplicates'.`,
      },
    ]),
    description: options?.description ?? "Triage issues: classify, prioritize, and deduplicate",
    timeout: options?.timeout,
  }
}

// ---------------------------------------------------------------------------
// issue-plan
// ---------------------------------------------------------------------------

/**
 * Create a detailed implementation plan from an issue/feature request.
 */
function issuePlan(options?: {
  issueTitle?: string
  issueDescription?: string
  description?: string
  timeout?: number
}): SwarmDefinition {
  const issueCtx = options?.issueTitle
    ? issuePrompt(options.issueTitle, options.issueDescription ?? "")
    : ""

  return {
    id: `swarm-issue-plan-${Date.now()}`,
    mode: "sequential",
    agents: agents([
      {
        id: "architect",
        role: "planner",
        prompt: `Design the technical approach for the following issue/feature.\n\n${issueCtx}\n\nCover: architecture changes, new files/modules, data model changes, API changes. Write design to 'issue:design'.`,
      },
      {
        id: "task-planner",
        role: "planner",
        prompt: `Break down the following issue into concrete implementation tasks.\n\n${issueCtx}\n\nUse the design in 'issue:design'. Each task should be actionable and testable. Write task list to 'issue:tasks'.`,
      },
    ]),
    description: options?.description ?? "Plan issue implementation: design → task breakdown",
    timeout: options?.timeout,
  }
}

export * as IssueTemplates from "./template"
