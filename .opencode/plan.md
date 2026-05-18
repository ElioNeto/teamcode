# 🔴 Plano de Implementação — Issues Críticas

Total: 227 issues críticas | 10 alta prioridade para implementação

> ⚠️ 200/227 são específicas de plataforma (Windows/macOS/Linux/Docker/Desktop) e podem não se aplicar diretamente ao nosso fork.

---

## Prioridade Alta (implementação imediata)

### #27924 — bug(session): infinite compaction loop when compression fails to reduce context

**Área:** `session`

**Problema:** Infinite compaction loop when compression fails to reduce context

**Fix:** Add max iteration guard in compaction loop

**Status:** ⏳ Pendente

**URL:** [https://github.com/anomalyco/opencode/issues/27924](https://github.com/anomalyco/opencode/issues/27924)

---

### #27923 — bug(config): pluginAutoInstall config has no effect

**Área:** `config`

**Problema:** pluginAutoInstall config has no effect

**Fix:** Wire pluginAutoInstall config flag to plugin install behavior

**Status:** ⏳ Pendente

**URL:** [https://github.com/anomalyco/opencode/issues/27923](https://github.com/anomalyco/opencode/issues/27923)

---

### #27779 — acp/agent: prompt() silently swallows SDK errors — end_turn returned with no content on failure

**Área:** `acp`

**Problema:** acp/agent: prompt() silently swallows SDK errors

**Fix:** Propagate SDK errors instead of swallowing in end_turn

**Status:** ⏳ Pendente

**URL:** [https://github.com/anomalyco/opencode/issues/27779](https://github.com/anomalyco/opencode/issues/27779)

---

### #27724 — Agents have no awareness of MCPs that need auth

**Área:** `mcp`

**Problema:** Agents have no awareness of MCPs that need auth

**Fix:** Expose MCP auth status to agent prompt/system context

**Status:** ⏳ Pendente

**URL:** [https://github.com/anomalyco/opencode/issues/27724](https://github.com/anomalyco/opencode/issues/27724)

---

### #27663 — Bug: prompt_async stops publishing message.part.delta events on second call (conversation continuation)

**Área:** `session`

**Problema:** prompt_async stops publishing message.part.delta events on second call

**Fix:** Fix event subscription lifecycle for consecutive prompt_async calls

**Status:** ⏳ Pendente

**URL:** [https://github.com/anomalyco/opencode/issues/27663](https://github.com/anomalyco/opencode/issues/27663)

---

### #27629 — fix(provider): Z.AI GLM overflow error not classified as context overflow, causing chain compaction

**Área:** `provider`

**Problema:** Z.AI GLM overflow error not classified as context overflow

**Fix:** Add Z.AI GLM error pattern to context overflow detection

**Status:** ⏳ Pendente

**URL:** [https://github.com/anomalyco/opencode/issues/27629](https://github.com/anomalyco/opencode/issues/27629)

---

### #26177 — Run loop continues on orphaned interrupted tools, triggering "model does not support assistant message prefill" 400 errors

**Área:** `session`

**Problema:** Run loop continues on orphaned interrupted tools

**Fix:** Guard against orphaned tool state in session run loop

**Status:** ⏳ Pendente

**URL:** [https://github.com/anomalyco/opencode/issues/26177](https://github.com/anomalyco/opencode/issues/26177)

---

### #25421 — ACP agent_message_chunk frames land after end_turn RPC reply due to event-subscription / prompt-RPC race

**Área:** `acp`

**Problema:** ACP agent_message_chunk frames land after end_turn RPC reply

**Fix:** Ensure event subscription cleanup before end_turn resolves

**Status:** ⏳ Pendente

**URL:** [https://github.com/anomalyco/opencode/issues/25421](https://github.com/anomalyco/opencode/issues/25421)

---

### #21924 — [HIGH PRIORITY] AI reads files outside permitted directory

**Área:** `permission`

**Problema:** AI reads files outside permitted directory

**Fix:** Enforce permission boundary in file read tool

**Status:** ⏳ Pendente

**URL:** [https://github.com/anomalyco/opencode/issues/21924](https://github.com/anomalyco/opencode/issues/21924)

---

### #27844 — opentui: fatal: No renderer found

**Área:** `tui`

**Problema:** opentui: fatal: No renderer found

**Fix:** Add graceful fallback when TUI renderer is unavailable

**Status:** ⏳ Pendente

**URL:** [https://github.com/anomalyco/opencode/issues/27844](https://github.com/anomalyco/opencode/issues/27844)

---


---

## 🔴 Issues Internas (Código-Fonte — Não Trackeadas no GitHub)

Issues encontradas diretamente no código que precisam de implementação, organizadas por prioridade.

### Críticas (Devem ser implementadas agora)

#### I-01 — v2 Session stubs (create, prompt, shell, skill, compact, wait)

**Área:** `v2/session`

**Problema:** 6 métodos da v2 Session são stubs vazios que retornam `{} as any` ou têm corpo vazio

**Fix:** Implementar cada método:
- `create()` — criar sessão v2 com eventos
- `prompt()` — executar prompt no novo sistema de eventos
- `shell()` — executar shell no novo sistema
- `skill()` — executar skill
- `compact()` — compactar contexto
- `wait()` — aguardar conclusão

**Arquivo:** `src/v2/session.ts` (linhas 170, 290, 292, 293, 329, 330)

**Status:** ❌ Não iniciado

---

#### I-02 — ACP `authenticate()` não implementado

**Área:** `acp`

**Problema:** O método `authenticate` do protocolo ACP lança `throw new Error("Authentication not implemented")`

**Fix:** Implementar o fluxo de autenticação ACP conforme especificação do protocolo

**Arquivo:** `src/acp/agent.ts:562`

**Status:** ❌ Não iniciado

---

#### I-03 — 16 `NamedError.create()` precisam virar `Schema.TaggedErrorClass`

**Área:** `errors`

**Problema:** 16 erros legados usam `NamedError.create()` em vez de `Schema.TaggedErrorClass`, bloqueando a limpeza do error middleware HTTP

**Fix:** Converter cada um seguindo o padrão:
```ts
// Antes
export const MyError = NamedError.create("MyError", { message: Schema.String })
export const fail = (message: string) => Effect.fail(new MyError({ message }))

// Depois
export class MyError extends Schema.TaggedError<MyError>()("MyError", {
  message: Schema.String,
}) {}
```

**Arquivos afetados:**
- `src/skill/index.ts` — `SkillInvalidError`, `SkillNameMismatchError`
- `src/mcp/index.ts` — `MCPFailed`
- `src/storage/db.ts` — `NotFoundError`
- `src/session/message-v2.ts` — `MessageAbortedError`, `StructuredOutputError`, `APIError`, `ContextOverflowError`
- `src/session/message-error.ts` — `MessageOutputLengthError`, `ProviderAuthError`
- `src/ide/index.ts` — `AlreadyInstalledError`, `InstallFailedError`
- `src/config/error.ts` — `ConfigJsonError`, `ConfigInvalidError`
- `src/config/config.ts` — `ConfigDirectoryTypoError`
- `src/config/markdown.ts` — `ConfigFrontmatterError`

**Status:** ❌ Não iniciado (ERR-4 no roadmap Effect)

---

#### I-04 — `Effect.die()` usado para erros esperados

**Área:** `errors`

**Problema:** 6+ chamadas de `Effect.die()` tratam erros previsíveis (timeout, falha de git, etc.) como defects, quando deveriam usar o error channel

**Fix:** Substituir `Effect.die(...)` por `yield* new SpecificError(...)` para cada caso

**Arquivos:**
- `src/snapshot/index.ts` (3x) — `read-tree`, `checkout-index`, `checkout`
- `src/tool/webfetch.ts:92` — timeout como die
- `src/tool/mcp-websearch.ts:92` — timeout como die
- `src/session/prompt.ts:1072` — erro esperado como die

**Status:** ❌ Não iniciado

---

### Alta Prioridade

#### I-05 — 15 blocos TODO(v2) dual-write temporário

**Área:** `session`

**Problema:** Todo o sistema de dual-write (escrever em old + v2 simultaneamente) é temporário e precisa ser removido quando a migração v2 for concluída

**Arquivos:** `src/session/prompt.ts`, `src/session/processor.ts`

**Status:** ⏳ Aguardando maturação do v2

---

#### I-06 — 66+ referências `Flag.*` precisam migrar para `RuntimeFlags.Service`

**Área:** `flags`

**Problema:** O módulo `Flag` legado ainda é importado em 21+ arquivos. O roadmap (P2) pede eliminação completa

**Fix:** Migrar cada chamada para `RuntimeFlags.Service` e deletar `flag.ts` + `test/fixture/flag.ts`

**Status:** ⏳ Parcialmente feito (6+ flags já migradas), 66+ referências restantes

---

#### I-07 — Bun Shell Migration (0% implementado)

**Área:** `process`

**Problema:** 143 comandos `$` do Bun em 17 arquivos deveriam ser substituídos por API `Process`. Nenhuma fase foi iniciada

**Fix:** Seguir o plano em `BUN_SHELL_MIGRATION_PLAN.md`:
- Fase 0: Process wrappers + testes
- Fase 1: High-impact hotspots (github.ts 33, worktree 22, lsp 21, installation 20, snapshot 18)
- Fase 2: Git-heavy restantes
- Fase 3: Não-git (clipboard, archive, ripgrep, bash tool)
- Fase 4: Estabilizar, remover wrappers mortos

**Status:** ❌ Não iniciado

---

#### I-08 — 2 facades `makeRuntime` restantes

**Área:** `runtime`

**Problema:** `TuiConfig` e `Npm` ainda exportam `makeRuntime(...)` com facades async

**Arquivos:** `src/cli/cmd/tui/config/tui.ts:305`, `src/npm/index.ts`

**Status:** ❌ Não iniciado

---

### Média Prioridade

#### I-09 — ConfigPaths.Service não criado

**Área:** `config`

**Problema:** `src/config/paths.ts` não tem um serviço Effect. `src/config/config.ts` usa `Effect.promise(() => ConfigPaths.*(...))` em vez de `yield* paths.*(...)`

**Spec:** `specs/effect/loose-ends.md`

**Status:** ❌ Não iniciado

#### I-10 — HTTP middleware adivinha status codes

**Área:** `server`

**Problema:** `middleware/error.ts` ainda usa heurística de nome de erro para determinar status HTTP. Deve encolher conforme erros viram `Schema.TaggedErrorClass`

**Spec:** `specs/effect/error-boundaries-plan.md`, `specs/effect/todo.md` (HTTP-2)

**Status:** ❌ Não iniciado

#### I-11 — OpenAPI compatibility shims (507 linhas)

**Área:** `server`

**Problema:** `public.ts` tem 507 linhas de pós-processamento OpenAPI que deveriam ser eliminados conforme schemas de fonte melhoram

**Spec:** `specs/effect/todo.md` (P6 OA), `specs/openapi-translation-cleanup.md`

**Status:** ❌ Não iniciado

#### I-12 — 13 TODO/HACK comentários espalhados

**Área:** `general`

**Problema:** Comentários marcando código que precisa de refatoração: provider/transform.ts ("stupid inefficient dogshit function"), tool/tool.ts ("remove this hack"), agent/agent.ts ("clean up provider specific logic"), etc.

**Status:** ❌ Não iniciado

#### I-13 — Testes com patterns antigos

**Área:** `test`

**Problema:** Muitos testes ainda usam `Effect.runPromise`, `ManagedRuntime`, `Promise.withResolvers`, `Bun.sleep` em vez dos patterns Effect modernos

**Spec:** `test/EFFECT_TEST_MIGRATION.md`

**Status:** ⏳ Em andamento (migração conforme arquivos são tocados)

---

### Baixa Prioridade / Longo Prazo

#### I-14 — Server package extraction (0% feito)

**Área:** `server`

**Problema:** Plano para extrair `packages/server` existe mas nenhum PR foi iniciado. Schemas de domínio e contratos HttpApi puros ainda não foram separados

**Spec:** `specs/effect/server-package.md`

**Status:** ❌ Não iniciado

#### I-15 — Global paths mutáveis

**Área:** `core`

**Problema:** `Global.Path` usa estado mutável em vez de serviço Effect. Testes sobrescrevem exports do módulo. `Global.make()` ainda lê `Flag.OPENCODE_CONFIG_DIR`

**Spec:** `specs/effect/todo.md` (P3 GLOBAL)

**Status:** ❌ Não iniciado

#### I-16 — Apenas 1 data migration registrada

**Área:** `storage`

**Problema:** `src/data-migration.ts` tem só 1 migração (`session_usage_from_messages`). O tracker `data_migration` foi adicionado recentemente. Pode ser necessário para mudanças futuras de schema

**Status:** ✅ Vigilante

#### I-17 — v2 provider parity: 17 itens não portados

**Área:** `v2`

**Problema:** O checklist em `src/v2/provider-parity-checklist.md` lista 17 comportamentos de provider legado que ainda não foram portados para plugins v2: dynamic models, model filtering (6), auth (6), config/plugin parity (5)

**Status:** ❌ Não iniciado

---

## Anexo: Todas as 227 Issues Críticas por Categoria
