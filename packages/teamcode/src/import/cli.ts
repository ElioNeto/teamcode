import { EOL } from "os"
import { Effect } from "effect"
import type { Argv } from "yargs"
import type { ProjectID } from "@/project/schema"
import { UI } from "@/cli/ui"
import { Import } from "./import"
import type { ExternalOrigin } from "./scanner"

// `teamcode import --from claude-code|codex`. Wired into the existing `import` command
// (`src/cli/cmd/import.ts`), which keeps handling `import <file|url>` when `--from` is absent.

export const sources = { "claude-code": "claude", codex: "codex" } as const satisfies Record<string, ExternalOrigin>
export type SourceName = keyof typeof sources

export type Args = {
  from?: SourceName
  session?: string
  home?: string
  dryRun?: boolean
  json?: boolean
}

export function options<T>(yargs: Argv<T>) {
  return yargs
    .option("from", {
      describe: "import sessions recorded by another agent instead of a JSON file",
      type: "string",
      choices: Object.keys(sources) as SourceName[],
    })
    .option("session", {
      describe: "only import the external session whose id starts with this value",
      type: "string",
    })
    .option("home", {
      describe: "home directory to scan (defaults to $HOME)",
      type: "string",
      hidden: true,
    })
    .option("dry-run", {
      describe: "list what would be imported without writing",
      type: "boolean",
      default: false,
    })
    .option("json", {
      describe: "print the import report as JSON",
      type: "boolean",
      default: false,
    })
}

export const run = Effect.fn("Cli.import.from")(function* (args: Args & { from: SourceName }, projectID: ProjectID) {
  const report = yield* Effect.promise(() =>
    Import.run({
      from: [sources[args.from]],
      projectID,
      home: args.home,
      session: args.session,
      dryRun: args.dryRun,
    }),
  )
  process.stdout.write(args.json ? JSON.stringify(report, null, 2) : format(args, report))
  process.stdout.write(EOL)
  return report
})

export function format(args: Args, report: Import.Report) {
  const verb = args.dryRun ? "would import" : "imported"
  const lines = report.sessions.map((entry) => {
    const counts = `${entry.messages} new message${entry.messages === 1 ? "" : "s"}, ${entry.skipped} skipped`
    const tag = entry.created ? "new" : args.dryRun ? "plan" : "update"
    return `${entry.sessionID}  ${tag.padEnd(6)} ${counts.padEnd(32)} ${entry.title}`
  })
  const errors = report.errors.map(
    (error) => UI.Style.TEXT_DANGER + `error ${error.path}: ${error.error}` + UI.Style.TEXT_NORMAL,
  )
  const warnings = report.sessions.flatMap((entry) =>
    entry.warnings.map((w) => UI.Style.TEXT_DIM + `warning ${entry.key}: ${w}` + UI.Style.TEXT_NORMAL),
  )
  const summary = `${verb} ${report.sessions.length} of ${report.scanned} ${args.from ?? "external"} session${report.scanned === 1 ? "" : "s"}`
  return [...lines, ...warnings, ...errors, summary].join(EOL)
}

export * as ImportCli from "./cli"
