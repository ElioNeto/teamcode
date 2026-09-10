package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"sort"
)

const KnownMigrationCreatedAt int64 = 1781910501000

var ErrSchemaOutdated = errors.New("schema_outdated")

var tableInfoQueries = map[string]string{
	"session":   "PRAGMA table_info(session)",
	"message":   "PRAGMA table_info(message)",
	"part":      "PRAGMA table_info(part)",
	"todo":      "PRAGMA table_info(todo)",
	"project":   "PRAGMA table_info(project)",
	"workspace": "PRAGMA table_info(workspace)",
}

var requiredColumns = map[string][]string{
	"session": {
		"id", "project_id", "workspace_id", "parent_id", "slug", "directory", "path", "title", "version", "share_url",
		"summary_additions", "summary_deletions", "summary_files", "summary_diffs", "cost",
		"tokens_input", "tokens_output", "tokens_reasoning", "tokens_cache_read", "tokens_cache_write",
		"revert", "permission", "agent", "model", "time_created", "time_updated", "time_compacting", "time_archived",
	},
	"message":   {"id", "session_id", "time_created", "time_updated", "data"},
	"part":      {"id", "message_id", "session_id", "time_created", "time_updated", "data"},
	"todo":      {"session_id", "content", "status", "priority", "position", "time_created", "time_updated"},
	"project":   {"id"},
	"workspace": {"id", "time_used"},
}

func CheckSchema(ctx context.Context, db *sql.DB) error {
	var latest sql.NullInt64
	err := db.QueryRowContext(ctx, "SELECT max(created_at) FROM __drizzle_migrations").Scan(&latest)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrSchemaOutdated, err)
	}
	if !latest.Valid || latest.Int64 < KnownMigrationCreatedAt {
		return fmt.Errorf("%w: latest migration %d, need %d", ErrSchemaOutdated, latest.Int64, KnownMigrationCreatedAt)
	}
	tables := make([]string, 0, len(requiredColumns))
	for table := range requiredColumns {
		tables = append(tables, table)
	}
	sort.Strings(tables)
	for _, table := range tables {
		present, err := tableColumns(ctx, db, table)
		if err != nil {
			return err
		}
		for _, column := range requiredColumns[table] {
			if !present[column] {
				return fmt.Errorf("%w: %s.%s missing", ErrSchemaOutdated, table, column)
			}
		}
	}
	return nil
}

func tableColumns(ctx context.Context, db *sql.DB, table string) (map[string]bool, error) {
	query, ok := tableInfoQueries[table]
	if !ok {
		return nil, fmt.Errorf("%w: unknown table %s", ErrSchemaOutdated, table)
	}
	rows, err := db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()
	present := map[string]bool{}
	for rows.Next() {
		var cid int
		var name, columnType string
		var notNull int
		var defaultValue sql.NullString
		var primaryKey int
		if err := rows.Scan(&cid, &name, &columnType, &notNull, &defaultValue, &primaryKey); err != nil {
			return nil, err
		}
		present[name] = true
	}
	return present, rows.Err()
}
