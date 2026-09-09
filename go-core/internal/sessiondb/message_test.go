package sessiondb_test

import (
	"encoding/json"
	"fmt"
	"testing"
	"time"

	"github.com/ElioNeto/teamcode/go-core/internal/sessiondb"
)

func userMessage(t *testing.T, s *sessiondb.Store, sessionID string, created int64) sessiondb.Message {
	t.Helper()
	body := fmt.Sprintf(`{"role":"user","agent":"build","model":{"providerID":"p","modelID":"m"},"time":{"created":%d}}`, created)
	msg, err := s.UpsertMessage(ctx, sessionID, json.RawMessage(body))
	if err != nil {
		t.Fatal(err)
	}
	return msg
}

func stepFinish(t *testing.T, s *sessiondb.Store, sessionID, messageID string, cost float64, input int64) sessiondb.Part {
	t.Helper()
	body := fmt.Sprintf(`{"type":"step-finish","reason":"stop","cost":%v,"tokens":{"input":%d,"output":2,"reasoning":3,"cache":{"read":4,"write":5}}}`, cost, input)
	part, err := s.UpsertPart(ctx, sessionID, messageID, json.RawMessage(body), time.Now().UnixMilli())
	if err != nil {
		t.Fatal(err)
	}
	return part
}

func TestUpsertMessageAssignsIDAndRoundTrips(t *testing.T) {
	s := newStore(t)
	ses := create(t, s, sessiondb.CreateSessionInput{})
	msg := userMessage(t, s, ses.ID, 1000)
	if msg.ID[:4] != "msg_" || msg.SessionID != ses.ID || msg.TimeCreated != 1000 {
		t.Fatalf("%+v", msg)
	}
	got, err := s.GetMessage(ctx, ses.ID, msg.ID)
	if err != nil {
		t.Fatal(err)
	}
	encoded, _ := json.Marshal(got.Info)
	var decoded map[string]any
	_ = json.Unmarshal(encoded, &decoded)
	if decoded["id"] != msg.ID || decoded["sessionID"] != ses.ID || decoded["role"] != "user" || decoded["agent"] != "build" {
		t.Fatalf("%s", encoded)
	}
}

func TestUpsertMessageKeepsTimeCreatedOnConflict(t *testing.T) {
	s := newStore(t)
	ses := create(t, s, sessiondb.CreateSessionInput{})
	msg := userMessage(t, s, ses.ID, 1000)
	body := fmt.Sprintf(`{"id":"%s","role":"user","agent":"plan","model":{"providerID":"p","modelID":"m"},"time":{"created":5000}}`, msg.ID)
	again, err := s.UpsertMessage(ctx, ses.ID, json.RawMessage(body))
	if err != nil || again.TimeCreated != 1000 {
		t.Fatalf("%+v %v", again, err)
	}
	got, _ := s.GetMessage(ctx, ses.ID, msg.ID)
	var decoded map[string]any
	_ = json.Unmarshal(got.Info.Data, &decoded)
	if decoded["agent"] != "plan" {
		t.Fatalf("data not replaced: %s", got.Info.Data)
	}
}

func TestUpsertMessageClockGuard(t *testing.T) {
	s := newStore(t)
	ses := create(t, s, sessiondb.CreateSessionInput{})
	future := time.Now().UnixMilli() + 60_000
	userMessage(t, s, ses.ID, future)
	next := userMessage(t, s, ses.ID, time.Now().UnixMilli())
	if next.TimeCreated != future+1 {
		t.Fatalf("got %d want %d", next.TimeCreated, future+1)
	}
	var stored map[string]any
	_ = json.Unmarshal(next.Data, &stored)
	if int64(stored["time"].(map[string]any)["created"].(float64)) != future+1 {
		t.Fatalf("data.time.created not adjusted: %s", next.Data)
	}
}

func TestUpsertMessageLateWriteIsSwallowed(t *testing.T) {
	s := newStore(t)
	_, err := s.UpsertMessage(ctx, "ses_gone", json.RawMessage(`{"role":"user","agent":"a","model":{"providerID":"p","modelID":"m"},"time":{"created":1}}`))
	if err != sessiondb.ErrLateWrite {
		t.Fatalf("got %v", err)
	}
}

func TestPartUsageDeltas(t *testing.T) {
	s := newStore(t)
	ses := create(t, s, sessiondb.CreateSessionInput{})
	msg := userMessage(t, s, ses.ID, 1000)
	part := stepFinish(t, s, ses.ID, msg.ID, 0.5, 10)
	after, _ := s.GetSession(ctx, ses.ID)
	if after.Cost != 0.5 || after.Tokens.Input != 10 || after.Tokens.Cache.Write != 5 {
		t.Fatalf("%+v", after)
	}
	if after.Time.Updated != ses.Time.Updated {
		t.Fatal("usage must not bump time_updated")
	}
	body := fmt.Sprintf(`{"id":"%s","type":"step-finish","reason":"stop","cost":2,"tokens":{"input":100,"output":2,"reasoning":3,"cache":{"read":4,"write":5}}}`, part.ID)
	if _, err := s.UpsertPart(ctx, ses.ID, msg.ID, json.RawMessage(body), 1); err != nil {
		t.Fatal(err)
	}
	after, _ = s.GetSession(ctx, ses.ID)
	if after.Cost != 2 || after.Tokens.Input != 100 || after.Tokens.Output != 2 {
		t.Fatalf("reupsert did not reverse previous usage: %+v", after)
	}
	if err := s.RemovePart(ctx, ses.ID, msg.ID, part.ID); err != nil {
		t.Fatal(err)
	}
	after, _ = s.GetSession(ctx, ses.ID)
	if after.Cost != 0 || after.Tokens.Input != 0 || after.Tokens.Cache.Read != 0 {
		t.Fatalf("remove did not reverse usage: %+v", after)
	}
	stepFinish(t, s, ses.ID, msg.ID, 1, 7)
	if err := s.RemoveMessage(ctx, ses.ID, msg.ID); err != nil {
		t.Fatal(err)
	}
	after, _ = s.GetSession(ctx, ses.ID)
	if after.Cost != 0 || after.Tokens.Input != 0 {
		t.Fatalf("remove message did not reverse usage: %+v", after)
	}
	if _, err := s.GetMessage(ctx, ses.ID, msg.ID); !sessiondb.IsNotFound(err) || err.Error() != "Message not found: "+msg.ID {
		t.Fatalf("got %v", err)
	}
}

func TestPartsOrderedByIDAndTextPartIgnoredForUsage(t *testing.T) {
	s := newStore(t)
	ses := create(t, s, sessiondb.CreateSessionInput{})
	msg := userMessage(t, s, ses.ID, 1000)
	first, _ := s.UpsertPart(ctx, ses.ID, msg.ID, json.RawMessage(`{"type":"text","text":"a"}`), 5)
	second, _ := s.UpsertPart(ctx, ses.ID, msg.ID, json.RawMessage(`{"type":"text","text":"b"}`), 1)
	got, _ := s.GetMessage(ctx, ses.ID, msg.ID)
	if len(got.Parts) != 2 || got.Parts[0].ID != first.ID || got.Parts[1].ID != second.ID {
		t.Fatalf("%+v", got.Parts)
	}
	after, _ := s.GetSession(ctx, ses.ID)
	if after.Cost != 0 {
		t.Fatal("text parts must not touch usage")
	}
}

func TestPageMessagesCursor(t *testing.T) {
	s := newStore(t)
	ses := create(t, s, sessiondb.CreateSessionInput{})
	var created []string
	for i := 0; i < 5; i++ {
		created = append(created, userMessage(t, s, ses.ID, int64(1000+i)).ID)
	}
	page, err := s.PageMessages(ctx, ses.ID, 2, "")
	if err != nil || !page.More || len(page.Items) != 2 || page.Items[0].Info.ID != created[3] || page.Items[1].Info.ID != created[4] {
		t.Fatalf("%+v %v", page, err)
	}
	page2, err := s.PageMessages(ctx, ses.ID, 2, page.Cursor)
	if err != nil || !page2.More || page2.Items[0].Info.ID != created[1] || page2.Items[1].Info.ID != created[2] {
		t.Fatalf("%+v %v", page2, err)
	}
	page3, err := s.PageMessages(ctx, ses.ID, 2, page2.Cursor)
	if err != nil || page3.More || len(page3.Items) != 1 || page3.Items[0].Info.ID != created[0] || page3.Cursor != "" {
		t.Fatalf("%+v %v", page3, err)
	}
	all, err := s.AllMessages(ctx, ses.ID)
	if err != nil || len(all) != 5 || all[0].Info.ID != created[0] || all[4].Info.ID != created[4] {
		t.Fatalf("%v %v", err, all)
	}
}

func TestPageMessagesSameTimeTieBreakOnID(t *testing.T) {
	s := newStore(t)
	ses := create(t, s, sessiondb.CreateSessionInput{})
	a := userMessage(t, s, ses.ID, 1000)
	b := userMessage(t, s, ses.ID, 1000)
	page, _ := s.PageMessages(ctx, ses.ID, 1, "")
	if page.Items[0].Info.ID != b.ID {
		t.Fatalf("newest by id first, got %s", page.Items[0].Info.ID)
	}
	page2, _ := s.PageMessages(ctx, ses.ID, 1, page.Cursor)
	if page2.Items[0].Info.ID != a.ID {
		t.Fatalf("got %s", page2.Items[0].Info.ID)
	}
}

func TestPageMessagesUnknownSessionIs404AndEmptySessionIsEmpty(t *testing.T) {
	s := newStore(t)
	if _, err := s.PageMessages(ctx, "ses_nope", 10, ""); !sessiondb.IsNotFound(err) || err.Error() != "Session not found: ses_nope" {
		t.Fatalf("got %v", err)
	}
	ses := create(t, s, sessiondb.CreateSessionInput{})
	page, err := s.PageMessages(ctx, ses.ID, 10, "")
	if err != nil || page.More || len(page.Items) != 0 {
		t.Fatalf("%+v %v", page, err)
	}
}

func TestCursorRoundTrip(t *testing.T) {
	c := sessiondb.EncodeCursor("msg_abc", 1234)
	id, tm, err := sessiondb.DecodeCursor(c)
	if err != nil || id != "msg_abc" || tm != 1234 {
		t.Fatalf("%s %d %v", id, tm, err)
	}
	if _, _, err := sessiondb.DecodeCursor("!!"); err == nil {
		t.Fatal("expected error")
	}
}
