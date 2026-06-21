# moneyjs-docs

Standalone static documentation site for selected MoneyJS notebooks (`sim`, `bmw`, `gl2-pc`).

The site renders **precomputed** solver results — no solver runs in the browser. It reuses the
notebook publication components from the [moneyjs](https://github.com/johnnewto/moneyjs) repo,
which is included here as a **pinned git submodule**. A prebuild step solves the notebooks headlessly
from the submodule's YAML templates and emits JSON that the static app renders.

## Layout

```
moneyjs-docs/
  moneyjs/            # git submodule, pinned to a specific moneyjs commit
  app/                # the Vite + React doc site
    src/              # gallery + notebook pages + static result adapter
    scripts/          # build-notebook-data.mjs (headless solve -> JSON)
  pnpm-workspace.yaml # app + the moneyjs packages it reuses
  .github/workflows/  # build + deploy to GitHub Pages
```

This repo is a small pnpm workspace that includes the submodule's `core`, `core-worker`,
`notebook-core`, and `web` packages as members, so `pnpm install` resolves the full dependency tree
from moneyjs itself (no duplicated dependency lists).

## Setup

```bash
git clone --recurse-submodules https://github.com/johnnewto/moneyjs-docs.git
cd moneyjs-docs
pnpm install
```

If you cloned without `--recurse-submodules`:

```bash
git submodule update --init --recursive
```

## Develop / build

```bash
pnpm dev       # prebuild generates app/src/data, then starts Vite
pnpm build     # prebuild + production build into app/dist
pnpm preview   # serve the production build
```

By default everything resolves to the pinned `moneyjs/` submodule.

### Local dev against a live moneyjs clone (escape hatch)

To iterate against a local moneyjs working tree (offline, uncommitted edits reflected on the next
`dev`/`build`), set `MONEYJS_ROOT` to any local clone:

```bash
MONEYJS_ROOT=/home/john/repos/sfcr pnpm dev
MONEYJS_ROOT=/home/john/repos/sfcr pnpm build
```

`MONEYJS_ROOT` only changes the Vite alias and prebuild runtime resolution. TypeScript/IDE types
still resolve against the `moneyjs/` submodule; symlink `moneyjs/` to your clone if you also want
live types. CI never sets `MONEYJS_ROOT`, so deploys always use the pinned submodule.

## Updating to newer moneyjs (pin-and-commit)

The submodule is pinned: upstream moneyjs changes are **not** picked up automatically. To absorb them:

```bash
git submodule update --remote moneyjs
git add moneyjs && git commit -m "Bump moneyjs to <sha>"
pnpm build   # prebuild regenerates app/src/data from the new source
```

A plain rebuild without the bump keeps using the currently pinned commit.

> The committed `.gitmodules` points at the public moneyjs URL, so the pinned commit **must exist on
> `origin/main` of johnnewto/moneyjs** for CI / fresh clones to fetch it. (A local-only
> `.git/config` override may point the submodule at a local clone for offline work.)

## Deployment

`.github/workflows/deploy.yml` checks out the submodule, installs, builds with
`VITE_BASE_PATH=/moneyjs-docs/`, and publishes `app/dist` to GitHub Pages
(served at `https://johnnewto.github.io/moneyjs-docs/`). Enable Pages with the "GitHub Actions"
source in the repo settings.
