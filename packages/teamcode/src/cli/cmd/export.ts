import { Session } from "@/session/session"
import { MessageV2 } from "../../session/message-v2"
import { SessionID } from "../../session/schema"
import { effectCmd, fail } from "../effect-cmd"
import { UI } from "../ui"
import * as prompts from "@clack/prompts"
import { EOL } from "os"
import { Effect } from "effect"
import { NotFoundError } from "@/storage/storage"

/** Threshold: warn if total string content exceeds 50MB (rough proxy for ~100MB+ JSON). */
const SIZE_WARN_THRESHOLD = 50 * 1024 * 1024

/** Default max characters per string field when truncating large exports. */
const MAX_CHARS_PER_FIELD = 100_000

function redact(kind: string, id: string, value: string) {
  return value.trim() ? `[redacted:${kind}:${id}]` : value
}

function data(kind: string, id: string, value: Record<string, unknown> | undefined) {
  if (!value) return value
  return Object.keys(value).length ? { redacted: `${kind}:${id}` } : value
}

function span(id: string, value: { value: string; start: number; end: number }) {
  return {
    ...value,
    value: redact("file-text", id, value.value),
  }
}

function diff(kind: string, diffs: { file?: string; patch?: string }[] | undefined) {
  return diffs?.map((item, i) => ({
    ...item,
    file: item.file === undefined ? undefined : redact(`${kind}-file`, String(i), item.file),
    patch: item.patch === undefined ? undefined : redact(`${kind}-patch`, String(i), item.patch),
  }))
}

function source(part: MessageV2.FilePart) {
  if (!part.source) return part.source
  if (part.source.type === "symbol") {
    return {
      ...part.source,
      path: redact("file-path", part.id, part.source.path),
      name: redact("file-symbol", part.id, part.source.name),
      text: span(part.id, part.source.text),
    }
  }
  if (part.source.type === "resource") {
    return {
      ...part.source,
      clientName: redact("file-client", part.id, part.source.clientName),
      uri: redact("file-uri", part.id, part.source.uri),
      text: span(part.id, part.source.text),
    }
  }
  return {
    ...part.source,
    path: redact("file-path", part.id, part.source.path),
    text: span(part.id, part.source.text),
  }
}

function filepart(part: MessageV2.FilePart): MessageV2.FilePart {
  return {
    ...part,
    url: redact("file-url", part.id, part.url),
    filename: part.filename === undefined ? undefined : redact("file-name", part.id, part.filename),
    source: source(part),
  }
}

function part(part: MessageV2.Part): MessageV2.Part {
  switch (part.type) {
    case "text":
      return {
        ...part,
        text: redact("text", part.id, part.text),
        metadata: data("text-metadata", part.id, part.metadata),
      }
    case "reasoning":
      return {
        ...part,
        text: redact("reasoning", part.id, part.text),
        metadata: data("reasoning-metadata", part.id, part.metadata),
      }
    case "file":
      return filepart(part)
    case "subtask":
      return {
        ...part,
        prompt: redact("subtask-prompt", part.id, part.prompt),
        description: redact("subtask-description", part.id, part.description),
        command: part.command === undefined ? undefined : redact("subtask-command", part.id, part.command),
      }
    case "tool":
      return {
        ...part,
        metadata: data("tool-metadata", part.id, part.metadata),
        state:
          part.state.status === "pending"
            ? {
                ...part.state,
                input: data("tool-input", part.id, part.state.input) ?? part.state.input,
                raw: redact("tool-raw", part.id, part.state.raw),
              }
            : part.state.status === "running"
              ? {
                  ...part.state,
                  input: data("tool-input", part.id, part.state.input) ?? part.state.input,
                  title: part.state.title === undefined ? undefined : redact("tool-title", part.id, part.state.title),
                  metadata: data("tool-state-metadata", part.id, part.state.metadata),
                }
              : part.state.status === "completed"
                ? {
                    ...part.state,
                    input: data("tool-input", part.id, part.state.input) ?? part.state.input,
                    output: redact("tool-output", part.id, part.state.output),
                    title: redact("tool-title", part.id, part.state.title),
                    metadata: data("tool-state-metadata", part.id, part.state.metadata) ?? part.state.metadata,
                    attachments: part.state.attachments?.map(filepart),
                  }
                : {
                    ...part.state,
                    input: data("tool-input", part.id, part.state.input) ?? part.state.input,
                    metadata: data("tool-state-metadata", part.id, part.state.metadata),
                  },
      }
    case "patch":
      return {
        ...part,
        hash: redact("patch", part.id, part.hash),
        files: part.files.map((item: string, i: number) => redact("patch-file", `${part.id}-${i}`, item)),
      }
    case "snapshot":
      return {
        ...part,
        snapshot: redact("snapshot", part.id, part.snapshot),
      }
    case "step-start":
      return {
        ...part,
        snapshot: part.snapshot === undefined ? undefined : redact("snapshot", part.id, part.snapshot),
      }
    case "step-finish":
      return {
        ...part,
        snapshot: part.snapshot === undefined ? undefined : redact("snapshot", part.id, part.snapshot),
      }
    case "agent":
      return {
        ...part,
        source: !part.source
          ? part.source
          : {
              ...part.source,
              value: redact("agent-source", part.id, part.source.value),
            },
      }
    default:
      return part
  }
}

const partFn = part

function sanitize(data: { info: Session.Info; messages: MessageV2.WithParts[] }) {
  return {
    info: {
      ...data.info,
      title: redact("session-title", data.info.id, data.info.title),
      directory: redact("session-directory", data.info.id, data.info.directory),
      summary: !data.info.summary
        ? data.info.summary
        : {
            ...data.info.summary,
            diffs: diff("session-diff", data.info.summary.diffs),
          },
      revert: !data.info.revert
        ? data.info.revert
        : {
            ...data.info.revert,
            snapshot:
              data.info.revert.snapshot === undefined
                ? undefined
                : redact("revert-snapshot", data.info.id, data.info.revert.snapshot),
            diff:
              data.info.revert.diff === undefined
                ? undefined
                : redact("revert-diff", data.info.id, data.info.revert.diff),
          },
    },
    messages: data.messages.map((msg) => ({
      info:
        msg.info.role === "user"
          ? {
              ...msg.info,
              system: msg.info.system === undefined ? undefined : redact("system", msg.info.id, msg.info.system),
              summary: !msg.info.summary
                ? msg.info.summary
                : {
                    ...msg.info.summary,
                    title:
                      msg.info.summary.title === undefined
                        ? undefined
                        : redact("summary-title", msg.info.id, msg.info.summary.title),
                    body:
                      msg.info.summary.body === undefined
                        ? undefined
                        : redact("summary-body", msg.info.id, msg.info.summary.body),
                    diffs: diff("message-diff", msg.info.summary.diffs),
                  },
            }
          : {
              ...msg.info,
              path: {
                cwd: redact("cwd", msg.info.id, msg.info.path.cwd),
                root: redact("root", msg.info.id, msg.info.path.root),
              },
            },
      parts: msg.parts.map(partFn),
    })),
  }
}

function totalStringSize(data: { info: Session.Info; messages: MessageV2.WithParts[] }): number {
  let size = 0
  for (const msg of data.messages) {
    for (const part of msg.parts) {
      switch (part.type) {
        case "text":
        case "reasoning": {
          size += (part as MessageV2.TextPart | MessageV2.ReasoningPart).text.length
          break
        }
        case "tool": {
          const t = part as MessageV2.ToolPart
          if (t.state.status === "completed") size += (t.state as MessageV2.ToolStateCompleted).output.length
          else if (t.state.status === "pending") size += (t.state as MessageV2.ToolStatePending).raw.length
          break
        }
        case "patch": {
          const p = part as MessageV2.PatchPart
          size += p.hash.length + p.files.reduce((s, f) => s + f.length, 0)
          break
        }
        case "snapshot":
        case "step-start":
        case "step-finish": {
          const s = part as MessageV2.SnapshotPart | MessageV2.StepStartPart | MessageV2.StepFinishPart
          if (s.snapshot) size += s.snapshot.length
          break
        }
        case "subtask": {
          const sb = part as MessageV2.SubtaskPart
          size += sb.prompt.length + sb.description.length
          if (sb.command) size += sb.command.length
          break
        }
        case "file": {
          const f = part as MessageV2.FilePart
          size += f.url.length
          if (f.filename) size += f.filename.length
          if (f.source) size += f.source.text.value.length
          break
        }
        case "agent": {
          const a = part as MessageV2.AgentPart
          if (a.source) size += a.source.value.length
          break
        }
      }
    }
  }
  return size
}

function truncateValue(value: string, maxLen: number): string {
  if (value.length <= maxLen) return value
  const omitted = value.length - maxLen
  return `${value.slice(0, maxLen)}\n\n[... truncated: omitted ${omitted} characters ...]`
}

function truncateParts(messages: MessageV2.WithParts[], maxLen: number): MessageV2.WithParts[] {
  return messages.map((msg) => ({
    ...msg,
    parts: msg.parts.map((part) => {
      switch (part.type) {
        case "text":
        case "reasoning":
          return { ...part, text: truncateValue((part as MessageV2.TextPart).text, maxLen) }
        case "tool": {
          const t = part as MessageV2.ToolPart
          if (t.state.status === "completed") {
            const completed = t.state as MessageV2.ToolStateCompleted
            return { ...t, state: { ...completed, output: truncateValue(completed.output, maxLen) } }
          }
          if (t.state.status === "pending") {
            const pending = t.state as MessageV2.ToolStatePending
            return { ...t, state: { ...pending, raw: truncateValue(pending.raw, maxLen) } }
          }
          return t
        }
        case "snapshot":
        case "step-start":
        case "step-finish": {
          const s = part as MessageV2.SnapshotPart | MessageV2.StepStartPart | MessageV2.StepFinishPart
          if (s.snapshot) return { ...s, snapshot: truncateValue(s.snapshot, maxLen) }
          return s
        }
        case "subtask": {
          const sb = part as MessageV2.SubtaskPart
          return {
            ...sb,
            prompt: truncateValue(sb.prompt, maxLen),
            description: truncateValue(sb.description, maxLen),
            command: sb.command ? truncateValue(sb.command, maxLen) : undefined,
          }
        }
        case "file": {
          const f = part as MessageV2.FilePart
          if (f.source) {
            return { ...f, source: { ...f.source, text: { ...f.source.text, value: truncateValue(f.source.text.value, maxLen) } } }
          }
          return f
        }
        case "agent": {
          const a = part as MessageV2.AgentPart
          if (a.source) return { ...a, source: { ...a.source, value: truncateValue(a.source.value, maxLen) } }
          return a
        }
        default:
          return part
      }
    }),
  }))
}

export const ExportCommand = effectCmd({
  command: "export [sessionID]",
  describe: "export session data as JSON",
  builder: (yargs) =>
    yargs
      .positional("sessionID", {
        describe: "session id to export",
        type: "string",
      })
      .option("sanitize", {
        describe: "redact sensitive transcript and file data",
        type: "boolean",
      })
      .option("force", {
        describe: "export without truncation even if data is large",
        type: "boolean",
      })
      .option("truncate", {
        describe: "truncate large text fields to 100K chars each",
        type: "boolean",
      }),
  handler: Effect.fn("Cli.export")(function* (args) {
    return yield* run(args)
  }),
})

const run = Effect.fn("Cli.export.body")(function* (args: {
  sessionID?: string
  sanitize?: boolean
  force?: boolean
  truncate?: boolean
}) {
  const svc = yield* Session.Service
  let sessionID = args.sessionID ? SessionID.make(args.sessionID) : undefined
  process.stderr.write(`Exporting session: ${sessionID ?? "latest"}\n`)

  if (!sessionID) {
    UI.empty()
    prompts.intro("Export session", { output: process.stderr })

    const sessions = yield* svc.list()

    if (sessions.length === 0) {
      prompts.log.error("No sessions found", { output: process.stderr })
      prompts.outro("Done", { output: process.stderr })
      return
    }

    sessions.sort((a, b) => b.time.updated - a.time.updated)

    const selectedSession = yield* Effect.promise(() =>
      prompts.autocomplete({
        message: "Select session to export",
        maxItems: 10,
        options: sessions.map((session) => ({
          label: session.title,
          value: session.id,
          hint: `${new Date(session.time.updated).toLocaleString()} • ${session.id.slice(-8)}`,
        })),
        output: process.stderr,
      }),
    )

    if (prompts.isCancel(selectedSession)) {
      return yield* Effect.die(new UI.CancelledError())
    }

    sessionID = selectedSession

    prompts.outro("Exporting session...", { output: process.stderr })
  }

  return yield* Effect.gen(function* () {
    const sessionInfo = yield* svc.get(sessionID!)
    const messages = yield* svc.messages({ sessionID: sessionInfo.id })

    let exportData: { info: Session.Info; messages: MessageV2.WithParts[] } = { info: sessionInfo, messages }

    const totalSize = totalStringSize(exportData)

    if (totalSize > SIZE_WARN_THRESHOLD && !args.force && !args.truncate) {
      const sizeMB = Math.round(totalSize / (1024 * 1024))
      process.stderr.write(`Session data is approximately ${sizeMB}MB of text content (may exceed Node.js memory limits).\n`)

      const action = yield* Effect.promise(() =>
        prompts.select({
          message: "How would you like to proceed?",
          options: [
            { value: "truncate", label: "Truncate large parts (cap each field at 100K chars)" },
            { value: "force", label: "Export anyway (may crash)" },
            { value: "cancel", label: "Cancel export" },
          ],
          output: process.stderr,
        }),
      )

      if (prompts.isCancel(action) || action === "cancel") {
        return yield* Effect.die(new UI.CancelledError())
      }

      if (action === "truncate") {
        exportData = { info: exportData.info, messages: truncateParts(exportData.messages, MAX_CHARS_PER_FIELD) }
      }
    }

    if (args.truncate) {
      exportData = { info: exportData.info, messages: truncateParts(exportData.messages, MAX_CHARS_PER_FIELD) }
    }

    process.stdout.write(JSON.stringify(args.sanitize ? sanitize(exportData) : exportData, null, 2))
    process.stdout.write(EOL)
  }).pipe(
    Effect.catchIf(NotFoundError.isInstance, () => fail(`Session not found: ${sessionID!}`)),
    Effect.catchDefect(() => fail(`Export failed: session data is too large to serialize. Use --truncate on the CLI or respond to the prompt to truncate large parts.`)),
  )
})
