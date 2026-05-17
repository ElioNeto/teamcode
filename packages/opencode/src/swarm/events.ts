import { Schema } from "effect"
import { BusEvent } from "@/bus/bus-event"
import { SessionID } from "@/session/schema"
import { AgentStatus } from "./types"

export const Event = {
  SwarmCreated: BusEvent.define(
    "swarm.created",
    Schema.Struct({
      swarmID: Schema.String,
      mode: Schema.String,
      agentCount: Schema.Number,
      description: Schema.optional(Schema.String),
    }),
  ),
  SwarmAgentStarted: BusEvent.define(
    "swarm.agent.started",
    Schema.Struct({
      swarmID: Schema.String,
      agentID: Schema.String,
      role: Schema.String,
      sessionID: SessionID,
    }),
  ),
  SwarmAgentCompleted: BusEvent.define(
    "swarm.agent.completed",
    Schema.Struct({
      swarmID: Schema.String,
      agentID: Schema.String,
      role: Schema.String,
      sessionID: SessionID,
      status: AgentStatus,
      output: Schema.optional(Schema.String),
    }),
  ),
  SwarmAgentFailed: BusEvent.define(
    "swarm.agent.failed",
    Schema.Struct({
      swarmID: Schema.String,
      agentID: Schema.String,
      role: Schema.String,
      sessionID: SessionID,
      error: Schema.String,
    }),
  ),
  SwarmCompleted: BusEvent.define(
    "swarm.completed",
    Schema.Struct({
      swarmID: Schema.String,
      status: Schema.String,
      agentResults: Schema.Array(
        Schema.Struct({
          agentID: Schema.String,
          role: Schema.String,
          status: AgentStatus,
          sessionID: Schema.optional(SessionID),
        }),
      ),
    }),
  ),
}

export * as SwarmEvents from "./events"
