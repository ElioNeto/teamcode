import { Schema } from "effect"
import { NamedError } from "@teamcode-ai/core/util/error"

export class OutputLengthError extends Schema.TaggedErrorClass<OutputLengthError>()("MessageOutputLengthError", {}) {}

export class AuthError extends Schema.TaggedErrorClass<AuthError>()("ProviderAuthError", {
  providerID: Schema.String,
  message: Schema.String,
}) {}

export const Shared = [AuthError, NamedError.Unknown.EffectSchema, OutputLengthError] as const
export const SharedSchema = Schema.Union(Shared)

export * as MessageError from "./message-error"
