package ident

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"strconv"
	"strings"
	"sync"
	"time"
)

const (
	PrefixSession = "ses"
	PrefixMessage = "msg"
	PrefixPart    = "prt"
	PrefixEvent   = "evt"
)

const randomLength = 14
const base62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

var mu sync.Mutex
var lastMs int64
var counter uint64

func nextValue(unixMs int64) uint64 {
	mu.Lock()
	defer mu.Unlock()
	if unixMs != lastMs {
		lastMs = unixMs
		counter = 0
	}
	counter++
	return uint64(unixMs)*0x1000 + counter
}

func randomBase62() string {
	buf := make([]byte, randomLength)
	if _, err := rand.Read(buf); err != nil {
		panic(err)
	}
	out := make([]byte, randomLength)
	for i, b := range buf {
		out[i] = base62[int(b)%62]
	}
	return string(out)
}

func NewAt(prefix string, descending bool, unixMs int64) string {
	value := nextValue(unixMs)
	if descending {
		value = ^value
	}
	timeBytes := make([]byte, 6)
	for i := 0; i < 6; i++ {
		timeBytes[i] = byte(value >> (40 - 8*uint(i)))
	}
	return prefix + "_" + hex.EncodeToString(timeBytes) + randomBase62()
}

func now() int64 { return time.Now().UnixMilli() }

func Session() string { return NewAt(PrefixSession, true, now()) }
func Message() string { return NewAt(PrefixMessage, false, now()) }
func Part() string    { return NewAt(PrefixPart, false, now()) }
func Event() string   { return NewAt(PrefixEvent, false, now()) }

func HasPrefix(id, prefix string) bool { return strings.HasPrefix(id, prefix+"_") }

func Timestamp(id string) (int64, error) {
	underscore := strings.IndexByte(id, '_')
	if underscore < 0 || len(id) < underscore+13 {
		return 0, errors.New("malformed id")
	}
	value, err := strconv.ParseUint(id[underscore+1:underscore+13], 16, 64)
	if err != nil {
		return 0, err
	}
	return int64(value / 0x1000), nil
}
