// Package transport provides adaptive listener creation.
//
// Auto-detects the best transport based on environment:
//   - Unix Domain Socket (local): fastest, no port conflicts, auto-cleanup
//   - TCP (Docker/VPS): configurable via GO_CORE_ADDR env var
//   - Windows fallback: TCP always (no Unix Socket support)
//
// Usage:
//
//	addr := transport.Addr()          // auto-detect best address
//	listener, _ := transport.Listen() // create appropriate listener
package transport

import (
	"fmt"
	"net"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
)

// Defaults
const (
	DefaultUnixPath = "/tmp/teamcode-core.sock"
	DefaultTCPPort  = 43001
)

// Addr returns the auto-detected best address for the environment.
// Returns a unix socket path on local Linux/macOS, or TCP address otherwise.
func Addr() string {
	if addr := os.Getenv("GO_CORE_ADDR"); addr != "" {
		return addr
	}
	if port := os.Getenv("GO_CORE_PORT"); port != "" {
		return "127.0.0.1:" + port
	}
	if useUnix() {
		return DefaultUnixPath
	}
	return fmt.Sprintf("127.0.0.1:%d", DefaultTCPPort)
}

// IsUnixSocket returns true if the address is a Unix Domain Socket path.
func IsUnixSocket(addr string) bool {
	return strings.HasPrefix(addr, "/") || strings.HasPrefix(addr, ".")
}

// Listen creates a listener for the best available transport.
func Listen() (net.Listener, string, error) {
	addr := Addr()
	return ListenOn(addr)
}

// ListenOn creates a listener for the given address.
func ListenOn(addr string) (net.Listener, string, error) {
	if IsUnixSocket(addr) {
		return listenUnix(addr)
	}
	return listenTCP(addr)
}

func listenUnix(path string) (net.Listener, string, error) {
	// Ensure parent directory exists
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, "", fmt.Errorf("create socket dir: %w", err)
	}

	// Remove stale socket file
	os.Remove(path)

	listener, err := net.Listen("unix", path)
	if err != nil {
		return nil, "", fmt.Errorf("unix listen: %w", err)
	}

	// Set permissions so only the owner can connect
	if err := os.Chmod(path, 0600); err != nil {
		listener.Close()
		return nil, "", fmt.Errorf("socket chmod: %w", err)
	}

	return listener, path, nil
}

func listenTCP(addr string) (net.Listener, string, error) {
	// Default to 127.0.0.1 if only port is given
	if _, err := strconv.Atoi(addr); err == nil {
		addr = "127.0.0.1:" + addr
	}
	if !strings.Contains(addr, ":") {
		addr = "127.0.0.1:" + addr
	}

	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return nil, "", fmt.Errorf("tcp listen: %w", err)
	}

	return listener, addr, nil
}

func useUnix() bool {
	if runtime.GOOS == "windows" {
		return false // Windows doesn't support Unix sockets natively
	}
	// Docker: check for /.dockerenv or cgroup
	if isDocker() {
		return false // TCP is preferred in containers
	}
	return true
}

func isDocker() bool {
	if _, err := os.Stat("/.dockerenv"); err == nil {
		return true
	}
	if _, err := os.Stat("/proc/1/cgroup"); err == nil {
		if data, err := os.ReadFile("/proc/1/cgroup"); err == nil {
			return strings.Contains(string(data), "docker")
		}
	}
	return false
}
