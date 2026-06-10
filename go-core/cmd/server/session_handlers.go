package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/ElioNeto/teamcode/go-core/internal/eventbus"
)

// eventBus is the global event bus shared across the server.
var eventBus = eventbus.NewBus()

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

type sessionStreamRequest struct {
	SessionID string `json:"session_id"`
}

type sessionEventRequest struct {
	SessionID string          `json:"session_id"`
	EventType string          `json:"event_type"`
	Data      json.RawMessage `json:"data"`
}

// ---------------------------------------------------------------------------
// POST /session/event — publish an event to the bus
// ---------------------------------------------------------------------------

func handleSessionEvent(w http.ResponseWriter, r *http.Request) {
	var req sessionEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.SessionID == "" {
		writeError(w, "session_id is required", http.StatusBadRequest)
		return
	}
	if req.EventType == "" {
		writeError(w, "event_type is required", http.StatusBadRequest)
		return
	}

	event := eventbus.NewEvent(req.EventType, req.SessionID, req.Data)
	eventBus.Publish(event)

	w.WriteHeader(http.StatusNoContent)
}

// ---------------------------------------------------------------------------
// GET /session/events — SSE stream of events for a session
//
// Query params: ?session_id=ses_xxx
//
// Returns text/event-stream with:
//
//	event: message
//	data: {"id":"evt_...","type":"...","session_id":"...","data":{...},"timestamp":...}
//
// Heartbeat every 10 seconds.
// Closes when client disconnects.
// ---------------------------------------------------------------------------

func handleSessionEvents(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("session_id")
	if sessionID == "" {
		// Also check JSON body for POST-style requests
		var req sessionStreamRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err == nil {
			sessionID = req.SessionID
		}
	}
	if sessionID == "" {
		writeError(w, "session_id query parameter is required", http.StatusBadRequest)
		return
	}

	// Check that the response writer supports flushing
	flusher, ok := w.(http.Flusher)
	if !ok {
		writeError(w, "streaming not supported", http.StatusInternalServerError)
		return
	}

	// Set SSE headers
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// Subscribe to the session events
	sub := eventBus.Subscribe(sessionID)
	defer sub.Close()

	// Send initial connected event
	connected := eventbus.NewEvent("server.connected", sessionID, json.RawMessage(`{}`))
	if _, err := fmt.Fprint(w, string(connected.MarshalSSE())); err != nil {
		return // client disconnected
	}
	flusher.Flush()

	// Heartbeat ticker (every 10 seconds, matching TS implementation)
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	// Stream events until client disconnects or subscription ends
	for {
		select {
		case <-r.Context().Done():
			// Client disconnected
			return

		case <-sub.Done():
			// Subscription closed
			return

		case event := <-sub.Events:
			frame := event.MarshalSSE()
			if _, err := fmt.Fprint(w, string(frame)); err != nil {
				return // client disconnected
			}
			flusher.Flush()

		case <-ticker.C:
			// Heartbeat
			heartbeat := eventbus.NewEvent("server.heartbeat", sessionID, json.RawMessage(`{}`))
			frame := heartbeat.MarshalSSE()
			if _, err := fmt.Fprint(w, string(frame)); err != nil {
				return // client disconnected
			}
			flusher.Flush()
		}
	}
}

// ---------------------------------------------------------------------------
// GET /session/events-write — health check endpoint for event streaming
// ---------------------------------------------------------------------------

func handleSessionStreamStatus(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, map[string]interface{}{
		"status": "ok",
		"sessions": eventBus.SessionCount(),
	})
}

func init() {
	log.Println("[eventbus] initialized session event bus")
}
