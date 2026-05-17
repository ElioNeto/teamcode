import { Schema } from "effect"
import { SessionID } from "@/session/schema"
import { ModelID, ProviderID } from "@/provider/schema"

export const SwarmMode = Schema.Literals(["sequential", "parallel"])
export type SwarmMode = Schema.Schema.Type<typeof SwarmMode>

export const AgentStatus = Schema.Literals(["pending", "running", "completed", "failed", "skipped"])
export type AgentStatus = Schema.Schema.Type<typeof AgentStatus>

export const SwarmAgent = Schema.Struct({
  id: Schema.String,
  role: Schema.String,
  status: AgentStatus,
  model: Schema.optional(
    Schema.Struct({ modelID: ModelID, providerID: ProviderID }),
  ),
  tools: Schema.optional(Schema.Array(Schema.String)),
  sessionID: Schema.optional(SessionID),
  prompt: Schema.optional(Schema.String),
})
export type SwarmAgent = Schema.Schema.Type<typeof SwarmAgent>

export const SwarmDefinition = Schema.Struct({
  id: Schema.String,
  mode: SwarmMode,
  agents: Schema.Array(SwarmAgent),
  description: Schema.optional(Schema.String),
  timeout: Schema.optional(Schema.Finite),
})
export type SwarmDefinition = Schema.Schema.Type<typeof SwarmDefinition>

export const SwarmResult = Schema.Struct({
  swarmID: Schema.String,
  status: Schema.Literals(["completed", "failed", "cancelled", "timeout"]),
  agents: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      role: Schema.String,
      status: AgentStatus,
      sessionID: Schema.optional(SessionID),
      output: Schema.optional(Schema.String),
      error: Schema.optional(Schema.String),
    }),
  ),
  aggregatedOutput: Schema.optional(Schema.String),
})
export type SwarmResult = Schema.Schema.Type<typeof SwarmResult>

export * as SwarmTypes from "./types"
