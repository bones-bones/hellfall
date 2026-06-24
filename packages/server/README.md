# Hellfall Server

Unified backend: Discord OAuth (auth), WatchWolfWar (Firestore), tags, card data, and searches. Uses standard Node HTTP request/response, runs as a local server or on any Node serverless platform (Cloud Run, AWS Lambda, etc.).

## Endpoints

| Path                             | Method   | Description                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/api/discord/login`             | GET      | Redirects to Discord OAuth; after auth, Discord redirects to callback                                                                                                                                                                                                                                                                                             |
| `/api/discord/callback`          | GET      | Exchanges code for token, creates session cookie, redirects to frontend                                                                                                                                                                                                                                                                                           |
| `/api/me`                        | GET      | Returns current user from session cookie (or `{ user: null }`)                                                                                                                                                                                                                                                                                                    |
| `/api/logout`                    | GET/POST | Clears session cookie and redirects to `?redirect=` or `FRONTEND_URL`                                                                                                                                                                                                                                                                                             |
| `/api/tag`                       | GET      | Requires Discord auth + DATABASE_CONTRIBUTOR role; returns `{ ok: true }` if allowed to edit tags                                                                                                                                                                                                                                                                 |
| `/api/cards/load`                | GET      | Full card catalog as `{ data: HCCard[] }`. When `CATALOG_GCS_BUCKET` (or `CATALOG_PUBLIC_URL`) is set, responds **302** to the public catalog URL instead of serving the body. Otherwise: in-memory cache (default 24h), GCS/bundled JSON on miss, gzip when `Accept-Encoding: gzip`. `Cache-Control: public, 3 days` on direct responses; redirect cached 5 min. |
| `/api/cards/:cardId?format=json` | GET      | Card formatted as JSON                                                                                                                                                                                                                                                                                                                                            |
| `/api/cards/:cardId?format=text` | GET      | Card formatted as plaintext                                                                                                                                                                                                                                                                                                                                       |
| `/api/cards/:cardId/tags`        | GET      | Merged `tags` plus `added` / `removed` from Firestore `cards/{cardId}`. DB id defaults to `hellscube`.                                                                                                                                                                                                                                                            |
| `/api/cards/:cardId/tags`        | POST     | Add a tag (body: `{ tag: string }`). Updates overrides and merged `tags`. Requires auth + role.                                                                                                                                                                                                                                                                   |
| `/api/cards/:cardId/tags/:tag`   | DELETE   | Remove a tag. Updates overrides and merged `tags`. Requires auth + role.                                                                                                                                                                                                                                                                                          |
| `/api/cards/:cardId/tags/audit`  | GET      | Tag change history for the card (`?limit=50`, max 200). Requires auth + role.                                                                                                                                                                                                                                                                                     |
| `/api/cards/search?query`        | GET      | Search results. Optional `format`: `json`, `xml`, `cockatrice`, `draftmancer`, `tabletopsimulator`.                                                                                                                                                                                                                                                               |
| `/api/changesets`                | GET      | List changesets (`?status=`, `?cardId=`). Requires auth + admin or database contributor role.                                                                                                                                                                                                                                                                     |
| `/api/changesets`                | POST     | Submit a staged change (body: `{ cardId, changes, comment? }`). Requires auth + role.                                                                                                                                                                                                                                                                             |
| `/api/changesets/:id`            | GET      | Get one changeset. Requires auth + admin or database contributor role.                                                                                                                                                                                                                                                                                            |
| `/api/changesets/:id/accept`     | POST     | Admin accepts and applies a pending changeset (does not republish catalog).                                                                                                                                                                                                                                                                                       |
| `/api/changesets/:id/reject`     | POST     | Admin rejects a pending changeset.                                                                                                                                                                                                                                                                                                                                |
| `/api/admin/catalog/sync`        | POST     | Admin republishes full Firestore catalog to cache and GCS (when configured).                                                                                                                                                                                                                                                                                      |
| `/api/watchwolf`                 | GET      | Returns WatchWolfWar card standings from Firestore                                                                                                                                                                                                                                                                                                                |
| `/api/watchwolf`                 | POST     | Submit a win/lose (body: `{ WinId, LoseId }`)                                                                                                                                                                                                                                                                                                                     |
| `/api/admin/export-hellscube`    | GET      | Download full `hellscube` / `cards` collection as JSON (admin role required)                                                                                                                                                                                                                                                                                      |

## Setup

1. **Discord Application**

   - Go to [Discord Developer Portal](https://discord.com/developers/applications) → New Application.
   - OAuth2 → Redirects: add `https://<your-auth-host>/api/discord/callback`.
   - Copy Client ID and Client Secret.

2. **Environment variables** (create `.env` in `packages/server/`, or set in your host’s config)

   - `DISCORD_CLIENT_ID` – from Discord app
   - `DISCORD_CLIENT_SECRET` – from Discord app
   - `JWT_SECRET` – random string (e.g. `openssl rand -base64 32`)
   - `FRONTEND_URL` – where the React app lives (e.g. `https://user.github.io/hellfall`)
   - Optional: `AUTH_SERVER_URL` (defaults to `http://localhost:3003` when unset), `COOKIE_NAME`, `COOKIE_DOMAIN`, `JWT_ISSUER`
   - Optional: `CARDS_LOAD_API_URL` — if set, startup loads the catalog from `{CARDS_LOAD_API_URL}/api/cards/load` instead of Firestore. Do **not** point this at `AUTH_SERVER_URL`; the server reads Firestore directly by default.
   - **Card tags:** Firestore database **`hellscube`**, collection **`cards`**. Each doc has full card data plus `baseTags`, merged `tags`, and override arrays `added` / `removed`. Edits append to subcollection **`audit`** (`FIRESTORE_AUDIT_SUBCOLLECTION`) with `action`, `field`, `changes` (before/after), `username`, `userId`, and server timestamp.
   - After rebuilding `Hellscube-Database.json` (`yarn transform-hc`), run **`yarn migrate-hellscube-db`** — see [packages/scripts/README.md](../scripts/README.md).
   - WatchWolf: `GOOGLE_APPLICATION_CREDENTIALS` (path to service account JSON) for Firestore (local dev; Cloud Run uses the service identity)
   - **Catalog snapshot:** `/api/cards/load` reads bundled JSON or GCS — not Firestore on cache miss. Optional `CATALOG_GCS_BUCKET`: `POST /api/admin/catalog/sync` (or postcard ingest) uploads gzip-compressed `catalog.json` (`Content-Encoding: gzip`) + `catalog-manifest.json`. When the bucket (or optional `CATALOG_PUBLIC_URL`) is configured, `/api/cards/load` **302-redirects** non-browser clients (no `Origin` header) to the public catalog URL; browser `fetch` must use `CARD_CATALOG_URL` (direct GCS URL) because cross-origin redirect chains drop `Origin` and break GCS CORS. Apply [misc/cors.json](../../misc/cors.json) to the bucket. Cloud Run SA needs `storage.objectAdmin` (publish) and `objectViewer` (read). `CATALOG_PUBLISH_DEBOUNCE_MS` defaults to 30000; `CATALOG_CACHE_TTL_MS` defaults to 86400000 (24h).

## Running the server

From the **monorepo root**:

```bash
yarn server:dev      # watch mode
yarn server:start    # production
yarn workspace @hellfall/server <script>  # any package script
```

Or from `packages/server/`:

```bash
cd packages/server
cp .env.example .env
# Edit .env with real values; set FRONTEND_URL to where your React app runs (e.g. http://localhost:3003/hellfall)
yarn install
yarn dev
```

The server listens on port 3003 (or `PORT` if set). In the main app, set `REACT_APP_AUTH_API_URL` to `http://localhost:3003` so “Login with Discord” and `/api/me` hit this server.

For production: run `yarn start` or deploy the `src/api/` handlers to your preferred serverless platform.

## Docker & Google Cloud Run

The server can be run in Docker and deployed to Google Cloud Run (see [google-cloud-setup.example.md](./google-cloud-setup.example.md)). Copy that file to `google-cloud-setup.md` (gitignored) for your own project-specific notes.

- Build image: `docker build -t hellfall-server ./packages/server` (from repo root).
- GitHub Actions: run **Manual Deploy Server (Cloud Run)** (`.github/workflows/deploy-auth-cloud-run.yml`) from the Actions tab; configure repo variables and `GCP_CLOUD_RUN_AUTH_SERVICE_ACCOUNT_JSON` — see [google-cloud-setup.example.md](./google-cloud-setup.example.md).

## Frontend usage

- **Login:** Link or redirect user to `{AUTH_SERVER_URL}/api/discord/login`.
- **After login:** Callback redirects to `FRONTEND_URL?auth=ok` (or `?auth=error`). Your app can read `auth` from the URL and show success/error.
- **Current user:** `fetch(`${AUTH_SERVER_URL}/api/me`, { credentials: 'include' })` → `{ user: { id, username, avatar, email } }` or `{ user: null }`.
- **Logout:** Navigate or `fetch` `{AUTH_SERVER_URL}/api/logout` (with credentials) or open in same tab; user is redirected after cookie is cleared.

Session cookie is `HttpOnly`, `SameSite=Lax`, and set on the auth server’s domain; the browser sends it only when the frontend calls the auth server with `credentials: 'include'`. CORS allows `FRONTEND_URL`’s origin, fixed production origins for skeleton.club (`hellfall` + `api`), and reflected localhost HTTP origins for local dev (see `src/api/lib/cors.ts`).
