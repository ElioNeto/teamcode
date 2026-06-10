package main

import (
	"encoding/json"
	"net/http"

	"github.com/ElioNeto/teamcode/go-core/internal/filesystem"
)

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

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

type fsPathRequest struct {
	Path string `json:"path"`
}

type fsGlobRequest struct {
	Pattern string `json:"pattern"`
	Cwd     string `json:"cwd,omitempty"`
	Dot     bool   `json:"dot,omitempty"`
}

type fsFindUpRequest struct {
	Target string `json:"target"`
	Start  string `json:"start"`
	Stop   string `json:"stop,omitempty"`
}

type fsUpRequest struct {
	Targets []string `json:"targets"`
	Start   string   `json:"start"`
	Stop    string   `json:"stop,omitempty"`
}

type fsCopyMoveRequest struct {
	Src string `json:"src"`
	Dst string `json:"dst"`
}

// ---------------------------------------------------------------------------
// /fs/read
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// /fs/write
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// /fs/list
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// /fs/stat
// ---------------------------------------------------------------------------

func handleFSStat(w http.ResponseWriter, r *http.Request) {
	var req fsPathRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.Path == "" {
		writeError(w, "path is required", http.StatusBadRequest)
		return
	}

	info, err := filesystem.StatResultJSON(req.Path)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, info)
}

// ---------------------------------------------------------------------------
// /fs/exists
// ---------------------------------------------------------------------------

func handleFSExists(w http.ResponseWriter, r *http.Request) {
	var req fsPathRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	exists, err := filesystem.Exists(req.Path)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, map[string]bool{"exists": exists})
}

// ---------------------------------------------------------------------------
// /fs/is-dir, /fs/is-file
// ---------------------------------------------------------------------------

func handleFSIsDir(w http.ResponseWriter, r *http.Request) {
	var req fsPathRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	isDir, err := filesystem.IsDir(req.Path)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, map[string]bool{"dir": isDir})
}

func handleFSIsFile(w http.ResponseWriter, r *http.Request) {
	var req fsPathRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	isFile, err := filesystem.IsFile(req.Path)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, map[string]bool{"file": isFile})
}

// ---------------------------------------------------------------------------
// /fs/read-safe
// ---------------------------------------------------------------------------

func handleFSReadSafe(w http.ResponseWriter, r *http.Request) {
	var req fsPathRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	content, found, err := filesystem.ReadFileStringSafe(req.Path)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, map[string]interface{}{
		"content": content,
		"found":   found,
	})
}

// ---------------------------------------------------------------------------
// /fs/read-json
// ---------------------------------------------------------------------------

func handleFSReadJSON(w http.ResponseWriter, r *http.Request) {
	var req fsPathRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	var data interface{}
	if err := filesystem.ReadJSON(req.Path, &data); err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, data)
}

// ---------------------------------------------------------------------------
// /fs/write-json
// ---------------------------------------------------------------------------

func handleFSWriteJSON(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Path string      `json:"path"`
		Data interface{} `json:"data"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.Path == "" {
		writeError(w, "path is required", http.StatusBadRequest)
		return
	}

	if err := filesystem.WriteJSON(req.Path, req.Data); err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ---------------------------------------------------------------------------
// /fs/ensure-dir
// ---------------------------------------------------------------------------

func handleFSEnsureDir(w http.ResponseWriter, r *http.Request) {
	var req fsPathRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.Path == "" {
		writeError(w, "path is required", http.StatusBadRequest)
		return
	}

	if err := filesystem.EnsureDir(req.Path); err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ---------------------------------------------------------------------------
// /fs/readdir
// ---------------------------------------------------------------------------

func handleFSReaddir(w http.ResponseWriter, r *http.Request) {
	var req fsPathRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	entries, err := filesystem.ReadDirectoryEntries(req.Path)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, map[string]interface{}{"entries": entries})
}

// ---------------------------------------------------------------------------
// /fs/glob
// ---------------------------------------------------------------------------

func handleFSGlob(w http.ResponseWriter, r *http.Request) {
	var req fsGlobRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.Pattern == "" {
		writeError(w, "pattern is required", http.StatusBadRequest)
		return
	}

	matches, err := filesystem.Glob(req.Pattern, filesystem.GlobOptions{
		Cwd: req.Cwd,
		Dot: req.Dot,
	})
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, map[string]interface{}{"matches": matches})
}

// ---------------------------------------------------------------------------
// /fs/glob-match
// ---------------------------------------------------------------------------

func handleFSGlobMatch(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Pattern string `json:"pattern"`
		Path    string `json:"path"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	match := filesystem.GlobMatch(req.Pattern, req.Path)
	writeJSON(w, map[string]bool{"match": match})
}

// ---------------------------------------------------------------------------
// /fs/find-up
// ---------------------------------------------------------------------------

func handleFSFindUp(w http.ResponseWriter, r *http.Request) {
	var req fsFindUpRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	results, err := filesystem.FindUp(req.Target, req.Start, req.Stop)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, map[string]interface{}{"results": results})
}

// ---------------------------------------------------------------------------
// /fs/up
// ---------------------------------------------------------------------------

func handleFSUp(w http.ResponseWriter, r *http.Request) {
	var req fsUpRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	results, err := filesystem.Up(req.Targets, req.Start, req.Stop)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, map[string]interface{}{"results": results})
}

// ---------------------------------------------------------------------------
// /fs/glob-up
// ---------------------------------------------------------------------------

func handleFSGlobUp(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Pattern string `json:"pattern"`
		Start   string `json:"start"`
		Stop    string `json:"stop,omitempty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	results, err := filesystem.GlobUp(req.Pattern, req.Start, req.Stop)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, map[string]interface{}{"results": results})
}

// ---------------------------------------------------------------------------
// /fs/copy, /fs/move
// ---------------------------------------------------------------------------

func handleFSCopy(w http.ResponseWriter, r *http.Request) {
	var req fsCopyMoveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.Src == "" || req.Dst == "" {
		writeError(w, "src and dst are required", http.StatusBadRequest)
		return
	}

	if err := filesystem.Copy(req.Src, req.Dst); err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func handleFSMove(w http.ResponseWriter, r *http.Request) {
	var req fsCopyMoveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.Src == "" || req.Dst == "" {
		writeError(w, "src and dst are required", http.StatusBadRequest)
		return
	}

	if err := filesystem.Move(req.Src, req.Dst); err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ---------------------------------------------------------------------------
// /fs/remove, /fs/remove-all
// ---------------------------------------------------------------------------

func handleFSRemove(w http.ResponseWriter, r *http.Request) {
	var req fsPathRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := filesystem.Remove(req.Path); err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func handleFSRemoveAll(w http.ResponseWriter, r *http.Request) {
	var req fsPathRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := filesystem.RemoveAll(req.Path); err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ---------------------------------------------------------------------------
// /fs/watch (placeholder)
// ---------------------------------------------------------------------------

func handleFSWatch(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, map[string]string{
		"status":  "not_implemented",
		"message": "File watching requires WebSocket/SSE support - planned for phase 2",
	})
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

func writeJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
