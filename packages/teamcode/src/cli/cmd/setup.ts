import { UI } from "../ui"
import { effectCmd, CliError, fail as cliFail } from "../effect-cmd"
import { createOpencodeClient } from "@teamcode-ai/sdk/v2"
import { Effect } from "effect"
import { InstanceRef } from "@/effect/instance-ref"

export const SetupCommand = effectCmd({
  command: "setup",
  describe: "Initialize project by analyzing the application and creating AGENTS.md",
  handler: Effect.fn("Cli.setup")(function* (_args) {
    const localInstance = yield* InstanceRef
    if (!localInstance) return yield* cliFail("No project instance available")
    const directory = localInstance.directory

    const fetchFn = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const { Server } = await import("@/server/server")
      const request = new Request(input, init)
      return Server.Default().app.fetch(request)
    }) as typeof globalThis.fetch

    const sdk = createOpencodeClient({
      baseUrl: "http://teamcode.internal",
      fetch: fetchFn,
      directory,
    })

    UI.println(UI.Style.TEXT_INFO_BOLD + "~  Setting up project..." + UI.Style.TEXT_NORMAL)
    UI.println(UI.Style.TEXT_DIM + `   directory: ${directory}` + UI.Style.TEXT_NORMAL)

    const session = yield* Effect.tryPromise({
      try: () => sdk.session.create({ title: "Project Setup" }),
      catch: (error) => new CliError({ message: `Failed to create session: ${error instanceof Error ? error.message : String(error)}` }),
    })
    if (session.error || !session.data?.id) {
      return yield* cliFail("Failed to create session")
    }
    const sessionID = session.data.id
    UI.println(UI.Style.TEXT_DIM + `   session: ${sessionID}` + UI.Style.TEXT_NORMAL)

    const config = yield* Effect.tryPromise({
      try: () => sdk.config.get(),
      catch: (error) => new CliError({ message: `Failed to read config: ${error instanceof Error ? error.message : String(error)}` }),
    })
    const modelID = config.data?.model
    const providerID = config.data?.["provider"]

    UI.println(UI.Style.TEXT_INFO_BOLD + "~  Analyzing project and creating AGENTS.md..." + UI.Style.TEXT_NORMAL)
    const result = yield* Effect.tryPromise({
      try: () =>
        sdk.session.init({
          sessionID,
          directory,
          modelID: typeof modelID === "string" ? modelID : undefined,
          providerID: typeof providerID === "string" ? providerID : undefined,
        }),
      catch: (error) => new CliError({ message: `Init request failed: ${error instanceof Error ? error.message : String(error)}` }),
    })

    if (result.error) {
      return yield* cliFail(`Setup failed: ${result.error}`)
    }

    UI.empty()
    UI.println(UI.Style.TEXT_SUCCESS_BOLD + "✓  Project setup complete!" + UI.Style.TEXT_NORMAL)
    UI.println(
      UI.Style.TEXT_DIM + "   AGENTS.md created with project-specific agent configurations." + UI.Style.TEXT_NORMAL,
    )
    UI.empty()
    UI.println(UI.Style.TEXT_DIM + `   Session: ${sessionID}` + UI.Style.TEXT_NORMAL)
    UI.println(UI.Style.TEXT_DIM + `   Directory: ${directory}` + UI.Style.TEXT_NORMAL)
    UI.empty()
  }),
})
