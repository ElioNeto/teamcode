# Contract Mapping — TS ↔ Go Core

> Issue: [#1039](https://github.com/ElioNeto/teamcode/issues/1039)
> Documents all HTTP contracts between the TypeScript runtime and the Go core.

---

## Conventions

- **Base URL:** `http://127.0.0.1:43001` (configurable via `GO_CORE_PORT`)
- **Content-Type:** `application/json`
- **Common headers:**
  - `X-Trace-ID: <uuid>` — cross-runtime trace ID (shadow mode)
  - `X-Session-ID: <session_id>` — for session operations
- **Standard error:** `{"error": "<message>"}` with appropriate HTTP status
- **Metrics:** endpoints with status ≥500 count as errors in the circuit breaker

---

## 1. Health

### `GET /health`

**Request:** no body

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

All filesystem operations follow the TS `AppFileSystem.Interface` contract.

### `POST /fs/read`
Read file with optional offset/limit.

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
Safe read — returns `{ content, found }` instead of 404.

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
Write file (creates parent directories automatically).

**Request:**
```json
{ "path": "/home/user/file.txt", "content": "file content" }
```

**Response:** `204 No Content`

---

### `POST /fs/stat`
File/directory metadata.

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
Checks if path exists.

**Request:** `{ "path": "/home/user/file.txt" }`
**Response:** `{ "exists": true }`

---

### `POST /fs/is-dir`
Checks if it is a directory.

**Request:** `{ "path": "/home/user/dir" }`
**Response:** `{ "dir": true }`

---

### `POST /fs/is-file`
Checks if it is a file.

**Request:** `{ "path": "/home/user/file.txt" }`
**Response:** `{ "file": true }`

---

### `POST /fs/list`
Lists files in a directory.

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
Lists entries with type.

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
Glob with ** support.

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
Walks up from `start` looking for `target`.

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

**Request:** `{ "path": "/home/user/file.txt" }` (or `{ "src": ..., "dst": ... }` for copy/move)
**Response:** `204 No Content`

---

## 3. Process Spawning

### `POST /process/spawn`
Spawn a process with timeout.

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
npm install in a directory.

**Request:**
```json
{ "dir": "/tmp/project", "args": ["lodash"], "timeout_ms": 300000 }
```

**Response:** `GoCoreProcessResult`

---

### `POST /process/npx`
Executes command via npx.

**Request:**
```json
{ "dir": "/tmp/project", "args": ["typescript", "--version"], "timeout_ms": 60000 }
```

**Response:** `GoCoreProcessResult`

---

## 4. Session Events

### `POST /session/event`
Publishes event on the session bus.

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
SSE stream of events for a session.

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
Event system status.

**Response:**
```json
{ "status": "ok", "sessions": 3 }
```

---

### `GET /session/messages`
Consolidated session messages.

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
Creates a new session with metadata.

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
Gets session metadata.

**Query:** `?session_id=ses_abc123`

**Response (200):** `GoCoreSession`
**Response (404):** `{"error": "session not found"}`

---

### `POST /session/update`
Updates session title.

**Request:**
```json
{ "session_id": "ses_abc123", "title": "New Title" }
```

**Response (200):** `GoCoreSession` (with `updated_at` updated)
**Response (404):** `{"error": "session not found"}`

---

### `POST /session/delete`
Deletes a session.

**Request:** `{ "session_id": "ses_abc123" }`
**Response:** `204 No Content`
**Response (404):** `{"error": "session not found"}`

---

### `GET /session/list`
Lists sessions by directory.

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
Circuit breaker metrics (sliding window 60s).

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

| Flag | Type | Default | Usage |
|------|------|---------|-------|
| `go-core-available` | boolean | `false` | Circuit breaker enables/disables Go core |
| `go-core-filesystem` | number (canary %) | `0` | % of filesystem requests routed to Go |
| `go-core-session` | number (canary %) | `0` | % of session requests routed to Go |
| `go-core-shadow` | boolean | `false` | Shadow mode (enable via env `FLAG_filesystem_shadow=true`) |

**Override via env var:** `FLAG_<flag-name> = true|false|<number>` (underscores replace hyphens)

---

## Type Validation

The types in `client.ts` must exactly match the Go structs.
Validation is done via parity tests that verify the shape of the returned JSON.

### Compatibility rules:
1. **Snake case in Go** → **Camel case in TS?** — both use snake_case in JSON fields
2. **Timestamps** — ISO 8601 format (`time.RFC3339`) in both Go and TS
3. **Nulls/omission** — absent fields are `undefined` in TS, zero-values in Go (omitempty)
4. **Empty arrays** — Go returns `[]` (never `null`) for empty slices
