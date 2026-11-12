# Security policy

## Reporting a vulnerability

Please **don't open a public issue** for security problems. Use GitHub's private reporting instead:
**Security tab → "Report a vulnerability"** (the repo owner needs to enable *Private vulnerability reporting* in
Settings → Code security).

## Scope and threat model

This is a static, client-side app. There is no server, no account system, no database and no analytics.
All training data lives in the visitor's own browser (`localStorage`).

What matters here:

| Risk | Mitigation |
| --- | --- |
| Malicious backup file / pasted Strava data (XSS, prototype pollution) | Every value read from `localStorage` or an imported file is rebuilt field-by-field in `sanitizeState()` with type checks, whitelists, length caps and strict key patterns; output is HTML-escaped as a second layer |
| Injected or third-party script | Strict Content-Security-Policy: `script-src 'self'` (no inline scripts, no `eval`) |
| Data leaving the device | `connect-src` allows only this site and `api.open-meteo.com`; the weather call is opt-in, sends coordinates rounded to ~1 km, and omits cookies/referrer |
| Supply chain | No npm/CDN dependencies at runtime (fonts are bundled); GitHub Actions are pinned to commit SHAs; Dependabot keeps them current |
| Stale/poisoned offline cache | Service worker is same-origin only, network-first, and clears old caches on update |

Out of scope / known limits: see "Honest limitations" in the README.
