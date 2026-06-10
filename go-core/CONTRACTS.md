# Contract Mapping — TS ↔ Go Core

> Issue: [#1039](https://github.com/ElioNeto/teamcode/issues/1039)
> Documenta todos os contratos HTTP entre o runtime TypeScript e o Go core.

---

## Convenções

- **Base URL:** `http://127.0.0.1:43001` (configurável via `GO_CORE_PORT`)
- **Content-Type:** `application/json`
- **Headers comuns:**
  - `X-Trace-ID: <uuid>` — trace ID cross-runtime (shadow mode)
  - `X-Session-ID: <session_id>` — para operações de sessão
- **Erro padrão:** `{"error": "<mensagem>"}` com status HTTP apropriado
- **Métricas:** endpoints com status ≥500 contam como erro no circuit breaker

---

## 1. Health

### `GET /health`

**Request:** nenhum body

**Response (200):**
```json
{
  "status": "ok",
  "version": "0.1.0",
  "time": "2026-06-10T10:00:00Z"
}
```

**TS type:**
```typescript
{ status: string; version: string; time: string }
```

---

## 2. Filesystem

Todas as operações de filesystem seguem o contrato do `AppFileSystem.Interface` do TS.

### `POST /fs/read`
Leitura de arquivo com offset/limit opcionais.

**Request:**
```json
{
  "path": "/home/user/file.txt",
  "offset": 0,
  "limit": 1024
}
```

**Response (200):**
```json
{
  "content": "file contents...",
  "size": 1234,
  "mime_type": "text/plain",
  "binary": false
}
```

**TS type:** `GoCoreReadResult`

---

### `POST /fs/read-safe`
Leitura segura — retorna `{ content, found }` em vez de 404.

**Request:**
```json
{ "path": "/home/user/file.txt" }
```

**Response (200):**
```json
{ "content": "...", "found": true }
```

---

### `POST /fs/write`
Escrita de arquivo (cria diretórios pai automaticamente).

**Request:**
```json
{ "path": "/home/user/file.txt", "content": "file content" }
```

**Response:** `204 No Content`

---

### `POST /fs/stat`
Metadata do arquivo/diretório.

**Request:**
```json
{ "path": "/home/user/file.txt" }
```

**Response (200):**
```json
{
  "name": "file.txt",
  "size": 1234,
  "mode": "-rw-r--r--",
  "modtime": "2026-06-10T10:00:00Z",
  "dir": false
}
```

**TS type:** `GoCoreStatResult`

---

### `POST /fs/exists`
Verifica se caminho existe.

**Request:** `{ "path": "/home/user/file.txt" }`
**Response:** `{ "exists": true }`

---

### `POST /fs/is-dir`
Verifica se é diretório.

**Request:** `{ "path": "/home/user/dir" }`
**Response:** `{ "dir": true }`

---

### `POST /fs/is-file`
Verifica se é arquivo.

**Request:** `{ "path": "/home/user/file.txt" }`
**Response:** `{ "file": true }`

---

### `POST /fs/list`
Lista arquivos em diretório.

**Request:**
```json
{ "path": "/home/user", "pattern": "*.ts", "recursive": true }
```

**Response:**
```json
{ "files": ["/home/user/a.ts", "/home/user/sub/b.ts"] }
```

---

### `POST /fs/readdir`
Lista entries com tipo.

**Request:** `{ "path": "/home/user" }`

**Response:**
```json
{
  "entries": [
    { "name": "file.txt", "type": "file" },
    { "name": "subdir", "type": "directory" }
  ]
}
```

**TS type:** `GoCoreDirEntry`

---

### `POST /fs/glob`
Glob com suporte a **.

**Request:**
```json
{ "pattern": "**/*.ts", "cwd": "/home/user", "dot": false }
```

**Response:**
```json
{ "matches": ["/home/user/a.ts", "/home/user/sub/b.ts"] }
```

**TS type:** `GoCoreGlobResponse`

---

### `POST /fs/find-up`
Sobe a partir de `start` procurando `target`.

**Request:**
```json
{ "target": "package.json", "start": "/home/user/sub/project", "stop": "/home" }
```

**Response:**
```json
{ "results": ["/home/user/sub/project/package.json"] }
```

**TS type:** `GoCoreFindUpResponse`

---

### `POST /fs/copy` / `POST /fs/move` / `POST /fs/remove` / `POST /fs/remove-all`

**Request:** `{ "path": "/home/user/file.txt" }` (ou `{ "src": ..., "dst": ... }` para copy/move)
**Response:** `204 No Content`

---

## 3. Process Spawning

### `POST /process/spawn`
Spawn de processo com timeout.

**Request:**
```json
{
  "command": "echo",
  "args": ["hello"],
  "env": { "KEY": "value" },
  "cwd": "/tmp",
  "timeout_ms": 30000
}
```

**Response (200):**
```json
{
  "stdout": "hello\n",
  "stderr": "",
  "exit_code": 0,
  "timeout": false
}
```

**TS type:** `GoCoreProcessResult`

---

### `POST /process/npm-install`
npm install em diretório.

**Request:**
```json
{ "dir": "/tmp/project", "args": ["lodash"], "timeout_ms": 300000 }
```

**Response:** `GoCoreProcessResult`

---

### `POST /process/npx`
Executa comando via npx.

**Request:**
```json
{ "dir": "/tmp/project", "args": ["typescript", "--version"], "timeout_ms": 60000 }
```

**Response:** `GoCoreProcessResult`

---

## 4. Session Events

### `POST /session/event`
Publica evento no barramento de sessão.

**Request:**
```json
{
  "session_id": "ses_abc123",
  "event_type": "text.delta",
  "data": { "content": "Hello" }
}
```

**Response:** `204 No Content`

---

### `GET /session/events`
SSE stream de eventos para uma sessão.

**Query:** `?session_id=ses_abc123`

**Response:** `text/event-stream`
```
event: message
data: {"id":"evt_...","type":"text.delta","session_id":"ses_...","data":{...},"timestamp":...}

event: heartbeat
data: {"id":"evt_...","type":"server.heartbeat","session_id":"ses_...","data":{},"timestamp":...}
```

---

### `GET /session/events-status`
Status do sistema de eventos.

**Response:**
```json
{ "status": "ok", "sessions": 3 }
```

---

### `GET /session/messages`
Mensagens consolidadas da sessão.

**Query:** `?session_id=ses_abc123`

**Response:**
```json
{
  "session_id": "ses_abc123",
  "messages": [...]
}
```

**TS type:** `GoCoreMessagesResponse`

---

## 5. Session CRUD

### `POST /session/create`
Cria nova sessão com metadata.

**Request:**
```json
{
  "session_id": "ses_abc123",
  "title": "My Session",
  "directory": "/home/user/project",
  "agent": "default",
  "model": "gpt-4"
}
```

**Response (200):**
```json
{
  "id": "ses_abc123",
  "title": "My Session",
  "directory": "/home/user/project",
  "agent": "default",
  "model": "gpt-4",
  "created_at": "2026-06-10T10:00:00Z",
  "updated_at": "2026-06-10T10:00:00Z"
}
```

**TS type:** `GoCoreSession`

---

### `GET /session/get`
Obtém metadata da sessão.

**Query:** `?session_id=ses_abc123`

**Response (200):** `GoCoreSession`
**Response (404):** `{"error": "session not found"}`

---

### `POST /session/update`
Atualiza título da sessão.

**Request:**
```json
{ "session_id": "ses_abc123", "title": "New Title" }
```

**Response (200):** `GoCoreSession` (com `updated_at` atualizado)
**Response (404):** `{"error": "session not found"}`

---

### `POST /session/delete`
Deleta sessão.

**Request:** `{ "session_id": "ses_abc123" }`
**Response:** `204 No Content`
**Response (404):** `{"error": "session not found"}`

---

### `GET /session/list`
Lista sessões por diretório.

**Query:** `?directory=/home/user/project`

**Response (200):**
```json
{
  "sessions": [ ...GoCoreSession... ],
  "count": 2
}
```

**TS type:** `GoCoreSessionListResponse`

---

## 6. Metrics

### `GET /metrics`
Métricas do circuit breaker (sliding window 60s).

**Response (200):**
```json
{
  "request_count": 150,
  "error_count": 1,
  "error_rate": 0.67,
  "avg_latency_ms": 45.2
}
```

**TS type:** `GoCoreMetrics`

---

## 7. Feature Flags

| Flag | Tipo | Default | Uso |
|------|------|---------|-----|
| `go-core-available` | boolean | `false` | Circuit breaker habilita/desabilita Go core |
| `go-core-filesystem` | number (canary %) | `0` | % de requests de filesystem roteados para Go |
| `go-core-session` | number (canary %) | `0` | % de requests de sessão roteados para Go |
| `go-core-shadow` | boolean | `false` | Shadow mode (ativa via env `FLAG_filesystem_shadow=true`) |

**Override via env var:** `FLAG_<flag-name> = true|false|<number>` (underscores substituem hífens)

---

## Validação de Tipos

Os tipos no `client.ts` devem corresponder exatamente às structs Go.
A validação é feita via testes de paridade que verificam o shape do JSON retornado.

### Regras de compatibilidade:
1. **Snake case no Go** → **Camel case no TS?** — ambos usam snake_case nos campos JSON
2. **Timestamps** — formato ISO 8601 (`time.RFC3339`) tanto no Go quanto no TS
3. **Nulos/omissão** — campos ausentes são `undefined` no TS, zero-values no Go (omitempty)
4. **Arrays vazios** — Go retorna `[]` (nunca `null`) para slices vazias
