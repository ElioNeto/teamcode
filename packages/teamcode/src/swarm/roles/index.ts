// Swarm roles barrel — specialized agent roles for the TeamCode swarm.
//
// Each role defines its own types, system prompt, and configuration schema.
// Roles are resolved by the Agent service at runtime via `agentSvc.get(role)`.

export type { TaskStep, TaskPlan } from "./planner"
export type { ResearchFinding, ResearchResult } from "./researcher"
export type { ExecutionResult } from "./executor"
export type { ReviewResult, ReviewVerdict } from "./reviewer"

export * as SwarmRoles from "."
