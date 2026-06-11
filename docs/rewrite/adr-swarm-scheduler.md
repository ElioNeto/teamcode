# ADR: Agent Swarm — Ruptura Limpa com Goroutines em Go

**Data:** 2026-06-11
**Autor:** Delivery-loop pipeline
**Status:** Aprovado
**Epic:** #1036
**Issues:** #1074, #1075, #1076

---

## Contexto

O agent swarm atual no TypeScript é modelado com **Effect fibers** — um scheduler
cooperativo gerenciado pela biblioteca Effect. Cada agent é uma fiber que pode ser
pausada, cancelada e composta com outras:

```
SwarmRunner
  └── fiber por agent
        ├── comunica via Effect Stream
        ├── cancelamento via Effect.interrupt
        └── composição via Effect.fork / Effect.join
```

Na migração incremental (Strangler Fig, #1036), preservar esse modelo em Go
significaria reimplementar um scheduler cooperativo em cima de goroutines —
complexidade alta com ganho marginal.

## Decisão

**Ruptura limpa:** o swarm em Go **não** vai emular Effect fibers. Vai ser
modelado como um **scheduler de goroutines nativo com comunicação via channels**
— o modelo que Go foi projetado para ter.

```
SwarmScheduler
  └── goroutine por agent
        ├── comunica via channels tipados
        ├── cancelamento via context.WithCancel
        └── coordenação via errgroup.Group
```

## Justificativa

1. **Maior acoplamento interno** — O swarm é o módulo de maior acoplamento.
   Paridade de interface pública (HTTP + SSE) é suficiente; paridade de
   implementação não é necessária.

2. **Goroutines + channels** expressam o mesmo modelo mental (agentes concorrentes
   que se comunicam) de forma mais idiomática e performática em Go.

3. **Contrato externo preservado** — SSE streaming, cancelamento, e resultado
   podem ser mantidos mesmo com internals completamente diferentes.

4. **Menor risco** — Ruptura em um módulo isolado (swarm) é mais segura que
   reimplementar Effect fibers em Go, que teria riscos de race conditions e
   deadlocks difíceis de depurar.

## Modelo de Comunicação

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

## Contratos Externos

| Contrato | TypeScript | Go |
|----------|-----------|-----|
| Iniciar swarm | `swarm.run(agents)` | `POST /swarm/run` |
| Resultado | Stream SSE | SSE via Event Bus |
| Cancelamento | `swarm.cancel(id)` | `DELETE /swarm/:id` |
| Status | `swarm.status(id)` | `GET /swarm/:id/status` |

## Tool Execution Strategy

**Opção A (recomendada):** Go emite `agent.tool_call`, TS executa a ferramenta,
e posta o resultado de volta via `POST /swarm/:id/agent/:agentId/tool_result`.

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

Esta opção foi escolhida porque:
- Tools permanecem no TS (sem duplicação de tool logic)
- Simplicidade de implementação
- Latência de roundtrip aceitável para tool calls (tipicamente > 1s)

## Diagrama de Dependências

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

## Limitações

- Esta ADR **não** cobre a implementação do scheduler (issue #1075)
- Esta ADR **não** cobre o contrato TS ↔ Go (issue #1076)
- A troca de Effect fibers por goroutines é exclusiva do módulo swarm;
  outros módulos continuam com paridade total
- Tool calls via roundtrip (opção A) é uma decisão inicial — pode evoluir
  para opção C (tools nativas em Go) se a latência se provar gargalo

## Critérios de Aceite

- [x] Decisão documentada e revisada
- [x] Contratos externos documentados com tipos explícitos
- [x] Diagrama de comunicação entre agents (channels + goroutines)
- [x] Tool execution strategy definida
- [x] Limites de escopo claros
