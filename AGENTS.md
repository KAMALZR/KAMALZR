# AGENTS.md

## Cursor Cloud specific instructions

### What this repository is

This is a **GitHub profile README repository** (`KAMALZR/KAMALZR`). Its only meaningful
content is `README.md`, which GitHub renders on the profile page at
https://github.com/KAMALZR. There is **no application code, no build system, no
dependencies, no services, and no automated tests**.

### Development workflow

The entire "product" is the rendered markdown, so the dev loop is:

1. Edit `README.md`.
2. `git add README.md && git commit && git push` — pushing to the default branch is
   the deploy step; GitHub re-renders the profile automatically.

There is nothing to `build`, `lint`, or `test`, and no dev server ships with the repo.

### Previewing the README locally (optional)

To preview the README exactly as GitHub renders it, use `grip` (GitHub Readme Instant
Preview). It is not part of the repo — install it ad hoc when needed:

```bash
pip install grip
grip README.md 0.0.0.0:6419   # then open http://localhost:6419/
```

`grip` uses GitHub's markdown API for rendering and hot-reloads on file changes. Note its
binary installs to `~/.local/bin`, which may not be on `PATH`; either add it or invoke
`~/.local/bin/grip`.
