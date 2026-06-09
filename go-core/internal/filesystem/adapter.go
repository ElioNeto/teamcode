// Package filesystem provides a pure I/O layer for file operations,
// replacing packages/core/src/filesystem.ts in the Go core.
package filesystem

import (
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

// ReadResult represents the result of a file read operation.
type ReadResult struct {
	Content  string `json:"content"`
	Size     int64  `json:"size"`
	MIMEType string `json:"mime_type"`
	Binary   bool   `json:"binary"`
}

// Read reads a file from the given path, with optional offset and limit.
func Read(path string, offset, limit int) (*ReadResult, error) {
	abs, err := filepath.Abs(path)
	if err != nil {
		return nil, err
	}

	data, err := os.ReadFile(abs)
	if err != nil {
		return nil, err
	}

	if offset > len(data) {
		offset = len(data)
	}
	if limit > 0 && offset+limit < len(data) {
		data = data[offset : offset+limit]
	} else if offset > 0 {
		data = data[offset:]
	}

	isBinary := detectBinary(data)
	mime := detectMIME(data, path)

	return &ReadResult{
		Content:  string(data),
		Size:     int64(len(data)),
		MIMEType: mime,
		Binary:   isBinary,
	}, nil
}

// Write writes content to a file at the given path.
func Write(path string, content []byte) error {
	abs, err := filepath.Abs(path)
	if err != nil {
		return err
	}

	dir := filepath.Dir(abs)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	return os.WriteFile(abs, content, 0644)
}

// Stat returns file information for the given path.
func Stat(path string) (os.FileInfo, error) {
	abs, err := filepath.Abs(path)
	if err != nil {
		return nil, err
	}
	return os.Stat(abs)
}

// List returns a list of files matching the given pattern in the directory.
func List(dir string, pattern string, recursive bool) ([]string, error) {
	abs, err := filepath.Abs(dir)
	if err != nil {
		return nil, err
	}

	var files []string
	walkFn := func(path string, info fs.FileInfo, err error) error {
		if err != nil {
			return nil // skip inaccessible
		}
		if info.IsDir() {
			if !recursive && path != abs {
				return filepath.SkipDir
			}
			return nil
		}
		if pattern != "" {
			match, err := filepath.Match(pattern, info.Name())
			if err != nil || !match {
				return nil
			}
		}
		rel, err := filepath.Rel(abs, path)
		if err != nil {
			return nil
		}
		files = append(files, rel)
		return nil
	}

	filepath.Walk(abs, walkFn)
	return files, nil
}

// detectBinary checks if the data contains null bytes (binary content).
func detectBinary(data []byte) bool {
	for _, b := range data {
		if b == 0 {
			return true
		}
	}
	return false
}

// detectMIME returns a basic MIME type for the given data and filename.
func detectMIME(data []byte, path string) string {
	if detectBinary(data) {
		ext := strings.ToLower(filepath.Ext(path))
		switch ext {
		case ".png":
			return "image/png"
		case ".jpg", ".jpeg":
			return "image/jpeg"
		case ".gif":
			return "image/gif"
		case ".pdf":
			return "application/pdf"
		case ".webp":
			return "image/webp"
		default:
			return "application/octet-stream"
		}
	}
	return "text/plain"
}
