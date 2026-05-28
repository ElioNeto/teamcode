---
description: "Generate a new Drizzle ORM database migration from schema changes"
---

Generate a new database migration from the current schema changes.

## Steps

1. Ensure you have made the desired schema changes in `.sql.ts` files
2. Run the migration generation command:
   ```bash
   cd packages/teamcode && bun run db generate --name $ARGUMENTS
   ```
3. Verify the generated migration SQL in `packages/teamcode/migration/<timestamp>_<name>/migration.sql`
4. Run typecheck to ensure everything compiles:
   ```bash
   cd packages/teamcode && bun run typecheck
   ```

The first argument should be a short, descriptive slug for the migration (e.g., `add-user-preferences-table`).

Note: Each migration creates a standalone folder with `migration.sql` and `snapshot.json` — no `_journal.json`.
