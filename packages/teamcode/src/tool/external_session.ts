import { Effect, Schema } from "effect"
import * as Tool from "./tool"
import DESCRIPTION from "./external_session.txt"
import { Session } from "@/session/session"
import { SessionID } from "@/session/schema"
import type { MessageV2 } from "@/session/message-v2"
import { NotFoundError } from "@/storage/storage"
import { Origin } from "@/import/origin"
import { PositiveInt } from "@teamcode-ai/core/schema"
import { Locale } from "@/util/locale"

const OUTPUT_PREVIEW = 400
const DEFAULT_LIST = 20
const DEFAULT_READ = 50

const Parameters = Schema.Struct({
  action: Schema.Literals(["list", "read"]).annotate({ description: "list sessions or read one transcript" }),
  origin: Schema.optional(Schema.Literals(["claude", "codex", "teamcode"])).annotate({
    description: "Only sessions recorded by this agent",
  }),
  search: Schema.optional(Schema.String).annotate({ description: "Substring matched against titles (list only)" }),
  session_id: Schema.optional(Schema.String).annotate({ description: "Session id to read (read only)" }),
  limit: Schema.optional(PositiveInt).annotate({ description: "Max sessions (list) or trailing messages (read)" }),
})

type Metadata = { origin?: Origin.Origin; count?: number; messages?: number }

export const ExternalSessionTool = Tool.define(
  "external_session",
  Effect.gen(function* () {
    const sessions = yield* Session.Service
    const run = Effect.fn("ExternalSessionTool.run")(function* (args: Schema.Schema.Type<typeof Parameters>) {
      if (args.action === "list") {
        const rows = Session.listGlobal({ search: args.search, roots: true, limit: 500 })
          .filter((session) => !args.origin || Origin.of(session) === args.origin)
          .slice(0, args.limit ?? DEFAULT_LIST)
        const output = rows.length
          ? rows.map(listLine).join("\n")
          : `No ${args.origin ?? ""} sessions found${args.origin && args.origin !== "teamcode" ? `. Run \`teamcode import --from ${args.origin === "claude" ? "claude-code" : "codex"}\` first.` : "."}`
        const result: Tool.ExecuteResult<Metadata> = {
          title: `${rows.length} session${rows.length === 1 ? "" : "s"}`,
          metadata: { count: rows.length },
          output,
        }
        return result
      }
      if (!args.session_id) return yield* Effect.fail(new Error("session_id is required when action is read"))
      const sessionID = SessionID.make(args.session_id)
      const info = yield* sessions
        .get(sessionID)
        .pipe(
          Effect.catchIf(NotFoundError.isInstance, () =>
            Effect.fail(new Error(`Session not found: ${args.session_id}`)),
          ),
        )
      const messages = yield* sessions
        .messages({ sessionID, limit: args.limit ?? DEFAULT_READ })
        .pipe(
          Effect.catchIf(NotFoundError.isInstance, () =>
            Effect.fail(new Error(`Session not found: ${args.session_id}`)),
          ),
        )
      const header = `# ${info.title}\norigin: ${Origin.of(info)}  directory: ${info.directory}  updated: ${Locale.todayTimeOrDateTime(info.time.updated)}\n`
      const result: Tool.ExecuteResult<Metadata> = {
        title: info.title,
        metadata: { origin: Origin.of(info), messages: messages.length },
        output: [header, ...messages.map(render)].join("\n"),
      }
      return result
    })
    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (args: Schema.Schema.Type<typeof Parameters>, _ctx: Tool.Context) => run(args).pipe(Effect.orDie),
    }
  }),
)

function listLine(session: Session.GlobalInfo) {
  return [
    session.id,
    Origin.of(session).padEnd(8),
    Locale.todayTimeOrDateTime(session.time.updated).padEnd(16),
    session.title,
    session.directory,
  ].join("  ")
}

function render(message: MessageV2.WithParts) {
  const who = message.info.role === "user" ? "user" : `assistant (${message.info.modelID})`
  const body = message.parts.flatMap((part) => {
    if (part.type === "text") return [part.text]
    if (part.type === "reasoning") return [`[reasoning] ${part.text}`]
    if (part.type === "file") return [`[file ${part.mime}] ${part.filename ?? part.url.slice(0, 60)}`]
    if (part.type === "tool") return [renderTool(part)]
    return []
  })
  return `## ${who}\n${body.join("\n")}\n`
}

function renderTool(part: MessageV2.ToolPart) {
  const input = JSON.stringify(part.state.input)
  const head = `[tool ${part.tool}] ${input.length > OUTPUT_PREVIEW ? input.slice(0, OUTPUT_PREVIEW) + "…" : input}`
  if (part.state.status === "completed") return `${head}\n  → ${preview(part.state.output)}`
  if (part.state.status === "error") return `${head}\n  ✗ ${preview(part.state.error)}`
  return `${head}\n  (${part.state.status})`
}

function preview(text: string) {
  const flat = text.trim().replaceAll("\n", "\n    ")
  return flat.length > OUTPUT_PREVIEW ? flat.slice(0, OUTPUT_PREVIEW) + "…" : flat
}
