package main

import (
	"bufio"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestHandleSessionEvent(t *testing.T) {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /session/event", handleSessionEvent)
	server := httptest.NewServer(mux)
	defer server.Close()

	body := `{"session_id":"ses_test","event_type":"test.event","data":{"hello":"world"}}`
	resp, err := http.Post(server.URL+"/session/event", "application/json", strings.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent {
		t.Fatalf("expected 204, got %d", resp.StatusCode)
	}
}

func TestHandleSessionEventValidation(t *testing.T) {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /session/event", handleSessionEvent)
	server := httptest.NewServer(mux)
	defer server.Close()

	tests := []struct {
		name string
		body string
		code int
	}{
		{"missing session_id", `{"event_type":"test"}`, http.StatusBadRequest},
		{"missing event_type", `{"session_id":"ses_1"}`, http.StatusBadRequest},
		{"invalid json", `not json`, http.StatusBadRequest},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := http.Post(server.URL+"/session/event", "application/json", strings.NewReader(tt.body))
			if err != nil {
				t.Fatal(err)
			}
			defer resp.Body.Close()
			if resp.StatusCode != tt.code {
				t.Fatalf("expected %d, got %d", tt.code, resp.StatusCode)
			}
		})
	}
}

func TestSSEStreaming(t *testing.T) {
	// Start a server with both event publishing and SSE streaming
	mux := http.NewServeMux()
	mux.HandleFunc("POST /session/event", handleSessionEvent)
	mux.HandleFunc("GET /session/events", handleSessionEvents)
	server := httptest.NewServer(mux)
	defer server.Close()

	sessionID := "ses_sse_test"

	// 1. Connect to SSE stream
	sseURL := server.URL + "/session/events?session_id=" + sessionID
	sseResp, err := http.Get(sseURL)
	if err != nil {
		t.Fatal(err)
	}
	defer sseResp.Body.Close()

	if sseResp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", sseResp.StatusCode)
	}
	if sseResp.Header.Get("Content-Type") != "text/event-stream" {
		t.Fatalf("expected text/event-stream, got %s", sseResp.Header.Get("Content-Type"))
	}

	// 2. Read the "server.connected" event
	scanner := bufio.NewScanner(sseResp.Body)
	scanner.Buffer(make([]byte, 4096), 4096)

	// SSE format:
	// event: message
	// data: {...}
	// (empty line)

	var connectedData string
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "data: ") {
			connectedData = strings.TrimPrefix(line, "data: ")
			break
		}
	}

	if connectedData == "" {
		t.Fatal("no SSE data received (connected event)")
	}

	var connectedEvent struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal([]byte(connectedData), &connectedEvent); err != nil {
		t.Fatalf("failed to parse connected event: %v", err)
	}
	if connectedEvent.Type != "server.connected" {
		t.Fatalf("expected server.connected, got %s", connectedEvent.Type)
	}

	// 3. Publish a real session event
	publishBody := `{"session_id":"` + sessionID + `","event_type":"session.next.text.delta","data":{"delta":"Hello from Go"}}`
	pubResp, err := http.Post(server.URL+"/session/event", "application/json", strings.NewReader(publishBody))
	if err != nil {
		t.Fatal(err)
	}
	pubResp.Body.Close()

	if pubResp.StatusCode != http.StatusNoContent {
		t.Fatalf("expected 204 from publish, got %d", pubResp.StatusCode)
	}

	// 4. Read the published event from SSE stream
	var publishedData string
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "data: ") {
			publishedData = strings.TrimPrefix(line, "data: ")
			break
		}
	}

	if publishedData == "" {
		t.Fatal("no SSE data received (published event)")
	}

	var publishedEvent struct {
		Type      string `json:"type"`
		SessionID string `json:"session_id"`
	}
	if err := json.Unmarshal([]byte(publishedData), &publishedEvent); err != nil {
		t.Fatalf("failed to parse published event: %v", err)
	}
	if publishedEvent.Type != "session.next.text.delta" {
		t.Fatalf("expected session.next.text.delta, got %s", publishedEvent.Type)
	}
	if publishedEvent.SessionID != sessionID {
		t.Fatalf("expected %s, got %s", sessionID, publishedEvent.SessionID)
	}
}

func TestSSEOnlyReceivesOwnSession(t *testing.T) {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /session/event", handleSessionEvent)
	mux.HandleFunc("GET /session/events", handleSessionEvents)
	server := httptest.NewServer(mux)
	defer server.Close()

	// Subscribe for ses_a
	sseURL := server.URL + "/session/events?session_id=ses_a"
	sseResp, err := http.Get(sseURL)
	if err != nil {
		t.Fatal(err)
	}
	defer sseResp.Body.Close()

	// Consume the connected event
	scanner := bufio.NewScanner(sseResp.Body)
	scanner.Buffer(make([]byte, 4096), 4096)
	scanner.Scan() // event: message
	scanner.Scan() // data: {...connected}
	scanner.Scan() // empty line

	// Publish to ses_b
	publishBody := `{"session_id":"ses_b","event_type":"test.event","data":{}}`
	pubResp, _ := http.Post(server.URL+"/session/event", "application/json", strings.NewReader(publishBody))
	pubResp.Body.Close()

	// Read a few lines from the stream — should NOT receive test.event
	type dataLine struct {
		Type string `json:"type"`
	}

	done := make(chan struct{})
	go func() {
		defer close(done)
		for scanner.Scan() {
			line := scanner.Text()
			if !strings.HasPrefix(line, "data: ") {
				continue
			}
			var d dataLine
			if err := json.Unmarshal([]byte(strings.TrimPrefix(line, "data: ")), &d); err != nil {
				continue
			}
			if d.Type == "test.event" {
				t.Error("received event from different session")
				return
			}
			// Stop after first heartbeat (avoids waiting 10s)
			if d.Type == "server.heartbeat" {
				return
			}
		}
	}()

	select {
	case <-done:
		// Test completed
	case <-time.After(11 * time.Second):
		// Timed out without seeing test.event — which is the expected outcome
	}
}

func TestSSESessionValidation(t *testing.T) {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /session/events", handleSessionEvents)
	server := httptest.NewServer(mux)
	defer server.Close()

	// No session_id
	resp, err := http.Get(server.URL + "/session/events")
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected 400 for missing session_id, got %d", resp.StatusCode)
	}
}

func TestSSEHeartbeat(t *testing.T) {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /session/events", handleSessionEvents)
	server := httptest.NewServer(mux)
	defer server.Close()

	sseURL := server.URL + "/session/events?session_id=ses_hb"
	resp, err := http.Get(sseURL)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()

	// Read events in a goroutine, collecting heartbeat data
	type event struct {
		Type string `json:"type"`
	}
	events := make(chan event, 10)

	go func() {
		defer close(events)
		scanner := bufio.NewScanner(resp.Body)
		scanner.Buffer(make([]byte, 4096), 4096)
		for scanner.Scan() {
			line := scanner.Text()
			if !strings.HasPrefix(line, "data: ") {
				continue
			}
			var e event
			if err := json.Unmarshal([]byte(strings.TrimPrefix(line, "data: ")), &e); err != nil {
				continue
			}
			events <- e
		}
	}()

	// Read events until we see a heartbeat or timeout
	timeout := time.After(15 * time.Second)
	seenConnected := false
	seenHeartbeat := false

	for !seenHeartbeat {
		select {
		case e, ok := <-events:
			if !ok {
				t.Fatal("event stream closed unexpectedly")
			}
			switch e.Type {
			case "server.connected":
				seenConnected = true
			case "server.heartbeat":
				seenHeartbeat = true
			}
		case <-timeout:
			t.Fatalf("timeout waiting for heartbeat (connected=%v)", seenConnected)
		}
	}

	if !seenConnected {
		t.Fatal("expected server.connected event")
	}
	if !seenHeartbeat {
		t.Fatal("expected server.heartbeat event")
	}
}
