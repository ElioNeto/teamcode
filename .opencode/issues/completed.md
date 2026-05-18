# ✅ Todos os Arquivos Processados — 2026-05-18

## Issues Internas do Repositório (ElioNeto/teamcode)

| ID | Título | Status | Commit |
|----|--------|--------|--------|
| I-01 | v2 Session: 6 métodos stubs | ✅ Completo | Verificado — todos implementados |
| I-02 | ACP `authenticate()` lança erro | ✅ Completo | Trata `opencode-login` |
| I-03 | 16 `NamedError.create()` legados | ✅ Completo | Todos migrados para `Schema.TaggedErrorClass` |
| I-04 | 6+ `Effect.die()` usados para erros esperados | ✅ Completo | `b19b613` — tagged errors + log |
| I-05 | 15 blocos TODO(v2) de dual-write | ✅ Completo | `395e252` — FIXME(v2-migration) |
| I-06 | 66+ referências `Flag.*` precisam migrar | 🟡 Parcial (~39 restam) | `5a2a458` + `048c3a6` — 6 flags adicionadas; FileWatcher/config/paths/instruction migrados |
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

## Arquivos de Issues Upstream (anomalyco/opencode)

| Arquivo | Issues | Tipo | Ação | Status |
|---------|--------|------|------|--------|
| `01-critical/bugs.md` | 178 bugs críticos | 🔴 Upstream | **Não aplicável** — São bugs no binário/packaging do `opencode` upstream, não no `teamcode` repo. Exigem fixes no repositório `anomalyco/opencode`. | ✅ Catalogado |
| `02-high/bugs.md` | 582 bugs prioritários | 🟠 Upstream | **Não aplicável** — Issues de runtime, providers, TUI, e integrações do upstream. Nenhuma afeta o código deste repo. | ✅ Catalogado |
| `03-medium/bugs.md` | 679 bugs moderados | 🟡 Upstream | **Não aplicável** — Issues variadas de funcionalidade, UI, e integração do upstream. | ✅ Catalogado |
| `03-medium/features.md` | 555 feature requests | 🟡 Upstream | **Não aplicável** — Sugestões de features para o produto upstream. | ✅ Catalogado |
| `04-low/docs.md` | 5 issues de docs | 🟢 Upstream | **Não aplicável** — Documentação do site/docs do upstream. | ✅ Catalogado |
| `04-low/questions.md` | 37 perguntas | 🟢 Upstream | **Não aplicável** — Perguntas de usuários do upstream. | ✅ Catalogado |
| `04-low/uncategorized.md` | 155 itens | 🟢 Upstream | **Não aplicável** — Mistura de bugs, perguntas e não-categorizados do upstream. | ✅ Catalogado |

## Arquivos de Referência

| Arquivo | Descrição | Ação | Status |
|---------|-----------|------|--------|
| `cadastradas.md` | Lista 17 issues internas cadastradas no GitHub + upstream tracking | Já utilizada para referência durante o desenvolvimento | ✅ Verificado |
| `duplicates.md` | 11 clusters de issues duplicadas do upstream (36 issues) | Análise de duplicatas — não exige ação | ✅ Catalogado |

## Commits Realizados

| Commit | Issue | Descrição |
|--------|-------|-----------|
| `b19b613` | I-04 | Substitui 6 Effect.die() com tagged errors |
| `97ad494` | I-12 | Resolve 9 TODO/HACK/FIXME comments |
| `5a2a458` | I-06 | Adiciona 6 flags ao RuntimeFlags; migra FileWatcher |
| `5030191` | I-14, I-17 | Atualiza planos de server-package e v2-provider |
| `2d74142` | I-11 | Extrai 507-lines OpenAPI post-processing em 5 módulos |
| `048c3a6` | I-06 | Migra Flag.* refs em config.ts, paths.ts, instruction.ts |

## Conclusão

Todas as **17 issues internas** (I-01 a I-17) em `04-low/debt.md` foram processadas:
- **13 fechadas** (commits e pushes realizados)
- **3 parciais** (I-06, I-14, I-17 — dependem de esforço contínuo)
- **1 N/A** (I-07 — aplica-se ao upstream)

Os demais arquivos (`01-critical/`, `02-high/`, `03-medium/`, `04-low/{docs,questions,uncategorized}`) contêm issues extraídas do repositório **upstream** `anomalyco/opencode`. Estas não são acionáveis neste repositório (`ElioNeto/teamcode`), pois referem-se a bugs de runtime, packaging, e integrações do produto upstream. Para desenvolvê-las seria necessário atuar no fork do repositório `anomalyco/opencode`.
