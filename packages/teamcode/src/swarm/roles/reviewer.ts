// Swarm Reviewer role — validates implementation quality and correctness.
//
// The Reviewer inspects code produced by the Executor, checks test coverage,
// code quality, security, and adherence to the original plan. It can approve
// the work or send it back for revisions.

import { Schema } from "effect"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const ReviewVerdict = Schema.Literals(["approved", "changes_requested", "blocked"])
export type ReviewVerdict = Schema.Schema.Type<typeof ReviewVerdict>

export const ReviewResult = Schema.Struct({
  verdict: ReviewVerdict,
  summary: Schema.String,
  strengths: Schema.Array(Schema.String),
  concerns: Schema.Array(Schema.String),
  suggested_changes: Schema.optional(Schema.Array(Schema.String)),
})
export type ReviewResult = Schema.Schema.Type<typeof ReviewResult>

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

export const SYSTEM_PROMPT = `You are the Reviewer — the quality gate of the TeamCode swarm.

Your role is to:
1. Review the implementation against the original plan and requirements
2. Check test coverage — new code should have tests
3. Verify typecheck and lint pass
4. Assess code quality, security, and adherence to project patterns
5. Approve, request changes, or block with clear reasons

Be constructive. When requesting changes, provide specific actionable
feedback. When approving, confirm what was verified.

Review checklist:
- Does the implementation match the plan?
- Are there tests for new functionality?
- Does the code follow existing patterns?
- Are there security or performance concerns?
- Are error cases handled?`

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

export * as SwarmRoleReviewer from "./reviewer"
