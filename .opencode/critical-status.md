# 🔴 Pendências Internas — ElioNeto/teamcode

Issues de dívida técnica e stubs encontrados diretamente no código-fonte, trackeadas em [ElioNeto/teamcode/issues](https://github.com/ElioNeto/teamcode/issues).

### Críticos (Bloqueantes)

| # | Issue | Arquivo | Gravidade |
|---|-------|---------|-----------|
| I-01 | **v2 Session — 6 métodos são stubs vazios** (`create`, `prompt`, `shell`, `skill`, `compact`, `wait`) | `packages/teamcode/src/v2/session.ts:170,290,292,293,329,330` | 🔴 Bloqueia experimento v2 |
| I-02 | **ACP `authenticate()` — `throw new Error("Authentication not implemented")`** | `packages/teamcode/src/acp/agent.ts:562` | 🔴 Bloqueia ACP com auth |
| I-03 | **16 `NamedError.create()` precisam virar `Schema.TaggedErrorClass`** | 8 arquivos (skill, mcp, db, message-v2, message-error, ide, config/error, config/config, config/markdown) | 🔴 P0 Effect |
| I-04 | **6+ `Effect.die()` usados para erros esperados (não defects)** | `src/snapshot/index.ts`, `src/tool/webfetch.ts`, `src/tool/mcp-websearch.ts`, `src/session/prompt.ts` | 🔴 ERR-4 |

### Alta Prioridade

| # | Issue | Arquivos | Gravidade |
|---|-------|----------|-----------|
| I-05 | **15 blocos `TODO(v2)` de dual-write temporário** | `src/session/prompt.ts`, `src/session/processor.ts` | 🟠 Precisa ser limpo pós-migração |
| I-06 | **66+ referências `Flag.*` precisam migrar para `RuntimeFlags.Service`** | 21+ arquivos | 🟠 P2 roadmap |
| I-07 | **Bun Shell Migration: plano existe, 0% implementado** | `BUN_SHELL_MIGRATION_PLAN.md` — 143 comandos `$` em 17 arquivos | 🟠 Fases 0-4 não iniciadas |
| I-08 | **2 facades `makeRuntime` restantes para remover** | `src/cli/cmd/tui/config/tui.ts:305` + `src/npm/index.ts` | 🟠 RT roadmap |

### Média Prioridade

| # | Issue | Arquivos | Gravidade |
|---|-------|----------|-----------|
| I-09 | **`ConfigPaths.Service` não criado** | `packages/teamcode/src/config/paths.ts`, `src/config/config.ts` | 🟡 Loose ends |
| I-10 | **HTTP middleware adivinha status codes de error names** | `src/server/routes/instance/httpapi/middleware/error.ts` | 🟡 HTTP-2 |
| I-11 | **507 linhas de pós-processamento OpenAPI em `public.ts`** | `src/server/routes/instance/httpapi/public.ts` | 🟡 P6 OA |
| I-12 | **13 TODO/HACK comentários espalhados** | tool, provider, agent, account, session, format, etc. | 🟡 Limpeza |
| I-13 | **Testes ainda usam patterns antigos (Effect.runPromise, ManagedRuntime)** | `test/` | 🟡 P1 TEST |

### Baixa Prioridade / Dívida Técnica

| # | Issue | Arquivos | Gravidade |
|---|-------|----------|-----------|
| I-14 | **Server package extraction (0% feito)** | `specs/` | 🟢 Longo prazo |
| I-15 | **Global paths mutáveis em vez de serviço Effect** | `core/src/global.ts` | 🟢 P3 GLOBAL |
| I-16 | **Data migration: apenas 1 migração registrada** | `packages/teamcode/src/data-migration.ts` | 🟢 Preventivo |
| I-17 | **v2 provider parity: 17 itens não portados** | `packages/teamcode/src/v2/provider-parity-checklist.md` | 🟢 V2 |

---

**Total: 17 issues internas** (4 críticas, 4 alta, 5 média, 4 baixa)
