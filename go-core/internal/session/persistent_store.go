// Package session provides session metadata storage with file persistence,
// LRU caching, and TTL-based expiration (7 days, renewed on access).
package session

import (
	"encoding/json"
	"log"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/ElioNeto/teamcode/go-core/internal/cache"
)

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// DefaultSessionTTL is the time-to-live for sessions: 7 days.
// Each time a session is accessed, its TTL is renewed.
const DefaultSessionTTL = 7 * 24 * time.Hour

// persistInterval is how often the store writes to disk.
const persistInterval = 1 * time.Minute

// cleanupInterval is how often expired sessions are removed.
const cleanupInterval = 1 * time.Hour

// ---------------------------------------------------------------------------
// PersistentStore
// ---------------------------------------------------------------------------

// PersistentStore wraps an in-memory Store with file persistence, LRU caching,
// and TTL-based expiration. Sessions older than DefaultSessionTTL are
// automatically removed, and the TTL is renewed on each access.
type PersistentStore struct {
	mem  *Store                 // In-memory session store
	lru  *cache.Cache[*Session] // LRU cache for hot sessions
	path string                 // Path to the persistence file
	ttl  time.Duration          // Session TTL

	mu        sync.RWMutex
	sessions  map[string]*sessionEntry // TTL tracking
	persistMu sync.Mutex               // Serializes disk writes
	stopCh    chan struct{}
	stopped   bool
}

// sessionEntry tracks a session's expiration time.
type sessionEntry struct {
	ID        string    `json:"id"`
	ExpiresAt time.Time `json:"expires_at"`
}

// persistData is the structure written to disk.
type persistData struct {
	SessionMap map[string]*Session `json:"session_map"` // Full session metadata
	TTL        []*sessionEntry     `json:"ttl"`         // TTL tracking entries
	Version    int                 `json:"version"`
}

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------

// NewPersistentStore creates a new PersistentStore backed by the given file path.
// If path is empty, the store operates in memory-only mode (no persistence).
// lruCacheSize controls how many hot sessions are kept in the LRU cache (0 = no LRU).
func NewPersistentStore(path string, lruCacheSize int) *PersistentStore {
	ps := &PersistentStore{
		mem:      NewStore(),
		path:     path,
		ttl:      DefaultSessionTTL,
		sessions: make(map[string]*sessionEntry),
		stopCh:   make(chan struct{}),
	}

	if lruCacheSize > 0 {
		ps.lru = cache.New[*Session](lruCacheSize, 5*time.Minute)
	}

	// Load existing sessions from disk
	if path != "" {
		if err := ps.load(); err != nil {
			log.Printf("[session] no existing data to load: %v", err)
		}
	}

	// Start background persistence and cleanup
	go ps.runBackground()

	return ps
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

// Create adds a new session. Returns the created session with TTL tracking.
func (ps *PersistentStore) Create(id, title, directory, agent, model string) *Session {
	session := ps.mem.Create(id, title, directory, agent, model)
	ps.touch(id)
	ps.persist()
	return session
}

// Get returns a session by ID, renewing its TTL on access.
// Returns nil and false if not found or expired.
func (ps *PersistentStore) Get(id string) (*Session, bool) {
	// Check TTL first — if expired, remove from all caches
	if ps.isExpired(id) {
		ps.mem.Delete(id)
		ps.removeEntry(id)
		if ps.lru != nil {
			ps.lru.Delete(id)
		}
		return nil, false
	}

	// Check LRU second (hot cache)
	if ps.lru != nil {
		if s, ok := ps.lru.Get(id); ok {
			ps.touch(id)
			return s, true
		}
	}

	// Check memory store last
	s, ok := ps.mem.Get(id)
	if !ok {
		return nil, false
	}

	// Renew TTL on access
	ps.touch(id)

	// Promote to LRU
	if ps.lru != nil {
		ps.lru.Set(id, s)
	}

	cp := *s
	return &cp, true
}

// Update updates a session's title. Returns false if not found.
func (ps *PersistentStore) Update(id, title string) (*Session, bool) {
	updated, ok := ps.mem.Update(id, title)
	if !ok {
		return nil, false
	}
	ps.touch(id)
	ps.persist()
	return updated, true
}

// Delete removes a session. Returns false if not found.
func (ps *PersistentStore) Delete(id string) bool {
	if !ps.mem.Delete(id) {
		return false
	}
	ps.removeEntry(id)
	if ps.lru != nil {
		ps.lru.Delete(id)
	}
	ps.persist()
	return true
}

// Count returns the total number of sessions (excluding expired).
func (ps *PersistentStore) Count() int {
	return ps.mem.Count()
}

// List returns all sessions matching a directory prefix, excluding expired ones.
// If directory is empty, all sessions are returned.
func (ps *PersistentStore) List(directory string) []*Session {
	all := ps.mem.List(directory)
	// Filter out expired sessions
	var result []*Session
	for _, s := range all {
		if !ps.isExpired(s.ID) {
			ps.touch(s.ID) // Renew TTL on list access
			result = append(result, s)
		} else {
			ps.mem.Delete(s.ID)
			ps.removeEntry(s.ID)
		}
	}
	return result
}

// Close stops the background goroutines and flushes data to disk.
func (ps *PersistentStore) Close() {
	ps.mu.Lock()
	if ps.stopped {
		ps.mu.Unlock()
		return
	}
	ps.stopped = true
	close(ps.stopCh)
	ps.mu.Unlock()

	// Persist outside the lock to avoid RLock-after-WLock deadlock
	ps.persist()
}

// ---------------------------------------------------------------------------
// TTL Management
// ---------------------------------------------------------------------------

// touch renews the TTL for a session.
func (ps *PersistentStore) touch(id string) {
	ps.mu.Lock()
	defer ps.mu.Unlock()

	ps.sessions[id] = &sessionEntry{
		ID:        id,
		ExpiresAt: time.Now().Add(ps.ttl),
	}
}

// isExpired checks if a session has exceeded its TTL.
func (ps *PersistentStore) isExpired(id string) bool {
	ps.mu.RLock()
	defer ps.mu.RUnlock()

	entry, ok := ps.sessions[id]
	if !ok {
		return false // No TTL tracking means never expires
	}
	return time.Now().After(entry.ExpiresAt)
}

// removeEntry removes TTL tracking for a session.
func (ps *PersistentStore) removeEntry(id string) {
	ps.mu.Lock()
	defer ps.mu.Unlock()

	delete(ps.sessions, id)
}

// cleanupExpired removes all expired sessions from memory.
func (ps *PersistentStore) cleanupExpired() {
	ps.mu.RLock()
	var expired []string
	for id, entry := range ps.sessions {
		if time.Now().After(entry.ExpiresAt) {
			expired = append(expired, id)
		}
	}
	ps.mu.RUnlock()

	for _, id := range expired {
		ps.mem.Delete(id)
		ps.removeEntry(id)
		if ps.lru != nil {
			ps.lru.Delete(id)
		}
	}

	if len(expired) > 0 {
		log.Printf("[session] cleaned up %d expired sessions", len(expired))
		ps.persist()
	}
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

// persist writes all session data to disk atomically.
// Serialized by persistMu to prevent concurrent file writes.
func (ps *PersistentStore) persist() {
	if ps.path == "" {
		return
	}

	ps.persistMu.Lock()
	defer ps.persistMu.Unlock()

	// Collect TTL entries
	ps.mu.RLock()
	ttlEntries := make([]*sessionEntry, 0, len(ps.sessions))
	for _, entry := range ps.sessions {
		ttlEntries = append(ttlEntries, entry)
	}
	ps.mu.RUnlock()

	// Collect full session data
	sessionMap := make(map[string]*Session)
	for _, s := range ps.mem.List("") {
		sessionMap[s.ID] = s
	}

	data := persistData{
		SessionMap: sessionMap,
		TTL:        ttlEntries,
		Version:    1,
	}

	tmpPath := ps.path + ".tmp"
	f, err := os.Create(tmpPath)
	if err != nil {
		log.Printf("[session] failed to create temp file: %v", err)
		return
	}

	if err := json.NewEncoder(f).Encode(data); err != nil {
		f.Close()
		os.Remove(tmpPath)
		log.Printf("[session] failed to encode: %v", err)
		return
	}
	f.Close()

	if err := os.Rename(tmpPath, ps.path); err != nil {
		log.Printf("[session] failed to rename: %v", err)
		return
	}
}

// load reads session data from disk and populates the in-memory store.
func (ps *PersistentStore) load() error {
	if ps.path == "" {
		return nil
	}

	data, err := os.ReadFile(ps.path)
	if err != nil {
		return err
	}

	var pd persistData
	if err := json.Unmarshal(data, &pd); err != nil {
		return err
	}

	now := time.Now()
	loaded := 0

	// Build set of expired session IDs from raw TTL data
	expired := make(map[string]bool)
	for _, entry := range pd.TTL {
		if entry == nil {
			continue
		}
		if now.After(entry.ExpiresAt) {
			expired[entry.ID] = true
		}
	}

	// Restore full session objects (skip expired ones)
	ps.mem.mu.Lock()
	for id, s := range pd.SessionMap {
		if s == nil || expired[id] {
			continue
		}
		ps.mem.sessions[id] = &Session{
			ID:        s.ID,
			Title:     s.Title,
			Directory: s.Directory,
			Agent:     s.Agent,
			Model:     s.Model,
			CreatedAt: s.CreatedAt,
			UpdatedAt: s.UpdatedAt,
		}
		loaded++
	}
	ps.mem.mu.Unlock()

	// Restore non-expired TTL entries
	for _, entry := range pd.TTL {
		if entry == nil || expired[entry.ID] {
			continue
		}
		ps.sessions[entry.ID] = entry
	}

	log.Printf("[session] loaded %d sessions from %s", loaded, ps.path)
	return nil
}

// ---------------------------------------------------------------------------
// Background Goroutines
// ---------------------------------------------------------------------------

// runBackground starts periodic persistence and cleanup.
func (ps *PersistentStore) runBackground() {
	persistTick := time.NewTicker(persistInterval)
	cleanupTick := time.NewTicker(cleanupInterval)

	for {
		select {
		case <-persistTick.C:
			ps.persist()
		case <-cleanupTick.C:
			ps.cleanupExpired()
		case <-ps.stopCh:
			persistTick.Stop()
			cleanupTick.Stop()
			return
		}
	}
}

// ---------------------------------------------------------------------------
// Default Path Helpers
// ---------------------------------------------------------------------------

// EnsureDir creates the directory for the persistence file if it doesn't exist.
func EnsureDir(path string) error {
	dir := filepath.Dir(path)
	return os.MkdirAll(dir, 0755)
}

// DefaultDataPath returns the default path for the session persistence file.
// Uses XDG_DATA_HOME or ~/.local/share/teamcode as the base directory.
func DefaultDataPath() string {
	base := os.Getenv("XDG_DATA_HOME")
	if base == "" {
		home, err := os.UserHomeDir()
		if err != nil {
			home = "/tmp"
		}
		base = filepath.Join(home, ".local", "share")
	}
	return filepath.Join(base, "teamcode", "go-core", "sessions.json")
}
