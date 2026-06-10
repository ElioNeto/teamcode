package main

import (
	"net/http"

	"github.com/ElioNeto/teamcode/go-core/internal/provider"
)

var providerCatalog = provider.NewCatalog()

// ---------------------------------------------------------------------------
// GET /providers — list all providers
// ---------------------------------------------------------------------------

func handleProviderList(w http.ResponseWriter, r *http.Request) {
	providers := providerCatalog.List()
	if providers == nil {
		providers = []*provider.Provider{}
	}
	writeJSON(w, map[string]interface{}{
		"providers": providers,
		"count":     len(providers),
	})
}

// ---------------------------------------------------------------------------
// GET /providers/{name}/models — list models for a provider
// ---------------------------------------------------------------------------

func handleProviderModels(w http.ResponseWriter, r *http.Request) {
	name := r.PathValue("name")
	if name == "" {
		writeError(w, "provider name is required", http.StatusBadRequest)
		return
	}

	p, ok := providerCatalog.Get(name)
	if !ok {
		writeError(w, "provider not found", http.StatusNotFound)
		return
	}

	writeJSON(w, map[string]interface{}{
		"provider": p.ID,
		"name":     p.Name,
		"models":   p.Models,
		"count":    len(p.Models),
	})
}
