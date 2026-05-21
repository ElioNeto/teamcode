// Swarm templates — predefined, reusable swarm configurations.
//
// Each template produces a `SwarmDefinition` that the orchestrator can run.
// Templates compose the agent roles (planner, researcher, executor, reviewer)
// into common patterns.
import { Caveman } from "@/caveman"
import { SwarmDefinition, SwarmMode, type SwarmAgent } from "./types"

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

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

/**
 * Return a caveman-compressed copy of a SwarmDefinition.
 * Compresses every agent's prompt at the given level.
 */
export function compressDefinition(
  def: SwarmDefinition,
  level: "lite" | "full" | "ultra" = "full",
): SwarmDefinition {
  return {
    ...def,
    agents: def.agents.map((agent) => ({
      ...agent,
      prompt: agent.prompt ? Caveman.compress(agent.prompt, level) : agent.prompt,
    })),
  }
}

/** Predefined swarm template registry. */
export const templates: Record<string, (...args: any[]) => SwarmDefinition> = {
  "code-review": codeReview,
  "feature": feature,
  "bug-fix": bugFix,
  "explore": explore,
  "codegen": codegen,
}

export type TemplateName = keyof typeof templates

// ---------------------------------------------------------------------------
// code-review
// ---------------------------------------------------------------------------

function codeReview(options?: { description?: string; timeout?: number }): SwarmDefinition {
  return {
    id: `swarm-review-${Date.now()}`,
    mode: "sequential",
    agents: agents([
      {
        id: "researcher",
        role: "researcher",
        prompt:
          "Research the codebase for the areas relevant to this review. " +
          "Find potential issues, security concerns, and style violations. " +
          "Report findings to shared memory under key 'review:findings'.",
      },
      {
        id: "reviewer",
        role: "reviewer",
        prompt:
          "Review the code changes described in shared memory key 'review:findings'. " +
          "Check for correctness, style, security, and performance. " +
          "Write your final review report to shared memory key 'review:report'.",
      },
    ]),
    description: options?.description ?? "Review code changes for quality and correctness",
    timeout: options?.timeout,
  }
}

// ---------------------------------------------------------------------------
// feature — full feature development pipeline
// ---------------------------------------------------------------------------

function feature(options?: { description?: string; timeout?: number }): SwarmDefinition {
  return {
    id: `swarm-feature-${Date.now()}`,
    mode: "sequential",
    agents: agents([
      {
        id: "planner",
        role: "planner",
        prompt:
          "Design a plan for the requested feature. Break it down into steps. " +
          "Write the plan to shared memory key 'feature:plan'.",
      },
      {
        id: "researcher",
        role: "researcher",
        prompt:
          "Research the existing codebase for patterns, dependencies, and APIs " +
          "needed to implement the feature plan in shared memory key 'feature:plan'. " +
          "Write research notes to shared memory key 'feature:research'.",
      },
      {
        id: "executor",
        role: "executor",
        prompt:
          "Implement the feature following the plan in 'feature:plan' and " +
          "research in 'feature:research'. Write tests and ensure they pass. " +
          "Use 'bun test' and 'bun typecheck' to verify.",
      },
      {
        id: "reviewer",
        role: "reviewer",
        prompt:
          "Review the implemented feature. Check test coverage, code quality, " +
          "and adherence to the original plan. Write your review to 'feature:review'.",
      },
    ]),
    description: options?.description ?? "Full feature development: plan → research → implement → review",
    timeout: options?.timeout,
  }
}

// ---------------------------------------------------------------------------
// bug-fix
// ---------------------------------------------------------------------------

function bugFix(options?: { description?: string; timeout?: number }): SwarmDefinition {
  return {
    id: `swarm-bugfix-${Date.now()}`,
    mode: "sequential",
    agents: agents([
      {
        id: "researcher",
        role: "researcher",
        prompt:
          "Investigate the reported bug. Find root cause, affected areas, " +
          "and suggest a fix strategy. Write findings to 'bug:analysis'.",
      },
      {
        id: "executor",
        role: "executor",
        prompt:
          "Implement the fix described in 'bug:analysis'. Add a regression test. " +
          "Run 'bun test' and 'bun typecheck' to verify nothing is broken.",
      },
      {
        id: "reviewer",
        role: "reviewer",
        prompt:
          "Review the bug fix. Verify the root cause was addressed, the " +
          "regression test is correct, and no new issues were introduced.",
      },
    ]),
    description: options?.description ?? "Bug fix: investigate → implement → verify",
    timeout: options?.timeout,
  }
}

// ---------------------------------------------------------------------------
// explore — codebase exploration
// ---------------------------------------------------------------------------

function explore(options?: { description?: string; timeout?: number }): SwarmDefinition {
  return {
    id: `swarm-explore-${Date.now()}`,
    mode: "parallel",
    agents: agents([
      {
        id: "arch-researcher",
        role: "researcher",
        prompt:
          "Explore the overall architecture of the codebase. Identify main " +
          "modules, data flow, and key abstractions. Write to 'explore:architecture'.",
      },
      {
        id: "dep-researcher",
        role: "researcher",
        prompt:
          "Map external dependencies and their versions. Identify outdated, " +
          "deprecated, or vulnerable packages. Write to 'explore:dependencies'.",
      },
      {
        id: "test-researcher",
        role: "researcher",
        prompt:
          "Analyze test coverage and patterns. Identify untested areas and " +
          "test quality issues. Write to 'explore:tests'.",
      },
    ]),
    description: options?.description ?? "Parallel codebase exploration: architecture, dependencies, tests",
    timeout: options?.timeout,
  }
}

// ---------------------------------------------------------------------------
// codegen — parallel code generation
// ---------------------------------------------------------------------------

function codegen(options?: { description?: string; timeout?: number }): SwarmDefinition {
  return {
    id: `swarm-codegen-${Date.now()}`,
    mode: "parallel",
    agents: agents([
      {
        id: "planner",
        role: "planner",
        prompt:
          "Design the file structure and interfaces for the requested code. " +
          "Write the design to 'codegen:design'.",
      },
      {
        id: "executor-1",
        role: "executor",
        prompt:
          "Generate the core implementation files following 'codegen:design'. " +
          "Focus on business logic.",
      },
      {
        id: "executor-2",
        role: "executor",
        prompt:
          "Generate test files and supporting infrastructure following " +
          "'codegen:design'. Focus on test coverage.",
      },
    ]),
    description: options?.description ?? "Parallel code generation with planning and tests",
    timeout: options?.timeout,
  }
}

export * as SwarmTemplates from "./templates"
