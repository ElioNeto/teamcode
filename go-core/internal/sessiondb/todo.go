package sessiondb

import (
	"context"
	"database/sql"
	"time"
)

func (s *Store) GetTodos(ctx context.Context, sessionID string) ([]Todo, error) {
	rows, err := s.db.Reader().QueryContext(ctx, `SELECT content, status, priority FROM todo WHERE session_id = ? ORDER BY position ASC`, sessionID)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()
	out := []Todo{}
	for rows.Next() {
		var t Todo
		if err := rows.Scan(&t.Content, &t.Status, &t.Priority); err != nil {
			return nil, err
		}
		out = append(out, t)
	}
	return out, rows.Err()
}

func (s *Store) ReplaceTodos(ctx context.Context, sessionID string, todos []Todo) error {
	now := time.Now().UnixMilli()
	return s.db.ExecWrite(ctx, func(tx *sql.Tx) error {
		if _, err := tx.ExecContext(ctx, `DELETE FROM todo WHERE session_id = ?`, sessionID); err != nil {
			return err
		}
		for position, t := range todos {
			_, err := tx.ExecContext(ctx, `INSERT INTO todo (session_id, content, status, priority, position, time_created, time_updated) VALUES (?, ?, ?, ?, ?, ?, ?)`,
				sessionID, t.Content, t.Status, t.Priority, position, now, now)
			if err != nil {
				return err
			}
		}
		return nil
	})
}
