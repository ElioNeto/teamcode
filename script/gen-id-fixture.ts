import { create, timestamp } from "../packages/teamcode/src/id/id"
import { writeFileSync } from "fs"

type Row = {
  id: string
  prefix: string
  direction: "ascending" | "descending"
  timestamp: number
  decoded: number | null
}

const rows: Row[] = []
const base = Date.UTC(2026, 8, 9, 12, 0, 0)
for (let i = 0; i < 200; i++) {
  const t = base + i * 37
  rows.push({ id: create("ses", "descending", t), prefix: "ses", direction: "descending", timestamp: t, decoded: null })
  rows.push({ id: create("msg", "ascending", t), prefix: "msg", direction: "ascending", timestamp: t, decoded: null })
  rows.push({ id: create("prt", "ascending", t), prefix: "prt", direction: "ascending", timestamp: t, decoded: null })
  rows.push({ id: create("evt", "ascending", t), prefix: "evt", direction: "ascending", timestamp: t, decoded: null })
}
for (const row of rows) {
  if (row.direction === "ascending") row.decoded = timestamp(row.id)
}
const out = process.argv[2] ?? "go-core/internal/ident/testdata/ids-from-ts.json"
writeFileSync(out, JSON.stringify(rows, null, 2) + "\n")
console.log(`${rows.length} ids written to ${out}`)
