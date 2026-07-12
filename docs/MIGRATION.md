# Migration from Robot Framework to Playwright

This document is the architectural decision record behind why this repo
exists. Read alongside [`robotframework-dashboard-ui-tests`](https://github.com/Libin-Samkutty/robotframework-dashboard-ui-tests-demo)
(Repo 01), it tells the complete story: legacy platform → diagnosed
structural ceiling → new platform, with an explicit account of what moved
and what deliberately didn't.

---

## Decision Context

Robot Framework's UI suite for the HealthSaaS dashboard had already been
optimized once before migration was ever on the table: `pabot`
parallelization tuned with `--testlevelsplit` plus longest-running-test-first
scheduling, and consolidating from one login per suite to one login per
worker. That earlier optimization is what makes the later migration call
credible — this wasn't "Robot felt slow, let's try something newer," it
was recognizing that a suite *already tuned* had hit a ceiling further
tuning couldn't move.

## Four Structural Ceilings (Diagnosed, Not Assumed)

By the time migration was proposed, four things were diagnosed as
structural rather than tunable:

1. **Authoring overhead.** Gherkin/step-definition authoring overhead
   slowed test creation, increasingly so for a solo engineer maintaining
   250+ cases.
2. **Flakiness against an increasingly async, AI-driven UI.** The
   dashboard's UI grew more asynchronous over time (the chatbot widget in
   particular), and Selenium-based automation grew flakier against it.
3. **A genuine parallelization ceiling.** A 5th `pabot` worker produced no
   further runtime gain — a limit Playwright's sharding model did not
   share.
4. **No trace-level replay.** Debugging a CI failure meant screenshots and
   logs, with no equivalent to Playwright's trace viewer, and weaker
   multi-tab/frame and browser-context isolation support.

## The POC That Secured Buy-In

Before committing to a full rebuild, a proof of concept ran the 3
highest-failure-rate scenarios on both frameworks — deliberately the
hardest cases, not the easiest ones. Robot Framework took ~4m12s combined
for the three; Playwright took ~47s. The number alone wasn't what secured
stakeholder sign-off — demoing the trace viewer against one of those same
failures, showing exactly what a CI failure looked like step-by-step, was
the convincing artifact.

## Migration Execution

- Rebuilt the suite on Playwright's native sharding across parallel CI
  runners, replacing `pabot`'s flat worker model.
- While rebuilding, pulled roughly a quarter to a third of scenarios that
  didn't actually need browser-level verification out of the UI suite
  entirely and converted them into pure API tests — reducing the browser
  test surface area rather than porting everything 1:1.
- Added Playwright's native `toHaveScreenshot()` screenshot-diff testing
  several months into the rebuild, once functional coverage was solid but
  a distinct class of bug started surfacing: one that passes every
  functional assertion because the DOM and its text are technically
  correct, while the visual result — a status badge losing its color, a
  count overflowing its container — is wrong. See `tests/visual-regression/`.

## What This Migration Did Not Do

This was a partial migration, not a rewrite of everything. Robot
Framework's API regression suite and the chatbot-widget smoke suite were
deliberately left in place at this stage — see Repo 01 for what stayed
and why. A migration that claims to replace everything at once is less
believable than one that names what it left alone.

## Current Split

- **Robot Framework owns:** API automation, the chatbot widget suite, and
  any remaining legacy-stable UI suites not yet worth the rebuild cost
  (see Repo 01's roadmap note on the eventual full retirement of even
  the API-testing role).
- **Playwright owns:** all new UI automation, cross-layer hybrid tests
  (create via UI → verify via API), network-level tests, and visual
  regression.

## Why Not Replace Everything At Once

Rewriting a stable, low-churn suite for architectural tidiness alone
isn't a good use of time against other roadmap priorities. The suites
that moved first were the highest-churn, highest-flakiness ones — where
the pain was actually being felt — not simply everything Robot Framework
happened to own.
