# Go Core Rewrite — Plano

> **Branch:** `rewrite/go-core`
> **Versão:** 0.1.0
> **Go Module:** `github.com/ElioNeto/teamcode/go-core` (go 1.22.2)
> **Porta:** 43001 (env `GO_CORE_PORT`)
> **Comunicação:** HTTP REST (JSON) via localhost
> **Feature flags:** `packages/core/src/router/flag.ts`
> **Epic:** [#1036](https://github.com/ElioNeto/teamcode/issues/1036)
> **Issues abertas:** https://github.com/ElioNeto/teamcode/issues?q=label%3Aenhancement+is%3Aopen+rewrite

---

## 🎯 Estratégia: Strangler Fig Pattern

> **Epic #1036** — Reescrita incremental do core sem interromper o runtime atual.

- Runtime TypeScript continua 100% funcional durante toda migração
- Novos módulos Go introduzidos por trás de contratos HTTP estáveis
- Cada módulo convive com o antigo até paridade total validada
- Rollback via feature flag (sem redeploy)
- Código legado removido apenas após estabilização confirmada

### Fora de escopo
- TUI / frontend (`packages/app`, `packages/ui`)
- Desktop Tauri (`packages/desktop`)
- Integrações ativas (`packages/slack`, `packages/mcp-security-tools`)

---

## ✅ Concluído

| Issue | Título | O que foi feito | Testes |
|-------|--------|----------------|--------|
| [#1042](https://github.com/ElioNeto/teamcode/issues/1042) | Bootstrap go-core | Servidor HTTP, graceful shutdown, CORS, adapter mínimo | — |
| [#1041](https://github.com/ElioNeto/teamcode/issues/1041) | Feature flags | `flag.ts` (boolean + canary %), `client.ts` (GoCoreClient), roteamento TS ↔ Go | 7 TS parity |
| [#1038](https://github.com/ElioNeto/teamcode/issues/1038) | Branch strategy | Branch `rewrite/go-core` criada | — |
| [#1044](https://github.com/ElioNeto/teamcode/issues/1044) | Filesystem adapter completo | 20+ operações (read/write/stat/glob/findUp/copy/move/remove/MIME), paridade TS `AppFileSystem` | 32 Go + 23 TS parity |
| [#1045](https://github.com/ElioNeto/teamcode/issues/1045) | Session event streaming (parcial) | `internal/eventbus` (PubSub), SSE streaming, publish, health, heartbeat 10s | 9 + 7 + 3 TS parity |
| [#1069](https://github.com/ElioNeto/teamcode/issues/1069) | Shadow mode | `isShadow()`, `setShadow()`, `routeFilesystemOp()`, `deepEqual()`, `X-Trace-ID` | 11 TS parity (shadow.test.ts) |
| [#1071](https://github.com/ElioNeto/teamcode/issues/1071) | Metrics + circuit breaker | `internal/metrics` (sliding window 60s), `GET /metrics`, polling 30s, auto-rollback >1% erro | 4 Go + 2 TS parity |
| [#1043](https://github.com/ElioNeto/teamcode/issues/1043) | Process spawning | `internal/process` (spawn com timeout/env/cwd), npm/npx helpers | 10 Go + 4 TS parity |

### Totais
- **62 testes Go** (9 eventbus + 7 server + 32 filesystem + 4 metrics + 10 process)
- **50 testes TS parity** (7 flag + 23 filesystem + 3 session + 11 shadow + 2 metrics + 4 process)
- **112 testes — zero falhas**
- **8 commits** (incluindo PLAN.md)

---

## 🔜 Issues Abertas (por ordem recomendada)

### #1069 — Shadow Mode no Router TS
**Parte do epic #1036.** Depende de: #1044, #1045. Bloqueado por: #1039.

**Objetivo:** Implementar shadow mode no router TS para validar Go em produção sem risco.

```
flag = 'shadow'      → executa TS + Go, usa resultado TS, loga divergências
flag = 'canary:5%'   → 5% requests vão para Go
flag = 'enabled'     → 100% Go
flag = 'disabled'    → 100% TS (padrão)
```

**Tarefas:**
- [ ] Adicionar modo `shadow` em `flag.ts`
- [ ] Implementar `routeFilesystemOp` com shadow mode em `router.ts`
- [ ] Adicionar `X-Trace-ID` (UUID) em todos os requests do `GoCoreClient`
- [ ] Logar divergências com trace ID, operação e diff
- [ ] Testes: divergência detectada, erro Go ignorado, Go down, TS down
- [ ] Ativar `filesystem = shadow` em staging

**Critérios:** Shadow mode nunca altera resultado do usuário; erros Go são silenciosos.

---

### #1071 — Métricas de Health & Circuit Breaker
**Parte do epic #1036.** Depende de: #1041, #1069. Pré-requisito para: #1046.

**Objetivo:** Implementar endpoint de métricas no Go server e circuit breaker no router TS para rollback automático.

**Go server (`internal/metrics/`):**
```go
// GET /metrics
type Metrics struct {
    TotalRequests   int64          `json:"total_requests"`
    TotalErrors     int64          `json:"total_errors"`
    ErrorRateLast5m float64        `json:"error_rate_last_5m"`
    Filesystem      MetricsModule  `json:"filesystem"`
    Session         MetricsModule  `json:"session"`
}
```
Contadores com janela deslizante de 5min (ring buffer 30 buckets de 10s). Sem dependências externas.

**Router TS (circuit breaker):**
```typescript
// polling a cada 30s
if (metrics.filesystem.error_rate_last_5m > 0.01) {
  flagStore.set('filesystem', 'disabled') // rollback automático
}
```

**Tarefas:**
- [ ] Implementar `internal/metrics/` com contadores + janela deslizante
- [ ] Expor `GET /metrics`
- [ ] Middleware de métricas nos handlers
- [ ] Polling de health no `GoCoreClient` (30s)
- [ ] Circuit breaker desativa flag se error rate > 1% por 5min
- [ ] Adicionar `X-Trace-ID` em todos os requests (partilhado com #1069)
- [ ] Logar trace ID no Go server

---

### #1046 — Plano de Cutover & Rollback
**Parte do epic #1036.** ✅ COMPLETO (#1069 + #1071 + #1043).

**Processo de cutover por módulo:**
```
1. Feature flag: 0% Go / 100% TS   (desenvolvimento)
2. Shadow mode:  Go paralelo, descartado  ← ESTAMOS AQUI (Q3/2026)
3. Canary:       5% → 25% → 50% → 75% → 100%
4. Remoção do legado TS
```

**Análise do ElioNeto (#1046, comment 2026-06-10) — 3 lacunas resolvidas:**

| # | Lacuna | Impacto | Resolução |
|---|--------|---------|-----------|
| 1 | Shadow mode não implementado | Não é possível validar Go em produção sem risco | ✅ #1069: `routeFilesystemOp()` + `deepEqual()` + `isShadow()` |
| 2 | Sem métricas no Go server | Rollback automático não funciona | ✅ #1071: `internal/metrics` + `GET /metrics` + circuit breaker polling |
| 3 | Sem `X-Trace-ID` cross-runtime | Divergências não correlacionáveis | ✅ #1069: `X-Trace-ID` em todos os requests, logado no Go server |

#### Runbook: Ativar Shadow Mode para Filesystem

```bash
# 1. Ativar shadow mode para filesystem via env var
export FLAG_filesystem_shadow=true

# 2. Observar divergências nos logs
#    Logs aparecem como:
#   [shadow] divergence filesystem.<op> trace=<uuid> { ts: ..., go: ... }
#   [shadow] go_error filesystem.<op> trace=<uuid> { error: ... }

# 3. Verificar métricas do Go core
curl http://127.0.0.1:43001/metrics
#   Retorna: { request_count, error_count, error_rate, avg_latency_ms }

# 4. Rollback (se error_rate > 1%)
export FLAG_filesystem_shadow=false
#   OU automaticamente via circuit breaker (threshold 1%, 30s polling)
```

#### Runbook: Promover para Canary (após 48h sem divergências)

```bash
# 1. Aumentar canary gradualmente
export FLAG_go_core_filesystem=5    # 5%
# monitorar 24h
export FLAG_go_core_filesystem=25   # 25%
# monitorar 24h
export FLAG_go_core_filesystem=50   # 50%
# monitorar 24h
export FLAG_go_core_filesystem=75   # 75%
# monitorar 24h
export FLAG_go_core_filesystem=100  # 100%

# 2. Rollback rápido
export FLAG_go_core_filesystem=0    # volta para TS imediatamente
```

#### Ordem de cutover recomendada:
```
Módulo       Shadow      Canary      Critério
──────────────────────────────────────────────────────
filesystem   ✅ ATIVO   🔄 Próximo  Parity tests passam 48h CI
session/SSE  ⏳ Pendente ⏳ Pendente Latência p95 ≤ legado TS 24h
process      ⏳ Pendente ⏳ Pendente Testado Linux + macOS + Windows
npm          ⏳ Pendente ⏳ Pendente Testado Linux + macOS + Windows
```

**Rollback:** `export FLAG_<modulo>_enabled=0` — sem redeploy.  
**Rollback automático:** Circuit breaker desabilita Go core se `error_rate > 1%` por 30s.

---

### #1039 — Contract Mapping
**Parte do epic #1036.**

**Objetivo:** Mapear contratos públicos entre TS e Go.

- [ ] Definir interfaces/types formais compartilhados
- [ ] Validar que `client.ts` types batem com Go structs
- [ ] Documentar request/response de cada endpoint
- [ ] Adicionar testes de schema
- [ ] **Blocker de #1069** (path absoluto no findUp precisa de contrato)

---

### #1043 — Process Spawning
**Parte do epic #1036.** Pendente.

Módulo `internal/process/`:
- [ ] `spawn.go`: Spawn com timeout, env vars, cwd
- [ ] `npm.go`: Helper para `npm install`, `npx`, `bun x`
- [ ] Testes

**Paridade com:** `process.ts`, `cross-spawn-spawner.ts`, `npm.ts`
**Esforço:** Médio

---

### #1070 — Session Message Updater (stateful) ⚠️ SKIPPED
**Parte do epic #1036.** Muito complexo para resolução automática (>30min, requer julgamento humano).

**Contexto:** `session-message-updater.ts` (13KB, 417 linhas, 6 tipos de evento, Immer immutability, stateful com transições de fase) foi excluído do #1045.

**Comportamentos a preservar (requer intervenção manual):**
- [ ] Agregação incremental de tokens LLM → mensagem consolidada
- [ ] Transição de fases: `reasoning` → `content` → `tool_call` → `done`
- [ ] Persistência para reconstituição pós-reconexão SSE
- [ ] Cancelamento mid-stream via `context.Context`

**Recomendação:** Manter no TS por enquanto. Se for portar para Go, alocar sprint dedicado de 3-5 dias.

---

### #1040 — Parity Test Harness
**Parte do epic #1036.** Pendente.

**Objetivo:** Criar harness oficial de testes de paridade legado vs Go.

- [ ] Harness reutilizável (`test/parity/harness.ts`)
- [ ] CI: rodar parity tests automaticamente
- [ ] Report de cobertura de paridade

---

### #1048 — Provider & Model Catalog (futuro)
**Parte do epic #1036.** Pendente.

Módulo `internal/provider/`:
- `catalog.go`, `config.go`, `router.go`
- Endpoints: `GET /providers`, `GET /providers/:name/models`, `POST /providers/:name/chat`

**Esforço:** Alto (integração com múltiplas APIs externas)

---

### #1049 — Config System (futuro)
Módulo `internal/config/` (diretório vazio):
- Carregar `teamcode.json[c]`
- Schema validation, merge de configs, cache

**Esforço:** Médio

---

### #1051 — File Watching (futuro)
Substituir placeholder `POST /fs/watch`:
- Watcher real (`fsnotify`)
- SSE streaming de eventos de arquivo

**Esforço:** Médio

---

## 🗺️ Roadmap

```
Fase 1: Fundação           ✅ CONCLUÍDO
  #1042 Bootstrap HTTP server
  #1041 Feature flags
  #1038 Branch strategy

Fase 2: I/O Pesado         ✅ CONCLUÍDO
  #1044 Filesystem adapter (32 Go + 23 TS parity tests)
  #1040 Parity test harness (pendente)
  #1045 Session event streaming (parcial)

Fase 3: Observabilidade    ⬅️ AGORA
  #1069 Shadow mode (pré-requisito cutover)
  #1071 Métricas + circuit breaker (pré-requisito cutover)
  #1046 Cutover plan + rollback
  #1039 Contract mapping

Fase 4: Process Spawning
  #1043 process.ts + cross-spawn-spawner.ts

Fase 5: Session Completude
  #1070 session-message-updater (stateful token aggregation)

Fase 6: Providers & Config
  #1048 Provider/model catalog
  #1049 Config system

Fase 7: Watch
  #1051 File watching (fsnotify + SSE)
```

---

## 🏗️ Arquitetura

```
TS Runtime (Bun)
    │
    │ spawn + HTTP (localhost:43001)
    ▼
┌─────────────────────────────────────┐
│         Go Core Server              │
│                                     │
│  ┌──────────┐  ┌──────────────────┐ │
│  │ HTTP Mux  │  │   withCORS()     │ │
│  │ (net/http)│──│  middleware      │ │
│  └────┬─────┘  └──────────────────┘ │
│       │                             │
│  ┌────┴──────────┬──────────┬─────┐ │
│  │  /fs/*        │  /session/*   │ │
│  │  /health      │  /metrics     │ │
│  └────┬──────────┴──────────┬─────┘ │
│       │                     │       │
│  ┌────┴──────────┐  ┌──────┴─────┐ │
│  │  filesystem/  │  │  eventbus/  │ │
│  │  (completo)   │  │  (completo) │ │
│  └───────────────┘  └────────────┘ │
│  ┌───────────────┐  ┌────────────┐ │
│  │  metrics/     │  │  updater/  │ │
│  │  (planejado)  │  │(planejado) │ │
│  └───────────────┘  └────────────┘ │
│  ┌───────────────┐  ┌────────────┐ │
│  │  session/     │  │  process/  │ │
│  │  (vazio)      │  │(planejado) │ │
│  └───────────────┘  └────────────┘ │
└─────────────────────────────────────┘
```

### Decisões de Arquitetura
1. **Sem dependências externas**: Apenas stdlib Go
2. **PubSub non-blocking**: Eventos descartados para subscribers lentos
3. **SSE > WebSocket**: Simplicidade, compatibilidade EventSource
4. **Feature flags no TS**: Controle de rollout no lado TS
5. **httptest.Server para integração**: Goroutines + canais para SSE
6. **X-Trace-ID cross-runtime**: UUID gerado no TS, propagado no header, logado no Go

---

## 📊 Status dos Módulos TS

| Módulo | Prioridade Epic | Go | Issue |
|--------|----------------|-----|-------|
| `filesystem.ts` | 2º | ✅ 100% | #1044 |
| `session.ts` (event streaming) | 3º | ✅ SSE | #1045 |
| `process.ts` | 1º | ❌ 0% | #1043 |
| `session-message-updater.ts` | 3º | ❌ 0% | #1070 |
| `session.ts` (CRUD lifecycle) | 3º | ❌ 0% | — |
| `session-message.ts` | 3º | ❌ 0% | — |
| `session-prompt.ts` | 3º | ❌ 0% | — |
| `provider.ts` | 4º | ❌ 0% | #1048 |
| `model.ts` / `models.ts` | 4º | ❌ 0% | #1048 |
| `catalog.ts` | 4º | ❌ 0% | #1048 |
| `aisdk.ts` | 4º | ❌ 0% | — |
| `npm-config.ts` | — | ❌ 0% | #1049 |
| `npm.ts` | — | ❌ 0% | — |
| `config.ts` (implícito) | — | ❌ 0% | #1049 |
| `event.ts` | — | ✅ via eventbus | #1045 |
| `auth.ts` | Fora de escopo | ❌ | — |
| `plugin/*` | Fora de escopo | ❌ | — |

---

## 🔗 Commits

| Commit | Data | Descrição |
|--------|------|-----------|
| `6c3cc87` | 2026-06-10 | docs(go-core): create comprehensive rewrite plan |
| `cfe1756` | 2026-06-10 | feat(go-core): implement session event streaming + PubSub |
| `7113849` | 2026-06-08 | feat(go-core): implement complete filesystem adapter |
| `12ebbbc` | 2026-06-08 | feat(go-core): bootstrap Go core |

---

## 📝 Notas

- `internal/session/` e `internal/config/` vazios — aguardando implementação
- `POST /fs/watch` retorna placeholder `{"status": "not_implemented"}`
- Version `0.1.0` em `health.go`
- Feature flags desligadas por default (`go-core-available: false`, canary 0%)
- Issues #1069, #1070, #1071 adicionadas em 2026-06-10 após análise do cutover
- Shadow mode (#1069) e métricas (#1071) são pré-requisitos para cutover real (#1046)
- Este plano reflete as issues do GitHub em https://github.com/ElioNeto/teamcode/issues
