# AGENTS.md

## Cursor Cloud specific instructions

### What this repository is

This repository hosts the **[Traccar Web Interface](https://www.traccar.org)** — the web
front end for the Traccar open-source GPS tracking platform. The app is built with
**React, Material UI, and MapLibre** (see `README.md`). The back end lives in a separate
repository ([traccar/traccar](https://github.com/tananaev/traccar)); build docs are at
https://www.traccar.org/build-web-app/.

### Current checkout state (important)

As of this environment setup, only the project's root files are present:

- `README.md` — project overview
- `LICENSE` — Apache License 2.0
- `.prettierrc.json` — Prettier config (`singleQuote: true`, `printWidth: 100`)

The **runnable application source is not yet in this checkout** — there is no
`package.json`, `src/`, `index.html`, or Vite config. Until those are added there is
nothing to `npm install`, build, or serve, and no automated tests. When the application
source is added, follow the build-web-app docs above (typically `npm install` then
`npm start` to run the Vite dev server).

### Formatting

Prettier is configured via `.prettierrc.json`. It is not committed as a dependency yet, so
run it ad hoc:

```bash
npx prettier --check .    # or: npx prettier --write .
```

Node v22 and npm are available in the environment.
