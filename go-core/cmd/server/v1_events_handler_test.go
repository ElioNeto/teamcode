package main

import (
	"bufio"
	"net/http"
	"strconv"
	"strings"
	"testing"
	"time"
)

func readFrame(t *testing.T, r *bufio.Reader) (event, id, data string) {
	t.Helper()
	deadline := time.After(3 * time.Second)
	done := make(chan struct{})
	go func() {
		defer close(done)
		for {
			line, err := r.ReadString('\n')
			if err != nil {
				return
			}
			line = strings.TrimRight(line, "\r\n")
			switch {
			case strings.HasPrefix(line, "event: "):
				event = strings.TrimPrefix(line, "event: ")
			case strings.HasPrefix(line, "id: "):
				id = strings.TrimPrefix(line, "id: ")
			case strings.HasPrefix(line, "data: "):
				data = strings.TrimPrefix(line, "data: ")
			case line == "":
				if event != "" {
					return
				}
			}
		}
	}()
	select {
	case <-done:
	case <-deadline:
		t.Fatal("timeout reading sse frame")
	}
	return event, id, data
}

func TestV1EventsStreamsSessionUpdates(t *testing.T) {
	srv := v1Server(t)
	ses := newSession(t, srv)
	id := ses["id"].(string)
	resp, err := http.Get(srv.URL + "/v1/events?sessionID=" + id)
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.Header.Get("Content-Type") != "text/event-stream" {
		t.Fatalf("content-type %q", resp.Header.Get("Content-Type"))
	}
	reader := bufio.NewReader(resp.Body)
	if event, _, _ := readFrame(t, reader); event != "server.connected" {
		t.Fatalf("first frame %s", event)
	}
	call(t, srv, "PATCH", "/v1/session/"+id, map[string]any{"title": "sse"})
	event, seq, data := readFrame(t, reader)
	if event != "session.updated" || seq == "" || !strings.Contains(data, `"title":"sse"`) {
		t.Fatalf("%s %s %s", event, seq, data)
	}
}

func TestV1EventsReplayWithLastEventID(t *testing.T) {
	srv := v1Server(t)
	ses := newSession(t, srv)
	id := ses["id"].(string)
	sub, err := v1.events.Subscribe(id, 0, 8)
	if err != nil {
		t.Fatal(err)
	}
	call(t, srv, "PATCH", "/v1/session/"+id, map[string]any{"title": "one"})
	oneEvent := <-sub.Events()
	call(t, srv, "PATCH", "/v1/session/"+id, map[string]any{"title": "two"})
	sub.Close()
	req, _ := http.NewRequest("GET", srv.URL+"/v1/events?sessionID="+id, nil)
	req.Header.Set("Last-Event-ID", strconv.FormatUint(oneEvent.Seq, 10))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = resp.Body.Close() }()
	reader := bufio.NewReader(resp.Body)
	readFrame(t, reader)
	event, seq, data := readFrame(t, reader)
	wantSeq := strconv.FormatUint(oneEvent.Seq+1, 10)
	if event != "session.updated" || seq != wantSeq || !strings.Contains(data, `"title":"two"`) {
		t.Fatalf("%s %s %s", event, seq, data)
	}
}

func TestV1EventsReplayUnavailableIsSignalled(t *testing.T) {
	srv := v1Server(t)
	ses := newSession(t, srv)
	id := ses["id"].(string)
	for i := 0; i < perSessionRing+5; i++ {
		v1.events.Publish("x", id, nil)
	}
	req, _ := http.NewRequest("GET", srv.URL+"/v1/events?sessionID="+id, nil)
	req.Header.Set("Last-Event-ID", "1")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = resp.Body.Close() }()
	reader := bufio.NewReader(resp.Body)
	event, _, _ := readFrame(t, reader)
	if event != "server.replay_unavailable" {
		t.Fatalf("got %s", event)
	}
}
