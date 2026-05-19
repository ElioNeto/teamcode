import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"

export function init(path: string) {
  const sqlite = new Database(path)
  const db = drizzle({ client: sqlite })
  return db
}
