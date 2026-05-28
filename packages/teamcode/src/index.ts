import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import * as Log from "@teamcode-ai/core/util/log"
import { UI } from "./cli/ui"
import { Installation } from "./installation"
import { InstallationVersion } from "@teamcode-ai/core/installation/version"
import { NamedError } from "@teamcode-ai/core/util/error"
import { FormatError } from "./cli/error"
import { Filesystem } from "@/util/filesystem"
import { errorMessage } from "./util/error"
import { Heap } from "./cli/heap"
import { ensureProcessMetadata } from "@teamcode-ai/core/util/teamcode-process"
import { isRecord } from "@/util/record"
import { lazyCmd } from "./cli/cmd/lazy"
import { EOL } from "os"
import path from "path"
import { Global } from "@teamcode-ai/core/global"

const processMetadata = ensureProcessMetadata("main")

process.on("unhandledRejection", (e) => {
  Log.Default.error("rejection", {
    e: errorMessage(e),
  })
  process.exitCode = 1
})

process.on("uncaughtException", (e) => {
  Log.Default.error("exception", {
    e: errorMessage(e),
  })
})

// Ignore SIGPIPE — writing to a broken pipe (e.g. stdout closed by pager)
// should not crash the process. Node's default SIGPIPE disposition kills it.
process.on("SIGPIPE", () => {})

// Reap terminated child processes synchronously so they don't accumulate as
// zombies when many short-lived children exit faster than the event loop can
// process their exit events (e.g. during heavy file watcher activity).
// Use Bun's native child process management which handles reaping automatically.
process.on("SIGCHLD", () => {})

const args = hideBin(process.argv)

function show(out: string) {
  const text = out.trimStart()
  if (!text.startsWith("teamcode ")) {
    process.stderr.write(UI.logo() + EOL + EOL)
    process.stderr.write(text)
    return
  }
  process.stderr.write(out)
}

const cli = yargs(args)
  .parserConfiguration({ "populate--": true })
  .scriptName("teamcode")
  .wrap(100)
  .help("help", "show help")
  .alias("help", "h")
  .version("version", "show version number", InstallationVersion)
  .alias("version", "v")
  .option("print-logs", {
    describe: "print logs to stderr",
    type: "boolean",
  })
  .option("log-level", {
    describe: "log level",
    type: "string",
    choices: ["DEBUG", "INFO", "WARN", "ERROR"],
  })
  .option("pure", {
    describe: "run without external plugins",
    type: "boolean",
  })
  .option("caveman", {
    describe: "enable caveman mode — agent speak with few token",
    type: "string",
    coerce: (val: string | boolean | undefined) => {
      if (val === false) return undefined
      if (val === true || val === "" || val === "full" || val === undefined) return "full"
      if (val === "lite" || val === "ultra") return val
      return "full"
    },
  })
  .middleware(async (opts) => {
    if (opts.pure) {
      process.env.TEAMCODE_PURE = "1"
    }

    if (opts.caveman) {
      process.env.TEAMCODE_CAVEMAN = opts.caveman as string
    }

    // Ensure Global directories exist before Log/Database init
    await Global.ensure()

    await Log.init({
      print: process.argv.includes("--print-logs"),
      dev: Installation.isLocal(),
      level: (() => {
        if (opts.logLevel) return opts.logLevel as Log.Level
        if (Installation.isLocal()) return "DEBUG"
        return "INFO"
      })(),
    })

    await Heap.start()

    process.env.AGENT = "1"
    process.env.TEAMCODE = "1"
    process.env.TEAMCODE_PID = String(process.pid)

    Log.Default.info("teamcode", {
      version: InstallationVersion,
      args: process.argv.slice(2),
      process_role: processMetadata.processRole,
      run_id: processMetadata.runID,
    })

    const marker = path.join(Global.Path.data, "opencode.db")
    if (!(await Filesystem.exists(marker))) {
      const tty = process.stderr.isTTY
      process.stderr.write("Performing one time database migration, may take a few minutes..." + EOL)
      const width = 36
      const orange = "\x1b[38;5;214m"
      const muted = "\x1b[0;2m"
      const reset = "\x1b[0m"
      let last = -1
      if (tty) process.stderr.write("\x1b[?25l")
      try {
        // Lazily import database dependencies — these are only needed once
        // per machine lifetime (first startup). The static import of Drizzle
        // and Database at module top-level would slow down every command.
        const [{ drizzle }, { Database }, { JsonMigration }] = await Promise.all([
          import("drizzle-orm/bun-sqlite") as Promise<typeof import("drizzle-orm/bun-sqlite")>,
          import("@/storage/db") as Promise<typeof import("@/storage/db")>,
          import("@/storage/json-migration") as Promise<typeof import("@/storage/json-migration")>,
        ])
        await JsonMigration.run(drizzle({ client: Database.Client().$client }), {
          progress: (event) => {
            const percent = Math.floor((event.current / event.total) * 100)
            if (percent === last && event.current !== event.total) return
            last = percent
            if (tty) {
              const fill = Math.round((percent / 100) * width)
              const bar = `${"■".repeat(fill)}${"･".repeat(width - fill)}`
              process.stderr.write(
                `\r${orange}${bar} ${percent.toString().padStart(3)}%${reset} ${muted}${event.label.padEnd(12)} ${event.current}/${event.total}${reset}`,
              )
              if (event.current === event.total) process.stderr.write("\n")
            } else {
              process.stderr.write(`sqlite-migration:${percent}${EOL}`)
            }
          },
        })
      } finally {
        if (tty) process.stderr.write("\x1b[?25h")
        else {
          process.stderr.write(`sqlite-migration:done${EOL}`)
        }
      }
      process.stderr.write("Database migration complete." + EOL)
    }
  })
  .usage("")
  .completion("completion", "generate shell completion script")
  .command(
    lazyCmd("run [message..]", "run opencode with a message", () =>
      import("./cli/cmd/run").then((m) => m.RunCommand),
    ),
  )
  .command(
    lazyCmd("web", "start opencode server and open web interface", () =>
      import("./cli/cmd/web").then((m) => m.WebCommand),
    ),
  )
  .command(
    lazyCmd("serve", "starts a headless opencode server", () =>
      import("./cli/cmd/serve").then((m) => m.ServeCommand),
    ),
  )
  .command(
    lazyCmd("generate", false, () => import("./cli/cmd/generate").then((m) => m.GenerateCommand)),
  )
  .command(
    lazyCmd("agent", "manage agents", () => import("./cli/cmd/agent").then((m) => m.AgentCommand)),
  )
  .command(
    lazyCmd("providers", "manage AI providers and credentials", () =>
      import("./cli/cmd/providers").then((m) => m.ProvidersCommand),
      ["auth"],
    ),
  )
  .command(
    lazyCmd("models [provider]", "list all available models", () =>
      import("./cli/cmd/models").then((m) => m.ModelsCommand),
    ),
  )
  .command(
    lazyCmd("stats", "show token usage and cost statistics", () =>
      import("./cli/cmd/stats").then((m) => m.StatsCommand),
    ),
  )
  .command(
    lazyCmd("session", "manage sessions", () => import("./cli/cmd/session").then((m) => m.SessionCommand)),
  )
  .command(
    lazyCmd("export [sessionID]", "export session data as JSON", () =>
      import("./cli/cmd/export").then((m) => m.ExportCommand),
    ),
  )
  .command(
    lazyCmd("import <file>", "import session data from JSON file or URL", () =>
      import("./cli/cmd/import").then((m) => m.ImportCommand),
    ),
  )
  .command(
    lazyCmd("github", "manage GitHub agent", () =>
      import("./cli/cmd/github").then((m) => m.GithubCommand),
    ),
  )
  .command(
    lazyCmd("pr <number>", "fetch and checkout a GitHub PR branch, then run opencode", () =>
      import("./cli/cmd/pr").then((m) => m.PrCommand),
    ),
  )
  .command(
    lazyCmd("mcp", "manage MCP (Model Context Protocol) servers", () =>
      import("./cli/cmd/mcp").then((m) => m.McpCommand),
    ),
  )
  .command(
    lazyCmd("acp", "start ACP (Agent Client Protocol) server", () =>
      import("./cli/cmd/acp").then((m) => m.AcpCommand),
    ),
  )
  .command(
    lazyCmd("login <url>", false, () => import("./cli/cmd/account").then((m) => m.ConsoleCommand)),
  )
  .command(
    lazyCmd("upgrade [target]", "upgrade teamcode to the latest or a specific version", () =>
      import("./cli/cmd/upgrade").then((m) => m.UpgradeCommand),
    ),
  )
  .command(
    lazyCmd("uninstall", "uninstall opencode and remove all related files", () =>
      import("./cli/cmd/uninstall").then((m) => m.UninstallCommand),
    ),
  )
  .command(
    lazyCmd("debug", "debugging and troubleshooting tools", () =>
      import("./cli/cmd/debug").then((m) => m.DebugCommand),
    ),
  )
  .command(
    lazyCmd("kill [directory]", "kill a running instance in the given directory", () =>
      import("./cli/cmd/kill").then((m) => m.KillCommand),
    ),
  )
  .command(
    lazyCmd("caveman-compress <file>", "compress session for caveman mode", () =>
      import("./cli/cmd/caveman-compress").then((m) => m.CavemanCompressCommand),
    ),
  )
  .command(
    lazyCmd("plugin <module>", "install plugin and update config", () =>
      import("./cli/cmd/plug").then((m) => m.PluginCommand),
      ["plug"],
    ),
  )
  .command(lazyCmd("db", "database tools", () => import("./cli/cmd/db").then((m) => m.DbCommand)))
  .command(
    lazyCmd("attach <url>", "attach to a running opencode server", () =>
      import("./cli/cmd/tui/attach").then((m) => m.AttachCommand),
    ),
  )
  .command(
    lazyCmd("$0 [project]", "start opencode tui", () =>
      import("./cli/cmd/tui/thread").then((m) => m.TuiThreadCommand),
    ),
  )
  .fail((msg, err) => {
    if (
      msg?.startsWith("Unknown argument") ||
      msg?.startsWith("Not enough non-option arguments") ||
      msg?.startsWith("Invalid values:")
    ) {
      if (err) throw err
      cli.showHelp(show)
    }
    if (err) throw err
    process.exit(1)
  })
  .strict()

try {
  if (args.includes("-h") || args.includes("--help")) {
    await cli.parse(args, (err: Error | undefined, _argv: unknown, out: string) => {
      if (err) throw err
      if (!out) return
      // Ensure trailing newline so the shell prompt starts on a fresh line
      show(out.endsWith(EOL) ? out : out + EOL)
    })
  } else {
    await cli.parse()
  }
} catch (e) {
  let data: Record<string, any> = {}
  if (e instanceof Error) {
    Object.assign(data, {
      name: e.name,
      message: e.message,
      cause: e.cause?.toString(),
      stack: e.stack,
    })
  }

  if (e instanceof NamedError) {
    const obj = e.toObject()
    if (isRecord(obj.data)) {
      for (const [key, value] of Object.entries(obj.data)) {
        if (key === "name" || key === "stack" || key === "cause") continue
        data[key] = value
      }
    }
  }

  if (e instanceof ResolveMessage) {
    Object.assign(data, {
      name: e.name,
      message: e.message,
      code: e.code,
      specifier: e.specifier,
      referrer: e.referrer,
      position: e.position,
      importKind: e.importKind,
    })
  }
  Log.Default.error("fatal", data)
  const formatted = FormatError(e)
  if (formatted) UI.error(formatted)
  if (formatted === undefined) {
    UI.error("Unexpected error, check log file at " + Log.file() + " for more details" + EOL)
    process.stderr.write(errorMessage(e) + EOL)
  }
  process.exitCode = 1
} finally {
  // Set the exit code but let the event loop drain naturally instead of
  // forcing process.exit(). This prevents the parent shell (PowerShell on
  // Windows) from terminating when the Node.js process calls exit().
  //
  // Letting Node exit naturally after the event loop drains still flushes
  // buffered I/O (stdout pipes, etc.) before termination, preserving the
  // fix for the execvp regression.
  process.exitCode = process.exitCode || 0
}
