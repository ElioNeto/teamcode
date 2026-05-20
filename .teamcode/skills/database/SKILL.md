---
name: database
description: Work with Drizzle ORM, SQLite schema definitions, and database migrations in this monorepo. Use when creating or modifying database tables, indexes, or migration files.
---

# Database

This project uses **Drizzle ORM** with SQLite (`better-sqlite3`).

## Schema Definition

Schema files use the `.sql.ts` extension and snake_case naming:

```ts
// packages/teamcode/src/feature/schema.sql.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const MyTable = sqliteTable("my_table", {
  id: text().primaryKey(),
  name: text().notNull(),
  created_at: integer().notNull(),
})
```

### Naming Rules

- Tables: snake_case, singular (e.g., `session`, `project_config`)
- Columns: snake_case (e.g., `project_id`, `created_at`)
- Join columns: `<entity>_id` (e.g., `session_id`, `user_id`)
- Indexes: `<table>_<column>_idx` (e.g., `session_project_id_idx`)

## Migration Workflow

```bash
# Generate migration from schema changes
cd packages/teamcode && bun run db generate --name <descriptive-slug>

# Output structure:
# migration/<timestamp>_<slug>/
#   migration.sql
#   snapshot.json
```

No `_journal.json` file — each migration is a standalone folder.

## Key Schema Files

| Table | File |
|-------|------|
| Session | `packages/teamcode/src/session/session.sql.ts` |
| Project | `packages/teamcode/src/project/project.sql.ts` |
| Config | `packages/teamcode/src/config/config.sql.ts` |

## Guidelines

- Read existing `.sql.ts` files before modifying to understand current schema
- Never edit migration files after they're created (create a new migration instead)
- Drizzle Kit config is at `packages/teamcode/drizzle.config.ts`
- Run `bun run typecheck` after schema changes to catch type errors
