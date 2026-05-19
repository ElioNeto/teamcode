export * as ConfigPaths from "./paths"

import path from "path"
import { Flag } from "@teamcode-ai/core/flag/flag"
import { Global } from "@teamcode-ai/core/global"
import { unique } from "remeda"
import { Effect, Context, Layer } from "effect"
import { AppFileSystem } from "@teamcode-ai/core/filesystem"
import { RuntimeFlags } from "@/effect/runtime-flags"

// --- Pure helpers ---

export function fileInDirectory(dir: string, name: string) {
  return [path.join(dir, `${name}.json`), path.join(dir, `${name}.jsonc`)]
}

// --- Effect service interface ---

export interface Interface {
  readonly projectFiles: (name: string, directory: string, worktree?: string) => Effect.Effect<string[], never, never>
  readonly directories: (directory: string, worktree?: string) => Effect.Effect<string[], never, never>
}

export class Service extends Context.Service<Service, Interface>()("@teamcode/ConfigPaths") {}

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const afs = yield* AppFileSystem.Service
    const flags = yield* RuntimeFlags.Service

    const projectFiles = Effect.fn("ConfigPaths.Service.projectFiles")(function* (
      name: string,
      directory: string,
      worktree?: string,
    ) {
      return (yield* afs.up({
        targets: [`${name}.jsonc`, `${name}.json`],
        start: directory,
        stop: worktree,
      }).pipe(Effect.orDie)).toReversed()
    })

    const directories = Effect.fn("ConfigPaths.Service.directories")(function* (directory: string, worktree?: string) {
      return unique([
        Global.Path.config,
        ...(!flags.disableProjectConfig
          ? yield* afs.up({
              targets: [".teamcode"],
              start: directory,
              stop: worktree,
            }).pipe(Effect.orDie)
          : []),
        ...(yield* afs.up({
          targets: [".teamcode"],
          start: Global.Path.home,
          stop: Global.Path.home,
        }).pipe(Effect.orDie)),
        ...(Flag.OPENCODE_CONFIG_DIR ? [Flag.OPENCODE_CONFIG_DIR] : []),
      ])
    })

    return Service.of({ projectFiles, directories })
  }),
)

export const defaultLayer = layer

// --- Legacy Effect function exports (keep using AppFileSystem directly to avoid circular deps) ---

export const files = Effect.fn("ConfigPaths.projectFiles")(function* (
  name: string,
  directory: string,
  worktree?: string,
) {
  const afs = yield* AppFileSystem.Service
  return (yield* afs.up({
    targets: [`${name}.jsonc`, `${name}.json`],
    start: directory,
    stop: worktree,
  })).toReversed()
})

export const directories = Effect.fn("ConfigPaths.directories")(function* (directory: string, worktree?: string) {
  const afs = yield* AppFileSystem.Service
  return unique([
    Global.Path.config,
    ...(!Flag.OPENCODE_DISABLE_PROJECT_CONFIG
      ? yield* afs.up({
          targets: [".teamcode"],
          start: directory,
          stop: worktree,
        })
      : []),
    ...(yield* afs.up({
      targets: [".teamcode"],
      start: Global.Path.home,
      stop: Global.Path.home,
    })),
    ...(Flag.OPENCODE_CONFIG_DIR ? [Flag.OPENCODE_CONFIG_DIR] : []),
  ])
})
