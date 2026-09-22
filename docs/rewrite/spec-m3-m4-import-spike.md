# Spike M3/M4: esquema JSONL do Claude Code e do Codex, e mapeamento para o TeamCode

Data: 2026-09-22
Status: aprovado e implementado (`packages/teamcode/src/import/`, `src/tool/external_session.ts`, `test/import/`)
Relacionados: `docs/rewrite/spec-m1-go-session-store.md` (§1 tabela de marcos, §3.3 modelo, §4.3 "o Go não valida")

## 0. Desvios em relação ao spec M1 e ao pedido

| Ponto | Spec / pedido | Proposta | Motivo |
| --- | --- | --- | --- |
| Linguagem de M3 | Spec M1 §1: "conversores em Go" | TS em `packages/teamcode/src/import/` | Pedido explícito; M1/M2 go-core não mudam. O conversor escreve nas tabelas pelo `Database.use` como o `import.ts` atual já faz. Quando M2 rotear escrita pelo Go, só o `storage.ts` do pacote troca de destino. |
| Caminho das sessões | `~/.claude/projects/*/sessions/*.jsonl` | `~/.claude/projects/<slug-do-cwd>/<sessionId>.jsonl` (real, verificado), com fallback para o glob pedido | O Claude Code 2.x grava direto no diretório do projeto. `~/.claude/sessions/` contém só arquivos de lock/peer (`<pid>.json`, `.key`), não transcrições. |
| Formato Codex | — | Inventado a partir do conhecimento do `rollout-*.jsonl`; sem amostra local | Marcado como "a validar" em §3. Preciso de um arquivo real ou aceitação do esquema proposto. |

## 1. Esquema JSONL do Claude Code (observado, versão 2.1.278)

Arquivo: um por sessão, `~/.claude/projects/<slug>/<sessionId>.jsonl`, onde `<slug>` é o `cwd` com `/` trocado por `-` (ex.: `-home-user-eks-dashboard`). Subagentes, quando existem, ficam em `<slug>/<sessionId>/subagents/agent-*.jsonl` e têm `isSidechain: true`.

Toda linha é um objeto com `type`. Campos de envelope comuns às linhas de conversa:

```jsonc
{
  "type": "user" | "assistant",
  "uuid": "ef5f42d2-…",          // id da linha, único no arquivo
  "parentUuid": "…" | null,      // linha anterior na árvore (null na raiz)
  "isSidechain": false,          // true em transcrição de subagente
  "sessionId": "d6d1a4fb-…",
  "timestamp": "2026-09-22T13:19:53.365Z",  // ISO-8601, ms
  "cwd": "/home/user/eks-dashboard",
  "gitBranch": "claude/…",
  "version": "2.1.278",          // versão do Claude Code
  "userType": "external",
  "entrypoint": "cli" | "remote_desktop" | …,
  "message": { … }               // ver abaixo
}
```

### 1.1 Tipos de linha

| `type` | O que é | Tratamento |
| --- | --- | --- |
| `user` | Prompt humano **ou** resultado de tool | Vira `MessageV2.User` se `message.content` é string ou contém bloco `text`; se contém só `tool_result`, é dobrada na `ToolPart` do assistant anterior (por `tool_use_id`) e **não** vira mensagem |
| `assistant` | **Um bloco** da resposta do modelo (uma linha por bloco, `apiBlockIndex` 0..n, mesmo `message.id` e `requestId`) | Agrupada por `message.id` em **uma** `MessageV2.Assistant`; cada bloco vira uma `Part` |
| `summary` | `{summary, leafUuid}` gerado pelo `/compact` ou por resumo automático (versões anteriores) | Fonte do `title` quando presente |
| `attachment` | system-reminders, snapshot de prompt, listagem de skills | Ignorada |
| `queue-operation`, `last-prompt`, `atis-latch`, `file-history-snapshot` | Telemetria interna | Ignorada |
| Qualquer outro | | Ignorada e contada em `skipped[type]` no relatório do import |

Campos extras da linha `user` de prompt: `promptId`, `permissionMode`, `origin.kind` (`human`), `turnOrigin`. Campos extras da linha `user` de tool result: `sourceToolAssistantUUID` (uuid da linha assistant do `tool_use`), `toolUseResult` (objeto estruturado: `{stdout, stderr, interrupted, isImage, noOutputExpected}` para Bash, ou string). Campos extras de `assistant`: `requestId`, `effort`, `perTurnEffort`, `attributionMcpServer`/`attributionMcpTool` (quando o `tool_use` é MCP).

### 1.2 `message` do assistant (API Anthropic literal)

```jsonc
{
  "id": "msg_011CfJYbhkSgovozZGrwRr41",   // id da API; igual em todas as linhas do mesmo turno
  "type": "message", "role": "assistant",
  "model": "claude-fable-5-1",
  "stop_reason": "tool_use" | "end_turn" | "max_tokens" | null,
  "usage": {
    "input_tokens": 2, "output_tokens": 390,
    "cache_creation_input_tokens": 32538, "cache_read_input_tokens": 40350,
    "output_tokens_details": { "thinking_tokens": 106 },
    "service_tier": "standard", …
  },
  "content": [ <um bloco> ]
}
```

Blocos observados: `{type:"text", text}`, `{type:"thinking", thinking, signature}`, `{type:"tool_use", id:"toolu_…", name, input, caller?}`. Blocos conhecidos da API e tratados por segurança: `redacted_thinking`, `server_tool_use`, `web_search_tool_result`, `image`.

### 1.3 `message` do user

- Prompt: `content` é `string` (a maioria) ou `[{type:"text", text}, {type:"image", source:{…}}]`.
- Tool result: `content` é `[{type:"tool_result", tool_use_id:"toolu_…", content: string | [{type:"text",text}|{type:"image",…}], is_error?: bool}]`.

## 2. Mapeamento para `SessionTable` / `MessageTable` / `PartTable`

### 2.1 Identificadores determinísticos (chave da reimportação incremental)

Os brands do TS exigem prefixo `ses`/`msg`/`prt` e a ordenação do TeamCode é lexicográfica pelo id (M1 §3.4). Para reimportar sem tabela de mapeamento, o id é uma função pura da fonte, no mesmo layout de `id.ts` (`<prefixo>_` + 12 hex de tempo + 14 base62):

| Entidade | 12 hex (tempo) | 14 base62 (em vez de aleatório) |
| --- | --- | --- |
| Sessão | `~(ms_da_primeira_linha * 4096)` (descendente, como `ses`) | `base62(sha256("claude-code:" + sessionId))[0:14]` |
| Mensagem user | `ms_da_linha * 4096` | `base62(sha256("claude-code:" + uuid_da_linha))[0:14]` |
| Mensagem assistant | `ms_da_primeira_linha_do_turno * 4096` | `base62(sha256("claude-code:" + message.id))[0:14]` |
| Parte | `ms_da_linha * 4096 + apiBlockIndex` | `base62(sha256("claude-code:" + uuid_da_linha + ":" + tipo))[0:14]` |

Efeitos: ordem cronológica preservada (`ORDER BY time_created, id` do `MessageV2.page` funciona), mesma fonte gera o mesmo id em toda máquina, e "pular mensagens já existentes por id" é um `SELECT id FROM message WHERE session_id = ?` seguido de set-diff. Colisão de tempo entre duas linhas no mesmo ms é resolvida pelo sufixo hash, não pelo contador (o contador do `id.ts` não é reproduzível entre execuções). `Identifier.timestamp(id)` continua devolvendo o ms correto.

### 2.2 `SessionTable`

| Coluna | Valor | Nota |
| --- | --- | --- |
| `id` | §2.1 | |
| `project_id` | projeto cujo `worktree` é o `cwd` (ou raiz git do `cwd`); fallback: projeto da instância que roda o `import` | FK real (`foreign_keys=ON`); sem projeto correspondente, a sessão vai para o projeto atual e `directory` guarda o `cwd` original |
| `workspace_id` | NULL | |
| `parent_id` | NULL; para `subagents/agent-*.jsonl`: id da sessão pai | Opcional na v1, ver §5 |
| `slug` | `claude-<primeiros 8 do sessionId>` | O TeamCode gera slugs legíveis; aqui basta ser estável |
| `directory` | `cwd` da primeira linha | |
| `path` | NULL | |
| `title` | linha `summary` mais recente; senão primeiro prompt humano, primeira linha, truncado em 80 chars; senão `Claude Code <sessionId[0:8]>` | |
| `version` | **`claude-code@2.1.278`** | Ver §2.5: é daqui que sai a coluna "origem" |
| `share_url`, `summary_*`, `revert`, `permission` | NULL | |
| `cost` | 0 | Sem tabela de preço no import; `tokens_*` bastam para a TUI |
| `tokens_input` | Σ `usage.input_tokens` | por `message.id` único, não por linha |
| `tokens_output` | Σ `usage.output_tokens` | |
| `tokens_reasoning` | Σ `usage.output_tokens_details.thinking_tokens` | |
| `tokens_cache_read` | Σ `usage.cache_read_input_tokens` | |
| `tokens_cache_write` | Σ `usage.cache_creation_input_tokens` | |
| `agent` | `"claude-code"` | Aparece no cabeçalho da sessão na TUI |
| `model` | `{id: model_da_última_assistant, providerID: "anthropic"}` | |
| `time_created` | ms da primeira linha | |
| `time_updated` | ms da última linha | Regra M1: só o import a altera, e só quando há linha nova |
| `time_compacting`, `time_archived` | NULL | |

### 2.3 `MessageTable.data` (`MessageV2.Info` sem `id`/`sessionID`)

**User** (linha `user` de prompt):

```jsonc
{ "role": "user", "time": { "created": <ms> }, "agent": "claude-code",
  "model": { "providerID": "anthropic", "modelID": "<model da assistant seguinte, ou última vista>" } }
```

**Assistant** (grupo de linhas com o mesmo `message.id`):

```jsonc
{ "role": "assistant", "time": { "created": <ms 1ª linha>, "completed": <ms última linha do turno> },
  "parentID": "<msg id da user anterior na árvore>", "modelID": "<message.model>", "providerID": "anthropic",
  "mode": "claude-code", "agent": "claude-code", "path": { "cwd": "<cwd>", "root": "<cwd>" },
  "cost": 0, "finish": "<stop_reason>" ,
  "tokens": { "input": …, "output": …, "reasoning": …, "cache": { "read": …, "write": … } } }
```

`parentID` é obrigatório no schema `Assistant`: é a última mensagem `user` de prompt ao subir a cadeia `parentUuid`. `stop_reason: null` (turno interrompido) vira `finish` ausente. Nenhum campo do envelope (`requestId`, `effort`) é gravado: `MessageV2.Info` é união fechada e `Schema.decodeUnknownSync` é exercitado no teste de round-trip.

### 2.4 `PartTable.data` (`MessageV2.Part` sem `id`/`sessionID`/`messageID`)

| Bloco Claude | Part TeamCode | Mapeamento |
| --- | --- | --- |
| `text` | `TextPart` | `{type:"text", text}`; user prompt string vira um único `TextPart` |
| `thinking` | `ReasoningPart` | `{type:"reasoning", text: thinking, time:{start: ms, end: ms}, metadata:{signature}}` |
| `redacted_thinking` | `ReasoningPart` | `text: "[redacted]"`, `metadata:{redacted:true}` |
| `tool_use` + `tool_result` casado por `tool_use_id` | `ToolPart` | `{type:"tool", callID: toolu_id, tool: name, state}`; `state` = `completed {input, output, title: name, metadata: toolUseResult ?? {}, time:{start: ms_tool_use, end: ms_tool_result}}` ou `error {input, error: content, time}` se `is_error`; sem resultado casado: `pending {input, raw: JSON.stringify(input)}` |
| `tool_result.content[]` do tipo `image` | `attachments` da `ToolStateCompleted` | `FilePart` com `mime` e `url` `data:` |
| `image` no prompt do user | `FilePart` | `{type:"file", mime, url: "data:<mime>;base64,…", filename?}` |
| `server_tool_use` / `web_search_tool_result` | `ToolPart` | `tool: "web_search"`, mesmo casamento por id |
| (sintético) por turno assistant | `StepStartPart` | primeira parte do turno |
| (sintético) por turno assistant | `StepFinishPart` | última parte: `{reason: stop_reason ?? "unknown", cost: 0, tokens: <usage do turno>}`. Necessário porque o `Session` do TS recalcula uso da sessão a partir de `step-finish` (M1 §3.5) |

`time_created` da parte = ms da linha; `time_updated` = ms do `tool_result` quando casado, senão igual a `time_created`. Nomes de tool ficam como o Claude os chama (`Bash`, `Read`, `mcp__github__…`); a TUI já renderiza tool desconhecida pelo nome.

### 2.5 Origem (`claude` / `codex` / `teamcode`) sem mudar o schema

O pedido veta alterar o TS de storage, então não há coluna nova nem migração. A origem é derivada de `version`:

| `version` | Origem |
| --- | --- |
| `claude-code@<x>` | `claude` |
| `codex@<x>` | `codex` |
| qualquer outro (hoje: `Installation.VERSION` do TeamCode) | `teamcode` |

Função pura `Origin.of(session: Session.Info)` em `src/import/origin.ts`, usada pela TUI (coluna) e pela tool `external_session`. Se em M2 o Go ganhar coluna própria, só essa função muda. Alternativas descartadas: prefixo no `slug` (aparece na UI), `agent` (é exibido como nome de agente e será útil para `claude-code` literal), tabela sidecar (exige migração e verificação de esquema no Go).

## 3. Esquema Codex CLI (inventado, a validar com amostra real)

Arquivos: `~/.codex/sessions/YYYY/MM/DD/rollout-<ISO>-<uuid>.jsonl` (formato atual, 0.2x+) e `~/.codex/sessions/rollout-*.jsonl` (formato antigo, sem envelope). Toda linha do formato atual é `{timestamp, type, payload}`:

| `type` | `payload` | Mapeamento |
| --- | --- | --- |
| `session_meta` | `{id, timestamp, cwd, originator, cli_version, instructions, git:{commit_hash, branch, repository_url}}` | `SessionTable`: id determinístico com prefixo `"codex:"`, `directory: cwd`, `version: "codex@"+cli_version`, `agent: "codex"`, `title` do primeiro `user_message` |
| `turn_context` | `{cwd, approval_policy, sandbox_policy, model, effort, summary}` | atualiza `model` corrente: `{providerID: "openai", modelID: model}` |
| `response_item` | `{type:"message", role:"user"\|"assistant"\|"developer", content:[{type:"input_text"\|"output_text"\|"input_image", text\|image_url}]}` | `user` → `MessageV2.User` + `TextPart`/`FilePart`; `assistant` → `Assistant` + `TextPart`; `developer`/`system` ignorados (são instruções injetadas) |
| `response_item` | `{type:"reasoning", summary:[{type:"summary_text", text}], content?, encrypted_content?}` | `ReasoningPart` com `text` = junção dos `summary_text` |
| `response_item` | `{type:"function_call", name, arguments (string JSON), call_id}` | `ToolPart` `pending`, `callID: call_id`, `tool: name`, `input: JSON.parse(arguments)` |
| `response_item` | `{type:"function_call_output", call_id, output (string ou {output, metadata:{exit_code, duration_seconds}})}` | fecha a `ToolPart` como `completed` (ou `error` se `exit_code != 0`) |
| `response_item` | `{type:"local_shell_call", call_id, action:{command[], …}, status}` / `custom_tool_call` | `ToolPart` `tool: "shell"` / `tool: name` |
| `event_msg` | `{type:"token_count", info:{total_token_usage:{input_tokens, cached_input_tokens, output_tokens, reasoning_output_tokens}}}` | último valor vira `tokens_*` da sessão e `StepFinishPart` do último turno |
| `event_msg` | `{type:"user_message"\|"agent_message"\|"agent_reasoning"\|"task_started"\|"task_complete"}` | ignorados (duplicam `response_item`) |
| `compacted`, `patch_apply_*`, outros | | ignorados e contados |

Codex não tem `message.id` por turno: o agrupamento em `Assistant` é "todos os `response_item` de assistant/reasoning/function_call entre dois `message` de `user`". Ids: `sha256("codex:" + session_id + ":" + índice_da_linha)` para itens sem id próprio, `call_id` para tool calls.

Formato antigo (primeira linha `{id, timestamp, instructions, git}` seguida de itens brutos): detectado pela ausência de `type` na linha 1 e tratado com o mesmo conversor após envelopar cada linha.

## 4. Layout de código e contrato entre módulos

```
packages/teamcode/src/import/
  index.ts        export * as Import from "./import"  (padrão do repo)
  scanner.ts      discover({home?, sources}) → Source[]  {origin, path, sessionKey, mtime, size}
  parser/
    claude-code.ts  parse(lines: AsyncIterable<string>) → Raw.ClaudeSession  (linhas tipadas; nada do TeamCode)
    codex.ts        parse(...) → Raw.CodexSession
  normalizer.ts   normalize(raw) → Normalized {session: Session.Info, messages: MessageV2.WithParts[]}
                  pura; Schema.decodeUnknownSync(Session.Info / MessageV2.Info / MessageV2.Part) como asserção
  ident.ts        ids determinísticos de §2.1 (reusa layout de id.ts; base62 igual)
  origin.ts       Origin.of(session) de §2.5
  storage.ts      upsert(normalized, {projectID}) → {inserted, skipped}  (Database.use, onConflictDoNothing;
                  única parte que toca SQLite; escreve session tokens_* por UPDATE após inserir partes)
  cli.ts          ImportFromCommand: `teamcode import --from claude-code|codex [--all] [--session <id>] [--dry-run]`
                  registrado em cli/cmd/import.ts como subcomando/flag sem tocar o caminho `import <file>` atual
packages/teamcode/src/tool/external_session.ts + external_session.txt
packages/teamcode/test/import/
  fixture/claude-code/<slug>/<sessionId>.jsonl   (amostra sanitizada desta sessão: prompt, thinking, tool_use Bash,
                                                 tool_result ok, tool_result is_error, text final, linhas ignoradas)
  fixture/codex/sessions/2026/09/22/rollout-….jsonl (amostra inventada de §3)
  scanner.test.ts parser.test.ts normalizer.test.ts storage.test.ts cli.test.ts tool.test.ts
```

Contratos que os testes fixam:

1. `normalize(parse(fixture))` decodifica sem erro em `Session.Info`, `MessageV2.Info`, `MessageV2.Part`.
2. Ordem: `messages[i].info.time.created <= messages[i+1]` e ids em ordem lexicográfica crescente.
3. Idempotência: `upsert` duas vezes → segunda devolve `inserted: 0`, e `SELECT count(*)` não muda.
4. Incremental: fixture com N linhas, depois N+3 linhas (novo turno anexado) → só o turno novo é inserido; `time_updated` da sessão avança; `tokens_*` somam.
5. `tool_result` sem `tool_use` correspondente e `tool_use` sem resultado não derrubam o parse.
6. Linha JSON inválida é pulada e contada (`warnings`), não aborta.
7. `Origin.of` nos três casos.
8. `external_session` lista por origem e devolve texto de uma sessão importada; recusa `session_id` fora do banco com mensagem `Session not found: <id>`.

## 5. Decisões abertas (resolvidas na aprovação: todas as propostas foram adotadas)

Implementação: subagentes viram sessões filhas (`parent_id`), `cwd` sem projeto cria linha em `project` (`ext-<sha256(cwd)[0:16]>`), `cost` fica 0, esquema Codex de §3 vale como base com fixture inventada, origem via `version`. Detalhe extra que surgiu na implementação: na reimportação, além de pular mensagens existentes por id, a **mensagem existente mais recente** é regravada (só `data` das partes, `time_created` preservado), porque ela pode ter sido importada com tool calls ainda `pending`.

1. **Subagentes** (`subagents/agent-*.jsonl`, `isSidechain: true`): importar como sessões filhas (`parent_id`) já na v1, ou ignorar? Proposta: importar como filhas; custo baixo, `Session.children` já existe.
2. **Projeto de destino** quando o `cwd` do Claude não corresponde a nenhum `project.worktree`: criar a linha em `project` (com `worktree: cwd`) ou cair no projeto atual? Proposta: criar, porque senão `Session.list()` da TUI, que filtra por projeto, esconde a sessão. Criar `project` é escrita nova mas não altera código de storage.
3. **Custo**: deixar `cost: 0` ou consultar `Provider` para precificar por `model`? Proposta: 0 na v1; o modelo do Claude Code pode não existir na tabela de provider.
4. **Codex**: aceita o esquema de §3 como base e eu incluo a fixture inventada, ou você tem um `rollout-*.jsonl` real para colocar em `test/import/fixture/codex/`?
5. **Coluna de origem via `version`** (§2.5): ok, ou prefere `agent`?

## 6. Entrega

Entregue como patch (`git format-patch`) porque a sessão que produziu o código não tinha credencial de push para este repositório. Validação local: `bun run typecheck` limpo, `bun test test/import` (35 testes) e `bun test` completo do `packages/teamcode` verdes.
