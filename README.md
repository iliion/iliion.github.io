```markdown
# iliion.github.io

A Vite + React site (local-greece). This repository contains the source for the site.  
Use the instructions below to run locally, build for production, and publish to GitHub Pages.

Prerequisites
- Node.js (LTS recommended — Node 18/20+)
- npm (bundled with Node)
- Optional: Docker (for containerized runs)

Quick start — development
1. Install dependencies
```bash
npm install
```

2. Create environment variables (if needed)
- If the app uses Supabase or other service keys, create a .env file in the project root or use environment variables prefixed with VITE_ (Vite exposes them to the client).
Create a file named `.env` or `.env.local` with contents like:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```
Note: Do NOT commit secrets to the repository. Instead add them as GitHub Actions secrets for CI builds.

3. Run the dev server
```bash
npm run dev
```
Open the URL printed by Vite (commonly http://localhost:5173).

Build / preview (production)
```bash
npm run build
npm run preview
```
- `npm run build` outputs static files to `dist/`.
- `npm run preview` serves the production build locally.

Publishing to GitHub Pages
This repository is intended to be published via GitHub Actions.

- A workflow at `.github/workflows/publish.yml` builds and deploys the produced `dist/` output.
- The workflow can either:
  - Deploy the `dist/` contents to the `gh-pages` branch (recommended using peaceiris/actions-gh-pages), or
  - Use GitHub Pages official upload/deploy actions.

If you need to deploy to the `gh-pages` branch:
1. Ensure the workflow is present and configured to push to `gh-pages`.
2. In the repository Settings → Pages, set the source to branch `gh-pages` / root.

Environment variables in Actions
- If your build requires VITE_* values (Supabase keys), add them under:
  Settings → Secrets and variables → Actions → New repository secret
- Reference them in the workflow build step like:
```yaml
env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

GITHUB_TOKEN
- You do NOT need to add GITHUB_TOKEN manually. GitHub injects a repository-scoped `GITHUB_TOKEN` into every workflow run and workflows can reference it as `${{ secrets.GITHUB_TOKEN }}`.
- Use a personal access token (PAT) only if you need broader cross-repo permissions; store PATs as secrets.

Repository branch note
- This repository uses `master` as the primary branch. Workflows targeting branch triggers should use `master` unless you create and switch to `main`.

Useful scripts (from package.json)
- dev: `vite`
- build: `vite build`
- preview: `vite preview`

Troubleshooting
- npm install errors: install build tools (macOS: `xcode-select --install`; Ubuntu/Debian: `sudo apt-get install build-essential`).
- Port in use: run with a different PORT environment variable, e.g.:
```bash
PORT=5174 npm run dev
```
- If Actions fail due to deprecated actions (e.g. upload-artifact v3), prefer the gh-pages workflow (peaceiris/actions-gh-pages@v4) which avoids the deprecated artifact path.

Adding / updating the Pages workflow
- To add the recommended gh-pages workflow, create `.github/workflows/publish.yml` with the build-and-deploy job (build then push `dist/` to `gh-pages`).
- If you want, I can provide the exact workflow file content (Vite/Node) and the steps to add it.

License
- Add a LICENSE file if you want to set a license for the site.

Contact / help
- If you want, I can:
  - Provide the exact GitHub Actions workflow file to deploy to `gh-pages`.
  - Help configure repository secrets for Supabase.
  - Troubleshoot errors from `npm install` or `npm run dev` if you paste logs.

```
