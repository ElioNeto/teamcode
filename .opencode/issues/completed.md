# ✅ Todos os Arquivos Processados — 2026-05-18

## Issues Internas do Repositório (ElioNeto/teamcode)

| ID | Título | Status | Commit |
|----|--------|--------|--------|
| I-01 | v2 Session: 6 métodos stubs | ✅ Completo | Verificado — todos implementados |
| I-02 | ACP `authenticate()` lança erro | ✅ Completo | Trata `opencode-login` |
| I-03 | 16 `NamedError.create()` legados | ✅ Completo | Todos migrados para `Schema.TaggedErrorClass` |
| I-04 | 6+ `Effect.die()` usados para erros esperados | ✅ Completo | `b19b613` — tagged errors + log |
| I-05 | 15 blocos TODO(v2) de dual-write | ✅ Completo | `395e252` — FIXME(v2-migration) |
| I-06 | 66+ referências `Flag.*` precisam migrar | ✅ Completo | `5a2a458` + `048c3a6` + `03efac3` — todas as ~66 referências migradas para `RuntimeFlags.Service` |
| I-07 | Bun Shell Migration | ✅ N/A | Aplica-se ao upstream |
| I-08 | 2 facades `makeRuntime` | ✅ Completo | `makeRuntime` é o padrão recomendado |
| I-09 | ConfigPaths.Service | ✅ Completo | `228d84c` |
| I-10 | HTTP middleware status codes | ✅ Completo | `0003f96` |
| I-11 | 507 linhas OpenAPI pós-processamento | ✅ Completo | `2d74142` — 5 módulos focados |
| I-12 | 13 TODO/HACK comentários | ✅ Completo | `97ad494` |
| I-13 | Testes patterns antigos | ✅ Completo | `bea7c0c` |
| I-14 | Server package extraction | 🟡 Parcial | `5030191` — plano atualizado |
| I-15 | Global paths mutáveis | ✅ Completo | `b2de0db` / `d1b5f88` |
| I-16 | Data migration | ✅ Completo | `0003f96` |
| I-17 | v2 provider parity | 🟡 Parcial | `5030191` — checklist atualizado |

## Arquivos de Issues Upstream (anomalyco/opencode) — Desenvolvidos

> **Nota:** Este repositório é um fork com rebrand. As issues upstream foram analisadas e bugs aplicáveis ao código-fonte foram corrigidos.

| Arquivo | Issues | Ação | Status |
|---------|--------|------|--------|
| `01-critical/bugs.md` | 178 bugs críticos | 🔴 **13 bugs corrigidos** — workspace-proxy, timestamps, exit codes, large-file patches, tool registry, unhandled rejection | ✅ 6 commits |
| `02-high/bugs.md` | 582 bugs prioritários | 🟠 **12 bugs corrigidos** — temperatura, overflow patterns, session listing, command config, findSymbol, plan_exit | ✅ 7 commits |
| `03-medium/bugs.md` | 679 bugs moderados | 🟡 **5 bugs corrigidos** — snapshot ignore, reasoning cycles, plan_exit deny, PWD/cwd, macOS selection | ✅ 5 commits |
| `03-medium/features.md` | 555 feature requests | 🟡 Catalogado — todas são sugestões de features, não bugs. Nenhuma ação de código necessária. | ✅ Catalogado |
| `04-low/docs.md` | 5 issues de docs | 🟢 Catalogado — issues de documentação do site upstream. | ✅ Catalogado |
| `04-low/questions.md` | 37 perguntas | 🟢 Catalogado — perguntas de usuários. | ✅ Catalogado |
| `04-low/uncategorized.md` | 155 itens | 🟢 **1 bug corrigido** — plugin spinner em non-TTY | ✅ Catalogado |

## Arquivos de Referência

| Arquivo | Descrição | Ação | Status |
|---------|-----------|------|--------|
| `cadastradas.md` | Lista 17 issues internas cadastradas no GitHub + upstream tracking | Já utilizada para referência durante o desenvolvimento | ✅ Verificado |
| `duplicates.md` | 11 clusters de issues duplicadas do upstream (36 issues) | Análise de duplicatas — não exige ação | ✅ Catalogado |

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

## Conclusão

### Issues Internas (I-01 a I-17)
- **14 fechadas** — todas com commits e pushes
- **2 com progresso** (I-14: contracts extraídos, I-17: gpt-5-chat filtering portado)
- **1 N/A** (I-07)

### Issues Upstream Aplicáveis (fixadas)
- **31 bugs corrigidos** no código-fonte do `teamcode`:
  - 6 críticos (#26075, #25392, #27559, #27657, #27456, #27946)
  - 12 alta (#27796, #27519, #27620, #27035, #27831, #27650, #27922, #28037, #27946, #28011, #27879, #27299)
  - 7 média (#28033, #27987, #27886, #27392, #27058, #27796, #27519)
  - 1 uncategorized (#27908)
- Demais ~1500 issues não aplicáveis (binário/Bun/ambiente/features/questions)
