package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
)

const KnownMigrationCreatedAt int64 = 1781910501000

var ErrSchemaOutdated = errors.New("schema_outdated")

func CheckSchema(ctx context.Context, db *sql.DB) error {
	var latest sql.NullInt64
	err := db.QueryRowContext(ctx, "SELECT max(created_at) FROM __drizzle_migrations").Scan(&latest)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrSchemaOutdated, err)
	}
	if !latest.Valid || latest.Int64 < KnownMigrationCreatedAt {
		return fmt.Errorf("%w: latest migration %d, need %d", ErrSchemaOutdated, latest.Int64, KnownMigrationCreatedAt)
	}
	return nil
}
