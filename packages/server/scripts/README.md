# Hellscube database migration (JSON → Firestore)

Uploads the **entire** `Hellscube-Database.json` into Firestore `hellscube` / `cards/{cardId}`, merging contributor tag overrides into each card’s `tags` field.

## What gets written

Each document is the full card object from JSON (name, oracle_text, image, legalities, etc.), plus:

| Field | Source |
|-------|--------|
| All card fields | `Hellscube-Database.json` |
| `baseTags` | JSON `tags` at migrate time (canonical base for future merges) |
| `tags` | `merge(baseTags, { added, removed })` |
| `added`, `removed` | Preserved from the existing Firestore doc (empty arrays if new) |

Re-running migrate refreshes card fields and `baseTags` from JSON, then recomputes `tags` from `baseTags` + existing overrides (`packages/server/src/lib/cardTagMerge.ts`).

The tag API (`cardTags.ts`) updates `added` / `removed` and keeps `tags` in sync; `baseTags` is left unchanged until the next migrate.

## Tag change audit

Contributor tag edits (POST/DELETE) append an immutable row to:

`cards/{cardId}/tag_audit/{autoId}`

Each entry includes:

- `at` — server timestamp
- `username` — guild nick if set, else Discord username from session
- `userId` — Discord snowflake
- `action` — `tag_add` | `tag_remove`
- `tag` — tag string affected
- `before` / `after` — snapshots of `tags`, `added`, `removed`, `baseTags`

Read history: `GET /api/cards/:cardId/tags/audit?limit=50` (same auth as tag edits).

Bulk migrate does not write per-card audit rows (use Firestore/console logs for migrate runs).

## Prerequisites

1. **Rebuild JSON** when the sheet changed:

   ```bash
   yarn transform-hc
   ```

2. **Service account** with Firestore write access to the `hellscube` database.

3. **`packages/server/.env`**:

   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account.json
   # optional:
   # FIRESTORE_HELLSCUBE_DATABASE_ID=hellscube
   # FIRESTORE_CARDS_COLLECTION=cards
   # FIRESTORE_TAG_AUDIT_SUBCOLLECTION=tag_audit
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

| Flag | Description |
|------|-------------|
| `--report` | Counts only, no Firestore writes |
| `--dry-run` | Summary without writing |
| `--prune-orphans` | Delete `cards/{id}` docs not present in the JSON |
| `--db-path <path>` | Alternate JSON path |
| `--limit <n>` | Migrate only the first *n* cards |

## Notes

- **Not** the WatchWolf database (`watch-wolf-war`); only `hellscube` / `cards`.
- Firestore document size limit is 1 MiB per doc; Hellscube cards are well below that.
- The frontend still loads cards from bundled JSON today; this script populates Firestore as the shared store. Pointing the app at Firestore for card data is a separate change if you want runtime reads from there.

## Implementation

Script: `migrate-hellscube-db.ts`  
Tag API + audit: `packages/server/src/api/cardTags.ts`, `packages/server/src/lib/cardTagAudit.ts`
