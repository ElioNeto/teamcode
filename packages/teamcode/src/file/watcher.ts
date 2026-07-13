/// <reference lib="ES2023" />

import { Cause, Duration, Effect, Layer, Context, Schema, Queue } from "effect"
// @ts-ignore
import { createWrapper } from "@parcel/watcher/wrapper"
import type ParcelWatcher from "@parcel/watcher"
import { readdir, realpath, stat } from "node:fs/promises"
import path from "node:path"
import { Bus } from "@/bus"
import { BusEvent } from "@/bus/bus-event"
import { EffectBridge } from "@/effect/bridge"
import { InstanceState } from "@/effect/instance-state"
import { RuntimeFlags } from "@/effect/runtime-flags"
import { Git } from "@/git"
import { lazy } from "@/util/lazy"
import { Config } from "@/config/config"
import { FileIgnore } from "./ignore"
import { Protected } from "./protected"
import * as Log from "@teamcode-ai/core/util/log"

declare const TEAMCODE_LIBC: string | undefined

const log = Log.create({ service: "file.watcher" })

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Maximum time to wait for a native subscribe call */
const SUBSCRIBE_TIMEOUT_MS = 8_000

/** Debounce window for coalescing file events */
const DEBOUNCE_MS = 100

/** Polling interval used when native watcher is unavailable */
const POLL_INTERVAL_MS = 2_000

/** After this many subscribe timeouts, fall back to polling permanently */
const MAX_SUBSCRIBE_RETRIES = 3

// ---------------------------------------------------------------------------
// Suppression (for undo operations, see #817)
// ---------------------------------------------------------------------------

let suppressWatcherUntil = 0
export function suppressWatcherFor(ms: number) {
  suppressWatcherUntil = Date.now() + ms
}

// ---------------------------------------------------------------------------
// Event
// ---------------------------------------------------------------------------

export const Event = {
  Updated: BusEvent.define(
    "file.watcher.updated",
    Schema.Struct({
      file: Schema.String,
      event: Schema.Literals(["add", "change", "unlink"]),
    }),
  ),
}

// ---------------------------------------------------------------------------
// Native watcher loader
// ---------------------------------------------------------------------------

const _TEAMCODE_LIBC: string | undefined = typeof TEAMCODE_LIBC !== "undefined" ? TEAMCODE_LIBC : undefined

const nativeWatcher = lazy((): typeof import("@parcel/watcher") | undefined => {
  try {
    const libc = process.platform === "linux" ? `-${_TEAMCODE_LIBC || "glibc"}` : ""
    const binding = require(`@parcel/watcher-${process.platform}-${process.arch}${libc}`)
    return createWrapper(binding) as typeof import("@parcel/watcher")
  } catch (error) {
    log.warn("native watcher binding unavailable, using polling fallback", { error: (error as Error).message })
    return
  }
})

export const hasNativeBinding = () => !!nativeWatcher()

function getBackend() {
  if (process.platform === "win32") return "windows"
  if (process.platform === "darwin") return "fs-events"
  if (process.platform === "linux") return "inotify"
}

function protecteds(dir: string) {
  return Protected.paths().filter((item) => {
    const rel = path.relative(dir, item)
    return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel)
  })
}

// ---------------------------------------------------------------------------
// Polling fallback watcher
// ---------------------------------------------------------------------------

function createPollWatcher(
  dir: string,
  onChange: (events: ParcelWatcher.Event[]) => void,
  ignore: string[],
): { stop: () => void } {
  const ignoreSet = new Set(ignore)
  let prevFiles = new Map<string, number>()
  let stopped = false

  // Pre-populate initial file map
  const scan = async () => {
    const files = new Map<string, number>()
    const walk = async (d: string) => {
      if (stopped) return
      try {
        const entries = await readdir(d, { withFileTypes: true })
        for (const entry of entries) {
          const fullPath = path.join(d, entry.name)
          if (ignoreSet.has(entry.name)) continue
          if (entry.isDirectory()) {
            if (entry.name === ".git" || entry.name === "node_modules") continue
            await walk(fullPath)
          } else if (entry.isFile()) {
            try {
              const s = await stat(fullPath)
              files.set(fullPath, s.mtimeMs)
            } catch {
              // file might have been deleted during scan
            }
          }
        }
      } catch {
        // permission denied, skip
      }
    }
    await walk(dir)
    return files
  }

  // Initial scan
  scan().then((files) => {
    prevFiles = files
  })

  const interval = setInterval(async () => {
    if (stopped) return
    const current = await scan()
    const events: ParcelWatcher.Event[] = []

    // Check for added/modified files
    for (const [filePath, mtime] of current) {
      const prevMtime = prevFiles.get(filePath)
      if (prevMtime === undefined) {
        events.push({ path: filePath, type: "create" })
      } else if (prevMtime !== mtime) {
        events.push({ path: filePath, type: "update" })
      }
    }

    // Check for deleted files
    for (const [filePath] of prevFiles) {
      if (!current.has(filePath)) {
        events.push({ path: filePath, type: "delete" })
      }
    }

    if (events.length > 0) {
      onChange(events)
    }

    prevFiles = current
  }, POLL_INTERVAL_MS)

  return {
    stop: () => {
      stopped = true
      clearInterval(interval)
    },
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export interface Interface {
  readonly init: () => Effect.Effect<void>
}

export class Service extends Context.Service<Service, Interface>()("@teamcode/FileWatcher") {}

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const config = yield* Config.Service
    const git = yield* Git.Service
    const flags = yield* RuntimeFlags.Service

    const state = yield* InstanceState.make(
      Effect.fn("FileWatcher.state")(
        function* () {
          if (flags.disableFilewatcher) return

          const ctx = yield* InstanceState.context

          log.info("init", { directory: ctx.directory })

          // Skip filesystem root directories — recursive inotify on "/" would
          // register watches on the entire filesystem and timeout.
          if (path.dirname(ctx.directory) === ctx.directory) {
            log.warn("skipped filesystem root directory", { directory: ctx.directory })
            return
          }

          const backend = getBackend()
          if (!backend) {
            log.error("watcher backend not supported", { platform: process.platform })
            return
          }

          const w = nativeWatcher()

          // Determine which dirs to watch
          const cfg = yield* config.get()
          const cfgIgnores = cfg.watcher?.ignore ?? []
          const watchDirs: Array<{ dir: string; ignore: string[] }> = []

          // Main project directory
          watchDirs.push({
            dir: ctx.directory,
            ignore: [...FileIgnore.PATTERNS, ...cfgIgnores, ...protecteds(ctx.directory)],
          })

          // Git directory (for branch/tracking changes)
          if (ctx.project.vcs === "git") {
            const result = yield* git.run(["rev-parse", "--git-dir"], { cwd: ctx.worktree })
            const resolved = result.exitCode === 0 ? path.resolve(ctx.worktree, result.text().trim()) : undefined
            const vcsDir = resolved ? yield* Effect.promise(() => realpath(resolved).catch(() => resolved)) : undefined
            if (vcsDir && !cfgIgnores.includes(".git") && !cfgIgnores.includes(vcsDir)) {
              const ignore = (yield* Effect.promise(() => readdir(vcsDir).catch(() => []))).filter(
                (entry) => entry !== "HEAD",
              )
              watchDirs.push({ dir: vcsDir, ignore })
            }
          }

          // Subscribe all dirs in parallel
          const subs: Array<ParcelWatcher.AsyncSubscription | { unsubscribe: () => void }> = []
          yield* Effect.addFinalizer(() =>
            Effect.promise(() => Promise.allSettled(subs.map((sub) => sub.unsubscribe?.() ?? sub.unsubscribe()))),
          )

          const bridge = yield* EffectBridge.make()

          // Event queue to decouple watcher callbacks from bus publishing
          const eventQueue = yield* Queue.unbounded<ParcelWatcher.Event>()

          // Consumer: debounce and publish
          yield* Effect.forkScoped(
            Effect.gen(function* () {
              let pending: ParcelWatcher.Event[] = []
              let timer: ReturnType<typeof setTimeout> | null = null
              const flush = () => {
                timer = null
                const batch = pending
                pending = []
                if (Date.now() < suppressWatcherUntil) return
                for (const evt of batch) {
                  if (evt.type === "create") void Bus.publish(ctx, Event.Updated, { file: evt.path, event: "add" })
                  if (evt.type === "update") void Bus.publish(ctx, Event.Updated, { file: evt.path, event: "change" })
                  if (evt.type === "delete") void Bus.publish(ctx, Event.Updated, { file: evt.path, event: "unlink" })
                }
              }
              while (true) {
                const evt = yield* Queue.take(eventQueue)
                pending.push(evt)
                if (timer) clearTimeout(timer)
                timer = setTimeout(flush, DEBOUNCE_MS)
              }
            }),
          )

          const cb: ParcelWatcher.SubscribeCallback = bridge.bind((err, evts) => {
            if (err) {
              log.warn("watcher error", { error: err })
              return
            }
            for (const evt of evts) {
              Queue.offer(eventQueue, evt).pipe(Effect.runFork)
            }
          })

          // Subscribe each directory
          for (const { dir, ignore: ignoreList } of watchDirs) {
            if (w) {
              // Native watcher with retry + polling fallback
              const tryNative = (attempt: number): Effect.Effect<void> =>
                Effect.gen(function* () {
                  const sub = yield* Effect.promise(() =>
                    w.subscribe(dir, bridge.bind(cb), { ignore: ignoreList, backend }),
                  )
                  subs.push(sub)
                }).pipe(
                  Effect.timeout(Duration.millis(SUBSCRIBE_TIMEOUT_MS)),
                  Effect.catchCause((cause) => {
                    log.warn("native subscribe failed, retrying", {
                      dir,
                      attempt: attempt + 1,
                      error: Cause.pretty(cause),
                    })
                    if (attempt < MAX_SUBSCRIBE_RETRIES) {
                      return Effect.sleep(Duration.millis(200 * Math.pow(2, attempt))).pipe(
                        Effect.andThen(tryNative(attempt + 1)),
                      )
                    }
                    // Fall back to polling
                    log.info("falling back to polling watcher", { dir })
                    const poller = createPollWatcher(
                      dir,
                      (events) => {
                        for (const evt of events) {
                          Queue.offer(eventQueue, evt).pipe(Effect.runFork)
                        }
                      },
                      ignoreList,
                    )
                    subs.push({ unsubscribe: poller.stop })
                    return Effect.void
                  }),
                )

              yield* Effect.forkScoped(tryNative(0))
            } else {
              // No native watcher — use polling
              log.info("using polling watcher (no native binding)", { dir })
              const poller = createPollWatcher(
                dir,
                (events) => {
                  for (const evt of events) {
                    Queue.offer(eventQueue, evt).pipe(Effect.runFork)
                  }
                },
                ignoreList,
              )
              subs.push({ unsubscribe: poller.stop })
            }
          }
        },
        Effect.catchCause((cause) => {
          log.error("failed to init watcher service", { cause: Cause.pretty(cause) })
          return Effect.void
        }),
      ),
    )

    return Service.of({
      init: Effect.fn("FileWatcher.init")(function* () {
        yield* InstanceState.get(state)
      }),
    })
  }),
)

export const defaultLayer = layer.pipe(
  Layer.provide(Config.defaultLayer),
  Layer.provide(Git.defaultLayer),
  Layer.provide(RuntimeFlags.defaultLayer),
)

export * as FileWatcher from "./watcher"
