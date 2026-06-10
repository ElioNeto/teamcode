package provider

import (
	"testing"
)

func TestNewCatalog(t *testing.T) {
	c := NewCatalog()
	if c == nil {
		t.Fatal("expected non-nil catalog")
	}
}

func TestListProviders(t *testing.T) {
	c := NewCatalog()
	list := c.List()

	if len(list) == 0 {
		t.Fatal("expected at least one provider")
	}

	// Check for common providers
	ids := make(map[string]bool)
	for _, p := range list {
		ids[p.ID] = true
		if p.ModelCount <= 0 {
			t.Errorf("provider %s has no models", p.ID)
		}
		if p.Models != nil {
			t.Error("List() should omit models")
		}
	}

	if !ids["openai"] {
		t.Error("expected openai in catalog")
	}
	if !ids["anthropic"] {
		t.Error("expected anthropic in catalog")
	}
	if !ids["google"] {
		t.Error("expected google in catalog")
	}
}

func TestGetProvider(t *testing.T) {
	c := NewCatalog()

	p, ok := c.Get("openai")
	if !ok {
		t.Fatal("expected to find openai")
	}
	if p.ID != "openai" {
		t.Errorf("expected id openai, got %s", p.ID)
	}
	if p.Name != "OpenAI" {
		t.Errorf("expected name OpenAI, got %s", p.Name)
	}
	if len(p.Models) == 0 {
		t.Error("expected models for openai")
	}

	// Non-existent provider
	_, ok = c.Get("nonexistent")
	if ok {
		t.Error("expected false for nonexistent provider")
	}
}

func TestGetModels(t *testing.T) {
	c := NewCatalog()

	models, ok := c.GetModels("anthropic")
	if !ok {
		t.Fatal("expected to find anthropic models")
	}
	if len(models) == 0 {
		t.Fatal("expected at least one model")
	}

	// Check model structure
	m := models[0]
	if m.ID == "" {
		t.Error("model should have ID")
	}
	if m.Provider != "anthropic" {
		t.Errorf("expected provider anthropic, got %s", m.Provider)
	}
	if m.ContextLength <= 0 {
		t.Error("model should have context_length > 0")
	}

	// Non-existent provider
	_, ok = c.GetModels("nonexistent")
	if ok {
		t.Error("expected false for nonexistent provider")
	}
}

func TestAllModelsHaveProvider(t *testing.T) {
	c := NewCatalog()
	for _, p := range c.List() {
		pFull, _ := c.Get(p.ID)
		for _, m := range pFull.Models {
			if m.Provider != p.ID {
				t.Errorf("model %s has provider %s, expected %s", m.ID, m.Provider, p.ID)
			}
		}
	}
}

func TestAllProvidersHaveDescription(t *testing.T) {
	c := NewCatalog()
	for _, p := range c.providers {
		if p.Description == "" {
			t.Errorf("provider %s has no description", p.ID)
		}
	}
}
