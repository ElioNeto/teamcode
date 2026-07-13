// go-core — Adaptive sidecar server for TeamCode.
//
// Communication:
//   - Unix Domain Socket (local Linux/macOS): fastest, no port conflicts
//   - TCP (Docker/VPS/Windows): configurable via GO_CORE_ADDR or GO_CORE_PORT
//   - Auto-detection: checks for Docker environment, platform support
//
// Resource management:
//   - Worker pool for CPU-bound tasks (configurable via GO_CORE_WORKERS)
//   - LRU caches for filesystem stat/read/dir operations
//   - Buffer pools for JSON serialization
//   - Ring buffer for high-throughput event streaming
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"strconv"
	"syscall"
	"time"

	"github.com/ElioNeto/teamcode/go-core/internal/pool"
	"github.com/ElioNeto/teamcode/go-core/internal/transport"
)

// Build info (set via -ldflags)
var (
	Version   = "dev"
	Commit    = "none"
	BuildTime = "unknown"
)

func main() {
	log.SetFlags(0) // Clean log output, no timestamps (managed by TS side)

	mux := http.NewServeMux()

	// -----------------------------------------------------------------------
	// Routes
	// -----------------------------------------------------------------------

	// Health
	mux.HandleFunc("GET /health", handleHealth)

	// Info (version, build info)
	mux.HandleFunc("GET /info", handleInfo)

	// Filesystem
	mux.HandleFunc("POST /fs/read", handleFSRead)
	mux.HandleFunc("POST /fs/read-safe", handleFSReadSafe)
	mux.HandleFunc("POST /fs/read-json", handleFSReadJSON)
	mux.HandleFunc("POST /fs/write", handleFSWrite)
	mux.HandleFunc("POST /fs/write-json", handleFSWriteJSON)
	mux.HandleFunc("POST /fs/list", handleFSList)
	mux.HandleFunc("POST /fs/stat", handleFSStat)
	mux.HandleFunc("POST /fs/exists", handleFSExists)
	mux.HandleFunc("POST /fs/is-dir", handleFSIsDir)
	mux.HandleFunc("POST /fs/is-file", handleFSIsFile)
	mux.HandleFunc("POST /fs/ensure-dir", handleFSEnsureDir)
	mux.HandleFunc("POST /fs/readdir", handleFSReaddir)
	mux.HandleFunc("POST /fs/glob", handleFSGlob)
	mux.HandleFunc("POST /fs/glob-match", handleFSGlobMatch)
	mux.HandleFunc("POST /fs/find-up", handleFSFindUp)
	mux.HandleFunc("POST /fs/up", handleFSUp)
	mux.HandleFunc("POST /fs/glob-up", handleFSGlobUp)
	mux.HandleFunc("POST /fs/copy", handleFSCopy)
	mux.HandleFunc("POST /fs/move", handleFSMove)
	mux.HandleFunc("POST /fs/remove", handleFSRemove)
	mux.HandleFunc("POST /fs/remove-all", handleFSRemoveAll)
	mux.HandleFunc("GET /fs/watch", handleFSWatch)

	// Process spawning
	mux.HandleFunc("POST /process/spawn", handleSpawn)
	mux.HandleFunc("POST /process/npm-install", handleNpmInstall)
	mux.HandleFunc("POST /process/npx", handleNpx)

	// Provider catalog
	mux.HandleFunc("GET /providers", handleProviderList)
	mux.HandleFunc("GET /providers/{name}/models", handleProviderModels)

	// Config system
	mux.HandleFunc("POST /config/get", handleConfigGet)
	mux.HandleFunc("POST /config/invalidate", handleConfigInvalidate)

	// Metrics
	mux.HandleFunc("GET /metrics", handleMetrics)

	// Session events
	mux.HandleFunc("GET /session/events", handleSessionEvents)
	mux.HandleFunc("POST /session/event", handleSessionEvent)
	mux.HandleFunc("GET /session/events-status", handleSessionStreamStatus)
	mux.HandleFunc("GET /session/messages", handleSessionMessages)

	// Session CRUD
	mux.HandleFunc("POST /session/create", handleSessionCreate)
	mux.HandleFunc("GET /session/get", handleSessionGet)
	mux.HandleFunc("POST /session/update", handleSessionUpdate)
	mux.HandleFunc("POST /session/delete", handleSessionDelete)
	mux.HandleFunc("GET /session/list", handleSessionList)

	// Swarm
	mux.HandleFunc("POST /swarm/run", handleSwarmRun)
	mux.HandleFunc("DELETE /swarm/{id}", handleSwarmCancel)
	mux.HandleFunc("GET /swarm/{id}/status", handleSwarmStatus)
	mux.HandleFunc("POST /swarm/{id}/agent/{agentId}/tool_result", handleSwarmToolResult)

	// -----------------------------------------------------------------------
	// Server
	// -----------------------------------------------------------------------

	// Configure worker pool based on available CPUs
	workerCount := runtime.GOMAXPROCS(0) * 2
	if env := os.Getenv("GO_CORE_WORKERS"); env != "" {
		if n, err := strconv.Atoi(env); err == nil && n > 0 {
			workerCount = n
		}
	}
	pool.GlobalWorkerPool = pool.NewWorkerPool(workerCount)

	handler := withMiddleware(withPool(mux))

	listener, resolvedAddr, err := transport.Listen()
	if err != nil {
		log.Fatalf("go-core: failed to listen: %v", err)
	}

	server := &http.Server{
		Handler:           handler,
		ReadTimeout:       30 * time.Second,
		ReadHeaderTimeout: 5 * time.Second,
		WriteTimeout:      5 * time.Minute, // Allows long-lived SSE streams
		IdleTimeout:       2 * time.Minute,
	}

	// Graceful shutdown
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	go func() {
		<-ctx.Done()
		log.Println("go-core: shutting down...")
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		server.Shutdown(shutdownCtx)
	}()

	isUnix := transport.IsUnixSocket(resolvedAddr)
	if isUnix {
		log.Printf("go-core: listening on unix:%s (version=%s commit=%s)", resolvedAddr, Version, Commit)
	} else {
		log.Printf("go-core: listening on tcp:%s (version=%s commit=%s)", resolvedAddr, Version, Commit)
	}

	if err := server.Serve(listener); err != nil && err != http.ErrServerClosed {
		log.Fatalf("go-core: server error: %v", err)
	}

	// Cleanup unix socket on exit
	if isUnix {
		os.Remove(resolvedAddr)
	}
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

// withMiddleware applies CORS, metrics, and panic recovery.
func withMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Panic recovery
		defer func() {
			if rec := recover(); rec != nil {
				log.Printf("go-core: panic recovered: %v", rec)
				http.Error(w, "internal server error", http.StatusInternalServerError)
			}
		}()

		// CORS
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Request-ID, X-Feature-Flag, X-Trace-ID")

		if r.Method == "OPTIONS" {
			w.Header().Set("Access-Control-Max-Age", "86400")
			w.WriteHeader(http.StatusNoContent)
			return
		}

		// Metrics (skip for health and metrics endpoints)
		if r.URL.Path != "/metrics" && r.URL.Path != "/health" && r.URL.Path != "/info" {
			start := time.Now()
			lrw := &responseWriter{ResponseWriter: w, code: http.StatusOK}
			next.ServeHTTP(lrw, r)
			recordMetrics(r.URL.Path, time.Since(start), lrw.code >= 500)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// withPool adds a worker pool to the request context.
func withPool(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Store worker pool in request context for handlers that need it
		ctx := context.WithValue(r.Context(), ctxKeyWorkerPool, pool.GlobalWorkerPool)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

type contextKey string

const ctxKeyWorkerPool contextKey = "worker_pool"

// ---------------------------------------------------------------------------
// Response writer wrapper
// ---------------------------------------------------------------------------

type responseWriter struct {
	http.ResponseWriter
	code int
}

func (w *responseWriter) WriteHeader(code int) {
	w.code = code
	w.ResponseWriter.WriteHeader(code)
}

func (w *responseWriter) Flush() {
	if f, ok := w.ResponseWriter.(http.Flusher); ok {
		f.Flush()
	}
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ErrorResponse struct {
	Error string `json:"error"`
}

var errorPool = pool.Buffer64K

func writeError(w http.ResponseWriter, msg string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	fmt.Fprintf(w, `{"error":"%s"}`, msg)
}

func writeErrorWithCode(w http.ResponseWriter, err error) {
	if os.IsNotExist(err) {
		writeError(w, "file not found", http.StatusNotFound)
		return
	}
	writeError(w, err.Error(), http.StatusInternalServerError)
}

func recordMetrics(_ string, d time.Duration, isError bool) {
	metricsCollector.Record(d, isError)
}

func handleInfo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"version":"%s","commit":"%s","buildTime":"%s","goos":"%s","goarch":"%s"}`,
		Version, Commit, BuildTime, runtime.GOOS, runtime.GOARCH)
}
