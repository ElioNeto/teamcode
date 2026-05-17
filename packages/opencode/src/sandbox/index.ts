// Sandbox mode — isolated execution via git worktrees.
//
// A sandbox is a disposable git worktree where the agent can operate without
// risking the primary working tree. On exit the user can discard changes or
// convert them into a PR.
//
// Permission restrictions applied in sandbox mode:
//   - **bash** — dangerous commands (rm -rf, docker, kill, etc.) denied;
//                network commands (curl, wget, ssh, etc.) denied;
//                safe commands (git within sandbox, mkdir, test, typecheck) allowed.
//   - **webfetch** — denied (no external network from the agent).
//
// Usage
// -----
// ```
//   teamcode run --sandbox "implement login page"
// ```
import { Global } from "@opencode-ai/core/global"
import { errorMessage } from "../util/error"
import { BusEvent } from "@/bus/bus-event"
import { GlobalBus } from "@/bus/global"
import { Worktree } from "@/worktree"
import { Git } from "@/git"
import { Permission } from "@/permission"
import { Effect, Layer, Path, Schema, Context, Scope } from "effect"
import { NodePath } from "@effect/platform-node"
import { AppFileSystem } from "@opencode-ai/core/filesystem"
import { AppProcess } from "@opencode-ai/core/process"
import { ChildProcess } from "effect/unstable/process"
import * as Log from "@opencode-ai/core/util/log"
import { InstanceState } from "@/effect/instance-state"
import { Project } from "@/project/project"

const log = Log.create({ service: "sandbox" })

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export const Event = {
  Entered: BusEvent.define(
    "sandbox.entered",
    Schema.Struct({
      name: Schema.String,
      directory: Schema.String,
      branch: Schema.optional(Schema.String),
    }),
  ),
  Exited: BusEvent.define(
    "sandbox.exited",
    Schema.Struct({
      name: Schema.String,
      directory: Schema.String,
      discarded: Schema.Boolean,
      branch: Schema.optional(Schema.String),
    }),
  ),
  Failed: BusEvent.define(
    "sandbox.failed",
    Schema.Struct({
      name: Schema.String,
      message: Schema.String,
    }),
  ),
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class NotGitError extends Schema.TaggedErrorClass<NotGitError>()("SandboxNotGitError", {
  message: Schema.String,
}) {}

export class EnterFailedError extends Schema.TaggedErrorClass<EnterFailedError>()("SandboxEnterFailedError", {
  message: Schema.String,
}) {}

export class ExitFailedError extends Schema.TaggedErrorClass<ExitFailedError>()("SandboxExitFailedError", {
  message: Schema.String,
}) {}

export class PrFailedError extends Schema.TaggedErrorClass<PrFailedError>()("SandboxPrFailedError", {
  message: Schema.String,
}) {}

export type Error = NotGitError | EnterFailedError | ExitFailedError | PrFailedError

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const SandboxInfo = Schema.Struct({
  name: Schema.String,
  directory: Schema.String,
  branch: Schema.optional(Schema.String),
  worktree: Schema.String,
})
export type SandboxInfo = Schema.Schema.Type<typeof SandboxInfo>

export const ExitInput = Schema.Struct({
  name: Schema.String,
  directory: Schema.String,
  branch: Schema.optional(Schema.String),
  /** When true, pushes the branch and opens a PR instead of discarding. */
  createPR: Schema.optional(Schema.Boolean),
})
export type ExitInput = Schema.Schema.Type<typeof ExitInput>

// ---------------------------------------------------------------------------
// Sandbox permission rules
// ---------------------------------------------------------------------------

/** Extra permission rules applied when running inside a sandbox. */
export const sandboxPermissionRules: Permission.Rule[] = [
  // ---- bash: deny destructive commands ----
  { permission: "bash", pattern: "rm *", action: "deny" },
  { permission: "bash", pattern: "rm -rf *", action: "deny" },
  { permission: "bash", pattern: "rm -r *", action: "deny" },
  { permission: "bash", pattern: "rm -f *", action: "deny" },
  { permission: "bash", pattern: "sudo *", action: "deny" },
  { permission: "bash", pattern: "docker *", action: "deny" },
  { permission: "bash", pattern: "podman *", action: "deny" },
  { permission: "bash", pattern: "chmod *", action: "deny" },
  { permission: "bash", pattern: "chown *", action: "deny" },
  { permission: "bash", pattern: "kill *", action: "deny" },
  { permission: "bash", pattern: "pkill *", action: "deny" },
  { permission: "bash", pattern: "systemctl *", action: "deny" },
  { permission: "bash", pattern: "service *", action: "deny" },
  { permission: "bash", pattern: "mount *", action: "deny" },
  { permission: "bash", pattern: "umount *", action: "deny" },
  // ---- bash: deny network commands ----
  { permission: "bash", pattern: "curl *", action: "deny" },
  { permission: "bash", pattern: "wget *", action: "deny" },
  { permission: "bash", pattern: "ssh *", action: "deny" },
  { permission: "bash", pattern: "scp *", action: "deny" },
  { permission: "bash", pattern: "nc *", action: "deny" },
  { permission: "bash", pattern: "nmap *", action: "deny" },
  { permission: "bash", pattern: "ping *", action: "deny" },
  { permission: "bash", pattern: "npx *", action: "deny" },
  { permission: "bash", pattern: "npm install *", action: "deny" },
  { permission: "bash", pattern: "yarn add *", action: "deny" },
  { permission: "bash", pattern: "pnpm add *", action: "deny" },
  { permission: "bash", pattern: "bun add *", action: "deny" },
  // ---- bash: allow safe git within the sandbox ----
  { permission: "bash", pattern: "git status", action: "allow" },
  { permission: "bash", pattern: "git diff *", action: "allow" },
  { permission: "bash", pattern: "git log *", action: "allow" },
  { permission: "bash", pattern: "git add *", action: "allow" },
  { permission: "bash", pattern: "git commit *", action: "allow" },
  { permission: "bash", pattern: "git checkout *", action: "allow" },
  { permission: "bash", pattern: "git branch *", action: "allow" },
  { permission: "bash", pattern: "git push *", action: "allow" },
  // ---- bash: allow safe build commands ----
  { permission: "bash", pattern: "mkdir *", action: "allow" },
  { permission: "bash", pattern: "bun test *", action: "allow" },
  { permission: "bash", pattern: "bun run test*", action: "allow" },
  { permission: "bash", pattern: "bun typecheck *", action: "allow" },
  { permission: "bash", pattern: "bun run build*", action: "allow" },
  { permission: "bash", pattern: "bun run typecheck*", action: "allow" },
  { permission: "bash", pattern: "bunx *", action: "allow" },
  // ---- webfetch: denied in sandbox ----
  { permission: "webfetch", pattern: "*", action: "deny" },
]

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export interface Interface {
  readonly enter: (name?: string) => Effect.Effect<SandboxInfo, Error>
  readonly exit: (input: ExitInput) => Effect.Effect<void, Error>
  readonly list: () => Effect.Effect<readonly SandboxInfo[], never>
  readonly isSandbox: (directory: string) => Effect.Effect<boolean, never>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/Sandbox") {}

// ---------------------------------------------------------------------------
// Layer
// ---------------------------------------------------------------------------

export const layer: Layer.Layer<
  Service,
  never,
  AppFileSystem.Service | Path.Path | AppProcess.Service | Git.Service | Project.Service | Worktree.Service
> = Layer.effect(
  Service,
  Effect.gen(function* () {
    const pathSvc = yield* Path.Path
    const project = yield* Project.Service
    const worktree = yield* Worktree.Service
    const appProcess = yield* AppProcess.Service

    // -----------------------------------------------------------------------
    // enter
    // -----------------------------------------------------------------------

    const enter = Effect.fn("Sandbox.enter")(function* (name?: string) {
      const ctx = yield* InstanceState.context
      if (ctx.project.vcs !== "git") {
        return yield* new NotGitError({ message: "Sandbox mode requires a git project" })
      }

      const info = yield* worktree.makeWorktreeInfo({ name, detached: false }).pipe(
        Effect.catch((e: Worktree.Error) =>
          Effect.fail(new EnterFailedError({ message: errorMessage(e) || "Failed to create worktree info" })),
        ),
      )
      yield* worktree.createFromInfo(info).pipe(
        Effect.catch((e: Worktree.Error) =>
          Effect.fail(new EnterFailedError({ message: errorMessage(e) || "Failed to create sandbox worktree" })),
        ),
      )

      const workspaceID = yield* InstanceState.workspaceID
      GlobalBus.emit("event", {
        directory: info.directory,
        project: ctx.project.id,
        workspace: workspaceID,
        payload: {
          type: Event.Entered.type,
          properties: { name: info.name, directory: info.directory, branch: info.branch },
        },
      })

      log.info("sandbox entered", { name: info.name, directory: info.directory, branch: info.branch })

      return {
        name: info.name,
        directory: info.directory,
        branch: info.branch,
        worktree: ctx.worktree,
      } satisfies SandboxInfo
    })

    // -----------------------------------------------------------------------
    // exit
    // -----------------------------------------------------------------------

    const gitPush = Effect.fnUntraced(
      function* (branch: string, directory: string) {
        return yield* appProcess.run(
          ChildProcess.make("git", ["push", "-u", "origin", branch], {
            cwd: directory,
            extendEnv: true,
            stdin: "ignore",
          }),
        )
      },
      Effect.catch(() => Effect.succeed(null)),
    )

    const exit = Effect.fn("Sandbox.exit")(function* (input: ExitInput) {
      const ctx = yield* InstanceState.context

      if (input.createPR && input.branch) {
        const result = yield* gitPush(input.branch, input.directory)
        if (result && result.exitCode !== 0) {
          log.warn("sandbox push failed (continuing cleanup)", {
            branch: input.branch,
            stderr: result.stderr.toString("utf8"),
          })
        }
      }

      yield* worktree.remove({ directory: input.directory }).pipe(Effect.ignore)

      const workspaceID = yield* InstanceState.workspaceID
      GlobalBus.emit("event", {
        directory: input.directory,
        project: ctx.project.id,
        workspace: workspaceID,
        payload: {
          type: Event.Exited.type,
          properties: {
            name: input.name,
            directory: input.directory,
            discarded: !input.createPR,
            branch: input.branch,
          },
        },
      })

      log.info("sandbox exited", {
        name: input.name,
        directory: input.directory,
        discarded: !input.createPR,
      })
    })

    // -----------------------------------------------------------------------
    // list
    // -----------------------------------------------------------------------

    const list = Effect.fn("Sandbox.list")(function* () {
      const ctx = yield* InstanceState.context
      if (ctx.project.vcs !== "git") return [] as const

      const wts = yield* worktree.list().pipe(
        Effect.catch((_: Worktree.Error) => Effect.succeed([] as const)),
      )

      return wts.map((w: { name: string; branch?: string; directory: string }) => ({
        name: w.name,
        directory: w.directory,
        branch: w.branch,
        worktree: ctx.worktree,
      }))
    })

    // -----------------------------------------------------------------------
    // isSandbox
    // -----------------------------------------------------------------------

    const isSandbox = Effect.fn("Sandbox.isSandbox")(function* (directory: string) {
      const sandboxes = yield* list()
      const canonDir = pathSvc.resolve(directory)
      for (const s of sandboxes) {
        const sandDir = pathSvc.resolve(s.directory)
        if (process.platform === "win32") {
          if (sandDir.toLowerCase() === canonDir.toLowerCase()) return true
        } else {
          if (sandDir === canonDir) return true
        }
      }
      return false
    })

    return Service.of({ enter, exit, list, isSandbox })
  }),
)

export const defaultLayer = layer.pipe(
  Layer.provide(Worktree.appLayer),
)

export * as Sandbox from "."
