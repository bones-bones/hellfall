# Deploy Hellfall via GitHub Actions to a Google Cloud Function

Hellfall is a React app built with webpack (`yarn build` → output in `build/`), with `homepage: "/hellfall"` for subpath deployment. This guide configures **GitHub Actions** so that creating a **GitHub Release** triggers a build and deploys a **Google Cloud Function** that serves the static app (e.g. Express serving `build/` with SPA fallback).

---

## 1. Trigger: Run on release

- **Event:** `release` with types `published` (and optionally `created`).
- **Result:** Every time you publish a release (e.g. from the GitHub Releases UI or via `gh release create`), the workflow runs and deploys the function.

Optional: add a `workflow_dispatch` so you can also “Run workflow” manually from the Actions tab for one-off deploys without creating a release.

---

## 2. Google Cloud Console setup

Do this once in [Google Cloud Console](https://console.cloud.google.com/).

### 2a. Create or select a project

- Go to **Google Cloud Console** → [Select or create a project](https://console.cloud.google.com/projectselector2).
- Note your **Project ID** (e.g. `hellfall-prod`). You’ll use it in the workflow and in the deploy command.

### 2b. Enable required APIs

- **Cloud Functions API**: [Enable Cloud Functions](https://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com).
- **Cloud Build API**: [Enable Cloud Build](https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com) (used when deploying the function).
- **Artifact Registry API** (for Gen 2): [Enable Artifact Registry](https://console.cloud.google.com/apis/library/artifactregistry.googleapis.com) if you use 2nd-gen functions.

### 2c. Service account for deploy

1. **IAM & Admin** → **Service Accounts** → **Create service account** (e.g. `github-actions-deploy`).
2. Grant roles:
   - **Cloud Functions Developer** (to create/update functions).
   - **Service Account User** (so Cloud Build can act as the runtime identity).
   - **Storage Admin** (or **Storage Object Admin** on the default Cloud Build bucket) so the deploy can upload the function source.
3. Create a **JSON key** (Keys → Add key → Create new key → JSON) and download it. Store the entire file contents as a GitHub secret (e.g. `GCP_SA_KEY`).

### 2d. Function runtime and region

- Choose a **region** for the function (e.g. `us-central1`). The workflow will pass this (e.g. via `GCP_REGION` secret or a default).
- **Gen 2** functions are recommended (they run on Cloud Run). The examples below use **2nd-gen** (`--gen2`).

---

## 3. Function code: serve the static build

The Cloud Function is a small Node.js server that serves the contents of `build/` and falls back to `index.html` for SPA routes (e.g. `/hellfall`, `/hellfall/card/123`).

### 3a. Where to put the function

- Option A: A **`functions/`** directory in the repo (e.g. `functions/index.js`, `functions/package.json`).
- Option B: A **`server/`** directory. The workflow will build the React app, then deploy the function with the built files included.

### 3b. Example: Express server (Node 18+ / 20)

**`functions/package.json`:**

```json
{
  "name": "hellfall-function",
  "main": "index.js",
  "engines": { "node": ">=18" }
}
```

**`functions/index.js`:**

```js
const express = require('express');
const path = require('path');

const app = express();
const staticDir = path.join(__dirname, 'build');

app.use(express.static(staticDir));

// SPA: all other routes serve index.html (e.g. /hellfall, /hellfall/card/123)
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

exports.hellfall = (req, res) => {
  app(req, res);
};
```

- For **Gen 2 HTTP functions**, the function is invoked for every request; the Express app handles the request and response.
- Ensure the deployment package includes the **`build/`** directory next to (or inside) the function so `__dirname/build` or the path you use resolves correctly. The workflow will copy `build/` into the function source dir before deploying.

### 3c. Dependencies

- In `functions/`, run `npm install express` (or `yarn add express`) and commit `functions/package.json` and `functions/package-lock.json` (or `yarn.lock`). The deploy step will run `npm install` (or `yarn`) in that directory when building the function.

---

## 4. GitHub repository setup

1. **Settings** → **Secrets and variables** → **Actions**.
2. Add secrets:

   | Secret name       | Value                                              |
   |-------------------|----------------------------------------------------|
   | `GCP_SA_KEY`      | Entire contents of the service account JSON key    |
   | `GCP_PROJECT_ID`  | Your Google Cloud project ID                       |
   | `GCP_REGION`      | (Optional) Function region, e.g. `us-central1`     |
   | `GCP_FUNCTION_NAME` | (Optional) Function name, e.g. `hellfall`       |

3. **Settings** → **Actions** → **General**: ensure workflows can read repository contents. “Read and write” is only needed if you use artifacts across jobs.

---

## 5. Workflow steps (high level)

| Step           | Purpose |
|----------------|--------|
| Checkout       | Clone the repo at the ref that triggered the release. |
| Setup Node     | Use a fixed Node version (e.g. 20.x). |
| Install deps    | `yarn install --frozen-lockfile` at repo root. |
| Build          | `yarn build` (production build → `build/`). |
| Prepare function | Copy `build/` into `functions/build/` (or the path your function expects). |
| Authenticate   | Use `google-github-actions/auth` with `GCP_SA_KEY`. |
| Deploy         | Run `gcloud functions deploy` (Gen 2) with source = `functions/` (or the directory that contains the function + `build/`). |

---

## 6. Deploy step: Cloud Function (Gen 2)

- Authenticate with the service account JSON, then run `gcloud functions deploy`.
- **Example (Gen 2 HTTP function, Node 20):**

  ```yaml
  - name: Authenticate to Google Cloud
    uses: google-github-actions/auth@v2
    with:
      credentials_json: ${{ secrets.GCP_SA_KEY }}

  - name: Set up Cloud SDK
    uses: google-github-actions/setup-gcloud@v2

  - name: Deploy Cloud Function
    run: |
      gcloud functions deploy ${{ secrets.GCP_FUNCTION_NAME || 'hellfall' }} \
        --gen2 \
        --runtime=nodejs20 \
        --region=${{ secrets.GCP_REGION || 'us-central1' }} \
        --source=./functions \
        --entry-point=hellfall \
        --trigger-allow-unauthenticated
  ```

- The **source** directory (e.g. `./functions`) must contain the function code and, after the “Prepare function” step, the **`build/`** folder so the Express app can serve it.
- For **subpath** (`homepage: "/hellfall"`), the React app already uses the base path; the function serves the same `index.html` for all routes and the client router handles `/hellfall` and children.

---

## 7. Suggested workflow file layout

- **Path:** `.github/workflows/deploy-on-release.yml`
- **Name:** e.g. “Build and deploy on release”
- **Trigger:**  
  `on: release: types: [published]`  
  Optional: `workflow_dispatch:`
- **Single job:** e.g. `build-and-deploy`  
  - **Runs-on:** `ubuntu-latest`  
  - **Steps:** checkout → Set up Node (20.x) → Install yarn deps (root) → Build → Copy `build/` into function dir → Authenticate to Google Cloud → Deploy Cloud Function (Gen 2).

**Example full deploy step (after build):**

```yaml
- name: Prepare function with build
  run: |
    cp -r build functions/build

- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}

- name: Set up Cloud SDK
  uses: google-github-actions/setup-gcloud@v2

- name: Deploy to Cloud Functions
  run: |
    gcloud functions deploy ${{ secrets.GCP_FUNCTION_NAME || 'hellfall' }} \
      --gen2 \
      --runtime=nodejs20 \
      --region=${{ secrets.GCP_REGION || 'us-central1' }} \
      --project=${{ secrets.GCP_PROJECT_ID }} \
      --source=./functions \
      --entry-point=hellfall \
      --trigger-allow-unauthenticated
```

---

## 8. Release process (“release command”)

- **Option A – GitHub UI:** Repo → **Releases** → **Draft a new release** → choose tag (or create one, e.g. `v1.0.0`) → **Publish release**. The workflow runs and deploys the function.
- **Option B – CLI:** `gh release create v1.0.0 --title "v1.0.0" --notes "Release notes"`. Publishing the release triggers the workflow.

No separate “release” script is required in `package.json` unless you want a local helper that only tags and runs `gh release create`.

---

## 9. Optional improvements

- **Caching:** Cache `node_modules` (and optionally `yarn` cache) with `actions/cache` keyed by `yarn.lock` to speed up installs.
- **Node version:** Pin in workflow (e.g. `node-version: '20'`) and in `functions/package.json` `engines` for consistency.
- **Build verification:** Add a job that runs `yarn build` on PRs (or on push to `main`) without deploying.
- **Function name/region:** Use secrets `GCP_FUNCTION_NAME` and `GCP_REGION` instead of hardcoding.

---

## 10. Implementation checklist (Google Cloud Function)

- [ ] In **Google Cloud Console**: create/select project; enable **Cloud Functions API** and **Cloud Build API** (and **Artifact Registry** if using Gen 2).
- [ ] Create a **service account** with **Cloud Functions Developer**, **Service Account User**, and storage permissions; download **JSON key**.
- [ ] Add **function code** (e.g. `functions/index.js`, `functions/package.json`) that serves `build/` with Express and SPA fallback; add `express` dependency and commit lockfile.
- [ ] In **GitHub**: add secrets `GCP_SA_KEY`, `GCP_PROJECT_ID`; optionally `GCP_REGION`, `GCP_FUNCTION_NAME`.
- [ ] Create `.github/workflows/deploy-on-release.yml` with trigger `release: types: [published]` (and optional `workflow_dispatch`).
- [ ] Add steps: checkout, Node 20, `yarn install --frozen-lockfile`, `yarn build`, copy `build/` into function dir, authenticate, `gcloud functions deploy` (Gen 2).
- [ ] Create a test release and confirm the workflow runs and the function URL serves the app (e.g. `https://REGION-PROJECT.cloudfunctions.net/hellfall` or the Gen 2 URL shown in the console).
- [ ] (Optional) Add a CI job that runs `yarn build` on PRs.
- [ ] (Optional) Document the release process and function URL in README.

---

## 11. Summary

| Item        | Recommendation |
|------------|----------------|
| **Trigger** | `release: types: [published]` (+ optional `workflow_dispatch`) |
| **Build**   | Node 20, `yarn install --frozen-lockfile`, `yarn build` |
| **Google Cloud** | Enable **Cloud Functions** and **Cloud Build**; service account with Cloud Functions Developer + Service Account User; JSON key. |
| **Deploy**  | Copy `build/` into function source dir; `google-github-actions/auth` + `gcloud functions deploy --gen2` with `--source=./functions`, `--entry-point=hellfall`. |
| **Function** | Node (Express) server in e.g. `functions/` that serves `build/` and falls back to `index.html` for SPA routes. |
| **Secrets** | `GCP_SA_KEY`, `GCP_PROJECT_ID`; optionally `GCP_REGION`, `GCP_FUNCTION_NAME`. |
| **Release** | Use GitHub Releases (UI or `gh release create`); no extra npm script required for deployment. |

Once the workflow and function code are in place, publishing a release will build Hellfall and deploy it as a Google Cloud Function that serves the app at the function’s URL.
