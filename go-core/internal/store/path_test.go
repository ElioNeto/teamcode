package store

import (
	"path/filepath"
	"testing"
)

func envFrom(m map[string]string) func(string) string {
	return func(k string) string { return m[k] }
}

func TestResolvePathUsesTeamcodeDBWhenAbsolute(t *testing.T) {
	got := ResolvePath(envFrom(map[string]string{"TEAMCODE_DB": "/tmp/x.db"}), "/home/u")
	if got != "/tmp/x.db" {
		t.Fatalf("got %q", got)
	}
}

func TestResolvePathMemoryPassesThrough(t *testing.T) {
	got := ResolvePath(envFrom(map[string]string{"TEAMCODE_DB": ":memory:"}), "/home/u")
	if got != ":memory:" {
		t.Fatalf("got %q", got)
	}
}

func TestResolvePathRelativeTeamcodeDBUnderDataDir(t *testing.T) {
	got := ResolvePath(envFrom(map[string]string{"TEAMCODE_DB": "x.db", "XDG_DATA_HOME": "/data"}), "/home/u")
	want := filepath.Join("/data", "teamcode", "x.db")
	if got != want {
		t.Fatalf("got %q want %q", got, want)
	}
}

func TestResolvePathChannelFile(t *testing.T) {
	cases := map[string]string{
		"latest": "opencode.db",
		"beta":   "opencode.db",
		"prod":   "opencode.db",
		"local":  "opencode-local.db",
		"":       "opencode-local.db",
		"my/ch":  "opencode-my-ch.db",
	}
	for channel, file := range cases {
		got := ResolvePath(envFrom(map[string]string{"TEAMCODE_CHANNEL": channel}), "/home/u")
		want := filepath.Join("/home/u", ".local", "share", "teamcode", file)
		if got != want {
			t.Fatalf("channel %q: got %q want %q", channel, got, want)
		}
	}
}

func TestResolvePathDisableChannelDB(t *testing.T) {
	got := ResolvePath(envFrom(map[string]string{"TEAMCODE_CHANNEL": "local", "TEAMCODE_DISABLE_CHANNEL_DB": "1"}), "/home/u")
	want := filepath.Join("/home/u", ".local", "share", "teamcode", "opencode.db")
	if got != want {
		t.Fatalf("got %q want %q", got, want)
	}
}
