export * as ServerAuth from "./auth"

import { ConfigService } from "@/effect/config-service"
import { Effect } from "effect"
import { RuntimeFlags } from "@/effect/runtime-flags"
import { Config as EffectConfig, Context, Option, Redacted } from "effect"

export type Credentials = {
  password?: string
  username?: string
}

export type DecodedCredentials = {
  readonly username: string
  readonly password: Redacted.Redacted
}

export class Config extends ConfigService.Service<Config>()("@teamcode/ServerAuthConfig", {
  password: EffectConfig.string("TEAMCODE_SERVER_PASSWORD").pipe(
    EffectConfig.orElse(() => EffectConfig.string("OPENCODE_SERVER_PASSWORD")),
    EffectConfig.option,
  ),
  username: EffectConfig.string("TEAMCODE_SERVER_USERNAME").pipe(
    EffectConfig.orElse(() => EffectConfig.string("OPENCODE_SERVER_USERNAME")),
    EffectConfig.withDefault("teamcode"),
  ),
}) {}

export type Info = Context.Service.Shape<typeof Config>

export function required(config: Info) {
  return Option.isSome(config.password) && config.password.value !== ""
}

export function authorized(credentials: DecodedCredentials, config: Info) {
  return (
    Option.isSome(config.password) &&
    credentials.username === config.username &&
    Redacted.value(credentials.password) === config.password.value
  )
}

const readRuntimeFlags = () =>
  Effect.runSync(RuntimeFlags.Service.useSync((flags) => flags).pipe(Effect.provide(RuntimeFlags.defaultLayer)))

export function header(credentials?: Credentials) {
  const flags = readRuntimeFlags()
  const password = credentials?.password ?? flags.serverPassword
  if (!password) return undefined

  const username = credentials?.username ?? flags.serverUsername ?? "teamcode"
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`
}

export function headers(credentials?: Credentials) {
  const authorization = header(credentials)
  if (!authorization) return undefined
  return { Authorization: authorization }
}
