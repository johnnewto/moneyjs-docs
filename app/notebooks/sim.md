<!--
  Sidecar explanatory content for the SIM notebook.

  Each fragment is introduced by a marker of the form:

      <!-- more: <cellId> -->

  where <cellId> matches a body cell id in sim.notebook.yaml (e.g. `intro`,
  `baseline-chart`, `scenario-chart`). Everything until the next marker becomes
  a collapsible "[more]" panel rendered inline on that section's heading row.

  Assets live in app/public/figures/ and are referenced relatively, e.g.
  ![alt](figures/example.png) — this resolves in both dev and the deployed site.

  One [more] block per cell; if a cell id repeats, the last block wins.

  Background: Godley, W. and Lavoie, M. (2007), *Monetary Economics: An
  Integrated Approach to Credit, Money, Income, Production and Wealth*,
  Palgrave Macmillan, Chapter 3 ("The Simplest Model with Government Money",
  model SIM).
-->

<!-- more: intro -->

The **SIM** model — Godley & Lavoie's *"Simplest model with government money"*
(*Monetary Economics*, 2007, chapter 3) — is the smallest complete stock-flow
consistent (SFC) model. It strips the economy down to the bare minimum needed to
illustrate how money, income and wealth fit together without leaks.

The economy has three sectors — **households**, **production firms**, and
**government** — and a single financial asset: **government money** (`Hh` held by
households, `Hs` issued by government). To keep things simple the model assumes
away almost everything else:

- a pure **service/labour** economy: firms hire labour and sell the output in the
  same period, so there are no inventories and no fixed capital;
- **no banks, no loans, no interest, and no private money**;
- **no profits**: all of firms' sales revenue is paid out as wages.

Money is **created** when the government spends (`Gd`) and **destroyed** when it
taxes (`TXd`). Because every flow in the model has a matching counter-flow, the
system is **"watertight"**: there are no black holes where money leaks out. This
is the central pedagogical point of chapter 3 — *all* monetary flows come from
somewhere and go somewhere.

![The SIM money circuit: government spending and wages inject money into households, while consumption and taxes flow back to firms and government; the gap accumulates as household money.](figures/sim-circuit.svg)

<!-- more: balance-sheet -->

This is the SIM **balance sheet** (Table 3.1 in Godley & Lavoie). At any point in
time the only asset in the whole economy is government money. Households hold it
as wealth (`+Hh`); the government records the same amount as a liability
(`-Hs`). Production firms own nothing and owe nothing — in SIM they hold no
financial assets, because all revenue is paid straight out as wages.

Two accounting conventions make the table read cleanly:

- **assets are positive, liabilities negative**, so each row sums *across*
  sectors to zero — one sector's asset is another's liability;
- the **net-worth (balance) row** closes each column to zero.

Money is "outside" wealth: it is simultaneously private net worth and public
debt. There is no real capital to back it, which is exactly what makes SIM the
*simplest* possible closed financial system.

<!-- more: transaction-flow -->

The **transactions-flow matrix** (Table 3.2 in Godley & Lavoie) is the heart of
the SFC method, and the single most important object in chapter 3. Every cell is
a payment *out of* one sector (a minus) that is simultaneously a receipt *into*
another (a plus), so:

- **every row sums to zero** — each transaction has a payer and a payee;
- **every column sums to zero** — each sector's outlays plus its saving exhaust
  its receipts (its budget constraint).

This is Godley's **quadruple-entry** principle: a single economic event touches
four entries at once. When the government spends `Gd`, that is an outlay for the
government, a receipt for firms, which pays wages to households, who in turn
acquire money. Nothing is lost in transit.

The final row, the **change in the money stock**, is where stocks and flows meet:
household saving `d(Hh)` is exactly mirrored by the change in government-issued
money `-d(Hs)`. That mirroring is the model's consistency check (see the solver
note below).

<!-- more: transaction-flow-sequence -->

This is the same transactions-flow matrix read **column by column** as each
sector's budget identity. Following the columns shows the *circuit* of money
within a single period: government spending and wage payments inject money;
consumption and taxes withdraw it; whatever households do not spend or pay in tax
accumulates as the change in their money stock.

<!-- more: equations -->

These eleven equations are model SIM exactly as written in Godley & Lavoie
(equations 3.1–3.11). They fall into a few natural groups:

- **Equilibrium-by-assumption** (`Cs = Cd`, `Gs = Gd`, `TXs = TXd`,
  `Ns = Nd`): supply equals demand not through a market-clearing price but by
  *quantity adjustment* — firms simply produce whatever is demanded. There are no
  prices and no rationing in SIM.
- **Income and taxes**: disposable income `YD = W * Ns - TXs`, with taxes levied
  as a flat fraction of the wage bill, `TXd = theta * W * Ns`.
- **The behavioural core — the consumption function**
  `Cd = alpha1 * YD + alpha2 * lag(Hh)`. Households consume a fraction `alpha1`
  out of *current* disposable income and a smaller fraction `alpha2` out of the
  *wealth* they accumulated last period (G&L require `0 < alpha2 < alpha1 < 1`).
  This single equation is what gives SIM its dynamics: spending out of past
  wealth is the channel through which the economy converges to a steady state.
- **Stock accumulation**: `Hh = lag(Hh) + YD - Cd` (households bank what they do
  not consume) and `Hs = lag(Hs) + Gd - TXd` (the government deficit issues new
  money).
- **Output and employment**: `Y = Cs + Gs` and `Nd = Y / W`.

**The redundant equation.** Counting unknowns against equations, the system has
one equation more than it strictly needs. Godley & Lavoie show that the missing /
redundant relation is `Hh = Hs` (equivalently `d(Hh) = d(Hs)`): household money
holdings always equal government-issued money. It is never imposed on the
solver — it *emerges*, and checking it holds is how you know the accounting is
watertight.

<!-- more: externals -->

These are the exogenous parameters and policy levers of SIM, with the values used
throughout Godley & Lavoie chapter 3:

- `Gd` = 20 — government expenditure, the model's main exogenous driver and the
  variable shocked in Scenario 1.
- `W` = 1 — the wage rate. With `W = 1`, output `Y`, the wage bill, and
  employment `N` all coincide numerically, which keeps the arithmetic transparent.
- `alpha1` = 0.6 — propensity to consume out of current disposable income.
- `alpha2` = 0.4 — propensity to consume out of accumulated money wealth.
- `theta` = 0.2 — the (flat) tax rate.

Two ratios determined by these numbers govern the whole solution. The **long-run
fiscal multiplier** is `1 / theta = 5`, so steady-state output is
`Y* = Gd / theta = 100`. The **steady-state wealth norm** is
`Hh* / YD* = (1 - alpha1) / alpha2 = 1`, so in the stationary state households
hold money equal to one year of disposable income.

<!-- more: solver -->

SIM is solved period by period: lagged stocks (`lag(Hh)`, `lag(Hs)`) are known
from the previous period, and the within-period equations are solved
simultaneously for the current flows and end-of-period stocks.

The solver's **hidden variables** `Hh` and `Hs` implement the redundant-equation
check described above. Because one equation in the system is redundant, the
equality `Hh = Hs` is *not* used to find the solution — instead the solver
verifies, to tolerance `hiddenTolerance`, that the independently computed
household money stock and government money stock agree every period. If they ever
diverged, the model's accounting would be leaking. This is the numerical
embodiment of Godley & Lavoie's "watertight" claim.

<!-- more: baseline-run -->

The baseline integrates the model forward for 60 periods starting from zero
stocks, with `Gd` held constant at 20. With no money inherited from the past, the
economy starts well below its steady state and climbs toward it. This run
illustrates Godley & Lavoie's central dynamic result: a constant injection of
government money drives the economy to a **stationary state** in which stocks stop
growing and the government budget is balanced.

<!-- more: baseline-chart -->

In the baseline, government spending `Gd` is held constant at `20`. Output `Y`
and disposable income `YD` rise quickly at first and then converge to a steady
state. The mechanism is the consumption-out-of-wealth term `alpha2 * lag(Hh)`:
as households accumulate money, that extra spending shrinks each period until,
in the limit, saving out of income exactly offsets nothing more is added — `Hh`
flattens.

The numbers match the chapter exactly. Output converges to
`Y* = Gd / theta = 20 / 0.2 = 100`; disposable income to
`YD* = Y* * (1 - theta) = 80`; consumption to `Cd = YD* = 80`; and the money
stock to `Hh* = 80` (one year of disposable income, the wealth norm
`(1 - alpha1) / alpha2 = 1`). In the steady state `TXd = Gd = 20`: **the budget
is balanced and no new money is created.**

<!-- more: baseline-table -->

The table makes the convergence concrete. Watch `Hh` flatten as the increments
`YD - Cd` shrink toward zero, and watch `TXd` rise from below `Gd` (a deficit
that creates money while the economy is growing) up to exactly `Gd = 20` (the
balanced budget of the stationary state). The gap `Gd - TXd` in any row *is* that
period's newly created money — and it is what households are simultaneously
saving.

<!-- more: scenario-note -->

Scenario 1 reproduces Godley & Lavoie's first SIM experiment: a permanent
**step increase in the fiscal stance**. Holding the tax *rate* `theta` fixed and
raising government spending `Gd` from 20 to 30 moves the economy to a new, higher
stationary state. It is the cleanest way to see the long-run multiplier `1/theta`
at work.

<!-- more: scenario-run -->

The scenario re-solves the model with `Gd` stepped up to 30 from period 5 onward,
and is plotted against the baseline as a reference. Because only `Gd` changes,
the contrast isolates the pure effect of fiscal policy on output, income, and
private wealth.

<!-- more: scenario-chart -->

Scenario 1 raises `Gd` from `20` to `30` starting in period 5. The economy
transitions to a **new, higher** steady state. The long-run multiplier is
`1 / theta = 5`, so the `+10` rise in spending lifts steady-state output by
`+50`: `Y*` moves from `100` to `Gd / theta = 30 / 0.2 = 150`. Disposable income
settles at `YD* = 120` and the household money stock `Hh` rises to a
correspondingly higher level of `120`.

Note the two-speed adjustment Godley & Lavoie emphasise: the *impact* multiplier
in the shock period is much smaller than the eventual `5`, because consumption out
of newly accumulated wealth feeds through only gradually. Output approaches the
new stationary state asymptotically rather than jumping to it.

<!-- more: scenario-table -->

Compare the closing rows against the baseline: every stationary-state value is
exactly `1.5x` its baseline counterpart, since both `Y* = Gd / theta` and
`Hh* = YD*` scale linearly with `Gd`. The budget rebalances at the higher level —
`TXd` climbs to meet the new `Gd = 30` — confirming that a *permanent* change in
the fiscal stance leaves the long-run budget balanced while permanently raising
output, income, and the stock of money.

<!-- more: growth-note -->

This section reproduces **Appendix 3.4** of Godley & Lavoie, *"Government
deficits in a growing economy"*. The stationary state studied above has a
balanced budget (`TXd = Gd`) and a *constant* money stock — but a stationary
economy is a special case. The appendix asks the natural follow-up question:
**are continual government deficits sustainable?**

The answer is that in a growing economy a permanent deficit is not just
sustainable, it is *required*. The reasoning is pure stock-flow accounting:

- private wealth is held entirely as government money, so the stock of money
  *is* the public debt: `Hh = Hs`;
- if real activity grows at a steady rate `g`, the wealth households wish to hold
  grows at `g`, so the stock of money/debt must grow at `g`;
- a *growing* stock of government money can only be created by a flow of new
  money each period — that flow is exactly the government deficit `Gd - TXd`.

So a steadily growing economy needs a steadily positive deficit. What matters for
sustainability is not the deficit itself but the **debt-to-income ratio**, which
settles to a constant.

<!-- more: growth-run -->

To put a growing economy inside SIM — which has no intrinsic growth engine — we
let the only exogenous driver, government expenditure `Gd`, grow at a constant
`g = 3%` per period (a `series` shock), starting from the stationary baseline
state. Because every flow in SIM is ultimately pinned to `Gd`, this pulls the
whole system onto a **steady-growth path** on which output, income, taxes and the
money stock all eventually grow at `3%`.

<!-- more: growth-chart -->

Government spending `Gd` grows at `3%` per period, and after an initial
adjustment `Y`, `TXd` and the money stock `Hh` all settle onto the same `3%`
growth path. Two features reproduce Godley & Lavoie's Appendix 3.4 point:

- **The budget never balances.** `Gd` stays permanently above `TXd`: the
  government runs a deficit in *every* period. That deficit is precisely the new
  money being issued to satisfy households' growing demand for wealth.
- **The deficit is benign.** Although the debt stock `Hh` rises without bound in
  absolute terms, it grows at the same `3%` as income, so the debt-to-income
  ratio `Hh / YD` is constant. With `g = 0.03` it settles near
  `(1 - alpha1)(1 + g) / (g + alpha2) ≈ 0.96` — slightly *below* the stationary
  norm of `1`, because in a growing economy households are forever rebuilding
  wealth against a rising income.

<!-- more: growth-table -->

Read down the columns and two ratios reveal the steady-growth state. First, the
period-to-period ratio of any column (e.g. `Y` to its previous value) approaches
`1.03`, confirming a common `3%` growth rate. Second, `Gd - TXd` is positive in
every row — the permanent deficit — yet `Hh / YD` (and `Hs`, since `Hh = Hs`)
holds steady. This is the heart of Appendix 3.4: **a constant deficit ratio and a
constant debt ratio are perfectly consistent with one another once the economy is
growing.**
