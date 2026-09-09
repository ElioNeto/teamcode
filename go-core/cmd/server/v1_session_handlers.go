package main

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/ElioNeto/teamcode/go-core/internal/sessiondb"
)

func readBody(r *http.Request) (json.RawMessage, error) {
	body, err := io.ReadAll(io.LimitReader(r.Body, 64<<20))
	if err != nil {
		return nil, err
	}
	if len(body) == 0 {
		return json.RawMessage("{}"), nil
	}
	if !json.Valid(body) {
		return nil, errors.New("invalid json")
	}
	return body, nil
}

func writeJSONStatus(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func (s *v1State) publishSession(eventType string, info sessiondb.Session) {
	s.events.Publish(eventType, info.ID, map[string]any{"sessionID": info.ID, "info": info})
}

func (s *v1State) handleCreateSession(w http.ResponseWriter, r *http.Request) {
	body, err := readBody(r)
	if err != nil {
		writeError(w, err.Error(), http.StatusBadRequest)
		return
	}
	var in sessiondb.CreateSessionInput
	if err := json.Unmarshal(body, &in); err != nil || in.ProjectID == "" || in.Directory == "" || in.Version == "" {
		writeError(w, "projectID, directory and version are required", http.StatusBadRequest)
		return
	}
	info, err := s.store.CreateSession(r.Context(), in)
	if err != nil {
		writeStoreError(w, err)
		return
	}
	s.publishSession("session.created", info)
	writeJSONStatus(w, http.StatusCreated, info)
}

func (s *v1State) handleGetSession(w http.ResponseWriter, r *http.Request) {
	info, err := s.store.GetSession(r.Context(), r.PathValue("id"))
	if err != nil {
		writeStoreError(w, err)
		return
	}
	writeJSONStatus(w, http.StatusOK, info)
}

func (s *v1State) handleListSessions(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	limit, _ := strconv.Atoi(q.Get("limit"))
	start, _ := strconv.ParseInt(q.Get("start"), 10, 64)
	filter := sessiondb.ListFilter{
		ProjectID: q.Get("projectID"), WorkspaceID: q.Get("workspaceID"), Directory: q.Get("directory"), Path: q.Get("path"),
		Search: q.Get("search"), Limit: limit, Start: start, IncludeArchived: q.Get("archived") == "true",
	}
	switch parent := q.Get("parentID"); parent {
	case "":
	case "null":
		filter.RootsOnly = true
	default:
		filter.ParentID = parent
	}
	list, err := s.store.ListSessions(r.Context(), filter)
	if err != nil {
		writeStoreError(w, err)
		return
	}
	writeJSONStatus(w, http.StatusOK, list)
}

func (s *v1State) handleChildren(w http.ResponseWriter, r *http.Request) {
	list, err := s.store.Children(r.Context(), r.PathValue("id"))
	if err != nil {
		writeStoreError(w, err)
		return
	}
	writeJSONStatus(w, http.StatusOK, list)
}

func (s *v1State) handlePatchSession(w http.ResponseWriter, r *http.Request) {
	body, err := readBody(r)
	if err != nil {
		writeError(w, err.Error(), http.StatusBadRequest)
		return
	}
	info, err := s.store.PatchSession(r.Context(), r.PathValue("id"), body)
	if err != nil {
		writeStoreError(w, err)
		return
	}
	s.publishSession("session.updated", info)
	writeJSONStatus(w, http.StatusOK, info)
}

func (s *v1State) handleDeleteSession(w http.ResponseWriter, r *http.Request) {
	deleted, err := s.store.DeleteSession(r.Context(), r.PathValue("id"))
	if err != nil {
		writeStoreError(w, err)
		return
	}
	for _, info := range deleted {
		s.publishSession("session.deleted", info)
	}
	for _, info := range deleted {
		s.events.Drop(info.ID)
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *v1State) handleFork(w http.ResponseWriter, r *http.Request) {
	body, err := readBody(r)
	if err != nil {
		writeError(w, err.Error(), http.StatusBadRequest)
		return
	}
	var in struct {
		MessageID string `json:"messageID"`
		Directory string `json:"directory"`
		Path      string `json:"path"`
		Version   string `json:"version"`
	}
	if err := json.Unmarshal(body, &in); err != nil || in.Directory == "" || in.Version == "" {
		writeError(w, "directory and version are required", http.StatusBadRequest)
		return
	}
	result, err := s.store.Fork(r.Context(), r.PathValue("id"), in.MessageID, in.Directory, in.Path, in.Version)
	if err != nil {
		writeStoreError(w, err)
		return
	}
	s.publishSession("session.created", result.Session)
	now := time.Now().UnixMilli()
	for _, item := range result.Messages {
		s.events.Publish("message.updated", result.Session.ID, map[string]any{"info": item.Info})
		for _, part := range item.Parts {
			s.events.Publish("message.part.updated", result.Session.ID, map[string]any{"sessionID": result.Session.ID, "part": part, "time": now})
		}
	}
	writeJSONStatus(w, http.StatusCreated, result.Session)
}

func (s *v1State) handleMessages(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	page, err := s.store.PageMessages(r.Context(), r.PathValue("id"), limit, r.URL.Query().Get("before"))
	if err != nil {
		writeStoreError(w, err)
		return
	}
	writeJSONStatus(w, http.StatusOK, page)
}

func (s *v1State) handleGetMessage(w http.ResponseWriter, r *http.Request) {
	item, err := s.store.GetMessage(r.Context(), r.PathValue("id"), r.PathValue("messageID"))
	if err != nil {
		writeStoreError(w, err)
		return
	}
	writeJSONStatus(w, http.StatusOK, item)
}

func withPathID(body json.RawMessage, key, value string) json.RawMessage {
	if value == "" {
		return body
	}
	var obj map[string]json.RawMessage
	if err := json.Unmarshal(body, &obj); err != nil {
		return body
	}
	quoted, _ := json.Marshal(value)
	obj[key] = quoted
	out, _ := json.Marshal(obj)
	return out
}

func (s *v1State) handleUpsertMessage(w http.ResponseWriter, r *http.Request) {
	body, err := readBody(r)
	if err != nil {
		writeError(w, err.Error(), http.StatusBadRequest)
		return
	}
	sessionID := r.PathValue("id")
	body = withPathID(body, "id", r.PathValue("messageID"))
	message, err := s.store.UpsertMessage(r.Context(), sessionID, body)
	if errors.Is(err, sessiondb.ErrLateWrite) {
		writeJSONStatus(w, http.StatusOK, map[string]any{"ignored": "late message update"})
		return
	}
	if err != nil {
		writeStoreError(w, err)
		return
	}
	s.events.Publish("message.updated", sessionID, map[string]any{"info": message})
	writeJSONStatus(w, http.StatusOK, message)
}

func (s *v1State) handleRemoveMessage(w http.ResponseWriter, r *http.Request) {
	sessionID, messageID := r.PathValue("id"), r.PathValue("messageID")
	if err := s.store.RemoveMessage(r.Context(), sessionID, messageID); err != nil {
		writeStoreError(w, err)
		return
	}
	s.events.Publish("message.removed", sessionID, map[string]any{"sessionID": sessionID, "messageID": messageID})
	w.WriteHeader(http.StatusNoContent)
}

func (s *v1State) handleUpsertPart(w http.ResponseWriter, r *http.Request) {
	body, err := readBody(r)
	if err != nil {
		writeError(w, err.Error(), http.StatusBadRequest)
		return
	}
	sessionID, messageID := r.PathValue("id"), r.PathValue("messageID")
	body = withPathID(body, "id", r.PathValue("partID"))
	now := time.Now().UnixMilli()
	part, err := s.store.UpsertPart(r.Context(), sessionID, messageID, body, now)
	if errors.Is(err, sessiondb.ErrLateWrite) {
		writeJSONStatus(w, http.StatusOK, map[string]any{"ignored": "late part update"})
		return
	}
	if err != nil {
		writeStoreError(w, err)
		return
	}
	s.events.Publish("message.part.updated", sessionID, map[string]any{"sessionID": sessionID, "part": part, "time": now})
	writeJSONStatus(w, http.StatusOK, part)
}

func (s *v1State) handleGetPart(w http.ResponseWriter, r *http.Request) {
	part, err := s.store.GetPart(r.Context(), r.PathValue("id"), r.PathValue("messageID"), r.PathValue("partID"))
	if err != nil {
		writeStoreError(w, err)
		return
	}
	writeJSONStatus(w, http.StatusOK, part)
}

func (s *v1State) handleRemovePart(w http.ResponseWriter, r *http.Request) {
	sessionID, messageID, partID := r.PathValue("id"), r.PathValue("messageID"), r.PathValue("partID")
	if err := s.store.RemovePart(r.Context(), sessionID, messageID, partID); err != nil {
		writeStoreError(w, err)
		return
	}
	s.events.Publish("message.part.removed", sessionID, map[string]any{"sessionID": sessionID, "messageID": messageID, "partID": partID})
	w.WriteHeader(http.StatusNoContent)
}

func (s *v1State) handleGetTodos(w http.ResponseWriter, r *http.Request) {
	todos, err := s.store.GetTodos(r.Context(), r.PathValue("id"))
	if err != nil {
		writeStoreError(w, err)
		return
	}
	writeJSONStatus(w, http.StatusOK, todos)
}

func (s *v1State) handleReplaceTodos(w http.ResponseWriter, r *http.Request) {
	body, err := readBody(r)
	if err != nil {
		writeError(w, err.Error(), http.StatusBadRequest)
		return
	}
	var todos []sessiondb.Todo
	if err := json.Unmarshal(body, &todos); err != nil {
		writeError(w, "body must be a todo array", http.StatusBadRequest)
		return
	}
	sessionID := r.PathValue("id")
	if err := s.store.ReplaceTodos(r.Context(), sessionID, todos); err != nil {
		writeStoreError(w, err)
		return
	}
	s.events.Publish("todo.updated", sessionID, map[string]any{"sessionID": sessionID, "todos": todos})
	stored, err := s.store.GetTodos(r.Context(), sessionID)
	if err != nil {
		writeStoreError(w, err)
		return
	}
	writeJSONStatus(w, http.StatusOK, stored)
}
