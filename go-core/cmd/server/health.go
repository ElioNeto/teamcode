package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
)

func handleHealth(w http.ResponseWriter, r *http.Request) {
	payload := map[string]any{
		"status":  "ok",
		"version": "0.1.0",
		"time":    time.Now().UTC().Format(time.RFC3339),
	}
	if v1 != nil && v1.degraded() {
		payload["status"] = "degraded"
		payload["reason"] = "schema_outdated"
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("go-core: write health response: %v", err)
	}
}
