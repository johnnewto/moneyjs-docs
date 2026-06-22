<!--
  Sidecar explanatory content for the IO-PC notebook.

  Each fragment is introduced by a marker of the form:

      <!-- more: <cellId> -->

  where <cellId> matches a body cell id in io-pc.notebook.yaml. Everything until
  the next marker becomes a collapsible "[more]" panel rendered inline on that
  section's heading row. One [more] block per cell; if an id repeats, the last
  block wins.

  Panels render through AssistantMarkdown (no KaTeX): write variables and
  equations in backticks, and use pow(b, e) rather than ^.

  References:
  - Veronese Passarella, M. (2023), "Six lectures on SFC models", section 3
    "Introducing input-output interdependencies" and IOPC_model.R
    (github.com/marcoverpas/Six_lectures_on_sfc_models).
  - Veronese Passarella, M. (2025), Florence keynote "From Model PC to Model
    ECO-3IO-PC", section 2.2 Model 3IO-PC, Tables 1-3
    (github.com/marcoverpas/keynote_speech_Florence).
  - Godley, W. and Lavoie, M. (2007), Monetary Economics, chapter 4 (Model PC).
-->

<!-- more: intro -->

**Model IO-PC** is the input-output extension of Godley & Lavoie's Model PC
(*Monetary Economics*, chapter 4). The macro skeleton — households choosing
between cash and government bills, a government that taxes and issues bills, and
a central bank — is exactly Model PC. What IO-PC adds is a **production
structure**: the single "firms" sector is split into **two industries** whose
outputs are used both for final demand and as **intermediate inputs** to each
other.

Following the *Six Lectures* section 3 and the Florence keynote (Model 3IO-PC,
here reduced to two industries), the extra assumptions are:

- two industries, each producing one good with one fixed technique;
- only **circulating capital** (intermediate inputs), no fixed capital;
- **fixed technical coefficients** collected in the matrix `A`;
- **fixed unit prices** `p1`, `p2` (set exogenously rather than by reproduction);
- the composition of consumption (`beta1_c`, `beta2_c`) and of government
  spending (`beta1_g`, `beta2_g`) is exogenous.

Because the chosen prices make the consumer price index `p_c = 1`, the aggregate
path of IO-PC (`y`, `yd`, `cons`, `v`) reproduces Model PC's, while the new
input-output block lets us see **how that GDP is produced** — the cross-industry
demands for inputs that a purely aggregate model hides.

<!-- more: balance-sheet -->

The **balance sheet** is identical to Model PC's: splitting firms into industries
changes *production*, not the *financial* structure. Households hold their wealth
`v` as cash `h_h` and bills `b_h`; the government owes the bill stock `b_s`; the
central bank holds bills `b_cb` against the cash it has issued `h_s`.

Firms carry no balance-sheet entry — they own no fixed capital and hold no
financial assets (all income is distributed). Reading across each row sums to
zero, and each column closes on net worth. This is why the Florence keynote
notes that "the macro-accounting structure of Model 3IO-PC is identical to that
of Model PC": the industry detail lives in the input-output table, not here.

<!-- more: transaction-flow -->

The **transactions-flow matrix** is also the Model PC matrix. Every row is a
payment out of one sector (minus) and a receipt into another (plus), so rows and
columns each sum to zero.

Note that consumption and government spending appear here in **nominal** terms,
`cons * p_c` and `g * p_g`: the real quantities `cons` and `g` are valued at the
average prices implied by their industry composition. The Florence note explains
why intermediate flows are *not* shown here — intermediate consumption is an
internal exchange within the firm sector, so the inter-industry entries would
cancel at the level of sectoral balances. Cross-industry interdependence is
therefore presented separately, in the **input-output table** below.

<!-- more: equations -->

The equations layer Model PC's monetary block under a new input-output block.
The genuinely new pieces (Six Lectures equations 12–20, Florence equations
13–19) are:

- **Final demand by industry** (eq. 17): `d1 = beta1_c * cons + beta1_g * g` and
  likewise `d2`. Real consumption and government spending are split across the
  two goods by the fixed composition shares.
- **Gross output** (eq. 18): `x = A * x + d`, i.e.
  `x1 = a11 * x1 + a12 * x2 + d1` and `x2 = a21 * x1 + a22 * x2 + d2`. Each
  industry must produce enough to cover both final demand and the inputs other
  industries need — the Leontief inverse `inv(I - A)` solved implicitly by the
  Gauss–Seidel iteration.
- **Nominal GDP** (eq. 1.A, replacing PC's `Y = C + G`):
  `y = p1 * d1 + p2 * d2` — GDP is the value of **final** demand, not gross
  output.
- **Price indices** (eqs. 15–16): `p_c = p1 * beta1_c + p2 * beta2_c` and
  `p_g = p1 * beta1_g + p2 * beta2_g`.
- **Real consumption without monetary illusion** (eq. 19):
  `cons = alpha1 * ((yd / p_c) - infl) + alpha2 * lag(v) / lag(p_c)`, where the
  inflation tax `infl = (d(p_c) / lag(p_c)) * (lag(v) / p_c)` protects real
  wealth (Godley & Lavoie §9.3.1).
- **Input use** (for the IO table and Figures 4–7): `k1 = a11 * x1 + a12 * x2`
  and `k2 = a21 * x1 + a22 * x2` are the total amounts of each industry's product
  absorbed as intermediate inputs.

Everything else (`yd`, `v`, `h_h`, `b_h`, `t`, `b_s`, `h_s`, `b_cb`) is Model PC
unchanged.

<!-- more: solver -->

IO-PC is solved period by period with **Gauss–Seidel** iteration: within each
period the simultaneous block (output, demand, consumption, portfolio) is
iterated to convergence, using lagged stocks from the previous period. The
implicit `x = A * x + d` system is resolved the same way the R fixture resolves
it by repeated iteration rather than an explicit matrix inverse.

The **hidden (redundant) equation** is `h_h = h_s` — the cash households hold
equals the cash the central bank has supplied. As in Model PC it is never imposed
on the solver; it is checked each period to tolerance `1e-6`. That it holds is
the numerical proof that the IO extension has not broken stock-flow consistency
(the R code's "Good news! The model is watertight!").

<!-- more: externals-equations -->

These are the exogenous parameters, matching `IOPC_model.R`:

- Monetary block (as in Model PC): `r = 0.025`, `g = 20`, `alpha1 = 0.6`,
  `alpha2 = 0.4`, `theta = 0.2`, `lambda0 = 0.635`, `lambda1 = 5`,
  `lambda2 = 0.01`.
- **Prices**: `p1 = 1.02`, `p2 = 0.98`. These straddle 1, and with the symmetric
  consumption shares give `p_c = 1` exactly.
- **Composition shares**: consumption is split evenly
  (`beta1_c = beta2_c = 0.5`); government leans slightly to industry 2
  (`beta1_g = 0.48`, `beta2_g = 0.52`), so `p_g = 0.9992 ≈ 1`.
- **Technical coefficients** `A`: `a11 = 0.11`, `a12 = 0.12`, `a21 = 0.21`,
  `a22 = 0.22`. Industry 2's product is used more intensively as an input
  (column sums `a11 + a21 = 0.32`, `a12 + a22 = 0.34`), which is why industry 2
  ends up the larger producer despite similar final demand.

<!-- more: initial-values-equations -->

The model starts essentially **at** its Model PC stationary state: wealth
`v = 86.49` already split into bills `b_h = 64.87` and cash `h_h = 21.62`, with
the government bill stock `b_s = 86.49` held partly by the central bank
(`b_cb = 21.62`). Prices start at `p_c = p_g = 1`. Because the economy begins in
balance, the **baseline is essentially flat** — it is the reference against which
the interest-rate and consumption shocks are read.

<!-- more: baseline-chart -->

In the baseline every aggregate is stationary. GDP settles at `y ≈ 106.4`,
disposable income and consumption at `yd ≈ cons ≈ 86.4`, and wealth at
`v ≈ 86.4` — the same numbers as Model PC's steady state (Six Lectures reports
GDP ≈ 106.5), because with `p_c = 1` the price layer is transparent to the
aggregate block.

What is *new* is the pair `x1` and `x2`: gross outputs sit at `x1 ≈ 71.2` and
`x2 ≈ 87.9`, **above** their final demands (`d1 ≈ 52.8`, `d2 ≈ 53.6`) by exactly
the intermediate inputs each industry must supply. The gap between gross output
and final demand is the input-output content the aggregate model cannot show.

<!-- more: baseline-table -->

The table lists the monetary aggregates alongside the industry variables. Two
checks worth making against the references:

- `y = p1 * d1 + p2 * d2`: GDP is the **value of final demand**, ≈ 106.4.
- Gross output exceeds final demand: `x1 > d1` and `x2 > d2`, with the
  differences equal to the intermediate uses `k1` and `k2`.

The prices `p1`, `p2` and the average index `p_c` stay fixed, confirming the
fixed-price assumption.

<!-- more: io-table -->

This is the **input-output table** of the economy — Table 3 of the Florence
keynote (reduced to two industries) and the "more detailed visualisation" the
Six Lectures section 3 refers to. It is evaluated at the selected period and read
as follows.

Each **producing-industry row** splits that industry's output three ways: sales
of its product as an intermediate input to industry 1 (`p_i * a_i1 * x1`), to
industry 2 (`p_i * a_i2 * x2`), and to **final demand** (`p_i * d_i`); the last
column is total nominal output `p_i * x_i`. At the baseline steady state:

- **Industry 1 output (`72.61`)** = `7.99` (to industry 1) + `10.76`
  (to industry 2) + `53.86` (final demand).
- **Industry 2 output (`86.14`)** = `14.65` + `18.95` + `52.54`.

Reading **down a column** gives the cost structure of each industry: intermediate
inputs plus **value added** equal that industry's output. Value added is the
residual `output - intermediate inputs` (here there are no taxes on products, and
in the fuller Florence table it splits further into wages and profits):

- `VA1 = 49.97`, `VA2 = 56.43`, and **`VA1 + VA2 = 106.40 = y`** — total value
  added equals nominal GDP, the fundamental IO identity.

Total **gross output** is `72.61 + 86.14 = 158.75`, of which `52.35` is
intermediate consumption circulating *within* the firm sector; only the `106.40`
of value added / final demand counts as GDP. This is precisely the distinction
between gross output and net product that the IO extension makes visible.

<!-- more: scenario-1-note -->

Scenario 1 reproduces the first experiment in `IOPC_model.R` (R scenario 2): the
bills rate `r` is raised permanently from `0.025` to `0.035` from period 10. As
in Model PC, a higher rate makes bills more attractive and reshuffles household
portfolios, while the extra interest income from the government works its way
into demand.

<!-- more: scenario-1-figure-1 -->

**Figure 1** tracks the portfolio response: the share of money balances
`100 * h_h / v` and the share of bills `100 * b_h / v`. With `lambda1 = 5`, the
higher rate pulls households toward **bills** and out of **cash** — the bill
share steps up by roughly one percentage point (the "100 basis-point" move of the
R figure) and the money share falls by the same, then both settle at their new
levels. The two shares always sum to 100% because `h_h + b_h = v` by the cash
identity.

<!-- more: scenario-1-figure-2 -->

**Figure 2** shows disposable income `yd` and consumption `cons` after the rate
rise. The higher rate raises government interest payments on the larger desired
bill stock, which lifts household disposable income; consumption follows it up
toward a **higher** stationary state. This is the Model PC result — a higher
interest rate is ultimately expansionary here because it channels more interest
income to households — now carried through unchanged by the IO layer.

<!-- more: scenario-2-note -->

Scenario 2 reproduces the second experiment in `IOPC_model.R` (R scenario 3): the
propensity to consume out of income `alpha1` is raised from `0.6` to `0.7` from
period 10. This is the experiment that drives the input-output figures below,
because changing aggregate demand changes the whole production structure.

<!-- more: scenario-2-figure-3 -->

**Figure 3** plots nominal GDP `y` after the rise in `alpha1`. Higher consumption
demand raises GDP on impact, then the economy transitions to a **new, higher**
stationary state — in the R run, GDP climbs from roughly `106` toward the mid-
`120`s. The early and late portions of the path correspond to the old and new
steady-state reference lines drawn in the R figure.

<!-- more: figures-4-5-note -->

Figures 4 and 5 (`IOPC_model.R`) follow the **intermediate input demand** of each
industry after each shock: `k1 * p1` for industry 1 and `k2 * p2` for industry 2,
where `k1`, `k2` are the total amounts of each product used as inputs. Each figure
is split here into a rate-shock version (from Scenario 1) and a consumption-shock
version (from Scenario 2), because a chart cell reads a single run. The
consumption shock moves input demand much more than the rate shock, since it acts
directly on the scale of production.

<!-- more: figures-6-7-note -->

Figures 6 and 7 open up *where each industry's output goes* under the consumption
shock (R scenario 3) — the disaggregated counterpart of Figure 3. They mirror the
**rows** of the input-output table: industry 1's output decomposes into inputs
sold to industry 1, inputs sold to industry 2, and final demand, and likewise for
industry 2. R stacks these as bars summing to total output; here each component is
a separate line and the three add up to `p1 * x1` (Figure 6) or `p2 * x2`
(Figure 7). After the shock, the **final-demand** component rises most, but the
**intermediate** components also grow because higher output of each good requires
more of both inputs — the cross-industry multiplier the IO structure adds to
Model PC.
