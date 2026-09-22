import type { Session } from "@/session/session"
import type { MessageV2 } from "@/session/message-v2"
import { MessageID, PartID, SessionID } from "@/session/schema"
import type { ProjectID } from "@/project/schema"
import { ModelID, ProviderID } from "@/provider/schema"
import { ImportIdent } from "./ident"
import { Origin } from "./origin"
import { ClaudeCode } from "./parser/claude-code"
import { Codex } from "./parser/codex"

// Pure mapping from a parsed external transcript to TeamCode's `Session.Info` plus
// `MessageV2.WithParts[]` (spike §2). No I/O; `storage.ts` writes the result.

export type Normalized = {
  session: Session.Info
  messages: MessageV2.WithParts[]
  warnings: string[]
  skipped: Record<string, number>
}

export type Input = {
  /** Stable key of the source (Claude `sessionId`, Codex rollout id, or the file path). */
  key: string
  projectID: ProjectID
  parentID?: SessionID
}

const TITLE_MAX = 80
const AGENT = { claude: "claude-code", codex: "codex" } as const

type Tokens = MessageV2.Assistant["tokens"]
type Attachment = { mime: string; url: string }

const emptyTokens = (): Tokens => ({ input: 0, output: 0, reasoning: 0, cache: { read: 0, write: 0 } })

export function claudeCode(raw: ClaudeCode.Session, input: Input): Normalized {
  const lines = raw.lines.toSorted((a, b) => a.timestamp - b.timestamp || a.index - b.index)
  const key = raw.sessionId ?? input.key
  const seed = `claude-code:${key}`
  const first = lines[0]
  const sessionID = SessionID.make(ImportIdent.deterministic("session", { timestamp: first?.timestamp ?? 0, seed }))
  const builder = new Builder(sessionID, AGENT.claude, ProviderID.anthropic, seed)
  const warnings = [...raw.warnings]

  // Each assistant API message is spread over several lines (one per content block);
  // group them by `message.id` so they become one TeamCode message.
  const groups = new Map<string, MessageID>()
  for (const line of lines) {
    if (line.role === "user" && ClaudeCode.isPrompt(line)) {
      const user = builder.user({ timestamp: line.timestamp, seed: `${seed}:${line.uuid}` })
      line.message.content.forEach((block, i) => {
        if (block.type === "text" && block.text.trim())
          builder.text(user, block.text, line.timestamp, `${line.uuid}:${i}`, i + 1)
        if (block.type === "image")
          builder.file(user, block.mime, block.url, line.timestamp, `${line.uuid}:${i}`, i + 1)
      })
      continue
    }
    if (line.role === "user") {
      for (const block of line.message.content) {
        if (block.type !== "tool_result") continue
        const done = builder.toolResult({
          callID: block.toolUseID,
          timestamp: line.timestamp,
          output: textOf(block.content),
          isError: block.isError,
          metadata: metadataOf(line.toolUseResult),
          attachments: block.content.flatMap((b) => (b.type === "image" ? [{ mime: b.mime, url: b.url }] : [])),
        })
        if (!done) warnings.push(`line ${line.index}: tool_result ${block.toolUseID} without matching tool_use`)
      }
      continue
    }
    const groupKey = line.message.id ?? line.uuid
    const model = line.message.model
    const messageID =
      groups.get(groupKey) ??
      builder.assistant({
        timestamp: line.timestamp,
        seed: `${seed}:${groupKey}`,
        model: model ?? "unknown",
        cwd: line.cwd ?? first?.cwd ?? "",
      })
    groups.set(groupKey, messageID)
    builder.turn(messageID, {
      completed: line.timestamp,
      finish: line.message.stopReason,
      tokens: line.message.usage
        ? {
            input: line.message.usage.input,
            output: line.message.usage.output,
            reasoning: line.message.usage.reasoning,
            cache: { read: line.message.usage.cacheRead, write: line.message.usage.cacheWrite },
          }
        : undefined,
    })
    line.message.content.forEach((block, i) => {
      const counter = (line.apiBlockIndex ?? i) + 1
      const blockSeed = `${line.uuid}:${i}`
      if (block.type === "text") builder.text(messageID, block.text, line.timestamp, blockSeed, counter)
      if (block.type === "thinking")
        builder.reasoning(
          messageID,
          block.thinking,
          line.timestamp,
          blockSeed,
          counter,
          block.signature ? { signature: block.signature } : undefined,
        )
      if (block.type === "redacted_thinking")
        builder.reasoning(messageID, "[redacted]", line.timestamp, blockSeed, counter, { redacted: true })
      if (block.type === "tool_use")
        builder.toolUse(messageID, block.id, block.name, block.input, line.timestamp, blockSeed, counter)
      if (block.type === "unknown") builder.skip("block.unknown")
    })
  }

  const prompt = lines.find((line) => line.role === "user" && ClaudeCode.isPrompt(line))
  const messages = builder.finish()
  return {
    session: builder.session({
      projectID: input.projectID,
      parentID: input.parentID,
      slug: `claude-${key.slice(0, 8)}`,
      directory: first?.cwd ?? "",
      title: title(raw.summary ?? (prompt ? ClaudeCode.promptText(prompt) : ""), `Claude Code ${key.slice(0, 8)}`),
      version: Origin.version("claude", first?.version),
      created: first?.timestamp ?? 0,
      updated: lines.at(-1)?.timestamp ?? first?.timestamp ?? 0,
    }),
    messages,
    warnings,
    skipped: { ...raw.skipped, ...builder.skipped },
  }
}

export function codex(raw: Codex.Session, input: Input): Normalized {
  const key = raw.id ?? input.key
  const seed = `codex:${key}`
  const base = raw.timestamp ?? raw.items.find((item) => item.timestamp !== undefined)?.timestamp ?? 0
  // Legacy rollouts have no per-line timestamps; fall back to the session start plus
  // the line index so ordering (and therefore ids) stays deterministic.
  const at = (item: Codex.Item) => item.timestamp ?? base + item.index
  const sessionID = SessionID.make(ImportIdent.deterministic("session", { timestamp: base, seed }))
  const builder = new Builder(sessionID, AGENT.codex, ProviderID.openai, seed)
  const warnings = [...raw.warnings]

  let model = "unknown"
  let assistant: MessageID | undefined
  let total: Codex.Usage = { input: 0, output: 0, reasoning: 0, cacheRead: 0 }
  let firstPrompt: string | undefined
  for (const item of raw.items) {
    const timestamp = at(item)
    if (item.kind === "model") {
      model = item.model
      continue
    }
    if (item.kind === "message" && item.role === "user") {
      assistant = undefined
      if (!item.text.trim() && item.images.length === 0) continue
      firstPrompt ??= item.text
      const user = builder.user({ timestamp, seed: `${seed}:${item.index}` })
      if (item.text.trim()) builder.text(user, item.text, timestamp, `${item.index}:text`, 1)
      item.images.forEach((url, i) =>
        builder.file(user, mimeOf(url), url, timestamp, `${item.index}:image:${i}`, i + 2),
      )
      continue
    }
    if (item.kind === "tool_output") {
      const done = builder.toolResult({
        callID: item.callID,
        timestamp,
        output: item.output,
        isError: item.isError,
        metadata: {},
      })
      if (!done) warnings.push(`line ${item.index}: function_call_output ${item.callID} without matching call`)
      continue
    }
    if (item.kind === "tokens") {
      // Codex reports cumulative totals; the turn's share is the delta since the last report.
      const delta: Tokens = {
        input: Math.max(0, item.usage.input - total.input),
        output: Math.max(0, item.usage.output - total.output),
        reasoning: Math.max(0, item.usage.reasoning - total.reasoning),
        cache: { read: Math.max(0, item.usage.cacheRead - total.cacheRead), write: 0 },
      }
      total = item.usage
      if (assistant) builder.turn(assistant, { completed: timestamp, tokens: delta })
      continue
    }
    assistant ??= builder.assistant({ timestamp, seed: `${seed}:turn:${item.index}`, model, cwd: raw.cwd ?? "" })
    builder.turn(assistant, { completed: timestamp, finish: item.kind === "message" ? "stop" : undefined })
    if (item.kind === "message") builder.text(assistant, item.text, timestamp, `${item.index}:text`, 1)
    if (item.kind === "reasoning") builder.reasoning(assistant, item.text, timestamp, `${item.index}:reasoning`, 1)
    if (item.kind === "tool_call")
      builder.toolUse(assistant, item.callID, item.name, item.input, timestamp, `${item.index}:call`, 1)
  }

  const messages = builder.finish()
  const last = raw.items.at(-1)
  return {
    session: builder.session({
      projectID: input.projectID,
      parentID: input.parentID,
      slug: `codex-${key.slice(0, 8)}`,
      directory: raw.cwd ?? "",
      title: title(firstPrompt ?? "", `Codex ${key.slice(0, 8)}`),
      version: Origin.version("codex", raw.cliVersion),
      created: base,
      updated: last ? at(last) : base,
    }),
    messages,
    warnings,
    skipped: { ...raw.skipped, ...builder.skipped },
  }
}

function title(text: string, fallback: string) {
  const line =
    text
      .split("\n")
      .find((l) => l.trim())
      ?.trim() ?? ""
  if (!line) return fallback
  return line.length > TITLE_MAX ? line.slice(0, TITLE_MAX - 1) + "…" : line
}

function textOf(blocks: ClaudeCode.Block[]) {
  return blocks.flatMap((block) => (block.type === "text" ? [block.text] : [])).join("\n")
}

function metadataOf(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function mimeOf(url: string) {
  return url.match(/^data:([^;,]+)[;,]/)?.[1] ?? "image/png"
}

type Turn = { info: MessageV2.Info; parts: MessageV2.Part[]; tokens?: Tokens; finish?: string }

class Builder {
  readonly skipped: Record<string, number> = {}
  private readonly turns: Turn[] = []
  private readonly byID = new Map<MessageID, Turn>()
  private readonly pending = new Map<string, { part: MessageV2.ToolPart; turn: Turn }>()
  private lastUser?: MessageID
  private lastModel?: string
  private readonly tokens = emptyTokens()

  constructor(
    readonly sessionID: SessionID,
    private readonly agent: string,
    private readonly providerID: ProviderID,
    private readonly seed: string,
  ) {}

  user(input: { timestamp: number; seed: string }) {
    const id = MessageID.make(ImportIdent.deterministic("message", input))
    const info: MessageV2.User = {
      id,
      sessionID: this.sessionID,
      role: "user",
      time: { created: input.timestamp },
      agent: this.agent,
      // Filled with the model of the following assistant turn in `finish()`.
      model: { providerID: this.providerID, modelID: ModelID.make(this.lastModel ?? "unknown") },
    }
    this.push({ info, parts: [] })
    this.lastUser = id
    return id
  }

  assistant(input: { timestamp: number; seed: string; model: string; cwd: string }) {
    // `Assistant.parentID` is mandatory: an assistant turn with no recorded prompt
    // (truncated transcript) gets a synthetic empty user message right before it.
    const parentID =
      this.lastUser ?? this.user({ timestamp: Math.max(0, input.timestamp - 1), seed: `${input.seed}:synthetic-user` })
    const id = MessageID.make(ImportIdent.deterministic("message", { timestamp: input.timestamp, seed: input.seed }))
    this.lastModel = input.model
    const info: MessageV2.Assistant = {
      id,
      sessionID: this.sessionID,
      role: "assistant",
      time: { created: input.timestamp, completed: input.timestamp },
      parentID,
      modelID: ModelID.make(input.model),
      providerID: this.providerID,
      mode: this.agent,
      agent: this.agent,
      path: { cwd: input.cwd, root: input.cwd },
      cost: 0,
      tokens: emptyTokens(),
    }
    this.push({ info, parts: [] })
    return id
  }

  turn(id: MessageID, input: { completed: number; finish?: string; tokens?: Tokens }) {
    const turn = this.byID.get(id)
    if (!turn || turn.info.role !== "assistant") return
    turn.info.time.completed = Math.max(turn.info.time.completed ?? 0, input.completed)
    if (input.finish) turn.finish = input.finish
    if (input.tokens) turn.tokens = input.tokens
  }

  text(id: MessageID, text: string, timestamp: number, seed: string, counter: number) {
    this.part(id, timestamp, seed, counter, (base) => ({
      ...base,
      type: "text",
      text,
      time: { start: timestamp, end: timestamp },
    }))
  }

  reasoning(
    id: MessageID,
    text: string,
    timestamp: number,
    seed: string,
    counter: number,
    metadata?: Record<string, unknown>,
  ) {
    this.part(id, timestamp, seed, counter, (base) => ({
      ...base,
      type: "reasoning",
      text,
      time: { start: timestamp, end: timestamp },
      ...(metadata ? { metadata } : {}),
    }))
  }

  file(id: MessageID, mime: string, url: string, timestamp: number, seed: string, counter: number) {
    this.part(id, timestamp, seed, counter, (base) => ({ ...base, type: "file", mime, url }))
  }

  toolUse(
    id: MessageID,
    callID: string,
    tool: string,
    input: Record<string, unknown>,
    timestamp: number,
    seed: string,
    counter: number,
  ) {
    const part = this.part(id, timestamp, seed, counter, (base) => ({
      ...base,
      type: "tool",
      callID,
      tool,
      state: { status: "pending", input, raw: JSON.stringify(input) },
    }))
    const turn = this.byID.get(id)
    if (part?.type === "tool" && turn) this.pending.set(callID, { part, turn })
  }

  toolResult(input: {
    callID: string
    timestamp: number
    output: string
    isError: boolean
    metadata: Record<string, unknown>
    attachments?: Attachment[]
  }) {
    const match = this.pending.get(input.callID)
    if (!match) return false
    this.pending.delete(input.callID)
    const start = match.part.state.status === "pending" ? PartTime.of(match.part.id) : input.timestamp
    const time = { start, end: Math.max(start, input.timestamp) }
    const attachments = (input.attachments ?? []).map(
      (file, i): MessageV2.FilePart => ({
        ...this.base(match.turn.info.id, input.timestamp, `${input.callID}:attachment:${i}`, i + 1),
        type: "file",
        mime: file.mime,
        url: file.url,
      }),
    )
    match.part.state = input.isError
      ? { status: "error", input: match.part.state.input, error: input.output, metadata: input.metadata, time }
      : {
          status: "completed",
          input: match.part.state.input,
          output: input.output,
          title: match.part.tool,
          metadata: input.metadata,
          time,
          ...(attachments.length ? { attachments } : {}),
        }
    if (match.turn.info.role === "assistant")
      match.turn.info.time.completed = Math.max(match.turn.info.time.completed ?? 0, input.timestamp)
    return true
  }

  skip(kind: string) {
    this.skipped[kind] = (this.skipped[kind] ?? 0) + 1
  }

  /** Adds the synthetic step parts, back-fills user models and sums session usage. */
  finish(): MessageV2.WithParts[] {
    let nextModel: string | undefined
    for (const turn of this.turns.toReversed()) {
      if (turn.info.role === "assistant") {
        nextModel = turn.info.modelID
        continue
      }
      if (nextModel) turn.info.model = { providerID: this.providerID, modelID: ModelID.make(nextModel) }
    }
    return this.turns.map((turn) => {
      if (turn.info.role !== "assistant") return { info: turn.info, parts: turn.parts.toSorted(byID) }
      const tokens = turn.tokens ?? emptyTokens()
      turn.info.tokens = tokens
      turn.info.finish =
        turn.finish ??
        (turn.parts.some((p) => p.type === "tool" && p.state.status === "pending") ? "tool-calls" : undefined)
      this.tokens.input += tokens.input
      this.tokens.output += tokens.output
      this.tokens.reasoning += tokens.reasoning
      this.tokens.cache.read += tokens.cache.read
      this.tokens.cache.write += tokens.cache.write
      const created = turn.info.time.created
      const completed = turn.info.time.completed ?? created
      const start: MessageV2.StepStartPart = {
        ...this.base(turn.info.id, created, `${turn.info.id}:step-start`, 0),
        type: "step-start",
      }
      const end: MessageV2.StepFinishPart = {
        ...this.base(turn.info.id, completed, `${turn.info.id}:step-finish`, 0xfff),
        type: "step-finish",
        reason: turn.finish ?? "unknown",
        cost: 0,
        tokens,
      }
      return { info: turn.info, parts: [start, ...turn.parts, end].toSorted(byID) }
    })
  }

  session(input: {
    projectID: ProjectID
    parentID?: SessionID
    slug: string
    directory: string
    title: string
    version: string
    created: number
    updated: number
  }): Session.Info {
    // `Session.Info` uses `optionalOmitUndefined`: absent keys are fine, explicit
    // `undefined` is not, so optional fields are only spread in when present.
    return {
      id: this.sessionID,
      slug: input.slug,
      projectID: input.projectID,
      ...(input.parentID ? { parentID: input.parentID } : {}),
      directory: input.directory,
      title: input.title,
      agent: this.agent,
      ...(this.lastModel ? { model: { id: ModelID.make(this.lastModel), providerID: this.providerID } } : {}),
      version: input.version,
      cost: 0,
      tokens: this.tokens,
      time: { created: input.created, updated: input.updated },
    }
  }

  private push(turn: Turn) {
    this.turns.push(turn)
    this.byID.set(turn.info.id, turn)
  }

  private base(messageID: MessageID, timestamp: number, seed: string, counter: number) {
    return {
      id: PartID.make(ImportIdent.deterministic("part", { timestamp, seed: `${this.seed}:${seed}`, counter })),
      sessionID: this.sessionID,
      messageID,
    }
  }

  private part(
    id: MessageID,
    timestamp: number,
    seed: string,
    counter: number,
    build: (base: ReturnType<Builder["base"]>) => MessageV2.Part,
  ) {
    const turn = this.byID.get(id)
    if (!turn) return undefined
    const part = build(this.base(id, timestamp, seed, counter))
    turn.parts.push(part)
    return part
  }
}

const PartTime = {
  of(id: PartID) {
    return Number(BigInt("0x" + id.slice(4, 16)) / BigInt(0x1000))
  },
}

function byID(a: { id: string }, b: { id: string }) {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

export * as Normalizer from "./normalizer"
