/**
 * ApexStore storage adapter for TeamCode.
 *
 * Integrates the ApexStore LSM-Tree KV engine as an optional sidecar process
 * for high-performance caching and persistent key-value storage.
 *
 * ## Use cases
 *
 * 1. **Prefix cache for LLM models** — cache system prompts and context
 *    to reduce recomputation across sessions
 * 2. **Session state cache** — quick access to session metadata without
 *    hitting SQLite
 * 3. **Tool call history** — efficient storage with LZ4 compression via
 *    ApexStore's block-level prefix compression
 *
 * ## Lifecycle
 *
 * - `init()` — starts the ApexStore sidecar process
 * - `close()` — stops the sidecar process and flushes data to disk
 * - The sidecar's WAL ensures durability across restarts
 */

import { Global } from "@teamcode-ai/core/global"
import { join } from "node:path"
import { startSidecar, type SidecarHandle, type SidecarOptions } from "./sidecar"
import { ApexStoreClient } from "./client"

export { ApexStoreClient } from "./client"
export type { ApexStoreStats, AdminCompactResult } from "./client"

export interface ApexStoreOptions {
  enabled?: boolean
  dataDir?: string
  port?: number
  memtableMaxSize?: number
  blockCacheSizeMb?: number
}

let handle: SidecarHandle | null = null
let _enabled = false

export function isEnabled(): boolean {
  return _enabled && handle !== null
}

export function client(): ApexStoreClient {
  if (!handle) throw new Error("ApexStore not initialized")
  return handle.client
}

export async function init(opts?: ApexStoreOptions): Promise<void> {
  if (opts?.enabled === false) {
    _enabled = false
    return
  }

  const dataDir = opts?.dataDir ?? join(Global.Path.data, "apexstore")

  const sidecarOpts: SidecarOptions = {
    dataDir,
    port: opts?.port,
    memtableMaxSize: opts?.memtableMaxSize,
    blockCacheSizeMb: opts?.blockCacheSizeMb,
  }

  try {
    handle = await startSidecar(sidecarOpts)
    _enabled = true
  } catch (error) {
    _enabled = false
    console.warn("[apex-store] failed to start sidecar", error)
  }
}

export async function close(): Promise<void> {
  if (!handle) return
  const h = handle
  handle = null
  _enabled = false
  await h.stop()
}

// Convenience: prefix-based namespace for cache entries
const CACHE_PREFIX = "tc:cache:"

export async function cacheGet(namespace: string, key: string): Promise<string | null> {
  if (!_enabled) return null
  return client().get(`${CACHE_PREFIX}${namespace}:${key}`)
}

export async function cacheSet(namespace: string, key: string, value: string): Promise<void> {
  if (!_enabled) return
  await client().set(`${CACHE_PREFIX}${namespace}:${key}`, value)
}

export async function cacheDelete(namespace: string, key: string): Promise<void> {
  if (!_enabled) return
  await client().delete(`${CACHE_PREFIX}${namespace}:${key}`)
}

export async function cacheList(namespace: string): Promise<string[]> {
  if (!_enabled) return []
  const keys = await client().list(`${CACHE_PREFIX}${namespace}:`)
  return keys.map((k: string) => k.slice(`${CACHE_PREFIX}${namespace}:`.length))
}

export async function stats() {
  if (!_enabled) return null
  return client().stats()
}

export * as ApexStore from "."
