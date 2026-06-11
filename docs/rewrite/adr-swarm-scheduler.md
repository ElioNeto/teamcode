# ADR: Agent Swarm — Clean Break with Goroutines in Go

**Date:** 2026-06-11
**Author:** Delivery-loop pipeline
**Status:** Approved
**Epic:** #1036
**Issues:** #1074, #1075, #1076

---

## Context

The current agent swarm in TypeScript is modeled with **Effect fibers** — a cooperative
scheduler managed by the Effect library. Each agent is a fiber that can be
paused, canceled, and composed with others:

```
SwarmRunner
  └── fiber por agent
        ├── comunica via Effect Stream
        ├── cancelamento via Effect.interrupt
        └── composição via Effect.fork / Effect.join
```

In the incremental migration (Strangler Fig, #1036), preserving this model in Go
would mean reimplementing a cooperative scheduler on top of goroutines —
high complexity with marginal gain.

## Decision

**Clean break:** the Go swarm will **not** emulate Effect fibers. It will be
modeled as a **native goroutine scheduler with communication via channels**
— the model Go was designed for.

```
SwarmScheduler
  └── goroutine por agent
        ├── comunica via channels tipados
        ├── cancelamento via context.WithCancel
        └── coordenação via errgroup.Group
```

## Rationale

1. **Higher internal coupling** — The swarm is the most tightly coupled module.
   Public interface parity (HTTP + SSE) is sufficient; implementation parity
   is not necessary.

2. **Goroutines + channels** express the same mental model (concurrent agents
   communicating with each other) more idiomatically and with better performance in Go.

3. **External contract preserved** — SSE streaming, cancellation, and result
   can be maintained even with completely different internals.

4. **Lower risk** — Breaking change in an isolated module (swarm) is safer than
   reimplementing Effect fibers in Go, which would carry risks of race conditions and
   deadlocks that are difficult to debug.

## Communication Model

```
POST /swarm/run (AgentSpec[])
  │
  ▼
SwarmScheduler.Run()
  │
  ├── Resolve DAG de dependências
  ├── Cria Agent + context para cada agent
  ├── errgroup.WithContext para coordenação
  │
  ├── goroutine Agent A ──► channel AgentResult ──► errgroup
  │       │
  │       ├── agent.started (Event Bus)
  │       ├── agent.token    (Event Bus) ──► SSE
  │       ├── agent.tool_call (Event Bus)
  │       │       │
  │       │       ▼  (via POST /swarm/:id/agent/:id/tool_result)
  │       │    TS runtime executa tool
  │       │
  │       ├── agent.done / agent.error (Event Bus)
  │       └── ctx.Done() em caso de cancelamento
  │
  └── errgroup.Wait()
        └── swarm.done (Event Bus)
```

## External Contracts

| Contrato | TypeScript | Go |
|----------|-----------|-----|
| Iniciar swarm | `swarm.run(agents)` | `POST /swarm/run` |
| Resultado | Stream SSE | SSE via Event Bus |
| Cancelamento | `swarm.cancel(id)` | `DELETE /swarm/:id` |
| Status | `swarm.status(id)` | `GET /swarm/:id/status` |

## Tool Execution Strategy

**Option A (recommended):** Go emits `agent.tool_call`, TS executes the tool,
and posts the result back via `POST /swarm/:id/agent/:agentId/tool_result`.

```
Go agent ──► agent.tool_call (SSE)
                │
                ▼
          TS runtime executa tool (bash, filesystem, etc.)
                │
                ▼
          POST /swarm/:id/agent/:id/tool_result
                │
                ▼
          Go agent processa resultado e continua
```

This option was chosen because:
- Tools remain in TS (no duplication of tool logic)
- Simplicity of implementation
- Roundtrip latency is acceptable for tool calls (typically > 1s)

## Dependency Diagram

```
AgentSpec (input)
  │
  ├── id: string
  ├── name: string
  ├── input: JSON
  ├── dependsOn?: string[]
  ├── timeout?: number (ms)
  └── model?: ModelSpec

AgentEvent (output via SSE)
  ├── agent.started
  ├── agent.token
  ├── agent.tool_call
  ├── agent.tool_result
  ├── agent.done
  ├── agent.error
  ├── swarm.done
  └── swarm.canceled
```

## Limitations

- This ADR does **not** cover the scheduler implementation (issue #1075)
- This ADR does **not** cover the TS ↔ Go contract (issue #1076)
- The replacement of Effect fibers with goroutines is exclusive to the swarm module;
  other modules continue with full parity
- Tool calls via roundtrip (option A) is an initial decision — it may evolve
  to option C (native Go tools) if latency becomes a bottleneck

## Acceptance Criteria

- [x] Decision documented and reviewed
- [x] External contracts documented with explicit types
- [x] Communication diagram between agents (channels + goroutines)
- [x] Tool execution strategy defined
- [x] Clear scope boundaries
