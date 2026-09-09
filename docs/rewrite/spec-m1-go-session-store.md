# Spec M1: store de sessão e mensagens no go-core

Data: 2026-09-09
Status: proposta aprovada em conversa, aguardando revisão do texto
Relacionados: `docs/PERFORMANCE_PLAN.md` §1 (P0 "Session store + CRUD" e "Message persistence"), `docs/ARCHITECTURE.md` §3.1, `docs/rewrite/adr-swarm-scheduler.md`

## 1. Contexto

O `ARCHITECTURE.md` declara o go-core como fonte de verdade de sessão, mas hoje toda a persistência de sessão, mensagem e parte vive em TypeScript (`packages/teamcode/src/session/*`) sobre SQLite (`opencode.db`). O go-core tem um store em memória com 6 campos (`internal/session/store.go`), um `PersistentStore` sem uso com TTL de 7 dias e nenhum armazenamento de mensagens. O único uso do go-core pelo `packages/teamcode` é o `startGoCore()` em `index.ts`.

Este documento é o primeiro de quatro marcos que levam a "ler e interagir com sessões do Claude Code e do Codex de dentro do teamcode":

| Marco | Entrega |
| --- | --- |
| **M1 (este)** | go-core capaz de ser dono da persistência de sessão, sem mudar o TS |
| M2 | TS passa a falar com o go-core por HTTP; dupla escrita atrás de flag; SQLite acessado só pelo Go |
| M3 | Scanner e conversores de sessões Claude Code e Codex em Go; importação e reimportação incremental |
| M4 | Superfície TS: lista na TUI com origem, `import --from`, tool `external_session` |

Decisões já tomadas que este documento não reabre:

- Persistência em SQLite, no mesmo arquivo e esquema que o TS usa hoje (`opencode.db` ou `opencode-<canal>.db`). ApexStore fica para a fase prevista no roadmap.
- Driver `modernc.org/sqlite` (Go puro, sem cgo). É a primeira dependência externa do `go-core/go.mod`.
- O esquema continua sendo do TS (migrações drizzle em `packages/teamcode/migration/`). O Go não roda nem embute migrações.

## 2. Escopo

### Entra

- Pacote `go-core/internal/store`: abertura do arquivo SQLite com os mesmos pragmas do TS e verificação de esquema.
- Pacote `go-core/internal/sessiondb`: modelo e consultas para `session`, `message`, `part`, `todo`.
- Pacote `go-core/internal/ident`: geração e ordenação de IDs no esquema do `packages/teamcode/src/id/id.ts`.
- Pacote `go-core/internal/eventbus` reescrito: sequência por sessão, replay, sem descarte silencioso.
- Endpoints `/v1/session/...` e `/v1/events` em `go-core/cmd/server`.
- Testes unitários Go, fixture cruzada de IDs, teste de paridade TS×Go e teste de concorrência.
- Job de CI para `go-core/`.

### Não entra

- Qualquer mudança de comportamento no TS. `Session.Service`, projetores, TUI, tool e comando ficam intactos.
- Dupla escrita, flags de roteamento, remoção da rotina de recuperação de WAL do TS. São M2.
- Tabela `session_message` (V2, 29 projetores), `session_diff` (arquivo JSON fora do SQLite), `event`/`event_sequence` (só com `experimentalWorkspaces`), `session_share`, `permission` por projeto.
- `updatePartDelta`: hoje é só Bus, sem persistência; vira evento SSE em M2.
- Autenticação dos endpoints. O go-core continua em `127.0.0.1`, como hoje.
- Interpretação das variantes de `MessageV2.Part` e dos erros de `Assistant`. O Go guarda e devolve o JSON intacto (ver §4.3).

## 3. Camada de dados

### 3.1 Abertura do arquivo (`internal/store`)

Resolução do caminho, na mesma ordem do `packages/teamcode/src/storage/db.ts`:

1. `TEAMCODE_DB`, se definido. `:memory:` e caminhos absolutos passam direto; caminho relativo é resolvido sob o diretório de dados.
2. Diretório de dados: `XDG_DATA_HOME/teamcode`, com fallback `~/.local/share/teamcode`.
3. Nome do arquivo: `opencode.db` para canais `latest`, `beta`, `prod` ou quando `TEAMCODE_DISABLE_CHANNEL_DB` está definido; senão `opencode-<canal>.db`. O canal vem de `TEAMCODE_CHANNEL`, padrão `local`.

Pragmas, nesta ordem, em toda conexão: `journal_mode=WAL`, `synchronous=NORMAL`, `busy_timeout=10000`, `cache_size=-64000`, `foreign_keys=ON`.

O que o Go **não** faz na abertura, porque o TS faz e com dois processos no mesmo arquivo isso corrompe: apagar `-wal`/`-shm`, `wal_checkpoint(TRUNCATE)`, `integrity_check`. Ao fechar, o Go faz `wal_checkpoint(PASSIVE)`.

Pool: uma conexão dedicada a escrita, serializada por mutex no processo; pool de leitura separado. Toda mutação abre `BEGIN IMMEDIATE`. `SQLITE_BUSY` após o `busy_timeout` vira resposta 503 `{"error":"busy"}`; não há retry silencioso, porque retry reordenaria eventos.

### 3.2 Verificação de esquema

Na abertura, o Go verifica piso de migração e forma de coluna. Piso: a maior `created_at` de `__drizzle_migrations` precisa ser maior ou igual à constante `KnownMigrationCreatedAt` de `internal/store/schema.go` (`20260619230821_add-session-indexes` na data deste documento, atualizada quando o TS ganha migração que toca tabelas usadas pelo Go), de modo que migração mais nova do que a conhecida é aceita. Forma: `PRAGMA table_info` de cada tabela que o Go lê ou escreve (`session` com as 28 colunas de `sessionColumns`, `message`, `part`, `todo`, `project` e `workspace`) precisa trazer as colunas usadas; tabela ou coluna ausente vira `schema_outdated: <tabela>.<coluna> missing`. Falha em ler `__drizzle_migrations` é `schema_outdated`; qualquer outro erro de SQL sobe como é, sem virar `schema_outdated`. Se a verificação falha, o servidor sobe em modo degradado: `/health` responde `{"status":"degraded","reason":"schema_outdated"}` e todo `/v1/session/*` responde 503 `{"error":"schema_outdated"}`. Os demais serviços do go-core (filesystem, provider, swarm) seguem normais.

### 3.3 Modelo

Uma struct por tabela, colunas planas tipadas, colunas `data` como `json.RawMessage`.

`Session` cobre as 30 colunas de `session` (ver `packages/teamcode/src/session/session.sql.ts:16-66`). No wire, o Go produz o mesmo objeto `Session.Info` do TS: `share.url` a partir de `share_url`; `summary` a partir das 3 colunas inteiras mais `summary_diffs`, ausente quando as 3 são NULL; `tokens.*` a partir de `tokens_*`; `time.*` a partir de `time_*`; `model` a partir do JSON. Falha ao decodificar `model` descarta só o `model`; falha em qualquer outro campo devolve o placeholder mínimo que o `fromRow` do TS devolve (id, slug, projectID, directory, title, version, time), logado em `warn`.

`Message`: `id`, `session_id`, `time_created`, `time_updated`, `data`. `Part`: `id`, `message_id`, `session_id`, `time_created`, `time_updated`, `data`. `Todo`: `session_id`, `content`, `status`, `priority`, `position`, `time_created`, `time_updated`, chave composta `(session_id, position)`.

Do JSON de `part.data`, o Go lê apenas `type` e, quando `type == "step-finish"`, `cost` e `tokens.{input,output,reasoning,cache.read,cache.write}`. Nada mais é interpretado.

Tempo: toda coluna `time_*` e todo `time.*` no JSON é inteiro epoch em milissegundos. Nenhum `time.Time` chega ao wire.

### 3.4 Identificadores (`internal/ident`)

Reimplementação do `packages/teamcode/src/id/id.ts:51-70`:

- Formato `<prefixo>_` + 12 hex + 14 base62.
- Os 12 hex são 6 bytes big-endian de `ms*4096 + contador`, com contador por processo zerado a cada milissegundo.
- Sessão é **descendente**: o valor é invertido bit a bit antes de codificar, de modo que ordem lexicográfica é ordem cronológica inversa. Mensagem, parte e evento são ascendentes.
- Prefixos: `ses`, `msg`, `prt`, `evt`.

Um teste cruzado usa uma fixture de 200 IDs gerados pelo TS e verifica que o Go extrai o mesmo timestamp e produz a mesma ordenação.

### 3.5 Regras de escrita copiadas do TS

Listadas aqui porque cada uma tem teste próprio:

| Regra | Origem no TS |
| --- | --- |
| `time_updated` nunca é alterado implicitamente; só muda quando o patch traz `time.updated` | `storage/schema.sql.ts:7-8`, `session/projectors.ts:114` |
| Uso da sessão (`cost`, `tokens_*`) é delta incremental: soma ao gravar parte `step-finish`, subtrai a versão anterior ao regravar a mesma parte, subtrai ao remover parte ou mensagem | `session/projectors.ts:32-45,145-196` |
| Upsert de `message` e `part` atualiza só `data`; `time_created` é preservado no conflito | `session/projectors.ts:130-138,178-187` |
| Violação de FK ao gravar mensagem ou parte de sessão já apagada é engolida e logada, não é erro | `session/projectors.ts:16-20,139-142,192-195` |
| Guarda de relógio: se o maior `message.time_created` da sessão excede `agora + 5000`, a nova mensagem recebe `max + 1` | `session/session.ts:694-706` |
| Em patch parcial, `null` limpa o campo e chave ausente não toca a coluna; `summary` limpo grava NULL nas 3 colunas e no diff | `session/projectors.ts:57-97` |
| `remove` apaga descendentes recursivamente em aplicação (não há FK em `parent_id`) e emite `session.deleted` de cada um antes do pai | `session/session.ts:647-690` |
| `todo` é substituição total por sessão dentro de uma transação | `session/todo.ts:43-46` |
| Inserção de sessão exige linha em `project`; FK real com `foreign_keys=ON` | `session.sql.ts:20-23` |
| `session.created` incrementa `workspace.time_used` quando há `workspaceID` | `session/projectors.ts:105-107` |

## 4. API HTTP

### 4.1 Convenções

- Prefixo `/v1/session`. Os endpoints atuais `/session/*` permanecem intocados até M2 removê-los, porque `packages/core/src/router/client.ts` e `packages/core/test/parity/session-crud.test.ts` dependem deles.
- JSON com os nomes de campo do `Session.Info` e do `MessageV2` do TS, em camelCase, para M2 usar `Schema.decode` sem camada de tradução.
- Erros: `{"error":"<mensagem>"}`. Mensagens de não-encontrado são as mesmas que os testes TS afirmam verbatim: `Session not found: <id>`, `Message not found: <id>`.
- O cliente pode enviar `id`; ausente, o Go gera.
- Toda mutação roda em `BEGIN IMMEDIATE` e publica seus eventos após o commit.

### 4.2 Endpoints

| Método TS | Endpoint | Corpo / parâmetros | Resposta |
| --- | --- | --- | --- |
| `create` | `POST /v1/session` | `{id?, projectID, workspaceID?, parentID?, title?, agent?, model?, permission?, directory, path?, version}` | 201 `Info` |
| `get` | `GET /v1/session/{id}` | | `Info`; 404 |
| `list`, `listByProject`, `listGlobal` | `GET /v1/session` | `projectID`, `directory`, `path`, `archived`, `search`, `limit`, `parentID` (`null` lista só raízes) | `Info[]` em `time_updated DESC, id DESC` |
| `children` | `GET /v1/session/{id}/children` | | `Info[]` |
| `touch`, `setTitle`, `setArchived`, `setPermission`, `setRevert`, `clearRevert`, `setSummary` | `PATCH /v1/session/{id}` | patch parcial `UpdatedInfo` (`session/session.ts:356-380`) | `Info` completo relido |
| `remove` | `DELETE /v1/session/{id}` | | 204 |
| `fork` | `POST /v1/session/{id}/fork` | `{messageID?}` | 201 `Info` da nova sessão |
| `messages` | `GET /v1/session/{id}/messages` | `limit` (padrão 50), `before` (cursor opaco) | `{messages: WithParts[], more, cursor}` |
| `updateMessage` | `PUT /v1/session/{id}/message/{messageID}` | `Info` de mensagem | `Info` |
| `removeMessage` | `DELETE /v1/session/{id}/message/{messageID}` | | 204 |
| `getPart` | `GET /v1/session/{id}/message/{messageID}/part/{partID}` | | `Part`; 404 |
| `updatePart` | `PUT /v1/session/{id}/message/{messageID}/part/{partID}` | `Part` | `Part` |
| `removePart` | `DELETE /v1/session/{id}/message/{messageID}/part/{partID}` | | 204 |
| `Todo.get` | `GET /v1/session/{id}/todo` | | `Todo[]` em `position ASC` |
| `Todo.update` | `PUT /v1/session/{id}/todo` | `Todo[]` | `Todo[]` |

Paginação de mensagens replica `MessageV2.page` (`message-v2.ts:947-986`): `ORDER BY time_created DESC, id DESC LIMIT limit+1`, predicado `time_created < t OR (time_created = t AND id < id)`, cursor `base64url({id, time})`, resposta invertida para ordem cronológica, partes ordenadas por `id`. Resposta vazia consulta a existência da sessão e devolve 404 se não existir.

`fork` replica `session.ts:768-808`: nova sessão com mesmo `projectID`, `directory`, `parentID`; copia mensagens e partes com `id < messageID` (ou todas), gerando IDs novos e mantendo a ordem, e emite `message.updated` e `message.part.updated` para cada uma.

### 4.3 O que o Go não valida

O Go não valida o conteúdo de `message.data` e `part.data` além de ser JSON válido. A responsabilidade de esquema segue no cliente (TS em M2, conversores em M3). Isso mantém o Go estável quando o TS acrescenta variante de parte, e é a razão de M3 nascer com structs completas em vez de reaproveitar structs de M1.

## 5. Eventos

### 5.1 Bus

O `internal/eventbus` atual é substituído. Problemas conhecidos: ID gerado por contador formatado como hora (não único, não monotônico), `Publish` descarta evento quando o buffer do assinante está cheio, frame SSE sem `id:`.

Novo comportamento:

- `seq` monotônico por sessão, iniciado em 0 na primeira publicação do processo, e `seq` global para o fluxo sem filtro.
- `id` do evento no esquema `evt_` de §3.4.
- Anel dos últimos 1.000 eventos por sessão e 10.000 no global, para replay.
- Sem descarte: assinante que não consome recebe `server.lagged` e é desconectado; ao reconectar com `Last-Event-ID: <seq>` recebe o que perdeu se ainda estiver no anel, senão `server.replay_unavailable` e o cliente relê o estado por HTTP.

### 5.2 Tipos e payloads

Mesmos nomes e formas do Bus TS (`session/session.ts:382-418`, `session/message-v2.ts`):

| Tipo | Payload |
| --- | --- |
| `session.created` | `{sessionID, info}` |
| `session.updated` | `{sessionID, info}` com `info` completo relido após o patch, como `server/projectors.ts:11-27` |
| `session.deleted` | `{sessionID, info}` |
| `message.updated` | `{info}` |
| `message.removed` | `{sessionID, messageID}` |
| `message.part.updated` | `{sessionID, part, time}` |
| `message.part.removed` | `{sessionID, messageID, partID}` |
| `server.connected`, `server.heartbeat`, `server.lagged`, `server.replay_unavailable` | controle |

### 5.3 Endpoints SSE

- `GET /v1/events?sessionID=<id>`: eventos da sessão.
- `GET /v1/events`: todos os eventos, para a lista de sessões em M2.
- Frame: `event: <tipo>`, `id: <seq>`, `data: <json>`. Heartbeat a cada 10 segundos. Cabeçalhos iguais aos do SSE atual.

## 6. Concorrência TS×Go no mesmo arquivo

Durante M2 os dois processos escrevem no mesmo arquivo. Garantias de M1 do lado Go:

- Escrita serializada no processo, `BEGIN IMMEDIATE`, `busy_timeout=10000`. Estouro vira 503 `busy`.
- Go não executa a rotina de recuperação de WAL. O TS executa e presume processo único; retirá-la ou condicioná-la é pré-requisito de M2 e fica registrado lá.
- Eventos SSE descrevem só escritas feitas pelo Go. Escrita do TS direto no arquivo não gera evento; a dupla escrita de M2 resolve mandando tudo pelo Go.
- Linha com `data` que não decodifica não derruba a resposta: vira placeholder e é logada.

## 7. Testes

### 7.1 Unitários Go

Banco temporário criado pela reprodução das migrações do TS, lidas em tempo de teste de `packages/teamcode/migration/*/migration.sql` (ordenadas pelo prefixo `YYYYMMDDHHMMSS`, separadas por `;`). O Go não embute o esquema; migração nova no TS é exercitada automaticamente. Cobertura mínima: cada endpoint; ordenações; cursor e `more`; delta de uso com reversão; patch com `null` e chave ausente; guarda de relógio; FK tardia engolida; `remove` recursivo; `fork`; `todo`; `schema_outdated`; 503 `busy`.

### 7.2 IDs cruzados

Fixture `go-core/internal/ident/testdata/ids-from-ts.json` gerada por script Bun a partir de `id.ts`, com 200 IDs de cada prefixo e o timestamp esperado. O teste Go verifica timestamp e ordenação.

### 7.3 Paridade TS×Go

Em `packages/core/test/parity/`, o harness existente passa a rodar o mesmo roteiro contra o `Session.Service` do TS e contra `/v1/session` do Go, cada um em seu arquivo `.db` temporário. Ao final, os dumps das tabelas `session`, `message`, `part`, `todo` são comparados campo a campo, ignorando IDs gerados e mapeando-os por posição. Hoje o harness compara o Go com expectativas fixas; M1 introduz a comparação com o TS como baseline.

### 7.4 Concorrência

Teste que grava 1.000 partes em paralelo pelo TS e pelo Go no mesmo arquivo. Critério: zero `SQLITE_BUSY` além do timeout, zero linha perdida, contadores de uso da sessão iguais à soma esperada.

### 7.5 Desempenho

`GET /v1/session/{id}/messages` com 50.000 mensagens e 5 partes cada, medido no teste de paridade com limite de 5 segundos em CI. Serve para decidir se `modernc.org/sqlite` basta ou se M2 precisa de driver cgo.

### 7.6 CI

Job `go-core` no workflow existente: `gofmt -l`, `go vet ./...`, `golangci-lint run`, `go test ./...`, disparado por mudança em `go-core/**`. Hoje não há job de Go.

## 8. Riscos

| Risco | Mitigação |
| --- | --- |
| `modernc.org/sqlite` mais lento que cgo em escrita pesada | Medido em §7.5; troca de driver é local ao `internal/store` |
| Esquema do TS muda sem atualizar a constante do Go | Modo degradado explícito em vez de escrita cega; teste unitário replica as migrações e quebra se uma tabela usada mudar |
| Dois processos no mesmo arquivo | §6; teste §7.4; M2 remove a recuperação de WAL do TS |
| Paridade incompleta por regra do TS não catalogada | Comparação de dumps em §7.3 pega divergência que o roteiro não previu |

## 9. Critérios de aceite

1. `go test ./...` verde, incluindo fixture de IDs e reprodução das 22 migrações.
2. Paridade §7.3 sem diferença de dump para o roteiro completo.
3. Concorrência §7.4 sem perda.
4. `GET /v1/session/{id}/messages` dentro do limite de §7.5.
5. `bun test` do `packages/teamcode` inalterado e verde: nada no TS muda.
6. Job de CI `go-core` verde no PR.
