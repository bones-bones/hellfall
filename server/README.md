# Hellfall Server

Unified backend: Discord OAuth (auth), WatchWolfWar (Firestore), and tags. Uses standard Node HTTP request/response, runs as a local server or on any Node serverless platform (Cloud Run, AWS Lambda, etc.).

## Endpoints

| Path | Method | Description |
|------|--------|-------------|
| `/api/discord/login` | GET | Redirects to Discord OAuth; after auth, Discord redirects to callback |
| `/api/discord/callback` | GET | Exchanges code for token, creates session cookie, redirects to frontend |
| `/api/me` | GET | Returns current user from session cookie (or `{ user: null }`) |
| `/api/logout` | GET/POST | Clears session cookie and redirects to `?redirect=` or `FRONTEND_URL` |
| `/api/tag` | GET | Requires Discord auth + DATABASE_CONTRIBUTOR role; returns `{ ok: true }` if allowed to edit tags |
| `/api/cards/:cardId/tags` | GET | Tag overrides for a card (added/removed). Requires auth + role. Uses Firestore default DB, collection `card_tags`. |
| `/api/cards/:cardId/tags` | POST | Add a tag (body: `{ tag: string }`). Requires auth + role. |
| `/api/cards/:cardId/tags/:tag` | DELETE | Remove a tag. Requires auth + role. |
| `/api/watchwolf` | GET | Returns WatchWolfWar card standings from Firestore |
| `/api/watchwolf` | POST | Submit a win/lose (body: `{ WinId, LoseId }`) |

## Setup

1. **Discord Application**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications) → New Application.
   - OAuth2 → Redirects: add `https://<your-auth-host>/api/discord/callback`.
   - Copy Client ID and Client Secret.

2. **Environment variables** (create `.env` in `server/`, or set in your host’s config)

   - `DISCORD_CLIENT_ID` – from Discord app
   - `DISCORD_CLIENT_SECRET` – from Discord app
   - `JWT_SECRET` – random string (e.g. `openssl rand -base64 32`)
   - `FRONTEND_URL` – where the React app lives (e.g. `https://user.github.io/hellfall`)
   - Optional: `AUTH_SERVER_URL` (defaults to `http://localhost:3003` when unset), `COOKIE_NAME`, `COOKIE_DOMAIN`, `JWT_ISSUER`
   - **Card tags:** Uses the **default** Firestore database (not the WatchWolf named DB). Ensure Firestore is enabled and the default database exists. Collection: `card_tags`, document ID = card ID, fields: `added` (string[]), `removed` (string[]).
   - WatchWolf: `GOOGLE_APPLICATION_CREDENTIALS` (path to service account JSON) for Firestore

## Running the server

From the **monorepo root**:

```bash
yarn server:dev      # watch mode
yarn server:start    # production
yarn workspace hellfall-server <script>  # any package script
```

Or from `server/`:

```bash
cd server
cp .env.example .env
# Edit .env with real values; set FRONTEND_URL to where your React app runs (e.g. http://localhost:3003/hellfall)
yarn install
yarn dev
```

The server listens on port 3003 (or `PORT` if set). In the main app, set `REACT_APP_AUTH_API_URL` to `http://localhost:3003` so “Login with Discord” and `/api/me` hit this server.

For production: run `yarn start` or deploy the `api/` handlers to your preferred serverless platform.

## Docker & Google Cloud Run

The server can be run in Docker and deployed to Google Cloud Run (see [google-cloud-setup.example.md](./google-cloud-setup.example.md)). Copy that file to `google-cloud-setup.md` (gitignored) for your own project-specific notes.

- Build image: `docker build -t hellfall-server ./server` (from repo root).
- GitHub Actions: pushes to `main` that change `server/` trigger a deploy to Cloud Run when `GCP_PROJECT_ID` and `GCP_SA_KEY` are set in repo secrets.

## Frontend usage

- **Login:** Link or redirect user to `{AUTH_SERVER_URL}/api/discord/login`.
- **After login:** Callback redirects to `FRONTEND_URL?auth=ok` (or `?auth=error`). Your app can read `auth` from the URL and show success/error.
- **Current user:** `fetch(`${AUTH_SERVER_URL}/api/me`, { credentials: 'include' })` → `{ user: { id, username, avatar, email } }` or `{ user: null }`.
- **Logout:** Navigate or `fetch` `{AUTH_SERVER_URL}/api/logout` (with credentials) or open in same tab; user is redirected after cookie is cleared.

Session cookie is `HttpOnly`, `SameSite=Lax`, and set on the auth server’s domain; the browser sends it only when the frontend calls the auth server with `credentials: 'include'`. CORS is set to allow `FRONTEND_URL`’s origin with credentials.
