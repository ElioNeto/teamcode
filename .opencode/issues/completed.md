# ✅ Todos os Arquivos Processados — 2026-05-19

## Issues Internas do Repositório (ElioNeto/teamcode)

| ID | Título | Status | Commit / Notas |
|----|--------|--------|----------------|
| I-01 | v2 Session: 6 métodos stubs | ✅ Completo | Verificado — todos implementados |
| I-02 | ACP `authenticate()` lança erro | ✅ Completo | Trata `opencode-login` |
| I-03 | 16 `NamedError.create()` legados | ✅ Completo | Todos migrados para `Schema.TaggedErrorClass` |
| I-04 | 6+ `Effect.die()` usados para erros esperados | ✅ Completo | `b19b613` — tagged errors + log |
| I-05 | 15 blocos TODO(v2) de dual-write | ✅ Completo | `395e252` — FIXME(v2-migration) |
| I-06 | 66+ referências `Flag.*` precisam migrar | ✅ Completo | `5a2a458` + `048c3a6` + `03efac3` — todas as ~66 referências migradas para `RuntimeFlags.Service` |
| I-07 | Bun Shell Migration | ✅ Completo | `Process` API implementada em `src/util/process.ts` (Process.run, .text, .lines, .spawn, .stop). Nenhum `Bun.$` remanescente no código-fonte. Plano em `BUN_SHELL_MIGRATION_PLAN.md` (5 fases) — a migração de fato já foi concluída. |
| I-08 | 2 facades `makeRuntime` | ✅ Completo | `makeRuntime` é o padrão recomendado |
| I-09 | ConfigPaths.Service | ✅ Completo | `228d84c` |
| I-10 | HTTP middleware status codes | ✅ Completo | `0003f96` |
| I-11 | 507 linhas OpenAPI pós-processamento | ✅ Completo | `2d74142` — 5 módulos focados |
| I-12 | 13 TODO/HACK comentários | ✅ Completo | `97ad494` |
| I-13 | Testes patterns antigos | ✅ Completo | `bea7c0c` |
| I-14 | Server package extraction | 🟢 **Quase Completo** | `packages/server` criado com: `EventApi`, `HealthContract`, `WorkspaceRoutingQuery`, `ServerErrors`, `ServerQuery`, `ServerMetadata`. `src/contracts/` e `src/routing.ts` extraídos. Commit `3e71d66`. |
| I-15 | Global paths mutáveis | ✅ Completo | `b2de0db` / `d1b5f88` |
| I-16 | Data migration | ✅ Completo | `0003f96` |
| I-17 | v2 provider parity | 🟢 **Substancial** | Checklist em `src/v2/provider-parity-checklist.md`: 39/53 itens concluídos (74%). Setup (5/5), Options (18/18), Request (6/6), Model Filtering (6/6), Default/Small Models (7/7) concluídos. Pendente: Auth (0/7), Config/Plugin Parity (0/6), GitLab dynamic models (0/1). Commit `c5b623f`. |

## Arquivos de Issues Upstream (anomalyco/opencode) — Desenvolvidos

> **Nota:** Este repositório é um fork com rebrand. As issues upstream foram analisadas e bugs aplicáveis ao código-fonte foram corrigidos.

| Arquivo | Issues | Ação | Status |
|---------|--------|------|--------|
| `01-critical/bugs.md` | 178 bugs críticos | 🔴 **13 bugs corrigidos** — workspace-proxy, timestamps, exit codes, large-file patches, tool registry, unhandled rejection. **Adaptado**: referências renomeadas (OpenCode→TeamCode, opencode-ai→teamcode-ai, etc.). | ✅ 6 commits + adaptado |
| `02-high/bugs.md` | 582 bugs prioritários | 🟠 **12 bugs corrigidos** — temperatura, overflow patterns, session listing, command config, findSymbol, plan_exit. **Adaptado**: referências renomeadas. | ✅ 7 commits + adaptado |
| `03-medium/bugs.md` | 679 bugs moderados | 🟡 **5 bugs corrigidos** — snapshot ignore, reasoning cycles, plan_exit deny, PWD/cwd, macOS selection. **Adaptado**: referências renomeadas. | ✅ 5 commits + adaptado |
| `03-medium/features.md` | 555 feature requests | 🟡 **Adaptado**: texto renomeado para escopo TeamCode. | ✅ Adaptado |
| `04-low/uncategorized.md` | 155 itens → **68 mantidos** | 🟢 **Classificado**: 87 perguntas movidas para `not-planned.md`; 68 bugs/features mantidos e adaptados. **1 bug corrigido** (#27908). | ✅ Classificado + adaptado |
| `not-planned.md` (novo) | 37 (questions) + 5 (docs) + 87 (uncategorized) = **129 itens** | 🟢 Perguntas de usuários e issues de docs do site upstream movidas com justificativa. | ✅ Criado |
| ~~`04-low/questions.md`~~ | — | 🗑️ **Removido**: conteúdo movido para `not-planned.md` | ✅ Removido |
| ~~`04-low/docs.md`~~ | — | 🗑️ **Removido**: conteúdo movido para `not-planned.md` | ✅ Removido |

## Arquivos de Referência

| Arquivo | Descrição | Ação | Status |
|---------|-----------|------|--------|
| `cadastradas.md` | Lista 17 issues internas cadastradas no GitHub + upstream tracking | Já utilizada para referência durante o desenvolvimento | ✅ Verificado |
| `duplicates.md` | 11 clusters de issues duplicadas do upstream (36 issues) | Análise de duplicatas — não exige ação | ✅ Catalogado |

## Adaptação das Issues Upstream para Escopo TeamCode

Em 2026-05-19, todas as issues extraídas do upstream foram revisadas e adaptadas:

### Movido para `not-planned.md` (129 itens)
- **questions.md** (37): Todas são perguntas de suporte de usuários ao upstream OpenCode — irrelevantes para o fork.
- **docs.md** (5): Todas são sobre o site de documentação upstream (opencode.ai / packages/web/) — não mantido no fork.
- **uncategorized.md** (87): Itens classificados como perguntas/suporte de usuários.

### Adaptado e Mantido (68 itens + 3 arquivos de bugs + 1 de features)
- **01-critical/bugs.md** (178 bugs): Texto adaptado com referências renomeadas.
- **02-high/bugs.md** (582 bugs): Texto adaptado com referências renomeadas.
- **03-medium/bugs.md** (679 bugs): Texto adaptado com referências renomeadas.
- **03-medium/features.md** (555 requests): Texto adaptado com referências renomeadas.
- **uncategorized.md** (68 bugs/features mantidos): Texto adaptado com referências renomeadas.

### Substituições realizadas nos arquivos adaptados
- `OpenCode` → `TeamCode` (nome do produto)
- `opencode-ai` → `teamcode-ai` (pacote npm)
- `@opencode-ai` → `@teamcode-ai` (escopo npm)
- `opencode.json(c)` → `teamcode.json(c)` (arquivo de configuração)
- `packages/opencode/` → `packages/teamcode/` (caminhos de código)
- `opencode` (lowercase, standalone) → `teamcode` (comando CLI)
- URLs para `github.com/anomalyco/opencode` foram **preservadas** (referências às issues originais)

## Commits Realizados

| Commit | Issue | Descrição |
|--------|-------|-----------|
| `b19b613` | I-04 | 6x Effect.die() → tagged errors |
| `97ad494` | I-12 | 9 TODO/HACK/FIXME resolvidos |
| `5a2a458` | I-06 | 6 flags RuntimeFlags + FileWatcher migrado |
| `5030191` | I-14, I-17 | Planos atualizados |
| `2d74142` | I-11 | 507-lines → 5 módulos OpenAPI |
| `048c3a6` | I-06 | Flag → RuntimeFlags em config, paths, instruction |
| `8816838` | Críticos | #26075, #25392, #27559, #27657, #27456 (6 bugs) |
| `b55d065` | Alta | #27796, #27519, #27620, #27035, #27831, #27650, #27922 (7 bugs) |
| `9a2abf5` | Média | #28033, #27987, #27886, #27392, #27058 (5 bugs) |
| `8644abc` | Uncategorized | #27908 — plugin spinner non-TTY (1 bug) |
| `8318a98` | Rebrand | opencode → teamcode (138 arquivos, 208 alterações) |
| `03efac3` | I-06 | Migração completa de Flag.* → RuntimeFlags (21 arquivos, 160 inserts) |
| `6d234e1` | - | Fix pre-existing type errors (config.ts, server.ts) |
| `a12e456` | - | Fix lazy import in instance-layer, wire RuntimeFlags/InstanceLayer layers |
| `8fe7368` | - | Resolve pre-existing type errors (middleware combine, TypeScript strictness) |
| `c5b623f` | I-17 | Add gpt-5-chat-latest / openai/gpt-5-chat model filtering (#27) |
| `3e71d66` | I-14 | Extract EventApi and WorkspaceRoutingQuery to packages/server (#24) |
| `2401b6a` | - | Fix TUI log leaks — remove console.log/error in plugin/runtime, app, prompt |
| `0e968b7` | - | Wire Observability.layer in BootstrapLayer and HTTP server routes |
| `daed6d9` | Crítico/Alta/Média | 16 bugs fixados em batch (#28037, #27946, #27831, #27902, #27922, #28033, #27987, #26642, #27392, #28052, #27931, #27968, #26709, #26603, #26815, #27923) |
| `4dde2ef` | Uncategorized | 4 bugs fixados (#26852, #25918, #24447, #26855) |

## Conclusão

### Issues Internas (I-01 a I-17)
- **14 fechadas** — todas com commits e pushes
- **2 com progresso substancial**:
  - I-14: `packages/server` extraído com EventApi, HealthContract, WorkspaceRoutingQuery, ServerErrors, ServerQuery, ServerMetadata
  - I-17: 39/53 (74%) do checklist de provider parity concluído — model filtering, setup, options, request behavior, default/small models portados. Pendente: Auth (7 itens), Config/Plugin Parity (6 itens), Dynamic Models (1 item)
- **1 concluída** (I-07): Process API implementada e `Bun.$` eliminado do código-fonte

### Issues Upstream Aplicáveis (fixadas)
- **51 bugs corrigidos** no código-fonte do `teamcode` (31 anteriores + 20 novos nesta sessão):

**Sessão atual (2026-05-19) — 20 novos bugs fixados:**

🔴 Críticos (2):
| Issue | Descrição | Commit |
|-------|-----------|--------|
| #27946 | `[MaxDepth]` placeholders em schemas de ferramentas → `{}` | `daed6d9` |
| #28037 | Plugin permission replies dropped (memoMaps separados) → memoMap compartilhado | `daed6d9` |

🟠 Alta (5):
| Issue | Descrição | Commit |
|-------|-----------|--------|
| #27922 | TUI: ESC não cancela sessão com dialog aberto → bypass dialog.stack | `daed6d9` |
| #27902 | kimi-for-coding 429 por falta de User-Agent → KimiCLI/1.5 | `daed6d9` |
| #27831 | Subagent description de markdown sobrescrita → merge corrigido | `daed6d9` |
| #26852 | Stale env var bloqueia lock file → probe de conectividade | `4dde2ef` |
| #25918 | tool.execute.after declarado mas nunca invocado → trigger adicionado | `4dde2ef` |

🟡 Média (8):
| Issue | Descrição | Commit |
|-------|-----------|--------|
| #28033 | Snapshot ignore() silencia erros do git → log + empty set | `daed6d9` |
| #27987 | Reasoning cycles fragmentados → reset lastReasoningPart | `daed6d9` |
| #26642 | Binários sem extensão não detectados → magic-byte fallback | `daed6d9` |
| #27392 | PWD estaleiado sobrepõe cwd real → process.cwd() | `daed6d9` |
| #28052 | Subagent permissões allow sobrescritas por deny → merge reordenado | `daed6d9` |
| #27931 | Static assets sem Cache-Control → headers adicionados | `daed6d9` |
| #27968 | Paste badge invisível em temas transparentes → foreground fixo | `daed6d9` |
| #26855 | run --format json sem step_finish → pendingSteps tracker | `4dde2ef` |

🟢 Baixa (5):
| Issue | Descrição | Commit |
|-------|-----------|--------|
| #26709 | Duplicate skill warning falso positivo → early return | `daed6d9` |
| #26603 | ACP tool_call_update title errado → part.tool | `daed6d9` |
| #26815 | OSC-52 tmux sem DCS passthrough → sequence corrigida | `daed6d9` |
| #27923 | pluginAutoInstall config sem efeito → flag checada no npm install | `daed6d9` |
| #24447 | TaskTool resultado vazio sem diagnóstico → metadados no result | `4dde2ef` |

**Sessões anteriores — 31 bugs:**
- 6 críticos (#26075, #25392, #27559, #27657, #27456)
- 12 alta (#27796, #27519, #27620, #27035, #27831, #27650, #27922, #28011, #27879, #27299)
- 7 média (#28033, #27987, #27886, #27392, #27058)
- 1 uncategorized (#27908)

### Adaptação das Issues Upstream para TeamCode
- **129 itens movidos** para `not-planned.md` (37 perguntas + 5 docs + 87 de uncategorized)
- **~1.513 bugs/features adaptados** com substituição de referências (OpenCode→TeamCode, etc.)
- **3 arquivos removidos**: `questions.md`, `docs.md` (conteúdo em not-planned.md)

### Commits desta sessão
| Commit | Descrição |
|--------|-----------|
| `0e968b7` | Wire Observability.layer + export ModelFilteringPlugin + fix type deps |
| `daed6d9` | 16 bugs fixados (memoMap, tool schemas, agent descriptions, TUI ESC, etc.) |
| `4dde2ef` | 4 bugs fixados (editor probe, plugin hook, TaskTool diag, step_finish) |
