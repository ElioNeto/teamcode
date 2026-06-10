package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/ElioNeto/teamcode/go-core/internal/updater"
)

// sessionUpdaters holds one Updater per session.
// The updater processes raw events into consolidated messages.
var (
	sessionUpdaters   = make(map[string]*updater.Updater)
	sessionUpdatersMu sync.Mutex
)

// getOrCreateUpdater returns the Updater for the given session, creating one if needed.
func getOrCreateUpdater(sessionID string) *updater.Updater {
	sessionUpdatersMu.Lock()
	defer sessionUpdatersMu.Unlock()

	u, ok := sessionUpdaters[sessionID]
	if !ok {
		u = updater.New()
		sessionUpdaters[sessionID] = u
	}
	return u
}

// processEventThroughUpdater processes a raw event through the session message updater.
// This is called automatically when an event is published via POST /session/event.
func processEventThroughUpdater(sessionID string, eventType string, rawData json.RawMessage) {
	u := getOrCreateUpdater(sessionID)

	// Build a SessionEvent from the raw data
	// The raw data is the event's data blob (without id/type/sessionID wrapper)
	var data updater.EventData
	if err := json.Unmarshal(rawData, &data); err != nil {
		log.Printf("[updater] failed to parse event data for session %s: %v", sessionID, err)
		return
	}

	ev := updater.SessionEvent{
		Type:      eventType,
		SessionID: sessionID,
		Data:      data,
	}

	u.ProcessEvent(ev)
}

// handleSessionMessages returns the consolidated messages for a session.
// GET /session/messages?session_id=ses_xxx
func handleSessionMessages(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("session_id")
	if sessionID == "" {
		writeError(w, "session_id query parameter is required", http.StatusBadRequest)
		return
	}

	u := getOrCreateUpdater(sessionID)
	messages := u.Messages()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"session_id": sessionID,
		"messages":   messages,
	})
}
