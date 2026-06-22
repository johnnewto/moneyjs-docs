<!--
  Sidecar explanatory content for the BMW notebook.

  Each fragment is introduced by a marker of the form:

      <!-- more: <cellId> -->

  where <cellId> matches a body cell id in bmw.notebook.yaml (e.g. `intro`,
  `baseline-chart`, `scenario-1-chart`). Everything until the next marker becomes
  a collapsible "[more]" panel rendered inline on that section's heading row.

  Assets live in app/public/figures/ and are referenced relatively, e.g.
  ![alt](figures/example.png) — this resolves in both dev and the deployed site.

  One [more] block per cell; if a cell id repeats, the last block wins.

  Background: Godley, W. and Lavoie, M. (2007), *Monetary Economics: An
  Integrated Approach to Credit, Money, Income, Production and Wealth*,
  Palgrave Macmillan, Chapter 7 ("A Model with Private Bank Money", model BMW).
-->

<!-- more: intro -->

The **BMW** model — Godley & Lavoie's *"model with private bank money"*
(*Monetary Economics*, 2007, chapter 7) — is the first model in the book where
money is **inside money** created by private banks rather than the **outside
money** issued by government in SIM (chapter 3). It is the bridge from a pure
government-money economy to a genuine credit economy.

Two big things arrive in chapter 7 that SIM did not have:

- **Banks and bank money.** A banking sector makes **loans** to firms (`Ld`/`Ls`)
  and accepts **deposits** from households (`Mh`/`Ms`). Deposits are now the
  economy's money, and they are *created by lending*: when a firm borrows to
  invest, the loan simultaneously creates a deposit. This is Godley & Lavoie's
  illustration of the "loans make deposits" view of endogenous money.
- **Fixed capital and investment.** Firms now own a stock of fixed capital `K`,
  which **depreciates** and must be replaced. Investment `Id` is driven toward a
  **target capital stock** `KT` set by a stock-flow norm (`kappa`), so the model
  has real accumulation, not just a circular flow.

The economy still has three sectors — **households**, **production firms**, and
**banks** — but now the firms hold real assets (capital) financed by bank loans,
and households hold their wealth as bank deposits. Banks are pure
intermediaries: they pay the same rate on deposits that they charge on loans
(`rm = rl`), so they make zero profit and have zero net worth.

<!-- more: balance-sheet -->

This is the BMW **balance sheet** (Table 7.1 in Godley & Lavoie). Compared with
SIM's single-asset world, three things stand out:

- **A real asset exists.** Production firms own fixed capital `+K`; it appears
  only once, in the firms' column, and it is the one item with no offsetting
  financial counterpart — it is the economy's tangible net worth.
- **Inside money replaces outside money.** Households hold their wealth as bank
  **deposits** `+Mh`; banks record the same amount as a liability `-Ms`. Firms'
  capital is financed by bank **loans** `-Ld`, which the banks hold as an asset
  `+Ls`.
- **Banks net to zero.** With `Ms = Ls` the banking column's assets and
  liabilities cancel, so banks carry no net worth — exactly the role of a pure
  intermediary.

Reading across each financial row sums to zero (one sector's asset is another's
liability), and the net-worth row closes each column. Household net worth `Vh`
equals their deposits; the firms' net worth `V` is their capital less their
loans. In the stationary state these accounting links pin every financial stock
to the size of the capital stock (see the baseline panels below).

<!-- more: transaction-flow -->

The **transactions-flow matrix** (Table 7.2 in Godley & Lavoie) is the heart of
the SFC method. Every cell is a payment *out of* one sector (a minus) that is
simultaneously a receipt *into* another (a plus), so:

- **every row sums to zero** — each transaction has a payer and a payee;
- **every column sums to zero** — each sector's outlays plus its saving exhaust
  its receipts (its budget constraint).

BMW adds rows that SIM never had, and they are what make it a credit economy:

- **Investment and depreciation.** Firms buy investment goods (`Is`/`Id`) and set
  aside **amortization funds** `AF` out of the value of output to replace worn-out
  capital. `AF` is firms' internal saving — it lowers the wage bill rather than
  becoming profit.
- **Interest flows.** Firms pay interest `rl[-1]*Ld[-1]` on last period's loans;
  households receive interest `rm[-1]*Mh[-1]` on last period's deposits. Because
  `rm = rl`, the bank passes loan interest straight through to depositors.
- **Loan and deposit changes.** The bottom rows, `d(Ld)` and `d(Mh)`, are where
  the flow matrix meets the balance sheet: new lending and new deposits are the
  *flows* that change the *stocks*.

Splitting firms and banks into **current** and **capital** sub-columns shows the
financing story directly: firms' capital account borrows `+d(Ld)` to cover the
part of investment not paid for out of amortization funds, `Id - AF`.

<!-- more: account-transactions -->

This account-level view expands the transactions-flow matrix into the individual
balance-sheet accounts behind each sector, so you can trace a single event
through every ledger it touches. It is the most literal expression of Godley's
**quadruple-entry** principle: one transaction moves four account entries at
once.

Use *Expand all* / *Collapse all*, or click a sector header, to reveal or hide
the account columns grouped under **Households**, **Firms**, and **Banks**. The
asset / liability / equity badges on each column show how every flow lands on
one side of some sector's books and is matched on another's — the visual proof
that the accounting is watertight.

<!-- more: transaction-flow-sequence -->

This is the same transactions-flow matrix read **column by column** as each
sector's budget identity, animated step by step. Following the columns shows the
*monetary circuit* of a credit economy within a single period:

- firms borrow and spend on investment and wages;
- wages and deposit interest become household income;
- households consume (returning money to firms) and bank the rest as deposits;
- firms use sales plus amortization funds to repay/extend loans.

Use **Reset** and **Next step** to reveal the flows in order and watch how new
bank lending and new household deposits are two sides of the same act of
money creation.

<!-- more: equations-newton -->

These are the equations of model BMW, following Godley & Lavoie chapter 7. They
fall into a few natural groups:

- **Equilibrium by quantity adjustment.** `Cs = Cd`, `Is = Id`, `Ns = Nd`, and
  `Ls = Ld`: supply equals demand not through prices but because firms and banks
  simply meet whatever is demanded. Output is `Y = Cs + Is`.
- **Firms, capital and investment.** Capital accumulates as
  `K = lag(K) + (Id - DA)*dt`, where `DA = delta*lag(K)` is depreciation.
  Investment chases a **target capital stock** `KT = kappa*lag(Y)` via
  `Id = gamma*(KT - lag(K)) + DA`: firms close a fraction `gamma` of the gap to
  target each period and always replace what depreciates. In a stationary state
  `KT = K`, so `Id = DA` and **net investment is zero**.
- **Financing and the wage bill.** Firms keep amortization funds
  `AF = delta*lag(K)` and pay interest `lag(rl)*lag(Ld)` before paying wages, so
  `WBd = Y - lag(rl)*lag(Ld) - AF`. There are no pure profits. New borrowing
  covers the rest of investment: `Ld = lag(Ld) + (Id - AF)*dt`.
- **Households.** Disposable income is wages plus deposit interest,
  `YD = WBs + lag(rm)*lag(Mh)`. The behavioural core is the consumption function
  `Cd = alpha0 + alpha1*YD + alpha2*lag(Mh)` — an autonomous term `alpha0`, a
  propensity `alpha1` to consume out of income, and a smaller propensity `alpha2`
  to consume out of accumulated deposit wealth. Unspent income is banked:
  `Mh = lag(Mh) + Households.Deposits*dt`.
- **Banks.** The deposit rate tracks the loan rate, `rm = rl`, and deposit and
  loan supplies grow with new lending: `Ms = lag(Ms) + d(Ls)*dt`.

**The redundant equation.** As in every SFC model, one equation is implied by all
the others. Here it is `Ms = Mh`: the deposits banks issue always equal the
deposits households hold. It is never imposed on the solver — it *emerges*, and
checking that it holds is how you know the accounting is leak-free (see the
solver note).

<!-- more: sequence-cld -->

The **causal loop diagram** turns the equation list into a directed graph of who
drives whom. It is the quickest way to see BMW's central feedback loop: higher
output raises the target capital stock `KT`, which lifts investment `Id`, which
(through `Y = Cs + Is`) raises output again — the accelerator — while the
consumption-out-of-wealth term `alpha2*lag(Mh)` and depreciation provide the
damping that pulls the economy to a stationary state.

<!-- more: solver-newton -->

BMW is solved period by period with a **Newton** method: lagged stocks
(`lag(K)`, `lag(Ld)`, `lag(Mh)`, …) are known from the previous period, and the
within-period equations are solved simultaneously for the current flows and
end-of-period stocks.

The solver's **hidden variables** `Ms` (left) and `Mh` (right) implement the
redundant-equation check. Because one equation in the system is redundant, the
equality `Ms = Mh` is *not* used to find the solution — instead the solver
verifies, to tolerance `hiddenTolerance`, that the independently computed deposit
supply and deposit demand agree every period. If they ever diverged, the model's
accounting would be leaking. This is the numerical embodiment of Godley &
Lavoie's consistency requirement.

<!-- more: externals-equations-newton -->

These are the exogenous parameters and policy levers of BMW:

- `rl` = 0.025 — the loan rate of interest, set exogenously by the banks; the
  deposit rate follows it via `rm = rl`.
- `alpha0` = 20 — autonomous consumption (the variable shocked in Scenario 1).
- `alpha1` = 0.75 — propensity to consume out of disposable income (shocked in
  Scenario 2).
- `alpha2` = 0.1 — propensity to consume out of accumulated deposit wealth.
- `delta` = 0.1 — the depreciation rate of fixed capital.
- `gamma` = 0.15 — the speed at which investment closes the gap to target capital.
- `kappa` = 1 — the target capital-output ratio (`KT = kappa*lag(Y)`).
- `pr` = 1 — labour productivity.

These numbers determine the whole stationary state. Combining the steady-state
conditions (`KT = K`, `Id = DA`, constant deposits so `Cd = YD`) gives a clean
closed form for stationary output:

`Y* = alpha0 / ((1 - delta*kappa)*(1 - alpha1) - alpha2*kappa)`

With these values the denominator is `0.9*0.25 - 0.1 = 0.125`, so
`Y* = 20 / 0.125 = 160` — exactly the level the baseline converges to.

<!-- more: initial-values-equations-newton -->

BMW carries no inherited stocks: capital, loans and deposits all start from
(effectively) zero, set by the solver's tiny `defaultInitialValue`. The economy
therefore begins far below its stationary state and has to *build up* its capital
stock and money stock from scratch — which is what produces the long, smooth
climb in the baseline run.

<!-- more: baseline-newton -->

The baseline integrates BMW forward for 50 periods from near-zero stocks, with
all parameters held at the values above. With no capital and no deposits
inherited from the past, the economy starts well below its stationary state and
**accumulates** its way up: firms borrow to build the capital stock, that lending
creates the deposits households hold as wealth, and the system converges to a
stationary state in which net investment is zero and all stocks stop growing.
This run is the reference path for both scenarios.

<!-- more: baseline-chart -->

In the baseline, output `Y` and disposable income `YD` rise quickly at first and
then converge as the capital stock approaches its target and net investment fades
to zero. The mechanism is the interaction of the accelerator (investment chasing
`KT = kappa*lag(Y)`) with consumption out of accumulated deposits
(`alpha2*lag(Mh)`): both strengthen as stocks build, until saving and replacement
investment exactly balance.

The numbers match the steady-state arithmetic of the model:

- output converges to `Y* = alpha0 / ((1 - delta*kappa)*(1 - alpha1) - alpha2*kappa) = 160`;
- consumption to `Cd = Y*(1 - delta*kappa) = 144`, which also equals disposable
  income `YD = 144` (in the stationary state households consume all their income);
- gross investment to `Id = DA = delta*K = 16`, i.e. **net investment is zero**;
- the wage rate settles at `W = 0.875` — pinned because, with `kappa = 1`,
  `WBd = Y - rl*K - delta*K = Y*(1 - rl - delta)` while `Nd = Y`, so
  `W = 1 - rl - delta = 1 - 0.025 - 0.1`.

<!-- more: baseline-table -->

The table makes the convergence concrete. Watch the capital stock `K` climb and
flatten as `Id` falls toward `DA` (the moment net investment hits zero), and
watch the household deposit stock `Mh` rise alongside it.

The most striking feature of the stationary state is that **every stock ends up
equal**: `K = Ld = Ls = Mh = Ms = 160`. This is forced by the accounting.
Capital is fully loan-financed, so `Ld = K`; banks net to zero, so `Ms = Ls = Ld`;
and the redundant equation gives `Mh = Ms`. With `kappa = 1` the common stock also
equals output, `K = kappa*Y = Y = 160`. The whole financial superstructure of the
economy is exactly the size of its capital stock.

<!-- more: scenario-1-note -->

Scenario 1 is a permanent **upward shift in autonomous consumption**: `alpha0` is
raised from 20 to 30 from period 5 onward, holding every other parameter fixed.
Households decide to spend more independently of their income and wealth, and the
question is where the economy settles as a result.

<!-- more: scenario-1-run -->

The scenario re-solves the model with `alpha0` stepped up to 30 from period 5,
plotted against the baseline as a reference. Because only `alpha0` changes, the
contrast isolates the pure effect of a stronger consumption stance on output,
investment and the economy's stocks.

<!-- more: scenario-1-chart -->

Raising `alpha0` from 20 to 30 moves the economy to a **new, higher** stationary
state. Since stationary output is `Y* = alpha0 / 0.125 = 8*alpha0` here, output
rises from `160` to `8*30 = 240`. In fact the entire stationary state scales up
**in exact proportion** (×1.5): consumption `Cd` goes `144 → 216`, gross
investment `Id` goes `16 → 24`, and the capital, loan and deposit stocks all rise
`160 → 240`.

Two of Godley & Lavoie's points show up clearly:

- **Real and financial stocks move together.** More consumption demand pulls up
  output, the target capital stock, and hence investment; the extra investment is
  loan-financed, so loans and the deposits backing them grow in lockstep.
- **The wage rate is unchanged at `W = 0.875`.** Because `W = 1 - rl - delta`
  depends only on the interest and depreciation rates, a pure demand shift
  changes the *scale* of the economy but not this intensive price.

<!-- more: scenario-2-run -->

Scenario 2 is a **paradox-of-thrift** experiment: the propensity to consume out
of income `alpha1` is lowered from 0.75 to 0.70 from period 5 onward — households
decide to *save more*. The run is solved from the baseline's stationary state and
plotted against the baseline, so the chart shows the transition to the new,
thriftier equilibrium.

The result is the classic Keynesian paradox, intact in a full SFC model: trying
to save a larger fraction of income makes the economy **smaller**. Stationary
output falls from `160` to
`Y* = 20 / ((1 - 0.1)*(1 - 0.70) - 0.1) = 20 / 0.17 ≈ 117.6`, dragging the
capital stock, loans and deposits down with it (all settle near `117.6`). Less
spending means a smaller desired capital stock, less investment, less lending,
and ultimately less income.

<!-- more: scenario-2-chart -->

With the higher saving propensity, consumption `Cd` and disposable income `YD`
both settle at a permanently **lower** level (≈ `105.9`, against `144` in the
baseline) as the economy contracts to its smaller stationary state. The wage rate
`W` again stays at `0.875`: as in Scenario 1, the demand-side parameter changes
the size of the economy but not the interest-and-depreciation-determined wage.
The contraction is the mirror image of Scenario 1 — a reminder that in BMW, as in
SIM, the long-run level of activity is governed by the spending decisions
embedded in the consumption function.

<!-- more: equation-dependency-graph -->

The **dependency graph** lays the equations out by sector strip and accounting
band, showing the order in which variables are computed within a period and how
the household, firm and bank blocks connect. Read it alongside the
transactions-flow sequence to compare the *equation* structure (what determines
what) with the *accounting* structure (what pays what) — two views of the same
stock-flow-consistent model.
