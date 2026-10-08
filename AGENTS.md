# 2HS — Hacin Haseb Sepahan

Persian-first (RTL) accounting, invoicing and billing web app, built with Vite + React.

## Running

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

Served on host port 3000 by the Vite dev server (`npx vite --host 0.0.0.0 --port 3000`),
with the repo bind-mounted so edits hot-reload. `npm install` runs on container start
because dependencies live in the `node_modules` named volume, not in the image.

## Non-obvious setup notes

- **No backend.** All data is client-side: seeded mock records in `src/lib/data.js`
  are persisted to `localStorage` (`2hs.data.v1`, `2hs.settings.v1`, `2hs.session.*`).
  `src/context/DataContext.jsx#readState` merges the stored snapshot over a fresh seed,
  so adding a new collection to `createSeed()` requires no migration step.
- **Deleting the demo data:** Settings → پشتیبانگیری → بازنشانی, or clear the
  `2hs.*` localStorage keys.
- **Dates** are Jalali for display (`src/lib/date.js` via `jalaali-js`) while ISO
  `yyyy-mm-dd` strings are the storage format. Use `JalaliDateInput` for date fields.
- **Money** is always in Toman; `useMoney()` binds the currency from Settings.
- **Icons:** `lucide-react` v1 removed the brand glyphs, so Instagram/LinkedIn/X live
  as inline SVGs in `src/components/brand/SocialIcons.jsx`. Deprecated lucide aliases
  (`CheckCircle2`, `Loader2`, `AlertTriangle`, …) still resolve here — verify any new
  icon name before use, a missing export renders as an invalid element and blanks the page.
- **Permissions are real:** `ROLE_PERMISSIONS` in `src/lib/data.js` is only the default.
  The matrix edited in Users → نقشها و دسترسیها is saved to Settings and is what
  `useAuth().hasPermission` reads; `/app/users` and `/app/settings` are gated on it.
- **Sandbox overrides** (all keyed off `BASE44_PREVIEW_MODE === '1'`, no-ops otherwise):
  `vite.config.js` adds the `.<BASE44_SANDBOX_HOST_DOMAIN>` wildcard to Vite's
  `allowedHosts` because the preview proxy's host rotates. Compose passes
  `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS`, `BASE44_PREVIEW_MODE` and
  `BASE44_SANDBOX_HOST_DOMAIN` through bare.

## Verifying

- `docker compose -f docker-compose.base44.yml ps` → `web` must be `healthy`.
- `curl -s http://localhost:3000/ | grep '@vite/client'` confirms the dev server (live
  source), not a prebuilt bundle.
- `docker compose -f docker-compose.base44.yml exec -T web npx vite build` compiles every
  module — the fastest way to catch a broken import in a page you have not visited.
- Demo login: `admin@2hs.ir` / any password ≥ 4 chars (the "پر کردن با حساب نمونه"
  button on the login page fills it).

## Known gaps

- Export to PDF/Excel and the newsletter/contact forms are front-end placeholders
  (they raise a toast); printing uses the real browser print dialog.
- Expense attachments and business-logo upload are not implemented yet.
