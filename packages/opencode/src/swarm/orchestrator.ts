import { Effect, Context, Layer, Fiber, Scope, Option } from "effect"
import { SwarmDefinition, SwarmResult, SwarmAgent } from "./types"
import { Event as SwarmEvent } from "./events"
import { Bus } from "@/bus"
import { Session } from "@/session/session"
import { BackgroundJob } from "@/background/job"
import { SessionID } from "@/session/schema"
import { Agent } from "@/agent/agent"
import { Permission } from "@/permission"
import { InstanceState } from "@/effect/instance-state"
import * as Log from "@teamcode-ai/core/util/log"

const log = Log.create({ service: "swarm.orchestrator" })

type AgentRunResult = {
  readonly id: string
  readonly role: string
  readonly sessionID: SessionID
  readonly status: "completed" | "failed"
  readonly output?: string
  readonly error?: string
}

type State = {
  readonly running: Map<string, Fiber.Fiber<unknown>>
}

export interface Interface {
  readonly run: (def: SwarmDefinition, parentSessionID: SessionID) => Effect.Effect<SwarmResult>
  readonly cancel: (swarmID: string) => Effect.Effect<void>
}

export class Service extends Context.Service<Service, Interface>()("@code/SwarmOrchestrator") {}

const defaultRuleset: Permission.Ruleset = [
  { permission: "edit", pattern: "*", action: "ask" },
  { permission: "bash", pattern: "*", action: "ask" },
]

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const bus = yield* Bus.Service
    const sessions = yield* Session.Service
    const background = yield* BackgroundJob.Service
    const agentSvc = yield* Agent.Service

    const state = yield* InstanceState.make<State>(
      Effect.fn("SwarmOrchestrator.state")(() =>
        Effect.succeed({ running: new Map<string, Fiber.Fiber<unknown>>() }),
      ),
    )

    const runAgentFn = (
      agent: SwarmAgent,
      parentSessionID: SessionID,
      swarmID: string,
    ): Effect.Effect<AgentRunResult> =>
      Effect.gen(function* () {
        const agentInfo = yield* agentSvc.get(agent.role).pipe(Effect.option)
        const resolvedPermission = agentInfo._tag === "Some"
          ? agentInfo.value.permission
          : defaultRuleset

        const child = yield* sessions.create({
          parentID: parentSessionID,
          agent: agent.role,
          permission: resolvedPermission,
        })

        yield* bus.publish(SwarmEvent.SwarmAgentStarted, {
          swarmID,
          agentID: agent.id,
          role: agent.role,
          sessionID: child.id,
        })

        log.info("swarm agent started", { swarmID, agentID: agent.id, role: agent.role, sessionID: child.id })

        try {
          const bgJob = yield* background.start({
            type: "swarm.agent",
            title: `${agent.role} (${agent.id})`,
            metadata: { swarmID, agentID: agent.id, role: agent.role },
            run: Effect.succeed(`Agent ${agent.role} completed its task`),
          })

          const waitResult = yield* background.wait({ id: bgJob.id, timeout: 300_000 })

          yield* bus.publish(SwarmEvent.SwarmAgentCompleted, {
            swarmID,
            agentID: agent.id,
            role: agent.role,
            sessionID: child.id,
            status: "completed",
            output: waitResult.info?.output ?? "completed",
          })

          return {
            id: agent.id,
            role: agent.role,
            sessionID: child.id,
            status: "completed" as const,
            output: waitResult.info?.output,
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error)
          yield* bus.publish(SwarmEvent.SwarmAgentFailed, {
            swarmID,
            agentID: agent.id,
            role: agent.role,
            sessionID: child.id,
            error: errorMsg,
          })
          return { id: agent.id, role: agent.role, sessionID: child.id, status: "failed" as const, error: errorMsg }
        }
      })

    const runAgentsFn = (
      def: SwarmDefinition,
      parentSessionID: SessionID,
    ): Effect.Effect<AgentRunResult[]> =>
      Effect.gen(function* () {
        if (def.mode === "parallel") {
          const results: AgentRunResult[] = yield* Effect.scoped(
            Effect.gen(function* () {
              const scope = yield* Scope.Scope
              const effects = def.agents.map((agent) =>
                runAgentFn(agent, parentSessionID, def.id).pipe(Effect.forkIn(scope)),
              )
              const fibers = yield* Effect.all(effects)
              const results: AgentRunResult[] = []
              for (const fiber of fibers) {
                results.push(yield* Fiber.join(fiber))
              }
              return results
            }),
          )
          return results
        }

        const results: AgentRunResult[] = []
        for (const agent of def.agents) {
          results.push(yield* runAgentFn(agent, parentSessionID, def.id))
        }
        return results
      })

    const runFn = (def: SwarmDefinition, parentSessionID: SessionID): Effect.Effect<SwarmResult> =>
      Effect.gen(function* () {
        yield* bus.publish(SwarmEvent.SwarmCreated, {
          swarmID: def.id,
          mode: def.mode,
          agentCount: def.agents.length,
          description: def.description,
        })

        log.info("swarm created", { swarmID: def.id, mode: def.mode, agentCount: def.agents.length })

        const runEffect = def.timeout
          ? runAgentsFn(def, parentSessionID).pipe(Effect.timeout(def.timeout))
          : runAgentsFn(def, parentSessionID)

        const result = yield* runEffect.pipe(Effect.option)

        if (result._tag === "None") {
          const empty: readonly { readonly id: string; readonly role: string; readonly status: "skipped" }[] =
            def.agents.map((a) => ({ id: a.id, role: a.role, status: "skipped" as const }))

          yield* bus.publish(SwarmEvent.SwarmCompleted, {
            swarmID: def.id,
            status: "timeout",
            agentResults: empty.map((a) => ({ agentID: a.id, role: a.role, status: a.status })),
          })

          return {
            swarmID: def.id,
            status: "timeout" as const,
            agents: empty,
            aggregatedOutput: "Swarm timed out or failed",
          } satisfies SwarmResult as SwarmResult
        }

        const agentResults = result.value
        const hasFailed = agentResults.some((r: AgentRunResult) => r.status === "failed")
        const swarmStatus: "completed" | "failed" = hasFailed ? "failed" : "completed"

        const agents = agentResults.map((r: AgentRunResult) => ({
          id: r.id,
          role: r.role,
          status: (r.status === "completed" ? "completed" : "failed") as "completed" | "failed",
          sessionID: r.sessionID,
          output: r.output,
          error: r.error,
        }))

        yield* bus.publish(SwarmEvent.SwarmCompleted, {
          swarmID: def.id,
          status: swarmStatus,
          agentResults: agentResults.map((a: AgentRunResult) => ({
            agentID: a.id,
            role: a.role,
            status: a.status,
            sessionID: a.sessionID,
          })),
        })

        log.info("swarm completed", { swarmID: def.id, status: swarmStatus })

        return {
          swarmID: def.id,
          status: swarmStatus,
          agents,
          aggregatedOutput: agentResults
            .map((r: AgentRunResult) => `[${r.role}] ${r.status}: ${r.output ?? r.error ?? "no output"}`)
            .join("\n"),
        } satisfies SwarmResult as SwarmResult
      })

    const cancelFn = (swarmID: string): Effect.Effect<void> =>
      Effect.gen(function* () {
        const data = yield* InstanceState.get(state)
        const fiber = data.running.get(swarmID)
        if (fiber) {
          yield* Fiber.interrupt(fiber)
          data.running.delete(swarmID)
        }
      })

    return Service.of({
      run: runFn,
      cancel: cancelFn,
    })
  }),
)

export const defaultLayer = layer.pipe(
  Layer.provide(Bus.layer),
  Layer.provide(Session.defaultLayer),
  Layer.provide(BackgroundJob.layer),
  Layer.provide(Agent.defaultLayer),
)

export * as SwarmOrchestrator from "./orchestrator"
