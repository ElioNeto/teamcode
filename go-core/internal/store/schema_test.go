package store_test

import (
	"context"
	"errors"
	"path/filepath"
	"testing"

	"github.com/ElioNeto/teamcode/go-core/internal/store"
	"github.com/ElioNeto/teamcode/go-core/internal/store/testdb"
)

func TestCheckSchemaAcceptsReplayedMigrations(t *testing.T) {
	db := testdb.New(t)
	if err := store.CheckSchema(context.Background(), db.Reader()); err != nil {
		t.Fatal(err)
	}
}

func TestCheckSchemaRejectsEmptyFile(t *testing.T) {
	db, err := store.Open(filepath.Join(t.TempDir(), "empty.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = db.Close() }()
	err = store.CheckSchema(context.Background(), db.Reader())
	if !errors.Is(err, store.ErrSchemaOutdated) {
		t.Fatalf("got %v", err)
	}
}

func TestCheckSchemaRejectsOlderMigration(t *testing.T) {
	db := testdb.New(t)
	if _, err := db.Writer().Exec("DELETE FROM __drizzle_migrations WHERE created_at = ?", store.KnownMigrationCreatedAt); err != nil {
		t.Fatal(err)
	}
	err := store.CheckSchema(context.Background(), db.Reader())
	if !errors.Is(err, store.ErrSchemaOutdated) {
		t.Fatalf("got %v", err)
	}
}

func TestCheckSchemaRejectsMissingColumn(t *testing.T) {
	db := testdb.New(t)
	if _, err := db.Writer().Exec("ALTER TABLE session DROP COLUMN agent"); err != nil {
		t.Fatal(err)
	}
	err := store.CheckSchema(context.Background(), db.Reader())
	if !errors.Is(err, store.ErrSchemaOutdated) {
		t.Fatalf("got %v", err)
	}
	if err.Error() != "schema_outdated: session.agent missing" {
		t.Fatalf("message %q", err.Error())
	}
}
