# Plan: Deploy Hellfall via GitHub Actions on Release

Hellfall is a React app built with webpack (`yarn build` → output in `build/`), with `homepage: "/hellfall"` for subpath deployment. This plan adds **GitHub Actions** so that creating a **GitHub Release** triggers a build and deploy, replacing the current local-only build process.

---

## 1. Trigger: Run on release

- **Event:** `release` with types `published` (and optionally `created`).
- **Result:** Every time you publish a release (e.g. from the GitHub Releases UI or via `gh release create`), the workflow runs. No need to run the build locally for deployment.

Optional: add a `workflow_dispatch` so you can also “Run workflow” manually from the Actions tab for one-off deploys without creating a release.

---

## 2. Workflow jobs (high level)

| Step | Purpose |
|------|--------|
| Checkout | Clone the repo at the ref that triggered the release (tag/commit). |
| Setup Node | Use a fixed Node version (e.g. 20.x) for reproducible builds. |
| Install deps | `yarn install --frozen-lockfile` (no lockfile changes). |
| Build | `yarn build` (production webpack build → `build/`). |
| Deploy | Upload `build/` to the chosen deployment target. |

---

## 3. Deployment target options

Pick one and implement the “Deploy” step accordingly.

### A. GitHub Pages (recommended default)

- Fits `homepage: "/hellfall"` (e.g. `https://<user>.github.io/hellfall/`).
- **Deploy step:** Use `actions/upload-pages-artifact` and `actions/deploy-pages`, or the single `peaceiris/actions-gh-pages` action with `github_token` and `publish_dir: build`.
- **Repo settings:** Enable **Pages** → Source: “GitHub Actions”.
- **Permissions:** Workflow needs `contents: read`, `pages: write`, `id-token: write` (for OIDC with deploy-pages).

### B. Static host (S3, Netlify, etc.)

- **Deploy step:** Use the provider’s official action (e.g. `aws-actions/configure-aws-credentials` + `aws sync`, or Netlify CLI in a step). Push the contents of `build/`.
- **Secrets:** Store provider credentials (e.g. `AWS_ACCESS_KEY_ID`, `NETLIFY_AUTH_TOKEN`) in repo **Settings → Secrets and variables → Actions** and reference them in the workflow.

### C. Custom server (SSH / rsync / FTP)

- **Deploy step:** Use `appleboy/scp-action` or a `run: rsync` step with an SSH key stored as a secret.
- **Secrets:** e.g. `SSH_PRIVATE_KEY`, `REMOTE_HOST`, `REMOTE_USER`, `REMOTE_PATH`.

---

## 4. Suggested workflow file layout

- **Path:** `.github/workflows/deploy-on-release.yml`
- **Name:** e.g. “Build and deploy on release”
- **Trigger:**  
  `on: release: types: [published]`  
  Optional: `workflow_dispatch:`
- **Single job:** e.g. `build-and-deploy`  
  - **Runs-on:** `ubuntu-latest`  
  - **Steps:** checkout → Set up Node (20.x) → Install yarn deps → Build → Deploy (depending on 3.A/B/C).

---

## 5. Release process (“release command”)

- **Option A – GitHub UI:** Repo → **Releases** → **Draft a new release** → choose tag (or create one, e.g. `v1.0.0`) → **Publish release**. The workflow runs automatically.
- **Option B – CLI:** `gh release create v1.0.0 --title "v1.0.0" --notes "Release notes"` (after committing and pushing the tag or letting `gh` create it). Again, publishing the release triggers the workflow.

No separate “release” script is required in `package.json` unless you want a local helper that only tags and runs `gh release create`; the actual deploy is done in GitHub Actions.

---

## 6. Optional improvements

- **Caching:** Cache `node_modules` (and optionally `yarn` cache) with `actions/cache` keyed by `yarn.lock` to speed up installs.
- **Node version:** Pin in workflow (e.g. `node-version: '20'`) and optionally add `engines` in `package.json` for consistency.
- **Build verification:** Add a job that runs `yarn build` on PRs (or on push to `main`) without deploying, so broken builds are caught before release.
- **Clean step:** README mentions `yarn clean`; if you add a `clean` script to `package.json`, the workflow can run it before install for a clean slate (optional).

---

## 7. Implementation checklist

- [ ] Create `.github/workflows/deploy-on-release.yml` with trigger `release: types: [published]` (and optional `workflow_dispatch`).
- [ ] Add steps: checkout, Node 20, `yarn install --frozen-lockfile`, `yarn build`.
- [ ] Add deploy step for chosen target (e.g. GitHub Pages with `peaceiris/actions-gh-pages` or `actions/deploy-pages`).
- [ ] Set repo permissions (e.g. Pages + workflow permissions as in 3.A).
- [ ] Add any required secrets for non–GitHub-Pages targets.
- [ ] Create a test release (e.g. `v0.1.1`) and confirm the workflow runs and the site is available at the expected URL (e.g. `https://<user>.github.io/hellfall/`).
- [ ] (Optional) Add a CI job that runs `yarn build` on PRs.
- [ ] (Optional) Add `engines` and/or a `clean` script, and document the release process in README.

---

## 8. Summary

| Item | Recommendation |
|------|----------------|
| **Trigger** | `release: types: [published]` (+ optional `workflow_dispatch`) |
| **Build** | Node 20, `yarn install --frozen-lockfile`, `yarn build` |
| **Deploy** | Start with **GitHub Pages**; switch to S3/Netlify/SSH by changing only the deploy step and secrets. |
| **Release command** | Use GitHub Releases (UI or `gh release create`); no extra npm script required for deployment. |

Once the workflow file is in place and the first release is published, Hellfall will be deployed automatically on every release, replacing the need to run the build locally for deploy.
