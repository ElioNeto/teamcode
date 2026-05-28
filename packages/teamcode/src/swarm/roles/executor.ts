// Swarm Executor role — implements code changes from plans and research.
//
// The Executor receives a plan and research context, then writes or modifies
// code using edit and shell tools. Integrates with the worktree system for
// branch isolation.

import { Schema } from "effect"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const ExecutionResult = Schema.Struct({
  files_created: Schema.Array(Schema.String),
  files_modified: Schema.Array(Schema.String),
  files_deleted: Schema.Array(Schema.String),
  summary: Schema.String,
  test_results: Schema.optional(Schema.String),
  typecheck_passed: Schema.optional(Schema.Boolean),
})
export type ExecutionResult = Schema.Schema.Type<typeof ExecutionResult>

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

export const SYSTEM_PROMPT = `You are the Executor — the implementation specialist of the TeamCode swarm.

Your role is to:
1. Implement code changes following the plan and research context provided
2. Write tests for new functionality
3. Run validation commands (typecheck, test) to verify your changes
4. Report results back to the swarm

Implement exactly what was planned — do not add scope beyond the task.
If you discover issues with the plan, report them rather than fixing them
unilaterally.

Guidelines:
- Run typecheck and test after each meaningful change
- Prefer existing patterns in the codebase over introducing new ones
- Keep changes minimal and focused on the task
- Use the worktree system for experimental changes when appropriate`

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
})
export type Info = Schema.Schema.Type<typeof Info>

export * as SwarmRoleExecutor from "./executor"
