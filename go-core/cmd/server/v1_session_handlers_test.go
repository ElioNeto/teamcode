package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/ElioNeto/teamcode/go-core/internal/store/testdb"
)

func v1Server(t *testing.T) *httptest.Server {
	t.Helper()
	db := testdb.New(t)
	testdb.SeedProject(t, db, "prj_test")
	path := db.Path()
	_ = db.Close()
	state, err := newV1State(path)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = state.Close() })
	mux := http.NewServeMux()
	state.register(mux)
	srv := httptest.NewServer(mux)
	t.Cleanup(srv.Close)
	return srv
}

func call(t *testing.T, srv *httptest.Server, method, path string, body any) (int, []byte) {
	t.Helper()
	var reader io.Reader
	if body != nil {
		raw, _ := json.Marshal(body)
		reader = bytes.NewReader(raw)
	}
	req, _ := http.NewRequest(method, srv.URL+path, reader)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = resp.Body.Close() }()
	out, _ := io.ReadAll(resp.Body)
	return resp.StatusCode, out
}

func decode(t *testing.T, raw []byte) map[string]any {
	t.Helper()
	var m map[string]any
	if err := json.Unmarshal(raw, &m); err != nil {
		t.Fatalf("%v: %s", err, raw)
	}
	return m
}

func newSession(t *testing.T, srv *httptest.Server) map[string]any {
	t.Helper()
	code, raw := call(t, srv, "POST", "/v1/session", map[string]any{"projectID": "prj_test", "directory": "/tmp/d", "version": "t"})
	if code != 201 {
		t.Fatalf("%d %s", code, raw)
	}
	return decode(t, raw)
}

func TestV1SessionLifecycle(t *testing.T) {
	srv := v1Server(t)
	ses := newSession(t, srv)
	id := ses["id"].(string)
	code, raw := call(t, srv, "GET", "/v1/session/"+id, nil)
	if code != 200 || decode(t, raw)["id"] != id {
		t.Fatalf("%d %s", code, raw)
	}
	code, raw = call(t, srv, "PATCH", "/v1/session/"+id, map[string]any{"title": "renamed"})
	if code != 200 || decode(t, raw)["title"] != "renamed" {
		t.Fatalf("%d %s", code, raw)
	}
	code, raw = call(t, srv, "GET", "/v1/session?projectID=prj_test", nil)
	var list []map[string]any
	_ = json.Unmarshal(raw, &list)
	if code != 200 || len(list) != 1 || list[0]["title"] != "renamed" {
		t.Fatalf("%d %s", code, raw)
	}
	code, _ = call(t, srv, "DELETE", "/v1/session/"+id, nil)
	if code != 204 {
		t.Fatalf("delete %d", code)
	}
	code, raw = call(t, srv, "GET", "/v1/session/"+id, nil)
	if code != 404 || decode(t, raw)["error"] != "Session not found: "+id {
		t.Fatalf("%d %s", code, raw)
	}
}

func TestV1PatchNullOnNotNullColumnIs400(t *testing.T) {
	srv := v1Server(t)
	ses := newSession(t, srv)
	id := ses["id"].(string)
	code, raw := call(t, srv, "PATCH", "/v1/session/"+id, map[string]any{"title": nil})
	if code != 400 || !strings.Contains(decode(t, raw)["error"].(string), "cannot be null") {
		t.Fatalf("%d %s", code, raw)
	}
}

func TestV1MessagesAndParts(t *testing.T) {
	srv := v1Server(t)
	ses := newSession(t, srv)
	id := ses["id"].(string)
	msgBody := map[string]any{"role": "user", "agent": "build", "model": map[string]string{"providerID": "p", "modelID": "m"}, "time": map[string]int64{"created": 1000}}
	code, raw := call(t, srv, "POST", "/v1/session/"+id+"/message", msgBody)
	if code != 200 {
		t.Fatalf("%d %s", code, raw)
	}
	msg := decode(t, raw)
	msgID := msg["id"].(string)
	partBody := map[string]any{"type": "step-finish", "reason": "stop", "cost": 1.5, "tokens": map[string]any{"input": 3, "output": 0, "reasoning": 0, "cache": map[string]int{"read": 0, "write": 0}}}
	code, raw = call(t, srv, "POST", "/v1/session/"+id+"/message/"+msgID+"/part", partBody)
	if code != 200 {
		t.Fatalf("%d %s", code, raw)
	}
	partID := decode(t, raw)["id"].(string)
	code, raw = call(t, srv, "PUT", "/v1/session/"+id+"/message/"+msgID+"/part/"+partID, partBody)
	if code != 200 {
		t.Fatalf("%d %s", code, raw)
	}
	code, raw = call(t, srv, "GET", "/v1/session/"+id+"/messages?limit=10", nil)
	page := decode(t, raw)
	items := page["messages"].([]any)
	if code != 200 || len(items) != 1 || page["more"] != false {
		t.Fatalf("%d %s", code, raw)
	}
	first := items[0].(map[string]any)
	if first["info"].(map[string]any)["id"] != msgID || len(first["parts"].([]any)) != 1 {
		t.Fatalf("%s", raw)
	}
	code, raw = call(t, srv, "GET", "/v1/session/"+id, nil)
	if code != 200 || decode(t, raw)["cost"] != 1.5 {
		t.Fatalf("usage not applied: %s", raw)
	}
	code, _ = call(t, srv, "DELETE", "/v1/session/"+id+"/message/"+msgID+"/part/"+partID, nil)
	if code != 204 {
		t.Fatalf("%d", code)
	}
	code, _ = call(t, srv, "DELETE", "/v1/session/"+id+"/message/"+msgID, nil)
	if code != 204 {
		t.Fatalf("%d", code)
	}
	code, raw = call(t, srv, "GET", "/v1/session/"+id+"/message/"+msgID, nil)
	if code != 404 || decode(t, raw)["error"] != "Message not found: "+msgID {
		t.Fatalf("%d %s", code, raw)
	}
}

func TestV1LateWriteIs200(t *testing.T) {
	srv := v1Server(t)
	code, _ := call(t, srv, "POST", "/v1/session/ses_gone/message", map[string]any{"role": "user", "agent": "a", "model": map[string]string{"providerID": "p", "modelID": "m"}, "time": map[string]int64{"created": 1}})
	if code != 200 {
		t.Fatalf("late write must be swallowed, got %d", code)
	}
}

func TestV1TodosAndFork(t *testing.T) {
	srv := v1Server(t)
	ses := newSession(t, srv)
	id := ses["id"].(string)
	code, raw := call(t, srv, "PUT", "/v1/session/"+id+"/todo", []map[string]string{{"content": "x", "status": "pending", "priority": "high"}})
	if code != 200 {
		t.Fatalf("%d %s", code, raw)
	}
	code, raw = call(t, srv, "GET", "/v1/session/"+id+"/todo", nil)
	var todos []map[string]any
	_ = json.Unmarshal(raw, &todos)
	if code != 200 || len(todos) != 1 || todos[0]["content"] != "x" {
		t.Fatalf("%d %s", code, raw)
	}
	code, raw = call(t, srv, "POST", "/v1/session/"+id+"/fork", map[string]any{"directory": "/tmp/d", "version": "t"})
	if code != 201 || decode(t, raw)["parentID"] != nil {
		t.Fatalf("%d %s", code, raw)
	}
}

func TestV1SchemaOutdatedIs503(t *testing.T) {
	dir := t.TempDir()
	state, err := newV1State(dir + "/empty.db")
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = state.Close() }()
	mux := http.NewServeMux()
	state.register(mux)
	srv := httptest.NewServer(mux)
	defer srv.Close()
	code, raw := call(t, srv, "GET", "/v1/session?projectID=x", nil)
	if code != 503 || decode(t, raw)["error"] != "schema_outdated" {
		t.Fatalf("%d %s", code, raw)
	}
	if !state.degraded() {
		t.Fatal("state should be degraded")
	}
}

func TestV1StoreUnavailableIs503(t *testing.T) {
	dir := t.TempDir()
	blocker := filepath.Join(dir, "blocker")
	if err := os.WriteFile(blocker, []byte("x"), 0o600); err != nil {
		t.Fatal(err)
	}
	state, err := newV1State(filepath.Join(blocker, "x.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = state.Close() }()
	mux := http.NewServeMux()
	state.register(mux)
	srv := httptest.NewServer(mux)
	defer srv.Close()
	code, raw := call(t, srv, "GET", "/v1/session?projectID=x", nil)
	if code != 503 || decode(t, raw)["error"] != "store_unavailable" {
		t.Fatalf("%d %s", code, raw)
	}
	if !state.degraded() {
		t.Fatal("state should be degraded")
	}
}

func TestV1PublishesEvents(t *testing.T) {
	srv := v1Server(t)
	ses := newSession(t, srv)
	sub, err := v1.events.Subscribe(ses["id"].(string), 0, 8)
	if err != nil {
		t.Fatal(err)
	}
	defer sub.Close()
	call(t, srv, "PATCH", "/v1/session/"+ses["id"].(string), map[string]any{"title": "t2"})
	ev := <-sub.Events()
	if ev.Type != "session.updated" {
		t.Fatalf("%s", ev.Type)
	}
	var payload map[string]any
	_ = json.Unmarshal(ev.Data, &payload)
	if payload["info"].(map[string]any)["title"] != "t2" {
		t.Fatalf("%s", ev.Data)
	}
}
