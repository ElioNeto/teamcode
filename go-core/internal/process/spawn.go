// Package process provides process spawning with timeout, env vars, and working directory.
//
// Parity with: packages/core/src/cross-spawn-spawner.ts
package process

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"time"
)

// Result holds the output and exit information from a spawned process.
type Result struct {
	Stdout   string `json:"stdout"`
	Stderr   string `json:"stderr"`
	ExitCode int    `json:"exit_code"`
	Timeout  bool   `json:"timeout,omitempty"`
	Error    string `json:"error,omitempty"`
}

// Options configures a process spawn.
type Options struct {
	Command string            `json:"command"`
	Args    []string          `json:"args,omitempty"`
	Env     map[string]string `json:"env,omitempty"`
	CWD     string            `json:"cwd,omitempty"`
	Timeout time.Duration     `json:"-"`
}

// Spawn runs a command with the given options and returns the result.
func Spawn(opts Options) Result {
	ctx := context.Background()
	var cancel context.CancelFunc

	if opts.Timeout > 0 {
		ctx, cancel = context.WithTimeout(ctx, opts.Timeout)
		defer cancel()
	}

	cmd := exec.CommandContext(ctx, opts.Command, opts.Args...)

	// Set working directory
	if opts.CWD != "" {
		cmd.Dir = opts.CWD
	}

	// Set environment variables
	if len(opts.Env) > 0 {
		env := os.Environ()
		for k, v := range opts.Env {
			env = append(env, fmt.Sprintf("%s=%s", k, v))
		}
		cmd.Env = env
	}

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	result := Result{
		Stdout: stdout.String(),
		Stderr: stderr.String(),
	}

	if err != nil {
		if ctx.Err() == context.DeadlineExceeded {
			result.Timeout = true
			result.Error = "process timed out"
			result.ExitCode = -1
		} else if exitErr, ok := err.(*exec.ExitError); ok {
			result.ExitCode = exitErr.ExitCode()
		} else {
			result.Error = err.Error()
			result.ExitCode = -1
		}
	} else {
		result.ExitCode = 0
	}

	return result
}
