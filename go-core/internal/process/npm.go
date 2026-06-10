package process

import (
	"time"
)

const defaultInstallTimeout = 5 * time.Minute

// NpmInstall runs npm install in the given directory with optional packages.
func NpmInstall(dir string, add ...string) Result {
	args := []string{"install"}
	if len(add) > 0 {
		args = append(args, add...)
	}
	return Spawn(Options{
		Command: "npm",
		Args:    args,
		CWD:     dir,
		Timeout: defaultInstallTimeout,
	})
}

// Npx runs a command via npx.
func Npx(dir string, args []string, timeout time.Duration) Result {
	if timeout <= 0 {
		timeout = defaultInstallTimeout
	}
	return Spawn(Options{
		Command: "npx",
		Args:    args,
		CWD:     dir,
		Timeout: timeout,
	})
}

// BunX runs a command via bun x.
func BunX(dir string, args []string, timeout time.Duration) Result {
	if timeout <= 0 {
		timeout = defaultInstallTimeout
	}
	return Spawn(Options{
		Command: "bun",
		Args:    append([]string{"x"}, args...),
		CWD:     dir,
		Timeout: timeout,
	})
}
