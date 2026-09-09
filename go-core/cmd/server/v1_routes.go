package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sync/atomic"

	"github.com/ElioNeto/teamcode/go-core/internal/eventlog"
	"github.com/ElioNeto/teamcode/go-core/internal/sessiondb"
	"github.com/ElioNeto/teamcode/go-core/internal/store"
)

const perSessionRing = 1000
const globalRing = 10000

const reasonStoreUnavailable = "store_unavailable"

type v1State struct {
	db        *store.DB
	store     *sessiondb.Store
	events    *eventlog.Log
	schemaErr atomic.Value
	openErr   error
}

var v1 *v1State

func newV1State(dbPath string) (*v1State, error) {
	state := &v1State{events: eventlog.New(perSessionRing, globalRing)}
	db, err := store.Open(dbPath)
	if err != nil {
		state.openErr = err
		log.Printf("go-core: session store unavailable: %v", err)
		v1 = state
		return state, nil
	}
	state.db = db
	state.store = sessiondb.New(db)
	if err := store.CheckSchema(context.Background(), db.Reader()); err != nil {
		log.Printf("go-core: session store degraded: %v", err)
		state.schemaErr.Store(err)
	}
	v1 = state
	return state, nil
}

func (s *v1State) degraded() bool {
	if s.openErr != nil {
		return true
	}
	err, _ := s.schemaErr.Load().(error)
	return err != nil
}

func (s *v1State) degradedReason() string {
	if s.openErr != nil {
		return reasonStoreUnavailable
	}
	if err, _ := s.schemaErr.Load().(error); err != nil {
		return store.ErrSchemaOutdated.Error()
	}
	return ""
}

func (s *v1State) Close() error {
	if s.db == nil {
		return nil
	}
	return s.db.Close()
}

func (s *v1State) gate(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if s.degraded() {
			writeError(w, s.degradedReason(), http.StatusServiceUnavailable)
			return
		}
		next(w, r)
	}
}

func (s *v1State) register(mux *http.ServeMux) {
	mux.HandleFunc("POST /v1/session", s.gate(s.handleCreateSession))
	mux.HandleFunc("GET /v1/session", s.gate(s.handleListSessions))
	mux.HandleFunc("GET /v1/session/{id}", s.gate(s.handleGetSession))
	mux.HandleFunc("PATCH /v1/session/{id}", s.gate(s.handlePatchSession))
	mux.HandleFunc("DELETE /v1/session/{id}", s.gate(s.handleDeleteSession))
	mux.HandleFunc("GET /v1/session/{id}/children", s.gate(s.handleChildren))
	mux.HandleFunc("POST /v1/session/{id}/fork", s.gate(s.handleFork))
	mux.HandleFunc("GET /v1/session/{id}/messages", s.gate(s.handleMessages))
	mux.HandleFunc("POST /v1/session/{id}/message", s.gate(s.handleUpsertMessage))
	mux.HandleFunc("GET /v1/session/{id}/message/{messageID}", s.gate(s.handleGetMessage))
	mux.HandleFunc("PUT /v1/session/{id}/message/{messageID}", s.gate(s.handleUpsertMessage))
	mux.HandleFunc("DELETE /v1/session/{id}/message/{messageID}", s.gate(s.handleRemoveMessage))
	mux.HandleFunc("POST /v1/session/{id}/message/{messageID}/part", s.gate(s.handleUpsertPart))
	mux.HandleFunc("GET /v1/session/{id}/message/{messageID}/part/{partID}", s.gate(s.handleGetPart))
	mux.HandleFunc("PUT /v1/session/{id}/message/{messageID}/part/{partID}", s.gate(s.handleUpsertPart))
	mux.HandleFunc("DELETE /v1/session/{id}/message/{messageID}/part/{partID}", s.gate(s.handleRemovePart))
	mux.HandleFunc("GET /v1/session/{id}/todo", s.gate(s.handleGetTodos))
	mux.HandleFunc("PUT /v1/session/{id}/todo", s.gate(s.handleReplaceTodos))
	mux.HandleFunc("GET /v1/events", s.handleEvents)
}

func registerV1Routes(mux *http.ServeMux) {
	path := store.ResolvePath(os.Getenv, homeDir())
	if path != ":memory:" {
		if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
			log.Printf("go-core: session store directory unavailable at %s: %v", filepath.Dir(path), err)
		}
	}
	state, err := newV1State(path)
	if err != nil {
		log.Printf("go-core: session store unavailable at %s: %v", path, err)
		return
	}
	state.register(mux)
	log.Printf("go-core: session store at %s (degraded=%v)", path, state.degraded())
}

func homeDir() string {
	home, err := os.UserHomeDir()
	if err != nil {
		return ""
	}
	return home
}

func writeStoreError(w http.ResponseWriter, err error) {
	switch {
	case sessiondb.IsNotFound(err):
		writeError(w, err.Error(), http.StatusNotFound)
	case sessiondb.IsInvalidInput(err):
		writeError(w, err.Error(), http.StatusBadRequest)
	case store.IsBusy(err):
		writeError(w, "busy", http.StatusServiceUnavailable)
	case errors.Is(err, store.ErrSchemaOutdated):
		writeError(w, store.ErrSchemaOutdated.Error(), http.StatusServiceUnavailable)
	default:
		writeError(w, err.Error(), http.StatusInternalServerError)
	}
}
