# Playwright Web & API Automation Framework

Production-grade test automation framework targeting [practice.expandtesting.com](https://practice.expandtesting.com/) — covering UI, API, network interception, browser-level APIs, and cross-layer hybrid validation.

---

## Architecture

```
playwright-web-api-automation-demo/
├── .github/workflows/        # CI/CD pipeline (GitHub Actions)
├── src/
│   ├── pages/                # Page Object Model classes
│   ├── api/                  # API client abstractions
│   ├── data/                 # Test data factories (Faker.js)
│   ├── helpers/              # Utilities, schema validators, wait helpers
│   └── types/                # TypeScript interfaces and types
├── tests/
│   ├── advanced-ui/          # Drag-drop, file upload, circles
│   ├── api/                  # Notes API + Practice API tests
│   ├── async-content/        # Infinite scroll, slider, challenging DOM, large page
│   ├── browser-apis/         # Shadow DOM, iFrame, geolocation, context menu, tooltips
│   ├── dynamic-dom/          # Dynamic table, locators, pagination
│   ├── forms/                # Dropdowns, inputs, form validation
│   ├── network/              # Status codes, broken images, redirect, A/B test
│   ├── non-deterministic/    # Typos page (resilient assertions)
│   ├── notes-app/            # React Notes App E2E + hybrid tests
│   ├── observability/        # Browser info, reporting validation
│   └── ui-components/        # Checkboxes, radio buttons, alerts, windows
├── fixtures/                 # Test files (uploads, schemas)
├── playwright.config.ts      # Playwright configuration
├── package.json
└── tsconfig.json
```

---

## Quick Start

```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps

# Run smoke tests
npx playwright test --grep @smoke

# Run critical tests
npx playwright test --grep "@smoke|@critical"

# Run full regression
npx playwright test --grep "@smoke|@critical|@regression"

# Run all tests (including extended)
npx playwright test

# Run specific test file
npx playwright test tests/api/notes-crud.spec.ts

# Run with UI mode
npx playwright test --ui

# Run with trace viewer
npx playwright test --trace on
```

---

## Re-running Failed Tests

```bash
# Re-run only the tests that failed in the last run (Playwright 1.47+)
npx playwright test --last-failed

# Re-run failed tests on a specific browser
npx playwright test --last-failed --project=chromium

# Re-run with increased retries for flaky investigation
npx playwright test --last-failed --retries=3
```

> Playwright writes `.last-run.json` to `test-results/` after every run. `--last-failed` reads this file to determine which tests to re-run. This file is gitignored and local to your machine.

---

## Filtering & Selection

```bash
# Run tests matching a title pattern (string or regex)
npx playwright test --grep "login"
npx playwright test --grep "/drag.*drop/i"

# Exclude tests matching a pattern
npx playwright test --grep-invert @extended

# Run a specific test by title (exact substring match)
npx playwright test -g "should login with valid credentials"

# List all tests without running them (dry run)
npx playwright test --list

# Run tests in a specific directory
npx playwright test tests/api/
```

---

## Execution Control

```bash
# Run in headed mode (visible browser)
npx playwright test --headed

# Control number of parallel workers
npx playwright test --workers=4
npx playwright test --workers=1   # serial execution

# Override test timeout (ms)
npx playwright test --timeout=60000

# Disable retries (useful for local debugging)
npx playwright test --retries=0

# Stop after first failure
npx playwright test --max-failures=1

# Run tests in a repeating loop (useful for flaky detection)
npx playwright test --repeat-each=5
```

---

## Sharding (Distributed CI)

Split the test suite across multiple machines or CI jobs:

```bash
# Split into 3 shards — run each on a separate machine
npx playwright test --shard=1/3
npx playwright test --shard=2/3
npx playwright test --shard=3/3
```

> Combine with `--project` to shard per browser. The GitHub Actions workflow in this repo uses sharding for the nightly regression run.

---

## Mobile & Device Emulation

```bash
# Emulate a specific device
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

To add device projects, extend `playwright.config.ts`:

```ts
{ name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
{ name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
```

---

## Test Artifacts

Artifact behaviour is configured in `playwright.config.ts` (`trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'on-first-retry'`). Override at runtime:

```bash
# Always capture traces
npx playwright test --trace on

# Always record video
npx playwright test --video on

# Always take screenshots
npx playwright test --screenshot on

# Retain artifacts only on failure
npx playwright test --trace retain-on-failure
npx playwright test --video retain-on-failure
```

---

## Codegen — Record New Tests

```bash
# Open a browser and record interactions as Playwright code
npx playwright codegen https://practice.expandtesting.com

# Record into a specific output file
npx playwright codegen --output tests/recorded.spec.ts https://practice.expandtesting.com

# Emulate a device during recording
npx playwright codegen --device="iPhone 13" https://practice.expandtesting.com
```

---

## Reporter Selection

```bash
# Use the built-in HTML reporter only
npx playwright test --reporter=html

# Use dot reporter for minimal CI output
npx playwright test --reporter=dot

# Use line reporter
npx playwright test --reporter=line

# Run multiple reporters together
npx playwright test --reporter=list,html
```

---

## Test Prioritisation

| Priority     | Tag         | Run Condition              | Target Duration |
|--------------|-------------|----------------------------|-----------------|
| P0-Smoke     | `@smoke`    | Every commit, every PR     | < 2 min         |
| P1-Critical  | `@critical` | Every PR merge             | < 10 min        |
| P2-Regression| `@regression`| Nightly / release         | < 30 min        |
| P3-Extended  | `@extended` | Weekly / on-demand         | Unconstrained   |

> **CI/CD Gate:** P0 + P1 combined must pass before merging to main.

---

## Coverage Areas

| Area                  | Test Count | Key Scenarios                                              |
|-----------------------|------------|------------------------------------------------------------|
| Authentication        | 15         | Login, register, forgot password, OTP, session             |
| Forms & Inputs        | 9          | Text/number/date inputs, validation, dropdowns             |
| UI Components         | 9          | Checkboxes, radio buttons, alerts, windows                 |
| Advanced UI           | 7          | Drag-drop, drag circles, file upload                       |
| Dynamic DOM           | 7          | Dynamic table, pagination, locator playground              |
| Browser APIs          | 12         | Shadow DOM, iFrame, geolocation, context menu, tooltips    |
| Async Content         | 10         | Infinite scroll, slider, challenging DOM, large page       |
| Network & HTTP        | 10         | Status codes, broken images, redirect, A/B test            |
| Non-Deterministic     | 3          | Typos (resilient assertions, soft assertions)              |
| Notes App (UI)        | 4          | CRUD + cross-layer hybrid validation                       |
| Notes API             | 8          | CRUD, auth boundary, schema, performance                   |
| Practice API          | 3          | Health, auth, schema                                       |
| Observability         | 4          | Browser detection, Allure reporting                        |

**Total: 100+ automated test cases**

---

## Key Framework Capabilities

### Page Object Model
Every page is a TypeScript class with encapsulated locators and interaction methods.

### Service Layer
API and UI abstractions per domain enable hybrid cross-layer testing.

### Smart Wait System
Zero `page.waitForTimeout()` calls. All waits are event-driven:
- `page.waitForSelector()` with `state: 'visible'`
- `expect.poll()` for async assertions
- `page.waitForLoadState()` for navigation

### Auth Reuse
`storageState` saved after login once per worker, reused across all tests in that worker.

### Schema Validation
Zod schemas validate API response contracts — catches field renames, type changes, and extra fields.

### Flaky Test Handling
- `@flaky` tag with `retries: 2`
- OR-pattern matchers for non-deterministic content
- `expect.soft()` for logging without blocking

### Cross-Layer Hybrid Testing
- Create via UI → verify via API
- Create via API → verify in UI
- Demonstrates integration testing beyond unit/e2e boundaries

---

## Reporting

### Allure Reports

```bash
# Generate report after test run
npx allure generate allure-results --clean -o allure-report

# Open report
npx allure open allure-report
```

### Playwright HTML Report

```bash
npx playwright show-report
```

### Trace Viewer

```bash
npx playwright show-trace test-results/trace.zip
```

---

## CI/CD Pipeline

The GitHub Actions workflow implements a gated pipeline:

- **Smoke Gate** — P0 tests on Chromium (must pass to proceed)
- **Critical Tests** — P1 tests on Chromium + Firefox + WebKit (matrix)
- **Regression** — Nightly, sharded across 3 workers per browser
- **Extended** — Weekly, full suite
- **Allure Report** — Auto-generated and deployed to GitHub Pages

---

## Environment Variables

| Variable        | Description              | Default                                         |
|-----------------|--------------------------|-------------------------------------------------|
| `BASE_URL`      | Target application URL   | `https://practice.expandtesting.com`            |
| `NOTES_API_URL` | Notes API base URL       | `https://practice.expandtesting.com/notes/api`  |
| `API_URL`       | Practice API base URL    | `https://practice.expandtesting.com/api`        |
| `CI`            | CI environment flag      | `false`                                         |

---

## Cross-Browser Testing

```bash
# Single browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# All browsers
npx playwright test
```

---

## Debugging

```bash
# Debug mode (step through test with Playwright Inspector)
npx playwright test --debug

# Debug a specific test
npx playwright test tests/auth/login.spec.ts --debug

# UI mode (interactive — run, filter, watch, inspect traces)
npx playwright test --ui

# Trace on failure (open with: npx playwright show-trace)
npx playwright test --trace retain-on-failure

# Verbose Playwright API logging
DEBUG=pw:api npx playwright test

# Verbose including browser console
DEBUG=pw:api,pw:browser npx playwright test
```

---

## Contributing

- Follow POM pattern for new pages
- Tag every test with priority level
- Use resilient selectors (`role` > `testid` > `text` > `CSS` > `XPath`)
- No `sleep()` or `waitForTimeout()` — use event-driven waits
- All API tests must include schema validation
- Run `npx playwright test --grep @smoke` before pushing

---

## License

MIT
