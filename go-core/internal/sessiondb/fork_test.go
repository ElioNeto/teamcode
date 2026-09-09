package sessiondb_test

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/ElioNeto/teamcode/go-core/internal/sessiondb"
)

func TestForkCopiesMessagesBeforeCutoffWithNewIDs(t *testing.T) {
	s := newStore(t)
	original := create(t, s, sessiondb.CreateSessionInput{Title: strp("Work")})
	first := userMessage(t, s, original.ID, 1000)
	assistantBody := fmt.Sprintf(`{"role":"assistant","parentID":"%s","modelID":"m","providerID":"p","mode":"build","agent":"build","path":{"cwd":"/","root":"/"},"cost":0,"tokens":{"input":0,"output":0,"reasoning":0,"cache":{"read":0,"write":0}},"time":{"created":1001}}`, first.ID)
	second, err := s.UpsertMessage(ctx, original.ID, json.RawMessage(assistantBody))
	if err != nil {
		t.Fatal(err)
	}
	compaction := fmt.Sprintf(`{"type":"compaction","auto":true,"tail_start_id":"%s"}`, first.ID)
	if _, err := s.UpsertPart(ctx, original.ID, second.ID, json.RawMessage(compaction), 1); err != nil {
		t.Fatal(err)
	}
	third := userMessage(t, s, original.ID, 1002)

	result, err := s.Fork(ctx, original.ID, third.ID, "/tmp/dir", "", "test")
	if err != nil {
		t.Fatal(err)
	}
	if result.Session.Title != "Work (fork #1)" || result.Session.ID == original.ID {
		t.Fatalf("%+v", result.Session)
	}
	if len(result.Messages) != 2 {
		t.Fatalf("copied %d messages", len(result.Messages))
	}
	copiedFirst, copiedSecond := result.Messages[0].Info, result.Messages[1].Info
	if copiedFirst.ID == first.ID || copiedFirst.SessionID != result.Session.ID {
		t.Fatalf("%+v", copiedFirst)
	}
	var assistant map[string]any
	_ = json.Unmarshal(copiedSecond.Data, &assistant)
	if assistant["parentID"] != copiedFirst.ID {
		t.Fatalf("parentID not remapped: %v", assistant["parentID"])
	}
	var part map[string]any
	_ = json.Unmarshal(result.Messages[1].Parts[0].Data, &part)
	if part["tail_start_id"] != copiedFirst.ID {
		t.Fatalf("tail_start_id not remapped: %v", part["tail_start_id"])
	}
	again, _ := s.Fork(ctx, result.Session.ID, "", "/tmp/dir", "", "test")
	if again.Session.Title != "Work (fork #2)" {
		t.Fatalf("%q", again.Session.Title)
	}
}
