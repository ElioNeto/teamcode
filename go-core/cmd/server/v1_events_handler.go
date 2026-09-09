package main

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/ElioNeto/teamcode/go-core/internal/eventlog"
)

const sseHeartbeat = 10 * time.Second
const sseBuffer = 256

func writeSSE(w http.ResponseWriter, flusher http.Flusher, ev eventlog.Event) bool {
	if _, err := w.Write(ev.SSE()); err != nil {
		return false
	}
	flusher.Flush()
	return true
}

func (s *v1State) handleEvents(w http.ResponseWriter, r *http.Request) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		writeError(w, "streaming not supported", http.StatusInternalServerError)
		return
	}
	sessionID := r.URL.Query().Get("sessionID")
	afterSeq, _ := strconv.ParseUint(r.Header.Get("Last-Event-ID"), 10, 64)
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(http.StatusOK)
	control := func(eventType string) eventlog.Event {
		return eventlog.Event{Type: eventType, SessionID: sessionID, Timestamp: time.Now().UnixMilli()}
	}
	sub, err := s.events.Subscribe(sessionID, afterSeq, sseBuffer)
	if errors.Is(err, eventlog.ErrReplayUnavailable) {
		writeSSE(w, flusher, control("server.replay_unavailable"))
		if sub, err = s.events.Subscribe(sessionID, 0, sseBuffer); err != nil {
			return
		}
	} else if err != nil {
		return
	}
	defer sub.Close()
	if !writeSSE(w, flusher, control("server.connected")) {
		return
	}
	ticker := time.NewTicker(sseHeartbeat)
	defer ticker.Stop()
	for {
		select {
		case <-r.Context().Done():
			return
		case <-sub.Lagged():
			writeSSE(w, flusher, control("server.lagged"))
			return
		case ev, open := <-sub.Events():
			if !open {
				return
			}
			if !writeSSE(w, flusher, ev) {
				return
			}
		case <-ticker.C:
			if !writeSSE(w, flusher, control("server.heartbeat")) {
				return
			}
		}
	}
}
