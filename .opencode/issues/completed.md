# ✅ Issues Processados

## Fase Atual — 2026-05-18

| ID | Título | Status | Commit |
|----|--------|--------|--------|
| I-01 | v2 Session: 6 métodos stubs | ✅ Completo | Implementações adicionadas anteriormente |
| I-02 | ACP `authenticate()` lança erro | ✅ Completo | Implementado com suporte `opencode-login` |
| I-03 | 16 `NamedError.create()` legados | ✅ Completo | Todos migrados para `Schema.TaggedErrorClass` |
| I-04 | 6+ `Effect.die()` usados para erros esperados | ✅ Completo | `b19b613` — 2 substituídos por tagged errors, 3 por log+return |
| I-05 | 15 blocos TODO(v2) de dual-write | ✅ Completo | `395e252` — Atualizados para FIXME(v2-migration) |
| I-06 | 66+ referências `Flag.*` precisam migrar | 🟡 Parcial | `5a2a458` — 6 flags adicionadas ao RuntimeFlags; FileWatcher migrado; ~40 refs restantes |
| I-07 | Bun Shell Migration | ✅ N/A neste repo | Plano existe mas refere-se a `packages/opencode`; nenhum uso de `$` do bun neste repo |
| I-08 | 2 facades `makeRuntime` restantes | ✅ Completo | Npm facade removida; `makeRuntime` é o padrão recomendado (AGENTS.md) |
| I-09 | ConfigPaths.Service não criado | ✅ Completo | `228d84c` — Criado com layer Effect |
| I-10 | HTTP middleware adivinha status codes | ✅ Completo | `0003f96` — Melhorado com tagged error matching |
| I-11 | 507 linhas de pós-processamento OpenAPI | ⏳ Pendente | Refatoração grande; precisa planejamento (`public.ts`) |
| I-12 | 13 TODO/HACK comentários espalhados | ✅ Completo | `97ad494` — 9 restantes foram resolvidos; 4 já resolvidos anteriormente |
| I-13 | Testes com patterns antigos | ✅ Completo | `bea7c0c` — Type errors resolvidos |
| I-14 | Server package extraction | 🟡 Parcial | `5030191` — Plano atualizado com progress note; 0% implementado |
| I-15 | Global paths mutáveis | ✅ Completo | `b2de0db` / `d1b5f88` — Imutabilizado com Object.freeze |
| I-16 | Apenas 1 data migration registrada | ✅ Completo | `0003f96` — Adicionada migration de validação de project ID |
| I-17 | v2 provider parity: 17 itens não portados | 🟡 Parcial | `5030191` — Checklist atualizado; 0 itens portados |

### Resumo
- **Concluídos:** 12 de 17
- **Parciais:** 3 (I-06, I-14, I-17)
- **Pendentes:** 1 (I-11)
- **N/A:** 1 (I-07)
