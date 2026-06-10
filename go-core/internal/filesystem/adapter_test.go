package filesystem

import (
	"os"
	"path/filepath"
	"testing"
)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

func tmpDir(t *testing.T) string {
	t.Helper()
	dir, err := os.MkdirTemp("", "go-core-fs-*")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { os.RemoveAll(dir) })
	return dir
}

func writeFile(t *testing.T, path, content string) {
	t.Helper()
	if err := Write(path, []byte(content)); err != nil {
		t.Fatal(err)
	}
}

// ---------------------------------------------------------------------------
// Read / Write
// ---------------------------------------------------------------------------

func TestReadWrite(t *testing.T) {
	dir := tmpDir(t)
	p := filepath.Join(dir, "hello.txt")

	// Write
	if err := Write(p, []byte("hello world")); err != nil {
		t.Fatal(err)
	}

	// Read
	r, err := Read(p, 0, 0)
	if err != nil {
		t.Fatal(err)
	}
	if r.Content != "hello world" {
		t.Fatalf("expected 'hello world', got '%s'", r.Content)
	}
	if r.Size != 11 {
		t.Fatalf("expected size 11, got %d", r.Size)
	}
	if r.Binary {
		t.Fatal("expected non-binary")
	}
	if r.MIMEType != "text/plain" {
		t.Fatalf("expected text/plain, got %s", r.MIMEType)
	}
}

func TestReadOffset(t *testing.T) {
	dir := tmpDir(t)
	p := filepath.Join(dir, "offset.txt")
	writeFile(t, p, "abcdefghij")

	r, err := Read(p, 3, 0)
	if err != nil {
		t.Fatal(err)
	}
	if r.Content != "defghij" {
		t.Fatalf("expected 'defghij', got '%s'", r.Content)
	}
}

func TestReadOffsetLimit(t *testing.T) {
	dir := tmpDir(t)
	p := filepath.Join(dir, "limit.txt")
	writeFile(t, p, "abcdefghij")

	r, err := Read(p, 2, 5)
	if err != nil {
		t.Fatal(err)
	}
	if r.Content != "cdefg" {
		t.Fatalf("expected 'cdefg', got '%s'", r.Content)
	}
}

func TestReadNotFound(t *testing.T) {
	_, err := Read("/nonexistent/file.txt", 0, 0)
	if err == nil {
		t.Fatal("expected error for nonexistent file")
	}
}

func TestReadEmptyPath(t *testing.T) {
	_, err := Read("", 0, 0)
	if err != ErrPathRequired {
		t.Fatalf("expected ErrPathRequired, got %v", err)
	}
}

// ---------------------------------------------------------------------------
// WriteWithDirs / EnsureDir
// ---------------------------------------------------------------------------

func TestWriteWithDirs(t *testing.T) {
	dir := tmpDir(t)
	p := filepath.Join(dir, "a", "b", "c", "deep.txt")

	if err := WriteWithDirs(p, []byte("deep")); err != nil {
		t.Fatal(err)
	}

	exists, _ := Exists(p)
	if !exists {
		t.Fatal("expected file to exist after WriteWithDirs")
	}
}

func TestEnsureDir(t *testing.T) {
	dir := tmpDir(t)
	p := filepath.Join(dir, "x", "y", "z")

	if err := EnsureDir(p); err != nil {
		t.Fatal(err)
	}

	isDir, _ := IsDir(p)
	if !isDir {
		t.Fatal("expected directory to exist after EnsureDir")
	}
}

// ---------------------------------------------------------------------------
// Stat
// ---------------------------------------------------------------------------

func TestStat(t *testing.T) {
	dir := tmpDir(t)
	p := filepath.Join(dir, "stat.txt")
	writeFile(t, p, "data")

	info, err := Stat(p)
	if err != nil {
		t.Fatal(err)
	}
	if info.IsDir() {
		t.Fatal("expected file, not directory")
	}
	if info.Size() != 4 {
		t.Fatalf("expected size 4, got %d", info.Size())
	}
}

func TestStatResult(t *testing.T) {
	dir := tmpDir(t)
	p := filepath.Join(dir, "result.txt")
	writeFile(t, p, "data")

	r, err := StatResultJSON(p)
	if err != nil {
		t.Fatal(err)
	}
	if r.Dir {
		t.Fatal("expected file")
	}
	if r.Size != 4 {
		t.Fatalf("expected size 4, got %d", r.Size)
	}
	if r.Name != "result.txt" {
		t.Fatalf("expected result.txt, got %s", r.Name)
	}
	if r.Mode == "" {
		t.Fatal("expected non-empty mode string")
	}
	if r.ModTime == "" {
		t.Fatal("expected non-empty modtime string")
	}
}

// ---------------------------------------------------------------------------
// Exists / IsDir / IsFile
// ---------------------------------------------------------------------------

func TestExists(t *testing.T) {
	dir := tmpDir(t)
	p := filepath.Join(dir, "exists.txt")

	e, _ := Exists(p)
	if e {
		t.Fatal("expected false before file creation")
	}

	writeFile(t, p, "data")
	e, _ = Exists(p)
	if !e {
		t.Fatal("expected true after file creation")
	}
}

func TestIsDirIsFile(t *testing.T) {
	dir := tmpDir(t)
	sub := filepath.Join(dir, "subdir")
	file := filepath.Join(dir, "afile.txt")

	os.Mkdir(sub, 0755)
	writeFile(t, file, "data")

	d1, _ := IsDir(sub)
	if !d1 {
		t.Fatal("expected sub to be dir")
	}
	d2, _ := IsFile(sub)
	if d2 {
		t.Fatal("expected sub not to be file")
	}

	f1, _ := IsFile(file)
	if !f1 {
		t.Fatal("expected file to be file")
	}
	f2, _ := IsDir(file)
	if f2 {
		t.Fatal("expected file not to be dir")
	}

	// Non existent
	e1, _ := IsDir("/nonexistent")
	if e1 {
		t.Fatal("expected non-existent not to be dir")
	}
	e2, _ := IsFile("/nonexistent")
	if e2 {
		t.Fatal("expected non-existent not to be file")
	}
}

// ---------------------------------------------------------------------------
// ReadFileStringSafe
// ---------------------------------------------------------------------------

func TestReadFileStringSafe(t *testing.T) {
	dir := tmpDir(t)
	p := filepath.Join(dir, "safe.txt")

	content, found, err := ReadFileStringSafe(p)
	if err != nil {
		t.Fatal(err)
	}
	if found {
		t.Fatal("expected found=false for nonexistent file")
	}
	if content != "" {
		t.Fatalf("expected empty content, got '%s'", content)
	}

	writeFile(t, p, "safe content")
	content, found, err = ReadFileStringSafe(p)
	if err != nil {
		t.Fatal(err)
	}
	if !found {
		t.Fatal("expected found=true")
	}
	if content != "safe content" {
		t.Fatalf("expected 'safe content', got '%s'", content)
	}
}

// ---------------------------------------------------------------------------
// JSON helpers
// ---------------------------------------------------------------------------

func TestReadWriteJSON(t *testing.T) {
	dir := tmpDir(t)
	p := filepath.Join(dir, "data.json")

	data := map[string]interface{}{
		"name": "test",
		"num":  42,
	}

	if err := WriteJSON(p, data); err != nil {
		t.Fatal(err)
	}

	var read map[string]interface{}
	if err := ReadJSON(p, &read); err != nil {
		t.Fatal(err)
	}

	if read["name"] != "test" {
		t.Fatalf("expected 'test', got '%v'", read["name"])
	}
	// JSON numbers decode as float64
	if read["num"] != float64(42) {
		t.Fatalf("expected 42, got '%v'", read["num"])
	}
}

// ---------------------------------------------------------------------------
// ReadDirectoryEntries
// ---------------------------------------------------------------------------

func TestReadDirectoryEntries(t *testing.T) {
	dir := tmpDir(t)
	writeFile(t, filepath.Join(dir, "a.txt"), "a")
	writeFile(t, filepath.Join(dir, "b.txt"), "b")
	os.Mkdir(filepath.Join(dir, "sub"), 0755)

	entries, err := ReadDirectoryEntries(dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(entries) != 3 {
		t.Fatalf("expected 3 entries, got %d", len(entries))
	}

	// Should be sorted
	if entries[0].Name != "a.txt" {
		t.Fatalf("expected a.txt first, got %s", entries[0].Name)
	}
	if entries[0].Type != "file" {
		t.Fatalf("expected type 'file', got '%s'", entries[0].Type)
	}
	if entries[2].Name != "sub" {
		t.Fatalf("expected sub last, got %s", entries[2].Name)
	}
	if entries[2].Type != "directory" {
		t.Fatalf("expected type 'directory', got '%s'", entries[2].Type)
	}
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

func TestList(t *testing.T) {
	dir := tmpDir(t)
	writeFile(t, filepath.Join(dir, "a.txt"), "a")
	writeFile(t, filepath.Join(dir, "b.txt"), "b")
	os.Mkdir(filepath.Join(dir, "sub"), 0755)
	writeFile(t, filepath.Join(dir, "sub", "c.txt"), "c")

	// Non-recursive
	files, err := List(dir, "", false)
	if err != nil {
		t.Fatal(err)
	}
	expected := 2
	if len(files) != expected {
		t.Fatalf("expected %d files (non-recursive), got %d", expected, len(files))
	}

	// Recursive
	files, err = List(dir, "", true)
	if err != nil {
		t.Fatal(err)
	}
	expected = 3
	if len(files) != expected {
		t.Fatalf("expected %d files (recursive), got %d", expected, len(files))
	}

	// With pattern
	files, err = List(dir, "*.txt", false)
	if err != nil {
		t.Fatal(err)
	}
	if len(files) != 2 {
		t.Fatalf("expected 2 files matching *.txt, got %d", len(files))
	}
}

// ---------------------------------------------------------------------------
// FindUp / Up / GlobUp
// ---------------------------------------------------------------------------

func TestFindUp(t *testing.T) {
	dir := tmpDir(t)
	sub := filepath.Join(dir, "a", "b", "c")
	os.MkdirAll(sub, 0755)

	// Place target at dir level
	writeFile(t, filepath.Join(dir, "target.txt"), "found")

	results, err := FindUp("target.txt", sub)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) != 1 {
		t.Fatalf("expected 1 result, got %d", len(results))
	}
}

func TestFindUpNotFound(t *testing.T) {
	dir := tmpDir(t)
	results, err := FindUp("nonexistent.txt", dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) != 0 {
		t.Fatalf("expected 0 results, got %d", len(results))
	}
}

func TestUp(t *testing.T) {
	dir := tmpDir(t)
	sub := filepath.Join(dir, "x", "y")
	os.MkdirAll(sub, 0755)

	writeFile(t, filepath.Join(dir, "a.txt"), "a")
	writeFile(t, filepath.Join(dir, "b.txt"), "b")

	results, err := Up([]string{"a.txt", "b.txt"}, sub)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) != 2 {
		t.Fatalf("expected 2 results, got %d", len(results))
	}
}

// ---------------------------------------------------------------------------
// Glob
// ---------------------------------------------------------------------------

func TestGlob(t *testing.T) {
	dir := tmpDir(t)
	writeFile(t, filepath.Join(dir, "a.txt"), "a")
	writeFile(t, filepath.Join(dir, "b.txt"), "b")
	writeFile(t, filepath.Join(dir, "c.go"), "c")
	os.MkdirAll(filepath.Join(dir, "sub"), 0755)
	writeFile(t, filepath.Join(dir, "sub", "d.txt"), "d")

	matches, err := Glob("*.txt", GlobOptions{Cwd: dir})
	if err != nil {
		t.Fatal(err)
	}
	expected := 2
	if len(matches) != expected {
		t.Fatalf("expected %d matches for *.txt, got %d: %v", expected, len(matches), matches)
	}
}

func TestGlobDoubleStar(t *testing.T) {
	dir := tmpDir(t)
	writeFile(t, filepath.Join(dir, "a.txt"), "a")
	os.MkdirAll(filepath.Join(dir, "sub", "nested"), 0755)
	writeFile(t, filepath.Join(dir, "sub", "nested", "b.txt"), "b")

	matches, err := Glob("**/*.txt", GlobOptions{Cwd: dir})
	if err != nil {
		t.Fatal(err)
	}
	expected := 2
	if len(matches) != expected {
		t.Fatalf("expected %d matches for **/*.txt, got %d: %v", expected, len(matches), matches)
	}
}

func TestGlobAbsolute(t *testing.T) {
	dir := tmpDir(t)
	writeFile(t, filepath.Join(dir, "abs.txt"), "abs")

	matches, err := Glob("*.txt", GlobOptions{Cwd: dir, Absolute: true})
	if err != nil {
		t.Fatal(err)
	}
	if len(matches) != 1 {
		t.Fatalf("expected 1 match, got %d", len(matches))
	}
	if !filepath.IsAbs(matches[0]) {
		t.Fatal("expected absolute path")
	}
}

func TestGlobDot(t *testing.T) {
	dir := tmpDir(t)
	writeFile(t, filepath.Join(dir, ".hidden"), "hidden")

	// Without Dot (default) — should NOT match
	matches, err := Glob("*", GlobOptions{Cwd: dir})
	if err != nil {
		t.Fatal(err)
	}
	if len(matches) != 0 {
		t.Fatalf("expected 0 matches (no dot), got %d", len(matches))
	}

	// With Dot — SHOULD match
	matches, err = Glob("*", GlobOptions{Cwd: dir, Dot: true})
	if err != nil {
		t.Fatal(err)
	}
	if len(matches) != 1 {
		t.Fatalf("expected 1 match (with dot), got %d", len(matches))
	}
}

// ---------------------------------------------------------------------------
// GlobMatch
// ---------------------------------------------------------------------------

func TestGlobMatch(t *testing.T) {
	tests := []struct {
		pattern string
		path    string
		want    bool
	}{
		{"*.txt", "foo.txt", true},
		{"*.txt", "foo.go", false},
		{"src/**/*.ts", "src/a/b/c.ts", true},
		{"src/**/*.ts", "src/a/b/c.js", false},
		{"**/*", "anything/at/all.txt", true},
		{"a/b/c", "a/b/c", true},
		{"a/b/c", "a/b/d", false},
	}

	for _, tt := range tests {
		got := GlobMatch(tt.pattern, tt.path)
		if got != tt.want {
			t.Errorf("GlobMatch(%q, %q) = %v, want %v", tt.pattern, tt.path, got, tt.want)
		}
	}
}

// ---------------------------------------------------------------------------
// Copy / Move
// ---------------------------------------------------------------------------

func TestCopy(t *testing.T) {
	dir := tmpDir(t)
	src := filepath.Join(dir, "src.txt")
	dst := filepath.Join(dir, "dst.txt")

	writeFile(t, src, "copy me")
	if err := Copy(src, dst); err != nil {
		t.Fatal(err)
	}

	r, _ := Read(dst, 0, 0)
	if r.Content != "copy me" {
		t.Fatalf("expected 'copy me', got '%s'", r.Content)
	}
}

func TestMove(t *testing.T) {
	dir := tmpDir(t)
	src := filepath.Join(dir, "src.txt")
	dst := filepath.Join(dir, "sub", "dst.txt")

	writeFile(t, src, "move me")
	if err := Move(src, dst); err != nil {
		t.Fatal(err)
	}

	e1, _ := Exists(src)
	if e1 {
		t.Fatal("expected src to be gone after move")
	}
	e2, _ := Exists(dst)
	if !e2 {
		t.Fatal("expected dst to exist after move")
	}
}

// ---------------------------------------------------------------------------
// Remove
// ---------------------------------------------------------------------------

func TestRemove(t *testing.T) {
	dir := tmpDir(t)
	p := filepath.Join(dir, "remove.txt")
	writeFile(t, p, "remove me")

	if err := Remove(p); err != nil {
		t.Fatal(err)
	}

	e, _ := Exists(p)
	if e {
		t.Fatal("expected file to be removed")
	}
}

// ---------------------------------------------------------------------------
// Binary / MIME detection
// ---------------------------------------------------------------------------

func TestBinaryDetection(t *testing.T) {
	dir := tmpDir(t)

	// Text file
	p := filepath.Join(dir, "text.txt")
	writeFile(t, p, "hello")
	r, _ := Read(p, 0, 0)
	if r.Binary {
		t.Fatal("expected text file to be non-binary")
	}
	if r.MIMEType != "text/plain" {
		t.Fatalf("expected text/plain, got %s", r.MIMEType)
	}
}

func TestPNGDetection(t *testing.T) {
	dir := tmpDir(t)
	p := filepath.Join(dir, "image.png")
	// PNG header \x89PNG\r\n\x1a\n followed by more data including null byte
	Write(p, []byte{0x89, 'P', 'N', 'G', '\r', '\n', 0x1a, '\n', 0})

	r, _ := Read(p, 0, 0)
	if !r.Binary {
		t.Fatal("expected PNG to be binary")
	}
	if r.MIMEType != "image/png" {
		t.Fatalf("expected image/png, got %s", r.MIMEType)
	}
}

func TestMIMEDetection(t *testing.T) {
	tests := []struct {
		ext  string
		mime string
	}{
		{".jpg", "image/jpeg"},
		{".jpeg", "image/jpeg"},
		{".gif", "image/gif"},
		{".pdf", "application/pdf"},
		{".webp", "image/webp"},
		{".svg", "image/svg+xml"},
		{".json", "application/json"},
		{".wasm", "application/wasm"},
	}

	for _, tt := range tests {
		got := detectMIME([]byte{0}, "file"+tt.ext)
		if got != tt.mime {
			t.Errorf("detectMIME(file%s) = %s, want %s", tt.ext, got, tt.mime)
		}
	}
}

// ---------------------------------------------------------------------------
// String helpers
// ---------------------------------------------------------------------------

func TestWriteString(t *testing.T) {
	dir := tmpDir(t)
	p := filepath.Join(dir, "string.txt")

	if err := WriteString(p, "string content"); err != nil {
		t.Fatal(err)
	}

	r, _ := Read(p, 0, 0)
	if r.Content != "string content" {
		t.Fatalf("expected 'string content', got '%s'", r.Content)
	}
}

func TestGlobUpIntegration(t *testing.T) {
	dir := tmpDir(t)
	sub := filepath.Join(dir, "deep", "path", "here")
	os.MkdirAll(sub, 0755)
	writeFile(t, filepath.Join(dir, "marker.txt"), "marker")

	results, err := GlobUp("*.txt", sub)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) == 0 {
		t.Fatal("expected at least one result from GlobUp")
	}
}
