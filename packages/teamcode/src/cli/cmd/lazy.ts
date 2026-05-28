import type { Argv, CommandModule } from "yargs"

/**
 * Creates a lazily-loaded yargs CommandModule.
 *
 * The module (and all its transitive imports) is NOT evaluated until the
 * command's builder or handler is actually invoked — i.e., when the user
 * runs that specific command.
 *
 * This is the central optimisation for fast `--help` / `--version`: without
 * it, every command file and its heavy dependencies (Octokit, MCP SDK,
 * ACP SDK, Server, etc.) would be loaded eagerly at startup.
 */
export function lazyCmd<Args>(
  command: string | readonly string[],
  describe: string | false,
  loader: () => Promise<CommandModule<object, Args>>,
  aliases?: string | readonly string[],
): CommandModule<object, Args> {
  let mod: CommandModule<object, Args> | undefined

  async function getMod() {
    if (!mod) mod = await loader()
    return mod
  }

  return {
    command,
    describe,
    aliases,
    builder: (async (yargs: Argv) => {
      const m = await getMod()
      const b = m.builder as unknown as ((y: Argv) => Argv | Promise<Argv>) | undefined
      return b ? b(yargs) : yargs
    }) as unknown as CommandModule<object, Args>["builder"],
    handler: (async (args: any) => {
      const m = await getMod()
      return m.handler!(args)
    }) as unknown as CommandModule<object, Args>["handler"],
  }
}
