---
name: expand-docs-notebook
description: Expand a moneyjs-docs notebook with new sections and explanatory "[more]" panels grounded in a textbook reference. Use when adding cells to app/notebooks/<id>.notebook.yaml, writing inline `more:` panels (or editing a legacy app/notebooks/<id>.md sidecar), or replicating a Godley & Lavoie / SFC chapter or appendix into a notebook.
---

# Expand a docs-site notebook

Add sections to a `moneyjs-docs` notebook: new cells in the notebook YAML plus
matching collapsible "[more]" explanations, with prose grounded in a cited
reference and **verified against solved model output**.

## Key locations

- Notebook source: `app/notebooks/<id>.notebook.yaml` (auto-discovered; **not** a
  moneyjs pilot template — the submodule's `compile:notebook-yaml` does not apply
  here).
- "[more]" explanations: **inline** `more:` fields on cells (preferred; `sim` uses
  this), or a **legacy** `app/notebooks/<id>.md` sidecar (`bmw`, `gl2-pc`, `io-pc`).
- Generated data (gitignored, never hand-edit): `app/src/data/<id>.json`.
- Extras parsers: `readInlineExtras` (inline) and `readSidecarExtras` (sidecar) in
  `app/scripts/build-notebook-data.mjs`; inline wins on id collisions.
- Panel renderer: `app/src/components/SectionWithMore.tsx` →
  `@web/components/AssistantMarkdown`.

Do **not** edit anything under `moneyjs/` (pinned submodule).

## Workflow

```
- [ ] 1. Read the notebook YAML; list existing cell ids, their order, and which
         already carry a `more:` panel (or a sidecar `<!-- more: -->` block)
- [ ] 2. Design the new section's cells (markdown/run/chart/table)
- [ ] 3. Add cells to the YAML, with an inline `more:` panel on each
- [ ] 4. Run `pnpm build:data`; fix any warnings
- [ ] 5. Verify the numbers in app/src/data/<id>.json match the reference
- [ ] 6. Run `pnpm test`
```

## "[more]" panel rules

Prefer **inline** panels: add a `more:` block scalar to the cell body in the YAML.
The moneyjs parser ignores the field; the build script's `readInlineExtras` reads it.

```yaml
  - table:
      id: baseline-table
      title: Baseline summary
      variables: [Y, YD, Hh]
      sourceRunCellId: baseline-run
      more: |
        Watch `Hh` flatten as `YD - Cd` shrinks toward zero ...
```

For the **legacy sidecar** form (`bmw`, `gl2-pc`, `io-pc`), each explanation in
`app/notebooks/<id>.md` is introduced by a marker on its own line; everything until
the next marker becomes that cell's panel:

```
<!-- more: <cellId> -->
```

In both forms:

- the cell id **must** match a cell `id` in the YAML; unknown ids are skipped with a
  warning.
- One panel per cell; if an id repeats, the **last** wins. Inline beats sidecar when
  both define the same id.
- Assets go in `app/public/figures/` and are referenced relatively, e.g.
  `![alt](figures/example.png)`.

## Rendering caveat (important)

Panels render through `AssistantMarkdown`, which has **no KaTeX / `remark-math`**.

- Write variables and equations in **backticks**, not LaTeX. Backtick variables
  render as proper variable labels; backtick snippets containing `=` render as
  inline equations.
- ✅ `` `Cd = alpha1 * YD + alpha2 * lag(Hh)` ``
- ❌ `$C_d = \alpha_1 YD$`
- Use `pow(b, e)` for exponentiation, never `^`.

For **inline** `more:` panels, write italics as `_italic_`, not `*italic*`. The
notebook YAML dialect scans block scalars and rejects `*word`/`&word` tokens (they
look like YAML aliases/anchors), so a multi-word `*italic phrase*` fails to build.
`**bold**` and ` * ` (multiplication inside backticks) are fine. Legacy `.md`
sidecars are plain markdown and unaffected.

## Cell conventions

- Each `cells:` item has exactly one wrapper key: `markdown`, `matrix`,
  `sequence`, `equations`, `solver`, `externals`, `initial-values`, `run`,
  `chart`, `table`. No redundant `type` field.
- File order is UI order. Typical: intro → matrices → sequences → equations →
  solver → externals → initial-values → baseline run → charts/tables → scenario
  markdown → scenario run → scenario charts/tables.
- `chart`/`table` `variables` are bare model variable names (no expressions).
- Quote descriptions inside compact row arrays.

## Scenario / run mechanics

See `moneyjs/packages/core/src/engine/runScenario.ts`.

- A scenario run starts from the baseline run's **last-period** state, then
  applies shocks over `rangeInclusive: [start, end]` (both endpoints included).
- Shock kinds: `constant` (`value`) or `series` (`values` array). A `series`
  maps `values[period - start]` onto each period.
- Shock only **externals**, never equation variables.
- **Growth experiments**: SIM-type models have no intrinsic growth; drive the
  exogenous variable with a geometric `series`, e.g. `Gd_t = base * (1 + g)^(t-1)`.
  Generate the array with a quick node one-liner rather than by hand.

## Verification

`pnpm build:data` is the real gate (it solves every notebook). Watch its output:

- `references unknown cell id` → a `more:` cell id or `<!-- more: -->` marker is
  misspelled.
- `failed to solve` / a notebook silently missing → the YAML produced an
  unsolvable model.

Then confirm the economics by inspecting the solved series:

```bash
node -e "const s=require('./app/src/data/<id>.json').results['<run-cell-id>'].series; console.log(Object.keys(s));"
```

Ground every numeric claim in the `[more]` prose (steady-state values, growth
rates, ratios) against this output and the cited reference before finishing.

Note: `pnpm typecheck` currently fails on pre-existing `moneyjs/` submodule
errors unrelated to notebook data; rely on `pnpm build:data` + `pnpm test`.
