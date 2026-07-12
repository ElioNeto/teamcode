# Investigação de Performance — v2.3.1

> Data: 2026-07-12
> Escopo: Startup lento (>10 min) e sessões incompletas

---

## Problema 1: Sessão existente vem incompleta

### Causa Raiz

**Arquivo:** `packages/teamcode/src/cli/cmd/run/session.shared.ts:9`

```ts
const LIMIT = 200
```

Essa constante é usada por duas funções que limitam o histórico da sessão a 200 mensagens, sem qualquer mecanismo de paginação.

### Funções afetadas

#### `resolveSession()` (linhas 155-161)

```ts
export async function resolveSession(sdk, sessionID, limit = LIMIT) {
  const response = await sdk.session.messages({ sessionID, limit })
  return createSession(response.data ?? [])
}
```

Chama a SDK uma única vez com `limit: 200`. O parâmetro `before` (cursor de paginação) nunca é utilizado.

#### `sessionHistory()` (linhas 163-179)

```ts
export function sessionHistory(session, limit = LIMIT) {
  const out: RunPrompt[] = []
  // ... monta array de prompts ...
  return out.slice(-limit) // trunca em 200
}
```

Fatia o array final em no máximo 200 entradas.

### Fluxo completo da requisição

```
session.shared.ts:resolveSession(sdk, sessionID, limit=200)
  → SDK client: GET /session/{sessionID}/message?limit=200
    → Handler HTTP (session.ts:103-142)
      → MessageV2.page({ sessionID, limit: 200 })
        → SQL: SELECT ... FROM session_message
            WHERE session_id = ?
            ORDER BY time_created DESC, id DESC
            LIMIT 201    -- 200 + 1 para flag "more"
          → no máximo 200 mensagens retornadas
```

### Problemas agravantes

| #   | Arquivo                | Linha   | Problema                                                                                                                                                       |
| --- | ---------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `session.shared.ts`    | 9       | `LIMIT = 200` hardcoded                                                                                                                                        |
| 2   | `session.shared.ts`    | 155-161 | `resolveSession()` não usa `before` cursor — sem paginação                                                                                                     |
| 3   | `subagent-data.ts`     | 13      | `SUBAGENT_CALL_BOOTSTRAP_LIMIT = 80` — limite ainda menor para subagentes                                                                                      |
| 4   | `session.ts` (handler) | 116-126 | Handler HTTP chama `MessageV2.page()` diretamente quando `limit` é fornecido, ignorando `Session.messages()` que tem fallback de 50000 e paginação inteligente |

### Contraste com a implementação interna

O método `Session.messages()` (session.ts:856-888) tem:

- Default de **50000 mensagens**
- Paginação automática em batches de 50
- Suporte a cursor

Porém o handler HTTP (`session.ts:103-142`) faz:

```ts
if (ctx.query.limit === undefined || ctx.query.limit === 0) {
  // Usa Session.messages() com 50000 default
  return yield * session.messages({ sessionID })
}
// Quando limit é passado (ex: 200), usa MessageV2.page() diretamente
const page = yield * MessageV2.page({ sessionID, limit: ctx.query.limit, before })
```

Como o SDK sempre envia `limit: 200`, o branch com `MessageV2.page()` é sempre executado.

---

## Problema 2: Startup lento (>10 minutos)

### Cadeia completa de inicialização

#### Fase 0 — Import de módulos

| Import                                                 | Efeito colateral                                                                                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `@teamcode-ai/core/router` (index.ts:18) → `client.ts` | **`startCircuitBreaker()`** executado imediatamente na carga do módulo. Começa a fazer `GET /metrics` contra Go core num loop de 30s. |

#### Fase 1 — Startup inicial (index.ts:49)

| Etapa                             | Descrição                                                                                                                                                                                                                                                          | Risco                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `startGoCore()` (fire-and-forget) | 1. `resolveBinary()` — 4 `fs.existsSync()`<br>2. Se não achar: **download do GitHub** (30s timeout) + extração (15s)<br>3. `findAvailablePort()` — escaneia portas 43001-43100 (1s cada via HTTP)<br>4. `spawn()` + **poll `/health`** a cada 200ms por até **5s** | ⚠️ Download pode ser lento; port scan adiciona latência |

#### Fase 2 — Middleware (index.ts:100-127)

| Etapa                                    | Tempo                                                                                    |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| `Global.ensure()`                        | <50ms                                                                                    |
| `Log.init()`                             | <100ms                                                                                   |
| `Heap.start()`                           | <10ms                                                                                    |
| **Migração one-time** (index.ts:139-182) | **"may take a few minutes"** — lê todos os JSONs do storage anterior e migra para SQLite |

#### Fase 3 — Boot do Runtime (runtime.boot.ts)

Quatro tarefas concorrentes:

| Tarefa                     | Custos                                                           |
| -------------------------- | ---------------------------------------------------------------- |
| `resolveFooterKeybinds()`  | I/O de arquivo (config TUI)                                      |
| `resolveDiffStyle()`       | I/O de arquivo (config)                                          |
| **`resolveModelInfo()`**   | 2 chamadas SDK: `sdk.config.providers()` + `sdk.provider.list()` |
| **`resolveSessionInfo()`** | 1 chamada SDK: `sdk.session.messages()`                          |

### Gargalos identificados

#### 1. Model Catalog (models.ts)

```ts
const source = Flag.TEAMCODE_MODELS_URL || "https://models.dev"
// ...
const fetchApi = Effect.fn("ModelsDev.fetchApi")(() =>
  HttpClientRequest.get(`${source}/api.json`).pipe(
    // ...
    Effect.timeout("10 seconds"),
  ),
)
```

Pipeline de fallback:

1. Cache persistente (ApexStore)
2. Cache em disco (`models.json`, TTL: 60 min)
3. Snapshot embutido (`models-snapshot.js` — pode não existir em dev)
4. **Flock lock** (timeout: 60s, stale: 60s) — 🔴 bloqueante entre processos
5. **Fetch HTTP** (timeout: 10s, retry exponencial x2)

**Pior caso**: ~80s se o lock estiver ocupado e o fetch falhar e retentar.

#### 2. Provider initialization (provider.ts:1214-1489)

```ts
for (const hook of plugins) {
  const p = hook.provider
  const models = p?.models
  if (!p || !models) continue
  provider.models =
    yield *
    Effect.promise(async () => {
      const next = await models(toPublicInfo(provider), { auth: pluginAuth })
      // ...
    })
}
```

- Cada plugin pode executar chamadas HTTP em `hook.provider.models()`
- Auth carregado para cada provider
- Custom loaders (ex: GitLab discovery) fazem requisições de rede

#### 3. Circuit breaker prematuro (client.ts:94)

```ts
// Start the circuit breaker polling loop on module load
startCircuitBreaker()
```

O circuit breaker começa a pollar **antes** do Go core estar pronto, causando falhas desnecessárias e possivelmente competindo por recursos de rede durante o startup.

#### 4. Flock lock no modelo (models.ts:216-218)

```ts
yield * Flock.effect(lockKey, { timeoutMs: 60_000, staleMs: 60_000 })
```

Timeout de 60s para um lock de arquivo entre processos. Se outro processo estiver fazendo refresh do catálogo, o startup pode travar.

---

## Resumo dos problemas

| #   | Prioridade | Arquivo                 | Problema                            | Impacto                        |
| --- | ---------- | ----------------------- | ----------------------------------- | ------------------------------ |
| 1   | 🔴 Crítico | `session.shared.ts:9`   | `LIMIT=200` sem paginação           | Sessões truncadas              |
| 2   | 🔴 Crítico | `session.ts:116-126`    | Handler HTTP bypassa lógica robusta | Mensagens limitadas a 200      |
| 3   | 🟠 Alto    | `models.ts:216-218`     | Flock lock 60s + fetch 10s          | Startup pode travar até ~80s   |
| 4   | 🟠 Alto    | `client.ts:94`          | Circuit breaker na carga do módulo  | Polling prematuro              |
| 5   | 🟠 Alto    | `provider.ts:1282-1299` | Plugin models() síncrono            | Bloqueia inicialização         |
| 6   | 🟡 Médio   | `go-core.ts:174-263`    | Download sem progresso visível      | Usuário não sabe o que esperar |
| 7   | 🟡 Médio   | `index.ts:139-182`      | Migração one-time lenta             | First-run demorado             |
