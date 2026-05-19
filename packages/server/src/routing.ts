import { Schema } from "effect"

/**
 * Query fields used by WorkspaceRoutingMiddleware for route resolution.
 * These fields are applicable to any route that may need workspace routing.
 */
export const WorkspaceRoutingQueryFields = {
  directory: Schema.optional(Schema.String),
  workspace: Schema.optional(Schema.String),
}

export const WorkspaceRoutingQuery = Schema.Struct(WorkspaceRoutingQueryFields)

export * as ServerRouting from "./routing"
