export * as ConfigError from "./error"

import { Schema } from "effect"

const Issue = Schema.StructWithRest(
  Schema.Struct({
    message: Schema.String,
    path: Schema.Array(Schema.String),
  }),
  [Schema.Record(Schema.String, Schema.Unknown)],
)

export class JsonError extends Schema.TaggedErrorClass<JsonError>()("ConfigJsonError", {
  path: Schema.String,
  message: Schema.optional(Schema.String),
}) {}

export class InvalidError extends Schema.TaggedErrorClass<InvalidError>()("ConfigInvalidError", {
  path: Schema.String,
  issues: Schema.optional(Schema.Array(Issue)),
  message: Schema.optional(Schema.String),
}) {}
