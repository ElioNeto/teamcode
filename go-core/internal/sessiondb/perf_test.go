package sessiondb_test

import (
	"database/sql"
	"fmt"
	"testing"
	"time"

	"github.com/ElioNeto/teamcode/go-core/internal/ident"
	"github.com/ElioNeto/teamcode/go-core/internal/sessiondb"
)

const perfMessages = 50000
const perfPartsPerMessage = 5
const perfBudget = 5 * time.Second

func TestAllMessagesWithinBudget(t *testing.T) {
	if testing.Short() {
		t.Skip("perf test skipped with -short")
	}
	s := newStore(t)
	ses := create(t, s, sessiondb.CreateSessionInput{})
	err := s.DB().ExecWrite(ctx, func(tx *sql.Tx) error {
		for i := 0; i < perfMessages; i++ {
			msgID := ident.Message()
			data := fmt.Sprintf(`{"role":"user","agent":"a","model":{"providerID":"p","modelID":"m"},"time":{"created":%d}}`, 1000+i)
			if _, err := tx.Exec(`INSERT INTO message (id, session_id, time_created, time_updated, data) VALUES (?, ?, ?, ?, ?)`, msgID, ses.ID, 1000+i, 1000+i, data); err != nil {
				return err
			}
			for p := 0; p < perfPartsPerMessage; p++ {
				if _, err := tx.Exec(`INSERT INTO part (id, message_id, session_id, time_created, time_updated, data) VALUES (?, ?, ?, ?, ?, ?)`, ident.Part(), msgID, ses.ID, 1000+i, 1000+i, `{"type":"text","text":"x"}`); err != nil {
					return err
				}
			}
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	start := time.Now()
	all, err := s.AllMessages(ctx, ses.ID)
	elapsed := time.Since(start)
	if err != nil || len(all) != perfMessages || len(all[0].Parts) != perfPartsPerMessage {
		t.Fatalf("len=%d err=%v", len(all), err)
	}
	t.Logf("AllMessages(%d x %d parts) took %s", perfMessages, perfPartsPerMessage, elapsed)
	if elapsed > perfBudget {
		t.Fatalf("took %s, budget %s", elapsed, perfBudget)
	}
}
