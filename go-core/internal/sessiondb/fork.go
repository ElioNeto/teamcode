package sessiondb

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"

	"github.com/ElioNeto/teamcode/go-core/internal/ident"
)

type ForkResult struct {
	Session  Session
	Messages []MessageWithParts
}

var forkTitle = regexp.MustCompile(`^(.+) \(fork #(\d+)\)$`)

func forkedTitle(title string) string {
	if m := forkTitle.FindStringSubmatch(title); m != nil {
		n, _ := strconv.Atoi(m[2])
		return fmt.Sprintf("%s (fork #%d)", m[1], n+1)
	}
	return title + " (fork #1)"
}

func replaceStringField(data json.RawMessage, field string, mapping map[string]string) json.RawMessage {
	var obj map[string]json.RawMessage
	if err := json.Unmarshal(data, &obj); err != nil {
		return data
	}
	raw, ok := obj[field]
	if !ok {
		return data
	}
	var current string
	if err := json.Unmarshal(raw, &current); err != nil {
		return data
	}
	replacement, ok := mapping[current]
	if !ok {
		return data
	}
	quoted, _ := json.Marshal(replacement)
	obj[field] = quoted
	out, _ := json.Marshal(obj)
	return out
}

func (s *Store) Fork(ctx context.Context, sessionID, beforeMessageID, directory, path, version string) (ForkResult, error) {
	original, err := s.GetSession(ctx, sessionID)
	if err != nil {
		return ForkResult{}, err
	}
	title := forkedTitle(original.Title)
	var pathPtr *string
	if path != "" {
		pathPtr = &path
	}
	created, err := s.CreateSession(ctx, CreateSessionInput{
		ProjectID: original.ProjectID, WorkspaceID: original.WorkspaceID, Directory: directory, Path: pathPtr, Title: &title, Version: version,
	})
	if err != nil {
		return ForkResult{}, err
	}
	source, err := s.AllMessages(ctx, sessionID)
	if err != nil {
		return ForkResult{}, err
	}
	idMap := map[string]string{}
	var copied []MessageWithParts
	for _, item := range source {
		if beforeMessageID != "" && item.Info.ID >= beforeMessageID {
			break
		}
		newID := ident.Message()
		idMap[item.Info.ID] = newID
		data := replaceStringField(item.Info.Data, "parentID", idMap)
		body, err := mergeIDs(data, map[string]string{"id": newID})
		if err != nil {
			return ForkResult{}, err
		}
		message, err := s.UpsertMessage(ctx, created.ID, body)
		if err != nil {
			return ForkResult{}, err
		}
		with := MessageWithParts{Info: message, Parts: []Part{}}
		for _, part := range item.Parts {
			partData := replaceStringField(part.Data, "tail_start_id", idMap)
			partBody, err := mergeIDs(partData, map[string]string{"id": ident.Part()})
			if err != nil {
				return ForkResult{}, err
			}
			stored, err := s.UpsertPart(ctx, created.ID, message.ID, partBody, part.TimeCreated)
			if err != nil {
				return ForkResult{}, err
			}
			with.Parts = append(with.Parts, stored)
		}
		copied = append(copied, with)
	}
	final, err := s.GetSession(ctx, created.ID)
	if err != nil {
		return ForkResult{}, err
	}
	return ForkResult{Session: final, Messages: copied}, nil
}
