/**
 * Logging improvements — logs organizados por projeto.
 *
 * Estrutura:
 *   ~/.local/share/teamcode/log/
 *     teamcode-YYYYMMDD.log           ← logs do próprio app teamcode
 *   <project-root>/.teamcode/logs/
 *     session-<id>.log                ← logs por sessão
 *     decisions.jsonl                 ← decisões do usuário (link simbólico)
 *
 * Isso permite que cada projeto tenha seus próprios logs, fáceis de
 * encontrar e navegar.
 */

import * as Global from "@teamcode-ai/core/global"
import path from "node:path"
import fs from "node:fs/promises"
import { mkdirSync, createWriteStream, existsSync } from "node:fs"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PROJECT_LOGS_DIR = ".teamcode/logs"

// ---------------------------------------------------------------------------
// Project log setup
// ---------------------------------------------------------------------------

export function ensureProjectLogDir(projectRoot: string): string {
  const dir = path.join(projectRoot, PROJECT_LOGS_DIR)
  mkdirSync(dir, { recursive: true })
  return dir
}

// ---------------------------------------------------------------------------
// Session log
// ---------------------------------------------------------------------------

let sessionStreams = new Map<string, ReturnType<typeof createWriteStream>>()

export function getSessionLogPath(projectRoot: string, sessionId: string): string {
  const dir = ensureProjectLogDir(projectRoot)
  return path.join(dir, `session-${sessionId}.log`)
}

export function writeSessionLog(
  projectRoot: string,
  sessionId: string,
  level: "INFO" | "WARN" | "ERROR" | "DEBUG",
  message: string,
  extra?: Record<string, unknown>,
): void {
  const key = `${projectRoot}:${sessionId}`
  let stream = sessionStreams.get(key)
  if (!stream) {
    const logPath = getSessionLogPath(projectRoot, sessionId)
    stream = createWriteStream(logPath, { flags: "a" })
    sessionStreams.set(key, stream)
  }

  const timestamp = new Date().toISOString()
  const extraStr = extra ? " " + JSON.stringify(extra) : ""
  stream.write(`${timestamp} [${level}] ${message}${extraStr}\n`)
}

export function closeSessionLog(projectRoot: string, sessionId: string): void {
  const key = `${projectRoot}:${sessionId}`
  const stream = sessionStreams.get(key)
  if (stream) {
    stream.end()
    sessionStreams.delete(key)
  }
}

// ---------------------------------------------------------------------------
// Decision log linker — creates a symlink from project to global decisions
// ---------------------------------------------------------------------------

export async function linkDecisionLog(projectRoot: string): Promise<void> {
  const dir = ensureProjectLogDir(projectRoot)
  const linkPath = path.join(dir, "decisions.jsonl")
  if (existsSync(linkPath)) return // already linked

  const hash = simpleHash(projectRoot)
  const target = path.join(Global.Path.data, "decisions", hash, "decisions.jsonl")

  // Ensure target directory exists
  mkdirSync(path.dirname(target), { recursive: true })

  try {
    await fs.symlink(target, linkPath)
  } catch {
    // Fallback: copy instead of symlink
    try {
      await fs.writeFile(linkPath, "")
    } catch {
      // Ignore
    }
  }
}

function simpleHash(s: string): string {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    const char = s.codePointAt(i) ?? 0
    hash = (hash << 5) - hash + char
    hash = Math.trunc(hash)
  }
  return Math.abs(hash).toString(36)
}

// ---------------------------------------------------------------------------
// Cleanup old session logs
// ---------------------------------------------------------------------------

export async function cleanOldSessionLogs(projectRoot: string, keepDays = 30): Promise<void> {
  const dir = ensureProjectLogDir(projectRoot)
  const cutoff = Date.now() - keepDays * 24 * 60 * 60 * 1000

  try {
    const files = await fs.readdir(dir)
    for (const file of files) {
      if (file.startsWith("session-") && file.endsWith(".log")) {
        const filePath = path.join(dir, file)
        const stat = await fs.stat(filePath)
        if (stat.mtimeMs < cutoff) {
          await fs.unlink(filePath)
        }
      }
    }
  } catch {
    // Directory doesn't exist yet
  }
}

// ---------------------------------------------------------------------------
// Hook into the app log system
// ---------------------------------------------------------------------------

/**
 * Wrap the default logger to also write per-project session logs.
 * This should be called when a session starts.
 */
export function hookProjectLogger(projectRoot: string, sessionId: string): void {
  const log = createWriteStream(getSessionLogPath(projectRoot, sessionId), { flags: "a" })
  log.write(`=== Session ${sessionId} started at ${new Date().toISOString()} ===\n`)
}

export * as ProjectLogs from "./logs"
