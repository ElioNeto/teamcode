# Changelog do Fork — TeamCode

> **Fork de:** [anomalyco/opencode](https://github.com/anomalyco/opencode)
> **Data do fork:** ~2026-05-17
> **Repositório:** [ElioNeto/teamcode](https://github.com/ElioNeto/teamcode)
> **Branch padrão:** `dev`

## Sumário

Este documento registra todas as modificações, correções e melhorias implementadas no TeamCode desde o fork do OpenCode, organizadas por áreas funcionais.

---

## 1. Rebranding e Renomeação

| Item | Descrição | Commit |
|------|-----------|--------|
| Renomeação completa | OPENCODE → TEAMCODE em todo o código-base (138 arquivos, 208 alterações) | `8318a98` |
| Renomeação adicional | Substituição total de referências OPENCODE remanescentes (nomes de pacotes, escopos npm, caminhos, etc.) | `2ca79fe`, `9ea5e06` |

**Substituições realizadas:**
- `OpenCode` → `TeamCode` (nome do produto)
- `opencode-ai` → `teamcode-ai` (pacote npm)
- `@opencode-ai` → `@teamcode-ai` (escopo npm)
- `opencode.json(c)` → `teamcode.json(c)` (arquivo de configuração)
- `packages/opencode/` → `packages/teamcode/` (caminhos de código)
- `opencode` (lowercase, standalone) → `teamcode` (comando CLI)

---

## 2. Issues Internas (I-01 a I-17)

### 2.1 Concluídas (14/17)

| ID | Título | Commits |
|----|--------|---------|
| I-01 | v2 Session: 6 métodos stubs | Verificado |
| I-02 | ACP `authenticate()` lança erro | Trata `opencode-login` |
| I-03 | 16 `NamedError.create()` legados migrados para `Schema.TaggedErrorClass` | — |
| I-04 | 6+ `Effect.die()` para erros esperados → tagged errors | `b19b613` |
| I-05 | 15 blocos TODO(v2) de dual-write resolvidos | `395e252` |
| I-06 | 66+ referências `Flag.*` migradas para `RuntimeFlags.Service` | `5a2a458`, `048c3a6`, `03efac3` |
| I-07 | Bun Shell Migration — Process API implementada (Process.run, .text, .lines, .spawn, .stop) | `b8c816f` |
| I-08 | 2 facades `makeRuntime` padronizadas | — |
| I-09 | ConfigPaths.Service criado | `228d84c` |
| I-10 | HTTP middleware status codes fixados | `0003f96` |
| I-11 | 507 linhas OpenAPI pós-processamento refatoradas em 5 módulos focados | `2d74142` |
| I-12 | 13 TODO/HACK comentários resolvidos | `97ad494` |
| I-13 | Testes migrados de patterns antigos (Effect.runPromise, ManagedRuntime) | `bea7c0c` |
| I-15 | Global paths mutáveis corrigidos | `b2de0db` / `d1b5f88` |
| I-16 | Data migration registrada | `0003f96` |

### 2.2 Em Progresso (2/17)

| ID | Título | Status | Detalhes |
|----|--------|--------|----------|
| I-14 | Server package extraction | 🟢 ~85% | `packages/server` criado com EventApi, HealthContract, WorkspaceRoutingQuery, ServerErrors, ServerQuery, ServerMetadata. Pendente em [#1020](https://github.com/ElioNeto/teamcode/issues/1020) |
| I-17 | v2 provider parity | 🟢 74% (39/53) | Setup/Options/Request/ModelFiltering/DefaultModels concluídos. Pendente: Auth [#1017](https://github.com/ElioNeto/teamcode/issues/1017), Config/Plugin [#1018](https://github.com/ElioNeto/teamcode/issues/1018), GitLab models [#1019](https://github.com/ElioNeto/teamcode/issues/1019) |

---

## 3. Correções de Bugs do Upstream

**Total: 77 bugs corrigidos** do repositório upstream anomalyco/opencode.

### Sessão 2026-05-19 — 46 novos bugs

#### Batch 1 (`daed6d9`) — 16 bugs
| Issue | Descrição |
|-------|-----------|
| #28037 | Plugin permission replies dropped — memoMap compartilhado |
| #27946 | `[MaxDepth]` placeholders → `{}` em tool schemas |
| #27831 | Subagent description markdown sobrescrita — merge corrigido |
| #27902 | kimi-for-coding 429 — User-Agent KimiCLI/1.5 |
| #27922 | TUI ESC não cancela sessão — bypass dialog.stack |
| #28033 | Snapshot ignore() silencia erros — log + empty set |
| #27987 | Reasoning cycles fragmentados — reset lastReasoningPart |
| #26642 | Binários sem extensão — magic-byte fallback |
| #27392 | PWD estaleiado — process.cwd() |
| #28052 | Subagent allow sobrescrito por deny — merge reordenado |
| #27931 | Static assets sem Cache-Control — headers adicionados |
| #27968 | Paste badge invisível — foreground fixo |
| #26709 | Duplicate skill warning falso — early return |
| #26603 | ACP tool_call_update title — part.tool |
| #26815 | tmux OSC-52 — DCS passthrough corrigido |
| #27923 | pluginAutoInstall sem efeito — flag checada |

#### Batch 2 (`4dde2ef`) — 4 bugs
| Issue | Descrição |
|-------|-----------|
| #26852 | Stale env var bloqueia lock file — probe de conectividade |
| #25918 | tool.execute.after nunca invocado — trigger adicionado |
| #24447 | TaskTool resultado vazio — metadados no result |
| #26855 | run --format json sem step_finish — pendingSteps tracker |

#### Batch 3 (`bcb10f5`) — 14 bugs
| Issue | Descrição |
|-------|-----------|
| #26106 | image_url content type sem suporte — schema adicionado |
| #26156 | Kimi/Moonshot annotations crash — campo optional |
| #27645 | ACP session model ignorado — fallback session.model |
| #27620 | Child sessions invisíveis — removido roots:true |
| #27528 | ACP slash cmd não reconhecido — fallthrough p/ texto |
| #27283 | Remote workspace 503 sem retry — retry loop 5x |
| #27286 | Session list filtrada silenciosamente — indicador visual |
| #28063 | /compact Next Steps obsoletos — reconciliação adicionada |
| #27052 | Desktop CORS private network — header adicionado |
| #27284 | Workspace errors engolidos — log propagado |
| #26766 | Legacy TUI keys quebram config — normalizeLoadedConfig |
| #26460 | Prompt caching excluía openai-compatible — guard removido |
| #26780 | Ollama imagens descartadas — inferImageCapability |
| #27532 | generate.txt commentary errado — texto corrigido |

### Sessões Anteriores — 31 bugs
- **6 críticos:** #26075, #25392, #27559, #27657, #27456
- **12 alta:** #27796, #27519, #27620, #27035, #27831, #27650, #27922, #28011, #27879, #27299
- **7 média:** #28033, #27987, #27886, #27392, #27058
- **1 uncategorized:** #27908

---

## 4. Avanços Recentes (20-22/05/2026)

### 4.1 Novos Recursos

#### Swarm Roles (Papéis Especializados)
Implementação de papéis de agente especializados como subagentes internos:
- **Planner** — Decompõe tarefas complexas em etapas estruturadas
- **Researcher** — Explora e investiga o código-base
- **Executor** — Implementa mudanças no código
- **Reviewer** — Revisa qualidade e consistência do código

**Commits:** `d4d1b60`, `852d555`, `c54599a`

#### Modo Caveman
Interface completa para modo caveman com:
- Comandos TUI dedicados
- Badges de status visual
- Templates para operações swarm
- Compressão de aprovação

**Commits:** `77778a0`, `c54599a`

#### Process API Aprimorada
Novos wrappers para operações de sistema:
- `Process.status` — verificação de status de processos
- `Process.shell` — execução shell padronizada
- `Process.git` — operações git wrapper
- `Process.gitText` — saída git em texto

**Commit:** `b8c816f`

#### Melhoria na Qualidade dos Testes
- Redução de 158 para 12 falhas (99.6% de taxa de aprovação)
- Correções em CORS, SDK, schema-drift, plugin-loader
- Correções de problemas de rename OPENCODE→TEAMCODE

**Commits:** `f3aa1fc`, `9953652`, `9ea5e06`

### 4.2 Correções e Melhorias

| Área | Descrição | Commit |
|------|-----------|--------|
| Shell | Preservação de quebras de linha em comandos multi-linha colados | `93d55b0` |
| Shell | Suporte a timeout -1 para espera infinita | `29fcfed` |
| TUI | DialogPrompt sempre envia no Enter básico | `b5dcb09` |
| TUI | Interrupção imediata da geração com Esc | `18df967` |
| TUI | Toggle do painel Git com Ctrl+G | `18df967` |
| Session | /undo agora reverte entradas de lista de tarefas | `0e336d6` |
| Provider | Anexos não suportados descartados silenciosamente | `c59c8e9` |
| UI | Botão de atualização na aba de conteúdo de arquivo | `c373bf1` |
| UI | Preservação de colchetes angulares em streaming markdown | `28e432b` |
| Resolver | Uso de POST para criação de comentários no GitHub | `bd2cc5c` |
| Publish | Cópia do README.md para o dist do pacote npm | `225e65b` |
| Core | Aplicação estrita de limites de diretório de projeto | `1ffda61` |

---

## 5. Adaptação de Issues Upstream

### Issues Adaptadas
- **~1.513 bugs/features** do upstream anomalyco/opencode foram adaptados para o escopo TeamCode
- Substituições de referências: OpenCode→TeamCode, opencode-ai→teamcode-ai, etc.
- URLs de issues originais preservadas para referência

### Itens Movidos para Fora do Escopo
- **129 itens** movidos para `not-planned.md`:
  - 37 perguntas de suporte de usuários
  - 5 issues de documentação do site upstream
  - 87 itens classificados como perguntas/suporte de usuários

### FAQ
- **FAQ criado** com 124 perguntas frequentes respondidas com base na análise do código-fonte

---

## 6. Estrutura Atual do Projeto

```
teamcode/
├── packages/
│   ├── server/          ← Extraído (I-14)
│   └── teamcode/        ← Código principal (renomeado de opencode)
├── specs/               ← Especificações
├── sdks/                ← SDKs
├── infra/               ← Infraestrutura
├── scripts/             ← Scripts de automação
├── .github/             ← GitHub Actions / templates
├── .opencode/           ← Configuração do opencode
│   ├── agents/          ← Agentes personalizados
│   ├── skills/          ← Skills
│   └── ...
└── FORK-CHANGELOG.md    ← Este documento
```

---

## 7. Commits por Categoria

### Infraestrutura e Configuração
| Commit | Descrição |
|--------|-----------|
| `8318a98` | Rebrand: opencode → teamcode (138 arquivos) |
| `6d234e1` | Fix type errors (config.ts, server.ts) |
| `8fe7368` | Fix type errors (middleware combine) |
| `a12e456` | Wire RuntimeFlags/InstanceLayer layers |

### Funcionalidades
| Commit | Descrição |
|--------|-----------|
| `c5b623f` | Add gpt-5-chat-latest model filtering |
| `3e71d66` | Extract EventApi e WorkspaceRoutingQuery para packages/server |
| `d4d1b60` | Add swarm roles ao schema de agente |
| `852d555` | Register swarm roles como subagentes internos |
| `c54599a` | Create specialized agent roles |
| `77778a0` | Caveman complete mode |
| `b8c816f` | Add status, shell, git, gitText wrappers |
| `c373bf1` | Add refresh button to file tab content |
| `0e968b7` | Wire Observability.layer + export ModelFilteringPlugin |

### Correções
| Commit | Descrição |
|--------|-----------|
| `2401b6a` | Fix TUI log leaks |
| `daed6d9` | 16 bugs fixados (permissões, schemas, TUI, etc.) |
| `4dde2ef` | 4 bugs fixados (editor probe, plugin hook, etc.) |
| `bcb10f5` | 14 bugs fixados (image_url, ACP, sessions, etc.) |
| `312062e` | 12 bugs fixados (init, SSE, proxy, etc.) |
| `93d55b0` | Preserve newlines in pasted shell commands |
| `b5dcb09` | DialogPrompt fix |
| `0e336d6` | /undo reverts Todo entries |
| `18df967` | Esc interrupts, Ctrl+G Git toggle |
| `c59c8e9` | Drop unsupported attachments silently |
| `28e432b` | Preserve angle brackets in markdown |
| `bd2cc5c` | Use POST for GitHub comments |
| `225e65b` | Copy README.md to npm dist |
| `1ffda61` | Strict project directory boundary |

### Testes
| Commit | Descrição |
|--------|-----------|
| `f3aa1fc` | 158→12 falhas (99.6% pass rate) |
| `9ea5e06` | Fix broken tests (rename issues) |
| `9953652` | Fix CORS, SDK, schema-drift, plugin-loader tests |

---

## 8. Status Geral

| Métrica | Valor |
|---------|-------|
| Issues internas concluídas | 14/17 |
| Issues internas em progresso | 2/17 (I-14, I-17) |
| Bugs upstream corrigidos | 77 |
| Issues upstream adaptadas | ~1.513 |
| FAQ gerado | 124 perguntas |
| Taxa de aprovação de testes | 99.6% |
| Commits desde o fork | ~50+ |

---

*Documento gerado em 2026-05-22. Atualizações conforme novo progresso.*
