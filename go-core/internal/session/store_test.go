package session

import (
	"testing"
)

func TestCreateAndGet(t *testing.T) {
	s := NewStore()

	created := s.Create("ses_001", "Test Session", "/home/user/project", "agent1", "model1")
	if created.ID != "ses_001" {
		t.Errorf("expected ID ses_001, got %s", created.ID)
	}
	if created.Title != "Test Session" {
		t.Errorf("expected Title 'Test Session', got %s", created.Title)
	}
	if created.Agent != "agent1" {
		t.Errorf("expected Agent agent1, got %s", created.Agent)
	}
	if created.Model != "model1" {
		t.Errorf("expected Model model1, got %s", created.Model)
	}
	if created.Directory != "/home/user/project" {
		t.Errorf("expected Directory /home/user/project, got %s", created.Directory)
	}
	if created.CreatedAt.IsZero() {
		t.Error("expected CreatedAt to be set")
	}
	if created.UpdatedAt.IsZero() {
		t.Error("expected UpdatedAt to be set")
	}

	// Get should return a copy with matching fields
	got, ok := s.Get("ses_001")
	if !ok {
		t.Fatal("expected session to exist")
	}
	if got.ID != created.ID || got.Title != created.Title {
		t.Errorf("Get returned mismatched session: %+v vs %+v", got, created)
	}

	// Getting a non-existent session should fail
	_, ok = s.Get("ses_nonexistent")
	if ok {
		t.Error("expected Get to return false for non-existent session")
	}
}

func TestCreateOverwrite(t *testing.T) {
	s := NewStore()

	s.Create("ses_001", "Original", "/dir", "agent", "model")
	s.Create("ses_001", "Overwritten", "/dir", "agent", "model")

	got, ok := s.Get("ses_001")
	if !ok {
		t.Fatal("expected session to exist")
	}
	if got.Title != "Overwritten" {
		t.Errorf("expected title 'Overwritten', got %s", got.Title)
	}
}

func TestUpdate(t *testing.T) {
	s := NewStore()
	s.Create("ses_001", "Original", "/dir", "agent", "model")

	updated, ok := s.Update("ses_001", "Updated Title")
	if !ok {
		t.Fatal("expected Update to return true")
	}
	if updated.Title != "Updated Title" {
		t.Errorf("expected title 'Updated Title', got %s", updated.Title)
	}
	if updated.UpdatedAt.Before(updated.CreatedAt) {
		t.Error("expected UpdatedAt to be after CreatedAt")
	}

	// Verify the store was updated
	got, _ := s.Get("ses_001")
	if got.Title != "Updated Title" {
		t.Errorf("store was not updated: got %s", got.Title)
	}

	// Update non-existent session
	_, ok = s.Update("ses_nonexistent", "Nope")
	if ok {
		t.Error("expected Update to return false for non-existent session")
	}
}

func TestDelete(t *testing.T) {
	s := NewStore()
	s.Create("ses_001", "Test", "/dir", "agent", "model")

	if !s.Delete("ses_001") {
		t.Error("expected Delete to return true")
	}
	if s.Count() != 0 {
		t.Error("expected store to be empty after delete")
	}

	// Delete non-existent
	if s.Delete("ses_nonexistent") {
		t.Error("expected Delete to return false for non-existent session")
	}
}

func TestCount(t *testing.T) {
	s := NewStore()
	if s.Count() != 0 {
		t.Errorf("expected 0, got %d", s.Count())
	}

	s.Create("ses_001", "A", "/dir", "agent", "model")
	s.Create("ses_002", "B", "/dir", "agent", "model")
	s.Create("ses_003", "C", "/other", "agent", "model")

	if s.Count() != 3 {
		t.Errorf("expected 3, got %d", s.Count())
	}
}

func TestList(t *testing.T) {
	s := NewStore()

	s.Create("ses_001", "Project A", "/home/user/project-a", "agent1", "model1")
	s.Create("ses_002", "Project B", "/home/user/project-b", "agent2", "model2")
	s.Create("ses_003", "Project A v2", "/home/user/project-a", "agent1", "model1")

	// List by directory
	results := s.List("/home/user/project-a")
	if len(results) != 2 {
		t.Fatalf("expected 2 sessions for project-a, got %d", len(results))
	}

	// List all
	results = s.List("")
	if len(results) != 3 {
		t.Fatalf("expected 3 sessions total, got %d", len(results))
	}

	// List for directory with no sessions
	results = s.List("/nonexistent")
	if len(results) != 0 {
		t.Fatalf("expected 0 sessions, got %d", len(results))
	}
}

func TestConcurrency(t *testing.T) {
	s := NewStore()

	done := make(chan bool, 10)
	for i := 0; i < 10; i++ {
		go func(n int) {
			id := string(rune('A' + n))
			s.Create("ses_"+id, "Test", "/dir", "agent", "model")
			s.Get("ses_" + id)
			s.Count()
			done <- true
		}(i)
	}

	for i := 0; i < 10; i++ {
		<-done
	}

	if s.Count() != 10 {
		t.Errorf("expected 10 sessions, got %d", s.Count())
	}
}
