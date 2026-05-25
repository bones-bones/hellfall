# Hellscube JSON → Firestore migration checklist

Canonical docs: [packages/scripts/README.md](packages/scripts/README.md)

## Firebase / GCP

- [ ] Open [Firebase Console](https://console.firebase.google.com/) → your project → **Firestore Database**
- [ ] Create database **`hellscube`** (Native mode)
- [ ] Create or reuse a **service account** with Firestore read/write on `hellscube`
- [ ] Download service account JSON key (keep out of git; `.gitignore` should cover it)

## Local env

- [ ] Copy `packages/scripts/.env.example` → `packages/scripts/.env`
- [ ] Set `GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account.json`
- [ ] Optional overrides (defaults are fine):
  - [ ] `FIRESTORE_DATABASE_ID=hellscube`
  - [ ] `FIRESTORE_CARDS_COLLECTION=cards`
  - [ ] `FIRESTORE_AUDIT_SUBCOLLECTION=audit`

## Rebuild JSON (when sheet changed)

- [ ] `yarn transform-hc` → updates `packages/shared/src/data/Hellscube-Database.json`

## Migrate (from repo root)

- [ ] `yarn migrate-hellscube-db --report` — stats only, no writes
- [ ] `yarn migrate-hellscube-db --dry-run` — preview
- [ ] `yarn migrate-hellscube-db --limit 10` — small test (optional)
- [ ] `yarn migrate-hellscube-db` — full migration (~9.5k cards)
- [ ] `yarn migrate-hellscube-db --prune-orphans` — delete docs not in JSON (optional)

## Verify in Firebase Console

- [ ] `hellscube` → `cards` → open a sample doc
- [ ] Doc has full card fields from JSON
- [ ] Tag fields: `baseTags`, `tags`, `added`, `removed`

## Ongoing schedule

After each sheet export:

```bash
yarn transform-hc
yarn migrate-hellscube-db --dry-run   # optional
yarn migrate-hellscube-db
```

## Not covered by this checklist

- **Contributor edits** use staged **changesets** (`/api/changesets`) and admin **/review** — not the bulk migrate script.
- **WatchWolf** uses a separate Firestore DB (`watch-wolf-war`).
