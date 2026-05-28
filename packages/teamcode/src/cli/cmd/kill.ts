import { readFile, rm } from "fs/promises"
import { EOL } from "os"
import path from "path"
import { cmd } from "./cmd"
import { UI } from "../ui"
import { Hash } from "@teamcode-ai/core/util/hash"
import { Global } from "@teamcode-ai/core/global"
import { errorMessage } from "@/util/error"

export const KillCommand = cmd({
  command: "kill [directory]",
  describe: "kill a running instance in the given directory",
  builder: (yargs) =>
    yargs.positional("directory", {
      type: "string",
      describe: "project directory (defaults to current working directory)",
    }),
  handler: async (args) => {
    const cwd = path.resolve(args.directory as string | undefined ?? process.cwd())
    const lockDir = path.join(Global.Path.state, "locks", Hash.fast(`tui:${cwd}`) + ".lock")
    const metaPath = path.join(lockDir, "meta.json")

    let meta: { pid?: number; hostname?: string; createdAt?: string }
    try {
      meta = JSON.parse(await readFile(metaPath, "utf8"))
    } catch {
      UI.error(`No running instance found for ${cwd}`)
      UI.error(`  (looked for lock at ${lockDir})`)
      process.exitCode = 1
      return
    }

    const pid = meta.pid
    if (!pid) {
      UI.error(`Lock exists but meta.json has no pid — removing stale lock`)
      await rm(lockDir, { recursive: true, force: true })
      return
    }

    try {
      process.kill(pid, "SIGTERM")
      UI.println(`Sent SIGTERM to process ${pid}${EOL}`)
    } catch (err) {
      const msg = errorMessage(err)
      if (msg.includes("ESRCH")) {
        UI.println(`Process ${pid} is already gone — removing stale lock`)
      } else if (msg.includes("EPERM")) {
        UI.error(`Cannot kill process ${pid}: permission denied`)
        process.exitCode = 1
        return
      } else {
        UI.error(`Cannot kill process ${pid}: ${msg}`)
        process.exitCode = 1
        return
      }
    }

    // Give the process a moment to release the lock gracefully, then force-remove
    await new Promise((resolve) => setTimeout(resolve, 500))
    await rm(lockDir, { recursive: true, force: true }).catch(() => {})
    UI.println(`Lock released for ${cwd}`)
  },
})
