# 🔧 Dívida Técnica — ElioNeto/teamcode

> **Total:** 17 issues internas | Cadastradas em [github.com/ElioNeto/teamcode/issues](https://github.com/ElioNeto/teamcode/issues)

---

### 🔴 Críticas

#### I-01 — v2 Session: 6 métodos são stubs vazios

**GitHub:** [#11](https://github.com/ElioNeto/teamcode/issues/11)
**Arquivo:** `packages/teamcode/src/v2/session.ts` (linhas 170, 290, 292, 293, 329, 330)

`create()` retorna `{} as any`, `prompt()` retorna `{} as any`, `shell()` corpo vazio, `skill()` corpo vazio, `compact()` corpo vazio, `wait()` corpo vazio.

**Impacto:** Bloqueia o experimento de eventos v2. Sem esses métodos, o novo sistema de sessão não pode ser testado.

---

#### I-02 — ACP `authenticate()` lança "Authentication not implemented"

**GitHub:** [#12](https://github.com/ElioNeto/teamcode/issues/12)
**Arquivo:** `packages/teamcode/src/acp/agent.ts:562`

O método `authenticate` do protocolo ACP simplesmente lança `throw new Error("Authentication not implemented")`.

**Impacto:** O ACP não pode ser usado em cenários que exigem autenticação.

---

#### I-03 — 16 `NamedError.create()` legados

**GitHub:** [#13](https://github.com/ElioNeto/teamcode/issues/13)
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

**Impacto:** Bloqueia a limpeza do error middleware HTTP e a renderização correta de erros.

---

#### I-04 — 6+ `Effect.die()` usado para erros esperados

**GitHub:** [#14](https://github.com/ElioNeto/teamcode/issues/14)
**Arquivos:** `src/snapshot/index.ts` (3x), `src/tool/webfetch.ts:92`, `src/tool/mcp-websearch.ts:92`, `src/session/prompt.ts:1072`

`Effect.die()` deve ser reservado para defects, mas está sendo usado para timeouts de rede, falhas de git, etc.

---

### 🟠 Alta

#### I-05 — 15 blocos TODO(v2) de dual-write temporário

**GitHub:** [#15](https://github.com/ElioNeto/teamcode/issues/15)
**Arquivos:** `src/session/prompt.ts`, `src/session/processor.ts`

Todo o sistema de dual-write entre sessão legada e v2 é temporário, controlado por `flags.experimentalEventSystem`. Precisa ser removido quando a migração v2 for concluída.

---

#### I-06 — 66+ referências `Flag.*` precisam migrar

**GitHub:** [#16](https://github.com/ElioNeto/teamcode/issues/16)
**Arquivos:** 21+ arquivos em `packages/teamcode/src/`

O módulo `Flag` legado deve ser substituído por `RuntimeFlags.Service`. ~66 referências ainda existem em CLI/TUI/config/observability.

---

#### I-07 — Bun Shell Migration (plano existe, 0% implementado)

**GitHub:** [#17](https://github.com/ElioNeto/teamcode/issues/17)
**Arquivo:** `BUN_SHELL_MIGRATION_PLAN.md`

143 comandos `$` do Bun em 17 arquivos devem ser substituídos por uma API `Process`. Nenhuma das 5 fases foi iniciada.

---

#### I-08 — 2 facades `makeRuntime` restantes

**GitHub:** [#18](https://github.com/ElioNeto/teamcode/issues/18)
**Arquivos:** `src/cli/cmd/tui/config/tui.ts:305` (TuiConfig), `src/npm/index.ts` (Npm)

Esses serviços ainda exportam `makeRuntime(...)` com facades async que deveriam ser substituídas por layers Effect.

---

### 🟡 Média

#### I-09 — ConfigPaths.Service não criado

**GitHub:** [#19](https://github.com/ElioNeto/teamcode/issues/19)
**Arquivo:** `packages/teamcode/src/config/paths.ts`

`src/config/config.ts` usa `Effect.promise(() => ConfigPaths.*(...))` em vez de `yield* paths.*(...)`.

---

#### I-10 — HTTP middleware adivinha status codes

**GitHub:** [#20](https://github.com/ElioNeto/teamcode/issues/20)
**Arquivo:** `src/server/routes/instance/httpapi/middleware/error.ts`

O middleware usa heurística de nome de erro para determinar status HTTP.

---

#### I-11 — 507 linhas de pós-processamento OpenAPI

**GitHub:** [#21](https://github.com/ElioNeto/teamcode/issues/21)
**Arquivo:** `src/server/routes/instance/httpapi/public.ts`

Shims de compatibilidade que deveriam ser eliminados conforme schemas de fonte melhoram.

---

#### I-12 — 13 TODO/HACK comentários

**GitHub:** [#22](https://github.com/ElioNeto/teamcode/issues/22)
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

**GitHub:** [#23](https://github.com/ElioNeto/teamcode/issues/23)
**Arquivo:** `test/` (múltiplos)

Muitos testes ainda usam `Effect.runPromise`, `ManagedRuntime`, `Promise.withResolvers`, `Bun.sleep` em vez dos patterns modernos (`testEffect`, `it.live`, `it.instance`).

---

### 🟢 Baixa / Longo Prazo

#### I-14 — Server package extraction (plano existe, 0% feito)

**GitHub:** [#24](https://github.com/ElioNeto/teamcode/issues/24)

Extrair `packages/server` com schemas de domínio puros e contratos HttpApi. Nenhum PR da sequência foi iniciado.

---

#### I-15 — Global paths mutáveis

**GitHub:** [#25](https://github.com/ElioNeto/teamcode/issues/25)
**Arquivo:** `core/src/global.ts`

`Global.Path` usa estado mutável. Testes sobrescrevem exports. `Global.make()` ainda lê `Flag.OPENCODE_CONFIG_DIR`.

---

#### I-16 — Apenas 1 data migration registrada

**GitHub:** [#26](https://github.com/ElioNeto/teamcode/issues/26)
**Arquivo:** `packages/teamcode/src/data-migration.ts`

O sistema de data migration é novo. Só 1 migração existe (`session_usage_from_messages`).

---

#### I-17 — v2 provider parity: 17 itens não portados

**GitHub:** [#27](https://github.com/ElioNeto/teamcode/issues/27)
**Arquivo:** `packages/teamcode/src/v2/provider-parity-checklist.md`

Dynamic models, model filtering (6 items), auth (6 items), config/plugin parity (5 items) — nenhum portado para o sistema v2.
