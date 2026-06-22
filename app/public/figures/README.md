# figures

Static image assets (PNG, JPG, animated GIF, SVG) used by the sidecar
explanatory markdown in `app/notebooks/*.md`.

Files here are served from the site root by Vite, so reference them
**relatively** from a notebook's `.md` fragment:

```markdown
![The SIM money circuit](figures/sim-circuit.gif)
```

Relative paths resolve correctly in both dev (`/`) and the deployed site
(`/moneyjs-docs/`) because the app uses hash-based routing. Do not put assets
in a folder named `assets/` — that name collides with Vite's JS/CSS build output.
