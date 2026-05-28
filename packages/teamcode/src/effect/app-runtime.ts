import { Effect, type Fiber, Layer, ManagedRuntime } from "effect"
import { attach } from "./run-service"
import * as Observability from "@teamcode-ai/core/effect/observability"

import { AppFileSystem } from "@teamcode-ai/core/filesystem"
import { Bus } from "@/bus"
import { Auth } from "@/auth"
import { Account } from "@/account/account"
import { Config } from "@/config/config"
import { Git } from "@/git"
import { Ripgrep } from "@/file/ripgrep"
import { File } from "@/file"
import { FileWatcher } from "@/file/watcher"
import { Storage } from "@/storage/storage"
import { Snapshot } from "@/snapshot"
import { Plugin } from "@/plugin"
import { ModelsDev } from "@teamcode-ai/core/models"
import { Provider } from "@/provider/provider"
import { ProviderAuth } from "@/provider/auth"
import { Agent } from "@/agent/agent"
import { Skill } from "@/skill"
import { Discovery } from "@/skill/discovery"
import { Question } from "@/question"
import { Permission } from "@/permission"
import { Todo } from "@/session/todo"
import { Session } from "@/session/session"
import { SessionStatus } from "@/session/status"
import { SessionRunState } from "@/session/run-state"
import { SessionProcessor } from "@/session/processor"
import { SessionCompaction } from "@/session/compaction"
import { SessionRevert } from "@/session/revert"
import { SessionSummary } from "@/session/summary"
import { SessionPrompt } from "@/session/prompt"
import { Instruction } from "@/session/instruction"
import { LLM } from "@/session/llm"
import { LSP } from "@/lsp/lsp"
import { MCP } from "@/mcp"
import { McpAuth } from "@/mcp/auth"
import { Command } from "@/command"
import { Truncate } from "@/tool/truncate"
import { ToolRegistry } from "@/tool/registry"
import { Format } from "@/format"
import { InstanceLayer } from "@/project/instance-layer"
import { Project } from "@/project/project"
import { Vcs } from "@/project/vcs"
import { Reference } from "@/reference/reference"
import { Workspace } from "@/control-plane/workspace"
import { Worktree } from "@/worktree"
import { Pty } from "@/pty"
import { PtyTicket } from "@/pty/ticket"
import { Installation } from "@/installation"
import { ShareNext } from "@/share/share-next"
import { SessionShare } from "@/share/session"
import { SyncEvent } from "@/sync"
import { Npm } from "@teamcode-ai/core/npm"
import { memoMap } from "@teamcode-ai/core/effect/memo-map"
import { DataMigration } from "@/data-migration"
import { BackgroundJob } from "@/background/job"
import { EventV2Bridge } from "@/event-v2-bridge"
import { RuntimeFlags } from "@/effect/runtime-flags"

export const AppLayer = Layer.mergeAll(
  Npm.defaultLayer,
  AppFileSystem.defaultLayer,
  Bus.defaultLayer,
  Auth.defaultLayer,
  Account.defaultLayer,
  Config.defaultLayer,
  Git.defaultLayer,
  Ripgrep.defaultLayer,
  File.defaultLayer,
  FileWatcher.defaultLayer,
  Storage.defaultLayer,
  Snapshot.defaultLayer,
  Plugin.defaultLayer,
  ModelsDev.defaultLayer,
  Provider.defaultLayer,
  ProviderAuth.defaultLayer,
  Agent.defaultLayer,
  Skill.defaultLayer,
  Discovery.defaultLayer,
  Question.defaultLayer,
  Permission.defaultLayer,
  Todo.defaultLayer,
  Session.defaultLayer,
  SessionStatus.defaultLayer,
  BackgroundJob.defaultLayer,
  RuntimeFlags.defaultLayer,
  SessionRunState.defaultLayer,
  SessionProcessor.defaultLayer,
  SessionCompaction.defaultLayer,
  SessionRevert.defaultLayer,
  SessionSummary.defaultLayer,
  SessionPrompt.defaultLayer,
  Instruction.defaultLayer,
  LLM.defaultLayer,
  LSP.defaultLayer,
  MCP.defaultLayer,
  McpAuth.defaultLayer,
  Command.defaultLayer,
  Truncate.defaultLayer,
  ToolRegistry.defaultLayer,
  Format.defaultLayer,
  Project.defaultLayer,
  Vcs.defaultLayer,
  Reference.defaultLayer,
  Workspace.defaultLayer,
  Worktree.appLayer,
  Pty.defaultLayer,
  PtyTicket.defaultLayer,
  Installation.defaultLayer,
  ShareNext.defaultLayer,
  SessionShare.defaultLayer,
  SyncEvent.defaultLayer,
  EventV2Bridge.defaultLayer,
  DataMigration.defaultLayer,
).pipe(Layer.provideMerge(InstanceLayer.layer), Layer.provideMerge(Observability.layer))

// Derive the service type from AppLayer at the type level (no runtime needed).
type _AppROut = typeof AppLayer extends Layer.Layer<infer ROut, any, any> ? ROut : never
type _AppErr = typeof AppLayer extends Layer.Layer<any, infer E, any> ? E : never

/** Services provided by AppRuntime — i.e. what an Effect run via AppRuntime.runPromise can yield. */
export type AppServices = _AppROut

// ManagedRuntime.make(AppLayer) is deferred until first use to speed up module
// loading (the static imports of ~50 service modules are still evaluated, but
// the heavy layer initialisation — config parsing, file reads, DB open, etc. —
// is skipped until a command actually needs the runtime).
let _rt: ManagedRuntime.ManagedRuntime<_AppROut, _AppErr> | undefined

function ensure() {
  if (!_rt) {
    _rt = ManagedRuntime.make(AppLayer, { memoMap })
  }
  return _rt
}

export const AppRuntime = {
  runSync<A, E>(effect: Effect.Effect<A, E, _AppROut>): A {
    return ensure().runSync(attach(effect as any) as any)
  },
  runPromise<A, E>(effect: Effect.Effect<A, E, _AppROut>, options?: Effect.RunOptions): Promise<A> {
    return ensure().runPromise(attach(effect as any) as any, options) as Promise<A>
  },
  runPromiseExit<A, E>(effect: Effect.Effect<A, E, _AppROut>, options?: Effect.RunOptions) {
    return ensure().runPromiseExit(attach(effect as any) as any, options) as any
  },
  runFork<A, E>(effect: Effect.Effect<A, E, _AppROut>, options?: Effect.RunOptions) {
    return ensure().runFork(attach(effect as any) as any, options) as any
  },
  runCallback<A, E>(effect: Effect.Effect<A, E, _AppROut>) {
    return ensure().runCallback(attach(effect as any) as any) as any
  },
  dispose() {
    return ensure().dispose()
  },
}
