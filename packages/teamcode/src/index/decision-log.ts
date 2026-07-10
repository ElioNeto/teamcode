/**
 * Decision Log — histórico persistente de decisões do usuário por projeto.
 *
 * Cada decisão é registrada com:
 *   - Timestamp
 *   - Contexto (o que estava acontecendo)
 *   - Decisão tomada
 *   - Racional (por que foi tomada)
 *   - Resultado (o que aconteceu depois)
 *
 * Armazenado em ~/.local/share/teamcode/decisions/<project-hash>/decisions.jsonl
 */

import * as Global from "@teamcode-ai/core/global"
import path from "path"
import fs from "fs/promises"
import { createWriteStream, existsSync, mkdirSync } from "fs"

const log = createWriteStream

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Decision {
  /** Unique decision ID (timestamp-based) */
  readonly id: string
  /** When the decision was made */
  readonly timestamp: number
  /** The session ID if made during a session */
  readonly sessionId?: string
  /** What was happening when the decision was made */
  readonly context: string
  /** The actual decision taken */
  readonly decision: string
  /** Why this decision was made */
  readonly rationale: string
  /** What happened as a result (filled in later) */
  readonly outcome?: string
  /** Type of decision */
  readonly type: DecisionType
  /** Tags for categorization */
  readonly tags: string[]
  /** File paths involved (relative to project root) */
  readonly files?: string[]
}

export type DecisionType =
  | "file_create"
  | "file_delete"
  | "file_modify"
  | "refactor"
  | "dependency_add"
  | "dependency_remove"
  | "config_change"
  | "architecture"
  | "tool_use"
  | "setting_change"
  | "other"

// ---------------------------------------------------------------------------
// Decision storage
// ---------------------------------------------------------------------------

function decisionDir(projectRoot: string): string {
  const hash = simpleHash(projectRoot)
  return path.join(Global.Path.data, "decisions", hash)
}

function simpleHash(s: string): string {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

function ensureDir(dir: string) {
  mkdirSync(dir, { recursive: true })
}

let writers = new Map<string, (decision: Decision) => void>()

function getWriter(projectRoot: string): (decision: Decision) => void {
  const existing = writers.get(projectRoot)
  if (existing) return existing

  const dir = decisionDir(projectRoot)
  ensureDir(dir)

  const filePath = path.join(dir, "decisions.jsonl")
  const stream = createWriteStream(filePath, { flags: "a" })

  const write = (decision: Decision) => {
    stream.write(JSON.stringify(decision) + "\n")
  }

  writers.set(projectRoot, write)
  return write
}

// ---------------------------------------------------------------------------
// Recording decisions
// ---------------------------------------------------------------------------

let decisionId = 0

export function record(options: {
  projectRoot: string
  context: string
  decision: string
  rationale: string
  type?: DecisionType
  sessionId?: string
  tags?: string[]
  files?: string[]
}): void {
  const entry: Decision = {
    id: `${Date.now()}-${++decisionId}`,
    timestamp: Date.now(),
    sessionId: options.sessionId,
    context: options.context,
    decision: options.decision,
    rationale: options.rationale,
    type: options.type ?? "other",
    tags: options.tags ?? [],
    files: options.files,
  }

  const write = getWriter(options.projectRoot)
  write(entry)
}

// ---------------------------------------------------------------------------
// Reading decisions
// ---------------------------------------------------------------------------

export async function getDecisions(projectRoot: string): Promise<Decision[]> {
  const dir = decisionDir(projectRoot)
  const filePath = path.join(dir, "decisions.jsonl")
  try {
    const content = await fs.readFile(filePath, "utf-8")
    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Decision)
      .sort((a, b) => a.timestamp - b.timestamp)
  } catch {
    return []
  }
}

export async function getDecisionsByType(
  projectRoot: string,
  type: DecisionType,
): Promise<Decision[]> {
  const all = await getDecisions(projectRoot)
  return all.filter((d) => d.type === type)
}

export async function getRecentDecisions(
  projectRoot: string,
  limit = 10,
): Promise<Decision[]> {
  const all = await getDecisions(projectRoot)
  return all.slice(-limit).reverse()
}

// ---------------------------------------------------------------------------
// Updating outcomes
// ---------------------------------------------------------------------------

export async function updateOutcome(
  projectRoot: string,
  decisionId: string,
  outcome: string,
): Promise<void> {
  const dir = decisionDir(projectRoot)
  const filePath = path.join(dir, "decisions.jsonl")
  try {
    const content = await fs.readFile(filePath, "utf-8")
    const lines = content.split("\n").filter(Boolean)
    const updated = lines.map((line) => {
      const entry = JSON.parse(line) as Decision
      if (entry.id === decisionId) {
        return JSON.stringify({ ...entry, outcome })
      }
      return line
    })
    await fs.writeFile(filePath, updated.join("\n") + "\n")
  } catch {
    // File doesn't exist yet, nothing to update
  }
}

// ---------------------------------------------------------------------------
// Summary for the AI
// ---------------------------------------------------------------------------

/**
 * Generate a concise summary of recent decisions for the AI agent context.
 */
export async function generateSummary(projectRoot: string): Promise<string> {
  const recent = await getRecentDecisions(projectRoot, 20)
  if (recent.length === 0) return ""

  const lines = recent.map(
    (d) =>
      `[${new Date(d.timestamp).toISOString()}] [${d.type}] ${d.decision} — ${d.rationale}${d.outcome ? ` → ${d.outcome}` : ""}`,
  )

  return [
    "---",
    "## Recent Project Decisions",
    "The following decisions were made recently in this project:",
    ...lines,
    "---",
  ].join("\n")
}

export * as DecisionLog from "./decision-log"
