// Caveman-compress command — rewrite context files in caveman language.
//
// Preserves code, URLs, file paths, and all technical content exactly.
// Reduces token count by ~46% on average.
import type { Argv } from "yargs"
import { cmd } from "./cmd"
import { UI } from "../ui"
import { Filesystem } from "@/util/filesystem"
import { Caveman } from "@/caveman"
import { EOL } from "os"

export const CavemanCompressCommand = cmd({
  command: "caveman-compress <file>",
  describe:
    "rewrite a context file (e.g. opencode.jsonc, memory files) in caveman language. " +
    "Preserves code, URLs, paths. Cuts ~46% input tokens.",
  builder: (yargs: Argv) =>
    yargs
      .positional("file", {
        type: "string",
        describe: "file to compress",
      })
      .option("level", {
        type: "string",
        choices: ["lite", "full", "ultra"] as const,
        default: "full",
        describe: "compression level",
      })
      .option("dry-run", {
        type: "boolean",
        default: false,
        describe: "show compressed output without writing",
      }),
  handler: async (args) => {
    const file = args.file as string
    const level = (args.level ?? "full") as Caveman.CavemanLevel
    const dryRun = args["dry-run"] as boolean

    const resolved = await Filesystem.exists(file)
    if (!resolved) {
      UI.error(`File not found: ${file}`)
      process.exit(1)
    }

    const content = await Filesystem.readText(file)
    const originalTokens = Caveman.countTokens(content)
    const compressed = Caveman.compressFile(content, level)
    const savedTokens = originalTokens - Caveman.countTokens(compressed)
    const savedPct = originalTokens > 0 ? Math.round((savedTokens / originalTokens) * 100) : 0

    if (dryRun) {
      UI.println(UI.Style.TEXT_DIM + "─".repeat(60) + UI.Style.TEXT_NORMAL)
      UI.println(compressed)
      UI.println(UI.Style.TEXT_DIM + "─".repeat(60) + UI.Style.TEXT_NORMAL)
    } else {
      await Filesystem.write(file, compressed)
      UI.println(
        UI.Style.TEXT_SUCCESS_BOLD + "✓" + UI.Style.TEXT_NORMAL +
        `  ${file} compressed (${savedPct}% savings, ~${savedTokens} tokens saved)`,
      )
    }
    UI.println(
      UI.Style.TEXT_DIM +
      `Tokens: ${originalTokens} → ${originalTokens - savedTokens} (${savedPct}% reduction)` +
      UI.Style.TEXT_NORMAL,
    )
  },
})
