import { Schema } from "effect"
import { arr, millis, num, obj, parse as parseJsonl, str } from "./jsonl"

const decodeJson = Schema.decodeUnknownOption(Schema.UnknownFromJsonString)

// Typed view of Codex CLI rollouts (`~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl`),
// as proposed in spike §3. Current rollouts wrap every line in `{timestamp, type,
// payload}`; the legacy layout has a bare meta object on line 1 followed by raw
// response items. Both collapse into the same `Item` list.

export type Usage = { input: number; output: number; reasoning: number; cacheRead: number }

export type Item = { index: number; timestamp?: number } & (
  | { kind: "message"; role: "user" | "assistant"; text: string; images: string[] }
  | { kind: "reasoning"; text: string }
  | { kind: "tool_call"; callID: string; name: string; input: Record<string, unknown> }
  | { kind: "tool_output"; callID: string; output: string; isError: boolean }
  | { kind: "model"; model: string }
  | { kind: "tokens"; usage: Usage }
)

export type Session = {
  id?: string
  cwd?: string
  cliVersion?: string
  timestamp?: number
  branch?: string
  items: Item[]
  skipped: Record<string, number>
  warnings: string[]
}

export function parse(text: string): Session {
  const jsonl = parseJsonl(text)
  const session: Session = { items: [], skipped: {}, warnings: jsonl.warnings }
  for (const line of jsonl.lines) {
    const type = str(line.value.type)
    const timestamp = millis(line.value.timestamp)
    if (type === undefined && line.index === 1 && str(line.value.id)) {
      applyMeta(session, line.value)
      continue
    }
    if (type === "session_meta") {
      applyMeta(session, obj(line.value.payload) ?? {})
      continue
    }
    // Enveloped lines carry `payload`; legacy lines are the response item itself.
    const enveloped = obj(line.value.payload) !== undefined
    const payload = enveloped ? obj(line.value.payload) : line.value
    const kind = enveloped ? (type ?? "<none>") : "response_item"
    if (kind === "event_msg") {
      const item = fromEvent(line.index, timestamp, obj(line.value.payload) ?? {})
      if (item) session.items.push(item)
      else session.skipped["event_msg"] = (session.skipped["event_msg"] ?? 0) + 1
      continue
    }
    if (kind === "turn_context") {
      const model = str(payload?.model)
      if (model) session.items.push({ kind: "model", index: line.index, timestamp, model })
      session.cwd ??= str(payload?.cwd)
      continue
    }
    if (kind !== "response_item" || !payload) {
      session.skipped[kind] = (session.skipped[kind] ?? 0) + 1
      continue
    }
    const item = fromResponseItem(line.index, timestamp, payload)
    if (item) session.items.push(item)
    else
      session.skipped[`response_item.${str(payload.type) ?? "<none>"}`] =
        (session.skipped[`response_item.${str(payload.type) ?? "<none>"}`] ?? 0) + 1
  }
  return session
}

function applyMeta(session: Session, meta: Record<string, unknown>) {
  session.id ??= str(meta.id)
  session.cwd ??= str(meta.cwd)
  session.cliVersion ??= str(meta.cli_version)
  session.timestamp ??= millis(meta.timestamp)
  session.branch ??= str(obj(meta.git)?.branch)
}

function fromEvent(index: number, timestamp: number | undefined, payload: Record<string, unknown>): Item | undefined {
  if (str(payload.type) !== "token_count") return undefined
  const usage = obj(obj(payload.info)?.total_token_usage) ?? obj(payload.usage)
  if (!usage) return undefined
  return {
    kind: "tokens",
    index,
    timestamp,
    usage: {
      input: num(usage.input_tokens) ?? 0,
      output: num(usage.output_tokens) ?? 0,
      reasoning: num(usage.reasoning_output_tokens) ?? 0,
      cacheRead: num(usage.cached_input_tokens) ?? 0,
    },
  }
}

function fromResponseItem(
  index: number,
  timestamp: number | undefined,
  payload: Record<string, unknown>,
): Item | undefined {
  const type = str(payload.type)
  if (type === "message") {
    const role = str(payload.role)
    if (role !== "user" && role !== "assistant") return undefined
    const content = (arr(payload.content) ?? []).flatMap((raw) => (obj(raw) ? [obj(raw)!] : []))
    const text = content
      .flatMap((block) => {
        const kind = str(block.type)
        return kind === "input_text" || kind === "output_text" || kind === "text" ? [str(block.text) ?? ""] : []
      })
      .join("\n")
    const images = content.flatMap((block) => (str(block.type) === "input_image" ? [str(block.image_url) ?? ""] : []))
    return { kind: "message", index, timestamp, role, text, images }
  }
  if (type === "reasoning") {
    const summary = (arr(payload.summary) ?? []).flatMap((raw) => (str(obj(raw)?.text) ? [str(obj(raw)?.text)!] : []))
    const content = (arr(payload.content) ?? []).flatMap((raw) => (str(obj(raw)?.text) ? [str(obj(raw)?.text)!] : []))
    return { kind: "reasoning", index, timestamp, text: [...summary, ...content].join("\n") }
  }
  if (type === "function_call" || type === "custom_tool_call") {
    const raw = payload.arguments ?? payload.input
    const parsed = typeof raw === "string" ? parseArguments(raw) : obj(raw)
    return {
      kind: "tool_call",
      index,
      timestamp,
      callID: str(payload.call_id) ?? `call_${index}`,
      name: str(payload.name) ?? "unknown",
      input: parsed ?? { raw: typeof raw === "string" ? raw : JSON.stringify(raw ?? null) },
    }
  }
  if (type === "local_shell_call") {
    const action = obj(payload.action) ?? {}
    return {
      kind: "tool_call",
      index,
      timestamp,
      callID: str(payload.call_id) ?? `call_${index}`,
      name: "shell",
      input: { command: arr(action.command) ?? [], workdir: str(action.working_directory) },
    }
  }
  if (type === "function_call_output" || type === "custom_tool_call_output") {
    const output = payload.output
    // Codex serializes shell results as a JSON string `{output, metadata:{exit_code}}`.
    const structured = obj(output) ?? (typeof output === "string" ? parseArguments(output) : undefined)
    const exitCode = num(obj(structured?.metadata)?.exit_code)
    return {
      kind: "tool_output",
      index,
      timestamp,
      callID: str(payload.call_id) ?? "",
      output: str(structured?.output) ?? str(output) ?? JSON.stringify(output ?? ""),
      isError: exitCode !== undefined && exitCode !== 0,
    }
  }
  return undefined
}

function parseArguments(raw: string) {
  const result = decodeJson(raw)
  return result._tag === "Some" ? obj(result.value) : undefined
}

export * as Codex from "./codex"
