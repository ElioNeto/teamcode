import { Config, ConfigProvider, Context, Effect, Layer } from "effect"
import { ConfigService } from "@/effect/config-service"

const bool = (name: string, alias?: string) => {
  if (!alias) return Config.boolean(name).pipe(Config.withDefault(false))
  return Config.boolean(name).pipe(
    Config.orElse(() => Config.boolean(alias)),
    Config.withDefault(false),
  )
}

const positiveInteger = (name: string, alias?: string) => {
  const handler = Config.number(name).pipe(
    Config.map((value) => (Number.isInteger(value) && value > 0 ? value : undefined)),
    Config.orElse(() => Config.succeed(undefined)),
  )
  if (!alias) return handler
  return Config.number(alias).pipe(
    Config.map((value) => (Number.isInteger(value) && value > 0 ? value : undefined)),
    Config.orElse(() => handler),
  )
}

const experimental = bool("TEAMCODE_EXPERIMENTAL", "OPENCODE_EXPERIMENTAL")
const enabledByExperimental = (name: string, alias?: string) =>
  Config.all({ experimental, enabled: bool(name, alias) }).pipe(Config.map((flags) => flags.experimental || flags.enabled))

export class Service extends ConfigService.Service<Service>()("@teamcode/RuntimeFlags", {
  autoShare: bool("TEAMCODE_AUTO_SHARE", "OPENCODE_AUTO_SHARE"),
  pure: bool("TEAMCODE_PURE", "OPENCODE_PURE"),
  disableDefaultPlugins: bool("TEAMCODE_DISABLE_DEFAULT_PLUGINS", "OPENCODE_DISABLE_DEFAULT_PLUGINS"),
  disableChannelDb: bool("TEAMCODE_DISABLE_CHANNEL_DB", "OPENCODE_DISABLE_CHANNEL_DB"),
  disableEmbeddedWebUi: bool("TEAMCODE_DISABLE_EMBEDDED_WEB_UI", "OPENCODE_DISABLE_EMBEDDED_WEB_UI"),
  disableExternalSkills: bool("TEAMCODE_DISABLE_EXTERNAL_SKILLS", "OPENCODE_DISABLE_EXTERNAL_SKILLS"),
  disableLspDownload: bool("TEAMCODE_DISABLE_LSP_DOWNLOAD", "OPENCODE_DISABLE_LSP_DOWNLOAD"),
  skipMigrations: bool("TEAMCODE_SKIP_MIGRATIONS", "OPENCODE_SKIP_MIGRATIONS"),
  disableClaudeCodePrompt: Config.all({
    broad: bool("TEAMCODE_DISABLE_CLAUDE_CODE", "OPENCODE_DISABLE_CLAUDE_CODE"),
    direct: bool("TEAMCODE_DISABLE_CLAUDE_CODE_PROMPT", "OPENCODE_DISABLE_CLAUDE_CODE_PROMPT"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  disableClaudeCodeSkills: Config.all({
    broad: bool("TEAMCODE_DISABLE_CLAUDE_CODE", "OPENCODE_DISABLE_CLAUDE_CODE"),
    direct: bool("TEAMCODE_DISABLE_CLAUDE_CODE_SKILLS", "OPENCODE_DISABLE_CLAUDE_CODE_SKILLS"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  enableExa: Config.all({
    experimental,
    enabled: bool("TEAMCODE_ENABLE_EXA", "OPENCODE_ENABLE_EXA"),
    legacy: bool("TEAMCODE_EXPERIMENTAL_EXA", "OPENCODE_EXPERIMENTAL_EXA"),
  }).pipe(Config.map((flags) => flags.experimental || flags.enabled || flags.legacy)),
  enableParallel: Config.all({
    enabled: bool("TEAMCODE_ENABLE_PARALLEL", "OPENCODE_ENABLE_PARALLEL"),
    legacy: bool("TEAMCODE_EXPERIMENTAL_PARALLEL", "OPENCODE_EXPERIMENTAL_PARALLEL"),
  }).pipe(Config.map((flags) => flags.enabled || flags.legacy)),
  enableExperimentalModels: bool("TEAMCODE_ENABLE_EXPERIMENTAL_MODELS", "OPENCODE_ENABLE_EXPERIMENTAL_MODELS"),
  enableQuestionTool: bool("TEAMCODE_ENABLE_QUESTION_TOOL", "OPENCODE_ENABLE_QUESTION_TOOL"),
  experimentalScout: enabledByExperimental("TEAMCODE_EXPERIMENTAL_SCOUT", "OPENCODE_EXPERIMENTAL_SCOUT"),
  experimentalBackgroundSubagents: enabledByExperimental("TEAMCODE_EXPERIMENTAL_BACKGROUND_SUBAGENTS", "OPENCODE_EXPERIMENTAL_BACKGROUND_SUBAGENTS"),
  experimentalLspTy: bool("TEAMCODE_EXPERIMENTAL_LSP_TY", "OPENCODE_EXPERIMENTAL_LSP_TY"),
  experimentalLspTool: enabledByExperimental("TEAMCODE_EXPERIMENTAL_LSP_TOOL", "OPENCODE_EXPERIMENTAL_LSP_TOOL"),
  experimentalOxfmt: enabledByExperimental("TEAMCODE_EXPERIMENTAL_OXFMT", "OPENCODE_EXPERIMENTAL_OXFMT"),
  experimentalPlanMode: enabledByExperimental("TEAMCODE_EXPERIMENTAL_PLAN_MODE", "OPENCODE_EXPERIMENTAL_PLAN_MODE"),
  experimentalEventSystem: enabledByExperimental("TEAMCODE_EXPERIMENTAL_EVENT_SYSTEM", "OPENCODE_EXPERIMENTAL_EVENT_SYSTEM"),
  experimentalWorkspaces: enabledByExperimental("TEAMCODE_EXPERIMENTAL_WORKSPACES", "OPENCODE_EXPERIMENTAL_WORKSPACES"),
  experimentalIconDiscovery: enabledByExperimental("TEAMCODE_EXPERIMENTAL_ICON_DISCOVERY", "OPENCODE_EXPERIMENTAL_ICON_DISCOVERY"),
  outputTokenMax: positiveInteger("TEAMCODE_EXPERIMENTAL_OUTPUT_TOKEN_MAX", "OPENCODE_EXPERIMENTAL_OUTPUT_TOKEN_MAX"),
  bashDefaultTimeoutMs: positiveInteger("TEAMCODE_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS", "OPENCODE_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS"),
  client: Config.string("TEAMCODE_CLIENT").pipe(
    Config.orElse(() => Config.string("OPENCODE_CLIENT")),
    Config.withDefault("cli"),
  ),
  // Legacy Flag.* wrappers — migrate consumers to RuntimeFlags.Service
  disableAutoupdate: bool("TEAMCODE_DISABLE_AUTOUPDATE", "OPENCODE_DISABLE_AUTOUPDATE"),
  disableAutocompact: bool("TEAMCODE_DISABLE_AUTOCOMPACT", "OPENCODE_DISABLE_AUTOCOMPACT"),
  disablePrune: bool("TEAMCODE_DISABLE_PRUNE", "OPENCODE_DISABLE_PRUNE"),
  disableProjectConfig: bool("TEAMCODE_DISABLE_PROJECT_CONFIG", "OPENCODE_DISABLE_PROJECT_CONFIG"),
  disableFilewatcher: bool("TEAMCODE_EXPERIMENTAL_DISABLE_FILEWATCHER", "OPENCODE_EXPERIMENTAL_DISABLE_FILEWATCHER"),
  experimentalFilewatcher: bool("TEAMCODE_EXPERIMENTAL_FILEWATCHER", "OPENCODE_EXPERIMENTAL_FILEWATCHER"),
}) {}

export type Info = Context.Service.Shape<typeof Service>

const emptyConfigLayer = Service.defaultLayer.pipe(
  Layer.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({}))),
  Layer.orDie,
)

export const layer = (overrides: Partial<Info> = {}) =>
  Layer.effect(
    Service,
    Effect.gen(function* () {
      const flags = yield* Service
      return Service.of({ ...flags, ...overrides })
    }),
  ).pipe(Layer.provide(emptyConfigLayer))

export const defaultLayer = Service.defaultLayer.pipe(Layer.orDie)

export * as RuntimeFlags from "./runtime-flags"
