package session

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

func tempFile(t *testing.T) string {
	t.Helper()
	dir := t.TempDir()
	return filepath.Join(dir, "sessions.json")
}

// ---------------------------------------------------------------------------
// Basic CRUD (same as in-memory store, but through PersistentStore)
// ---------------------------------------------------------------------------

func TestPersistentCreateAndGet(t *testing.T) {
	ps := NewPersistentStore(tempFile(t), 100)
	defer ps.Close()

	created := ps.Create("ses_001", "Test Session", "/home/user/project", "agent1", "model1")
	if created.ID != "ses_001" {
		t.Errorf("expected ID ses_001, got %s", created.ID)
	}
	if created.Title != "Test Session" {
		t.Errorf("expected Title 'Test Session', got %s", created.Title)
	}
	if created.CreatedAt.IsZero() {
		t.Error("expected CreatedAt to be set")
	}

	got, ok := ps.Get("ses_001")
	if !ok {
		t.Fatal("expected session to exist")
	}
	if got.ID != created.ID || got.Title != created.Title {
		t.Errorf("Get returned mismatched session: %+v vs %+v", got, created)
	}

	// Non-existent session
	_, ok = ps.Get("ses_nonexistent")
	if ok {
		t.Error("expected Get to return false for non-existent session")
	}
}

func TestPersistentUpdate(t *testing.T) {
	ps := NewPersistentStore(tempFile(t), 100)
	defer ps.Close()

	ps.Create("ses_001", "Original", "/dir", "agent", "model")

	updated, ok := ps.Update("ses_001", "Updated Title")
	if !ok {
		t.Fatal("expected Update to return true")
	}
	if updated.Title != "Updated Title" {
		t.Errorf("expected title 'Updated Title', got %s", updated.Title)
	}

	// Non-existent
	_, ok = ps.Update("ses_nonexistent", "Nope")
	if ok {
		t.Error("expected Update to return false for non-existent session")
	}
}

func TestPersistentDelete(t *testing.T) {
	ps := NewPersistentStore(tempFile(t), 100)
	defer ps.Close()

	ps.Create("ses_001", "Test", "/dir", "agent", "model")

	if !ps.Delete("ses_001") {
		t.Error("expected Delete to return true")
	}
	if ps.Count() != 0 {
		t.Error("expected store to be empty after delete")
	}
}

func TestPersistentList(t *testing.T) {
	ps := NewPersistentStore(tempFile(t), 100)
	defer ps.Close()

	ps.Create("ses_001", "Project A", "/home/user/a", "agent1", "model1")
	ps.Create("ses_002", "Project B", "/home/user/b", "agent2", "model2")
	ps.Create("ses_003", "Project A v2", "/home/user/a", "agent1", "model1")

	results := ps.List("/home/user/a")
	if len(results) != 2 {
		t.Fatalf("expected 2 sessions for project-a, got %d", len(results))
	}

	results = ps.List("")
	if len(results) != 3 {
		t.Fatalf("expected 3 sessions total, got %d", len(results))
	}

	results = ps.List("/nonexistent")
	if len(results) != 0 {
		t.Fatalf("expected 0 sessions, got %d", len(results))
	}
}

// ---------------------------------------------------------------------------
// TTL Tests
// ---------------------------------------------------------------------------

func TestTTLExpiration(t *testing.T) {
	ps := NewPersistentStore(tempFile(t), 100)
	defer ps.Close()

	// Override TTL to be very short for testing
	ps.ttl = 50 * time.Millisecond

	ps.Create("ses_001", "Short-lived", "/dir", "agent", "model")

	// Should exist immediately (don't call Get or it renews the TTL)
	if ps.mem.Count() != 1 {
		t.Fatal("expected session in memory immediately after creation")
	}

	// Wait for TTL to expire
	time.Sleep(100 * time.Millisecond)

	_, ok := ps.Get("ses_001")
	if ok {
		t.Error("expected session to be expired after TTL")
	}
}

func TestTTLRenewedOnGet(t *testing.T) {
	ps := NewPersistentStore(tempFile(t), 100)
	defer ps.Close()

	ps.ttl = 100 * time.Millisecond

	ps.Create("ses_001", "Renewed", "/dir", "agent", "model")

	// Wait halfway through TTL, then access (renews TTL)
	time.Sleep(60 * time.Millisecond)

	_, ok := ps.Get("ses_001")
	if !ok {
		t.Fatal("expected session to exist before TTL expiry")
	}

	// Wait again — the TTL should have been renewed
	time.Sleep(60 * time.Millisecond)

	// Should still exist because Get renewed the TTL
	_, ok = ps.Get("ses_001")
	if !ok {
		t.Error("expected session to still exist after TTL was renewed on Get")
	}
}

func TestTTLCleanupExpired(t *testing.T) {
	ps := NewPersistentStore(tempFile(t), 100)
	defer ps.Close()

	ps.ttl = 50 * time.Millisecond

	ps.Create("ses_001", "Expiring", "/dir", "agent", "model")
	ps.Create("ses_002", "Forever", "/dir", "agent", "model")

	// Set different TTL for ses_002 (far in the future)
	ps.mu.Lock()
	ps.sessions["ses_002"] = &sessionEntry{
		ID:        "ses_002",
		ExpiresAt: time.Now().Add(1 * time.Hour),
	}
	ps.mu.Unlock()

	time.Sleep(100 * time.Millisecond)
	ps.cleanupExpired()

	// ses_001 should be gone
	if _, ok := ps.Get("ses_001"); ok {
		t.Error("expected ses_001 to be cleaned up")
	}

	// ses_002 should still exist
	if _, ok := ps.Get("ses_002"); !ok {
		t.Error("expected ses_002 to still exist")
	}
}

// ---------------------------------------------------------------------------
// Persistence Tests
// ---------------------------------------------------------------------------

func TestPersistenceSaveAndLoad(t *testing.T) {
	path := tempFile(t)

	// Create store, add a session, then close
	ps1 := NewPersistentStore(path, 100)
	ps1.Create("ses_001", "Survived", "/dir", "agent", "model")
	ps1.ttl = 1 * time.Hour // Ensure it doesn't expire during test
	ps1.Close()

	// Create a new store from the same path
	ps2 := NewPersistentStore(path, 100)
	defer ps2.Close()

	// The session should have been loaded from disk
	_, ok := ps2.Get("ses_001")
	if !ok {
		t.Error("expected session to survive store restart")
	}

	if ps2.Count() != 1 {
		t.Errorf("expected 1 session after reload, got %d", ps2.Count())
	}
}

func TestPersistenceExpiredSessionsNotLoaded(t *testing.T) {
	path := tempFile(t)

	// Create store with expired session data
	ps1 := NewPersistentStore(path, 100)
	// Set TTL to 1 hour so the session doesn't expire before we write
	ps1.ttl = 1 * time.Hour
	ps1.Create("ses_001", "WillExpire", "/dir", "agent", "model")

	// Manually set the TTL entry to be expired
	ps1.mu.Lock()
	ps1.sessions["ses_001"] = &sessionEntry{
		ID:        "ses_001",
		ExpiresAt: time.Now().Add(-1 * time.Hour), // Expired 1 hour ago
	}
	ps1.mu.Unlock()
	ps1.Close()

	// Reload — expired session should not be loaded
	ps2 := NewPersistentStore(path, 100)
	defer ps2.Close()

	_, ok := ps2.Get("ses_001")
	if ok {
		t.Error("expected expired session to NOT be loaded from disk")
	}
}

func TestPersistenceCorruptedFile(t *testing.T) {
	path := tempFile(t)

	// Write corrupted data
	os.WriteFile(path, []byte("not-json"), 0644)

	// Should not crash, just start with empty store
	ps := NewPersistentStore(path, 100)
	defer ps.Close()

	if ps.Count() != 0 {
		t.Errorf("expected empty store after corrupted file, got %d", ps.Count())
	}
}

// ---------------------------------------------------------------------------
// Edge Cases
// ---------------------------------------------------------------------------

func TestPersistentInMemoryOnly(t *testing.T) {
	// Empty path = in-memory only, no persistence
	ps := NewPersistentStore("", 100)
	defer ps.Close()

	ps.Create("ses_001", "In Memory", "/dir", "agent", "model")

	_, ok := ps.Get("ses_001")
	if !ok {
		t.Error("expected session to exist in in-memory store")
	}
}

func TestPersistentNoLRU(t *testing.T) {
	// Cache size 0 = no LRU
	ps := NewPersistentStore(tempFile(t), 0)
	defer ps.Close()

	ps.Create("ses_001", "No LRU", "/dir", "agent", "model")

	_, ok := ps.Get("ses_001")
	if !ok {
		t.Error("expected session to exist without LRU cache")
	}
}

func TestPersistentUpdateNonExistent(t *testing.T) {
	ps := NewPersistentStore(tempFile(t), 100)
	defer ps.Close()

	_, ok := ps.Update("ses_nonexistent", "Nope")
	if ok {
		t.Error("expected Update to return false for non-existent session")
	}
}

func TestPersistentDeleteNonExistent(t *testing.T) {
	ps := NewPersistentStore(tempFile(t), 100)
	defer ps.Close()

	if ps.Delete("ses_nonexistent") {
		t.Error("expected Delete to return false for non-existent session")
	}
}

// ---------------------------------------------------------------------------
// Concurrency
// ---------------------------------------------------------------------------

func TestPersistentConcurrency(t *testing.T) {
	ps := NewPersistentStore(tempFile(t), 100)

	done := make(chan bool, 10)
	for i := 0; i < 10; i++ {
		go func(n int) {
			id := string(rune('A' + n))
			ps.Create("ses_"+id, "Test", "/dir", "agent", "model")
			ps.Get("ses_" + id)
			ps.Count()
			done <- true
		}(i)
	}

	for i := 0; i < 10; i++ {
		<-done
	}

	if ps.Count() != 10 {
		t.Errorf("expected 10 sessions, got %d", ps.Count())
	}
	ps.Close()
}

func TestPersistentConcurrentReadWrite(t *testing.T) {
	ps := NewPersistentStore(tempFile(t), 100)
	defer ps.Close()

	// Concurrently create, get, update, delete sessions
	errs := make(chan error, 10)
	for i := 0; i < 5; i++ {
		go func(n int) {
			id := string(rune('A' + n))
			ps.Create("ses_"+id, "Original", "/dir", "agent", "model")

			if _, ok := ps.Get("ses_" + id); !ok {
				errs <- nil
				return
			}

			ps.Update("ses_"+id, "Updated")
			ps.Delete("ses_" + id)
			errs <- nil
		}(i)
	}

	for i := 0; i < 5; i++ {
		if err := <-errs; err != nil {
			t.Error(err)
		}
	}
}
