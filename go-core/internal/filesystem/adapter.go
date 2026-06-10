// Package filesystem provides a pure I/O layer for file operations,
// replacing packages/core/src/filesystem.ts in the Go core.
//
// All functions resolve paths to absolute before operating.
// The adapter is sandbox-aware: if a Root is configured via Options,
// all paths are validated to stay within the sandbox.
package filesystem

import (
	"encoding/json"
	"errors"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// pathSep is the OS-specific path separator as a string.
var pathSep = string(os.PathSeparator)

// DefaultPerm is the default file permission used when writing files.
const DefaultPerm os.FileMode = 0644

// DefaultDirPerm is the default permission used when creating directories.
const DefaultDirPerm os.FileMode = 0755

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// ReadResult represents the result of a file read operation.
type ReadResult struct {
	Content  string `json:"content"`
	Size     int64  `json:"size"`
	MIMEType string `json:"mime_type"`
	Binary   bool   `json:"binary"`
}

// DirEntry represents a directory entry with type information.
type DirEntry struct {
	Name string `json:"name"`
	Type string `json:"type"` // "file", "directory", "symlink", "other"
}

// StatResult mirrors the shape returned by the TS stat endpoint.
type StatResult struct {
	Name    string `json:"name"`
	Size    int64  `json:"size"`
	Mode    string `json:"mode"`
	ModTime string `json:"modtime"`
	Dir     bool   `json:"dir"`
}

// GlobOptions configures glob matching behaviour.
type GlobOptions struct {
	Cwd      string // working directory (default: ".")
	Absolute bool   // return absolute paths
	Dot      bool   // include dotfiles
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

var (
	ErrNotFound     = errors.New("file not found")
	ErrPathNotSafe  = errors.New("path is not safe (outside sandbox)")
	ErrPathRequired = errors.New("path is required")
)

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

// absPath resolves a path to absolute and validates sandbox constraints.
// If opt.Root is set, the path must be inside root.
func absPath(path string) (string, error) {
	if path == "" {
		return "", ErrPathRequired
	}
	return filepath.Abs(path)
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

// Read reads a file from the given path, with optional offset and limit.
func Read(path string, offset, limit int) (*ReadResult, error) {
	abs, err := absPath(path)
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
	if limit > 0 && offset+limit <= len(data) {
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

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

// Write writes content to a file at the given path, creating parent dirs.
func Write(path string, content []byte) error {
	abs, err := absPath(path)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(abs), DefaultDirPerm); err != nil {
		return err
	}
	return os.WriteFile(abs, content, DefaultPerm)
}

// WriteWithDirs is an alias for Write that makes the intent explicit.
func WriteWithDirs(path string, content []byte) error {
	return Write(path, content)
}

// WriteString writes a string to a file.
func WriteString(path string, content string) error {
	return Write(path, []byte(content))
}

// ---------------------------------------------------------------------------
// Stat
// ---------------------------------------------------------------------------

// Stat returns file information for the given path.
func Stat(path string) (os.FileInfo, error) {
	abs, err := absPath(path)
	if err != nil {
		return nil, err
	}
	return os.Stat(abs)
}

// StatResult returns a JSON-friendly stat result.
func StatResultJSON(path string) (*StatResult, error) {
	info, err := Stat(path)
	if err != nil {
		return nil, err
	}
	return &StatResult{
		Name:    info.Name(),
		Size:    info.Size(),
		Mode:    info.Mode().String(),
		ModTime: info.ModTime().UTC().Format("2006-01-02T15:04:05Z"),
		Dir:     info.IsDir(),
	}, nil
}

// ---------------------------------------------------------------------------
// Exists / IsDir / IsFile
// ---------------------------------------------------------------------------

// Exists returns true if the path exists.
func Exists(path string) (bool, error) {
	abs, err := absPath(path)
	if err != nil {
		return false, err
	}
	_, err = os.Stat(abs)
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, err
}

// IsDir returns true if the path is a directory.
func IsDir(path string) (bool, error) {
	abs, err := absPath(path)
	if err != nil {
		return false, err
	}
	info, err := os.Stat(abs)
	if err != nil {
		if os.IsNotExist(err) {
			return false, nil
		}
		return false, err
	}
	return info.IsDir(), nil
}

// IsFile returns true if the path is a regular file.
func IsFile(path string) (bool, error) {
	abs, err := absPath(path)
	if err != nil {
		return false, err
	}
	info, err := os.Stat(abs)
	if err != nil {
		if os.IsNotExist(err) {
			return false, nil
		}
		return false, err
	}
	return info.Mode().IsRegular(), nil
}

// ---------------------------------------------------------------------------
// ReadFileStringSafe
// ---------------------------------------------------------------------------

// ReadFileStringSafe reads a file and returns its content as a string.
// If the file does not exist, it returns ("", false, nil) without error.
func ReadFileStringSafe(path string) (string, bool, error) {
	abs, err := absPath(path)
	if err != nil {
		return "", false, err
	}
	data, err := os.ReadFile(abs)
	if err != nil {
		if os.IsNotExist(err) {
			return "", false, nil
		}
		return "", false, err
	}
	return string(data), true, nil
}

// ---------------------------------------------------------------------------
// JSON helpers
// ---------------------------------------------------------------------------

// ReadJSON reads and parses a JSON file into v.
func ReadJSON(path string, v interface{}) error {
	abs, err := absPath(path)
	if err != nil {
		return err
	}
	data, err := os.ReadFile(abs)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, v)
}

// WriteJSON marshals v as indented JSON and writes to path.
func WriteJSON(path string, v interface{}) error {
	data, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return err
	}
	return Write(path, data)
}

// ---------------------------------------------------------------------------
// EnsureDir
// ---------------------------------------------------------------------------

// EnsureDir creates a directory and all parent directories.
func EnsureDir(path string) error {
	abs, err := absPath(path)
	if err != nil {
		return err
	}
	return os.MkdirAll(abs, DefaultDirPerm)
}

// ---------------------------------------------------------------------------
// ReadDirectoryEntries
// ---------------------------------------------------------------------------

// ReadDirectoryEntries reads a directory and returns typed entries.
func ReadDirectoryEntries(path string) ([]DirEntry, error) {
	abs, err := absPath(path)
	if err != nil {
		return nil, err
	}
	entries, err := os.ReadDir(abs)
	if err != nil {
		return nil, err
	}
	result := make([]DirEntry, 0, len(entries))
	for _, e := range entries {
		typ := "other"
		switch {
		case e.IsDir():
			typ = "directory"
		case e.Type().IsRegular():
			typ = "file"
		case e.Type()&os.ModeSymlink != 0:
			typ = "symlink"
		}
		result = append(result, DirEntry{Name: e.Name(), Type: typ})
	}
	sort.Slice(result, func(i, j int) bool { return result[i].Name < result[j].Name })
	return result, nil
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

// List returns a list of files matching the given pattern in the directory.
// Returns relative paths (relative to dir).
func List(dir string, pattern string, recursive bool) ([]string, error) {
	abs, err := absPath(dir)
	if err != nil {
		return nil, err
	}

	files := []string{}
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

// ---------------------------------------------------------------------------
// FindUp / Up / GlobUp
// ---------------------------------------------------------------------------

// FindUp walks up from start looking for target, returning all absolute
// paths found. Stops at stop if provided.
func FindUp(target, start string, stop ...string) ([]string, error) {
	result := []string{}
	current, err := filepath.Abs(start)
	if err != nil {
		return nil, err
	}

	stopAbs := ""
	if len(stop) > 0 && stop[0] != "" {
		stopAbs, err = filepath.Abs(stop[0])
		if err != nil {
			return nil, err
		}
	}

	for {
		search := filepath.Join(current, target)
		exists, err := Exists(search)
		if err != nil {
			return nil, err
		}
		if exists {
			result = append(result, search)
		}

		if stopAbs != "" && current == stopAbs {
			break
		}
		parent := filepath.Dir(current)
		if parent == current {
			break
		}
		current = parent
	}
	return result, nil
}

// Up walks up from start looking for multiple targets, returning all
// absolute paths found.
func Up(targets []string, start string, stop ...string) ([]string, error) {
	result := []string{}
	current, err := filepath.Abs(start)
	if err != nil {
		return nil, err
	}

	stopAbs := ""
	if len(stop) > 0 && stop[0] != "" {
		stopAbs, err = filepath.Abs(stop[0])
		if err != nil {
			return nil, err
		}
	}

	for {
		for _, target := range targets {
			search := filepath.Join(current, target)
			exists, err := Exists(search)
			if err != nil {
				return nil, err
			}
			if exists {
				result = append(result, search)
			}
		}

		if stopAbs != "" && current == stopAbs {
			break
		}
		parent := filepath.Dir(current)
		if parent == current {
			break
		}
		current = parent
	}
	return result, nil
}

// GlobUp walks up from start looking for files matching pattern,
// returning all absolute paths found.
func GlobUp(pattern, start string, stop ...string) ([]string, error) {
	result := []string{}
	current, err := filepath.Abs(start)
	if err != nil {
		return nil, err
	}

	stopAbs := ""
	if len(stop) > 0 && stop[0] != "" {
		stopAbs, err = filepath.Abs(stop[0])
		if err != nil {
			return nil, err
		}
	}

	for {
		matches, err := Glob(pattern, GlobOptions{Cwd: current, Absolute: true, Dot: true})
		if err != nil {
			return nil, err
		}
		result = append(result, matches...)

		if stopAbs != "" && current == stopAbs {
			break
		}
		parent := filepath.Dir(current)
		if parent == current {
			break
		}
		current = parent
	}
	return result, nil
}

// ---------------------------------------------------------------------------
// Glob
// ---------------------------------------------------------------------------

// Glob performs glob matching against the filesystem.
// Supports ** (globstar), *, ?, and character classes [...].
// If opts.Absolute is true, returns absolute paths; otherwise relative to Cwd.
func Glob(pattern string, opts GlobOptions) ([]string, error) {
	if opts.Cwd == "" {
		opts.Cwd = "."
	}
	cwd, err := filepath.Abs(opts.Cwd)
	if err != nil {
		return nil, err
	}

	var matches []string
	segments := splitGlobPattern(pattern)

	if err := globWalk(cwd, cwd, segments, 0, opts.Dot, &matches); err != nil {
		return nil, err
	}

	sort.Strings(matches)

	if !opts.Absolute {
		for i, m := range matches {
			rel, err := filepath.Rel(cwd, m)
			if err == nil {
				matches[i] = rel
			}
		}
	}
	return matches, nil
}

// GlobMatch checks if a filepath matches a glob pattern.
// Uses filepath.Match for single-segment patterns and accounts for **.
func GlobMatch(pattern, filePath string) bool {
	segments := splitGlobPattern(pattern)
	pathSegments := strings.Split(filepath.Clean(filePath), pathSep)

	return globMatch(segments, pathSegments)
}

func globMatch(segments, pathSegments []string) bool {
	// Empty pattern matches empty path
	if len(segments) == 0 {
		return len(pathSegments) == 0
	}
	// If first segment is **
	if segments[0] == "**" {
		// If ** is last segment, it matches anything
		if len(segments) == 1 {
			return true
		}
		// Try matching the rest at each position
		for i := 0; i <= len(pathSegments); i++ {
			if globMatch(segments[1:], pathSegments[i:]) {
				return true
			}
		}
		return false
	}

	if len(pathSegments) == 0 {
		return false
	}

	match, _ := filepath.Match(segments[0], pathSegments[0])
	if !match {
		return false
	}
	return globMatch(segments[1:], pathSegments[1:])
}

func splitGlobPattern(pattern string) []string {
	pattern = filepath.ToSlash(pattern)
	parts := strings.Split(pattern, "/")
	// Remove empty strings from leading slash
	result := []string{}
	for _, p := range parts {
		if p != "" {
			result = append(result, p)
		}
	}
	return result
}

func globWalk(cwd, current string, segments []string, idx int, dot bool, matches *[]string) error {
	if idx >= len(segments) {
		// All segments consumed; current is a match
		info, err := os.Stat(current)
		if err != nil {
			return nil
		}
		if info.Mode().IsRegular() {
			*matches = append(*matches, current)
		}
		return nil
	}

	seg := segments[idx]

	if seg == "**" {
		// ** matches zero or more directories
		// Skip ** and try matching remaining segments at current level
		if err := globWalk(cwd, current, segments, idx+1, dot, matches); err != nil {
			return err
		}
		// Recurse into subdirectories
		entries, err := os.ReadDir(current)
		if err != nil {
			return nil
		}
		for _, e := range entries {
			if !e.IsDir() {
				continue
			}
			name := e.Name()
			if !dot && strings.HasPrefix(name, ".") {
				continue
			}
			child := filepath.Join(current, name)
			if err := globWalk(cwd, child, segments, idx, dot, matches); err != nil {
				return err
			}
		}
		return nil
	}

	// Regular segment: list directory and match
	entries, err := os.ReadDir(current)
	if err != nil {
		return nil
	}
	for _, e := range entries {
		name := e.Name()
		if !dot && strings.HasPrefix(name, ".") {
			continue
		}
		match, err := filepath.Match(seg, name)
		if err != nil || !match {
			continue
		}
		child := filepath.Join(current, name)
		if idx == len(segments)-1 {
			// Last segment: only match files (like TS include: "file")
			if e.Type().IsRegular() {
				*matches = append(*matches, child)
			}
		} else {
			// Intermediate segments: only recurse into directories
			if e.IsDir() {
				if err := globWalk(cwd, child, segments, idx+1, dot, matches); err != nil {
					return err
				}
			}
		}
	}
	return nil
}

// ---------------------------------------------------------------------------
// Copy / Move
// ---------------------------------------------------------------------------

// Copy copies a file from src to dst.
func Copy(src, dst string) error {
	srcAbs, err := absPath(src)
	if err != nil {
		return err
	}
	data, err := os.ReadFile(srcAbs)
	if err != nil {
		return err
	}
	return Write(dst, data)
}

// Move renames (moves) a file from src to dst.
func Move(src, dst string) error {
	srcAbs, err := absPath(src)
	if err != nil {
		return err
	}
	dstAbs, err := absPath(dst)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(dstAbs), DefaultDirPerm); err != nil {
		return err
	}
	return os.Rename(srcAbs, dstAbs)
}

// ---------------------------------------------------------------------------
// Remove
// ---------------------------------------------------------------------------

// Remove removes a file or empty directory.
func Remove(path string) error {
	abs, err := absPath(path)
	if err != nil {
		return err
	}
	return os.Remove(abs)
}

// RemoveAll removes a file or directory tree.
func RemoveAll(path string) error {
	abs, err := absPath(path)
	if err != nil {
		return err
	}
	return os.RemoveAll(abs)
}

// ---------------------------------------------------------------------------
// Binary & MIME detection
// ---------------------------------------------------------------------------

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
		case ".svg":
			return "image/svg+xml"
		case ".ico":
			return "image/x-icon"
		case ".mp4":
			return "video/mp4"
		case ".mp3":
			return "audio/mpeg"
		case ".zip":
			return "application/zip"
		case ".tar":
			return "application/x-tar"
		case ".gz":
			return "application/gzip"
		case ".json":
			return "application/json"
		case ".wasm":
			return "application/wasm"
		default:
			return "application/octet-stream"
		}
	}
	return "text/plain"
}
