import { arr, millis, num, obj, parse as parseJsonl, str } from "./jsonl"

// Typed view of the Claude Code transcript format observed in
// `~/.claude/projects/<slug>/<sessionId>.jsonl` (spike §1). Nothing here knows about
// TeamCode; the normalizer does the mapping.

export type Block =
  | { type: "text"; text: string }
  | { type: "thinking"; thinking: string; signature?: string }
  | { type: "redacted_thinking" }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; toolUseID: string; content: Block[]; isError: boolean }
  | { type: "image"; mime: string; url: string }
  | { type: "unknown"; raw: string }

export type Usage = {
  input: number
  output: number
  reasoning: number
  cacheRead: number
  cacheWrite: number
}

export type Line = {
  index: number
  role: "user" | "assistant"
  uuid: string
  parentUuid?: string
  sidechain: boolean
  timestamp: number
  cwd?: string
  gitBranch?: string
  version?: string
  message: {
    id?: string
    model?: string
    stopReason?: string
    usage?: Usage
    content: Block[]
  }
  apiBlockIndex?: number
  toolUseResult?: unknown
}

export type Session = {
  sessionId?: string
  summary?: string
  lines: Line[]
  skipped: Record<string, number>
  warnings: string[]
}

export function parse(text: string): Session {
  const jsonl = parseJsonl(text)
  const session: Session = { lines: [], skipped: {}, warnings: jsonl.warnings }
  for (const item of jsonl.lines) {
    const type = str(item.value.type) ?? "<none>"
    if (type === "summary") {
      session.summary = str(item.value.summary) ?? session.summary
      continue
    }
    if (type !== "user" && type !== "assistant") {
      session.skipped[type] = (session.skipped[type] ?? 0) + 1
      continue
    }
    const line = toLine(type, item.index, item.value, session.warnings)
    if (!line) continue
    session.sessionId ??= str(item.value.sessionId)
    session.lines.push(line)
  }
  return session
}

/** Whether a user line is a human prompt (as opposed to a bag of tool results). */
export function isPrompt(line: Line) {
  return line.role === "user" && line.message.content.some((block) => block.type !== "tool_result")
}

export function promptText(line: Line) {
  return line.message.content
    .flatMap((block) => (block.type === "text" ? [block.text] : []))
    .join("\n")
    .trim()
}

function toLine(role: "user" | "assistant", index: number, value: Record<string, unknown>, warnings: string[]) {
  const message = obj(value.message)
  const uuid = str(value.uuid)
  const timestamp = millis(value.timestamp)
  if (!message || !uuid || timestamp === undefined) {
    warnings.push(`line ${index}: ${role} line without message, uuid or timestamp`)
    return undefined
  }
  const usage = obj(message.usage)
  return {
    index,
    role,
    uuid,
    parentUuid: str(value.parentUuid),
    sidechain: value.isSidechain === true,
    timestamp,
    cwd: str(value.cwd),
    gitBranch: str(value.gitBranch),
    version: str(value.version),
    message: {
      id: str(message.id),
      model: str(message.model),
      stopReason: str(message.stop_reason),
      usage: usage ? toUsage(usage) : undefined,
      content: toBlocks(message.content),
    },
    apiBlockIndex: num(value.apiBlockIndex),
    toolUseResult: value.toolUseResult,
  } satisfies Line
}

function toUsage(usage: Record<string, unknown>): Usage {
  return {
    input: num(usage.input_tokens) ?? 0,
    output: num(usage.output_tokens) ?? 0,
    reasoning: num(obj(usage.output_tokens_details)?.thinking_tokens) ?? 0,
    cacheRead: num(usage.cache_read_input_tokens) ?? 0,
    cacheWrite: num(usage.cache_creation_input_tokens) ?? 0,
  }
}

function toBlocks(content: unknown): Block[] {
  const text = str(content)
  if (text !== undefined) return [{ type: "text", text }]
  return (arr(content) ?? []).flatMap((raw) => {
    const block = obj(raw)
    if (!block) return []
    return [toBlock(block)]
  })
}

function toBlock(block: Record<string, unknown>): Block {
  const type = str(block.type)
  if (type === "text") return { type, text: str(block.text) ?? "" }
  if (type === "thinking") return { type, thinking: str(block.thinking) ?? "", signature: str(block.signature) }
  if (type === "redacted_thinking") return { type }
  if (type === "tool_use" || type === "server_tool_use") {
    return {
      type: "tool_use",
      id: str(block.id) ?? "",
      name: str(block.name) ?? "unknown",
      input: obj(block.input) ?? {},
    }
  }
  if (type === "tool_result" || type === "web_search_tool_result") {
    return {
      type: "tool_result",
      toolUseID: str(block.tool_use_id) ?? "",
      content: toBlocks(block.content),
      isError: block.is_error === true,
    }
  }
  if (type === "image") {
    const source = obj(block.source) ?? {}
    const mime = str(source.media_type) ?? "image/png"
    const url = str(source.url) ?? `data:${mime};base64,${str(source.data) ?? ""}`
    return { type, mime, url }
  }
  return { type: "unknown", raw: JSON.stringify(block) }
}

export * as ClaudeCode from "./claude-code"
