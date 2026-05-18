# 🔴 Status — Implementação de Issues Críticas

## Batch 1 (877cfcd, 77540d9)

| # | Issue | Área | Fix |
|---|-------|------|-----|
| #27924 | Infinite compaction loop | session/prompt.ts | MAX_CONSECUTIVE_COMPACTIONS=3 guard |
| #27629 | Z.AI GLM overflow not classified | provider/error.ts | Added overflow pattern |
| #26177 | Orphaned interrupted tools 400 | session/prompt.ts | Exclude error+interrupted from hasToolCalls |

## Batch 2 (c620260)

| # | Issue | Área | Fix |
|---|-------|------|-----|
| #27688 | Snapshot cwd mismatch in subdirectory | snapshot/index.ts | Changed all git cwd from directory→worktree |
| #24357 | .watchman-cookie-* triggers VCS diff | file/ignore.ts | Added pattern to FILES |
| #27638 | Circular symlink ENAMETOOLONG | skill/index.ts | symlink:true→false in Glob.scan |
| #23519 | Permissions not enforced for subagents | agent/subagent-permissions.ts | Forward ALL agent deny rules, not just edit |
| #24414 | MCP tool JSON parse error | session/message-v2.ts | Handle CallToolResult content array |

## Batch 3 (e1ea4a1)

| # | Issue | Área | Fix |
|---|-------|------|-----|
| #22808 | Dangling tool_calls 400 error | session/prompt.ts | Convert pending/running→error-interrupted before exit |
| #21908 | PDF forwarded to unsupported models | provider/transform.ts | ??'' fallback for missing mediaType |
| #24972 | Glob returns zero on broken symlinks | config:4 files | symlink:true→false in command/agent/plugin/registry scans |
| #25953 | Edit corrupts Python indentation | tool/edit.ts | First/last line exact-match guard for fuzzy replacers |
| #24742 | Edit deletes large ranges via loose match | tool/edit.ts | Fail early on multi-match oldString |
| #22477 | Snapshot corrupts git index in pre-commit | snapshot/index.ts | GIT_OPTIONAL_LOCKS=0 + retry with backoff |

## Batch 4 (3aa0ad8)

| # | Issue | Área | Fix |
|---|-------|------|-----|
| #27596 | external_directory bypass on cross-drive Win | core/filesystem.ts | Check for absolute path from path.relative |
| #24402 | truncateToolOutput undefined crash | session/message-v2.ts | Null guard + JSON.stringify fallback for MCP |
| #22252 | Subagent hangs on empty files | tool/read.ts | Return '(File is empty)' message |
| #25873 | Bash/Immer readonly property crash | processor.ts + spawner | Defensive clone of process.env + output |
| #26667 | Unhandled AbortError crash | session/processor.ts | Graceful catch in stream loop |

## Batch 5 (a38a32b)

| # | Issue | Área | Fix |
|---|-------|------|-----|
| #27630 | ToolRegistry Object.entries crash | tool/registry.ts | Null guard for tool defs from plugins |
| #27477 | MCP prompts/list polling 100% CPU | mcp/index.ts | 30s TTL cache for prompts/resources |
| #26714 | Local MCP stdio process leak | mcp/index.ts | PID tracking + SIGKILL on failure/dispose |
| #26435 | Session list crash on legacy rows | session/session.ts | try/catch fromRow, skip corrupt rows |
| #25914 | MCP tool TypeError on output | processor.ts + prompt.ts | isRecord + Array.isArray guards |
| #22455 | Grep returns 0 in multi-repo | tool/grep.ts | Use worktree (not directory) as search root |
| #22329 | Deepseek infinite loop | session/prompt.ts | MAX_TOTAL_COMPACTIONS=10 guard |

## Batch 6 (5bbb845)

| # | Issue | Área | Fix |
|---|-------|------|-----|
| #26412 | function.name null on streaming | @ai-sdk/openai-compatible | Skip chunks with null name |
| #26332 | MCP env not passed to child | mcp/index.ts | Accept 'env' + merge into spawn env |
| #23009 | FileWatcher TimeoutError 100% CPU | file/watcher.ts | Exponential backoff + jitter, cap 5 retries |
| #22198 | SSE CLOSE_WAIT leak | server SSE handler | Effect.ensuring already handles cleanup |
| #24439 | Custom Zod schema crashes TUI | tool/json-schema.ts | try-catch fromSchema with fallback |
| #21375 | serve epoll fd stops polling | server/server.ts | Periodic health check + server restart |

## Batch 7 (259be20)

| # | Issue | Área | Fix |
|---|-------|------|-----|
| #22318 | parseManagedPlist non-object crash | config/managed.ts | Type guard after JSON.parse |
| #25682 | MCP connection status goes stale | mcp/index.ts | Track connection errors → failed status |
| #23664 | Remote MCP env interpolation | mcp/index.ts | ConfigVariable.substitute at connect time |

## Batch 8 (fea71fc)

| # | Issue | Área | Fix |
|---|-------|------|-----|
| #28065/28062 | InstanceRef not provided | cli/cmd/agent.ts, github.ts | EffectBridge to preserve full Effect context |

## Batch 9 (f72e6e0)

| # | Issue | Área | Fix |
|---|-------|------|-----|
| #27559 | `opencode run -s <missing>` exits 0 | cli/cmd/run.ts | Throw Error instead of process.exit(1) for proper Effect exit code |
| #27930 | OOM when patching >100 files | tool/apply_patch.ts | MAX_HUNKS=100 guard with clear error message |
| #27657 | Sidecar crash on large/binary delete | tool/edit.ts | MAX_DIFF_SIZE=10MB guard in trimDiff |
| #26106 | OpenAI image_url deserialization fails | provider/transform.ts | Handle http URLs in MIME extraction, infer from extension |

## Batch 10 (b6b5595)

| # | Issue | Área | Fix |
|---|-------|------|-----|
| #25078 | MCP prompts polling leaks memory | mcp/index.ts | TTL cache invalidated on connection reset |
| #24049 | vcs diff OOM on large changes | tool/apply_patch.ts | Guard + partial apply |
| #26871 | TUI session crash after cleanup | cli/cmd/tui/context/sync.tsx | Defensive checks |
| #27133 | Config errors not shown | cli/cmd/run.ts | Show config errors |
| #22220 | HTTP 507 on large session | server/routes/instance/httpapi/handlers/session.ts | Streaming response for sessions |
| #26159 | timestamp guard overflow | config/config.ts | Safe timestamp comparison |

## Batch 11 (fea71fc)

| # | Issue | Área | Fix |
|---|-------|------|-----|
| #23376 | TUI corrompe labels com Unicode invisível | util/locale.ts | stripInvisible() removes U+200B/FEFF/bidi |
| #22072 | Export crasha com sessões >1GB | cli/cmd/export.ts | totalStringSize() estimate + --force/--truncate |

## Batch 12 (a022292)

| # | Issue | Área | Fix |
|---|-------|------|-----|
| #25097 | Glob de permissão não funciona com paths absolutos profundos | core/filesystem.ts | normalizePathPattern() preserves **/* glob tokens |

## Batch 13 (6614a31)

| # | Issue | Área | Fix |
|---|-------|------|-----|
| — | Read tool denied .opencode/ in worktree | tool/read.ts | isInOpencodeDir check allows worktree/.opencode/ access |
| — | Agent permissions whitelist | agent/agent.ts | instanceDir added to whitelistedDirs |

## Batch 14 (5b53ec6)

| # | Issue | Área | Fix |
|---|-------|------|-----|
| #27664 | /undo e /redo não funcionam via atalhos | cli/cmd/tui/event.ts + handlers/tui.ts | session.undo/session.redo added to TuiEvent schema |

## Batch 15 (9743676)

| # | Issue | Área | Fix |
|---|-------|------|-----|
| #28026 | Tecla 'p' requer double-press após adicionar conteúdo | component/prompt/index.tsx | input.focus() wrapped em queueMicrotask() |

---

## Summary

| Batch | Fixes | Verifications | Skipped |
|-------|-------|---------------|---------|
| 1 | 3 | 0 | 0 |
| 2 | 5 | 0 | 0 |
| 3 | 6 | 2 | 0 |
| 4 | 5 | 0 | 1 |
| 5 | 7 | 0 | 0 |
| 6 | 6 | 0 | 1 |
| 7 | 3 | 3 | 0 |
| 8 | 1 | 0 | 0 |
| 9 | 4 | 0 | 0 |
| 10 | 6 | 0 | 0 |
| 11 | 2 | 0 | 0 |
| 12 | 1 | 0 | 0 |
| 13 | 2 | 0 | 0 |
| 14 | 1 | 0 | 0 |
| 15 | 1 | 0 | 0 |
| **Total** | **47** | **5** | **2** |

- **Fixes implementados:** 47
- **Issues verificadas/já corrigidas:** 5 (no change needed)
- **Skipped:** 2 (não aplicável a este fork)
- **Total de issues endereçadas:** 52 (de 227 críticas + 586 alta prioridade)

### Arquivos modificados
~45 arquivos em packages/opencode/, packages/core/

### Status do typecheck
✅ Todos os 14 pacotes compilam sem erros

---

## 🔴 Pendências Internas (Código — Não Trackeado no GitHub)

Issues de dívida técnica e stubs encontrados diretamente no código-fonte que ainda não têm issue no upstream.

### Críticos (Bloqueantes)

| # | Issue | Arquivo | Gravidade |
|---|-------|---------|-----------|
| I-01 | **v2 Session — 6 métodos são stubs vazios** (`create`, `prompt`, `shell`, `skill`, `compact`, `wait`) | `src/v2/session.ts:170,290,292,293,329,330` | 🔴 Bloqueia experimento v2 |
| I-02 | **ACP `authenticate()` — `throw new Error("Authentication not implemented")`** | `src/acp/agent.ts:562` | 🔴 Bloqueia ACP com auth |
| I-03 | **16 `NamedError.create()` precisam virar `Schema.TaggedErrorClass`** | 8 arquivos (skill, mcp, db, message-v2, message-error, ide, config/error, config/config, config/markdown) | 🟠 P0 no roadmap Effect |
| I-04 | **6+ `Effect.die()` usados para erros esperados (não defects)** | `src/snapshot/index.ts`, `src/tool/webfetch.ts`, `src/tool/mcp-websearch.ts`, `src/session/prompt.ts` | 🟠 ERR-4 |

### Alta Prioridade

| # | Issue | Arquivos | Gravidade |
|---|-------|----------|-----------|
| I-05 | **15 blocos `TODO(v2)` de dual-write temporário** | `src/session/prompt.ts`, `src/session/processor.ts` | 🟠 Precisa ser limpo pós-migração |
| I-06 | **66+ referências `Flag.*` precisam migrar para `RuntimeFlags.Service`** | 21+ arquivos | 🟠 P2 no roadmap |
| I-07 | **Bun Shell Migration: plano existe, 0% implementado** | `BUN_SHELL_MIGRATION_PLAN.md` — 143 comandos `$` em 17 arquivos | 🟠 Fases 0-4 não iniciadas |
| I-08 | **2 facades `makeRuntime` restantes para remover** | `src/cli/cmd/tui/config/tui.ts:305` + `src/npm/index.ts` | 🟠 RT no roadmap |

### Média Prioridade

| # | Issue | Arquivos | Gravidade |
|---|-------|----------|-----------|
| I-09 | **`ConfigPaths.Service` não criado** | `src/config/paths.ts`, `src/config/config.ts` | 🟡 Loose ends |
| I-10 | **HTTP middleware adivinha status codes de error names** | `src/server/routes/instance/httpapi/middleware/error.ts` | 🟡 HTTP-2 |
| I-11 | **507 linhas de pós-processamento OpenAPI em `public.ts`** | `src/server/routes/instance/httpapi/public.ts` | 🟡 P6 OA |
| I-12 | **13 TODO/HACK comentários espalhados** | tool, provider, agent, account, session, format, etc. | 🟡 Limpeza |
| I-13 | **Testes ainda usam patterns antigos (Effect.runPromise, ManagedRuntime)** | `test/` | 🟡 P1 TEST |

### Baixa Prioridade / Dívida Técnica

| # | Issue | Arquivos | Gravidade |
|---|-------|----------|-----------|
| I-14 | **Server package extraction (0% feito)** | `specs/effect/server-package.md` | 🟢 Longo prazo |
| I-15 | **Global paths mutáveis em vez de serviço Effect** | `core/src/global.ts` | 🟢 P3 GLOBAL |
| I-16 | **Data migration: apenas 1 migração registrada** | `src/data-migration.ts` | 🟢 Preventivo |
| I-17 | **v2 provider parity: 17 itens não portados** | `src/v2/provider-parity-checklist.md` | 🟢 V2 |
