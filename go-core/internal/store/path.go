package store

import (
	"path/filepath"
	"regexp"
	"strings"
)

var unsafeChannelChars = regexp.MustCompile(`[^a-zA-Z0-9._-]`)

func dataDir(env func(string) string, home string) string {
	if xdg := env("XDG_DATA_HOME"); xdg != "" {
		return filepath.Join(xdg, "teamcode")
	}
	return filepath.Join(home, ".local", "share", "teamcode")
}

func channelFile(env func(string) string) string {
	channel := env("TEAMCODE_CHANNEL")
	if channel == "" {
		channel = "local"
	}
	sharedChannel := channel == "latest" || channel == "beta" || channel == "prod"
	if sharedChannel || env("TEAMCODE_DISABLE_CHANNEL_DB") != "" {
		return "opencode.db"
	}
	return "opencode-" + unsafeChannelChars.ReplaceAllString(channel, "-") + ".db"
}

func ResolvePath(env func(string) string, home string) string {
	if explicit := env("TEAMCODE_DB"); explicit != "" {
		if explicit == ":memory:" || filepath.IsAbs(explicit) || strings.HasPrefix(explicit, "/") {
			return explicit
		}
		return filepath.Join(dataDir(env, home), explicit)
	}
	return filepath.Join(dataDir(env, home), channelFile(env))
}
