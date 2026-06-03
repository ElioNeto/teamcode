import { Cause, Duration, Effect, Layer, Context, Schema } from "effect"
// @ts-ignore
import { createWrapper } from "@parcel/watcher/wrapper"
import type ParcelWatcher from "@parcel/watcher"
import path from "path"
import { AppFileSystem } from "@teamcode-ai/core/filesystem"
import { BusEvent } from "@/bus/bus-event"
import { EffectBridge } from "@/effect/bridge"
import { InstanceState } from "@/effect/instance-state"
import { RuntimeFlags } from "@/effect/runtime-flags"
import { Config } from "@/config/config"
import { lazy } from "@/util/lazy"
import * as Log from "@teamcode-ai/core/util/log"
import { UI } from "@/cli/ui"

const log = Log.create({ service: "config.watcher" })
const SUBSCRIBE_TIMEOUT_MS = 10_000
const DEBOUNCE_MS = 500

/**
 * Event emitted when config files change and trigger a reload.
 */
export const Event = {
  Reloaded: BusEvent.define(
    "config.watcher.reloaded",
    Schema.Struct({
      file: Schema.String,
      event: Schema.Literals(["add", "change", "unlink"]),
    }),
  ),
}

declare const TEAMCODE_LIBC: string | undefined

const watcher = lazy((): typeof import("@parcel/watcher") | undefined => {
  try {
    const binding = require(
      `@parcel/watcher-${process.platform}-${process.arch}${process.platform === "linux" ? `-${TEAMCODE_LIBC || "glibc"}` : ""}`,
    )
    return createWrapper(binding) as typeof import("@parcel/watcher")
  } catch (error) {
    log.warn("failed to load watcher binding", { error })
    return
  }
})

function getBackend() {
  if (process.platform === "win32") return "windows"
  if (process.platform === "darwin") return "fs-events"
  if (process.platform === "linux") return "inotify"
}

export interface Interface {
  readonly init: () => Effect.Effect<void>
}

export class Service extends Context.Service<Service, Interface>()("@teamcode/ConfigWatcher") {}

/**
 * Decide if a changed file path is a config file that should trigger a reload.
 */
function isConfigFile(filePath: string): boolean {
  const name = path.basename(filePath).toLowerCase()
  if (name === "opencode.jsonc" || name === "opencode.json") return true
  if (name === "teamcode.jsonc" || name === "teamcode.json") return true
  if (name === "config.json") return true
  // Agent files, command files — anything .md that defines agents/commands
  if (name.endsWith(".md")) return true
  return false
}

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const config = yield* Config.Service
    const flags = yield* RuntimeFlags.Service

    const state = yield* InstanceState.make(
      Effect.fn("ConfigWatcher.state")(
        function* () {
          if (flags.disableFilewatcher) return

          const ctx = yield* InstanceState.context
          log.info("init", { directory: ctx.directory })

          // Build the watched directories set from the instance context.
          const watchedSet = new Set<string>([ctx.directory, ctx.worktree])
          // Walk up from project dir to worktree to cover parent config dirs
          let parent = path.dirname(ctx.directory)
          while (parent !== ctx.worktree && parent !== path.dirname(parent)) {
            watchedSet.add(parent)
            parent = path.dirname(parent)
          }

          const backend = getBackend()
          if (!backend) {
            log.error("watcher backend not supported", { directory: ctx.directory, platform: process.platform })
            return
          }

          const w = watcher()
          if (!w) return

          const bridge = yield* EffectBridge.make()
          const subs: ParcelWatcher.AsyncSubscription[] = []
          yield* Effect.addFinalizer(() =>
            Effect.promise(() => Promise.allSettled(subs.map((sub) => sub.unsubscribe()))),
          )

          // Debounce: track pending invalidation timer
          let pendingInvalidate: ReturnType<typeof setTimeout> | undefined

          const scheduleInvalidate = (changedFile: string, evt: "add" | "change" | "unlink") => {
            if (pendingInvalidate) clearTimeout(pendingInvalidate)
            pendingInvalidate = setTimeout(() => {
              pendingInvalidate = undefined
              bridge.fork(
                Effect.gen(function* () {
                  yield* Effect.logInfo("config changed, reloading").pipe(
                    Effect.annotateLogs("file", changedFile),
                  )
                  UI.println()
                  UI.println(UI.Style.TEXT_INFO_BOLD + "~  Config changed, reloading..." + UI.Style.TEXT_NORMAL)
                  UI.println(UI.Style.TEXT_DIM + "   file: " + changedFile + UI.Style.TEXT_NORMAL)
                  yield* config.invalidate()
                  UI.println(UI.Style.TEXT_SUCCESS_BOLD + "✓  Config reloaded" + UI.Style.TEXT_NORMAL)
                  UI.println()
                }),
              )
            }, DEBOUNCE_MS)
          }

          const cb: ParcelWatcher.SubscribeCallback = bridge.bind((err, evts) => {
            if (err) {
              log.warn("config watcher error", { error: err })
              return
            }
            for (const evt of evts) {
              const filePath = evt.path
              if (!isConfigFile(filePath)) continue
              const eventType = evt.type === "create" ? "add" : evt.type === "update" ? "change" : "unlink"
              scheduleInvalidate(filePath, eventType)
            }
          })

          const subscribe = (dir: string, ignore: string[]) => {
            const retry = { count: 0, max: 3 }
            const trySubscribe = (): Effect.Effect<void> => {
              const pending = w.subscribe(dir, cb, { ignore, backend })
              return Effect.gen(function* () {
                const sub = yield* Effect.promise(() => pending)
                subs.push(sub)
              }).pipe(
                Effect.timeout(SUBSCRIBE_TIMEOUT_MS),
                Effect.catchCause((cause) => {
                  log.error("failed to subscribe config watcher", {
                    dir, cause: Cause.pretty(cause), attempt: retry.count + 1,
                  })
                  pending.then((s) => s.unsubscribe()).catch(() => {})
                  if (retry.count < retry.max) {
                    const base = Math.min(100 * Math.pow(2, retry.count), 10000)
                    const jitter = Math.random() * base
                    retry.count++
                    return Effect.sleep(Duration.millis(base + jitter)).pipe(Effect.andThen(trySubscribe))
                  }
                  return Effect.void
                }),
              )
            }
            return trySubscribe()
          }

          for (const dir of watchedSet) {
            yield* Effect.forkScoped(subscribe(dir, ["node_modules", ".git", "dist", "build", ".turbo"]))
          }

          log.info("watching config directories", { count: watchedSet.size, directories: [...watchedSet] })
        },
        Effect.catchCause((cause) => {
          log.error("failed to init config watcher", { cause: Cause.pretty(cause) })
          return Effect.void
        }),
      ),
    )

    return Service.of({
      init: Effect.fn("ConfigWatcher.init")(function* () {
        yield* InstanceState.get(state)
      }),
    })
  }),
)

export const defaultLayer = layer.pipe(
  Layer.provide(Config.defaultLayer),
  Layer.provide(RuntimeFlags.defaultLayer),
  Layer.provide(AppFileSystem.defaultLayer),
)

export * as ConfigWatcher from "./watch"
