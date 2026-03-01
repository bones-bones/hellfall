# Google Cloud Run – Setup (local reference only, do not commit secrets here)

Use this as a checklist. Store real secrets in Google Secret Manager or GitHub Secrets, not in this file.

**To use:** copy this file to `google-cloud-setup.md` (that file is gitignored so you can add project-specific notes without committing them).

---

## 1. Google Cloud project

1. Create or select a project: [Google Cloud Console](https://console.cloud.google.com/) → Select/Create project.
2. Enable APIs:
   - **Cloud Run**
   - **Artifact Registry** (for container images)
   - **Secret Manager** (optional, for env vars)
   - **Cloud Build** (if using Cloud Build to build images)

```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com cloudbuild.googleapis.com
```

3. Create an Artifact Registry repo for the server image:

```bash
gcloud artifacts repositories create hellfall-server --repository-format=docker --location=REGION
```

Use the same `REGION` you use for Cloud Run (e.g. `us-central1`).

---

## 2. Service account for Cloud Run

1. Create a service account (or reuse one) with access to Firestore and any secrets:

```bash
gcloud iam service-accounts create hellfall-server \
  --display-name="Hellfall Server"
```

2. Grant Firestore access (adjust for your project and database):

   - In Console: IAM → find the service account → add role **Cloud Datastore User** (or **Firebase** roles if you use Firebase).
   - Or: ensure the default Compute service account has Firestore access if that's what you use.

3. For Secret Manager (optional): grant **Secret Manager Secret Accessor** to the Cloud Run service account.

---

## 3. Secrets and environment variables

Do **not** put real values in this file. Use one of:

- **GitHub Secrets** (recommended for CI): add `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `JWT_SECRET`, `FRONTEND_URL`, etc. in repo **Settings → Secrets and variables → Actions**.
- **Google Secret Manager**: create secrets, then in Cloud Run → Edit & deploy → Variables & secrets → Reference secrets.

Required for the server:

- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `JWT_SECRET` (e.g. `openssl rand -base64 32`)
- `FRONTEND_URL` (e.g. `https://your-username.github.io/hellfall`)
- `AUTH_SERVER_URL` (your Cloud Run URL after first deploy, e.g. `https://hellfall-server-xxxx.run.app`)
- For WatchWolf/Firestore: use Workload Identity (no key file in production) or set `GOOGLE_APPLICATION_CREDENTIALS` only in local dev.

Discord OAuth redirect URL must be:

`https://<your-cloud-run-url>/api/discord/callback`

(Set this in Discord Developer Portal → OAuth2 → Redirects.)

---

## 4. Build and deploy (manual, one-off)

From repo root:

```bash
cd server
docker build -t REGION-docker.pkg.dev/PROJECT_ID/hellfall-server/hellfall-server:latest .
docker push REGION-docker.pkg.dev/PROJECT_ID/hellfall-server/hellfall-server:latest
gcloud run deploy hellfall-server \
  --image REGION-docker.pkg.dev/PROJECT_ID/hellfall-server/hellfall-server:latest \
  --region REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "FRONTEND_URL=https://...."
```

Or use Cloud Build from repo root:

```bash
gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT_ID/hellfall-server/hellfall-server:latest ./server
gcloud run deploy hellfall-server --image REGION-docker.pkg.dev/PROJECT_ID/hellfall-server/hellfall-server:latest --region REGION --platform managed --allow-unauthenticated
```

Replace `REGION` (e.g. `us-central1`) and `PROJECT_ID` with your values.

---

## 5. GitHub Actions (deploy on push)

The workflow in `.github/workflows/deploy-server-cloudrun.yml` uses:

- **GitHub Secrets** (add in repo Settings → Secrets and variables → Actions):
  - `GCP_PROJECT_ID` – Google Cloud project ID
  - `GCP_SA_KEY` or `GCP_WORKLOAD_IDENTITY_PROVIDER` – for authentication (see below)
  - Optional: `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `JWT_SECRET`, `FRONTEND_URL` if you want the workflow to set env vars (otherwise configure them in Cloud Run console).

**Option A – Service account key (simplest):**

1. Create a key for a service account that can push to Artifact Registry and deploy to Cloud Run:
   - IAM: **Cloud Run Admin**, **Service Account User**, **Artifact Registry Writer** (or **Storage Admin** if using GCR).
2. Download JSON key, paste entire contents into a GitHub secret named `GCP_SA_KEY`.

**Option B – Workload Identity Federation (no key file):**

1. In GCP: IAM → Workload identity federation → add provider for GitHub (e.g. `github-provider`).
2. Map your repo to a GCP service account that has Cloud Run Admin + Artifact Registry Writer.
3. In GitHub Secrets, set `GCP_PROJECT_ID` and the Workload Identity provider name (workflow uses this to get a short-lived token).

---

## 6. After first deploy

1. Copy the Cloud Run URL (e.g. `https://hellfall-server-xxxx-uc.a.run.app`).
2. Set `AUTH_SERVER_URL` to that URL (in Cloud Run env or in GitHub Secrets for next deploy).
3. In Discord Developer Portal, add redirect: `https://<that-url>/api/discord/callback`.
4. In the React app, set `REACT_APP_AUTH_API_URL` to the same Cloud Run URL (or the env you use at build time).

---

## 7. Cost notes

- Cloud Run free tier: ~2M requests/month, 360k vCPU-seconds.
- Scales to zero when idle.
- Firestore has its own free tier; WatchWolf usage is likely minimal.
