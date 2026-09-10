package sessiondb_test

import (
	"testing"

	"github.com/ElioNeto/teamcode/go-core/internal/sessiondb"
)

func TestReplaceTodosKeepsPositionOrder(t *testing.T) {
	s := newStore(t)
	ses := create(t, s, sessiondb.CreateSessionInput{})
	todos := []sessiondb.Todo{{Content: "b", Status: "pending", Priority: "high"}, {Content: "a", Status: "completed", Priority: "low"}}
	if err := s.ReplaceTodos(ctx, ses.ID, todos); err != nil {
		t.Fatal(err)
	}
	got, err := s.GetTodos(ctx, ses.ID)
	if err != nil || len(got) != 2 || got[0].Content != "b" || got[1].Content != "a" {
		t.Fatalf("%v %v", got, err)
	}
	if err := s.ReplaceTodos(ctx, ses.ID, nil); err != nil {
		t.Fatal(err)
	}
	got, _ = s.GetTodos(ctx, ses.ID)
	if len(got) != 0 {
		t.Fatalf("expected empty, got %v", got)
	}
}
