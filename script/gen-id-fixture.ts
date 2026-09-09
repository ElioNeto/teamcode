import { create, timestamp } from "../packages/teamcode/src/id/id"
import { writeFileSync } from "fs"

type Row = { id: string; prefix: string; direction: "ascending" | "descending"; timestamp: number }

const rows: Row[] = []
const base = 1_000_000_000
for (let i = 0; i < 200; i++) {
  const t = base + i * 37
  rows.push({ id: create("ses", "descending", t), prefix: "ses", direction: "descending", timestamp: t })
  rows.push({ id: create("msg", "ascending", t), prefix: "msg", direction: "ascending", timestamp: t })
  rows.push({ id: create("prt", "ascending", t), prefix: "prt", direction: "ascending", timestamp: t })
  rows.push({ id: create("evt", "ascending", t), prefix: "evt", direction: "ascending", timestamp: t })
}
for (const row of rows.filter((r) => r.direction === "ascending")) {
  if (timestamp(row.id) !== row.timestamp) throw new Error(`timestamp mismatch for ${row.id}`)
}
const out = process.argv[2] ?? "go-core/internal/ident/testdata/ids-from-ts.json"
writeFileSync(out, JSON.stringify(rows, null, 2) + "\n")
console.log(`${rows.length} ids written to ${out}`)
