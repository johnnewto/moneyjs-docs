<!--
  Sidecar explanatory content for the GL2-PC notebook.

  Each fragment is introduced by a marker of the form:

      <!-- more: <cellId> -->

  where <cellId> matches a body cell id in gl2-pc.notebook.yaml. Everything until
  the next marker becomes a collapsible "[more]" panel rendered inline on that
  section's heading row. One [more] block per cell; if an id repeats, the last
  block wins.

  Panels render through AssistantMarkdown (no KaTeX): write variables and
  equations in backticks, and use pow(b, e) rather than ^.

  Reference: Godley, W. and Lavoie, M. (2007), *Monetary Economics: An Integrated
  Approach to Credit, Money, Income, Production and Wealth*, Palgrave Macmillan,
  Chapter 4 ("Government Money with Portfolio Choice", model PC and its
  extensions PCEX1/PCEX2/PCEX3). Parity reference: Veronese Passarella, "Six
  lectures on SFC models", PC_model.R / PCEX1_model.R.

  Note on parameters: this notebook sets `lambda1 = 0.05` (the interest
  sensitivity of bill demand), whereas Godley & Lavoie and the R fixture use
  `lambda1 = 5`. Numbers in these panels are therefore taken from this
  notebook's *solved output*, not copied from the book; where the choice matters
  (the size of the portfolio shift) it is called out explicitly.
-->

<!-- more: intro -->

**Model PC** — Godley & Lavoie's *"portfolio choice"* model (*Monetary
Economics*, 2007, chapter 4) — is the first model in the book where households
hold **more than one financial asset**. Where model SIM (chapter 3) had a single
form of money, PC splits household wealth between two government liabilities:
non-interest-bearing **cash** (`Hh`) and interest-bearing **bills** (`Bh`). The
letters "PC" stand for *portfolio choice*: the central new behaviour is how
households divide their wealth between the two.

The economy still has the SIM sectors — **households**, **production firms** and
**government** — but adds a **central bank** that buys whatever bills households
do not want (`Bcb`) and issues cash against them. The new ingredients relative to
SIM are:

- **bills paying interest** at the policy rate `r`, so households now receive
  interest income `lag(r) * lag(Bh)`;
- a **portfolio (liquidity-preference) decision**: the share of wealth held as
  bills rises with the interest rate and falls with the income-to-wealth ratio
  (Tobin-style);
- a **central bank** that fixes `r` and accommodates household portfolio choices,
  so the interest rate is a *policy instrument*, not a market price.

This notebook adapts `gl2-pc.Rmd` into executable cells. It builds up the PC
balance-sheet, transactions-flow and account-transaction matrices, the baseline
model, the chapter-4 experiments (a higher interest rate; a higher propensity to
consume), and three extensions: `PCEX1` (the role of mistaken expectations with a
stored random-shock sequence), `PCEX2` (adaptive expectations), and `PCEX3` (an
interest-sensitive propensity to consume).

<!-- more: balance-sheet -->

This is the PC **balance sheet** (Table 4.1 in Godley & Lavoie). Compared with
SIM there are now two assets and a fourth sector:

- **Households** hold their wealth `V` as cash `+Hh` and bills `+Bh`.
- **Government** owes the whole bill stock `-Bs`.
- The **central bank** holds bills `+Bcb` as the asset backing the cash it issues
  `-Hs`, so its net worth is zero.
- **Firms** own nothing and owe nothing — all income is distributed, exactly as
  in SIM.

The accounting conventions are unchanged: **assets are positive, liabilities
negative**, every row sums across sectors to zero, and the net-worth (balance)
row closes each column. Households' wealth `V` is the mirror image of the
government's net debt (`V = Bs - Bcb + Hh - ...`), and in the solved baseline it
settles at `V ≈ 85.34`, split into `Bh ≈ 53.45` of bills and `Hh ≈ 31.90` of
cash.

<!-- more: transaction-flow -->

The **transactions-flow matrix** (Table 4.2 in Godley & Lavoie) is the heart of
the SFC method. Every cell is a payment *out of* one sector (a minus) that is
simultaneously a receipt *into* another (a plus), so **every row and every column
sums to zero** — Godley's quadruple-entry principle.

PC adds two features SIM did not have:

- **Interest flows.** The row `lag(r) * lag(Bh)` pays interest on last period's
  bills from the government to households, while the central bank rebates the
  interest it earns on its own bills (`lag(r) * lag(Bcb)`) back to the government
  as *central-bank profits*. The central bank therefore makes zero net income.
- **A capital (flow-of-funds) account split** for the central bank, separating
  its current account (interest in, profits out) from its capital account (the
  change in its bill holdings funding the change in cash).

The bottom stock-change rows are where flows meet stocks: household saving is
allocated between the change in cash `-(Hh - lag(Hh))` and the change in bills
`-(Bh - lag(Bh))`, mirrored by the issuers. That mirroring is the model's
consistency check (see the solver note).

<!-- more: account-transactions -->

This is the same period's transactions expanded to the **account level**:
balance-sheet accounts (deposits/cash, bills, equity) are grouped under each
sector, so you can trace a single transaction across the specific accounts it
touches. Use **Expand all / Collapse all**, or click a sector header, to show or
hide the account columns under each sector.

It is the most granular view of the quadruple-entry structure: every row still
sums to zero across accounts, and the closing **Sum** row reports the
end-of-period stocks (household cash `Mh`, bills `Bh`, the government deficit, and
issued cash `Hs`) that carry into the next period.

<!-- more: transaction-flow-sequence -->

This reads the transactions-flow matrix **column by column** at the selected
period, as each sector's budget identity. Following the columns shows the
*circuit* of money and bills within a single period: government spending and
interest payments inject purchasing power; consumption and taxes withdraw it; and
whatever households do not consume is allocated between additional cash and
additional bills according to the portfolio rule.

<!-- more: equations -->

These are the equations of model PC, following Godley & Lavoie chapter 4
(eqs. 4.1–4.11). They fall into natural groups:

- **Output and income.** `Y = C + G` (eq. 4.1); disposable income now *includes
  interest on bills*, `YD = Y - TX + lag(r) * lag(Bh)` (eq. 4.2); taxes fall on
  income *and* interest receipts, `TX = theta * (Y + lag(r) * lag(Bh))`
  (eq. 4.3).
- **The behavioural core.** Consumption `C = alpha1 * YD + alpha2 * lag(V)`
  (eq. 4.5) is the SIM consumption function with *wealth* `V` replacing money;
  wealth accumulates as `V = lag(V) + (YD - C)` (eq. 4.4).
- **The portfolio choice (the new content of chapter 4).**
  `Bh = V * (lambda0 + lambda1 * r - lambda2 * (YD / V))` (eq. 4.7) is the
  Tobinesque bill-demand function: the *share* of wealth held as bills rises with
  the interest rate `r` and falls with the income-to-wealth ratio `YD / V`. Cash
  is the residual, `Hh = V - Bh` (eq. 4.6) — money is what is left after the
  portfolio decision.
- **Government and central bank.** Bill supply grows with the deficit,
  `Bs = lag(Bs) + (G + lag(r) * lag(Bs)) - (TX + lag(r) * lag(Bcb))` (eq. 4.8);
  the central bank takes up the residual bills `Bcb = Bs - Bh` (eq. 4.10) and
  issues cash to match, `Hs = lag(Hs) + d(Bcb)` (eq. 4.9).
- **`Hh_Tobin`** is the *alternative* expression for cash from the full Tobin
  system, `V * ((1 - lambda0) - lambda1 * r + lambda2 * (YD / V))`. It is shown
  to demonstrate the adding-up constraint: the money and bill shares must sum to
  one, so this equals `V - Bh`.

**The redundant equation.** As in SIM, the system has one equation more than it
needs. The redundant relation is `Hh = Hs`: the cash households end up holding
equals the cash the central bank has issued. It is never imposed on the solver —
it *emerges*, and checking it holds is how we know the accounting is watertight.

<!-- more: solver -->

PC is solved period by period with **Gauss–Seidel** iteration: lagged stocks
(`lag(V)`, `lag(Bh)`, `lag(Bcb)`, …) are known from the previous period, and the
within-period equations are iterated to convergence for the current flows and
end-of-period stocks.

The solver's **hidden variables** `Hh` and `Hs` implement the redundant-equation
check. Because one equation is redundant, the equality `Hh = Hs` is *not* used to
find the solution — the solver instead verifies, to tolerance `hiddenTolerance`,
that the independently computed household cash and central-bank cash agree every
period. If they ever diverged, money would be leaking somewhere. This is the
numerical embodiment of Godley & Lavoie's "watertight" claim.

<!-- more: externals-equations -->

These are the exogenous parameters and policy levers of model PC:

- `r` = 0.025 — the bills rate, set by the central bank as a **policy
  instrument** (the variable shocked in Scenario 1).
- `G` = 20 — government expenditure.
- `alpha1` = 0.6, `alpha2` = 0.4 — propensities to consume out of disposable
  income and out of lagged wealth.
- `theta` = 0.2 — the tax rate.
- `lambda0` = 0.635, `lambda1` = 0.05, `lambda2` = 0.01 — the portfolio
  parameters: the autonomous bill share, its sensitivity to the interest rate,
  and its sensitivity to the income/wealth ratio.

**A parameter caveat.** Godley & Lavoie (and the R fixture) use `lambda1 = 5`,
which makes the portfolio strongly interest-sensitive; this notebook uses
`lambda1 = 0.05`. With the small value the steady-state bill share is
`lambda0 + lambda1 * r - lambda2 * (YD / V) ≈ 0.635 + 0.00125 - 0.01 ≈ 0.626`,
matching the solved `Bh / V ≈ 0.626`. The consequence — visible in Scenario 1 — is
that a change in `r` barely moves the *composition* of the portfolio here, so the
interest-income channel dominates.

<!-- more: baseline-run -->

The baseline integrates model PC forward for 70 periods, starting from low
stocks, with the bills rate `r` held at `0.025` and `G` at `20`. With little
wealth inherited from the past the economy starts well below its stationary state
and climbs toward it, converging to a state in which stocks stop growing and the
government budget (inclusive of interest) is balanced. This run also supplies the
"last-period" state that every scenario below starts from.

<!-- more: baseline-chart -->

In the baseline, `r` and `G` are constant and every aggregate converges to a
**stationary state**. The solved values are:

- output `Y ≈ 105.34`;
- disposable income, consumption and wealth all `≈ 85.34` (`YD = C = V` in the
  stationary state, because `V` stops changing only when `YD = C`);
- bills `Bh ≈ 53.45` and cash `Hh ≈ 31.90`, a bill share of about `62.6%`.

Output exceeds SIM's `Y* = 100` because households now earn **interest income** on
their bills, which adds to disposable income and hence to demand. The portfolio
split (`Bh ≈ 53.45`, `Hh ≈ 31.90`) is the visible signature of chapter 4: wealth
is no longer held as a single asset.

<!-- more: baseline-table -->

The table makes the convergence concrete. Watch `V`, `Bh` and `Hh` flatten as the
increments `YD - C` shrink toward zero. Two identities to check against the
accounting:

- `Hh = Bcb = Hs` in every row (here all `≈ 31.90` at the stationary state) —
  this is the redundant equation `Hh = Hs` holding period by period, together with
  the central bank's `Bcb = Hs`.
- `Bh + Bcb = Bs` — household plus central-bank bill holdings exhaust the
  government's bill supply (`53.45 + 31.90 ≈ 85.34`).

<!-- more: scenario-1-note -->

Scenario 1 reproduces Godley & Lavoie's first chapter-4 experiment (R scenario 2):
a permanent **increase in the bills rate** `r` from `0.025` to `0.035`, applied
from period 5. It is the experiment behind the book's Figures 4.3–4.4 on the
evolution of portfolio shares and of income.

<!-- more: scenario-1-chart -->

After the rate rise the economy moves to a **higher** stationary state: output
climbs from `Y ≈ 105.34` to `≈ 107.69`, with disposable income and consumption
rising in step to `≈ 87.69`. This is Godley & Lavoie's initially *puzzling*
result — a higher interest rate is **expansionary** here, because the extra
interest the government pays on bills is income to households, which they partly
spend.

The *portfolio* response, by contrast, is barely visible in this notebook: the
bill share moves only from about `62.62%` to `62.67%`. In the book (with
`lambda1 = 5`) the same experiment shifts the bill share by roughly a full
percentage point — the headline of Figure 4.3. Here the small `lambda1 = 0.05`
mutes the composition effect, so what you see is almost entirely the
interest-income channel. (Raise `lambda1` toward `5` to recover the textbook-sized
portfolio swing.)

<!-- more: scenario-2-note -->

Scenario 2 reproduces Godley & Lavoie's other chapter-4 experiment (R scenario 3):
a permanent rise in the **propensity to consume out of income** `alpha1` from
`0.6` to `0.7`, applied to the baseline PC model from period 5. Unlike the
adaptive run further down, this is the *plain* model with within-period
expectations, so it isolates the pure dynamics of a thriftiness shock.

<!-- more: scenario-2-chart -->

This experiment shows the **two-speed** nature of the consumption multiplier and a
genuine *paradox of thrift in reverse*:

- **Short run.** Spending more out of income gives an immediate boom — output
  spikes to a peak of `Y ≈ 124.7` (around period 4), with consumption and
  disposable income jumping with it. This matches the rise toward `≈ 125` shown in
  the book's GDP figure for this experiment.
- **Long run.** Consuming more means *saving* less, so wealth `V` is run down —
  from `≈ 85.34` to `≈ 62.94`. Lower wealth means fewer bills and therefore *less*
  interest income, which drags demand back. The economy settles at a stationary
  output of `Y ≈ 103.92`, **below** the original baseline `105.34`.

So a higher propensity to consume buys a transitory boom at the cost of a
permanently smaller stock of wealth and a slightly lower long-run income — the
mirror image of the result that *more* thrift would raise long-run wealth and
interest income.

<!-- more: pcex1-note -->

This section mirrors the **role of expectations** in Godley & Lavoie chapter 4
(model PCEX). Households must decide their portfolio *before* they know their
actual disposable income, so they act on **expected** disposable income `YDE`.
The book draws `YDE` from a random process; to keep the browser results
reproducible, this notebook feeds a **fixed stored shock series** `Ra` instead of
live randomness, with `YDE = YD * (1 + Ra)`.

<!-- more: pcex1-equations -->

PCEX1 rewrites the portfolio block in terms of **expected** magnitudes, which is
the substance of Godley & Lavoie's expectations discussion:

- Consumption is driven by *expected* income, `C = alpha1 * YDE + alpha2 * lag(V)`.
- Households plan their wealth and holdings on expectations: expected wealth
  `VE = lag(V) + (YDE - C) * dt`, **desired** bills
  `Bd = VE * (lambda0 + lambda1 * r - lambda2 * (YDE / VE))`, and **desired** cash
  `Hd = VE - Bd`.
- The key behavioural assumption: **bills are acquired as planned**, `Bh = Bd`,
  so *all* the surprise in realised income lands on **cash**. Realised cash is the
  residual `Hh = V - Bh`.
- `YDE = YD * (1 + Ra)` injects the stored expectation error each period.

The economic point is that **money is the buffer**: because bills are fixed at
their desired level, unexpected income is absorbed entirely by money balances.

<!-- more: pcex1-baseline-chart -->

The chart contrasts **realised** holdings (`Hh`, `Bh`) with **desired** holdings
(`Hd`, `Bd`) as the stored `Ra` shocks buffet expected income `YDE`. Two features
reproduce the chapter's message:

- `Bh` tracks `Bd` exactly — bills are always acquired as planned.
- `Hh` and `Hd` come apart: realised cash diverges from desired cash by as much as
  `≈ 10.4` over the run. That gap **is** the accumulated expectation error,
  absorbed by money as the residual asset.

When expectations happen to be correct (`Ra = 0`), `Hh` and `Hd` coincide; every
deviation is the model showing money doing its buffer-stock job.

<!-- more: pcex1-baseline-table -->

The table lets you line up `YD` against `YDE` and `Hh` against `Hd` period by
period. Where `YDE > YD` (households over-estimated income) they planned to hold
more bills than warranted and end up with *less* cash than desired; where
`YDE < YD` the reverse. Bills (`Bh = Bd`) never carry the error — confirming the
buffer role of money numerically.

<!-- more: adaptive-note -->

This model follows the **adaptive-expectations** variant (PCEX2). Instead of a
random draw, expected disposable income is simply **last period's actual income**,
`YDE = lag(YD)`. The portfolio block is otherwise the PCEX1 block (desired bills
`Bd`, expected wealth `VE`, cash as residual), so money still buffers expectation
errors — but now the errors are systematic lags rather than random noise.

<!-- more: adaptive-equations -->

The equations are the PCEX1 block with one change: `YDE = lag(YD)` replaces the
random-shock rule. Because expectations equal last period's outcome, in any
**stationary** state `YDE = YD` and the model collapses to ordinary PC — which is
why the adaptive baseline converges to the same `Y ≈ 105.34` steady state as the
plain model. The adaptive structure matters only *out of* steady state, during
transitions, where it slows and smooths the response.

<!-- more: adaptive-baseline-chart -->

The adaptive baseline converges to the **same stationary state** as the plain PC
model — `Y ≈ 105.34`, `YDE = C = V ≈ 85.34`, desired bills `Bd ≈ 53.45`, desired
cash `Hd ≈ 31.90` — because once income stops changing, `lag(YD) = YD` and
expectations are correct. The interest of this model is purely dynamic: it is the
baseline against which the adaptive *thrift* scenario below is read.

<!-- more: adaptive-scenario-note -->

This scenario raises `alpha1` from `0.6` to `0.7` between periods 5 and 60 on the
**adaptive** model — the same thriftiness shock as Scenario 2, but now filtered
through `YDE = lag(YD)`. Comparing the two shows how adaptive expectations damp
the impact multiplier.

<!-- more: adaptive-scenario-chart -->

The qualitative story matches Scenario 2 — a short-run boom followed by a lower
long-run state — but the **adaptive lag softens the peak**: output rises to a peak
of `Y ≈ 119.1` (around period 6) rather than the `≈ 124.7` spike of the plain
model, because consumption responds to *last* period's income rather than the
contemporaneous jump. The long-run landing point is identical: `Y ≈ 103.92` and
wealth `V ≈ 62.94`, since in the stationary state expectations are correct and the
adaptive model reduces to PC. The lesson is that the *expectations rule* changes
the transition path, not the steady state.

<!-- more: interest-sensitive-note -->

The final model (PCEX3) follows the chapter-4 extension in which the **propensity
to consume itself depends on the interest rate**: `alpha1 = alpha10 - iota *
lag(r)`. A higher rate now discourages consumption directly (a positive interest
*elasticity of saving*), on top of its portfolio and interest-income effects.

<!-- more: interest-sensitive-equations -->

This is the adaptive model plus one extra equation,
`alpha1 = alpha10 - iota * lag(r)`, with `alpha10 = 0.7` and `iota = 4`. At the
baseline rate `r = 0.025` this delivers `alpha1 = 0.7 - 4 * 0.025 = 0.6`, exactly
the value used everywhere else — so the **baseline is unchanged** (`Y ≈ 105.34`).
The endogenous `alpha1` only bites when the rate moves, which is the point of the
scenario.

<!-- more: interest-sensitive-baseline-chart -->

With `r` fixed at `0.025`, the endogenous rule pins `alpha1` at exactly `0.6`, so
this baseline is indistinguishable from the plain and adaptive baselines:
`Y ≈ 105.34`, `YDE = C = V ≈ 85.34`. The chart includes `alpha1` so you can see it
sitting flat at `0.6` — confirming that the extension is calibrated to nest the
standard model at the baseline rate.

<!-- more: interest-sensitive-scenario-note -->

This scenario reapplies the bills-rate increase (`r`: `0.025` → `0.035`, periods
5–60) to the interest-sensitive model. Now the rate rise does *three* things at
once: it raises interest income (expansionary), nudges the portfolio toward bills
(small here), and **lowers** the propensity to consume via
`alpha1 = alpha10 - iota * lag(r)` (contractionary on impact, but saving-building
in the long run).

<!-- more: interest-sensitive-scenario-chart -->

The endogenous propensity falls from `alpha1 = 0.6` to
`0.7 - 4 * 0.035 = 0.56`. The combined long-run effect is **more** expansionary
than the plain interest-rate experiment: output settles at `Y ≈ 108.56`, above
Scenario 1's `≈ 107.69`. The reason is that the lower `alpha1` means households
save more, building a larger stock of wealth and bills, which earns *more*
interest income — reinforcing the direct interest-income channel. Disposable
income rises to `≈ 88.56` and taxes to `≈ 22.14` as the larger tax base feeds the
government's accounts.

<!-- more: equation-dependency-graph -->

This is the **dependency graph** of the baseline PC equations, organised by
sector strips and accounting bands. It shows the *order of determination* within a
period: output and income are pinned down first, then taxes and wealth, then the
portfolio split (`Bh`, `Hh`), and finally the government and central-bank residual
identities (`Bs`, `Bcb`, `Hs`). Following the arrows is a quick way to see why the
system is simultaneous — `C` depends on `YD`, which depends on `Y`, which depends
back on `C` — and hence why it is solved iteratively rather than by substitution.
