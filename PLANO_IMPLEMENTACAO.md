# Plano de Implementação e Publicação

## Fases

### ~~Fase 1 — Limpeza de upstream (rename fallout)~~ ✅
Issues pequenas, baixo risco, execução paralela.

| # | Descrição | Esforço | Status |
|---|-----------|---------|--------|
| [#1091](https://github.com/ElioNeto/teamcode/issues/1091) | Corrigir env var duplicada no provider opencode | 5min | ✅ |
| [#1092](https://github.com/ElioNeto/teamcode/issues/1092) | Renomear `OPENCODE_API_KEY` → `TEAMCODE_API_KEY` no fixture | 5min | ✅ |
| [#1097](https://github.com/ElioNeto/teamcode/issues/1097) | Renomear `opencode.status` → `teamcode.status` (3 arquivos) | 5min | ✅ |

**Commit:** `e7a60fd` — `fix: Phase 1 — cleanup remaining opencode branding references`

---

### ~~Fase 2 — Renomeio de artefatos (sem quebra funcional)~~ ✅
Afeta builds, extensões e armazenamento local.

| # | Descrição | Status |
|---|-----------|--------|
| [#1096](https://github.com/ElioNeto/teamcode/issues/1096) | Nomes de binários desktop | ✅ |
| [#1093](https://github.com/ElioNeto/teamcode/issues/1093) | localStorage keys prefix | ✅ |
| [#1094](https://github.com/ElioNeto/teamcode/issues/1094) | Comandos VSCode extension | ✅ |

**Commit:** `4f9bcf7` — `fix: Phase 2 — rename desktop artifacts, localStorage, vscode commands`

**#1094 (VSCode):** 3 comandos em `extension.ts` — `opencode.*` → `teamcode.*`
**#1093 (localStorage):** prefixos `opencode.*` → `teamcode.*` em persist.ts + language.tsx + entry.tsx
**#1096 (binários):** 7 arquivos + 2 renames (flatpak yml, icon png) — todos `opencode-desktop-*` → `teamcode-desktop-*`

---

### Fase 3 — Testes
| # | Descrição | Esforço | Depende |
|---|-----------|---------|---------|
| [#1095](https://github.com/ElioNeto/teamcode/issues/1095) | Atualizar origens `app.opencode.ai` nos testes de CORS e UI proxy | 30min | — |

**Entrega:** PR único `fix: update stale test origins`

---

### Fase 4 — Arquitetura (interfaces)
| # | Descrição | Esforço | Depende |
|---|-----------|---------|---------|
| [#1098](https://github.com/ElioNeto/teamcode/issues/1098) | Extrair interfaces públicas para Config, Agent, Skill, Plugin | 2-3 dias | Nenhuma |

Esta fase é a mais complexa. Sugiro dividir em sub-PRs:
1. **Agent** — extrair `Agent` interface pura (sem Effect Services), mover implementação concreta para `agent-effect.ts`
2. **Config** — separar `ConfigStore` (leitura/merge/watch) do parser e schema
3. **Skill** — extrair contrato de `Skill` (descoberta, carga, execução)
4. **Plugin** — exportar tipos públicos que plugins possam implementar sem depender de internos do runtime

**Critério de aceitação:** um plugin consegue importar `@teamcode-ai/core/agent` e implementar um agente customizado sem importar nenhum módulo de runtime interno.

---

### Fase 5 — DB / ApexStore (já em andamento no repo)
Issues [#1079](https://github.com/ElioNeto/teamcode/issues/1079) a [#1090](https://github.com/ElioNeto/teamcode/issues/1090) tratam da migração de SQLite para ApexStore. Já têm plano próprio. Seguir conforme priorização existente:
- `phase:p1-high` → faz agora
- `phase:p2-medium` → depois das fases 1-4
- `phase:p3-low` → futuro

---

### Fase 6 — v2 Parity
Issues [#1017](https://github.com/ElioNeto/teamcode/issues/1017), [#1018](https://github.com/ElioNeto/teamcode/issues/1018), [#1019](https://github.com/ElioNeto/teamcode/issues/1019) já têm labels `phase:p1-high` e `DOR`. Seguir como estão.

---

### ~~Fase 7 — Matriz de dependências mínimas entre pacotes~~ ✅
| # | Status |
|---|--------|
| [#1099](https://github.com/ElioNeto/teamcode/issues/1099) | ✅ |

Criado `scripts/dep-matrix.ts` com a matriz de compatibilidade e integrado ao `script/publish.ts`:

| Sub-entrega | Status |
|-------------|--------|
| Mapear grafo de dependências entre pacotes publicáveis | ✅ `dep-matrix.ts` lista todas as arestas |
| `validatePkg()` — validação que rejeita `workspace:*` sem entrada na matrix | ✅ |
| `resolveWorkspaceDeps()` — substitui `workspace:*` pelo range semântico mínimo | ✅ |
| `withResolvedDeps()` no publish.ts — patch/restore durante publicação | ✅ |
| CLI `bun scripts/dep-matrix.ts` — valida todos os 14 pacotes | ✅ |

**Commit:** `8d6146e` — `feat: Phase 7 — inter-package dependency compatibility matrix`

---

## Estratégia de Publicação

### O que é publicado hoje

| Pacote | Local | Versão atual |
|--------|-------|-------------|
| CLI (binários) | `packages/teamcode` → 12 binários platforma | [`teamcode-{os}-{arch}`] |
| `@teamcode-ai/sdk` | `packages/sdk/js` | 1.x |
| `@teamcode-ai/plugin` | `packages/plugin` | 1.x |
| `@teamcode-ai/teamcode` | meta-package npm | 1.x |
| VSCode extension | `sdks/vscode` | segue versão do CLI |

### Gatilho

`.github/workflows/publish.yml` — dispara em:
1. Push de tag `v*` (ex: `v1.3.0`)
2. Workflow dispatch manual com `version` override

### Pipeline atual

```
Tag v* → build CLI (12 binários) → publish npm packages → publish VSCode extension
                                                              └── continue-on-error
```

Cada pacote só publica se houve mudança no diretório desde a última tag (`git diff prevTag..HEAD --name-only -- pkgDir`).
**Requisito:** antes de publicar, o script valida que nenhum pacote contém `workspace:*` — todo workspace reference deve ser substituído pelo range semântico mínimo correspondente (ex: `>=2.1.0`).

### Recomendações

1. **Versionamento semântico** — já usa `vMAJOR.MINOR.PATCH`. Manter.
2. **CHANGELOG** — o `gh release create --generate-notes` já gera release notes. Se quiser algo mais estruturado, criar `script/changelog.ts` que agrupa commits por tipo (feat, fix, chore).
3. **Pré-release** — usar `TEAMWARE_CHANNEL=beta` ou `next` para publicar versões de teste sem afetar `latest`.
4. **Fases 1-3** podem ser publicadas como `patch` (sem quebra).
5. **Fase 4** (interfaces) merece `minor` — não quebra API pública, mas muda organização interna.
6. **Fase 5** (ApexStore) merece `major` se mudar o formato de armazenamento — avaliar migração automática.

### Sequência sugerida para próxima publicação

```
1. Merge PRs das Fases 1-3
2. git tag v1.3.1 && git push origin v1.3.1
3. GitHub Action publica automaticamente
4. Fase 4 (interfaces) em paralelo → v1.4.0
5. Fase 5 (ApexStore) → v2.0.0 (se breaking) ou v1.5.0 (se compatível)
```

---

## Resumo visual

```
Fase 1 (5 min) ─┐
Fase 2 (2 h) ───┤── v1.3.1 (patch)
Fase 3 (30 min) ─┘
                     │
Fase 4 (2-3 d) ──────→ v1.4.0 (minor)
                     │
Fase 5 (ApexStore) ──→ v1.5.0 ou v2.0.0
                     │
Fase 6 (v2 parity) ──→ em paralelo com Fase 5
```
