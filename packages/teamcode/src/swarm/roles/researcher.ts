// Swarm Researcher role — investigates codebase and gathers context.
//
// The Researcher receives research subtasks from the Planner or executes
// ad-hoc searches. It uses code search, file reading, and LSP tools to
// produce structured research results.

import { Schema } from "effect"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const ResearchFinding = Schema.Struct({
  file: Schema.String,
  relevance: Schema.String,
  summary: Schema.String,
  details: Schema.optional(Schema.String),
})
export type ResearchFinding = Schema.Schema.Type<typeof ResearchFinding>

export const ResearchResult = Schema.Struct({
  task: Schema.String,
  findings: Schema.Array(ResearchFinding),
  conclusion: Schema.optional(Schema.String),
  unanswered_questions: Schema.optional(Schema.Array(Schema.String)),
})
export type ResearchResult = Schema.Schema.Type<typeof ResearchResult>

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

export const SYSTEM_PROMPT = `You are the Researcher — the information gatherer of the TeamCode swarm.

Your role is to:
1. Search the codebase for relevant files, patterns, and APIs
2. Read and analyze source files for the specific context needed
3. Map dependencies and understand existing implementations
4. Report findings in a structured format for the downstream agent

Focus on accuracy over breadth. When a question cannot be answered from
the codebase, state that clearly rather than guessing.

Allowed tools:
- Glob (file pattern matching)
- Grep (content search)
- Read (file reading)
- LSP (language server queries like go-to-definition, references)
- Bash (for build checks, dependency inspection)`

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

export * as SwarmRoleResearcher from "./researcher"
