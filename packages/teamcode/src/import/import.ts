import type { ProjectID } from "@/project/schema"
import type { SessionID } from "@/session/schema"
import { ClaudeCode } from "./parser/claude-code"
import { Codex } from "./parser/codex"
import { Normalizer, type Normalized } from "./normalizer"
import { Scanner, type ExternalOrigin, type Source } from "./scanner"
import { ImportStorage } from "./storage"

// Orchestrates scanner → parser → normalizer → storage for one `teamcode import --from`
// run. Everything but `ImportStorage` is pure, so `dryRun` reports exactly what a real
// run would write.

export type Options = {
  from: ExternalOrigin[]
  projectID: ProjectID
  home?: string
  /** Restrict to sources whose key (file stem / session id) starts with this. */
  session?: string
  dryRun?: boolean
}

export type Entry = {
  origin: ExternalOrigin
  key: string
  path: string
  sessionID: SessionID
  title: string
  created: boolean
  messages: number
  parts: number
  skipped: number
  warnings: string[]
}

export type Report = {
  scanned: number
  sessions: Entry[]
  errors: { path: string; error: string }[]
}

export async function run(options: Options): Promise<Report> {
  const sources = Scanner.discover({ home: options.home, origins: options.from }).filter(
    (source) =>
      !options.session || source.key.startsWith(options.session) || source.parentKey?.startsWith(options.session),
  )
  const report: Report = { scanned: sources.length, sessions: [], errors: [] }
  // Subagent transcripts sort after their parents (see `Scanner.discover`), so the
  // parent's TeamCode id is known by the time a child is normalized.
  const ids = new Map<string, SessionID>()
  for (const source of sources) {
    const text = await Bun.file(source.path)
      .text()
      .catch((error: unknown) => {
        report.errors.push({ path: source.path, error: error instanceof Error ? error.message : String(error) })
        return undefined
      })
    if (text === undefined) continue
    const normalized = normalize(source, text, {
      key: source.key,
      projectID: options.projectID,
      parentID: source.parentKey ? ids.get(source.parentKey) : undefined,
    })
    if (normalized.messages.length === 0) continue
    normalized.session.projectID = ImportStorage.resolveProject(normalized.session.directory, options.projectID)
    ids.set(source.key, normalized.session.id)
    const result = options.dryRun
      ? {
          sessionID: normalized.session.id,
          created: false,
          messages: normalized.messages.length,
          parts: normalized.messages.reduce((n, m) => n + m.parts.length, 0),
          skipped: 0,
        }
      : ImportStorage.upsert(normalized)
    report.sessions.push({
      origin: source.origin,
      key: source.key,
      path: source.path,
      title: normalized.session.title,
      warnings: normalized.warnings,
      ...result,
    })
  }
  return report
}

export function normalize(source: Pick<Source, "origin">, text: string, input: Normalizer.Input): Normalized {
  if (source.origin === "codex") return Normalizer.codex(Codex.parse(text), input)
  return Normalizer.claudeCode(ClaudeCode.parse(text), input)
}

export * as Import from "./import"
