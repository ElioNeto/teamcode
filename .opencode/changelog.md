# TeamCode — Changelog de Implementação

> **Período:** Maio 2026 (atualizado em 2026-05-18)
> **Total de issues corrigidas:** 46 bugs + 10 features/issues de arquitetura

---

## Features & Arquitetura

### Swarm Orchestrator
- Módulo `packages/opencode/src/swarm/` com orchestrator, types, events, templates, approval
- Orquestração paralela e sequencial de agentes via `Session.Service`
- 5 templates: `code-review`, `feature`, `bug-fix`, `explore`, `codegen`
- Human-in-the-loop: checkpoints preflight, interstage, pre-PR

### Agent Roles
- 4 agentes especializados em `.opencode/agents/`: Planner, Researcher, Executor, Reviewer
- Cada role com system prompt próprio e permissões granulares

### Modo Sandbox
- `packages/opencode/src/sandbox/index.ts` — isolamento via git worktree
- 48 Permission.Rules de segurança (rm, sudo, docker, chmod bloqueados)

### Shared Memory
- `packages/opencode/src/memory/index.ts` — in-memory KV store com tags e busca glob
- Integrado ao bus de eventos do swarm

### Observabilidade
- `packages/opencode/src/observability/index.ts` — métricas de swarm, sandbox, sessões
- Subscriptions automáticas via bus events

### Dashboard UI Web
- `packages/app/src/pages/dashboard.tsx` (252 linhas)
- Stats Cards, Recent Projects, Recent Sessions
- Rota `/dashboard`

### GitHub Workflows
- `.github/` reconstruído: 2 actions, 15 workflows, 5 templates
- Fix: input names `opencode-app-id/secret` → `teamcode-app-id/secret`

---

## Bugs Corrigidos (43)

### Lote 1 — Infraestrutura (commit `c620260`)

#### #27688 — Snapshot cwd mismatch
**Arquivo:** `packages/opencode/src/snapshot/index.ts`
**Problema:** Git commands no snapshot module usavam `state.directory` (subdiretório) como cwd, mas o `--work-tree` apontava para `state.worktree` (raiz do repo). Em projetos abertos de um subdiretório, `git diff-files` e `git ls-files` retornavam resultados inconsistentes.
**Fix:** Todos os 11 comandos git no snapshot module passaram a usar `state.worktree` como cwd, mantendo consistência com `--work-tree`.

#### #24357 — .watchman-cookie-* aciona VCS diff
**Arquivo:** `packages/opencode/src/file/ignore.ts`
**Problema:** Arquivos `.watchman-cookie-*` (criados pelo Watchman file watcher) não estavam na lista de exclusão, fazendo com que aparecessem como mudanças não-tracked no diff do VCS.
**Fix:** Adicionado `**/.watchman-cookie-*` ao array `FILES` de padrões de ignore.

#### #27638 — Circular symlink ENAMETOOLONG
**Arquivo:** `packages/opencode/src/skill/index.ts`
**Problema:** O scanner de skills usava `symlink: true` no `Glob.scan()`, fazendo com que symlinks circulares em diretórios de skills externos causassem travessia infinita e erro `ENAMETOOLONG` no runtime Bun.
**Fix:** Alterado para `symlink: false` na função `scan()` do módulo de skills.

#### #23519 — Subagent permissions ignoram agent denies
**Arquivo:** `packages/opencode/src/agent/subagent-permissions.ts`
**Problema:** `deriveSubagentSessionPermission()` só filtrava `rule.permission === "edit"` das regras deny do agente pai. Outras regras deny do agente (como deny de comandos específicos ou diretórios) eram silenciosamente ignoradas por subagentes.
**Fix:** Removido o filtro de tipo de permissão — agora todas as regras `action === "deny"` do agente pai são forwardadas para o subagente.

#### #24414 — MCP JSON parse error
**Arquivo:** `packages/opencode/src/session/message-v2.ts`
**Problema:** A função `toModelOutput()` esperava que tool results do MCP tivessem formato `{ text: string, attachments?: [] }`, mas o MCP SDK retorna `CallToolResult` com `{ content: [{type, text, data, mimeType}] }`. O `outputObject.text` resultava em `undefined`, perdendo o conteúdo da ferramenta.
**Fix:** Adicionado handler que extrai o array `content` do `CallToolResult`, mapeia cada entrada pelo tipo (`text` → string, `data` → attachment), e como fallback usa `JSON.stringify`.

---

### Lote 2 — Session & Processor (commit `3aa0ad8`)

#### #22808 — Dangling tool_calls 400 error
**Arquivo:** `packages/opencode/src/session/prompt.ts`
**Problema:** Quando tool calls eram interrompidas (ex.: usuário cancela), partes de ferramenta com status `pending`/`running` permaneciam no array de mensagens. Na próxima iteração do loop, o modelo recebia blocos `tool_use` sem `tool_result` correspondente, causando erro 400 em providers Anthropic.
**Fix:** Adicionado cleanup antes da saída do loop que converte tool parts `pending`/`running` para estado `error`-interrupted, prevenindo blocos órfãos.

#### #21908 — PDF sem suporte ignorado
**Arquivo:** `packages/opencode/src/provider/transform.ts`
**Problema:** Em `unsupportedParts()`, quando `part.mediaType` era `undefined` (arquivos sem tipo MIME explícito), o acesso `mime.startsWith(...)` falhava silenciosamente, permitindo que PDFs e outros formatos não-suportados chegassem ao modelo sem validação.
**Fix:** Adicionado `?? ""` fallback para `part.mediaType` antes da verificação de modalidade.

#### #24972 — Glob quebrado com broken symlinks
**Arquivos:** `config/command.ts`, `config/agent.ts`, `config/plugin.ts`, `tool/registry.ts`
**Problema:** Quatro scanners de configuração usavam `symlink: true` no `Glob.scan()`. Quando encontravam symlinks quebrados (target inexistente), o glob retornava zero resultados silenciosamente, fazendo com que comandos, agentes e plugins registrados não fossem descobertos.
**Fix:** Alterado para `symlink: false` em todos os 4 scanners. Symlinks quebrados agora são incluídos como entradas próprias (não seguidas).

#### #25953 — Edit tool corrompe indentação Python
**Arquivo:** `packages/opencode/src/tool/edit.ts`
**Problema:** Os fuzzy replacers (`WhitespaceNormalizedReplacer`, `IndentationFlexibleReplacer`, `TrimmedBoundaryReplacer`, `ContextAwareReplacer`) podiam fazer matching parcial em arquivos Python, corrompendo a indentação significativa.
**Fix:** Adicionada validação que exige que a primeira e última linha do match correspondam exatamente (com whitespace preservado) às respectivas linhas do `oldString` para esses replacers.

#### #24742 — Edit deleta ranges incorretos
**Arquivo:** `packages/opencode/src/tool/edit.ts`
**Problema:** Quando `oldString` aparecia em múltiplas posições no arquivo, os fuzzy replacers escolhiam o match errado e deletavam grandes porções de código.
**Fix:** Adicionado early exit: se `oldString` tem múltiplos matches exatos, falha imediatamente pedindo mais contexto.

#### #22477 — Snapshot corrompe git index em pre-commit hook
**Arquivo:** `packages/opencode/src/snapshot/index.ts`
**Problema:** O snapshot module executava comandos git simultaneamente com hooks de usuário (ex.: pre-commit), causando contenção no `.git/index.lock`.
**Fix:** Adicionado `GIT_OPTIONAL_LOCKS=0` a todas as operações git do snapshot + retry com exponential backoff (5 tentativas) para erros de lock.

---

### Lote 3 — Cross-cutting (commit `e1ea4a1`)

#### #27596 — `contains()` bypass cross-drive Windows
**Arquivo:** `packages/core/src/filesystem.ts`
**Problema:** No Windows, `path.relative("C:\\project", "D:\\etc\\passwd")` retorna um path absoluto (`D:\\etc\\passwd`) que não começa com `..`, fazendo com que o安全检查 `contains()` retornasse `true` incorretamente para paths em drives diferentes.
**Fix:** Adicionada verificação: se o path relativo retornado por `path.relative()` é absoluto (detectado via `path.resolve() === rel`), o `contains()` retorna `false`.

#### #24402 — `truncateToolOutput()` undefined crash
**Arquivo:** `packages/opencode/src/session/message-v2.ts`
**Problema:** Quando MCP tools retornavam output não-string, a função `truncateToolOutput()` recebia `undefined` e crashava ao tentar acessar `.length`.
**Fix:** Adicionado null/undefined guard no topo da função + `typeof` + `JSON.stringify` fallback no call site para garantir que resultados MCP sejam stringified antes da truncagem.

#### #22252 — Read tool empty file hang
**Arquivo:** `packages/opencode/src/tool/read.ts`
**Problema:** A `read` tool retornava output vazio para arquivos vazios, o que em certos contextos de subagente causava loop infinito (o agente não entendia que o arquivo era vazio e tentava "ler mais").
**Fix:** Adicionado early return: quando `lines()` retorna `count === 0` e `offset === 1`, a tool retorna uma mensagem clara `"(File is empty)"`.

#### #25873 — Immer readonly property crash
**Arquivo:** `packages/core/src/cross-spawn-spawner.ts`
**Problema:** `process.env` em algumas plataformas Node.js tem property descriptors non-configurable/readonly que causavam throw no `produce()` do Immer quando o estado do processo filho entrava no state management da sessão.
**Fix:** A função `env()` agora faz defensive clone via `Object.assign({}, ...)` + `JSON.parse(JSON.stringify(...))` em tool outputs no processor.

#### #26667 — Unhandled AbortError crash
**Arquivo:** `packages/opencode/src/session/processor.ts`
**Problema:** Quando um `AbortError` (DOMException) vazava do stream ou do handler `onInterrupt`, ele não era capturado pelo retry schedule nem pelo fallback, propagando como erro fatal e crashando o processor.
**Fix:** Adicionado `Effect.catchIf` entre o retry schedule e o fallback — AbortErrors agora setam `aborted = true` e retornam `Effect.void` graciosamente.

---

### Lote 4 — MCP & Performance (commit `a38a32b`)

#### #27630 — ToolRegistry Object.entries crash
**Arquivo:** `packages/opencode/src/tool/registry.ts`
**Problema:** `Object.entries(def.args)` crashava quando plugins registravam tool definitions sem schema de args (`def.args === null/undefined`).
**Fix:** Adicionado null guard que pula tool definitions null/undefined com warning log.

#### #27477 — MCP prompts/list polling storm (100% CPU)
**Arquivo:** `packages/opencode/src/mcp/index.ts`
**Problema:** Os métodos `prompts()` e `resources()` chamavam `listPrompts()` / `listResources()` em toda requisição, sem cache. Para MCPs com muitos prompts (ex.: Fetch, Playwright), isso gerava polling storm e 100% de CPU.
**Fix:** Adicionado cache TTL de 30 segundos para prompts e resources no estado MCP.

#### #26714 — Local stdio MCP servers leak processes
**Arquivo:** `packages/opencode/src/mcp/index.ts`
**Problema:** Quando um MCP local via stdio falhava ao conectar ou era descartado, o processo filho não era terminado, acumulando processos zumbis.
**Fix:** Adicionado `Map<string, number>` de PIDs ao estado MCP. O release handler do transport agora envia SIGKILL ao PID + descendentes no failure/dispose.

#### #26435 — Session list crasha com legacy rows
**Arquivo:** `packages/opencode/src/session/session.ts`
**Problema:** `fromRow()` assumia que toda row do banco era válida. Após migrações de schema, rows antigas ou corrompidas causavam crash em toda listagem de sessões.
**Fix:** `fromRow()` agora retorna `Info | undefined` com try/catch. Rows corrompidas são logadas e puladas.

#### #25914 — MCP tool output TypeError
**Arquivos:** `session/processor.ts`, `session/prompt.ts`
**Problema:** O resultado de MCP `callTool()` não tinha schema fixo — alguns servidores retornavam objetos inesperados (`null`, primitivos, arrays), causando `TypeError` ao acessar propriedades.
**Fix:** Adicionados guards `isRecord()` e `Array.isArray()` antes de acessar propriedades do resultado MCP + stringification defensiva.

#### #22455 — Grep 0 results multi-repo workspace
**Arquivo:** `packages/opencode/src/tool/grep.ts`
**Problema:** O default search directory da grep tool era `ins.directory` (CWD), não `ins.worktree` (raiz do repo). Em workspaces multi-repo, a busca só cobria o subdiretório atual.
**Fix:** Alterado para usar `ins.worktree` como search root default quando diferente de `ins.directory`.

#### #22329 — Deepseek infinite loop
**Arquivo:** `packages/opencode/src/session/prompt.ts`
**Problema:** Modelos Deepseek produzem respostas muito longas que estouravam o contexto repetidamente. O loop de compactação rodava indefinidamente porque o contador `consecutiveCompactions` só existia (do fix #27924) mas não havia limite total.
**Fix:** Adicionado `totalCompactions` + `MAX_TOTAL_COMPACTIONS = 10` como segunda rede de segurança.

---

### Lote 5 — Providers & Build (commit `5bbb845`)

#### #26412 — OpenAI-compatible `function.name` null streaming
**Arquivo:** `node_modules/@ai-sdk/openai-compatible/dist/index.mjs` (patch)
**Problema:** O SDK `@ai-sdk/openai-compatible` lança `InvalidResponseDataError` quando o primeiro chunk de streaming tem `function.name === null`. Em certos providers, o nome da função chega num chunk posterior.
**Fix:** Alterado o `throw` para `continue` no chunk inicial quando `function.name` é null.

#### #26332 — MCP local env não passado ao child process
**Arquivos:** `src/config/mcp.ts`, `src/mcp/index.ts`
**Problema:** Usuários configuram `env` no MCP server, mas o schema só aceitava `environment`. O spawn code também não mesclava as variáveis ao processo filho.
**Fix:** Schema aceita ambos `env` e `environment` como alias. Spawn code mescla ambos.

#### #23009 — FileWatcher CPU alto (TimeoutError loop)
**Arquivo:** `packages/opencode/src/file/watcher.ts`
**Problema:** Timeouts do Parcel file watcher entravam em loop de retry imediato, consumindo 100% de CPU.
**Fix:** Retry com exponential backoff: `min(100 × 2^retry, 10000)ms` + jitter aleatório. Máximo de 5 tentativas.

#### #24439 — Zod tool schema crasha TUI
**Arquivo:** `packages/opencode/src/tool/json-schema.ts`
**Problema:** Custom tools com schemas Zod eram passados como `Effect.Schema.Top` para `fromSchema()`, que lançava exceção. O crash propagava para a TUI.
**Fix:** `fromTool()` agora checa `tool.jsonSchema` primeiro, envolve `fromSchema()` em try-catch com fallback seguro.

#### #21375 — Serve para de responder (Bun epoll stall)
**Arquivo:** `packages/opencode/src/server/server.ts`
**Problema:** Em servidores rodando por longos períodos, o event loop do Bun stallava em fds epoll, fazendo o `serve` parar de responder a requisições.
**Fix:** Fiber background que faz health check a cada 30s. Após 2 falhas consecutivas, força restart do HTTP server subjacente.

---

### Lote 6 — Config & MCP (commit `259be20`)

#### #22318 — `parseManagedPlist` crasha com JSON não-objeto
**Arquivo:** `packages/opencode/src/config/managed.ts`
**Problema:** `JSON.parse()` de `opencode.json` às vezes retornava strings, arrays ou null, causando crash ao acessar propriedades como objeto.
**Fix:** Adicionado type guard (`typeof === "object" && !== null && !Array.isArray`) — retorna `"{}"` para inputs inválidos.

#### #25682 — MCP stale connection status
**Arquivo:** `packages/opencode/src/mcp/index.ts`
**Problema:** Quando um MCP server remoto ficava indisponível (conexão perdida), o status permanecia como `"connected"` no estado, fazendo a TUI mostrar o servidor como ativo.
**Fix:** Adicionado callback `onConnectionError` no `convertMcpTool` — erros de conexão (`ECONNRESET`, `ECONNREFUSED`, `ETIMEDOUT`) atualizam o status para `"failed"`.

#### #23664 — Remote MCP env vars não resolvidos
**Arquivo:** `packages/opencode/src/mcp/index.ts`
**Problema:** Configurações de MCP remote com sintaxe `{env:VAR}` ou `{file:PATH}` não eram resolvidas nas URLs e headers, enviando literais como `{env:MY_KEY}` para o servidor.
**Fix:** Adicionado `ConfigVariable.substitute()` em `connectRemote()` e `startAuth()` antes de usar URL e headers.

---

### Lote 7 — Effect Context (commit `fea71fc`)

#### #28065/#28062 — InstanceRef not provided
**Arquivos:** `src/cli/cmd/agent.ts`, `src/cli/cmd/github.ts`
**Problema:** `Effect.runPromise(effect.pipe(Effect.provideService(InstanceRef, ctx)))` criava um runtime Effect standalone que só fornecia `InstanceRef`, sem os demais AppServices. Quando effects internos chamavam `InstanceState.get()` (que aciona operações de cache `ScopedCache`), a falta de dependências causava "InstanceRef not provided".
**Fix:** Substituído por `EffectBridge.make()` + `bridge.promise()`. O bridge captura o contexto Effect completo (todos AppServices + InstanceRef + WorkspaceRef) no momento da criação e restaura em cada chamada `promise()`.

---

### Lote 8 — TUI & CLI (commit `6021541`)

#### #27844 — opentui No renderer found
**Arquivos:** `src/cli/cmd/tui/app.tsx`, `src/cli/cmd/tui/thread.ts`
**Problema:** Quando o renderer nativo do opentui não podia ser criado (binary nativo faltando, terminal não suportado), `createCliRenderer()` rejeitava a promise sem fallback. O erro propagava como unhandled rejection e matava o processo.
**Fix:** Adicionado try/catch em `createCliRenderer()` com mensagem de erro descritiva + catch no thread handler.

---

### Lote 9 — Segurança (commit `3cddafc`)

#### #21924 — AI lê arquivos fora do diretório permitido
**Arquivo:** `packages/opencode/src/tool/read.ts`
**Problema:** A `read` tool resolvia paths relativos e absolutos sem verificar se o resultado estava dentro do workspace directory. Um agente malicioso ou alucinado podia ler `/etc/passwd`, `~/.ssh/id_rsa`, etc.
**Fix:** Adicionada boundary de segurança usando `AppFileSystem.contains()` que verifica se o path resolvido está dentro do `instance.directory`. A verificação roda antes de qualquer I/O.

---

### Lote 10 — ACP (commit `c82c6aa`)

#### #27779 — ACP SDK errors swallowed
**Arquivo:** `packages/opencode/src/acp/agent.ts`
**Problema:** Chamadas ao `sdk.session.prompt()` que retornavam HTTP 4xx/5xx eram silenciosamente convertidas em respostas vazias sem erro visível para o caller.
**Fix:** Adicionado `{ throwOnError: true }` como segundo argumento do `sdk.session.prompt()`.

#### #25421 — ACP frames after end_turn RPC race condition
**Arquivo:** `packages/opencode/src/acp/agent.ts`
**Problema:** Eventos delta (text streaming) processados assincronamente às vezes chegavam depois do frame `end_turn`, fazendo com que o cliente ACP recebesse conteúdo parcial ou faltante na resposta final.
**Fix:** Implementado `deltaChain` — cadeia de promises por sessão que garante que todos os deltas sejam processados antes de enviar o reply `end_turn`. Loop `waitForSessionDeltas()` espera a chain estabilizar.

---

### Lote 11 — Provider & Loop (commit `77540d9`)

#### #27629 — Z.AI GLM overflow não classificado
**Arquivo:** `packages/opencode/src/provider/error.ts`
**Problema:** O provider Z.AI retorna `"tokens in request more than max tokens allowed"` como mensagem de erro, que não estava nos `OVERFLOW_PATTERNS`. O sistema não detectava como overflow, não acionava compactação e entrava em loop.
**Fix:** Adicionado `/tokens in request more than max tokens allowed/i` ao array de `OVERFLOW_PATTERNS`.

#### #26177 — Orphaned interrupted tools loop
**Arquivo:** `packages/opencode/src/session/prompt.ts`
**Problema:** Tool parts com `state.status === "error"` e `metadata.interrupted === true` não eram excluídas do `hasToolCalls` check no loop principal. O loop nunca saía porque achava que ainda havia tool calls pendentes, e reenviava blocos `tool_use` órfãos ao Anthropic, causando erro 400 de prefill.
**Fix:** Adicionado filtro no `hasToolCalls` que exclui parts com `status === "error" && interrupted === true`.

---

### Lote 12 — Loop de Compactação (commit `877cfcd`)

#### #27924 — Infinite compaction loop
**Arquivo:** `packages/opencode/src/session/prompt.ts`
**Problema:** Quando a compactação não conseguia reduzir o contexto o suficiente (ex.: modelo Deepseek produz respostas muito longas), o loop `compact → overflow → compact → overflow` rodava infinitamente.
**Fix:** Adicionado contador `consecutiveCompactions` + guard `MAX_CONSECUTIVE_COMPACTIONS = 3`. Se a compactação roda 3+ vezes sem resolver o overflow, publica `Session.Event.Error` com `UnknownError` e faz `break` no loop.

---

### Lote 10 — MCP, Performance & Stability (commit `a5c23bd`)

#### #25078 — MCP EventEmitter overflow (resources/list polling)
**Arquivo:** `packages/opencode/src/mcp/index.ts`
**Problema:** Quando um MCP server não suporta `resources/list` (retorna `-32601`), o SDK registra listeners no EventEmitter do transport a cada polling, acumulando até `MaxListenersExceededWarning` e vazamento de memória.
**Fix:** Adicionados sets `noResources` e `noPrompts` ao estado MCP. Quando um servidor retorna erro `-32601`, ele é adicionado ao set e todas as chamadas subsequentes o pulam.

#### #24049 — /vcs/diff OOM em umbrella workspaces
**Arquivo:** `packages/opencode/src/project/vcs.ts`
**Problema:** `structuredPatch()` era chamado com `context: Number.MAX_SAFE_INTEGER` (=2.147.483.647 linhas de contexto), fazendo o git diff emitir arquivos completos como contexto. Em workspaces com muitos sub-repos, isso consumia toda a memória.
**Fix:** Constante `PATCH_CONTEXT_LINES` alterada de `2_147_483_647` para `3` (3 linhas de contexto, padrão do git diff).

#### #26871 — TUI crash ao referenciar sessão filha inexistente
**Arquivo:** `packages/opencode/src/cli/cmd/tui/routes/session/index.tsx`
**Problema:** Quando um task tool part referenciava uma sessão filha (`metadata.sessionId`) que não mais existia, o sync disparava `sync.session.sync()` sem tratamento de erro. A promise rejeitada se tornava unhandled rejection e crashava o processo.
**Fix:** Adicionado sinal `sessionExists` com `createSignal(true)`. `sync.session.sync()` agora tem `.catch(() => setSessionExists(false))`. Navegação para a sessão filha é bloqueada quando `sessionExists()` é falso.

#### #27133 — Error handling inconsistente em config de agentes/modes
**Arquivo:** `packages/opencode/src/config/agent.ts`
**Problema:** `load()` crashava startup com `ConfigInvalidError` ao encontrar um arquivo de agente inválido. `loadMode()` silenciava erros completamente sem log.
**Fix:** Ambos agora usam `Schema.decodeUnknownOption` consistentemente. Em caso de falha de parse, registram `log.warn` com o path do arquivo e continuam carregando os demais arquivos.

#### #22220 — HTTP 507 entrava no pipeline de tools com erro confuso
**Arquivo:** `packages/opencode/src/provider/error.ts`
**Problema:** Quando o backend retornava HTTP 507 (Insufficient Storage), a resposta malformada entrava no pipeline de tool dispatch e falhava com `Invalid input: expected string, received undefined` na validação de schema.
**Fix:** Adicionado early return na função `message()`: se `e.statusCode === 507`, retorna mensagem clara "The model provider returned HTTP 507 (Insufficient Storage)."

#### #26159 — Timestamp futuro travava sessão permanentemente
**Arquivo:** `packages/opencode/src/session/session.ts`
**Problema:** Mensagens com timestamp ~7h à frente do relógio real quebravam `session_read` (cursor-based pagination baseada em timestamp). Fork não resolvia; só correção manual no SQLite.
**Fix:** No `updateMessage()`, antes de persistir a mensagem, verifica-se se o timestamp mais recente no DB está >5s à frente de `Date.now()`. Se sim, o novo timestamp é clamped para `maxExisting + 1`, mantendo sequência monotônica.

---

### Lote 11 — TUI & Export (commit `b6b5595`)

#### #23376 — TUI corrompe labels com Unicode invisível
**Arquivo:** `packages/opencode/src/util/locale.ts`
**Problema:** Caracteres Unicode invisíveis (U+200B zero-width space, U+FEFF BOM, etc.) em nomes de agentes faziam o algoritmo de width calculation do TUI subestimar o comprimento real, cortando caracteres visíveis. "Sisyphus: Ultraworker" aparecia como "Sisyphus: ltraworker".
**Fix:** Adicionada função `stripInvisible()` que remove zero-width spaces, soft hyphens, bidi controls, e outros codepoints não-impressíveis. Aplicada nas funções `truncate`, `truncateLeft` e `truncateMiddle` antes do cálculo de largura.

#### #22072 — Export crasha com sessões >1GB
**Arquivo:** `packages/opencode/src/cli/cmd/export.ts`
**Problema:** `JSON.stringify()` em sessões com partes >1GB estourava heap e o erro era capturado como "Session not found" (catch genérico).
**Fix:** Adicionado `totalStringSize()` que estima o tamanho dos dados antes da serialização. Se >50MB, oferece truncamento interativo ou `--force`. Adicionadas opções CLI `--force` e `--truncate`. Error handler corrigido para distinguir NotFoundError de falha de serialização.

---

### Lote 12 — Permissions & Paths (commit `a022292`)

#### #25097 — Glob de permissão não funciona com paths absolutos profundos
**Arquivos:** `packages/core/src/filesystem.ts`, `packages/opencode/src/util/filesystem.ts`
**Problema:** Padrões como `**/private/tmp/agent-out/**` não matcheavam paths absolutos porque a normalização resolvia `**` como segmento literal de diretório via `path.resolve()`, quebrando o glob. A função `contains()` também não resolvia completamente ambos os paths antes do `path.relative()`.
**Fix:** `normalizePathPattern()` reescrita para preservar tokens de glob (`**`, `*`, `?`) e normalizar apenas segmentos contíguos não-glob. `contains()` agora chama `pathResolve()` em parent e child antes do `relative()`, e a verificação cross-drive Windows foi adicionada também à versão do package opencode.

---

### Lote 17 — TUI Event Schema (commit `5b53ec6`)

#### #27664 — /undo e /redo não funcionam via atalhos de teclado
**Arquivos:** `packages/opencode/src/cli/cmd/tui/event.ts`, `packages/opencode/src/server/routes/instance/httpapi/handlers/tui.ts`
**Problema:** `/undo` e `/redo` estavam definidos como comandos do command palette e tinham lógica completa via SDK (`sdk.client.session.revert`/`unrevert`), mas não podiam ser disparados por atalhos de teclado porque `session.undo` e `session.redo` não estavam na union de literais do schema `TuiEvent.CommandExecute`. O HTTP handler de publish também não conhecia os aliases.
**Fix:** Adicionados `"session.undo"` e `"session.redo"` à union `Schema.Literals` em `event.ts`, e `messages_undo`/`messages_redo` ao `commandAliases` em `handlers/tui.ts`.

---

### Lote 18 — TUI Input Focus (commit `9743676`)

#### #28026 — 'p' key requires double-press after content added to chat
**Arquivo:** `packages/opencode/src/cli/cmd/tui/component/prompt/index.tsx`
**Problema:** Em versões acima de 1.14.41, após adicionar conteúdo ao chat (resposta gerada ou sessão passada carregada), a tecla 'p' precisava ser pressionada duas vezes para registrar. O primeiro keypress era consumido pelo fallback do base layout porque `focus()` era restaurado sincronamente dentro do `createEffect` antes que o evento de teclado fosse processado.
**Fix:** `input.focus()` agora é wrapped em `queueMicrotask()` para que o foco seja restaurado após o batch de processamento de eventos atual completar, dando à camada textarea a chance de reclamar o próximo keypress na primeira tentativa.

---

### Lote 19 — High-priority bug fixes (commit `HEAD`)

#### #28058 — Tool transcript headers mostram "in ." para diretório raiz
**Arquivo:** `packages/opencode/src/cli/cmd/run/tool.ts`
**Problema:** `toolPath()` retornava `"."` para o diretório de trabalho atual, fazendo `scrollBashStart()` exibir títulos como `# Final whitespace check before commit in .`. O mesmo padrão ocorria em `runGlob`, `runGrep`, `scrollGlobStart` e `scrollGrepStart`.
**Fix:** Adicionada função `toolDir()` que retorna `""` quando `toolPath()` normaliza para `"."`. A verificação agora ocorre *após* a formatação (não antes), seguindo a regra: sem sufixo para workdir ausente, sem sufixo para `.`, sem sufixo para paths absolutos que normalizam para `.`.

#### #27942 — Comandos ACP /model e /mode não registrados no available_commands_update
**Arquivo:** `packages/opencode/src/acp/agent.ts`
**Problema:** O payload `available_commands_update` do ACP só incluía `compact` como fallback. Clientes ACP que fazem gate de dispatch no registry silenciosamente ignoravam os comandos `/model` e `/mode`.
**Fix:** Adicionados `model` ("change the active model") e `mode` ("change the active mode/agent") no mesmo fallback block do `compact`.

#### File watcher — Erro de watcher comentado silenciava falhas
**Arquivo:** `packages/opencode/src/file/watcher.ts`
**Problema:** A linha `// if (err) return` estava comentada no callback do `@parcel/watcher`, fazendo com que erros de subscribe fossem ignorados e eventos potencialmente incompletos fossem processados.
**Fix:** Reativada a verificação de erro com `log.warn()` antes do early return.

---

## Legenda

| Prefixo | Significado |
|---------|-------------|
| `#27924` | Issue no repositório anomalyco/opencode |
| Commit | Hash do commit no branch dev do teamcode |
| ✅ | Corrigido |
| ⏭️ | Skipped (não aplicável ao fork) |
| 🔍 | Verificado como já resolvido |
