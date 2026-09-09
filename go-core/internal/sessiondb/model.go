package sessiondb

import (
	"encoding/json"
	"errors"
	"fmt"
)

type Tokens struct {
	Input     int64       `json:"input"`
	Output    int64       `json:"output"`
	Reasoning int64       `json:"reasoning"`
	Cache     TokensCache `json:"cache"`
}

type TokensCache struct {
	Read  int64 `json:"read"`
	Write int64 `json:"write"`
}

type Summary struct {
	Additions int64           `json:"additions"`
	Deletions int64           `json:"deletions"`
	Files     int64           `json:"files"`
	Diffs     json.RawMessage `json:"diffs,omitempty"`
}

type Share struct {
	URL string `json:"url"`
}

type Time struct {
	Created    int64  `json:"created"`
	Updated    int64  `json:"updated"`
	Compacting *int64 `json:"compacting,omitempty"`
	Archived   *int64 `json:"archived,omitempty"`
}

type Session struct {
	ID          string          `json:"id"`
	Slug        string          `json:"slug"`
	ProjectID   string          `json:"projectID"`
	WorkspaceID *string         `json:"workspaceID,omitempty"`
	Directory   string          `json:"directory"`
	Path        *string         `json:"path,omitempty"`
	ParentID    *string         `json:"parentID,omitempty"`
	Summary     *Summary        `json:"summary,omitempty"`
	Cost        float64         `json:"cost"`
	Tokens      Tokens          `json:"tokens"`
	Share       *Share          `json:"share,omitempty"`
	Title       string          `json:"title"`
	Agent       *string         `json:"agent,omitempty"`
	Model       json.RawMessage `json:"model,omitempty"`
	Version     string          `json:"version"`
	Time        Time            `json:"time"`
	Permission  json.RawMessage `json:"permission,omitempty"`
	Revert      json.RawMessage `json:"revert,omitempty"`
}

type Message struct {
	ID          string
	SessionID   string
	TimeCreated int64
	Data        json.RawMessage
}

type Part struct {
	ID          string
	SessionID   string
	MessageID   string
	TimeCreated int64
	Data        json.RawMessage
}

type Todo struct {
	Content  string `json:"content"`
	Status   string `json:"status"`
	Priority string `json:"priority"`
}

type ErrNotFound struct {
	Kind string
	ID   string
}

func (e ErrNotFound) Error() string { return fmt.Sprintf("%s not found: %s", e.Kind, e.ID) }

func IsNotFound(err error) bool {
	var target ErrNotFound
	return errors.As(err, &target)
}

type ErrInvalidInput struct {
	Msg string
}

func (e ErrInvalidInput) Error() string { return e.Msg }

func IsInvalidInput(err error) bool {
	var target ErrInvalidInput
	return errors.As(err, &target)
}

func mergeIDs(data json.RawMessage, ids map[string]string) ([]byte, error) {
	obj := map[string]json.RawMessage{}
	if len(data) > 0 {
		if err := json.Unmarshal(data, &obj); err != nil {
			return nil, err
		}
	}
	for k, v := range ids {
		quoted, _ := json.Marshal(v)
		obj[k] = quoted
	}
	return json.Marshal(obj)
}

func (m Message) MarshalJSON() ([]byte, error) {
	return mergeIDs(m.Data, map[string]string{"id": m.ID, "sessionID": m.SessionID})
}

func (p Part) MarshalJSON() ([]byte, error) {
	return mergeIDs(p.Data, map[string]string{"id": p.ID, "sessionID": p.SessionID, "messageID": p.MessageID})
}

func splitIDs(body []byte, keys ...string) (map[string]string, json.RawMessage, error) {
	obj := map[string]json.RawMessage{}
	if err := json.Unmarshal(body, &obj); err != nil {
		return nil, nil, ErrInvalidInput{Msg: "body must be a JSON object"}
	}
	ids := map[string]string{}
	for _, k := range keys {
		raw, ok := obj[k]
		if !ok {
			continue
		}
		var s string
		if err := json.Unmarshal(raw, &s); err != nil {
			return nil, nil, ErrInvalidInput{Msg: fmt.Sprintf("%s must be a string", k)}
		}
		ids[k] = s
		delete(obj, k)
	}
	rest, err := json.Marshal(obj)
	return ids, rest, err
}
