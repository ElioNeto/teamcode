package ident

import (
	"encoding/json"
	"os"
	"sort"
	"strings"
	"testing"
)

type fixtureRow struct {
	ID        string `json:"id"`
	Prefix    string `json:"prefix"`
	Direction string `json:"direction"`
	Timestamp int64  `json:"timestamp"`
}

func loadFixture(t *testing.T) []fixtureRow {
	t.Helper()
	body, err := os.ReadFile("testdata/ids-from-ts.json")
	if err != nil {
		t.Fatal(err)
	}
	var rows []fixtureRow
	if err := json.Unmarshal(body, &rows); err != nil {
		t.Fatal(err)
	}
	return rows
}

func TestFormat(t *testing.T) {
	id := NewAt(PrefixMessage, false, 1757419200000)
	if !strings.HasPrefix(id, "msg_") || len(id) != len("msg_")+26 {
		t.Fatalf("bad id %q", id)
	}
	for _, c := range id[4:16] {
		if !strings.ContainsRune("0123456789abcdef", c) {
			t.Fatalf("non-hex time part in %q", id)
		}
	}
}

func TestTimestampMatchesTS(t *testing.T) {
	for _, row := range loadFixture(t) {
		if row.Direction != "ascending" {
			continue
		}
		got, err := Timestamp(row.ID)
		if err != nil {
			t.Fatal(err)
		}
		if got != row.Timestamp {
			t.Fatalf("%s: got %d want %d", row.ID, got, row.Timestamp)
		}
	}
}

func TestOrderingMatchesTS(t *testing.T) {
	byPrefix := map[string][]fixtureRow{}
	for _, row := range loadFixture(t) {
		byPrefix[row.Prefix] = append(byPrefix[row.Prefix], row)
	}
	for prefix, rows := range byPrefix {
		sorted := append([]fixtureRow(nil), rows...)
		sort.Slice(sorted, func(i, j int) bool { return sorted[i].ID < sorted[j].ID })
		for i := 1; i < len(sorted); i++ {
			prev, cur := sorted[i-1].Timestamp, sorted[i].Timestamp
			if rows[0].Direction == "descending" && prev < cur {
				t.Fatalf("%s: descending ids not reverse chronological", prefix)
			}
			if rows[0].Direction == "ascending" && prev > cur {
				t.Fatalf("%s: ascending ids not chronological", prefix)
			}
		}
	}
}

func TestGoIdsInterleaveWithTSIds(t *testing.T) {
	rows := loadFixture(t)
	var ts []string
	for _, row := range rows {
		if row.Prefix == "msg" {
			ts = append(ts, row.ID)
		}
	}
	mid := rows[len(rows)/2]
	goID := NewAt(PrefixMessage, false, mid.Timestamp+1)
	all := append(append([]string(nil), ts...), goID)
	sort.Strings(all)
	idx := sort.SearchStrings(all, goID)
	before, _ := Timestamp(all[idx-1])
	after, _ := Timestamp(all[idx+1])
	if before > mid.Timestamp+1 || after < mid.Timestamp+1 {
		t.Fatalf("go id %s sorted between %d and %d", goID, before, after)
	}
}

func TestSessionIsDescending(t *testing.T) {
	a := NewAt(PrefixSession, true, 1000)
	b := NewAt(PrefixSession, true, 2000)
	if b >= a {
		t.Fatalf("newer session id %s should sort before older %s", b, a)
	}
}

func TestCounterKeepsSameMillisecondOrdered(t *testing.T) {
	a := NewAt(PrefixMessage, false, 5000)
	b := NewAt(PrefixMessage, false, 5000)
	if a >= b {
		t.Fatalf("%s should sort before %s", a, b)
	}
}
