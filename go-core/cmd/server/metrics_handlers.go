package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/ElioNeto/teamcode/go-core/internal/metrics"
)

// Global metrics collector for the Go core server.
// Records all incoming requests for circuit breaker monitoring.
var metricsCollector = metrics.New(60 * time.Second)

// handleMetrics returns the current health metrics for the circuit breaker.
// Used by the TypeScript runtime to detect when the Go core is unhealthy.
func handleMetrics(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metricsCollector.Snapshot())
}
