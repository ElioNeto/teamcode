// Issue lifecycle bus events.
//
// These events are published whenever an issue is created, updated, or
// removed from the local .opencode/data/ store. CLI/TUI/other services
// can subscribe to react to issue changes.
import { Schema } from "effect"
import { BusEvent } from "@/bus/bus-event"

/**
 * Published when an issue is created or imported into the local store.
 * The payload includes the full issue snapshot.
 */
export const IssueCreated = BusEvent.define(
  "issue.created",
  Schema.Struct({
    issueID: Schema.String,
    title: Schema.String,
    priority: Schema.String,
    category: Schema.String,
    status: Schema.String,
    author: Schema.optional(Schema.String),
  }),
)

/**
 * Published when an existing issue is updated (status, priority,
 * category, description, comments, etc.).
 */
export const IssueUpdated = BusEvent.define(
  "issue.updated",
  Schema.Struct({
    issueID: Schema.String,
    title: Schema.String,
    priority: Schema.String,
    category: Schema.String,
    status: Schema.String,
    changedFields: Schema.Array(Schema.String),
  }),
)

/**
 * Published when an issue is removed from the local store.
 */
export const IssueRemoved = BusEvent.define(
  "issue.removed",
  Schema.Struct({
    issueID: Schema.String,
    title: Schema.String,
  }),
)

/**
 * Published when a swarm is spawned from an issue context.
 */
export const IssueSwarmSpawned = BusEvent.define(
  "issue.swarm.spawned",
  Schema.Struct({
    issueID: Schema.String,
    swarmID: Schema.String,
    action: Schema.String,
  }),
)

export const Event = {
  IssueCreated,
  IssueUpdated,
  IssueRemoved,
  IssueSwarmSpawned,
}

export * as IssueEvents from "./events"
