# Go Core Rewrite — Plano

> **Branch:** `rewrite/go-core`
> **Versão:** 0.1.0
> **Go Module:** `github.com/ElioNeto/teamcode/go-core` (go 1.22.2)
> **Porta:** 43001 (env `GO_CORE_PORT`)
> **Comunicação:** HTTP REST (JSON) via localhost
> **Feature flags:** `packages/core/src/router/flag.ts`

---

## ✅ Concluído

| Issue | Título | O que foi feito | Testes |
|-------|--------|----------------|--------|
| #1042 | Bootstrap go-core | Servidor HTTP, graceful shutdown, CORS, stub session, adapter mínino | — |
| #1041 | Feature flags | `flag.ts` (boolean + canary %), `client.ts` (GoCoreClient), roteamento TS ↔ Go | 7 TS parity |
| #1038 | Branch strategy | Branch `rewrite/go-core` criada | — |
| #1044 | Filesystem adapter completo | 20+ operações (read/write/stat/glob/findUp/copy/move/remove/MIME), paridade com TS `AppFileSystem` | 32 Go + 23 TS parity |
| #1045 | Session event streaming | `internal/eventbus` (PubSub), SSE streaming (`GET /session/events`), publish (`POST /session/event`), health (`GET /session/events-status`), heartbeat 10s, 3 endpoints no TS client | 9 eventbus + 7 server + 3 TS parity |

### Totais
- **48 testes Go** (9 eventbus + 7 server + 32 filesystem)
- **33 testes TS parity** (7 flag + 23 filesystem + 3 session)
- **81 testes no total — zero falhas**
- **3 commits**

---

## 🔜 Próximas Issues Planejadas

### #1039 — Contract Mapping (PENDING)
**Mapear contratos públicos entre TS e Go**

O Go core atualmente possui types soltos no `client.ts`. É necessário:
- [ ] Definir interfaces/types formais compartilhados TS ↔ Go
- [ ] Criar um schema de contratos (JSON Schema ou protobuf) para validação
- [ ] Documentar todos os tipos de request/response de cada endpoint
- [ ] Garantir que os types no client.ts reflitam exatamente os tipos Go
- [ ] Adicionar testes de schema (validar que TS types batem com Go structs)

**Por que:** Sem contratos formais, o roteamento entre TS e Go pode quebrar silenciosamente quando um lado muda sem o outro.

**Arquivos afetados:**
- `packages/core/src/router/client.ts` — types existentes
- `go-core/cmd/server/*.go` — request/response structs
- (novo) `go-core/docs/contracts.md` ou `go-core/schema/`

---

### #1046 — Cutover Plan (PENDING)
**Plano de migração gradual com feature flags**

- [ ] Definir quais operações rotear primeiro para Go (filesystem já 100%)
- [ ] Estratégia de canary: começar com 5%, subir gradualmente
- [ ] Monitoramento de erros: log de falhas do Go core
- [ ] Rollback automático se taxa de erro > X%
- [ ] Data migration (se necessário para session state)

---

### #1047 — Session Lifecycle CRUD
**Implementar ciclo de vida completo de sessões no Go core**

Atualmente o TS gerencia sessões (criar, carregar, salvar, listar, deletar). O Go core só faz streaming de eventos.

Módulo `internal/session/` (diretório já existe, vazio):
- [ ] `store.go`: Repositório de sessões (SQLite via stdlib `database/sql`)
- [ ] `session.go`: Session struct, validação, ciclo de vida
- [ ] Testes unitários

Endpoints REST:
- `POST /session` — criar sessão
- `GET /session/:id` — carregar sessão
- `PUT /session/:id` — atualizar sessão (mensagens, metadata)
- `DELETE /session/:id` — deletar sessão
- `GET /session?project_id=X` — listar sessões de um projeto
- `POST /session/:id/messages` — adicionar mensagem
- `GET /session/:id/messages` — listar mensagens

**Paridade com:** `packages/core/src/session.ts`, `session-message.ts`
**Testes Go:** ~15 testes (store CRUD, validação, messages)
**Testes TS parity:** ~10 testes

---

### #1048 — Provider & Model Catalog
**Port do sistema de providers e modelos**

Módulo `internal/provider/`:
- [ ] `catalog.go`: Catálogo de providers suportados e seus modelos
- [ ] `config.go`: Configuração de provider (API keys, endpoints)
- [ ] `router.go`: Roteamento de requisições para provider correto
- [ ] Testes

Endpoints REST:
- `GET /providers` — listar providers disponíveis
- `GET /providers/:name/models` — listar modelos de um provider
- `POST /providers/:name/chat` — rotear chat completion para o provider (proxy)

**Paridade com:** `packages/core/src/provider.ts`, `model.ts`, `catalog.ts`, `models.ts`
**Esforço:** Alto — integração com multiple APIs externas (OpenAI, Anthropic, etc.)

---

### #1049 — Config System
**Gerenciamento de configuração do projeto**

Módulo `internal/config/` (diretório já existe, vazio):
- [ ] Carregar `teamcode.json[c]` e `tui.json[c]`
- [ ] Schema validation
- [ ] Merge de configs (local + global + CLI flags)
- [ ] Cache de config parsing
- [ ] Testes

Endpoints REST:
- `GET /config` — carregar config do projeto
- `POST /config` — salvar config

**Paridade com:** `packages/core/src/npm-config.ts`, `flag/config.ts`
**Esforço:** Médio

---

### #1050 — Process Spawning
**Execução de processos (shell, npm, npx)**

Módulo `internal/process/`:
- [ ] `spawn.go`: Spawn de processos com timeout, env vars, cwd
- [ ] `npm.go`: Helper para `npm install`, `npx`, `bun x`
- [ ] Testes

**Paridade com:** `packages/core/src/process.ts`, `cross-spawn-spawner.ts`, `npm.ts`
**Esforço:** Médio

---

### #1051 — File Watching (SSE)
**Implementar file watching (placeholder atual)**

- [ ] Implementar watcher real (`fsnotify` ou similar)
- [ ] SSE streaming de eventos de arquivo
- [ ] Substituir placeholder `{"status": "not_implemented"}`

**Endpoint:** `POST /fs/watch` (já registrado, retorna placeholder)
**Esforço:** Médio

---

## 🗺️ Roadmap

### Fase 1: Fundação ✅ (Completo)
- Bootstrap do servidor HTTP (#1042)
- Feature flags (#1041)
- Branch strategy (#1038)

### Fase 2: I/O Pesado ✅ (Completo)
- Filesystem adapter completo (#1044)
- Testes de paridade filesystem (#1040)
- Session event streaming (#1045)

### Fase 3: Contratos & Cutover ⬅️ (Próximo)
- Contract mapping (#1039)
- Cutover plan (#1046)

### Fase 4: Sessões
- Session lifecycle CRUD (#1047)
- Integração com SQLite

### Fase 5: Providers & Config
- Provider/model catalog (#1048)
- Config system (#1049)
- Process spawning (#1050)

### Fase 6: Watch & Real-time
- File watching (#1051)
- WebSocket upgrade (se necessário)

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
│  ┌────┴─────────────────────────┐   │
│  │         Routers              │   │
│  │  /fs/*    /session/*  /health│   │
│  └────┬─────────────────────────┘   │
│       │                             │
│  ┌────┴─────────────────────────┐   │
│  │       Internal packages      │   │
│  │  filesystem/  eventbus/      │   │
│  │  session/     config/        │   │
│  │  provider/    process/       │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Decisões de Arquitetura
1. **Sem dependências externas**: Apenas stdlib Go. Nada de frameworks HTTP, ORMs, etc.
2. **PubSub non-blocking**: Eventos descartados para subscribers lentos (não bloqueia publisher)
3. **SSE > WebSocket**: Simplicidade, compatibilidade com EventSource do browser
4. **Feature flags no TS**: Controle de rollout no lado TS, não no Go
5. **httptest.Server para testes de integração**: Goroutines + canais para SSE

---

## 📊 Status dos Módulos

| Módulo TS | Status Go | Prioridade | Esforço |
|-----------|-----------|-----------|---------|
| `filesystem.ts` | ✅ 100% | Alta | Grande |
| `session.ts` (event streaming) | ✅ 100% | Alta | Médio |
| `session.ts` (CRUD) | ❌ 0% | Alta | Grande |
| `session-message.ts` | ❌ 0% | Alta | Médio |
| `session-prompt.ts` | ❌ 0% | Média | Médio |
| `provider.ts` | ❌ 0% | Alta | Grande |
| `model.ts` / `models.ts` | ❌ 0% | Alta | Médio |
| `catalog.ts` | ❌ 0% | Alta | Médio |
| `npm-config.ts` | ❌ 0% | Média | Médio |
| `npm.ts` | ❌ 0% | Média | Médio |
| `config.ts` (implícito) | ❌ 0% | Média | Médio |
| `process.ts` | ❌ 0% | Baixa | Pequeno |
| `event.ts` | ✅ via eventbus | — | — |
| `auth.ts` | ❌ 0% | Baixa (Go não gerencia auth) | Pequeno |
| `plugin/*` | ❌ 0% | Baixa | Grande |

---

## 🔗 Commits

```
cfe1756 feat(go-core): implement session event streaming with SSE + PubSub
7113849 feat(go-core): implement complete filesystem adapter with parity tests
12ebbbc feat(go-core): bootstrap Go core with filesystem adapter, HTTP server, and feature flags
```

---

## 📝 Notas

- `internal/session/` e `internal/config/` existem como diretórios vazios — prontos para implementação
- `POST /fs/watch` retorna placeholder `{"status": "not_implemented"}`
- Version `0.1.0` (hardcoded em `health.go`)
- Nenhuma dependência externa além da stdlib
- Feature flags desligadas por default (`go-core-available: false`, `go-core-filesystem: 0%`, `go-core-session: 0%`)
- Este plano será atualizado conforme novas issues forem adicionadas
