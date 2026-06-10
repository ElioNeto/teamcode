package main

import (
	"encoding/json"
	"net/http"

	"github.com/ElioNeto/teamcode/go-core/internal/session"
)

// sessionStore is the global in-memory session metadata store.
var sessionStore = session.NewStore()

// ---------------------------------------------------------------------------
// Request / Response types
// ---------------------------------------------------------------------------

type sessionCreateRequest struct {
	SessionID string `json:"session_id"`
	Title     string `json:"title"`
	Directory string `json:"directory"`
	Agent     string `json:"agent"`
	Model     string `json:"model"`
}

type sessionUpdateRequest struct {
	SessionID string `json:"session_id"`
	Title     string `json:"title"`
}

type sessionIDRequest struct {
	SessionID string `json:"session_id"`
}

type sessionListRequest struct {
	Directory string `json:"directory"`
}

// ---------------------------------------------------------------------------
// POST /session/create — create a new session
// ---------------------------------------------------------------------------

func handleSessionCreate(w http.ResponseWriter, r *http.Request) {
	var req sessionCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.SessionID == "" {
		writeError(w, "session_id is required", http.StatusBadRequest)
		return
	}

	sess := sessionStore.Create(req.SessionID, req.Title, req.Directory, req.Agent, req.Model)
	writeJSON(w, sess)
}

// ---------------------------------------------------------------------------
// GET /session/get — get session metadata by ID
// Query param: ?session_id=ses_xxx
// ---------------------------------------------------------------------------

func handleSessionGet(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("session_id")
	if sessionID == "" {
		writeError(w, "session_id query parameter is required", http.StatusBadRequest)
		return
	}

	sess, ok := sessionStore.Get(sessionID)
	if !ok {
		writeError(w, "session not found", http.StatusNotFound)
		return
	}
	writeJSON(w, sess)
}

// ---------------------------------------------------------------------------
// POST /session/update — update session title
// ---------------------------------------------------------------------------

func handleSessionUpdate(w http.ResponseWriter, r *http.Request) {
	var req sessionUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.SessionID == "" {
		writeError(w, "session_id is required", http.StatusBadRequest)
		return
	}

	sess, ok := sessionStore.Update(req.SessionID, req.Title)
	if !ok {
		writeError(w, "session not found", http.StatusNotFound)
		return
	}
	writeJSON(w, sess)
}

// ---------------------------------------------------------------------------
// POST /session/delete — delete a session
// ---------------------------------------------------------------------------

func handleSessionDelete(w http.ResponseWriter, r *http.Request) {
	var req sessionIDRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.SessionID == "" {
		writeError(w, "session_id is required", http.StatusBadRequest)
		return
	}

	if !sessionStore.Delete(req.SessionID) {
		writeError(w, "session not found", http.StatusNotFound)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ---------------------------------------------------------------------------
// GET /session/list — list sessions, optionally filtered by directory
// Query param: ?directory=/path
// ---------------------------------------------------------------------------

func handleSessionList(w http.ResponseWriter, r *http.Request) {
	directory := r.URL.Query().Get("directory")

	sessions := sessionStore.List(directory)
	if sessions == nil {
		sessions = []*session.Session{}
	}

	writeJSON(w, map[string]interface{}{
		"sessions": sessions,
		"count":    len(sessions),
	})
}
