# SmartDesk Assistant (Merged)

This is the combined codebase — the app structure and offline-first design
from one teammate's `smartdesk-web` build, merged with the real Express
backend from the other teammate's `SmartDeskAssistant` build.

## What came from where

**From `smartdesk-web` (kept as the base):**
- React Router app shell — Dashboard, Categories, Troubleshooting Flow,
  Diagnostic Results, AI Assistant, Search, History pages
- Tailwind-based "HUD" design system (`HudPanel`, `NetworkStatus`, etc.)
- IndexedDB offline caching layer (`src/services/offline/indexedDb.js`)
- Diagnostic history stored in localStorage (`useDiagnosticHistory`)

**From `SmartDeskAssistant` (ported into the new structure):**
- The real backend (`server/` — now a small module tree, not a single
  file) — was Windows-only (`ipconfig` parsing), rewritten using Node's
  `os.networkInterfaces()` so it works on Windows, macOS, and Linux
- The live IP-address diagnostic check — now `LiveNetworkCheck.jsx`,
  wired in as a real step inside the Network troubleshooting flow instead
  of a one-off screen
- The internet-reachability ping check, now `/api/ping` on the backend

**Added after the initial merge:**
- Real Printer/Display/Peripheral checks (`server/checks/`), following
  the same pattern as the Network check, each wired into their category's
  troubleshooting flow via a shared `LiveDeviceCheck` component
- A real AI Assistant endpoint (`server/services/aiAssistant.js`) that
  proxies to Anthropic or OpenAI, replacing the placeholder mock response
- Problem categories and troubleshooting steps now served from the
  backend (`server/data/`) instead of hardcoded frontend arrays

**Added in a later round, closing gaps against the original proposal:**
- **DNS + ARP checks** (`server/checks/dnsArp.js`) — `GET /api/dns-check`
  resolves a hostname to catch "internet looks connected but DNS is
  broken" scenarios; `GET /api/arp-table` reads the local ARP cache for
  LAN-level diagnostics. Tested and confirmed working in this project's
  dev environment.
- **Link-layer inspection** (`server/checks/linkLayer.js`) — `GET
  /api/link-layer` reports Wi-Fi signal strength and link speed. This is
  the least reliable check in the project: every OS needs a different
  command (`netsh` on Windows, `airport` on macOS, `iwconfig` on Linux),
  output formats vary by OS version and driver, and it has **not been
  tested on any real machine** in this environment. Treat it as a
  starting point to debug against real hardware, not a finished feature.
- **Real SQLite database** (`server/data/db.js`) — categories and
  troubleshooting steps now live in an actual SQLite database instead of
  JS arrays, seeded once from the old `server/data/*.js` files on first
  run. Uses Node's **built-in** `node:sqlite` module (Node 22.5+, no
  extra install needed) instead of a third-party package like
  `better-sqlite3`, specifically to avoid a native-compilation install
  step that could fail depending on the machine. Node itself marks this
  module "experimental" — it works correctly here, but prints one
  harmless warning line on startup, and its API could change in a future
  Node version. Also adds a `diagnostic_logs` table for synced history.
- **Compressed offline log sync** — `server/services/compression.js`
  gzips/gunzips JSON server-side; `src/services/api/syncLogs.js` on the
  frontend compresses the queued diagnostic history (via the browser's
  built-in `CompressionStream`, no extra library) and POSTs it as raw
  bytes to `POST /api/sync-logs`, which decompresses and stores each
  entry in the new `diagnostic_logs` table. `useDiagnosticHistory` now
  tracks a pending-sync queue and attempts to flush it automatically.
  Tested standalone: ~91% size reduction on a sample of repetitive log
  entries, and the compress/decompress round-trip is lossless.

**New, to connect the two:**
- `src/services/api/networkApi.js` — fills what was an empty
  `services/api/` folder, calling the real backend
- `useBackendHeartbeat.js` — polls `/api/health` every 10s; combined with
  the existing `useOnlineStatus` hook, `NetworkStatus` now shows three
  states (Online / Backend Down / Offline) instead of just two, which is
  what the proposal's hybrid routing logic actually needs to make a
  correct online/offline decision

## Running it

You need both the frontend and the backend running.

```bash
# 1. Install frontend deps (from the project root)
npm install

# 2. Install backend deps
npm run server:install

# 3. Copy the env files and adjust if needed
cp .env.example .env
cp server/.env.example server/.env
# then add a real ANTHROPIC_API_KEY or OPENAI_API_KEY to server/.env
# if you want the AI Assistant to work

# 4. Run both together
npm run dev:all
```

Or run them separately in two terminals:

```bash
npm run dev      # frontend, Vite dev server
npm run server   # backend, Express on http://localhost:3000
```

## What's still a mock (next steps)

- `src/services/mock/problemCategories.js` and `troubleshootingSteps.js`
  are no longer used by the main app flow (Dashboard, Categories,
  Troubleshooting Flow all now hit the real backend via
  `src/services/api/knowledgeBase.js`). `problemCategories.js`'s
  `PROBLEM_CATEGORIES` array is still used by `searchIndex.js` for
  synchronous local search — that one's still a hardcoded snapshot, and
  could be updated to search the IndexedDB cache instead once there's
  real content variance between categories.
- Printer/Display/Peripheral live checks (`server/checks/printer.js`,
  `display.js`, `peripheral.js`) are written against each OS's real
  tooling (PowerShell on Windows, CUPS/`system_profiler`/`xrandr`/`lsusb`
  on macOS/Linux), but **only syntax-checked, not run against real
  hardware** — this dev environment is Linux-only and has no network
  access to install/test packages. Test each one on an actual Windows
  and macOS machine before relying on them; PowerShell's `ConvertTo-Json`
  output shape has changed slightly across Windows versions before.
- The AI Assistant (`server/services/aiAssistant.js`) proxies to either
  Anthropic or OpenAI depending on `AI_PROVIDER` in `server/.env` — copy
  `server/.env.example` to `server/.env` and add a real API key to use
  it. This also hasn't been tested against a live key in this
  environment.

## Backend API reference

| Method | Path                              | Purpose                                  |
|--------|-----------------------------------|-------------------------------------------|
| GET    | `/api/health`                     | Liveness check (used by heartbeat hook)   |
| GET    | `/api/network-info`               | Real network adapter / IP check           |
| GET    | `/api/ping`                       | Pings 8.8.8.8 for internet reachability   |
| GET    | `/api/dns-check?hostname=`        | Resolves a hostname (default google.com)  |
| GET    | `/api/arp-table`                  | Reads the local ARP cache                 |
| GET    | `/api/link-layer`                 | Wi-Fi signal/link speed (untested, fragile)|
| GET    | `/api/printer-check`              | Real printer status check                 |
| GET    | `/api/display-check`              | Real display/resolution check             |
| GET    | `/api/peripheral-check`           | Real USB device check                     |
| POST   | `/api/ai-assistant`               | `{ question }` → AI-generated answer      |
| GET    | `/api/categories`                 | Problem category list (from SQLite)       |
| GET    | `/api/troubleshooting-steps/:id`  | Steps for a category (from SQLite)        |
| POST   | `/api/sync-logs`                  | Gzip-compressed log queue → stored in DB  |
| POST   | `/api/compress-test`              | Debug: compress any JSON, see the ratio   |
