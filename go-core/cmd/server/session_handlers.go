package main

import (
	"encoding/json"
	"net/http"
)

type streamRequest struct {
	SessionID string `json:"session_id"`
	ModelID   string `json:"model_id"`
	ProviderID string `json:"provider_id"`
	Messages  []json.RawMessage `json:"messages"`
}

type eventRequest struct {
	SessionID string `json:"session_id"`
	EventType string `json:"event_type"`
	Data      json.RawMessage `json:"data"`
}

func handleSessionStream(w http.ResponseWriter, r *http.Request) {
	var req streamRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Session streaming will be implemented in phase 2.
	// This is a placeholder that returns a not-implemented response.
	writeJSON(w, map[string]string{
		"status":  "not_implemented",
		"message": "Session event streaming - planned for phase 2 (issue #1045)",
	})
}

func handleSessionEvent(w http.ResponseWriter, r *http.Request) {
	var req eventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	writeJSON(w, map[string]string{
		"status":  "not_implemented",
		"message": "Session event publishing - planned for phase 2 (issue #1045)",
	})
}
