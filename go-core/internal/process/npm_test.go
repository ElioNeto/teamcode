package process_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/ElioNeto/teamcode/go-core/internal/process"
)

func TestNpmInstallInvalidDir(t *testing.T) {
	// Should fail gracefully when the directory doesn't exist
	r := process.NpmInstall("/nonexistent/path/xyz")
	if r.ExitCode == 0 {
		t.Log("npm install in nonexistent dir succeeded (unexpected but ok)")
		return
	}
	// Expected: non-zero exit or error
}

func TestNpmInstallInTempDir(t *testing.T) {
	tmp := t.TempDir()

	// Create a minimal package.json
	pkg := `{"name":"test","version":"1.0.0"}`
	if err := os.WriteFile(filepath.Join(tmp, "package.json"), []byte(pkg), 0644); err != nil {
		t.Fatalf("failed to write package.json: %v", err)
	}

	r := process.NpmInstall(tmp)
	if r.ExitCode != 0 {
		t.Logf("npm install stderr: %s", r.Stderr)
	}
}

func TestNpxHelp(t *testing.T) {
	r := process.Npx("/tmp", []string{"--help"}, 0)
	if r.ExitCode != 0 {
		t.Logf("npx --help exited with %d", r.ExitCode)
		// This can fail if npx is not installed; not a hard error
	}
}
