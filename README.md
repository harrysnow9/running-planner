# Road to Sub-2H — training tracker

An offline-first training-plan tracker (plan generator, pace targets, logging, race splits, Strava CSV import,
calendar export). It is a **static site**: no server, no account, no analytics. Your data never leaves your device.

## Deploy it on GitHub Pages (about 5 minutes)

1. **Turn on two-factor authentication** for your GitHub account first (Settings → Password and authentication).
   This is the single most important security step: whoever controls your repo controls the code your phone runs.
2. Create a **new public repository** (e.g. `road-to-sub-2h`). Leave "Add a README" unticked.
   *(GitHub Pages on a free account requires a public repo. There's nothing secret in it.)*
3. Upload the files. On the empty repo page choose **"uploading an existing file"** and drag in **everything inside
   this folder** — including the hidden `.github` folder (Mac: press `Cmd`+`Shift`+`.` in Finder to show it). Commit.
   Or with git:
   ```bash
   git init -b main && git add . && git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR-USERNAME/road-to-sub-2h.git
   git push -u origin main
   ```
4. **Settings → Pages → Build and deployment → Source: "GitHub Actions".**
5. Open the **Actions** tab. When *Deploy to GitHub Pages* shows a green tick, your app is live at
   `https://YOUR-USERNAME.github.io/road-to-sub-2h/`.

> **Uploading from a phone?** GitHub's mobile web uploader can't preserve folders, and this project needs
> `icons/`, `fonts/` and `.github/`. Upload from a computer (or use an app such as *Working Copy* on iPhone).
> If you can't create the `.github` folder, skip steps 4–5 and instead set
> **Pages → Source: "Deploy from a branch" → `main` / `(root)`**. The app works the same; you just won't get the
> automated checks. (If you do that and the `.github` files are present, delete `.github/workflows/pages.yml`.)

### Put it on your iPhone
Open the URL in **Safari** → Share → **Add to Home Screen**. It then launches full-screen and works offline.

## Turn on GitHub's security features (free for public repos)
Settings → **Code security**: enable *Private vulnerability reporting*, *Dependabot alerts*, and *Secret scanning*
(+ push protection). The included `codeql.yml` workflow runs static analysis automatically.
Optional: Settings → Rules → protect `main` (block force-pushes and deletion).

## What's built in

- **Strict CSP** (`index.html`): scripts only from this site — no inline scripts, no `eval`, no third-party code.
- **Untrusted-input handling**: backups, saved data and Strava pastes are validated and sanitised before use.
- **No third-party requests by default.** Fonts are self-hosted. Weather is **opt-in** (Settings → Weather).
- **Hardened service worker** (`sw.js`): same-origin only, network-first, versioned cache.
- **CI security gate** (`pages.yml`): the deploy fails if someone adds an inline script/handler or removes the CSP.
- **Pinned Actions** + least-privilege workflow permissions + Dependabot + CodeQL.
- **`_headers`**: full HTTP security headers if you host on Netlify or Cloudflare Pages instead (see below).

## Honest limitations

- **GitHub Pages can't set HTTP headers**, so the CSP is delivered via `<meta>`. That can't include
  `frame-ancestors`, so another site *could* embed yours in an iframe. Impact is low (no logins or sensitive actions).
  Hosting on **Netlify** (drag this folder onto app.netlify.com/drop) or Cloudflare Pages applies `_headers` and closes this.
- **Shared origin on `username.github.io`:** all your GitHub Pages sites share one browser storage area. Only host
  code you trust there, or use a custom domain.
- **Data is stored unencrypted** in the browser (`localStorage`), and Backup files are plain JSON. It's a training
  log, not a credential — but anyone with your unlocked phone/browser could read it. Don't commit backups to the repo
  (`.gitignore` already blocks `*backup*.json`).
- `style-src` allows `'unsafe-inline'` because the UI uses inline `style=""` attributes (styles can't run code).
- This has been tested in jsdom and headless Chromium (including attack payloads and CSP enforcement) but not on a
  real iPhone or independently penetration-tested. After deploying, check Add to Home Screen + offline on your phone.

## Privacy
No cookies, no analytics, no accounts. The only outbound request the app can make is the optional weather lookup to
open-meteo.com (location rounded to ~1 km, no cookies, no referrer).

## Project layout
```
index.html            page + Content-Security-Policy
app.js                application code
styles.css            styles (+ self-hosted @font-face)
theme-init.js         sets light/dark before first paint (external file so the CSP can forbid inline scripts)
sw.js                 service worker (offline support)
manifest.webmanifest  install metadata
icons/  fonts/        assets (fonts are SIL OFL — licenses included)
_headers              HTTP headers for Netlify / Cloudflare Pages
.github/              Pages deploy, CodeQL, Dependabot
```

## Developing / updating
```bash
python3 -m http.server 8000    # then open http://localhost:8000
```
Pushing to `main` redeploys. The service worker is network-first, so updates show up without clearing caches.
If you add or rename files, update the `SHELL` list in `sw.js` and the `cp` line in `.github/workflows/pages.yml`.

## Licenses
Inter and Oswald fonts: SIL Open Font License 1.1 (see `fonts/`). Add your own license for the app code if you
make the repository public and want others to be able to reuse it (without one, all rights are reserved).
