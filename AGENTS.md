# Base44 Dev Environment

## Project Overview
Simple static website (Persian/RTL) served by Vite. No backend, no database, no external services.

## Setup
- Runtime: Node 22 (via `docker-compose.base44.yml`)
- Dev server: `npx vite --host 0.0.0.0 --port 5173` (mapped to host port 3000)
- Dependencies: `npm install` runs on container startup (no lockfile; uses latest vite)
- Live reload: Vite HMR with file-watch polling via bind mount

## Verification
- `docker compose -f docker-compose.base44.yml up -d --build`
- `curl http://localhost:3000/` should return the HTML page
- Preview shows a Persian greeting page
