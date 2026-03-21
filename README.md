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
# Debug mode (headed with DevTools)
npx playwright test --debug

# UI mode (interactive)
npx playwright test --ui

# Trace on failure
npx playwright test --trace retain-on-failure

# Verbose logging
DEBUG=pw:api npx playwright test
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
