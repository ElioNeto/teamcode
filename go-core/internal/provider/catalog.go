// Package provider provides a static catalog of LLM providers and models.
//
// The catalog is built-in and updated as part of the Go core release cycle.
// Dynamic provider discovery (e.g., from config or plugin system) is a future
// enhancement.
package provider

// Provider represents an LLM provider/service.
type Provider struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description,omitempty"`
	Website     string   `json:"website,omitempty"`
	ModelCount  int      `json:"model_count"`
	Models      []Model  `json:"models,omitempty"`
}

// Model represents a specific model offered by a provider.
type Model struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Provider      string `json:"provider"`
	Description   string `json:"description,omitempty"`
	ContextLength int    `json:"context_length"`
	MaxOutput     int    `json:"max_output,omitempty"`
	InputPrice    string `json:"input_price,omitempty"`  // per 1M tokens
	OutputPrice   string `json:"output_price,omitempty"` // per 1M tokens
}

// Catalog holds the provider definitions.
type Catalog struct {
	providers map[string]*Provider
}

// NewCatalog creates the built-in provider catalog.
func NewCatalog() *Catalog {
	c := &Catalog{
		providers: make(map[string]*Provider),
	}
	c.init()
	return c
}

// List returns all providers (without their model lists).
func (c *Catalog) List() []*Provider {
	result := make([]*Provider, 0, len(c.providers))
	for _, p := range c.providers {
		cp := *p
		cp.Models = nil // omit models in list
		result = append(result, &cp)
	}
	return result
}

// Get returns a provider by ID, including its models.
func (c *Catalog) Get(id string) (*Provider, bool) {
	p, ok := c.providers[id]
	if !ok {
		return nil, false
	}
	cp := *p
	return &cp, true
}

// GetModels returns models for a provider.
func (c *Catalog) GetModels(providerID string) ([]Model, bool) {
	p, ok := c.providers[providerID]
	if !ok {
		return nil, false
	}
	result := make([]Model, len(p.Models))
	copy(result, p.Models)
	return result, true
}

// init populates the built-in catalog.
func (c *Catalog) init() {
	// OpenAI
	c.addProvider(&Provider{
		ID:      "openai",
		Name:    "OpenAI",
		Website: "https://openai.com",
		Models: []Model{
			{ID: "gpt-4o", Name: "GPT-4o", ContextLength: 128000, MaxOutput: 16384, InputPrice: "$2.50", OutputPrice: "$10.00"},
			{ID: "gpt-4o-mini", Name: "GPT-4o Mini", ContextLength: 128000, MaxOutput: 16384, InputPrice: "$0.15", OutputPrice: "$0.60"},
			{ID: "gpt-4-turbo", Name: "GPT-4 Turbo", ContextLength: 128000, MaxOutput: 4096, InputPrice: "$10.00", OutputPrice: "$30.00"},
			{ID: "gpt-4", Name: "GPT-4", ContextLength: 8192, MaxOutput: 4096, InputPrice: "$30.00", OutputPrice: "$60.00"},
			{ID: "gpt-3.5-turbo", Name: "GPT-3.5 Turbo", ContextLength: 16385, MaxOutput: 4096, InputPrice: "$0.50", OutputPrice: "$1.50"},
			{ID: "o1", Name: "o1", ContextLength: 200000, MaxOutput: 100000, InputPrice: "$15.00", OutputPrice: "$60.00"},
			{ID: "o1-mini", Name: "o1 Mini", ContextLength: 128000, MaxOutput: 65536, InputPrice: "$3.00", OutputPrice: "$12.00"},
			{ID: "o3-mini", Name: "o3 Mini", ContextLength: 200000, MaxOutput: 100000, InputPrice: "$1.10", OutputPrice: "$4.40"},
		},
	})

	// Anthropic
	c.addProvider(&Provider{
		ID:      "anthropic",
		Name:    "Anthropic",
		Website: "https://anthropic.com",
		Models: []Model{
			{ID: "claude-sonnet-4-20250514", Name: "Claude Sonnet 4", ContextLength: 200000, MaxOutput: 8192, InputPrice: "$3.00", OutputPrice: "$15.00"},
			{ID: "claude-haiku-3-5-20241022", Name: "Claude Haiku 3.5", ContextLength: 200000, MaxOutput: 8192, InputPrice: "$0.80", OutputPrice: "$4.00"},
			{ID: "claude-opus-4-20250514", Name: "Claude Opus 4", ContextLength: 200000, MaxOutput: 8192, InputPrice: "$15.00", OutputPrice: "$75.00"},
		},
	})

	// Google
	c.addProvider(&Provider{
		ID:      "google",
		Name:    "Google AI",
		Website: "https://ai.google.dev",
		Models: []Model{
			{ID: "gemini-2.5-pro-exp-03-25", Name: "Gemini 2.5 Pro", ContextLength: 1048576, MaxOutput: 8192, InputPrice: "$1.25", OutputPrice: "$10.00"},
			{ID: "gemini-2.5-flash-preview-04-17", Name: "Gemini 2.5 Flash", ContextLength: 1048576, MaxOutput: 8192, InputPrice: "$0.15", OutputPrice: "$0.60"},
			{ID: "gemini-2.0-flash", Name: "Gemini 2.0 Flash", ContextLength: 1048576, MaxOutput: 8192, InputPrice: "$0.10", OutputPrice: "$0.40"},
		},
	})

	// Mistral
	c.addProvider(&Provider{
		ID:      "mistral",
		Name:    "Mistral AI",
		Website: "https://mistral.ai",
		Models: []Model{
			{ID: "mistral-large-2501", Name: "Mistral Large", ContextLength: 128000, MaxOutput: 4096, InputPrice: "$2.00", OutputPrice: "$6.00"},
			{ID: "mistral-small-2501", Name: "Mistral Small", ContextLength: 32000, MaxOutput: 4096, InputPrice: "$0.20", OutputPrice: "$0.60"},
			{ID: "codestral-2501", Name: "Codestral", ContextLength: 256000, MaxOutput: 8192, InputPrice: "$1.00", OutputPrice: "$3.00"},
		},
	})

	// DeepSeek
	c.addProvider(&Provider{
		ID:      "deepseek",
		Name:    "DeepSeek",
		Website: "https://deepseek.com",
		Models: []Model{
			{ID: "deepseek-chat", Name: "DeepSeek V3", ContextLength: 64000, MaxOutput: 8192, InputPrice: "$0.27", OutputPrice: "$1.10"},
			{ID: "deepseek-reasoner", Name: "DeepSeek R1", ContextLength: 64000, MaxOutput: 8192, InputPrice: "$0.55", OutputPrice: "$2.19"},
		},
	})

	// Groq
	c.addProvider(&Provider{
		ID:      "groq",
		Name:    "Groq",
		Website: "https://groq.com",
		Models: []Model{
			{ID: "llama-3.3-70b-versatile", Name: "Llama 3.3 70B", ContextLength: 128000, MaxOutput: 8192, InputPrice: "$0.59", OutputPrice: "$0.79"},
			{ID: "llama-3.1-8b-instant", Name: "Llama 3.1 8B", ContextLength: 128000, MaxOutput: 8192, InputPrice: "$0.05", OutputPrice: "$0.08"},
			{ID: "mixtral-8x7b-32768", Name: "Mixtral 8x7B", ContextLength: 32768, MaxOutput: 4096, InputPrice: "$0.24", OutputPrice: "$0.24"},
		},
	})

	// Together AI
	c.addProvider(&Provider{
		ID:      "together",
		Name:    "Together AI",
		Website: "https://together.ai",
		Models: []Model{
			{ID: "deepseek-ai/DeepSeek-V3", Name: "DeepSeek V3", ContextLength: 64000, MaxOutput: 8192, InputPrice: "$1.00", OutputPrice: "$1.00"},
			{ID: "meta-llama/Llama-3.3-70B-Instruct-Turbo", Name: "Llama 3.3 70B", ContextLength: 128000, MaxOutput: 8192, InputPrice: "$0.88", OutputPrice: "$0.88"},
		},
	})

	// GitHub Models (Azure AI)
	c.addProvider(&Provider{
		ID:      "github",
		Name:    "GitHub Models",
		Website: "https://github.com/marketplace/models",
		Models: []Model{
			{ID: "gpt-4o", Name: "GPT-4o", ContextLength: 128000, MaxOutput: 16384, InputPrice: "$0.00", OutputPrice: "$0.00"},
			{ID: "gpt-4o-mini", Name: "GPT-4o Mini", ContextLength: 128000, MaxOutput: 16384, InputPrice: "$0.00", OutputPrice: "$0.00"},
			{ID: "claude-sonnet-4-20250514", Name: "Claude Sonnet 4", ContextLength: 200000, MaxOutput: 8192, InputPrice: "$3.00", OutputPrice: "$15.00"},
		},
	})
}

func (c *Catalog) addProvider(p *Provider) {
	p.ModelCount = len(p.Models)
	// Auto-fill the Provider field on each model
	for i := range p.Models {
		if p.Models[i].Provider == "" {
			p.Models[i].Provider = p.ID
		}
	}
	// Set default description if missing
	if p.Description == "" {
		p.Description = p.Name + " — LLM provider"
	}
	c.providers[p.ID] = p
}
