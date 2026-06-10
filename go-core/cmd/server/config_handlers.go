package main

import (
	"encoding/json"
	"net/http"

	"github.com/ElioNeto/teamcode/go-core/internal/config"
)

// configLoader is the global config loader.
var configLoader = config.NewLoader()

// ---------------------------------------------------------------------------
// POST /config/get — get merged config for a directory
// ---------------------------------------------------------------------------

type configGetRequest struct {
	Directory string `json:"directory"`
}

func handleConfigGet(w http.ResponseWriter, r *http.Request) {
	var req configGetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.Directory == "" {
		writeError(w, "directory is required", http.StatusBadRequest)
		return
	}

	cfg, err := configLoader.Load(req.Directory)
	if err != nil {
		writeError(w, "failed to load config: "+err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, cfg)
}

// ---------------------------------------------------------------------------
// POST /config/invalidate — invalidate cached config for a directory
// ---------------------------------------------------------------------------

type configInvalidateRequest struct {
	Directory string `json:"directory"`
}

func handleConfigInvalidate(w http.ResponseWriter, r *http.Request) {
	var req configInvalidateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if req.Directory == "" {
		writeError(w, "directory is required", http.StatusBadRequest)
		return
	}

	configLoader.Invalidate(req.Directory)
	w.WriteHeader(http.StatusNoContent)
}
