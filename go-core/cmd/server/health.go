package main

import (
	"encoding/json"
	"net/http"
	"time"
)

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "ok",
		"version": "0.1.0",
		"time":    time.Now().UTC().Format(time.RFC3339),
	})
}
