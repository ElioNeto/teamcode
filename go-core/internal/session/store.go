// Package session provides an in-memory session metadata store.
//
// Sessions are identified by their ID ("ses_*") and store metadata such as
// title, directory, agent, and model. The actual session state (messages,
// events) is managed by the eventbus and updater packages.
//
// Thread-safe via sync.RWMutex.
package session

import (
	"sync"
	"time"
)

// Session represents session metadata.
type Session struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Directory string    `json:"directory"`
	Agent     string    `json:"agent"`
	Model     string    `json:"model"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Store is an in-memory, thread-safe session metadata store.
type Store struct {
	mu       sync.RWMutex
	sessions map[string]*Session
}

// NewStore creates a new empty Store.
func NewStore() *Store {
	return &Store{
		sessions: make(map[string]*Session),
	}
}

// Create adds a new session to the store. If a session with the same ID
// already exists, it is overwritten.
func (s *Store) Create(id, title, directory, agent, model string) *Session {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()
	session := &Session{
		ID:        id,
		Title:     title,
		Directory: directory,
		Agent:     agent,
		Model:     model,
		CreatedAt: now,
		UpdatedAt: now,
	}
	s.sessions[id] = session
	return session
}

// Get returns a session by ID. The second return value is false if not found.
func (s *Store) Get(id string) (*Session, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	session, ok := s.sessions[id]
	if !ok {
		return nil, false
	}
	cp := *session
	return &cp, true
}

// Update updates a session's title. Returns false if the session doesn't exist.
func (s *Store) Update(id, title string) (*Session, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	session, ok := s.sessions[id]
	if !ok {
		return nil, false
	}

	session.Title = title
	session.UpdatedAt = time.Now()

	cp := *session
	return &cp, true
}

// Delete removes a session from the store. Returns false if not found.
func (s *Store) Delete(id string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	_, ok := s.sessions[id]
	if !ok {
		return false
	}
	delete(s.sessions, id)
	return true
}

// Count returns the total number of sessions in the store.
func (s *Store) Count() int {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return len(s.sessions)
}

// List returns all sessions matching a directory prefix.
// If directory is empty, all sessions are returned.
// Returns a copy of each session to avoid data races.
func (s *Store) List(directory string) []*Session {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []*Session
	for _, sess := range s.sessions {
		if directory == "" || sess.Directory == directory {
			cp := *sess
			result = append(result, &cp)
		}
	}
	return result
}
