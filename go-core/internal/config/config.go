// Package config provides loading, merging, and caching of teamcode.json[c]
// configuration files.
//
// Supports both JSON (.json) and JSONC (.jsonc with // and /* */ comments).
// Config files are found by walking up from a directory.
package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

// Config represents the parsed teamcode configuration.
type Config struct {
	// Version of the config schema.
	Version string `json:"version,omitempty"`

	// Agent configuration.
	Agent string `json:"agent,omitempty"`

	// Model configuration.
	Model string `json:"model,omitempty"`

	// Custom instructions for the agent.
	Instructions string `json:"instructions,omitempty"`

	// Raw holds any fields not captured by the struct.
	Raw map[string]interface{} `json:"-"`
}

// Loader finds, parses, merges, and caches teamcode configuration files.
type Loader struct {
	mu     sync.RWMutex
	cache  map[string]*Config // keyed by directory
}

// NewLoader creates a new Loader.
func NewLoader() *Loader {
	return &Loader{
		cache: make(map[string]*Config),
	}
}

// Load loads the configuration for the given directory by finding and merging
// teamcode.json[c] files walking up from that directory.
func (l *Loader) Load(dir string) (*Config, error) {
	l.mu.RLock()
	if cfg, ok := l.cache[dir]; ok {
		l.mu.RUnlock()
		return cfg, nil
	}
	l.mu.RUnlock()

	files := findConfigFiles(dir)

	var merged *Config
	// Iterate from last (farthest) to first (closest) so closest config wins
	for i := len(files) - 1; i >= 0; i-- {
		cfg, err := parseFile(files[i])
		if err != nil {
			continue
		}
		if merged == nil {
			merged = cfg
		} else {
			merged = merge(merged, cfg) // cfg overrides merged
		}
	}

	if merged == nil {
		merged = &Config{Raw: make(map[string]interface{})}
	}
	if merged.Raw == nil {
		merged.Raw = make(map[string]interface{})
	}

	l.mu.Lock()
	l.cache[dir] = merged
	l.mu.Unlock()

	return merged, nil
}

// Invalidate removes a cached config for the given directory.
func (l *Loader) Invalidate(dir string) {
	l.mu.Lock()
	delete(l.cache, dir)
	l.mu.Unlock()
}

// Clear empties the entire cache.
func (l *Loader) Clear() {
	l.mu.Lock()
	l.cache = make(map[string]*Config)
	l.mu.Unlock()
}

// findConfigFiles walks up from dir looking for teamcode.json[c] files.
func findConfigFiles(dir string) []string {
	var files []string
	abs, _ := filepath.Abs(dir)

	for {
		for _, name := range []string{"teamcode.json", "teamcode.jsonc"} {
			p := filepath.Join(abs, name)
			if _, err := os.Stat(p); err == nil {
				files = append(files, p) // closer dirs first (added in order of discovery)
			}
		}

		parent := filepath.Dir(abs)
		if parent == abs {
			break
		}
		abs = parent
	}

	return files
}

// parseFile reads and parses a teamcode.json[c] file.
func parseFile(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	if strings.HasSuffix(path, ".jsonc") {
		data = stripComments(data)
	}

	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, err
	}

	// Capture raw fields not in the struct
	var rawMap map[string]interface{}
	if err := json.Unmarshal(data, &rawMap); err == nil {
		cfg.Raw = rawMap
	}

	if cfg.Raw == nil {
		cfg.Raw = make(map[string]interface{})
	}

	return &cfg, nil
}

// stripComments removes // and /* */ comments from JSONC content.
func stripComments(data []byte) []byte {
	text := string(data)
	var result strings.Builder
	result.Grow(len(text))

	inString := false
	i := 0
	for i < len(text) {
		// Track string literals to avoid removing comments inside strings
		if text[i] == '"' && (i == 0 || text[i-1] != '\\') {
			inString = !inString
			result.WriteByte(text[i])
			i++
			continue
		}

		if inString {
			result.WriteByte(text[i])
			i++
			continue
		}

		// Single-line comment
		if i+1 < len(text) && text[i] == '/' && text[i+1] == '/' {
			for i < len(text) && text[i] != '\n' {
				i++
			}
			if i < len(text) {
				result.WriteByte('\n')
				i++
			}
			continue
		}
		// Multi-line comment
		if i+1 < len(text) && text[i] == '/' && text[i+1] == '*' {
			i += 2
			for i+1 < len(text) && !(text[i] == '*' && text[i+1] == '/') {
				if text[i] == '\n' {
					result.WriteByte('\n')
				}
				i++
			}
			i += 2
			continue
		}
		result.WriteByte(text[i])
		i++
	}

	return []byte(result.String())
}

// merge merges two configs, with b taking precedence over a.
func merge(a, b *Config) *Config {
	if a == nil {
		return b
	}
	if b == nil {
		return a
	}

	result := *a

	if b.Version != "" {
		result.Version = b.Version
	}
	if b.Agent != "" {
		result.Agent = b.Agent
	}
	if b.Model != "" {
		result.Model = b.Model
	}
	if b.Instructions != "" {
		result.Instructions = b.Instructions
	}

	// Merge raw fields
	result.Raw = make(map[string]interface{})
	for k, v := range a.Raw {
		result.Raw[k] = v
	}
	for k, v := range b.Raw {
		result.Raw[k] = v
	}

	return &result
}
