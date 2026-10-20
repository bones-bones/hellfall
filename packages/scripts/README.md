# Hellscube database migration (JSON → Firestore)

Uploads `Hellscube-Database.json` into Firestore `hellscube` / `cards/{cardId}`.

**Checklist:** [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md)

Each document is the full card object from JSON, plus tag-merge fields that preserve contributor overrides across re-runs.

## What gets written

Each `cards/{cardId}` document contains:

| Field              | Source                                                          |
| ------------------ | --------------------------------------------------------------- |
| All card fields    | `Hellscube-Database.json`                                       |
| `baseTags`         | JSON `tags` at migrate time (canonical base for future merges)  |
| `tags`             | `merge(baseTags, { added, removed })`                           |
| `added`, `removed` | Preserved from the existing Firestore doc (empty arrays if new) |

Re-running migrate refreshes card fields and `baseTags` from JSON, then recomputes `tags` from `baseTags` + existing overrides (`@hellfall/shared/cardTags/cardTagMerge`).

The tag API (`cardTags.ts`) updates `added` / `removed` and keeps `tags` in sync; `baseTags` is left unchanged until the next migrate.

## Edit audit

All card edits append an immutable row to:

`cards/{cardId}/audit/{autoId}`

Each entry includes:

- `at` — server timestamp
- `username` — guild nick if set, else Discord username from session
- `userId` — Discord snowflake
- `action` — `tag_add` | `tag_remove` | `field_edit`
- `field` — which field changed (e.g. `tags`, `oracle_text`)
- `tag` — tag string (for tag actions; null for field edits)
- `changes` — `{ before, after }` snapshots

Read history: `GET /api/cards/:cardId/tags/audit?limit=50` (same auth as tag edits).

Bulk migrate does not write per-card audit rows (use Firestore/console logs for migrate runs).

## Prerequisites

1. **Rebuild JSON** when the sheet changed:

   ```bash
   yarn transform-hc
   ```

2. **Create a Firestore database** in your Firebase/GCP project (Native mode):

   - Database ID: `hellscube`
   - Collection (`cards`) is auto-created on first document write.

3. **Service account** with Firestore read/write access.

4. **`packages/scripts/.env`** (copy from `.env.example`):

   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account.json
   # optional (defaults shown):
   # FIRESTORE_DATABASE_ID=hellscube
   # FIRESTORE_CARDS_COLLECTION=cards
   ```

## Run

From the repo root:

```bash
# Stats only
yarn migrate-hellscube-db --report

# Preview
yarn migrate-hellscube-db --dry-run

# Full migration (~9.5k cards)
yarn migrate-hellscube-db

# Remove Firestore docs whose id is no longer in the JSON
yarn migrate-hellscube-db --prune-orphans
```

Test on a subset:

```bash
yarn migrate-hellscube-db --limit 10 --dry-run
yarn migrate-hellscube-db --limit 10
```

## Regular schedule

After each database export from sheets:

```bash
yarn transform-hc
yarn migrate-hellscube-db --dry-run   # optional
yarn migrate-hellscube-db
```

Run on a machine or CI job with `GOOGLE_APPLICATION_CREDENTIALS` set.

## Flags

| Flag               | Description                                      |
| ------------------ | ------------------------------------------------ |
| `--report`         | Counts only, no Firestore writes                 |
| `--dry-run`        | Summary without writing                          |
| `--prune-orphans`  | Delete `cards/{id}` docs not present in the JSON |
| `--db-path <path>` | Alternate JSON path                              |
| `--limit <n>`      | Migrate only the first _n_ cards                 |

## Notes

- **Not** the WatchWolf database (`watch-wolf-war`); only `hellscube` / `cards`.
- Firestore document size limit is 1 MiB per doc; Hellscube cards are well below that.
- The frontend still loads cards from bundled JSON today; this script populates Firestore as the shared store.

## Export Firestore snapshot

Download the `cards` collection as stored in Firestore (faithful backup; not the bundled JSON file).

From repo root:

```bash
yarn export-hellscube-db
yarn export-hellscube-db --out ./backup.json
```

Output shape:

```json
{
  "exportedAt": "...",
  "databaseId": "hellscube",
  "collection": "cards",
  "data": [{ "_docId": "6727", "id": "6727", ... }]
}
```

- `_docId` is the Firestore document ID (e.g. `token-<CN>` for tokens).
- Fields match what migrate wrote, including `baseTags`, `added`, `removed`, merged `tags`.

**Admin API:** `GET /api/admin/export-hellscube` (session cookie + `DISCORD_ADMIN_ROLE_ID`). Returns the same JSON as a download attachment.

## Legacy tag field migration

If Firestore docs still use the old `baseTags` / `added` / `removed` shape, run:

```bash
# Count affected docs
yarn migrate-firestore-tags --report

# Preview
yarn migrate-firestore-tags --dry-run

# Small test
yarn migrate-firestore-tags --limit 10

# Full migration
yarn migrate-firestore-tags
```

Each matching doc gets `base_tags = merge(baseTags, { added, removed })` and the legacy fields are deleted.

## Implementation

Script: `src/migrate-hellscube-db.ts`, `src/migrate-firestore-tags.ts`, `src/export-hellscube-db.ts`  
Shared export: `src/lib/exportCards.ts`  
Tag API + audit: `packages/server/src/api/cardTags.ts`, `packages/server/src/lib/cardAudit.ts`
