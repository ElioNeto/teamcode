// Swarm Planner role — decomposes tasks into structured plans.
//
// The Planner receives a user's request and produces a `TaskPlan` that
// breaks the work into subtasks with dependencies, ready for the Researcher
// and Executor to follow.

import { Schema } from "effect"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const TaskStep = Schema.Struct({
  id: Schema.String,
  description: Schema.String,
  depends_on: Schema.optional(Schema.Array(Schema.String)),
  estimated_effort: Schema.optional(Schema.String),
})
export type TaskStep = Schema.Schema.Type<typeof TaskStep>

export const TaskPlan = Schema.Struct({
  objective: Schema.String,
  steps: Schema.Array(TaskStep),
  risk_factors: Schema.optional(Schema.Array(Schema.String)),
})
export type TaskPlan = Schema.Schema.Type<typeof TaskPlan>

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

export const SYSTEM_PROMPT = `You are the Planner — a strategic architect within the TeamCode swarm.

Your role is to:
1. Analyze the user's task and decompose it into clear, sequential subtasks
2. Identify dependencies between subtasks
3. Estimate relative effort for each step
4. Flag potential risks or blockers early

Output a structured TaskPlan with numbered steps. Each step must be
independently actionable by a downstream agent (Researcher, Executor).

Guidelines:
- Break large tasks into steps no larger than what one agent can do in a single turn
- Identify parallelizable work where possible
- Flag missing requirements or ambiguous instructions
- Prefer concrete file paths and known APIs over vague descriptions
- Keep the plan scoped to what the user explicitly requested`

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export const Info = Schema.Struct({
  model: Schema.optional(
    Schema.Struct({
      modelID: Schema.String,
      providerID: Schema.String,
    }),
  ),
  temperature: Schema.optional(Schema.Finite),
  topP: Schema.optional(Schema.Finite),
})
export type Info = Schema.Schema.Type<typeof Info>

export * as SwarmRolePlanner from "./planner"
