# Análise do Banco de Dados e Gargalos

## Stack

O TeamCode usa **dois** sistemas de armazenamento:

### 1. SQLite (primário) — `opencode.db`

| Item | Valor |
|------|-------|
| Engine | SQLite (via `drizzle-orm/bun-sqlite`) |
| WAL | `PRAGMA journal_mode = WAL` |
| Sincronia | `PRAGMA synchronous = NORMAL` |
| Timeout | `PRAGMA busy_timeout = 5000` |
| Cache | `PRAGMA cache_size = -64000` (~64MB) |
| FK | `PRAGMA foreign_keys = ON` |

**Responsabilidades**: Dados relacionais — sessions, messages, parts, projects, todos, eventos de sincronia, permissões.

### 2. ApexStore (secundário) — LSM-Tree KV sidecar

| Item | Valor |
|------|-------|
| Engine | ApexStore (Rust, LSM-Tree) |
| Comunicação | HTTP REST (sidecar process) |
| Autenticação | Bearer token (`teamcode-apexstore`) |

**Responsabilidades**: Cache — system prompt cache, model catalog (`models.dev`), armazenamento KV opcional.

**Não** contém dados relacionais de sessão. Os gargalos abaixo são todos no SQLite.

---

## Tabelas (SQLite)

| Tabela | Linhas esperadas | Propósito |
|--------|------------------|-----------|
| `project` | ~dezenas | Projetos do usuário |
| `session` | ~centenas/milhares | Sessões de conversa |
| `message` | ~milhares/dezenas de milhares | Mensagens por sessão |
| `part` | ~milhares/dezenas de milhares | Partes de mensagens (arquivos, ferramentas) |
| `todo` | ~centenas | TODOs por sessão |
| `session_message` | ~milhares | Sessões "v2" (novo formato) |
| `event` | ~dezenas de milhares | Eventos de sincronização |
| `event_sequence` | ~centenas | Sequência por agregado |
| `permission` | ~dezenas | Permissões por projeto |
| `share` | ~dezenas | Sessões compartilhadas |
| `account` | ~unidades | Contas conectadas |
| `workspace` | ~unidades | Workspaces |

## Indexes Existentes

```sql
-- session
session_project_idx        ON session(project_id)
session_workspace_idx      ON session(workspace_id)
session_parent_idx         ON session(parent_id)

-- message
message_session_time_created_id_idx ON message(session_id, time_created, id)

-- part
part_message_id_id_idx     ON part(message_id, id)
part_session_idx           ON part(session_id)

-- todo
todo_session_idx           ON todo(session_id)

-- session_message
session_message_session_idx           ON session_message(session_id)
session_message_session_type_idx      ON session_message(session_id, type)
session_message_time_created_idx      ON session_message(time_created)
```

## Gargalos Identificados

### 1. ⚠️ Falta índice em `session.time_updated`

**Problema**: A query de listagem de sessões ordena por `time_updated DESC` (`session.ts:1064`). Não há índice nessa coluna. Com muitos registros, o SQLite precisa fazer um `filesort` (ordenar fora do índice), que escala O(n log n) em RAM.

**Issue**: [#1081](https://github.com/ElioNeto/teamcode/issues/1081)

### 2. ⚠️ Falta índice em `session.directory`

**Problema**: A query `listGlobal` filtra por `directory` quando fornecido (`session.ts:1036`). Sem índice, o SQLite precisa escanear a tabela inteira.

**Issue**: [#1082](https://github.com/ElioNeto/teamcode/issues/1082)

### 3. ⚠️ Falta índice composto para `(project_id, parent_id, time_updated)`

**Problema**: Listagem de root sessions filtra por `project_id` + `parent_id IS NULL` e ordena por `time_updated DESC`. O índice `session_project_idx` cobre apenas `project_id`.

**Issue**: [#1083](https://github.com/ElioNeto/teamcode/issues/1083)

### 4. ⚠️ N+1 em `listGlobal`

**Problema**: A função `listGlobal` executa duas queries: uma para sessions e outra para projects. Poderia ser um único JOIN.

**Issue**: [#1084](https://github.com/ElioNeto/teamcode/issues/1084)

### 5. ⚠️ JSON em colunas de texto

**Problema**: Várias colunas armazenam dados como JSON em texto (`message.data`, `part.data`, `session.summary_diffs`, etc.). Não é possível criar índices sobre campos internos do JSON sem extensões SQLite.

**Issue**: [#1085](https://github.com/ElioNeto/teamcode/issues/1085)

### 6. ⚠️ Deleção recursiva sem batch

**Problema**: A função `remove` em `session.ts:649` é recursiva — para cada filho, chama `remove(child.id)` novamente. Para árvores grandes, dispara N deleções, N eventos de sync e N cancelamentos de jobs.

**Issue**: [#1086](https://github.com/ElioNeto/teamcode/issues/1086)

---

## Observações Positivas

- Uso de WAL mode permite leitura concurrente com escrita
- `busy_timeout = 5000` evita `SQLITE_BUSY` em contenção
- Foreign keys com `onDelete: "cascade"` simplificam a deleção
- Índices existentes em `session_id` nas tabelas filhas cobrem bem os joins por sessão
- Limite de 100/50 registros nas listagens evita explosão de resultados
