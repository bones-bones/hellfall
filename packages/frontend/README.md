# Welcome to the UI of hellfall!

Some interesting parts include...

## Cube Resources

This page hosts descriptions and things needed to play cubes. Cockatrice, Draftmancer, MPC autofill, etc.

## Deck Builder

A kind of janky text box for users to put decklists in, then export files for TTS, etc

## Draft

To be deleted

## Hellfall

Probably deserves it's own readme. The search code. Heavily based off of Scryfall at this point.

### Server-backed search

Set both env vars (webpack injects all `REACT_APP_*` into the browser bundle):

- `REACT_APP_SERVER_SEARCH=1` — enable server search on `/`
- `REACT_APP_AUTH_API_URL` — auth/API base (e.g. `http://localhost:3003`)

When both are set, HellFall queries `${REACT_APP_AUTH_API_URL}/api/cards/search` with `limit`/`offset`/`exclude=offensive` and does **not** download the full catalog on home load. Card deep links (`/card/...`) use `GET /api/cards/hcid/:hcid`, Random uses `GET /api/cards/random`, and related prints use `GET /api/cards/:cardId/prints` — so those flows also skip the catalog. Tool routes (draft, cube, set list, etc.) still load the catalog lazily on first `cardsAtom` read. If the flag is on but the auth URL is empty, search falls back to the client catalog path.

### Production cutover (GitHub Actions + egress)

Flip via repo **Settings → Secrets and variables → Actions → Variables** (no hardcoded flags in workflows):

1. Set **`REACT_APP_SERVER_SEARCH=1`** so CI and Manual Deploy Hellfall bake server search into the bundle.
2. Confirm **`REACT_APP_AUTH_API_URL`** is the production Cloud Run auth/API base (same origin/cookies as today).
3. Deploy (merge + CI build, or **Manual Deploy Hellfall**). In the browser DevTools **Network** tab on `/`, confirm there is **no** request to `storage.googleapis.com/.../catalog.json` (search should hit `/api/cards/search` on the auth host).
4. After that looks good, **clear or stop setting** `CARD_CATALOG_URL` so tool routes that still read `cardsAtom` fall back to `${REACT_APP_AUTH_API_URL}/api/cards/load` instead of public GCS (tool traffic is rare). Optionally keep `CARD_CATALOG_URL` set only if you want tools to keep pulling GCS directly.
5. In GCP **Cloud Storage → hellscube-images → Metrics**, confirm **egress** on `catalog.json` drops for normal browse (GCS publish path and bucket ACLs stay as-is; server still syncs snapshots for `/api/cards/load` and non-browser clients).
