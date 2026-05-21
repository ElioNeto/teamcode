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

const optionalString = (name: string, alias?: string): Config.Config<string | undefined> => {
  const chain = alias
    ? Config.string(name).pipe(Config.orElse(() => Config.string(alias)))
    : Config.string(name)
  return chain.pipe(Config.orElse(() => Config.succeed(undefined)))
}

const experimental = bool("TEAMCODE_EXPERIMENTAL")
const enabledByExperimental = (name: string, alias?: string) =>
  Config.all({ experimental, enabled: bool(name, alias) }).pipe(Config.map((flags) => flags.experimental || flags.enabled))

export class Service extends ConfigService.Service<Service>()("@teamcode/RuntimeFlags", {
  autoShare: bool("TEAMCODE_AUTO_SHARE"),
  pure: bool("TEAMCODE_PURE"),
  disableDefaultPlugins: bool("TEAMCODE_DISABLE_DEFAULT_PLUGINS"),
  disableChannelDb: bool("TEAMCODE_DISABLE_CHANNEL_DB"),
  disableEmbeddedWebUi: bool("TEAMCODE_DISABLE_EMBEDDED_WEB_UI"),
  disableExternalSkills: bool("TEAMCODE_DISABLE_EXTERNAL_SKILLS"),
  disableLspDownload: bool("TEAMCODE_DISABLE_LSP_DOWNLOAD"),
  skipMigrations: bool("TEAMCODE_SKIP_MIGRATIONS"),
  disableClaudeCodePrompt: Config.all({
    broad: bool("TEAMCODE_DISABLE_CLAUDE_CODE"),
    direct: bool("TEAMCODE_DISABLE_CLAUDE_CODE_PROMPT"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  disableClaudeCodeSkills: Config.all({
    broad: bool("TEAMCODE_DISABLE_CLAUDE_CODE"),
    direct: bool("TEAMCODE_DISABLE_CLAUDE_CODE_SKILLS"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  enableExa: Config.all({
    experimental,
    enabled: bool("TEAMCODE_ENABLE_EXA"),
    legacy: bool("TEAMCODE_EXPERIMENTAL_EXA"),
  }).pipe(Config.map((flags) => flags.experimental || flags.enabled || flags.legacy)),
  enableParallel: Config.all({
    enabled: bool("TEAMCODE_ENABLE_PARALLEL"),
    legacy: bool("TEAMCODE_EXPERIMENTAL_PARALLEL"),
  }).pipe(Config.map((flags) => flags.enabled || flags.legacy)),
  enableExperimentalModels: bool("TEAMCODE_ENABLE_EXPERIMENTAL_MODELS"),
  enableQuestionTool: bool("TEAMCODE_ENABLE_QUESTION_TOOL"),
  experimentalScout: enabledByExperimental("TEAMCODE_EXPERIMENTAL_SCOUT"),
  experimentalBackgroundSubagents: enabledByExperimental("TEAMCODE_EXPERIMENTAL_BACKGROUND_SUBAGENTS"),
  experimentalLspTy: bool("TEAMCODE_EXPERIMENTAL_LSP_TY"),
  experimentalLspTool: enabledByExperimental("TEAMCODE_EXPERIMENTAL_LSP_TOOL"),
  experimentalOxfmt: enabledByExperimental("TEAMCODE_EXPERIMENTAL_OXFMT"),
  experimentalPlanMode: enabledByExperimental("TEAMCODE_EXPERIMENTAL_PLAN_MODE"),
  experimentalEventSystem: enabledByExperimental("TEAMCODE_EXPERIMENTAL_EVENT_SYSTEM"),
  experimentalWorkspaces: enabledByExperimental("TEAMCODE_EXPERIMENTAL_WORKSPACES"),
  experimentalIconDiscovery: enabledByExperimental("TEAMCODE_EXPERIMENTAL_ICON_DISCOVERY"),
  outputTokenMax: positiveInteger("TEAMCODE_EXPERIMENTAL_OUTPUT_TOKEN_MAX"),
  bashDefaultTimeoutMs: positiveInteger("TEAMCODE_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS"),
  client: Config.string("TEAMCODE_CLIENT").pipe(Config.withDefault("cli")),
  // Legacy Flag.* wrappers — migrate consumers to RuntimeFlags.Service
  disableAutoupdate: bool("TEAMCODE_DISABLE_AUTOUPDATE"),
  disableAutocompact: bool("TEAMCODE_DISABLE_AUTOCOMPACT"),
  disablePrune: bool("TEAMCODE_DISABLE_PRUNE"),
  disableProjectConfig: bool("TEAMCODE_DISABLE_PROJECT_CONFIG"),
  disableFilewatcher: bool("TEAMCODE_EXPERIMENTAL_DISABLE_FILEWATCHER"),
  experimentalFilewatcher: bool("TEAMCODE_EXPERIMENTAL_FILEWATCHER"),

  // === Newly added flags for I-06 migration ===
  autoHeapSnapshot: bool("TEAMCODE_AUTO_HEAP_SNAPSHOT"),
  alwaysNotifyUpdate: bool("TEAMCODE_ALWAYS_NOTIFY_UPDATE"),
  showTtfd: bool("TEAMCODE_SHOW_TTFD"),
  disableMouse: bool("TEAMCODE_DISABLE_MOUSE"),
  disableTerminalTitle: bool("TEAMCODE_DISABLE_TERMINAL_TITLE"),
  experimentalDisableCopyOnSelect: Config.boolean("TEAMCODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT").pipe(
    Config.withDefault(process.platform === "win32"),
  ),
  serverPassword: optionalString("TEAMCODE_SERVER_PASSWORD"),
  serverUsername: optionalString("TEAMCODE_SERVER_USERNAME"),
  workspaceId: optionalString("TEAMCODE_WORKSPACE_ID"),
  config: optionalString("TEAMCODE_CONFIG"),
  configContent: optionalString("TEAMCODE_CONFIG_CONTENT"),
  configDir: optionalString("TEAMCODE_CONFIG_DIR"),
  tuiConfig: optionalString("TEAMCODE_TUI_CONFIG"),
  permission: optionalString("TEAMCODE_PERMISSION"),
  db: optionalString("TEAMCODE_DB"),
  gitBashPath: optionalString("TEAMCODE_GIT_BASH_PATH"),
  fakeVcs: optionalString("TEAMCODE_FAKE_VCS"),
  pluginMetaFile: optionalString("TEAMCODE_PLUGIN_META_FILE"),
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

export const defaultLayer = Layer.fresh(Service.defaultLayer.pipe(Layer.orDie))

export * as RuntimeFlags from "./runtime-flags"
