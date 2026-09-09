package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"sync"

	sqlite "modernc.org/sqlite"
)

const defaultBusyTimeoutMs = 10000

type DB struct {
	path          string
	writer        *sql.DB
	reader        *sql.DB
	writeMu       sync.Mutex
	busyTimeoutMs int
}

func pragmaDSN(path string, busyTimeoutMs int) string {
	pragmas := []string{
		"journal_mode(WAL)",
		"synchronous(NORMAL)",
		fmt.Sprintf("busy_timeout(%d)", busyTimeoutMs),
		"cache_size(-64000)",
		"foreign_keys(ON)",
	}
	return path + "?_pragma=" + strings.Join(pragmas, "&_pragma=")
}

func Open(path string) (*DB, error) {
	return OpenWithBusyTimeout(path, defaultBusyTimeoutMs)
}

func OpenWithBusyTimeout(path string, busyTimeoutMs int) (*DB, error) {
	writer, err := sql.Open("sqlite", pragmaDSN(path, busyTimeoutMs)+"&_txlock=immediate")
	if err != nil {
		return nil, err
	}
	writer.SetMaxOpenConns(1)
	reader, err := sql.Open("sqlite", pragmaDSN(path, busyTimeoutMs))
	if err != nil {
		_ = writer.Close()
		return nil, err
	}
	if err := writer.Ping(); err != nil {
		_ = writer.Close()
		_ = reader.Close()
		return nil, err
	}
	return &DB{path: path, writer: writer, reader: reader, busyTimeoutMs: busyTimeoutMs}, nil
}

func (d *DB) Path() string    { return d.path }
func (d *DB) Writer() *sql.DB { return d.writer }
func (d *DB) Reader() *sql.DB { return d.reader }

func (d *DB) ExecWrite(ctx context.Context, fn func(*sql.Tx) error) error {
	d.writeMu.Lock()
	defer d.writeMu.Unlock()
	tx, err := d.writer.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	if err := fn(tx); err != nil {
		_ = tx.Rollback()
		return err
	}
	return tx.Commit()
}

func (d *DB) Close() error {
	_, _ = d.writer.Exec("PRAGMA wal_checkpoint(PASSIVE)")
	return errors.Join(d.writer.Close(), d.reader.Close())
}

func IsBusy(err error) bool {
	var se *sqlite.Error
	if errors.As(err, &se) {
		code := se.Code()
		return code == 5 || code == 6 || code == 261
	}
	return err != nil && strings.Contains(err.Error(), "database is locked")
}
