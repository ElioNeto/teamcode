package process_test

import (
	"os"
	"path/filepath"
	"runtime"
	"testing"
	"time"

	"github.com/ElioNeto/teamcode/go-core/internal/process"
)

func TestEcho(t *testing.T) {
	r := process.Spawn(process.Options{
		Command: shell(),
		Args:    shellArgs("echo Hello World"),
	})
	if r.ExitCode != 0 {
		t.Errorf("expected exit code 0, got %d: stderr=%s", r.ExitCode, r.Stderr)
	}
	if r.Stdout == "" {
		t.Error("expected non-empty stdout")
	}
	if r.Error != "" {
		t.Errorf("unexpected error: %s", r.Error)
	}
}

func TestExitCode(t *testing.T) {
	r := process.Spawn(process.Options{
		Command: shell(),
		Args:    shellArgs("exit 42"),
	})
	if r.ExitCode != 42 {
		t.Errorf("expected exit code 42, got %d", r.ExitCode)
	}
}

func TestTimeout(t *testing.T) {
	r := process.Spawn(process.Options{
		Command: shell(),
		Args:    shellArgs("sleep 10"),
		Timeout: 100 * time.Millisecond,
	})
	if !r.Timeout {
		t.Errorf("expected timeout, got exit code %d: %s", r.ExitCode, r.Error)
	}
}

func TestCWD(t *testing.T) {
	tmp := t.TempDir()
	r := process.Spawn(process.Options{
		Command: shell(),
		Args:    shellArgs("pwd"),
		CWD:     tmp,
	})
	if r.ExitCode != 0 {
		t.Fatalf("expected exit code 0, got %d: %s", r.ExitCode, r.Stderr)
	}
	// pwd output may have newline
	if len(r.Stdout) == 0 {
		t.Fatal("expected non-empty stdout from pwd")
	}
}

func TestEnv(t *testing.T) {
	r := process.Spawn(process.Options{
		Command: shell(),
		Args:    shellArgs("echo $TEST_VAR"),
		Env:     map[string]string{"TEST_VAR": "hello"},
	})
	if r.ExitCode != 0 {
		t.Fatalf("expected exit code 0, got %d: %s", r.ExitCode, r.Stderr)
	}
}

func TestCommandNotFound(t *testing.T) {
	r := process.Spawn(process.Options{
		Command: "nonexistent-command-xyz",
	})
	if r.ExitCode != -1 {
		t.Errorf("expected exit code -1 for not found, got %d", r.ExitCode)
	}
	if r.Error == "" {
		t.Error("expected error message for nonexistent command")
	}
}

func TestWriteFile(t *testing.T) {
	tmp := t.TempDir()
	filePath := filepath.Join(tmp, "test.txt")
	r := process.Spawn(process.Options{
		Command: shell(),
		Args:    shellArgs("echo 'hello' > " + filePath),
	})
	if r.ExitCode != 0 {
		t.Fatalf("expected exit code 0, got %d: %s", r.ExitCode, r.Stderr)
	}
	data, err := os.ReadFile(filePath)
	if err != nil {
		t.Fatalf("failed to read file: %v", err)
	}
	if len(data) == 0 {
		t.Error("expected file to have content")
	}
}

func shell() string {
	if runtime.GOOS == "windows" {
		return "cmd"
	}
	return "/bin/sh"
}

func shellArgs(cmd string) []string {
	if runtime.GOOS == "windows" {
		return []string{"/C", cmd}
	}
	return []string{"-c", cmd}
}
