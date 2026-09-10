package store

import (
	"context"
	"database/sql"
	"path/filepath"
	"testing"
)

func openTemp(t *testing.T) *DB {
	t.Helper()
	db, err := Open(filepath.Join(t.TempDir(), "t.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	return db
}

func pragma(t *testing.T, db *sql.DB, name string) string {
	t.Helper()
	var v string
	if err := db.QueryRow("PRAGMA " + name).Scan(&v); err != nil {
		t.Fatal(err)
	}
	return v
}

func TestOpenAppliesPragmas(t *testing.T) {
	db := openTemp(t)
	for _, conn := range []*sql.DB{db.Writer(), db.Reader()} {
		if got := pragma(t, conn, "journal_mode"); got != "wal" {
			t.Fatalf("journal_mode=%s", got)
		}
		if got := pragma(t, conn, "foreign_keys"); got != "1" {
			t.Fatalf("foreign_keys=%s", got)
		}
		if got := pragma(t, conn, "busy_timeout"); got != "10000" {
			t.Fatalf("busy_timeout=%s", got)
		}
		if got := pragma(t, conn, "synchronous"); got != "1" {
			t.Fatalf("synchronous=%s", got)
		}
		if got := pragma(t, conn, "cache_size"); got != "-64000" {
			t.Fatalf("cache_size=%s", got)
		}
	}
}

func TestExecWriteCommitsAndRollsBack(t *testing.T) {
	db := openTemp(t)
	ctx := context.Background()
	if _, err := db.Writer().Exec("CREATE TABLE t (v INTEGER)"); err != nil {
		t.Fatal(err)
	}
	err := db.ExecWrite(ctx, func(tx *sql.Tx) error {
		_, err := tx.Exec("INSERT INTO t VALUES (1)")
		return err
	})
	if err != nil {
		t.Fatal(err)
	}
	err = db.ExecWrite(ctx, func(tx *sql.Tx) error {
		if _, err := tx.Exec("INSERT INTO t VALUES (2)"); err != nil {
			return err
		}
		return sql.ErrTxDone
	})
	if err == nil {
		t.Fatal("expected error")
	}
	var n int
	if err := db.Reader().QueryRow("SELECT count(*) FROM t").Scan(&n); err != nil {
		t.Fatal(err)
	}
	if n != 1 {
		t.Fatalf("rows=%d", n)
	}
}

func TestIsBusyDetectsSQLiteBusy(t *testing.T) {
	db := openTemp(t)
	if _, err := db.Writer().Exec("CREATE TABLE t (v INTEGER)"); err != nil {
		t.Fatal(err)
	}
	other, err := OpenWithBusyTimeout(db.Path(), 50)
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = other.Close() }()
	tx, err := db.Writer().Begin()
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = tx.Rollback() }()
	if _, err := tx.Exec("INSERT INTO t VALUES (1)"); err != nil {
		t.Fatal(err)
	}
	err = other.ExecWrite(context.Background(), func(tx *sql.Tx) error {
		_, err := tx.Exec("INSERT INTO t VALUES (2)")
		return err
	})
	if !IsBusy(err) {
		t.Fatalf("expected busy, got %v", err)
	}
}
