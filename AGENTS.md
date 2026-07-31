# AGENTS.md

## Cursor Cloud specific instructions

### What this repository is

This repository is the **Traccar Web Interface** (upstream `traccar/traccar-web`) — a React
front end built with **Vite, Material UI, and MapLibre**. It has been customized with a
**FleetTrack** interface redesign (top navigation bar, vehicle side panel with status
filters, and a redesigned vehicle detail card). See `README.md` and
`package.json` for the canonical scripts.

### Services

- **Web front end (this repo):** Vite dev server on port **3000** (`npm start`). It proxies
  `/api` and `/api/socket` to a Traccar back end on `http://localhost:8082` (see the
  `server.proxy` block in `vite.config.js`).
- **Traccar back end (separate product, NOT in this repo):** the GPS tracking server that
  serves the REST API/websocket on port **8082**. The front end cannot log in or show data
  without it. It is a Java service; run an official Traccar release (`tracker-server.jar`,
  uses an embedded H2 database by default) or the `traccar/traccar` Docker image. Positions
  can be ingested via the OsmAnd protocol on port **5055**
  (`GET http://localhost:8082`-adjacent `:5055/?id=<uniqueId>&lat=..&lon=..&speed=..`).

### Commands (standard, defined in package.json)

- `npm start` — run the dev server (port 3000).
- `npm run build` — production build into `build/`.
- `npm run lint` / `npm run lint:fix` — ESLint (`--max-warnings 0`; Prettier is enforced
  via `eslint-plugin-prettier`, so always lint before committing).

### Non-obvious caveats

- **Node 22** is expected. `.npmrc` sets `legacy-peer-deps=true`, so plain `npm install`
  is the correct install command (peer-dependency conflicts are expected otherwise).
- **Back-end auth:** self-registration is disabled by default. Enable it by setting
  `<entry key='web.registration'>true</entry>` in the back-end `conf/traccar.xml`; the
  **first** registered user automatically becomes an administrator. Alternatively create
  the first admin with an unauthenticated `POST /api/users`.
- **Reverse geocoding is off by default**, so device rows / the detail card show raw
  coordinates for "Position" unless a geocoder is configured on the back end.
- The desktop layout (top nav + left panel + map + bottom detail card) lives in
  `src/main/MainPage.jsx`; the mobile layout keeps the original Traccar drawer + bottom
  menu. FleetTrack-specific components: `src/common/components/TopMenu.jsx`,
  `src/main/FleetToolbar.jsx`, `src/common/components/FleetStatusCard.jsx`, and the status
  helper `src/common/util/fleet.js`.
