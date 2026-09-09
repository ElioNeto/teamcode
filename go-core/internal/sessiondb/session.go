package sessiondb

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"path/filepath"
	"strings"
	"time"

	"github.com/ElioNeto/teamcode/go-core/internal/ident"
	"github.com/ElioNeto/teamcode/go-core/internal/store"
)

type Store struct {
	db *store.DB
}

func New(db *store.DB) *Store { return &Store{db: db} }

func (s *Store) DB() *store.DB { return s.db }

type CreateSessionInput struct {
	ID          *string         `json:"id"`
	ProjectID   string          `json:"projectID"`
	WorkspaceID *string         `json:"workspaceID"`
	ParentID    *string         `json:"parentID"`
	Directory   string          `json:"directory"`
	Path        *string         `json:"path"`
	Title       *string         `json:"title"`
	Agent       *string         `json:"agent"`
	Model       json.RawMessage `json:"model"`
	Permission  json.RawMessage `json:"permission"`
	Version     string          `json:"version"`
}

type ListFilter struct {
	ProjectID       string
	WorkspaceID     string
	Directory       string
	Path            string
	ParentID        string
	RootsOnly       bool
	Search          string
	Start           int64
	Limit           int
	IncludeArchived bool
}

var slugAdjectives = strings.Fields("brave calm clever cosmic crisp curious eager gentle glowing happy hidden jolly kind lucky mighty misty neon nimble playful proud quick quiet shiny silent stellar sunny swift tidy witty")
var slugNouns = strings.Fields("cabin cactus canyon circuit comet eagle engine falcon forest garden harbor island knight lagoon meadow moon mountain nebula orchid otter panda pixel planet river rocket sailor squid star tiger wizard wolf")

func newSlug() string {
	return slugAdjectives[rand.Intn(len(slugAdjectives))] + "-" + slugNouns[rand.Intn(len(slugNouns))]
}

func defaultTitle(isChild bool, now int64) string {
	prefix := "New session - "
	if isChild {
		prefix = "Child session - "
	}
	return prefix + time.UnixMilli(now).UTC().Format("2006-01-02T15:04:05.000Z")
}

const sessionColumns = `id, project_id, workspace_id, parent_id, slug, directory, path, title, version, share_url,
    summary_additions, summary_deletions, summary_files, summary_diffs, cost,
    tokens_input, tokens_output, tokens_reasoning, tokens_cache_read, tokens_cache_write,
    revert, permission, agent, model, time_created, time_updated, time_compacting, time_archived`

type sessionRow struct {
	id, projectID, slug, directory, title, version   string
	workspaceID, parentID, path, shareURL, agent     sql.NullString
	summaryAdditions, summaryDeletions, summaryFiles sql.NullInt64
	summaryDiffs, revert, permission, model          sql.NullString
	cost                                             float64
	tokensInput, tokensOutput, tokensReasoning       int64
	tokensCacheRead, tokensCacheWrite                int64
	timeCreated, timeUpdated                         int64
	timeCompacting, timeArchived                     sql.NullInt64
}

type rowScanner interface{ Scan(dest ...any) error }

func scanSession(r rowScanner) (Session, error) {
	var row sessionRow
	err := r.Scan(&row.id, &row.projectID, &row.workspaceID, &row.parentID, &row.slug, &row.directory, &row.path,
		&row.title, &row.version, &row.shareURL, &row.summaryAdditions, &row.summaryDeletions, &row.summaryFiles,
		&row.summaryDiffs, &row.cost, &row.tokensInput, &row.tokensOutput, &row.tokensReasoning, &row.tokensCacheRead,
		&row.tokensCacheWrite, &row.revert, &row.permission, &row.agent, &row.model, &row.timeCreated, &row.timeUpdated,
		&row.timeCompacting, &row.timeArchived)
	if err != nil {
		return Session{}, err
	}
	return row.toSession(), nil
}

func optString(v sql.NullString) *string {
	if !v.Valid {
		return nil
	}
	return &v.String
}

func optInt(v sql.NullInt64) *int64 {
	if !v.Valid {
		return nil
	}
	return &v.Int64
}

func rawIfValidJSON(v sql.NullString, field, id string) json.RawMessage {
	if !v.Valid || v.String == "" || v.String == "null" {
		return nil
	}
	if !json.Valid([]byte(v.String)) {
		log.Printf("sessiondb: session %s has invalid %s json, dropping field", id, field)
		return nil
	}
	return json.RawMessage(v.String)
}

func (row sessionRow) toSession() Session {
	out := Session{
		ID: row.id, Slug: row.slug, ProjectID: row.projectID, Directory: row.directory, Title: row.title, Version: row.version,
		WorkspaceID: optString(row.workspaceID), ParentID: optString(row.parentID), Path: optString(row.path), Agent: optString(row.agent),
		Cost: row.cost,
		Tokens: Tokens{Input: row.tokensInput, Output: row.tokensOutput, Reasoning: row.tokensReasoning,
			Cache: TokensCache{Read: row.tokensCacheRead, Write: row.tokensCacheWrite}},
		Time:  Time{Created: row.timeCreated, Updated: row.timeUpdated, Compacting: optInt(row.timeCompacting), Archived: optInt(row.timeArchived)},
		Model: rawIfValidJSON(row.model, "model", row.id), Permission: rawIfValidJSON(row.permission, "permission", row.id),
		Revert: rawIfValidJSON(row.revert, "revert", row.id),
	}
	if row.shareURL.Valid && row.shareURL.String != "" {
		out.Share = &Share{URL: row.shareURL.String}
	}
	if row.summaryAdditions.Valid || row.summaryDeletions.Valid || row.summaryFiles.Valid {
		out.Summary = &Summary{Additions: row.summaryAdditions.Int64, Deletions: row.summaryDeletions.Int64, Files: row.summaryFiles.Int64,
			Diffs: rawIfValidJSON(row.summaryDiffs, "summary.diffs", row.id)}
	}
	return out
}

func nullableJSON(raw json.RawMessage) any {
	if len(raw) == 0 || string(raw) == "null" {
		return nil
	}
	return string(raw)
}

func (s *Store) CreateSession(ctx context.Context, in CreateSessionInput) (Session, error) {
	now := time.Now().UnixMilli()
	id := ident.Session()
	if in.ID != nil && *in.ID != "" {
		if !ident.HasPrefix(*in.ID, ident.PrefixSession) {
			return Session{}, ErrInvalidInput{Msg: fmt.Sprintf("ID %s does not start with ses", *in.ID)}
		}
		id = *in.ID
	}
	title := defaultTitle(in.ParentID != nil, now)
	if in.Title != nil {
		title = *in.Title
	}
	err := s.db.ExecWrite(ctx, func(tx *sql.Tx) error {
		_, err := tx.ExecContext(ctx, `INSERT INTO session (id, project_id, workspace_id, parent_id, slug, directory, path, title, version,
            cost, tokens_input, tokens_output, tokens_reasoning, tokens_cache_read, tokens_cache_write, revert, permission, agent, model,
            time_created, time_updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, NULL, ?, ?, ?, ?, ?)`,
			id, in.ProjectID, in.WorkspaceID, in.ParentID, newSlug(), in.Directory, in.Path, title, in.Version,
			nullableJSON(in.Permission), in.Agent, nullableJSON(in.Model), now, now)
		if err != nil {
			return err
		}
		if in.WorkspaceID != nil {
			_, err = tx.ExecContext(ctx, `UPDATE workspace SET time_used = ? WHERE id = ?`, now, *in.WorkspaceID)
		}
		return err
	})
	if isForeignKeyFailure(err) {
		return Session{}, ErrInvalidInput{Msg: "project not found: " + in.ProjectID}
	}
	if err != nil {
		return Session{}, err
	}
	return s.GetSession(ctx, id)
}

func (s *Store) GetSession(ctx context.Context, id string) (Session, error) {
	row := s.db.Reader().QueryRowContext(ctx, `SELECT `+sessionColumns+` FROM session WHERE id = ?`, id)
	out, err := scanSession(row)
	if errors.Is(err, sql.ErrNoRows) {
		return Session{}, ErrNotFound{Kind: "Session", ID: id}
	}
	return out, err
}

func normalizeDirectory(dir string) string {
	absolute, err := filepath.Abs(dir)
	if err != nil {
		return filepath.Clean(dir)
	}
	return absolute
}

func (s *Store) ListSessions(ctx context.Context, f ListFilter) ([]Session, error) {
	var where []string
	var args []any
	add := func(cond string, vals ...any) {
		where = append(where, cond)
		args = append(args, vals...)
	}
	if f.ProjectID != "" {
		add("project_id = ?", f.ProjectID)
	}
	if f.WorkspaceID != "" {
		add("workspace_id = ?", f.WorkspaceID)
	}
	if f.Path != "" {
		if f.Directory != "" {
			add("(path = ? OR path LIKE ? OR (path IS NULL AND directory = ?))", f.Path, f.Path+"/%", normalizeDirectory(f.Directory))
		} else {
			add("(path = ? OR path LIKE ?)", f.Path, f.Path+"/%")
		}
	} else if f.Directory != "" {
		add("directory = ?", normalizeDirectory(f.Directory))
	}
	if f.RootsOnly {
		add("parent_id IS NULL")
	} else if f.ParentID != "" {
		add("parent_id = ?", f.ParentID)
	}
	if f.Start > 0 {
		add("time_updated >= ?", f.Start)
	}
	if f.Search != "" {
		add("title LIKE ?", "%"+f.Search+"%")
	}
	if !f.IncludeArchived {
		add("time_archived IS NULL")
	}
	limit := f.Limit
	if limit <= 0 {
		limit = 100
	}
	query := `SELECT ` + sessionColumns + ` FROM session`
	if len(where) > 0 {
		query += " WHERE " + strings.Join(where, " AND ")
	}
	query += " ORDER BY time_updated DESC, id DESC LIMIT ?"
	args = append(args, limit)
	rows, err := s.db.Reader().QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()
	out := []Session{}
	for rows.Next() {
		item, err := scanSession(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, item)
	}
	return out, rows.Err()
}

func (s *Store) Children(ctx context.Context, parentID string) ([]Session, error) {
	return s.ListSessions(ctx, ListFilter{ParentID: parentID, IncludeArchived: true, Limit: 100000})
}

type patchColumn struct {
	column string
	value  any
}

var scalarPatchColumns = map[string]string{
	"title": "title", "slug": "slug", "directory": "directory", "path": "path", "version": "version",
	"agent": "agent", "cost": "cost", "workspaceID": "workspace_id", "parentID": "parent_id",
}

var jsonPatchColumns = map[string]string{"model": "model", "permission": "permission", "revert": "revert"}

var nestedPatchColumns = map[string]map[string]string{
	"share":   {"url": "share_url"},
	"summary": {"additions": "summary_additions", "deletions": "summary_deletions", "files": "summary_files", "diffs": "summary_diffs"},
	"time":    {"created": "time_created", "updated": "time_updated", "compacting": "time_compacting", "archived": "time_archived"},
	"tokens":  {"input": "tokens_input", "output": "tokens_output", "reasoning": "tokens_reasoning"},
}

var tokensCacheColumns = map[string]string{"read": "tokens_cache_read", "write": "tokens_cache_write"}

var jsonNestedColumns = map[string]bool{"summary_diffs": true}

var nonNullablePatchPaths = map[string]bool{
	"cost":               true,
	"title":              true,
	"slug":               true,
	"directory":          true,
	"version":            true,
	"time":               true,
	"time.created":       true,
	"time.updated":       true,
	"tokens":             true,
	"tokens.input":       true,
	"tokens.output":      true,
	"tokens.reasoning":   true,
	"tokens.cache":       true,
	"tokens.cache.read":  true,
	"tokens.cache.write": true,
}

func checkNonNullablePatchPaths(prefix string, obj map[string]json.RawMessage) error {
	for key, raw := range obj {
		path := key
		if prefix != "" {
			path = prefix + "." + key
		}
		trimmed := strings.TrimSpace(string(raw))
		if trimmed == "null" {
			if nonNullablePatchPaths[path] {
				return ErrInvalidInput{Msg: path + " cannot be null"}
			}
			continue
		}
		if strings.HasPrefix(trimmed, "{") {
			var nested map[string]json.RawMessage
			if err := json.Unmarshal(raw, &nested); err == nil {
				if err := checkNonNullablePatchPaths(path, nested); err != nil {
					return err
				}
			}
		}
	}
	return nil
}

func decodeScalar(raw json.RawMessage) (any, error) {
	var v any
	err := json.Unmarshal(raw, &v)
	return v, err
}

func patchColumns(patch json.RawMessage) ([]patchColumn, error) {
	var top map[string]json.RawMessage
	if err := json.Unmarshal(patch, &top); err != nil {
		return nil, err
	}
	if err := checkNonNullablePatchPaths("", top); err != nil {
		return nil, err
	}
	var out []patchColumn
	for key, column := range scalarPatchColumns {
		raw, ok := top[key]
		if !ok {
			continue
		}
		v, err := decodeScalar(raw)
		if err != nil {
			return nil, err
		}
		out = append(out, patchColumn{column, v})
	}
	for key, column := range jsonPatchColumns {
		if raw, ok := top[key]; ok {
			out = append(out, patchColumn{column, nullableJSON(raw)})
		}
	}
	for key, columns := range nestedPatchColumns {
		raw, ok := top[key]
		if !ok {
			continue
		}
		if string(raw) == "null" {
			for _, column := range columns {
				out = append(out, patchColumn{column, nil})
			}
			continue
		}
		var obj map[string]json.RawMessage
		if err := json.Unmarshal(raw, &obj); err != nil {
			return nil, err
		}
		for field, column := range columns {
			inner, ok := obj[field]
			if !ok {
				continue
			}
			if jsonNestedColumns[column] {
				out = append(out, patchColumn{column, nullableJSON(inner)})
				continue
			}
			v, err := decodeScalar(inner)
			if err != nil {
				return nil, err
			}
			out = append(out, patchColumn{column, v})
		}
		if key == "tokens" {
			if cache, ok := obj["cache"]; ok && string(cache) != "null" {
				var c map[string]json.RawMessage
				if err := json.Unmarshal(cache, &c); err != nil {
					return nil, err
				}
				for field, column := range tokensCacheColumns {
					if inner, ok := c[field]; ok {
						v, err := decodeScalar(inner)
						if err != nil {
							return nil, err
						}
						out = append(out, patchColumn{column, v})
					}
				}
			}
		}
	}
	return out, nil
}

func (s *Store) PatchSession(ctx context.Context, id string, patch json.RawMessage) (Session, error) {
	columns, err := patchColumns(patch)
	if err != nil {
		return Session{}, err
	}
	err = s.db.ExecWrite(ctx, func(tx *sql.Tx) error {
		sets := []string{"time_updated = time_updated"}
		args := []any{}
		for _, c := range columns {
			sets = append(sets, c.column+" = ?")
			args = append(args, c.value)
		}
		args = append(args, id)
		res, err := tx.ExecContext(ctx, `UPDATE session SET `+strings.Join(sets, ", ")+` WHERE id = ?`, args...)
		if err != nil {
			return err
		}
		if n, _ := res.RowsAffected(); n == 0 {
			return ErrNotFound{Kind: "Session", ID: id}
		}
		return nil
	})
	if err != nil {
		return Session{}, err
	}
	return s.GetSession(ctx, id)
}

func (s *Store) DeleteSession(ctx context.Context, id string) ([]Session, error) {
	root, err := s.GetSession(ctx, id)
	if err != nil {
		return nil, err
	}
	var ordered []Session
	var walk func(parent Session) error
	walk = func(parent Session) error {
		kids, err := s.Children(ctx, parent.ID)
		if err != nil {
			return err
		}
		for _, kid := range kids {
			if err := walk(kid); err != nil {
				return err
			}
		}
		ordered = append(ordered, parent)
		return nil
	}
	if err := walk(root); err != nil {
		return nil, err
	}
	err = s.db.ExecWrite(ctx, func(tx *sql.Tx) error {
		for _, item := range ordered {
			if _, err := tx.ExecContext(ctx, `DELETE FROM session WHERE id = ?`, item.ID); err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return ordered, nil
}
