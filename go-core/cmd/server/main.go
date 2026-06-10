// go-core — Rewrite of core TypeScript services in Go.
//
// Communication protocol: HTTP REST (JSON) over localhost.
// The TypeScript runtime spawns this binary and communicates via HTTP.
// Feature flags in TS control routing between legacy TS and new Go core.
package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	port := os.Getenv("GO_CORE_PORT")
	if port == "" {
		port = "43001"
	}

	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("GET /health", handleHealth)

	// Filesystem operations — complete adapter (parity with TS AppFileSystem)
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
	mux.HandleFunc("POST /fs/watch", handleFSWatch)

	// Metrics endpoint (used by circuit breaker)
	mux.HandleFunc("GET /metrics", handleMetrics)

	// Session event streaming (SSE)
	mux.HandleFunc("GET /session/events", handleSessionEvents)    // SSE stream
	mux.HandleFunc("POST /session/event", handleSessionEvent)      // Publish event
	mux.HandleFunc("GET /session/events-status", handleSessionStreamStatus) // Health

	server := &http.Server{
		Addr:    ":" + port,
		Handler: withCORS(mux),
	}

	go func() {
		sig := make(chan os.Signal, 1)
		signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
		<-sig
		log.Println("shutting down go-core...")
		server.Close()
	}()

	log.Printf("go-core listening on port %s", port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server error: %v", err)
	}
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Request-ID, X-Feature-Flag, X-Trace-ID")

		if r.Method == "OPTIONS" {
			w.Header().Set("Access-Control-Max-Age", "86400")
			w.WriteHeader(http.StatusNoContent)
			return
		}

		// Record metrics for all non-metrics requests
		if r.URL.Path != "/metrics" && r.URL.Path != "/health" {
			start := time.Now()
			lrw := &loggingResponseWriter{ResponseWriter: w, statusCode: http.StatusOK}
			next.ServeHTTP(lrw, r)
			metricsCollector.Record(time.Since(start), lrw.statusCode >= 500)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// loggingResponseWriter wraps http.ResponseWriter to capture the status code.
type loggingResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (lrw *loggingResponseWriter) WriteHeader(code int) {
	lrw.statusCode = code
	lrw.ResponseWriter.WriteHeader(code)
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func writeError(w http.ResponseWriter, msg string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write([]byte(`{"error":"` + msg + `"}`))
}
