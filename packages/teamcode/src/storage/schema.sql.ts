import { integer } from "drizzle-orm/sqlite-core"

export const Timestamps = {
  time_created: integer()
    .notNull()
    .$default(() => Date.now()),
  // time_updated is set explicitly by application code (session projectors, etc.)
  // to avoid bulk-updating all session timestamps during startup reindexing.
  time_updated: integer()
    .notNull()
    .$default(() => Date.now()),
}
