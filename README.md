# moneyjs-docs

Live app: [https://johnnewto.github.io/moneyjs-docs/](https://johnnewto.github.io/moneyjs-docs/)

Standalone static documentation site for selected MoneyJS notebooks (`sim`, `bmw`, `gl2-pc`,
`io-pc`, `gl6-dis`, and others).

The site renders **precomputed** solver results — no solver runs in the browser. It reuses the
notebook publication components from the [moneyjs](https://github.com/johnnewto/moneyjs) repo,
which is included here as a **pinned git submodule**. A prebuild step solves the YAML notebooks in
`app/notebooks/` headlessly and emits JSON that the static app renders.

## Layout

```
moneyjs-docs/
  moneyjs/            # git submodule, pinned to a specific moneyjs commit
  app/
    notebooks/        # notebook YAML sources (auto-discovered)
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

## Notebooks

Each published notebook is a YAML file at `app/notebooks/<id>.notebook.yaml`. The `<id>` comes from
the filename (`sim.notebook.yaml` → id `sim`) and becomes the gallery URL (`#/n/sim`). Files are
**auto-discovered** — no registry to edit.

Docs notebooks are **not** moneyjs pilot templates; edit the YAML directly here (do not run
`compile:notebook-yaml` from the submodule).

### Adding or editing a notebook

1. Create or edit `app/notebooks/<id>.notebook.yaml` with `format: sfcr-notebook-yaml` and
   `metadata.template` set to a model id from moneyjs (e.g. `sim`, `gl2-pc`, `italy-sfc`). If the
   model is new, add it upstream in moneyjs first, then bump the submodule (below).
2. Add cells (`markdown`, `matrix`, `run`, `chart`, `table`, …). Optional collapsible "[more]"
   panels: inline `more: |` blocks on cells (preferred), or a legacy `app/notebooks/<id>.md`
   sidecar with `<!-- more: cellId -->` markers. Put figures in `app/public/figures/`.
3. Solve and preview:
   ```bash
   pnpm build:data   # regenerate app/src/data only
   pnpm dev          # prebuild + Vite dev server
   ```
4. Validate with `pnpm test`. Watch build output for `skipping <id>` or `unknown cell id`
   warnings — a notebook that fails to solve is skipped, not fatal.
5. Commit the YAML (and sidecar/figures). **Do not** commit `app/src/data/` — it is gitignored and
   regenerated on every `dev`/`build`.

Gallery label and description come from moneyjs's `NOTEBOOK_TEMPLATES` when the filename stem
matches a template id; otherwise the title from the YAML is used.

Do **not** edit `moneyjs/` from this repo — it is a pinned submodule. Solver and model changes
belong upstream.

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

Pushing to `main` triggers `.github/workflows/deploy.yml`, which:

1. Checks out the repo with the `moneyjs` submodule
2. Runs `pnpm install --frozen-lockfile`
3. Runs `pnpm build` with `VITE_BASE_PATH=/moneyjs-docs/` (prebuild solves notebooks, then Vite
   builds `app/dist`)
4. Publishes `app/dist` to GitHub Pages

**Live app:** [https://johnnewto.github.io/moneyjs-docs/](https://johnnewto.github.io/moneyjs-docs/)

First-time setup: in the repo settings, set Pages source to **GitHub Actions** (not "Deploy from a
branch"). You can also trigger a manual deploy via `workflow_dispatch`.

CI always solves notebooks fresh from the committed YAML and pinned submodule — there is no separate
data deploy step. Commit notebook sources; generated `app/src/data/` and `app/dist/` stay out of git.
