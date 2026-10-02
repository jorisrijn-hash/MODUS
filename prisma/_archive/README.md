# Archived SQLite migration history

These are the Prisma migrations from when MODUS used SQLite locally. They
are kept for provenance and are **not** applied by anything.

Prisma locks a migration history to one datasource provider
(`migration_lock.toml`), so porting to Postgres requires a fresh history —
`prisma migrate dev` refuses to mix the two. The schema itself is
unchanged by that port; only the engine is.

The data from the SQLite database was exported before the switch
(`scripts/migration/export-sqlite.mjs`) and re-imported into Postgres
(`scripts/migration/import-postgres.mjs`). Nothing was dropped.
