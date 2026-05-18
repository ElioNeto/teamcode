# 🚀 Issues Organizadas — anomalyco/opencode

> **Total:** 2.200 issues abertas | Extraído em 2026-05-18 | Fonte: [github.com/anomalyco/opencode/issues](https://github.com/anomalyco/opencode/issues) | Issues internas: [ElioNeto/teamcode/issues](https://github.com/ElioNeto/teamcode/issues)

---

## Estrutura de diretórios

```
.opencode/data/
├── 01-critical/       🔴   178 issues
│   └── bugs.md            Crashes, data loss, security
├── 02-high/           🟠   582 issues
│   └── bugs.md            Regressões, core broken
├── 03-medium/         🟡   1234 issues
│   ├── bugs.md            Bugs moderados
│   └── features.md        Pedidos de funcionalidade
├── 04-low/            🟢   206 issues
│   ├── bugs.md            Bugs de baixa prioridade
│   ├── questions.md       Perguntas da comunidade
│   ├── docs.md            Issues de documentação
│   ├── debt.md            Dívida técnica
│   └── uncategorized.md   Não categorizados
└── duplicates.md      🔄  11 clusters de duplicatas
```

## Por severidade

| Severidade | Total | % | Descrição |
|------------|-------|---|-----------|
| 🔴 Critical | 178 | 8.1% | Crashes, perda de dados, segurança |
| 🟠 High | 582 | 26.4% | Regressões, funcionalidades core quebradas |
| 🟡 Medium | 1234 | 56.1% | Bugs moderados + features |
| 🟢 Low | 206 | 9.4% | Questões, docs, débito técnico |

> ℹ️ Classificação automática por análise de título e descrição. Verifique `duplicates.md` para clusters de issues duplicadas.

---

## 🏗️ Dívida Técnica Interna (Código-Fonte)

Além das issues do GitHub, o código-fonte contém problemas estruturais encontrados por análise estática:

| ID | Issue | Prioridade | Arquivo |
|----|-------|------------|---------|
| I-01 | v2 Session stubs (6 métodos vazios) | 🔴 Crítica | `src/v2/session.ts` |
| I-02 | ACP authenticate() não implementado | 🔴 Crítica | `src/acp/agent.ts` |
| I-03 | 16 `NamedError.create()` legados | 🔴 Crítica | 8 arquivos |
| I-04 | 6+ `Effect.die()` para erros esperados | 🔴 Crítica | 4 arquivos |
| I-05 | 15 blocos TODO(v2) dual-write | 🟠 Alta | `session/prompt.ts`, `processor.ts` |
| I-06 | 66+ referências `Flag.*` | 🟠 Alta | 21+ arquivos |
| I-07 | Bun Shell Migration (0% feito) | 🟠 Alta | 17 arquivos |
| I-08 | 2 facades `makeRuntime` | 🟠 Alta | `tui.ts`, `npm/index.ts` |
| I-09 | ConfigPaths.Service não criado | 🟡 Média | `src/config/paths.ts` |
| I-10 | HTTP middleware adivinha status | 🟡 Média | `middleware/error.ts` |
| I-11 | 507 linhas shims OpenAPI | 🟡 Média | `public.ts` |
| I-12 | 13 TODO/HACK comentários | 🟡 Média | Multiplos |
| I-13 | Testes com patterns antigos | 🟡 Média | `test/` |
| I-14 | Server package extraction (0%) | 🟢 Baixa | `specs/` |
| I-15 | Global paths mutáveis | 🟢 Baixa | `core/global.ts` |
| I-16 | Só 1 data migration | 🟢 Baixa | `src/data-migration.ts` |
| I-17 | v2 provider parity (17 itens) | 🟢 Baixa | `src/v2/provider-parity-checklist.md` |

**Total: 17 issues internas** (4 críticas, 4 alta, 5 média, 4 baixa)

> 📋 Detalhes completos em `04-low/debt.md`, `../critical-status.md` e `../plan.md`.
