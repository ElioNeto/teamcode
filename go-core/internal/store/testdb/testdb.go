package testdb

import (
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"sort"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/ElioNeto/teamcode/go-core/internal/store"
)

var migrationDirName = regexp.MustCompile(`^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})_`)

func repoRoot(t testing.TB) string {
	t.Helper()
	_, file, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("caller unavailable")
	}
	return filepath.Clean(filepath.Join(filepath.Dir(file), "..", "..", "..", ".."))
}

func createdAt(dir string) int64 {
	m := migrationDirName.FindStringSubmatch(dir)
	if m == nil {
		return 0
	}
	n := func(s string) int { v, _ := strconv.Atoi(s); return v }
	return time.Date(n(m[1]), time.Month(n(m[2])), n(m[3]), n(m[4]), n(m[5]), n(m[6]), 0, time.UTC).UnixMilli()
}

type migration struct {
	name      string
	createdAt int64
	sql       string
}

func loadMigrations(t testing.TB) []migration {
	t.Helper()
	dir := filepath.Join(repoRoot(t), "packages", "teamcode", "migration")
	entries, err := os.ReadDir(dir)
	if err != nil {
		t.Fatal(err)
	}
	var out []migration
	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		body, err := os.ReadFile(filepath.Join(dir, e.Name(), "migration.sql"))
		if err != nil {
			continue
		}
		out = append(out, migration{name: e.Name(), createdAt: createdAt(e.Name()), sql: string(body)})
	}
	sort.Slice(out, func(i, j int) bool { return out[i].createdAt < out[j].createdAt })
	return out
}

func statements(sqlText string) []string {
	var out []string
	for _, chunk := range strings.Split(sqlText, "--> statement-breakpoint") {
		for _, stmt := range strings.Split(chunk, ";") {
			stmt = strings.TrimSpace(stmt)
			if stmt != "" {
				out = append(out, stmt)
			}
		}
	}
	return out
}

func New(t testing.TB) *store.DB {
	t.Helper()
	db, err := store.Open(filepath.Join(t.TempDir(), "teamcode-test.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	w := db.Writer()
	if _, err := w.Exec(`CREATE TABLE "__drizzle_migrations" (id INTEGER PRIMARY KEY, hash text NOT NULL, created_at numeric, name text, applied_at TEXT)`); err != nil {
		t.Fatal(err)
	}
	for _, m := range loadMigrations(t) {
		for _, stmt := range statements(m.sql) {
			if _, err := w.Exec(stmt); err != nil {
				t.Fatalf("migration %s: %v\n%s", m.name, err, stmt)
			}
		}
		if _, err := w.Exec("INSERT INTO __drizzle_migrations (hash, created_at, name) VALUES ('', ?, ?)", m.createdAt, m.name); err != nil {
			t.Fatal(err)
		}
	}
	return db
}

func SeedProject(t testing.TB, db *store.DB, projectID string) {
	t.Helper()
	now := time.Now().UnixMilli()
	_, err := db.Writer().Exec(
		`INSERT INTO project (id, worktree, time_created, time_updated, sandboxes) VALUES (?, ?, ?, ?, '[]')`,
		projectID, "/tmp/"+projectID, now, now,
	)
	if err != nil {
		t.Fatal(err)
	}
}
