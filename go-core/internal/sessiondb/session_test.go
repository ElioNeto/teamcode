package sessiondb_test

import (
	"context"
	"encoding/json"
	"strings"
	"testing"

	"github.com/ElioNeto/teamcode/go-core/internal/sessiondb"
	"github.com/ElioNeto/teamcode/go-core/internal/store/testdb"
)

var ctx = context.Background()

func newStore(t *testing.T) *sessiondb.Store {
	t.Helper()
	db := testdb.New(t)
	testdb.SeedProject(t, db, "prj_test")
	return sessiondb.New(db)
}

func create(t *testing.T, s *sessiondb.Store, in sessiondb.CreateSessionInput) sessiondb.Session {
	t.Helper()
	if in.ProjectID == "" {
		in.ProjectID = "prj_test"
	}
	if in.Directory == "" {
		in.Directory = "/tmp/dir"
	}
	if in.Version == "" {
		in.Version = "test"
	}
	out, err := s.CreateSession(ctx, in)
	if err != nil {
		t.Fatal(err)
	}
	return out
}

func strp(s string) *string { return &s }

func ids(list []sessiondb.Session) []string {
	out := make([]string, len(list))
	for i, s := range list {
		out[i] = s.ID
	}
	return out
}

func sameSession(a, b sessiondb.Session) bool {
	ja, _ := json.Marshal(a)
	jb, _ := json.Marshal(b)
	return string(ja) == string(jb)
}

func TestCreateSessionDefaults(t *testing.T) {
	s := newStore(t)
	got := create(t, s, sessiondb.CreateSessionInput{})
	if !strings.HasPrefix(got.ID, "ses_") || got.Slug == "" || !strings.HasPrefix(got.Title, "New session - ") {
		t.Fatalf("%+v", got)
	}
	if got.Cost != 0 || got.Tokens != (sessiondb.Tokens{}) || got.Time.Created == 0 || got.Time.Updated != got.Time.Created {
		t.Fatalf("%+v", got)
	}
	again, err := s.GetSession(ctx, got.ID)
	if err != nil || !sameSession(again, got) {
		t.Fatalf("get mismatch: %+v vs %+v (%v)", again, got, err)
	}
}

func TestCreateSessionChildTitleAndParent(t *testing.T) {
	s := newStore(t)
	parent := create(t, s, sessiondb.CreateSessionInput{})
	child := create(t, s, sessiondb.CreateSessionInput{ParentID: &parent.ID})
	if !strings.HasPrefix(child.Title, "Child session - ") || *child.ParentID != parent.ID {
		t.Fatalf("%+v", child)
	}
	kids, err := s.Children(ctx, parent.ID)
	if err != nil || len(kids) != 1 || kids[0].ID != child.ID {
		t.Fatalf("children=%v err=%v", ids(kids), err)
	}
}

func TestCreateSessionRequiresProject(t *testing.T) {
	s := newStore(t)
	_, err := s.CreateSession(ctx, sessiondb.CreateSessionInput{ProjectID: "prj_missing", Directory: "/d", Version: "v"})
	if err == nil {
		t.Fatal("expected foreign key failure")
	}
}

func TestGetSessionNotFound(t *testing.T) {
	s := newStore(t)
	_, err := s.GetSession(ctx, "ses_missing")
	if !sessiondb.IsNotFound(err) || err.Error() != "Session not found: ses_missing" {
		t.Fatalf("got %v", err)
	}
}

func TestListSessionsOrderAndFilters(t *testing.T) {
	s := newStore(t)
	a := create(t, s, sessiondb.CreateSessionInput{Title: strp("alpha one")})
	b := create(t, s, sessiondb.CreateSessionInput{Title: strp("beta two")})
	if _, err := s.PatchSession(ctx, a.ID, json.RawMessage(`{"time":{"updated":9999999999999}}`)); err != nil {
		t.Fatal(err)
	}
	all, err := s.ListSessions(ctx, sessiondb.ListFilter{ProjectID: "prj_test"})
	if err != nil || len(all) != 2 || all[0].ID != a.ID || all[1].ID != b.ID {
		t.Fatalf("list=%v err=%v", ids(all), err)
	}
	found, _ := s.ListSessions(ctx, sessiondb.ListFilter{ProjectID: "prj_test", Search: "beta"})
	if len(found) != 1 || found[0].ID != b.ID {
		t.Fatalf("search=%v", ids(found))
	}
	roots, _ := s.ListSessions(ctx, sessiondb.ListFilter{ProjectID: "prj_test", RootsOnly: true})
	if len(roots) != 2 {
		t.Fatalf("roots=%v", ids(roots))
	}
	if _, err := s.PatchSession(ctx, b.ID, json.RawMessage(`{"time":{"archived":1}}`)); err != nil {
		t.Fatal(err)
	}
	active, _ := s.ListSessions(ctx, sessiondb.ListFilter{ProjectID: "prj_test"})
	if len(active) != 1 || active[0].ID != a.ID {
		t.Fatalf("archived filter=%v", ids(active))
	}
	withArchived, _ := s.ListSessions(ctx, sessiondb.ListFilter{ProjectID: "prj_test", IncludeArchived: true})
	if len(withArchived) != 2 {
		t.Fatalf("include archived=%v", ids(withArchived))
	}
}

func TestPatchSessionNullClearsAndAbsentKeeps(t *testing.T) {
	s := newStore(t)
	created := create(t, s, sessiondb.CreateSessionInput{Title: strp("t")})
	patched, err := s.PatchSession(ctx, created.ID, json.RawMessage(`{"summary":{"additions":1,"deletions":2,"files":3,"diffs":[]},"share":{"url":"https://x"}}`))
	if err != nil || patched.Summary == nil || patched.Summary.Files != 3 || patched.Share == nil || patched.Share.URL != "https://x" {
		t.Fatalf("%+v %v", patched, err)
	}
	if patched.Time.Updated != created.Time.Updated {
		t.Fatal("time.updated must not change without an explicit patch")
	}
	cleared, err := s.PatchSession(ctx, created.ID, json.RawMessage(`{"summary":null}`))
	if err != nil || cleared.Summary != nil || cleared.Share == nil {
		t.Fatalf("%+v %v", cleared, err)
	}
	if _, err := s.PatchSession(ctx, "ses_missing", json.RawMessage(`{"title":"x"}`)); !sessiondb.IsNotFound(err) {
		t.Fatalf("got %v", err)
	}
}

func TestDeleteSessionRecursive(t *testing.T) {
	s := newStore(t)
	root := create(t, s, sessiondb.CreateSessionInput{})
	child := create(t, s, sessiondb.CreateSessionInput{ParentID: &root.ID})
	grand := create(t, s, sessiondb.CreateSessionInput{ParentID: &child.ID})
	deleted, err := s.DeleteSession(ctx, root.ID)
	if err != nil {
		t.Fatal(err)
	}
	got := ids(deleted)
	if len(got) != 3 || got[0] != grand.ID || got[1] != child.ID || got[2] != root.ID {
		t.Fatalf("order=%v", got)
	}
	for _, id := range got {
		if _, err := s.GetSession(ctx, id); !sessiondb.IsNotFound(err) {
			t.Fatalf("%s still exists", id)
		}
	}
}

func TestSessionRowWithBadModelStillLoads(t *testing.T) {
	s := newStore(t)
	created := create(t, s, sessiondb.CreateSessionInput{})
	if _, err := s.DB().Writer().Exec(`UPDATE session SET model = 'not json' WHERE id = ?`, created.ID); err != nil {
		t.Fatal(err)
	}
	got, err := s.GetSession(ctx, created.ID)
	if err != nil || got.Model != nil {
		t.Fatalf("%+v %v", got, err)
	}
}
