import path from "path"
import { statSync } from "fs"
import { Global } from "@teamcode-ai/core/global"
import type { Origin } from "./origin"

export type ExternalOrigin = Exclude<Origin, "teamcode">

export type Source = {
  origin: ExternalOrigin
  path: string
  /** Session key derived from the file name: Claude `sessionId` or Codex rollout file stem. */
  key: string
  /** For Claude subagent transcripts, the key of the parent session. */
  parentKey?: string
  mtime: number
  size: number
}

// Where each tool keeps its transcripts, relative to `$HOME` (spike §1 and §3). Claude
// Code 2.x writes straight into the project slug directory; the `sessions/` layout and
// `subagents/` sidechains are accepted too.
const layouts: Record<ExternalOrigin, { root: string; globs: { pattern: string; parent?: boolean }[] }> = {
  claude: {
    root: path.join(".claude", "projects"),
    globs: [
      { pattern: "*/*.jsonl" },
      { pattern: "*/sessions/*.jsonl" },
      { pattern: "*/*/subagents/*.jsonl", parent: true },
    ],
  },
  codex: {
    root: path.join(".codex", "sessions"),
    globs: [{ pattern: "**/rollout-*.jsonl" }, { pattern: "rollout-*.jsonl" }],
  },
}

export function discover(input?: { home?: string; origins?: ExternalOrigin[] }): Source[] {
  const home = input?.home ?? Global.Path.home
  const origins = input?.origins ?? (Object.keys(layouts) as ExternalOrigin[])
  const seen = new Set<string>()
  return origins
    .flatMap((origin) => {
      const root = path.join(home, layouts[origin].root)
      if (!statSync(root, { throwIfNoEntry: false })?.isDirectory()) return []
      return layouts[origin].globs.flatMap((glob) =>
        Array.from(new Bun.Glob(glob.pattern).scanSync({ cwd: root, onlyFiles: true, absolute: true })).flatMap(
          (file) => {
            if (seen.has(file)) return []
            seen.add(file)
            const stat = statSync(file, { throwIfNoEntry: false })
            if (!stat) return []
            return [
              {
                origin,
                path: file,
                key: path.basename(file, ".jsonl"),
                parentKey: glob.parent ? path.basename(path.dirname(path.dirname(file))) : undefined,
                mtime: stat.mtimeMs,
                size: stat.size,
              } satisfies Source,
            ]
          },
        ),
      )
    })
    .toSorted((a, b) => Number(a.parentKey !== undefined) - Number(b.parentKey !== undefined) || b.mtime - a.mtime)
}

export * as Scanner from "./scanner"
