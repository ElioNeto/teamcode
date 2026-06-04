#!/bin/sh

# POSIX shell wrapper for opencode that uses exec to replace the process
# This ensures VS Code and other terminal emulators see "opencode" as the
# process name instead of "node"

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# On Windows, fall back to the Node.js wrapper
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*)
    exec node "$SCRIPT_DIR/opencode.js" "$@"
    ;;
esac

# On Unix, use exec to replace this process with the opencode binary
# First, try to find the binary using the same logic as the Node.js wrapper

# Detect platform and architecture
case "$(uname -s)" in
  Darwin) PLATFORM="darwin" ;;
  Linux)  PLATFORM="linux" ;;
  *) PLATFORM="$(uname -s)" ;;
esac

case "$(uname -m)" in
  x86_64|amd64) ARCH="x64" ;;
  aarch64|arm64) ARCH="arm64" ;;
  armv7l|arm) ARCH="arm" ;;
  *) ARCH="$(uname -m)" ;;
esac

BASE="opencode-${PLATFORM}-${ARCH}"
BINARY="opencode"

# Check for cached binary or environment override
if [ -n "$OPENCODE_BIN_PATH" ]; then
  RESOLVED="$OPENCODE_BIN_PATH"
elif [ -f "$SCRIPT_DIR/.opencode" ]; then
  RESOLVED="$SCRIPT_DIR/.opencode"
else
  # Find the binary in node_modules
  RESOLVED=""
  dir="$SCRIPT_DIR"
  while [ "$dir" != "/" ]; do
    if [ -d "$dir/node_modules" ]; then
      # Try different binary name combinations
      for name in "$BASE" "${BASE}-baseline" "${BASE}-musl" "${BASE}-baseline-musl"; do
        candidate="$dir/node_modules/$name/bin/$BINARY"
        if [ -f "$candidate" ]; then
          RESOLVED="$candidate"
          break 2
        fi
      done
    fi
    dir="$(dirname "$dir")"
  done

  if [ -z "$RESOLVED" ]; then
    echo "It seems that your package manager failed to install the right version of the opencode CLI for your platform." >&2
    exit 1
  fi
fi

# Use exec to replace this process with the opencode binary
exec "$RESOLVED" "$@"
