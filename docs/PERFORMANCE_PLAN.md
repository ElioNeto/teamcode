# Plano de Melhoria de Performance e Confiabilidade

> Data: 2026-07-12
> Visão: Migrar funcionalidades do core TypeScript para Go, eliminando gargalos de performance, reduzindo consumo de RAM e I/O de disco, e estabelecendo uma arquitetura de dados sustentável.

---

## Índice

1. [Estratégia de Depreciação do Core TypeScript](#1-estratégia-de-depreciação-do-core-typescript)
2. [Arquitetura Alvo — Go Core como Principal](#2-arquitetura-alvo--go-core-como-principal)
3. [Plano de Armazenamento de Dados](#3-plano-de-armazenamento-de-dados)
4. [Estrutura de Diretórios Alvo](#4-estrutura-de-diretórios-alvo)
5. [TTL e Ciclo de Vida de Dados](#5-ttl-e-ciclo-de-vida-de-dados)
6. [Goroutines e Concorrência](#6-goroutines-e-concorrência)
7. [Redução de RAM e I/O de Disco](#7-redução-de-ram-e-io-de-disco)
8. [Integração com ApexStore](#8-integração-com-apexstore)
9. [Indexação de Projetos](#9-indexação-de-projetos)
10. [Roadmap de Implementação](#10-roadmap-de-implementação)

---

## 1. Estratégia de Depreciação do Core TypeScript

### Premissas

- O core TypeScript (`packages/core/`) receberá **apenas correções de bugs críticos e patches de segurança**.
- Nenhuma nova funcionalidade será implementada em TypeScript.
- Toda nova funcionalidade será implementada **diretamente em Go** no `go-core/`.
- Funcionalidades existentes serão **migradas incrementalmente** para Go seguindo o plano abaixo.

### Barreiras de Proteção

1. **CI/CD**: Adicionar `CODEOWNERS` para que PRs tocando `packages/core/` exijam aprovação com justificativa de bug/segurança.
2. **Feature flags**: Manter as flags `go-core-available` e `TEAMCODE_GO_CORE` para alternar entre implementações durante a migração.
3. **Testes de comparação**: Para cada funcionalidade migrada, rodar testes paralelos (TS vs Go) e comparar saída.

### Funcionalidades a Migrar (por ordem de prioridade)

| Prioridade | Funcionalidade               | Core TS                    | Go Core Alvo                          | Justificativa                                 |
| ---------- | ---------------------------- | -------------------------- | ------------------------------------- | --------------------------------------------- |
| P0         | Session store + CRUD         | `session.ts`               | `session/store.go`                    | Atual é in-memory sem persistência            |
| P0         | Message persistence          | `message-v2.ts`            | Novo: `session/message_store.go`      | Essencial para sessões sobreviverem a restart |
| P1         | Provider catalog + discovery | `provider.ts`, `models.ts` | `provider/catalog.go` (hoje estático) | Precisa de refresh dinâmico                   |
| P1         | Project indexing             | `project-index/`           | Novo: `project/indexer.go`            | Base para busca rápida                        |
| P2         | File system operations       | `filesystem.ts`            | `internal/filesystem/adapter.go`      | Já parcial em Go                              |
| P2         | Config management            | `config/`                  | `internal/config/`                    | Já parcial em Go                              |
| P3         | Auth (OAuth, API keys)       | `auth/`                    | Novo: `internal/auth/`                | Segurança                                     |
| P3         | Plugin system                | `plugin/`                  | Novo: `internal/plugin/`              | Requer WASM ou IPC                            |

---

## 2. Arquitetura Alvo — Go Core como Principal

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                     teamcode CLI (TS)                     │
│  (thin shell — apenas parsing de args, TUI, output)      │
└──────────────┬──────────────────────────────────────────┘
               │ HTTP (localhost:43001)
               ▼
┌─────────────────────────────────────────────────────────┐
│                    Go Core Server                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ HTTP Router  │  │  Event Bus   │  │ Swarm Engine   │  │
│  │ (net/http)   │  │ (chan-based) │  │ (goroutines)   │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬────────┘  │
│         │                 │                   │           │
│  ┌──────▼─────────────────▼───────────────────▼────────┐  │
│  │              Service Layer                            │  │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐   │  │
│  │  │ Session │ │ Project  │ │ Config │ │ Provider │   │  │
│  │  │ Service │ │ Indexer  │ │ Store  │ │ Catalog  │   │  │
│  │  └────┬────┘ └────┬─────┘ └───┬────┘ └────┬─────┘   │  │
│  └───────┼───────────┼───────────┼───────────┼─────────┘  │
│          │           │           │           │            │
│  ┌───────▼───────────▼───────────▼───────────▼─────────┐  │
│  │              Storage Layer                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │  │
│  │  │ ApexStore │  │ SQLite   │  │ LRU Cache        │   │  │
│  │  │ (LSM-Tree)│  │ (Drizzle)│  │ (internal/cache) │   │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Princípios da Arquitetura

1. **Go core é o source of truth**: Todo estado transiente e permanente reside no Go core.
2. **TypeScript é thin client**: Apenas TUI, parsing de args, e output formatting.
3. **Comunicação via HTTP**: TS → Go core via REST API em `localhost:43001`.
4. **Event bus interno**: Go core usa `channel`-based event bus para comunicação assíncrona entre serviços.
5. **Cache em camadas**: LRU em memória → ApexStore (LSM-Tree) → SQLite (relacional).

---

## 3. Plano de Armazenamento de Dados

### Diagnóstico do Estado Atual

| Aspecto   | Estado Atual                          | Problema                                     |
| --------- | ------------------------------------- | -------------------------------------------- |
| Sessões   | SQLite + arrays em memória no Go core | Instável — Go core perde estado ao reiniciar |
| Mensagens | SQLite (message + part tables)        | Queries complexas, N+1 em partes             |
| Projetos  | SQLite (project table) + JSON legacy  | Indexação separada em `index/<hash>/`        |
| Modelos   | `models.json` em disco + ApexStore    | Cache TTL de 60 min, fetch síncrono          |
| Config    | JSON em disco + ApexStore             | Leitura toda vez que precisa                 |
| Logs      | Arquivos em `log/`                    | Sem rotação, sem compressão                  |
| Temporary | `~/tmp/teamcode/`                     | Sem limpeza                                  |

### Estrutura Alvo

```
~/.local/share/teamcode/
├── apexstore/                    # LSM-Tree database (ApexStore)
│   ├── sessions/                 # Namespace: sessões
│   ├── projects/                 # Namespace: projetos
│   ├── messages/                 # Namespace: mensagens
│   ├── config/                   # Namespace: configurações
│   └── index/                    # Namespace: índices
│
├── projects/                     # Dados particionados por projeto
│   └── <project-hash>/
│       ├── index/                # Índice de arquivos do projeto
│       │   ├── file-tree.json    # Snapshot da árvore (última scan)
│       │   ├── deps.json         # Dependências detectadas
│       │   └── symbols.json      # Símbolos do projeto
│       │
│       ├── objects/              # Objetos binários (blobs)
│       │   └── <sha256>/         # Content-addressable storage
│       │
│       ├── logs/                 # Logs específicos do projeto
│       │   ├── session.log       # Logs de sessão
│       │   └── indexer.log       # Logs do indexador
│       │
│       └── sessions/             # Cache de sessões ativas
│           └── <session-id>.json # Snapshot recente da sessão
│
├── index/                        # Índice global (fallback)
│   └── <project-hash>/
│
├── logs/                         # Logs globais
│   ├── go-core.log               # Log do servidor Go core
│   └── teamcode.log              # Log da CLI
│
├── opencode.db                   # SQLite (transições — será eliminado)
├── opencode.db-wal               # WAL do SQLite
└── opencode.db-shm               # SHM do SQLite
```

### Estratégia de Migração

1. **Fase 1 (curto prazo)**: Go core escreve sessões no ApexStore em paralelo com o SQLite atual.
2. **Fase 2 (médio prazo)**: Leituras passam a vir do ApexStore com fallback para SQLite.
3. **Fase 3 (longo prazo)**: SQLite eliminado; tudo no ApexStore + estrutura de projetos.

---

## 4. Estrutura de Diretórios Alvo — Detalhamento

### `projects/<project-hash>/`

Cada projeto aberto ganha seu próprio diretório com dados particionados:

```
├── index/
│   ├── file-tree.json            # Snapshot completo (árvore de arquivos)
│   ├── deps.json                 # Dependências (package.json, go.mod, Cargo.toml, etc.)
│   ├── symbols.json              # Símbolos (classes, funções, etc.)
│   └── last-scan.at              # Timestamp da última varredura
│
├── objects/
│   └── <sha256[:2]>/<sha256[2:]> # Blobs content-addressable (ex: a1/b2c3d4...)
│       └── data                  # Conteúdo comprimido (LZ4/zstd)
│
├── logs/
│   ├── indexer.log               # Log do processo de indexação
│   └── session-<id>.log          # Logs por sessão (rotacionados)
│
└── sessions/
    ├── active/                   # Sessões ativas (link simbólico ou cópia)
    │   └── <session-id>.json     # Snapshot recente
    └── archive/                  # Sessões antigas (purged após TTL)
```

### Implementação em Go

```go
type ProjectDir struct {
    Root     string // ~/.local/share/teamcode/projects/<hash>
    Index    string // Root + "/index"
    Objects  string // Root + "/objects"
    Logs     string // Root + "/logs"
    Sessions string // Root + "/sessions"
}

func NewProjectDir(projectID string) *ProjectDir {
    root := path.Join(dataDir, "projects", projectID)
    return &ProjectDir{
        Root:     root,
        Index:    path.Join(root, "index"),
        Objects:  path.Join(root, "objects"),
        Logs:     path.Join(root, "logs"),
        Sessions: path.Join(root, "sessions"),
    }
}
```

---

## 5. TTL e Ciclo de Vida de Dados

### Política de TTL

| Tipo de Dado        | TTL Padrão | Renovação                | Ação ao Expirar               |
| ------------------- | ---------- | ------------------------ | ----------------------------- |
| Sessões arquivadas  | 7 dias     | Ao acessar a sessão      | Purge do ApexStore + arquivos |
| Mensagens de sessão | 7 dias     | Ao acessar a sessão      | Purge do ApexStore            |
| Logs de sessão      | 7 dias     | Não renovável            | Rotação + delete              |
| Cache de modelo     | 60 min     | Ao fazer refresh         | Refetch do `models.dev`       |
| Index de projeto    | 24h        | Ao abrir o projeto       | Rescan                        |
| File tree snapshot  | 1h         | Ao detectar mudanças     | Rescan                        |
| Blobs de objeto     | 30 dias    | Ao referenciar em sessão | GC (sweep)                    |
| Logs globais        | 30 dias    | Não renovável            | Rotação + compressão          |

### Implementação do TTL

```go
type TTLManager struct {
    store *apexstore.Client // ou acesso direto ao ApexStore
}

func (m *TTLManager) SetWithTTL(namespace, key string, value []byte, ttl time.Duration) error {
    expiresAt := time.Now().Add(ttl)
    // ApexStore nativamente suporta expires_at no LogRecord
    return m.store.Put(namespace, key, value, apexstore.WithTTL(expiresAt))
}

func (m *TTLManager) GetAndRenew(namespace, key string, ttl time.Duration) ([]byte, error) {
    val, err := m.store.Get(namespace, key)
    if err != nil {
        return nil, err
    }
    // Renova o TTL
    err = m.store.Touch(namespace, key, time.Now().Add(ttl))
    return val, err
}
```

### Scheduler de Purge

```go
type PurgeScheduler struct {
    ticker *time.Ticker
    store  *apexstore.Client
}

func (p *PurgeScheduler) Start(ctx context.Context) {
    p.ticker = time.NewTicker(1 * time.Hour)
    go func() {
        for {
            select {
            case <-p.ticker.C:
                p.purgeExpired()
            case <-ctx.Done():
                return
            }
        }
    }()
}

func (p *PurgeScheduler) purgeExpired() {
    // ApexStore já trata TTL nativamente em get/scan/compaction
    // Este scheduler força uma limpeza periódica para reclaim de espaço
    p.store.Compact() // força compactação para remover registros expirados
}
```

---

## 6. Goroutines e Concorrência

### Padrões de Concorrência no Go Core

#### 6.1 Pool de Workers para Tarefas CPU-bound

```go
// internal/pool/pool.go — já existe, usar como base
type Pool struct {
    workers chan struct{}
    wg      sync.WaitGroup
}

func (p *Pool) Submit(fn func()) {
    p.workers <- struct{}{}
    p.wg.Add(1)
    go func() {
        defer p.wg.Done()
        defer func() { <-p.workers }()
        fn()
    }()
}
```

**Aplicações:**

- Indexação de projetos (file tree scan, symbol extraction)
- Compressão/descompressão de objetos
- Compaction de ApexStore
- Cálculo de métricas e estatísticas

#### 6.2 Event Bus com Fan-Out

```go
// internal/eventbus/event.go — já existe, melhorar
type EventBus struct {
    subscribers map[string][]chan Event
    mu          sync.RWMutex
}

func (b *EventBus) Publish(topic string, event Event) {
    b.mu.RLock()
    defer b.mu.RUnlock()
    for _, ch := range b.subscribers[topic] {
        // Non-blocking send: se o subscriber está lento, dropa o evento
        select {
        case ch <- event:
        default:
            log.Warn("dropping event, subscriber slow", "topic", topic)
        }
    }
}
```

**Melhorias propostas:**

- Usar `chan` com buffer configurável (evitar bloqueio do publisher)
- Adicionar backpressure: quando buffer > 80%, aplicar lentidão ao publisher
- Usar `sync.Pool` para objetos de evento (reduzir GC)

#### 6.3 Pipeline com Fan-Out/Fan-In

```go
// Pipeline de indexação de projeto
func IndexProject(ctx context.Context, dir string) (*Index, error) {
    // Stage 1: Scan file tree (1 goroutine)
    filesCh := make(chan FileInfo, 100)
    go func() {
        defer close(filesCh)
        filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
            select {
            case filesCh <- FileInfo{Path: path, Info: info}:
            case <-ctx.Done():
                return ctx.Err()
            }
            return nil
        })
    }()

    // Stage 2: Parse files in parallel (N goroutines)
    parsedCh := make(chan ParsedFile, 100)
    var wg sync.WaitGroup
    for i := 0; i < runtime.GOMAXPROCS(0); i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for file := range filesCh {
                result := parseFile(file)
                parsedCh <- result
            }
        }()
    }
    go func() {
        wg.Wait()
        close(parsedCh)
    }()

    // Stage 3: Aggregator (1 goroutine)
    index := NewIndex()
    for parsed := range parsedCh {
        index.Merge(parsed)
    }
    return index, nil
}
```

#### 6.4 Rate Limiting para I/O

```go
// Limitar leituras de disco para evitar thrashing
type RateLimiter struct {
    tokens chan struct{}
}

func NewRateLimiter(maxIOPS int) *RateLimiter {
    return &RateLimiter{tokens: make(chan struct{}, maxIOPS)}
}

func (r *RateLimiter) Acquire(ctx context.Context) error {
    select {
    case r.tokens <- struct{}{}:
        return nil
    case <-ctx.Done():
        return ctx.Err()
    }
}

func (r *RateLimiter) Release() {
    <-r.tokens
}
```

#### 6.5 Graceful Shutdown

```go
type Server struct {
    srv     *http.Server
    bus     *EventBus
    pool    *Pool
    cleanup []func()
}

func (s *Server) Shutdown(ctx context.Context) error {
    // 1. Parar de aceitar novas requisições
    s.srv.Shutdown(ctx)

    // 2. Drenar event bus
    s.bus.Drain()

    // 3. Aguardar workers
    s.pool.Wait()

    // 4. Flush ApexStore
    s.store.Flush()

    // 5. Cleanup resources
    for _, fn := range s.cleanup {
        fn()
    }
    return nil
}
```

---

## 7. Redução de RAM e I/O de Disco

### 7.1 Diagnóstico de Consumo Atual

| Operação               | RAM Atual                                               | I/O Disco Atual                        | Problema                                            |
| ---------------------- | ------------------------------------------------------- | -------------------------------------- | --------------------------------------------------- |
| Session messages load  | ALTA — carrega 200 mensagens + todas as parts no SQLite | ALTO — query N+1 para buscar parts     | `resolveSession()` → `MessageV2.page()` → `parts()` |
| Provider catalog fetch | MÉDIA — JSON de 5MB+ em memória                         | MÉDIO — download e write `models.json` | Sem cache incremental                               |
| File tree scan         | ALTA — recursão em diretórios grandes                   | ALTO — lê metadata de cada arquivo     | Sem watcher incremental                             |
| Logging                | BAIXA                                                   | ALTO — escrita síncrona em arquivo     | Sem buffer, sem batch                               |

### 7.2 Soluções Propostas

#### Lazy Loading de Parts

```go
// Em vez de carregar todas as parts de uma mensagem:
type Message struct {
    ID        string          `json:"id"`
    SessionID string          `json:"session_id"`
    Type      string          `json:"type"`
    Data      json.RawMessage `json:"data"`
    PartIDs   []string        `json:"part_ids,omitempty"`  // apenas IDs
}

// As parts são carregadas sob demanda:
func (s *MessageStore) GetPart(messageID, partID string) (*Part, error) {
    return s.apexStore.Get(namespace("messages"), key(messageID, partID))
}
```

#### Cache com Write-Through

```go
type CachedStore struct {
    lru   *cache.Cache[[]byte]  // LRU cache em memória
    store *apexstore.Client     // ApexStore (disco)
}

func (c *CachedStore) Get(ctx context.Context, key string) ([]byte, error) {
    // 1. Tenta LRU (RAM, zero-copy)
    if val, ok := c.lru.Get(key); ok {
        return val, nil
    }

    // 2. Tenta ApexStore (disco, mmap)
    val, err := c.store.Get(ctx, key)
    if err != nil {
        return nil, err
    }

    // 3. Popula LRU
    c.lru.Set(key, val)
    return val, nil
}

func (c *CachedStore) Set(ctx context.Context, key string, value []byte, ttl time.Duration) error {
    // Write-through: escreve no ApexStore primeiro
    if err := c.store.Put(ctx, key, value, apexstore.WithTTL(ttl)); err != nil {
        return err
    }
    // Depois atualiza cache
    c.lru.Set(key, value)
    return nil
}
```

#### Buffer de WAL com Batch

```go
type BatchWriter struct {
    mu      sync.Mutex
    buffer  []Write
    maxSize int
    flushInterval time.Duration
}

func (b *BatchWriter) Write(key string, value []byte) error {
    b.mu.Lock()
    b.buffer = append(b.buffer, Write{Key: key, Value: value})
    shouldFlush := len(b.buffer) >= b.maxSize
    b.mu.Unlock()

    if shouldFlush {
        go b.Flush() // async flush
    }
    return nil
}

func (b *BatchWriter) Flush() error {
    b.mu.Lock()
    batch := b.buffer
    b.buffer = nil
    b.mu.Unlock()

    if len(batch) == 0 {
        return nil
    }

    // Write batch atomically via ApexStore transaction
    return b.store.Transaction(func(tx *apexstore.Transaction) error {
        for _, w := range batch {
            tx.Put(w.Key, w.Value)
        }
        return nil
    })
}
```

#### Streaming de Logs com Rotação

```go
type RotatingLogger struct {
    dir       string
    maxSize   int64  // bytes antes de rotacionar
    maxFiles  int    // max arquivos antes de deletar
    compress  bool   // comprimir logs antigos com gzip/zstd
    current   *os.File
    mu        sync.Mutex
}

func (l *RotatingLogger) Write(p []byte) (n int, err error) {
    l.mu.Lock()
    defer l.mu.Unlock()

    if l.shouldRotate() {
        l.rotate()
    }
    return l.current.Write(p)
}
```

---

## 8. Integração com ApexStore

### 8.1 O que é ApexStore

ApexStore é um banco de dados LSM-tree escrito em Rust com:

- **MemTable** (BTreeMap in-memory)
- **WAL** (Write-Ahead Log, V3 com criptografia AES-256-GCM)
- **SSTables** (V2 com sparse index, LZ4 compression, Bloom filters)
- **Compaction** lazy-leveling
- **TTL nativo** (`expires_at` em `LogRecord`)
- **Block cache global** (LRU, zero-copy via mmap)
- **Snapshot/Restore**
- **ACID transactions**
- **REST API + GraphQL**

### 8.2 Namespaces Propostos

| Namespace ApexStore | Conteúdo                 | TTL            | Chave                        |
| ------------------- | ------------------------ | -------------- | ---------------------------- |
| `sessions:meta`     | Metadados de sessão      | 7d (renovável) | `session:{id}`               |
| `sessions:messages` | Mensagens de sessão      | 7d (renovável) | `session:{id}:msg:{msgID}`   |
| `sessions:parts`    | Partes de mensagem       | 7d (renovável) | `session:{id}:part:{partID}` |
| `projects:meta`     | Metadados de projeto     | 7d (renovável) | `project:{id}`               |
| `projects:index`    | Índices de projeto       | 24h            | `project:{id}:index:{type}`  |
| `config:global`     | Configuração global      | ∞              | `config:{key}`               |
| `config:project`    | Configuração por projeto | ∞              | `config:project:{id}:{key}`  |
| `cache:models`      | Catálogo de modelos      | 60min          | `cache:models:{hash}`        |
| `cache:filetree`    | File tree snapshots      | 1h             | `cache:filetree:{id}`        |

### 8.3 Interface Go para ApexStore

```go
package apexstore

import (
    "context"
    "time"
)

type Client struct {
    baseURL string
    http    *http.Client
}

func NewClient(baseURL string) *Client {
    return &Client{
        baseURL: baseURL,
        http: &http.Client{
            Timeout: 5 * time.Second,
        },
    }
}

func (c *Client) Get(ctx context.Context, namespace, key string) ([]byte, error) {
    // GET /api/kv/{namespace}/{key}
}

func (c *Client) Put(ctx context.Context, namespace, key string, value []byte, opts ...PutOption) error {
    // PUT /api/kv/{namespace}/{key}
    // with optional ttl header
}

func (c *Client) Touch(ctx context.Context, namespace, key string, ttl time.Duration) error {
    // PATCH /api/kv/{namespace}/{key}/touch?ttl=<duration>
}

func (c *Client) Delete(ctx context.Context, namespace, key string) error {
    // DELETE /api/kv/{namespace}/{key}
}

func (c *Client) Scan(ctx context.Context, namespace, prefix string) (Iterator, error) {
    // GET /api/kv/{namespace}?prefix={prefix}
}

func (c *Client) Transaction(ctx context.Context, fn func(tx *Transaction) error) error {
    // POST /api/transaction
}
```

### 8.4 Integração como Sidecar vs Embarcado

**Opção A — Sidecar (recomendada para início):**

- ApexStore roda como processo separado (ou embutido no Go core como subprocesso)
- Comunicação via HTTP REST
- Vantagem: isolamento, ApexStore pode ser atualizado independentemente
- Desvantagem: latência de rede (localhost, ~1ms)

**Opção B — Embarcado (futuro):**

- Usar FFI (CGo) para ligar Go → Rust ApexStore
- Vantagem: zero-copy, latência mínima
- Desvantagem: complexidade de build, CGo overhead

**Recomendação:** Começar com Opção A (sidecar), evoluir para Opção B se necessário.

---

## 9. Indexação de Projetos

### 9.1 O que Indexar

| Tipo de Índice | Frequência          | Conteúdo                                                         |
| -------------- | ------------------- | ---------------------------------------------------------------- |
| File Tree      | On open + watch     | Árvore de diretórios com hashes de conteúdo                      |
| Dependencies   | On open + on change | `package.json`, `go.mod`, `Cargo.toml`, `requirements.txt`, etc. |
| Symbols        | On open + on change | Classes, funções, interfaces, types                              |
| Git History    | On demand           | Commits, branches, diffs                                         |
| Search Index   | Background          | Conteúdo textual para busca full-text                            |

### 9.2 Implementação do Indexer

```go
// internal/project/indexer.go
type Indexer struct {
    queue   chan string       // projetos para indexar
    results chan IndexResult
    pool    *pool.Pool
    store   *CachedStore
}

func (idx *Indexer) Start(ctx context.Context) {
    go func() {
        for {
            select {
            case projectID := <-idx.queue:
                idx.index(projectID)
            case <-ctx.Done():
                return
            }
        }
    }()
}

func (idx *Indexer) index(projectID string) {
    dir := projectDir(projectID)

    // 1. File tree scan (rápido, só stat)
    tree := scanFileTree(dir)
    idx.store.Set(namespace("projects:index"), key(projectID, "filetree"), tree, 1*time.Hour)

    // 2. Parse deps (médio, ler arquivos específicos)
    deps := parseDependencies(dir)
    idx.store.Set(namespace("projects:index"), key(projectID, "deps"), deps, 24*time.Hour)

    // 3. Symbols (lento, parser de código)
    // Rodar em background com prioridade baixa
    go func() {
        symbols := extractSymbols(dir)
        idx.store.Set(namespace("projects:index"), key(projectID, "symbols"), symbols, 24*time.Hour)
    }()
}
```

### 9.3 Watcher de Arquivos

```go
// Usar o watcher existente (internal/watcher/watcher.go) que já usa fsnotify
type WatchedProject struct {
    dir     string
    watcher *fsnotify.Watcher
    events  chan fsnotify.Event
    debounce time.Duration
}

func (w *WatchedProject) Watch(ctx context.Context, indexer *Indexer) {
    timer := time.NewTimer(w.debounce)
    timer.Stop()

    for {
        select {
        case event := <-w.events:
            if isRelevant(event) {
                timer.Reset(w.debounce) // debounce 5s
            }
        case <-timer.C:
            // Reindexar após alterações
            indexer.Enqueue(w.projectID)
        case <-ctx.Done():
            return
        }
    }
}
```

### 9.4 Indexação para Full-Text Search

```go
// Usar o SQLite FTS5 para busca full-text de sessões
type FullTextIndex struct {
    db *sqlite.Conn
}

func (f *FullTextIndex) IndexMessage(sessionID, messageID, content string) error {
    // INSERT INTO messages_fts(rowid, session_id, content) VALUES(?, ?, ?)
}

func (f *FullTextIndex) Search(query string, limit int) ([]SearchResult, error) {
    // SELECT ... FROM messages_fts WHERE content MATCH ?
}
```

---

## 10. Roadmap de Implementação

### Fase 1 — Fundação (Sprint 1-2)

| Tarefa | Esforço                                                    | Dependências |
| ------ | ---------------------------------------------------------- | ------------ |
| 1.1    | Adicionar `CODEOWNERS` para `packages/core/`               | 1h           | Nenhuma           |
| 1.2    | Migrar session store Go para usar ApexStore (persistência) | 3d           | ApexStore rodando |
| 1.3    | Implementar TTL manager + purge scheduler                  | 2d           | 1.2               |
| 1.4    | Criar estrutura de diretório `projects/<hash>/`            | 1d           | Nenhuma           |
| 1.5    | Implementar LRU cache em memória para mensagens            | 1d           | Nenhuma           |

**Entregas:** Go core não perde sessões ao reiniciar; sessões expiram em 7 dias.

### Fase 2 — Indexação e Projetos (Sprint 3-4)

| Tarefa | Esforço                               | Dependências |
| ------ | ------------------------------------- | ------------ |
| 2.1    | Implementar file tree indexer         | 3d           | 1.4     |
| 2.2    | Implementar dependency parser         | 2d           | 2.1     |
| 2.3    | Implementar file watcher com debounce | 2d           | 2.1     |
| 2.4    | Adicionar batch writer para logs      | 1d           | Nenhuma |
| 2.5    | Adicionar rate limiter de I/O         | 1d           | Nenhuma |

**Entregas:** Projetos são indexados ao abrir; logs são escritos em batch.

### Fase 3 — Migração de Funcionalidades (Sprint 5-8)

| Tarefa | Esforço                                       | Dependências |
| ------ | --------------------------------------------- | ------------ |
| 3.1    | Migrar provider catalog para refresh dinâmico | 3d           | 1.2     |
| 3.2    | Migrar config management para Go              | 2d           | 1.2     |
| 3.3    | Migrar auth management para Go                | 3d           | 3.2     |
| 3.4    | Implementar graceful shutdown                 | 1d           | Nenhuma |
| 3.5    | Adicionar métricas e tracing (OpenTelemetry)  | 2d           | Nenhuma |

**Entregas:** Go core autossuficiente para funcionalidades core.

### Fase 4 — Otimização (Sprint 9-10)

| Tarefa | Esforço                                          | Dependências |
| ------ | ------------------------------------------------ | ------------ |
| 4.1    | Pipeline paralelo de indexação (fan-out/fan-in)  | 2d           | 2.1     |
| 4.2    | Cache with write-through para todas as operações | 2d           | 1.5     |
| 4.3    | Lazy loading de parts de mensagem                | 1d           | 1.2     |
| 4.4    | Compactação + compressão de logs                 | 2d           | 2.4     |
| 4.5    | Profile-guided optimization (PGO)                | 1d           | Nenhuma |

**Entregas:** Redução mensurável de RAM (target: -40%) e I/O (target: -60%).

### Fase 5 — Eliminação do Core TS (Sprint 11-12)

| Tarefa | Esforço                                  | Dependências |
| ------ | ---------------------------------------- | ------------ |
| 5.1    | Remover fallbacks para implementações TS | 2d           | Fases 1-4 |
| 5.2    | Remover SQLite (migrar para ApexStore)   | 3d           | 1.2, 3.2  |
| 5.3    | Testes de comparação TS vs Go            | 3d           | 5.1       |
| 5.4    | Documentação da arquitetura final        | 1d           | Nenhuma   |

**Entregas:** Core TypeScript completamente substituído.

---

## Métricas de Sucesso

| Métrica                 | Valor Atual  | Alvo              | Medição                      |
| ----------------------- | ------------ | ----------------- | ---------------------------- |
| Startup time (frio)     | >10 min      | <30s              | `time teamcode run`          |
| Startup time (quente)   | ~30s         | <5s               | `time teamcode run`          |
| Session load (200 msg)  | ~2s          | <200ms            | `time teamcode session show` |
| RAM idle                | ~150MB       | <50MB             | `ps -o rss`                  |
| RAM durante sessão      | ~500MB       | <200MB            | `ps -o rss`                  |
| Disk I/O (scan inicial) | ~100MB lidos | <10MB             | `iotop`                      |
| Session resume          | >10min       | <5s               | Experiência do usuário       |
| Logs por sessão         | ~50MB        | <5MB (comprimido) | `du -sh logs/`               |

---

## Riscos e Mitigações

| Risco                                        | Probabilidade | Impacto | Mitigação                           |
| -------------------------------------------- | ------------- | ------- | ----------------------------------- |
| ApexStore não performa como esperado         | Média         | Alto    | Benchmarks antes da migração        |
| Perda de dados durante migração              | Baixa         | Crítico | Rollback automático, snapshots      |
| Go core consome mais RAM que TS              | Média         | Médio   | Profile contínuo, heap profiling    |
| Compatibilidade reversa quebrada             | Baixa         | Alto    | Feature flags, testes de comparação |
| Time de desenvolvimento não tem expertise Go | Alta          | Alto    | Pair programming, code review       |

---

## Apêndice A: Estrutura Final de Diretórios

```
~/.local/share/teamcode/
├── apexstore/                    # LSM-Tree (ApexStore data dir)
├── projects/
│   └── <project-hash>/
│       ├── index/
│       ├── objects/
│       ├── logs/
│       └── sessions/
├── index/                        # Índice global
├── logs/                         # Logs do Go core + CLI
├── config/                       # Configurações (se não estiverem no ApexStore)
└── tmp/                          # Arquivos temporários

~/.cache/teamcode/
├── bin/                          # Binários baixados
└── models/                       # Cache de catálogo de modelos
```

## Apêndice B: Comparativo TTL

| Estratégia                | Vantagens                    | Desvantagens                  |
| ------------------------- | ---------------------------- | ----------------------------- |
| **Sessões por diretório** | Isolamento, fácil de deletar | Mais I/O para abrir projeto   |
| **Apenas ApexStore**      | Menos I/O, TTL nativo        | Perde estrutura de diretórios |
| **Misto (recomendado)**   | Cache rápido + persistência  | Complexidade de sincronia     |

A abordagem mista recomendada:

- **ApexStore** para dados estruturados (sessões, mensagens, config)
- **Diretórios de projeto** para dados de indexação e objetos binários
- **SQLite** eliminado ao final da Fase 5
