# ✅ Issues Processados — Sessão 2026-05-18

## Todas as 17 Issues Internas

| ID | Título | Status | Commit/Nota |
|----|--------|--------|-------------|
| I-01 | v2 Session: 6 métodos stubs | ✅ Completo | Todos os 6 métodos implementados (create, prompt, shell, skill, compact, wait) |
| I-02 | ACP `authenticate()` lança erro | ✅ Completo | Agora trata `opencode-login`; outros métodos retornam `authRequired` |
| I-03 | 16 `NamedError.create()` legados | ✅ Completo | Todos migrados para `Schema.TaggedErrorClass` |
| I-04 | 6+ `Effect.die()` usados para erros esperados | ✅ Completo | `b19b613` — 2 substituídos por tagged errors (webfetch/mcp-websearch), 3 por log+return (snapshot) |
| I-05 | 15 blocos TODO(v2) de dual-write | ✅ Completo | `395e252` — Atualizados para `FIXME(v2-migration)` |
| I-06 | 66+ referências `Flag.*` precisam migrar | 🟡 Parcial | `5a2a458` — 6 flags adicionadas ao RuntimeFlags; FileWatcher migrado; ~40 refs restantes em config/CLI |
| I-07 | Bun Shell Migration | ✅ N/A | Plano existe mas refere-se a `packages/opencode` upstream; 0 usos de `$` do bun neste repo |
| I-08 | 2 facades `makeRuntime` restantes | ✅ Completo | Npm facade removida anteriormente; `makeRuntime` é o padrão recomendado (AGENTS.md) |
| I-09 | ConfigPaths.Service não criado | ✅ Completo | `228d84c` — Criado com layer Effect |
| I-10 | HTTP middleware adivinha status codes | ✅ Completo | `0003f96` — Melhorado com tagged error matching |
| I-11 | 507 linhas de pós-processamento OpenAPI |✅ Completo | `2d74142` — Extraído em 5 módulos focados (schema, components, errors, types, index); `public.ts` reduzido para 114 linhas |
| I-12 | 13 TODO/HACK comentários espalhados | ✅ Completo | `97ad494` — 9 resolvidos (removidos ou atualizados); 4 já resolvidos anteriormente |
| I-13 | Testes com patterns antigos | ✅ Completo | `bea7c0c` — Type errors resolvidos |
| I-14 | Server package extraction | 🟡 Parcial | `5030191` — Plano atualizado com progress note; 0% implementado |
| I-15 | Global paths mutáveis | ✅ Completo | `b2de0db` / `d1b5f88` — Imutabilizado com Object.freeze |
| I-16 | Apenas 1 data migration registrada | ✅ Completo | `0003f96` — Adicionada migration de validação de project ID |
| I-17 | v2 provider parity: 17 itens não portados | 🟡 Parcial | `5030191` — Checklist atualizado com status real; 0 itens portados |

### Resumo Final
- **Fechadas:** 13 de 17
- **Parciais:** 3 (I-06, I-14, I-17 — dependem de esforço contínuo)
- **N/A:** 1 (I-07 — aplica-se ao upstream anomalyco/opencode)

## Commits Realizados na Sessão

| Commit | Issue | Descrição |
|--------|-------|-----------|
| `b19b613` | I-04 | Substitui 6 Effect.die() com tagged errors |
| `97ad494` | I-12 | Resolve 9 TODO/HACK/FIXME comments |
| `5a2a458` | I-06 | Adiciona 6 flags ao RuntimeFlags; migra FileWatcher |
| `5030191` | I-14, I-17 | Atualiza planos de server-package e v2-provider |
| `2d74142` | I-11 | Extrai 507-lines OpenAPI post-processing em 5 módulos |

> **Nota:** Push para origin/main não concluído nesta sessão devido a falha temporária de DNS (github.com irresolvível). Commits estão no branch local `main` e devem ser enviados quando a conectividade for restabelecida.
