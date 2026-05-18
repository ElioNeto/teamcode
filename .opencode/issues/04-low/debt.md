# 🔧 Dívida Técnica

> **Total:** 9 do GitHub + 9 internas | Extraído em 2026-05-17

---

## ⚙️ Dívida Técnica Interna (Código-Fonte)

Issues encontradas diretamente no código que representam débito técnico a ser pago.

### 🔴 Críticas

#### I-01 — v2 Session: 6 métodos são stubs vazios

**Arquivo:** `packages/teamcode/src/v2/session.ts` (linhas 170, 290, 292, 293, 329, 330)

`create()` retorna `{} as any`, `prompt()` retorna `{} as any`, `shell()` corpo vazio, `skill()` corpo vazio, `compact()` corpo vazio, `wait()` corpo vazio.

**Impacto:** Bloqueia o experimento de eventos v2. Sem esses métodos, o novo sistema de sessão não pode ser testado.

---

#### I-02 — ACP `authenticate()` lança "Authentication not implemented"

**Arquivo:** `packages/teamcode/src/acp/agent.ts:562`

O método `authenticate` do protocolo ACP simplesmente lança `throw new Error("Authentication not implemented")`.

**Impacto:** O ACP não pode ser usado em cenários que exigem autenticação.

---

#### I-03 — 16 `NamedError.create()` legados

**Arquivos:** 8 arquivos no pacote `teamcode`

Erros que usam `NamedError.create()` em vez de `Schema.TaggedErrorClass`:

| Erro | Arquivo | Linha |
|------|---------|-------|
| `SkillInvalidError` | `src/skill/index.ts` | 60 |
| `SkillNameMismatchError` | `src/skill/index.ts` | 66 |
| `MCPFailed` | `src/mcp/index.ts` | 67 |
| `NotFoundError` (database) | `src/storage/db.ts` | 20 |
| `MessageAbortedError` | `src/session/message-v2.ts` | 41 |
| `StructuredOutputError` | `src/session/message-v2.ts` | 42 |
| `APIError` | `src/session/message-v2.ts` | 46 |
| `ContextOverflowError` | `src/session/message-v2.ts` | 55 |
| `MessageOutputLengthError` | `src/session/message-error.ts` | 4 |
| `ProviderAuthError` | `src/session/message-error.ts` | 6 |
| `AlreadyInstalledError` | `src/ide/index.ts` | 26 |
| `InstallFailedError` | `src/ide/index.ts` | 28 |
| `ConfigJsonError` | `src/config/error.ts` | 14 |
| `ConfigInvalidError` | `src/config/error.ts` | 19 |
| `ConfigDirectoryTypoError` | `src/config/config.ts` | 358 |
| `ConfigFrontmatterError` | `src/config/markdown.ts` | 91 |

**Impacto:** Bloqueia a limpeza do error middleware HTTP e a renderização correta de erros (P0 no roadmap).

---

#### I-04 — 6+ `Effect.die()` usado para erros esperados

**Arquivos:** `src/snapshot/index.ts` (3x), `src/tool/webfetch.ts:92`, `src/tool/mcp-websearch.ts:92`, `src/session/prompt.ts:1072`

`Effect.die()` deve ser reservado para defects, mas está sendo usado para timeouts de rede, falhas de git, etc.

---

### 🟠 Alta

#### I-05 — 15 blocos TODO(v2) de dual-write temporário

**Arquivos:** `src/session/prompt.ts`, `src/session/processor.ts`

Todo o sistema de dual-write entre sessão legada e v2 é temporário, controlado por `flags.experimentalEventSystem`. Precisa ser removido quando a migração v2 for concluída.

---

#### I-06 — 66+ referências `Flag.*` precisam migrar

**Arquivos:** 21+ arquivos em `packages/teamcode/src/`

O módulo `Flag` legado deve ser substituído por `RuntimeFlags.Service`. ~66 referências ainda existem em CLI/TUI/config/observability.

**Spec:** `specs/effect/todo.md` (P2 RF)

---

#### I-07 — Bun Shell Migration (plano existe, 0% implementado)

**Arquivo:** `BUN_SHELL_MIGRATION_PLAN.md`

143 comandos `$` do Bun em 17 arquivos devem ser substituídos por uma API `Process`. Nenhuma das 5 fases foi iniciada.

---

#### I-08 — 2 facades `makeRuntime` restantes

**Arquivos:** `src/cli/cmd/tui/config/tui.ts:305` (TuiConfig), `src/npm/index.ts` (Npm)

Esses serviços ainda exportam `makeRuntime(...)` com facades async que deveriam ser substituídas por layers Effect.

**Spec:** `specs/effect/facades.md`

---

### 🟡 Média

#### I-09 — ConfigPaths.Service não criado

**Arquivo:** `src/config/paths.ts`

`src/config/config.ts` usa `Effect.promise(() => ConfigPaths.*(...))` em vez de `yield* paths.*(...)`.

**Spec:** `specs/effect/loose-ends.md`

---

#### I-10 — HTTP middleware adivinha status codes

**Arquivo:** `src/server/routes/instance/httpapi/middleware/error.ts`

O middleware usa heurística de nome de erro para determinar status HTTP. Deve encolher conforme mais erros de domínio viram `Schema.TaggedErrorClass`.

**Spec:** `specs/effect/error-boundaries-plan.md`

---

#### I-11 — 507 linhas de pós-processamento OpenAPI

**Arquivo:** `src/server/routes/instance/httpapi/public.ts`

Shims de compatibilidade que deveriam ser eliminados conforme schemas de fonte melhoram. Inclui `QueryParameterSchemas`, `PathParameterSchemas`, `normalizeLegacyErrorResponses`, `collapseDuplicateComponents`, etc.

**Spec:** `specs/effect/todo.md` (P6 OA)

---

#### I-12 — 13 TODO/HACK comentários

**Arquivos:** Múltiplos

| Arquivo | Linha | Comentário |
|---------|-------|------------|
| `src/tool/tool.ts` | 13 | `// TODO: remove this hack` |
| `src/provider/transform.ts` | 57 | `// TODO: fix this stupid inefficient dogshit function` |
| `src/provider/provider.ts` | 277 | `// TODO: Using process.env directly...` |
| `src/provider/provider.ts` | 523 | `// TODO: same process.env issue` |
| `src/server/.../cors-vary.ts` | 11 | `// TODO: upstream a fix...` |
| `src/account/account.ts` | 418 | `// TODO: When there are multiple orgs...` |
| `src/cli/cmd/github.ts` | 209 | `// TODO: add guide for copilot...` |
| `src/format/index.ts` | 146 | `// TODO combine formatters...` |
| `src/agent/agent.ts` | 394 | `// TODO: clean this up...` |
| `src/session/llm.ts` | 97 | `// TODO: move this to a proper hook` |
| `src/plugin/index.ts` | 224 | `// TODO: make proper events for this` |
| `src/session/session.ts` | 442 | `// TODO: update models.dev...` |
| `src/control-plane/workspace.ts` | 507 | `// TODO: look into tapError...` |

---

#### I-13 — Testes com patterns antigos

**Arquivo:** `test/` (múltiplos)

Muitos testes ainda usam `Effect.runPromise`, `ManagedRuntime`, `Promise.withResolvers`, `Bun.sleep` em vez dos patterns modernos (`testEffect`, `it.live`, `it.instance`).

**Spec:** `test/EFFECT_TEST_MIGRATION.md`

---

### 🟢 Baixa / Longo Prazo

#### I-14 — Server package extraction (plano existe, 0% feito)

**Spec:** `specs/effect/server-package.md`

Extrair `packages/server` com schemas de domínio puros e contratos HttpApi. Nenhum PR da sequência foi iniciado.

---

#### I-15 — Global paths mutáveis

**Arquivo:** `core/src/global.ts`

`Global.Path` usa estado mutável. Testes sobrescrevem exports. `Global.make()` ainda lê `Flag.OPENCODE_CONFIG_DIR`.

**Spec:** `specs/effect/todo.md` (P3 GLOBAL)

---

#### I-16 — Apenas 1 data migration registrada

**Arquivo:** `src/data-migration.ts`

O sistema de data migration é novo. Só 1 migração existe (`session_usage_from_messages`). Precisa ser mantido para mudanças futuras de schema.

---

#### I-17 — v2 provider parity: 17 itens não portados

**Arquivo:** `src/v2/provider-parity-checklist.md`

Dynamic models, model filtering (6 items), auth (6 items), config/plugin parity (5 items) — nenhum portado para o sistema v2.

---

## #27327 — OpenCode + Mini Max 2.5 is much slower last days

📅 `2026-05-13` | ✏️ **deusexec** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/27327](https://github.com/anomalyco/opencode/issues/27327)
 | 🏷️ `zen`


### Description

Something is happened last days, my OpenCode + MiniMax 2.5 is much slower now. I use Go subscription and my limits are okay. Yesterday I got a few errors something like servers are busy and they are under huge loads.

### Plugins

Don't use any plugins.

### OpenCode version

1.14.48

### Operating System

Ubuntu 24.04

### Terminal

Default Terminal

---

## #27106 — The latest version is terribly slow

📅 `2026-05-12` | ✏️ **hellocodelinux** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/27106](https://github.com/anomalyco/opencode/issues/27106)


### Question

What's up everyone? Honestly, I use OpenCode for everything and I'm currently creating an agent based on it.

But the latest version (1.14.48) is super slow—it's practically unusable.

Please fix this!

---

## #26263 — I'm experiencing extremely slow performance with OpenCode on Ubuntu.

📅 `2026-05-08` | ✏️ **bragaus** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26263](https://github.com/anomalyco/opencode/issues/26263)


### Question

I compared the exact same prompt/workflow between OpenCode and Claude Code under the same machine and environment conditions.

Results:

- OpenCode: ~34 minutes to complete
- Claude Code: ~10 seconds to complete

This performance gap is massive and makes OpenCode difficult to use productively.

### Environment

- OS: Ubuntu
- CPU: Intel Core i5
- GPU: NVIDIA RTX 3060
- RAM: 16GB
- Storage: 256GB NVMe M.2 SSD
- OpenCode version: 1.14.41

### Installation method

Installed using:

```bash
curl -fsSL https://opencode.ai/install | bash

---

## #25906 — refactor: remove unused DynamicDescription hack in tool.ts

📅 `2026-05-05` | ✏️ **srivenkateswaran6002** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25906](https://github.com/anomalyco/opencode/issues/25906)


### Description

The DynamicDescription type in tool.ts is marked with a TODO to be removed and is currently unused across the codebase. 

Location of the file : packages/opencode/src/tool/tool.ts

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

Not applicable.

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #24060 — test(opencode): prompt.test.ts flaky since #23710 — 3s timeout vs. SIGTERM→exit race

📅 `2026-04-23` | ✏️ **tesdal** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24060](https://github.com/anomalyco/opencode/issues/24060)


After #23710 consolidated session prompt tests into Effect style, `packages/opencode/test/session/prompt.test.ts` is consistently flaky on `dev`. Re-verified on current `origin/dev @ 3f8c65905`: still flaky in 3/3 consecutive runs. Also reproduced on earlier `origin/dev @ 88c5f6bb1` across 5/5 runs (3–11 failures out of 44 tests each).

## Two failure modes

Both in cancel / queued-caller tests:

### Signature A — `Exit.isSuccess(exit)` assertion fails

Stack frame through `src/effect/cross-spawn-spawner.ts:395 → child_process #handleOnExit`:

```
error: expect(received).toBe(expected)
Expected: true
Received: false
  at packages/opencode/test/session/prompt.test.ts:1296:42
  at packages/opencode/src/effect/cross-spawn-spawner.ts:395:21
  at emit (node:events:98:22)
  at #maybeClose (node:child_process:766:16)
  at #handleOnExit (node:child_process:520:72)
```

Representative failing tests: `cancel interrupts shell and resolves cleanly`, `cancel persists aborted shell result when shell ignores TERM`, `cancel finalizes interrupted bash tool output through normal truncation`.

### Signature B — `it.live(..., 3_000)` timeout with dangling process

```
(fail) cancel records MessageAbortedError on interrupted process [3008.28ms]
  ^ this test timed out after 3000ms.
killed 1 dangling process
```

The harness is still waiting for a SIGTERM'd `sleep 30` shell to emit its exit event when the 3s budget expires.

## Root cause

Both modes point at the same race: per-test timeouts were 

> *[Truncado — 3156 chars totais]*

---

## #24052 — TUI event listeners leak memory because they're never cleaned up

📅 `2026-04-23` | ✏️ **fernandoenzo** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24052](https://github.com/anomalyco/opencode/issues/24052)


### Description

`event.on()` and `event.subscribe()` calls in the TUI are never unsubscribed. Repeated session switches leave orphaned listeners and closures that the GC can't reclaim.

### Plugins

None

### OpenCode version

1.14.22

---

## #21834 — Using the llama3.2:latest is slow

📅 `2026-04-10` | ✏️ **66-firebat** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21834](https://github.com/anomalyco/opencode/issues/21834)


### Question

I am aware that running the llama3.2 model directly through ollama seems to produce a lot of "thinking" context, and when i use the model in opencode, this thought process, although hidden in the opencode output, seems to occupy a ton of time. Has anyone figured a way around this problem?

---

## #21750 — linter running even when specifically disabled

📅 `2026-04-09` | ✏️ **davidbernat** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21750](https://github.com/anomalyco/opencode/issues/21750)


### Description

not even going to bother to drop a stack trace or notes been over this at least a dozen times. v1.3.17
fixed the one-off by writing to a .txt and copying the code manually.
pickle continually commented as an authority without doing exasearches e.g. auth0.com != auth0
where even is the sdk and opencode serve solutions

---

## #21426 — The free model has been deprecated. Transition to qwen/qwen3.6-plus for continued paid access.

📅 `2026-04-08` | ✏️ **Tian-ruzhao** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21426](https://github.com/anomalyco/opencode/issues/21426)


### Question

为什么免费模型能选择qwen3.6-plus，但是运行时报错：The free model has been deprecated. Transition to qwen/qwen3.6-plus for continued paid access.

---
