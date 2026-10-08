# Base44 Setup Notes

## Project Overview
Simple static website served via Vite dev server. Single `index.html` with Persian/Farsi content. No backend, no database, no external services, no secrets required.

## Running
```bash
docker compose -f docker-compose.base44.yml up -d --build
```
The app is served on port 3000 by Vite's dev server (`npx vite --host 0.0.0.0 --port 3000`). Dependencies are installed on container startup via `npm install` (no lockfile exists; `vite: latest` is the only devDependency).

## Verification
- Curl `http://localhost:3000/` — should return the HTML page with `<h1>سلام</h1>`.
- Live reload works via Vite's HMR; edits to `index.html` appear in the preview automatically.

## Notes
- No `vite.config.js` exists; Vite runs with defaults.
- No secrets or environment variables are needed.
