package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func TestStripComments(t *testing.T) {
	input := []byte(`{
  // single line
  "name": "test",
  /* multi
     line */
  "value": 1
}`)
	// Comments are replaced with newlines to preserve line structure.
	// The exact whitespace layout may differ but JSON must remain valid.
	result := string(stripComments(input))

	// Verify the JSON is still valid
	var v interface{}
	if err := json.Unmarshal([]byte(result), &v); err != nil {
		t.Errorf("result is not valid JSON: %v\nResult: %s", err, result)
	}

	// Verify values are preserved
	m := v.(map[string]interface{})
	if m["name"] != "test" {
		t.Errorf("expected name=test, got %v", m["name"])
	}
	if m["value"] != float64(1) {
		t.Errorf("expected value=1, got %v", m["value"])
	}
}

func TestStripCommentsInsideString(t *testing.T) {
	input := []byte(`{"path": "http://example.com/foo" /* comment */}`)
	result := string(stripComments(input))

	var v interface{}
	if err := json.Unmarshal([]byte(result), &v); err != nil {
		t.Errorf("result is not valid JSON: %v\nResult: %s", err, result)
	}
	m := v.(map[string]interface{})
	if m["path"] != "http://example.com/foo" {
		t.Errorf("expected path value preserved, got %v", m["path"])
	}
}

func TestParseJSON(t *testing.T) {
	dir := t.TempDir()
	cfgPath := filepath.Join(dir, "teamcode.json")
	content := `{
		"version": "1",
		"agent": "test-agent",
		"model": "gpt-4",
		"instructions": "Be helpful"
	}`
	if err := os.WriteFile(cfgPath, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	cfg, err := parseFile(cfgPath)
	if err != nil {
		t.Fatal(err)
	}
	if cfg.Version != "1" {
		t.Errorf("expected version 1, got %s", cfg.Version)
	}
	if cfg.Agent != "test-agent" {
		t.Errorf("expected agent test-agent, got %s", cfg.Agent)
	}
	if cfg.Model != "gpt-4" {
		t.Errorf("expected model gpt-4, got %s", cfg.Model)
	}
	if cfg.Instructions != "Be helpful" {
		t.Errorf("expected instructions 'Be helpful', got %s", cfg.Instructions)
	}
}

func TestParseJSONC(t *testing.T) {
	dir := t.TempDir()
	cfgPath := filepath.Join(dir, "teamcode.jsonc")
	content := `{
		// This is a comment
		"version": "2",
		"agent": "dev-agent" /* inline comment */
	}`
	if err := os.WriteFile(cfgPath, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	cfg, err := parseFile(cfgPath)
	if err != nil {
		t.Fatal(err)
	}
	if cfg.Version != "2" {
		t.Errorf("expected version 2, got %s", cfg.Version)
	}
	if cfg.Agent != "dev-agent" {
		t.Errorf("expected agent dev-agent, got %s", cfg.Agent)
	}
}

func TestParseJSONCNoComments(t *testing.T) {
	// Verify that regular JSON files parse correctly via the jsonc path
	dir := t.TempDir()
	cfgPath := filepath.Join(dir, "teamcode.jsonc")
	content := `{"model": "gpt-4"}`
	if err := os.WriteFile(cfgPath, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	cfg, err := parseFile(cfgPath)
	if err != nil {
		t.Fatal(err)
	}
	if cfg.Model != "gpt-4" {
		t.Errorf("expected model gpt-4, got %s", cfg.Model)
	}
}

func TestRawFields(t *testing.T) {
	dir := t.TempDir()
	cfgPath := filepath.Join(dir, "teamcode.json")
	content := `{"custom_field": "custom_value", "number": 42}`
	if err := os.WriteFile(cfgPath, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	cfg, err := parseFile(cfgPath)
	if err != nil {
		t.Fatal(err)
	}
	if cfg.Raw["custom_field"] != "custom_value" {
		t.Errorf("expected custom_field=custom_value, got %v", cfg.Raw["custom_field"])
	}
	if cfg.Raw["number"] != float64(42) {
		t.Errorf("expected number=42, got %v", cfg.Raw["number"])
	}
}

func TestFindConfigFiles(t *testing.T) {
	// Create structure: /tmp/xxx/sub/project/
	root := t.TempDir()
	sub := filepath.Join(root, "sub", "project")
	if err := os.MkdirAll(sub, 0755); err != nil {
		t.Fatal(err)
	}

	// Root config
	rootCfg := filepath.Join(root, "teamcode.json")
	os.WriteFile(rootCfg, []byte(`{"version": "root"}`), 0644)

	// Project config
	projCfg := filepath.Join(sub, "teamcode.jsonc")
	os.WriteFile(projCfg, []byte(`{"version": "project"}`), 0644)

	files := findConfigFiles(sub)
	if len(files) != 2 {
		t.Fatalf("expected 2 config files, got %d: %v", len(files), files)
	}

	// The closer file should come first
	if files[0] != projCfg {
		t.Errorf("expected project config first, got %s", files[0])
	}
	if files[1] != rootCfg {
		t.Errorf("expected root config second, got %s", files[1])
	}
}

func TestMerge(t *testing.T) {
	a := &Config{
		Version:      "1",
		Agent:        "agent-a",
		Instructions: "From A",
		Raw:          map[string]interface{}{"custom_a": "value_a"},
	}
	b := &Config{
		Version: "2",
		Model:   "model-b",
		Raw:     map[string]interface{}{"custom_b": "value_b"},
	}

	merged := merge(a, b)
	if merged.Version != "2" {
		t.Errorf("expected version 2 (from b), got %s", merged.Version)
	}
	if merged.Agent != "agent-a" {
		t.Errorf("expected agent agent-a (from a), got %s", merged.Agent)
	}
	if merged.Model != "model-b" {
		t.Errorf("expected model model-b (from b), got %s", merged.Model)
	}
	if merged.Instructions != "From A" {
		t.Errorf("expected instructions 'From A', got %s", merged.Instructions)
	}
	if merged.Raw["custom_a"] != "value_a" {
		t.Errorf("expected custom_a value_a, got %v", merged.Raw["custom_a"])
	}
	if merged.Raw["custom_b"] != "value_b" {
		t.Errorf("expected custom_b value_b, got %v", merged.Raw["custom_b"])
	}
}

func TestLoadAndCache(t *testing.T) {
	loader := NewLoader()

	dir := t.TempDir()
	cfgPath := filepath.Join(dir, "teamcode.json")
	os.WriteFile(cfgPath, []byte(`{"agent": "cached-agent"}`), 0644)

	// First load
	cfg, err := loader.Load(dir)
	if err != nil {
		t.Fatal(err)
	}
	if cfg.Agent != "cached-agent" {
		t.Errorf("expected agent cached-agent, got %s", cfg.Agent)
	}

	// Modify file
	os.WriteFile(cfgPath, []byte(`{"agent": "new-agent"}`), 0644)

	// Load again — should still be cached
	cfg, _ = loader.Load(dir)
	if cfg.Agent != "cached-agent" {
		t.Errorf("expected cached agent cached-agent, got %s", cfg.Agent)
	}

	// Invalidate and reload
	loader.Invalidate(dir)
	cfg, _ = loader.Load(dir)
	if cfg.Agent != "new-agent" {
		t.Errorf("expected new agent new-agent, got %s", cfg.Agent)
	}
}

func TestLoadNoConfig(t *testing.T) {
	loader := NewLoader()
	dir := t.TempDir() // no config files

	cfg, err := loader.Load(dir)
	if err != nil {
		t.Fatal(err)
	}
	if cfg == nil {
		t.Fatal("expected empty config, got nil")
	}
}
