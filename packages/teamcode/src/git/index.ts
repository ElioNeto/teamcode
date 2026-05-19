import { AppProcess } from "@teamcode-ai/core/process"
import { Effect, Layer, Context, Stream } from "effect"
import { ChildProcess } from "effect/unstable/process"

const cfg = [
  "--no-optional-locks",
  "-c",
  "core.autocrlf=false",
  "-c",
  "core.fsmonitor=false",
  "-c",
  "core.longpaths=true",
  "-c",
  "core.symlinks=true",
  "-c",
  "core.quotepath=false",
] as const

const out = (result: { text(): string }) => result.text().trim()
const nuls = (text: string) => text.split("\0").filter(Boolean)
const fail = (err: unknown) =>
  ({
    exitCode: 1,
    text: () => "",
    stdout: Buffer.alloc(0),
    stderr: Buffer.from(err instanceof Error ? err.message : String(err)),
    truncated: false,
  }) satisfies Result

export type Kind = "added" | "deleted" | "modified"

export type Base = {
  readonly name: string
  readonly ref: string
}

export type Item = {
  readonly file: string
  readonly code: string
  readonly status: Kind
}

export type Stat = {
  readonly file: string
  readonly additions: number
  readonly deletions: number
}

export type Patch = {
  readonly text: string
  readonly truncated: boolean
}

export interface PatchOptions {
  readonly context?: number
  readonly maxOutputBytes?: number
}

export interface Result {
  readonly exitCode: number
  readonly text: () => string
  readonly stdout: Buffer
  readonly stderr: Buffer
  readonly truncated: boolean
}

export interface Options {
  readonly cwd: string
  readonly env?: Record<string, string>
  readonly maxOutputBytes?: number
  readonly stdin?: ChildProcess.CommandInput
}

export interface Interface {
  readonly run: (args: string[], opts: Options) => Effect.Effect<Result>
  readonly branch: (cwd: string) => Effect.Effect<string | undefined>
  readonly prefix: (cwd: string) => Effect.Effect<string>
  readonly defaultBranch: (cwd: string) => Effect.Effect<Base | undefined>
  readonly hasHead: (cwd: string) => Effect.Effect<boolean>
  readonly mergeBase: (cwd: string, base: string, head?: string) => Effect.Effect<string | undefined>
  readonly show: (cwd: string, ref: string, file: string, prefix?: string) => Effect.Effect<string>
  readonly status: (cwd: string) => Effect.Effect<Item[]>
  readonly diff: (cwd: string, ref: string) => Effect.Effect<Item[]>
  readonly stats: (cwd: string, ref: string) => Effect.Effect<Stat[]>
  readonly patch: (cwd: string, ref: string, file: string, options?: PatchOptions) => Effect.Effect<Patch>
  readonly patchAll: (cwd: string, ref: string, options?: PatchOptions) => Effect.Effect<Patch>
  readonly patchUntracked: (cwd: string, file: string, options?: PatchOptions) => Effect.Effect<Patch>
  readonly statUntracked: (cwd: string, file: string) => Effect.Effect<Stat | undefined>
  readonly applyPatch: (cwd: string, patch: string) => Effect.Effect<Result>
  // Panel operations
  readonly add: (cwd: string, files: string[]) => Effect.Effect<void>
  readonly unstage: (cwd: string, files: string[]) => Effect.Effect<void>
  readonly restore: (cwd: string, files: string[]) => Effect.Effect<void>
  readonly commit: (cwd: string, message: string) => Effect.Effect<string | undefined>
  readonly log: (cwd: string, count?: number) => Effect.Effect<CommitInfo[]>
  readonly branchList: (cwd: string) => Effect.Effect<string[]>
  readonly branchCreate: (cwd: string, name: string) => Effect.Effect<void>
  readonly branchDelete: (cwd: string, name: string) => Effect.Effect<void>
  readonly branchRename: (cwd: string, oldName: string, newName: string) => Effect.Effect<void>
  readonly checkout: (cwd: string, branch: string) => Effect.Effect<void>
  readonly stashList: (cwd: string) => Effect.Effect<StashInfo[]>
  readonly stashPop: (cwd: string, index?: number) => Effect.Effect<void>
  readonly stashApply: (cwd: string, index?: number) => Effect.Effect<void>
  readonly stashDrop: (cwd: string, index?: number) => Effect.Effect<void>
  readonly stashPush: (cwd: string, message?: string) => Effect.Effect<void>
  readonly diffUnstaged: (cwd: string, file: string) => Effect.Effect<string>
  readonly diffStaged: (cwd: string, file: string) => Effect.Effect<string>
}

export type CommitInfo = {
  readonly hash: string
  readonly shortHash: string
  readonly subject: string
  readonly author: string
  readonly date: string
  readonly body: string
}

export type StashInfo = {
  readonly index: number
  readonly message: string
}

const kind = (code: string): Kind => {
  if (code === "??") return "added"
  if (code.includes("U")) return "modified"
  if (code.includes("A") && !code.includes("D")) return "added"
  if (code.includes("D") && !code.includes("A")) return "deleted"
  return "modified"
}

export class Service extends Context.Service<Service, Interface>()("@teamcode/Git") {}

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const appProcess = yield* AppProcess.Service
    const encoder = new TextEncoder()
    const stdin = (text: string) => Stream.make(encoder.encode(text))

    const run = Effect.fn("Git.run")(
      function* (args: string[], opts: Options) {
        const result = yield* appProcess.run(
          ChildProcess.make("git", [...cfg, ...args], {
            cwd: opts.cwd,
            env: opts.env,
            extendEnv: true,
            stdin: opts.stdin ?? "ignore",
            stdout: "pipe",
            stderr: "pipe",
          }),
          { maxOutputBytes: opts.maxOutputBytes },
        )
        return {
          exitCode: result.exitCode,
          text: () => result.stdout.toString("utf8"),
          stdout: result.stdout,
          stderr: result.stderr,
          truncated: result.stdoutTruncated || result.stderrTruncated,
        } satisfies Result
      },
      Effect.catch((err) => Effect.succeed(fail(err))),
    )

    const text = Effect.fn("Git.text")(function* (args: string[], opts: Options) {
      return (yield* run(args, opts)).text()
    })

    const lines = Effect.fn("Git.lines")(function* (args: string[], opts: Options) {
      return (yield* text(args, opts))
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean)
    })

    const refs = Effect.fnUntraced(function* (cwd: string) {
      return yield* lines(["for-each-ref", "--format=%(refname:short)", "refs/heads"], { cwd })
    })

    const configured = Effect.fnUntraced(function* (cwd: string, list: string[]) {
      const result = yield* run(["config", "init.defaultBranch"], { cwd })
      const name = out(result)
      if (!name || !list.includes(name)) return
      return { name, ref: name } satisfies Base
    })

    const primary = Effect.fnUntraced(function* (cwd: string) {
      const list = yield* lines(["remote"], { cwd })
      if (list.includes("origin")) return "origin"
      if (list.length === 1) return list[0]
      if (list.includes("upstream")) return "upstream"
      return list[0]
    })

    const branch = Effect.fn("Git.branch")(function* (cwd: string) {
      const result = yield* run(["symbolic-ref", "--quiet", "--short", "HEAD"], { cwd })
      if (result.exitCode !== 0) return
      const text = out(result)
      return text || undefined
    })

    const prefix = Effect.fn("Git.prefix")(function* (cwd: string) {
      const result = yield* run(["rev-parse", "--show-prefix"], { cwd })
      if (result.exitCode !== 0) return ""
      return out(result)
    })

    const defaultBranch = Effect.fn("Git.defaultBranch")(function* (cwd: string) {
      const remote = yield* primary(cwd)
      if (remote) {
        const head = yield* run(["symbolic-ref", `refs/remotes/${remote}/HEAD`], { cwd })
        if (head.exitCode === 0) {
          const ref = out(head).replace(/^refs\/remotes\//, "")
          const name = ref.startsWith(`${remote}/`) ? ref.slice(`${remote}/`.length) : ""
          if (name) return { name, ref } satisfies Base
        }
      }

      const list = yield* refs(cwd)
      const next = yield* configured(cwd, list)
      if (next) return next
      if (list.includes("main")) return { name: "main", ref: "main" } satisfies Base
      if (list.includes("master")) return { name: "master", ref: "master" } satisfies Base
    })

    const hasHead = Effect.fn("Git.hasHead")(function* (cwd: string) {
      const result = yield* run(["rev-parse", "--verify", "HEAD"], { cwd })
      return result.exitCode === 0
    })

    const mergeBase = Effect.fn("Git.mergeBase")(function* (cwd: string, base: string, head = "HEAD") {
      const result = yield* run(["merge-base", base, head], { cwd })
      if (result.exitCode !== 0) return
      const text = out(result)
      return text || undefined
    })

    const show = Effect.fn("Git.show")(function* (cwd: string, ref: string, file: string, prefix = "") {
      const target = prefix ? `${prefix}${file}` : file
      const result = yield* run(["show", `${ref}:${target}`], { cwd })
      if (result.exitCode !== 0) return ""
      if (result.stdout.includes(0)) return ""
      return result.text()
    })

    const status = Effect.fn("Git.status")(function* (cwd: string) {
      return nuls(
        yield* text(["status", "--porcelain=v1", "--untracked-files=all", "--no-renames", "-z", "--", "."], {
          cwd,
        }),
      ).flatMap((item) => {
        const file = item.slice(3)
        if (!file) return []
        const code = item.slice(0, 2)
        return [{ file, code, status: kind(code) } satisfies Item]
      })
    })

    const diff = Effect.fn("Git.diff")(function* (cwd: string, ref: string) {
      const list = nuls(
        yield* text(["diff", "--no-ext-diff", "--no-renames", "--name-status", "-z", ref, "--", "."], { cwd }),
      )
      return list.flatMap((code, idx) => {
        if (idx % 2 !== 0) return []
        const file = list[idx + 1]
        if (!code || !file) return []
        return [{ file, code, status: kind(code) } satisfies Item]
      })
    })

    const stats = Effect.fn("Git.stats")(function* (cwd: string, ref: string) {
      return nuls(
        yield* text(["diff", "--no-ext-diff", "--no-renames", "--numstat", "-z", ref, "--", "."], { cwd }),
      ).flatMap((item) => {
        const a = item.indexOf("\t")
        const b = item.indexOf("\t", a + 1)
        if (a === -1 || b === -1) return []
        const file = item.slice(b + 1)
        if (!file) return []
        const adds = item.slice(0, a)
        const dels = item.slice(a + 1, b)
        const additions = adds === "-" ? 0 : Number.parseInt(adds || "0", 10)
        const deletions = dels === "-" ? 0 : Number.parseInt(dels || "0", 10)
        return [
          {
            file,
            additions: Number.isFinite(additions) ? additions : 0,
            deletions: Number.isFinite(deletions) ? deletions : 0,
          } satisfies Stat,
        ]
      })
    })

    const patch = Effect.fn("Git.patch")(function* (cwd: string, ref: string, file: string, options?: PatchOptions) {
      const result = yield* run(
        ["diff", "--patch", "--no-ext-diff", "--no-renames", `--unified=${options?.context ?? 3}`, ref, "--", file],
        { cwd, maxOutputBytes: options?.maxOutputBytes },
      )
      return { text: result.truncated ? "" : result.text(), truncated: result.truncated } satisfies Patch
    })

    const patchAll = Effect.fn("Git.patchAll")(function* (cwd: string, ref: string, options?: PatchOptions) {
      const result = yield* run(
        ["diff", "--patch", "--no-ext-diff", "--no-renames", `--unified=${options?.context ?? 3}`, ref, "--", "."],
        { cwd, maxOutputBytes: options?.maxOutputBytes },
      )
      return { text: result.text(), truncated: result.truncated } satisfies Patch
    })

    const patchUntracked = Effect.fn("Git.patchUntracked")(function* (
      cwd: string,
      file: string,
      options?: PatchOptions,
    ) {
      const result = yield* run(
        [
          "diff",
          "--no-index",
          "--patch",
          "--no-ext-diff",
          "--no-renames",
          `--unified=${options?.context ?? 3}`,
          "--",
          "/dev/null",
          file,
        ],
        { cwd, maxOutputBytes: options?.maxOutputBytes },
      )
      return { text: result.truncated ? "" : result.text(), truncated: result.truncated } satisfies Patch
    })

    const statUntracked = Effect.fn("Git.statUntracked")(function* (cwd: string, file: string) {
      const result = yield* run(["diff", "--no-index", "--numstat", "--", "/dev/null", file], {
        cwd,
        maxOutputBytes: 4096,
      })

      if (result.truncated) return
      const text = result.text()

      const parts = text.split("\t")
      if (parts.length < 2) return

      const additions = parts[0] === "-" ? 0 : Number.parseInt(parts[0] || "0", 10)
      const deletions = parts[1] === "-" ? 0 : Number.parseInt(parts[1] || "0", 10)
      return {
        file,
        additions: Number.isFinite(additions) ? additions : 0,
        deletions: Number.isFinite(deletions) ? deletions : 0,
      } satisfies Stat
    })

    const applyPatch = Effect.fn("Git.applyPatch")(function* (cwd: string, patch: string) {
      return yield* run(["apply", "-"], { cwd, stdin: stdin(patch) })
    })

    // --- Panel operations ---

    const add = Effect.fn("Git.add")(function* (cwd: string, files: string[]) {
      yield* run(["add", "--", ...files], { cwd })
    })

    const unstage = Effect.fn("Git.unstage")(function* (cwd: string, files: string[]) {
      yield* run(["reset", "HEAD", "--", ...files], { cwd })
    })

    const restore = Effect.fn("Git.restore")(function* (cwd: string, files: string[]) {
      yield* run(["checkout", "--", ...files], { cwd })
    })

    const commit = Effect.fn("Git.commit")(function* (cwd: string, message: string) {
      const result = yield* run(["commit", "-m", message], { cwd })
      if (result.exitCode !== 0) return
      return out(result)
    })

    const log = Effect.fn("Git.log")(function* (cwd: string, count = 10) {
      const output = yield* text(
        ["log", `--max-count=${count}`, "--format=%H%n%h%n%s%n%an%n%ad%n%b%n---", "--date=short", "--", "."],
        { cwd },
      )
      return output.split("\n---\n").filter(Boolean).flatMap((entry) => {
        const lines = entry.trim().split("\n")
        if (lines.length < 5) return []
        const info: CommitInfo = {
          hash: lines[0] ?? "",
          shortHash: lines[1] ?? "",
          subject: lines[2] ?? "",
          author: lines[3] ?? "",
          date: lines[4] ?? "",
          body: lines.slice(5).join("\n").trim(),
        }
        if (!info.hash) return []
        return [info]
      })
    })

    const branchList = Effect.fn("Git.branchList")(function* (cwd: string) {
      return yield* lines(["branch", "--format=%(refname:short)"], { cwd })
    })

    const branchCreate = Effect.fn("Git.branchCreate")(function* (cwd: string, name: string) {
      yield* run(["branch", name], { cwd })
    })

    const branchDelete = Effect.fn("Git.branchDelete")(function* (cwd: string, name: string) {
      yield* run(["branch", "-D", name], { cwd })
    })

    const branchRename = Effect.fn("Git.branchRename")(function* (cwd: string, oldName: string, newName: string) {
      yield* run(["branch", "-m", oldName, newName], { cwd })
    })

    const checkout = Effect.fn("Git.checkout")(function* (cwd: string, branch: string) {
      yield* run(["checkout", branch], { cwd })
    })

    const stashList = Effect.fn("Git.stashList")(function* (cwd: string) {
      const lines = yield* text(["stash", "list", "--format=%gd%n%s%n---"], { cwd })
      return lines.split("\n---\n").filter(Boolean).flatMap((entry) => {
        const [ref, ...msgLines] = entry.trim().split("\n")
        if (!ref) return []
        const match = ref.match(/^stash@{(\d+)/)
        if (!match) return []
        return [{ index: Number(match[1]), message: msgLines.join("\n").trim() } satisfies StashInfo]
      })
    })

    const stashPop = Effect.fn("Git.stashPop")(function* (cwd: string, index?: number) {
      if (index !== undefined) {
        yield* run(["stash", "pop", `stash@{${index}}`], { cwd })
      } else {
        yield* run(["stash", "pop"], { cwd })
      }
    })

    const stashApply = Effect.fn("Git.stashApply")(function* (cwd: string, index?: number) {
      if (index !== undefined) {
        yield* run(["stash", "apply", `stash@{${index}}`], { cwd })
      } else {
        yield* run(["stash", "apply"], { cwd })
      }
    })

    const stashDrop = Effect.fn("Git.stashDrop")(function* (cwd: string, index?: number) {
      if (index !== undefined) {
        yield* run(["stash", "drop", `stash@{${index}}`], { cwd })
      } else {
        yield* run(["stash", "drop"], { cwd })
      }
    })

    const stashPush = Effect.fn("Git.stashPush")(function* (cwd: string, message?: string) {
      if (message) {
        yield* run(["stash", "push", "-m", message], { cwd })
      } else {
        yield* run(["stash", "push"], { cwd })
      }
    })

    const diffUnstaged = Effect.fn("Git.diffUnstaged")(function* (cwd: string, file: string) {
      const result = yield* run(["diff", "--no-ext-diff", "--", file], { cwd, maxOutputBytes: 51200 })
      return result.text()
    })

    const diffStaged = Effect.fn("Git.diffStaged")(function* (cwd: string, file: string) {
      const result = yield* run(["diff", "--staged", "--no-ext-diff", "--", file], { cwd, maxOutputBytes: 51200 })
      return result.text()
    })

    return Service.of({
      run,
      branch,
      prefix,
      defaultBranch,
      hasHead,
      mergeBase,
      show,
      status,
      diff,
      stats,
      patch,
      patchAll,
      patchUntracked,
      statUntracked,
      applyPatch,
      add,
      unstage,
      restore,
      commit,
      log,
      branchList,
      branchCreate,
      branchDelete,
      branchRename,
      checkout,
      stashList,
      stashPop,
      stashApply,
      stashDrop,
      stashPush,
      diffUnstaged,
      diffStaged,
    })
  }),
)

export const defaultLayer = layer.pipe(Layer.provide(AppProcess.defaultLayer))

export * as Git from "."
