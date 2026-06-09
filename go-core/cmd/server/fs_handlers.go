package main

import (
	"encoding/json"
	"net/http"

	"github.com/ElioNeto/teamcode/go-core/internal/filesystem"
)

type fsReadRequest struct {
	Path   string `json:"path"`
	Offset int    `json:"offset,omitempty"`
	Limit  int    `json:"limit,omitempty"`
}

type fsWriteRequest struct {
	Path    string `json:"path"`
	Content string `json:"content"`
}

type fsListRequest struct {
	Path      string `json:"path"`
	Pattern   string `json:"pattern,omitempty"`
	Recursive bool   `json:"recursive,omitempty"`
}

func handleFSRead(w http.ResponseWriter, r *http.Request) {
	var req fsReadRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.Path == "" {
		writeError(w, "path is required", http.StatusBadRequest)
		return
	}

	result, err := filesystem.Read(req.Path, req.Offset, req.Limit)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, result)
}

func handleFSWrite(w http.ResponseWriter, r *http.Request) {
	var req fsWriteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.Path == "" {
		writeError(w, "path is required", http.StatusBadRequest)
		return
	}

	if err := filesystem.Write(req.Path, []byte(req.Content)); err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func handleFSList(w http.ResponseWriter, r *http.Request) {
	var req fsListRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.Path == "" {
		writeError(w, "path is required", http.StatusBadRequest)
		return
	}

	files, err := filesystem.List(req.Path, req.Pattern, req.Recursive)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, map[string]interface{}{"files": files})
}

func handleFSStat(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Path string `json:"path"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.Path == "" {
		writeError(w, "path is required", http.StatusBadRequest)
		return
	}

	info, err := filesystem.Stat(req.Path)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, map[string]interface{}{
		"name":    info.Name(),
		"size":    info.Size(),
		"mode":    info.Mode().String(),
		"modtime": info.ModTime().UTC().Format("2006-01-02T15:04:05Z"),
		"dir":     info.IsDir(),
	})
}

func handleFSWatch(w http.ResponseWriter, r *http.Request) {
	// File watching is more complex and requires a persistent connection.
	// For now, return a placeholder indicating it's not yet implemented.
	writeJSON(w, map[string]string{
		"status":  "not_implemented",
		"message": "File watching requires WebSocket/SSE support - planned for phase 2",
	})
}

func writeJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
