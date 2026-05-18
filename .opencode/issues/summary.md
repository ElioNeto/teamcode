# Issues — ElioNeto/teamcode

> Issues internas do repositório [ElioNeto/teamcode](https://github.com/ElioNeto/teamcode/issues)

---

## Estrutura

```
.opencode/issues/
└── 04-low/
    └── debt.md            Dívida técnica interna
```

---

## Dívida Técnica Interna

17 issues encontradas diretamente no código-fonte, cadastradas em [ElioNeto/teamcode/issues](https://github.com/ElioNeto/teamcode/issues):

| ID | Issue | Prioridade | Arquivo |
|----|-------|------------|---------|
| I-01 | v2 Session stubs (6 métodos vazios) | 🔴 Crítica | `packages/teamcode/src/v2/session.ts` |
| I-02 | ACP authenticate() não implementado | 🔴 Crítica | `packages/teamcode/src/acp/agent.ts` |
| I-03 | 16 `NamedError.create()` legados | 🔴 Crítica | 8 arquivos |
| I-04 | 6+ `Effect.die()` para erros esperados | 🔴 Crítica | 4 arquivos |
| I-05 | 15 blocos TODO(v2) dual-write | 🟠 Alta | `session/prompt.ts`, `processor.ts` |
| I-06 | 66+ referências `Flag.*` | 🟠 Alta | 21+ arquivos |
| I-07 | Bun Shell Migration (0% feito) | 🟠 Alta | 17 arquivos |
| I-08 | 2 facades `makeRuntime` | 🟠 Alta | `tui.ts`, `npm/index.ts` |
| I-09 | ConfigPaths.Service não criado | 🟡 Média | `packages/teamcode/src/config/paths.ts` |
| I-10 | HTTP middleware adivinha status | 🟡 Média | `middleware/error.ts` |
| I-11 | 507 linhas shims OpenAPI | 🟡 Média | `public.ts` |
| I-12 | 13 TODO/HACK comentários | 🟡 Média | Múltiplos |
| I-13 | Testes com patterns antigos | 🟡 Média | `test/` |
| I-14 | Server package extraction (0%) | 🟢 Baixa | `specs/` |
| I-15 | Global paths mutáveis | 🟢 Baixa | `core/global.ts` |
| I-16 | Só 1 data migration | 🟢 Baixa | `packages/teamcode/src/data-migration.ts` |
| I-17 | v2 provider parity (17 itens) | 🟢 Baixa | `packages/teamcode/src/v2/provider-parity-checklist.md` |

**Total: 17 issues internas** (4 críticas, 4 alta, 5 média, 4 baixa)
