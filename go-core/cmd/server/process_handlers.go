package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/ElioNeto/teamcode/go-core/internal/process"
)

type spawnRequest struct {
	Command string            `json:"command"`
	Args    []string          `json:"args,omitempty"`
	Env     map[string]string `json:"env,omitempty"`
	CWD     string            `json:"cwd,omitempty"`
	Timeout int               `json:"timeout_ms,omitempty"` // timeout in milliseconds
}

func handleSpawn(w http.ResponseWriter, r *http.Request) {
	var req spawnRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Command == "" {
		writeError(w, "command is required", http.StatusBadRequest)
		return
	}

	var timeout time.Duration
	if req.Timeout > 0 {
		timeout = time.Duration(req.Timeout) * time.Millisecond
	}

	result := process.Spawn(process.Options{
		Command: req.Command,
		Args:    req.Args,
		Env:     req.Env,
		CWD:     req.CWD,
		Timeout: timeout,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

type npmRequest struct {
	Dir     string   `json:"dir"`
	Args    []string `json:"args,omitempty"`
	Timeout int      `json:"timeout_ms,omitempty"`
}

func handleNpmInstall(w http.ResponseWriter, r *http.Request) {
	var req npmRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Dir == "" {
		writeError(w, "dir is required", http.StatusBadRequest)
		return
	}

	result := process.NpmInstall(req.Dir, req.Args...)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func handleNpx(w http.ResponseWriter, r *http.Request) {
	var req npmRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	result := process.Npx(req.Dir, req.Args, time.Duration(req.Timeout)*time.Millisecond)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
