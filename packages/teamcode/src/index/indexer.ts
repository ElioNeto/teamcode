/**
 * Project indexer — mantém um índice vivo da estrutura do projeto.
 *
 * Armazenado em ~/.local/share/teamcode/index/<project-hash>/
 * Inclui árvore de diretórios, metadados, conteúdos chave.
 * A indexação é VIVA: polling a cada 5s detecta mudanças.
 */

import { Effect } from "effect"
import * as Log from "@teamcode-ai/core/util/log"
import * as Global from "@teamcode-ai/core/global"
import path from "node:path"
import fs from "node:fs/promises"

const log = Log.create({ service: "indexer" })

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IndexEntry {
  readonly path: string
  readonly name: string
  readonly ext: string
  readonly mtime: number
  readonly size: number
  readonly isDir: boolean
}

export interface ProjectIndex {
  readonly root: string
  readonly name: string
  readonly updatedAt: number
  readonly entries: IndexEntry[]
  readonly keyFiles: Record<string, string>
}

export interface IndexDiff {
  readonly added: string[]
  readonly removed: string[]
  readonly modified: string[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const KEY_FILE_PATTERNS = [
  "README.md",
  "package.json",
  "tsconfig.json",
  ".gitignore",
  "Dockerfile",
  "Makefile",
  "go.mod",
  "Cargo.toml",
]

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".teamcode",
  "dist",
  "build",
  ".cache",
  "target",
  "vendor",
  ".next",
  ".turbo",
  ".nyc_output",
  "coverage",
  "__pycache__",
  ".venv",
])

const MAX_FILE_SIZE = 100_000

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function simpleHash(s: string): string {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    const char = s.codePointAt(i) ?? 0
    hash = (hash << 5) - hash + char
    hash = Math.trunc(hash)
  }
  return Math.abs(hash).toString(36)
}

function indexDir(root: string): string {
  return path.join(Global.Path.data, "index", simpleHash(root))
}

// ---------------------------------------------------------------------------
// Build index
// ---------------------------------------------------------------------------

async function walkDir(
  root: string,
  dir: string,
  ignoreDirs: Set<string>,
): Promise<{ entries: IndexEntry[]; keyFiles: Record<string, string> }> {
  const entries: IndexEntry[] = []
  const keyFiles: Record<string, string> = {}

  const children = await fs.readdir(dir).catch(() => [])
  for (const child of children.sort()) {
    const fullPath = path.join(dir, child)
    const relPath = path.relative(root, fullPath)
    let stat
    try {
      stat = await fs.stat(fullPath)
    } catch {
      continue
    }
    if (!stat) continue

    if (stat.isDirectory()) {
      if (ignoreDirs.has(child)) continue
      entries.push({
        path: relPath,
        name: child,
        ext: "",
        mtime: stat.mtimeMs,
        size: stat.size,
        isDir: true,
      })
      const sub = await walkDir(root, fullPath, ignoreDirs)
      entries.push(...sub.entries)
      Object.assign(keyFiles, sub.keyFiles)
    } else {
      const ext = path.extname(child)
      entries.push({
        path: relPath,
        name: child,
        ext,
        mtime: stat.mtimeMs,
        size: stat.size,
        isDir: false,
      })
      if (stat.size <= MAX_FILE_SIZE) {
        if (KEY_FILE_PATTERNS.includes(child)) {
          const content = await fs.readFile(fullPath, "utf-8").catch(() => null)
          if (content !== null) keyFiles[relPath] = content
        }
      }
    }
  }

  return { entries, keyFiles }
}

export async function buildIndex(root: string): Promise<ProjectIndex> {
  log.info("indexing project", { root })
  const { entries, keyFiles } = await walkDir(root, root, IGNORE_DIRS)
  const index: ProjectIndex = {
    root,
    name: path.basename(root),
    updatedAt: Date.now(),
    entries,
    keyFiles,
  }
  await persistIndex(root, index)
  log.info("indexing complete", { files: entries.length, keyFiles: Object.keys(keyFiles).length })
  return index
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

async function persistIndex(root: string, index: ProjectIndex): Promise<void> {
  const dir = indexDir(root)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(path.join(dir, "index.json"), JSON.stringify(index, null, 2))
}

export async function loadIndex(root: string): Promise<ProjectIndex | null> {
  try {
    const raw = await fs.readFile(path.join(indexDir(root), "index.json"), "utf-8")
    return JSON.parse(raw) as ProjectIndex
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Diff
// ---------------------------------------------------------------------------

export async function computeDiff(root: string, index: ProjectIndex): Promise<IndexDiff> {
  const current = await buildIndex(root)
  const currentMap = new Map(current.entries.map((e) => [e.path, e]))
  const oldMap = new Map(index.entries.map((e) => [e.path, e]))

  const added: string[] = []
  const removed: string[] = []
  const modified: string[] = []

  for (const [relPath, entry] of currentMap) {
    const old = oldMap.get(relPath)
    if (!old) added.push(relPath)
    else if (old.mtime !== entry.mtime || old.size !== entry.size) modified.push(relPath)
  }
  for (const [relPath] of oldMap) {
    if (!currentMap.has(relPath)) removed.push(relPath)
  }

  return { added, removed, modified }
}

// ---------------------------------------------------------------------------
// Live watching (Effect)
// ---------------------------------------------------------------------------

/**
 * Start polling-based watcher that re-indexes on changes.
 * Returns a cancel effect.
 */
export function watchIndex(root: string, onUpdate: (diff: IndexDiff) => void): Effect.Effect<void> {
  let cancel = false

  const poll = async () => {
    while (!cancel) {
      await new Promise((resolve) => setTimeout(resolve, 5000))
      if (cancel) break
      try {
        const stored = await loadIndex(root)
        if (stored) {
          const diff = await computeDiff(root, stored)
          if (diff.added.length > 0 || diff.removed.length > 0 || diff.modified.length > 0) {
            log.info("index updated", {
              added: diff.added.length,
              removed: diff.removed.length,
              modified: diff.modified.length,
            })
            onUpdate(diff)
            await buildIndex(root)
          }
        }
      } catch (e) {
        log.debug("index poll error", { error: e })
      }
    }
  }

  poll()

  return Effect.sync(() => {
    cancel = true
  })
}

export function searchIndex(index: ProjectIndex, query: string): IndexEntry[] {
  const lower = query.toLowerCase()
  return index.entries.filter((e) => e.path.toLowerCase().includes(lower))
}

export * as Indexer from "./indexer"
