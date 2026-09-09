package sessiondb

import (
	"context"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/ElioNeto/teamcode/go-core/internal/ident"
)

var ErrLateWrite = errors.New("late write for a deleted session")

const clockGuardMs = 5000

type MessageWithParts struct {
	Info  Message `json:"info"`
	Parts []Part  `json:"parts"`
}

type MessagePage struct {
	Items  []MessageWithParts `json:"messages"`
	More   bool               `json:"more"`
	Cursor string             `json:"cursor,omitempty"`
}

type usage struct {
	cost                                            float64
	input, output, reasoning, cacheRead, cacheWrite int64
}

func usageOf(data json.RawMessage) (usage, bool) {
	var probe struct {
		Type   string   `json:"type"`
		Cost   *float64 `json:"cost"`
		Tokens *struct {
			Input     int64 `json:"input"`
			Output    int64 `json:"output"`
			Reasoning int64 `json:"reasoning"`
			Cache     struct {
				Read  int64 `json:"read"`
				Write int64 `json:"write"`
			} `json:"cache"`
		} `json:"tokens"`
	}
	if err := json.Unmarshal(data, &probe); err != nil || probe.Type != "step-finish" || probe.Cost == nil || probe.Tokens == nil {
		return usage{}, false
	}
	return usage{cost: *probe.Cost, input: probe.Tokens.Input, output: probe.Tokens.Output, reasoning: probe.Tokens.Reasoning,
		cacheRead: probe.Tokens.Cache.Read, cacheWrite: probe.Tokens.Cache.Write}, true
}

func applyUsage(ctx context.Context, tx *sql.Tx, sessionID string, u usage, sign float64) error {
	_, err := tx.ExecContext(ctx, `UPDATE session SET cost = cost + ?, tokens_input = tokens_input + ?, tokens_output = tokens_output + ?,
        tokens_reasoning = tokens_reasoning + ?, tokens_cache_read = tokens_cache_read + ?, tokens_cache_write = tokens_cache_write + ?,
        time_updated = time_updated WHERE id = ?`,
		u.cost*sign, int64(sign)*u.input, int64(sign)*u.output, int64(sign)*u.reasoning, int64(sign)*u.cacheRead, int64(sign)*u.cacheWrite, sessionID)
	return err
}

func isForeignKeyFailure(err error) bool {
	return err != nil && strings.Contains(err.Error(), "FOREIGN KEY constraint failed")
}

func timeCreatedOf(data json.RawMessage) int64 {
	var probe struct {
		Time struct {
			Created int64 `json:"created"`
		} `json:"time"`
	}
	_ = json.Unmarshal(data, &probe)
	return probe.Time.Created
}

func withTimeCreated(data json.RawMessage, created int64) (json.RawMessage, error) {
	var obj map[string]json.RawMessage
	if err := json.Unmarshal(data, &obj); err != nil {
		return nil, err
	}
	var tm map[string]json.RawMessage
	if raw, ok := obj["time"]; ok {
		_ = json.Unmarshal(raw, &tm)
	}
	if tm == nil {
		tm = map[string]json.RawMessage{}
	}
	tm["created"] = json.RawMessage(fmt.Sprint(created))
	encodedTime, _ := json.Marshal(tm)
	obj["time"] = encodedTime
	return json.Marshal(obj)
}

func (s *Store) UpsertMessage(ctx context.Context, sessionID string, body json.RawMessage) (Message, error) {
	ids, data, err := splitIDs(body, "id", "sessionID")
	if err != nil {
		return Message{}, err
	}
	id := ids["id"]
	if id == "" {
		id = ident.Message()
	} else if !ident.HasPrefix(id, ident.PrefixMessage) {
		return Message{}, fmt.Errorf("ID %s does not start with msg", id)
	}
	created := timeCreatedOf(data)
	if created == 0 {
		created = time.Now().UnixMilli()
	}
	var storedCreated int64
	err = s.db.ExecWrite(ctx, func(tx *sql.Tx) error {
		var maxExisting sql.NullInt64
		if err := tx.QueryRowContext(ctx, `SELECT max(time_created) FROM message WHERE session_id = ?`, sessionID).Scan(&maxExisting); err != nil {
			return err
		}
		if maxExisting.Valid && maxExisting.Int64 > time.Now().UnixMilli()+clockGuardMs {
			created = maxExisting.Int64 + 1
		}
		var err error
		if data, err = withTimeCreated(data, created); err != nil {
			return err
		}
		if _, err := tx.ExecContext(ctx, `INSERT INTO message (id, session_id, time_created, time_updated, data) VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET data = excluded.data`, id, sessionID, created, created, string(data)); err != nil {
			return err
		}
		return tx.QueryRowContext(ctx, `SELECT time_created FROM message WHERE id = ?`, id).Scan(&storedCreated)
	})
	if isForeignKeyFailure(err) {
		log.Printf("sessiondb: ignored late message update message=%s session=%s", id, sessionID)
		return Message{}, ErrLateWrite
	}
	if err != nil {
		return Message{}, err
	}
	return Message{ID: id, SessionID: sessionID, TimeCreated: storedCreated, Data: data}, nil
}

func (s *Store) RemoveMessage(ctx context.Context, sessionID, messageID string) error {
	return s.db.ExecWrite(ctx, func(tx *sql.Tx) error {
		rows, err := tx.QueryContext(ctx, `SELECT data FROM part WHERE message_id = ? AND session_id = ?`, messageID, sessionID)
		if err != nil {
			return err
		}
		var previous []usage
		for rows.Next() {
			var data string
			if err := rows.Scan(&data); err != nil {
				_ = rows.Close()
				return err
			}
			if u, ok := usageOf(json.RawMessage(data)); ok {
				previous = append(previous, u)
			}
		}
		_ = rows.Close()
		for _, u := range previous {
			if err := applyUsage(ctx, tx, sessionID, u, -1); err != nil {
				return err
			}
		}
		_, err = tx.ExecContext(ctx, `DELETE FROM message WHERE id = ? AND session_id = ?`, messageID, sessionID)
		return err
	})
}

func (s *Store) UpsertPart(ctx context.Context, sessionID, messageID string, body json.RawMessage, timeCreated int64) (Part, error) {
	ids, data, err := splitIDs(body, "id", "sessionID", "messageID")
	if err != nil {
		return Part{}, err
	}
	id := ids["id"]
	if id == "" {
		id = ident.Part()
	} else if !ident.HasPrefix(id, ident.PrefixPart) {
		return Part{}, fmt.Errorf("ID %s does not start with prt", id)
	}
	var storedCreated int64
	err = s.db.ExecWrite(ctx, func(tx *sql.Tx) error {
		var previousData sql.NullString
		var previousSession sql.NullString
		err := tx.QueryRowContext(ctx, `SELECT data, session_id FROM part WHERE id = ?`, id).Scan(&previousData, &previousSession)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return err
		}
		_, err = tx.ExecContext(ctx, `INSERT INTO part (id, message_id, session_id, time_created, time_updated, data) VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET data = excluded.data`, id, messageID, sessionID, timeCreated, timeCreated, string(data))
		if err != nil {
			return err
		}
		if previousData.Valid {
			if u, ok := usageOf(json.RawMessage(previousData.String)); ok {
				if err := applyUsage(ctx, tx, previousSession.String, u, -1); err != nil {
					return err
				}
			}
		}
		if u, ok := usageOf(data); ok {
			if err := applyUsage(ctx, tx, sessionID, u, 1); err != nil {
				return err
			}
		}
		return tx.QueryRowContext(ctx, `SELECT time_created FROM part WHERE id = ?`, id).Scan(&storedCreated)
	})
	if isForeignKeyFailure(err) {
		log.Printf("sessiondb: ignored late part update part=%s message=%s session=%s", id, messageID, sessionID)
		return Part{}, ErrLateWrite
	}
	if err != nil {
		return Part{}, err
	}
	return Part{ID: id, SessionID: sessionID, MessageID: messageID, TimeCreated: storedCreated, Data: data}, nil
}

func scanPart(r rowScanner) (Part, error) {
	var p Part
	var data string
	if err := r.Scan(&p.ID, &p.MessageID, &p.SessionID, &p.TimeCreated, &data); err != nil {
		return Part{}, err
	}
	p.Data = json.RawMessage(data)
	return p, nil
}

func (s *Store) GetPart(ctx context.Context, sessionID, messageID, partID string) (Part, error) {
	row := s.db.Reader().QueryRowContext(ctx, `SELECT id, message_id, session_id, time_created, data FROM part WHERE id = ? AND message_id = ? AND session_id = ?`, partID, messageID, sessionID)
	p, err := scanPart(row)
	if errors.Is(err, sql.ErrNoRows) {
		return Part{}, ErrNotFound{Kind: "Part", ID: partID}
	}
	return p, err
}

func (s *Store) RemovePart(ctx context.Context, sessionID, messageID, partID string) error {
	return s.db.ExecWrite(ctx, func(tx *sql.Tx) error {
		var data sql.NullString
		err := tx.QueryRowContext(ctx, `SELECT data FROM part WHERE id = ? AND message_id = ? AND session_id = ?`, partID, messageID, sessionID).Scan(&data)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return err
		}
		if data.Valid {
			if u, ok := usageOf(json.RawMessage(data.String)); ok {
				if err := applyUsage(ctx, tx, sessionID, u, -1); err != nil {
					return err
				}
			}
		}
		_, err = tx.ExecContext(ctx, `DELETE FROM part WHERE id = ? AND message_id = ? AND session_id = ?`, partID, messageID, sessionID)
		return err
	})
}

func EncodeCursor(id string, timeCreated int64) string {
	body, _ := json.Marshal(map[string]any{"id": id, "time": timeCreated})
	return base64.RawURLEncoding.EncodeToString(body)
}

func DecodeCursor(cursor string) (string, int64, error) {
	body, err := base64.RawURLEncoding.DecodeString(cursor)
	if err != nil {
		return "", 0, err
	}
	var c struct {
		ID   string `json:"id"`
		Time int64  `json:"time"`
	}
	if err := json.Unmarshal(body, &c); err != nil {
		return "", 0, err
	}
	if c.ID == "" || c.Time < 0 {
		return "", 0, errors.New("malformed cursor")
	}
	return c.ID, c.Time, nil
}

func (s *Store) hydrate(ctx context.Context, messages []Message) ([]MessageWithParts, error) {
	out := make([]MessageWithParts, len(messages))
	if len(messages) == 0 {
		return out, nil
	}
	placeholders := make([]string, len(messages))
	args := make([]any, len(messages))
	index := map[string]int{}
	for i, m := range messages {
		placeholders[i] = "?"
		args[i] = m.ID
		index[m.ID] = i
		out[i] = MessageWithParts{Info: m, Parts: []Part{}}
	}
	rows, err := s.db.Reader().QueryContext(ctx, `SELECT id, message_id, session_id, time_created, data FROM part WHERE message_id IN (`+strings.Join(placeholders, ",")+`) ORDER BY message_id, id`, args...)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()
	for rows.Next() {
		p, err := scanPart(rows)
		if err != nil {
			return nil, err
		}
		i := index[p.MessageID]
		out[i].Parts = append(out[i].Parts, p)
	}
	return out, rows.Err()
}

func scanMessages(rows *sql.Rows) ([]Message, error) {
	var out []Message
	for rows.Next() {
		var m Message
		var data string
		if err := rows.Scan(&m.ID, &m.SessionID, &m.TimeCreated, &data); err != nil {
			return nil, err
		}
		m.Data = json.RawMessage(data)
		out = append(out, m)
	}
	return out, rows.Err()
}

func (s *Store) PageMessages(ctx context.Context, sessionID string, limit int, before string) (MessagePage, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `SELECT id, session_id, time_created, data FROM message WHERE session_id = ?`
	args := []any{sessionID}
	if before != "" {
		id, tm, err := DecodeCursor(before)
		if err != nil {
			return MessagePage{}, err
		}
		query += ` AND (time_created < ? OR (time_created = ? AND id < ?))`
		args = append(args, tm, tm, id)
	}
	query += ` ORDER BY time_created DESC, id DESC LIMIT ?`
	args = append(args, limit+1)
	rows, err := s.db.Reader().QueryContext(ctx, query, args...)
	if err != nil {
		return MessagePage{}, err
	}
	messages, err := scanMessages(rows)
	_ = rows.Close()
	if err != nil {
		return MessagePage{}, err
	}
	if len(messages) == 0 {
		if _, err := s.GetSession(ctx, sessionID); err != nil {
			return MessagePage{}, err
		}
		return MessagePage{Items: []MessageWithParts{}}, nil
	}
	more := len(messages) > limit
	if more {
		messages = messages[:limit]
	}
	items, err := s.hydrate(ctx, messages)
	if err != nil {
		return MessagePage{}, err
	}
	for i, j := 0, len(items)-1; i < j; i, j = i+1, j-1 {
		items[i], items[j] = items[j], items[i]
	}
	page := MessagePage{Items: items, More: more}
	if more {
		tail := messages[len(messages)-1]
		page.Cursor = EncodeCursor(tail.ID, tail.TimeCreated)
	}
	return page, nil
}

func (s *Store) AllMessages(ctx context.Context, sessionID string) ([]MessageWithParts, error) {
	rows, err := s.db.Reader().QueryContext(ctx, `SELECT id, session_id, time_created, data FROM message WHERE session_id = ? ORDER BY time_created ASC, id ASC`, sessionID)
	if err != nil {
		return nil, err
	}
	messages, err := scanMessages(rows)
	_ = rows.Close()
	if err != nil {
		return nil, err
	}
	if len(messages) == 0 {
		if _, err := s.GetSession(ctx, sessionID); err != nil {
			return nil, err
		}
	}
	return s.hydrate(ctx, messages)
}

func (s *Store) GetMessage(ctx context.Context, sessionID, messageID string) (MessageWithParts, error) {
	rows, err := s.db.Reader().QueryContext(ctx, `SELECT id, session_id, time_created, data FROM message WHERE id = ? AND session_id = ?`, messageID, sessionID)
	if err != nil {
		return MessageWithParts{}, err
	}
	messages, err := scanMessages(rows)
	_ = rows.Close()
	if err != nil {
		return MessageWithParts{}, err
	}
	if len(messages) == 0 {
		return MessageWithParts{}, ErrNotFound{Kind: "Message", ID: messageID}
	}
	items, err := s.hydrate(ctx, messages)
	if err != nil {
		return MessageWithParts{}, err
	}
	return items[0], nil
}
