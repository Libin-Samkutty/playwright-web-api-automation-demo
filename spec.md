# spec.md — Expand Testing Practice Site (Playwright Production Framework)

## 1. System Overview

**Target:** https://practice.expandtesting.com/

This platform is explicitly designed for **UI + API automation practice**, covering real-world web patterns such as authentication, dynamic DOM, forms, drag-and-drop, Shadow DOM, iFrame handling, geolocation, infinite scroll, network interception, and API testing. ([Practice Test Automation WebSite][1])

---

## 2. Why This System (Justification)

### Core Value

* Single platform supports **UI + REST API testing** ([Practice Test Automation WebSite][1])
* Covers **common + complex scenarios** (auth, dynamic tables, validation, drag-drop) ([Practice Test Automation WebSite][1])
* Designed for **Playwright/Cypress/Selenium practice explicitly** ([Practice Test Automation WebSite][1])
* Includes **16 additional practice pages** covering Shadow DOM, iFrame, geolocation mocking, infinite scroll, horizontal slider, tooltips, context menus, typos, challenging DOM, large pages, HTTP status codes, broken images, redirects, A/B testing, a full React SPA, and a second REST API

### Strategic Advantage

* Eliminates need to combine multiple systems
* Enables full **test pyramid implementation**
* Includes **edge cases (dynamic DOM, async behaviour, flaky patterns, non-deterministic content)**
* Supports cross-layer **hybrid UI + API validation**

---

## 3. Coverage Mapping (Framework Scope)

| Area | Pages / Features |
|------|----------------|
| Authentication | Login, Register, Forgot Password, OTP |
| Forms & Inputs | Inputs, Form Validation, Dropdowns |
| UI Components | Checkboxes, Radio Buttons, Alerts, Windows |
| Advanced UI Interactions | Drag & Drop, Drag Circles, File Upload, Horizontal Slider |
| Dynamic & Async DOM | Dynamic Table, Pagination Table, Infinite Scroll, Challenging DOM, Large Page |
| Browser-Level APIs | Shadow DOM, iFrame, Geolocation, Context Menu, Tooltips |
| Network & HTTP | Status Codes, Broken Images, Redirect, A/B Test |
| Non-Deterministic Patterns | Typos, A/B Test Variation |
| Locator Strategy | Locator Playground |
| React Notes App (UI) | /notes/app — full SPA CRUD + search/filter |
| Notes API | CRUD, Auth, Schema, Performance |
| Practice API | /api/api-docs/ — Health, Auth, Schema |
| Observability | Browser Info, Reports |

---

## 4. Test Architecture Mapping

### Layers to Implement

* UI Layer → Playwright (POM)
* API Layer → Playwright API / REST client
* Service Layer → abstraction over UI + API
* Data Layer → test data factories
* Infra → retries, parallel, tagging

---

# 5. Comprehensive Automatable Test Cases

---

## 5.1 Authentication Flows

### 5.1.1 Login Page

#### A1 Successful Login

| Field | Value |
|-------|-------|
| Scenario ID | A1 |
| Type | Functional |
| Priority | P0-Smoke |
| Page URL | [Login Page][2] |

**Steps**
1. Navigate to `/login`
2. Enter valid username and password
3. Click the Login button

**Expected Outcome**
Redirected to `/secure`; success flash message visible on page.

**Why It Matters**
Baseline auth validation and navigation assertion. This is the gate test — if A1 fails, all authenticated tests are invalid.

---

#### A2 Invalid Username

| Field | Value |
|-------|-------|
| Scenario ID | A2 |
| Type | Functional — Negative |
| Priority | P1-Critical |
| Page URL | [Login Page][2] |

**Steps**
1. Navigate to `/login`
2. Enter a username that does not exist
3. Enter any password
4. Click Login

**Expected Outcome**
User remains on `/login`; error message "Your username is invalid" is displayed.

**Why It Matters**
Validates that the system distinguishes between username and password errors rather than returning a generic "invalid credentials" message, which has UX and security implications.

---

#### A3 Invalid Password

| Field | Value |
|-------|-------|
| Scenario ID | A3 |
| Type | Functional — Negative |
| Priority | P1-Critical |
| Page URL | [Login Page][2] |

**Steps**
1. Navigate to `/login`
2. Enter a valid username with an incorrect password
3. Click Login

**Expected Outcome**
User remains on `/login`; error message "Your password is invalid" is displayed.

**Why It Matters**
Verifies the credential validation logic returns contextually correct error messages.

---

#### A4 Session Persistence After Page Refresh

| Field | Value |
|-------|-------|
| Scenario ID | A4 |
| Type | Functional — Security Baseline |
| Priority | P2-Regression |
| Page URL | [Login Page][2] |

**Steps**
1. Log in with valid credentials
2. Save session via Playwright `storageState`
3. Create a new browser context with the saved state
4. Navigate directly to `/secure`

**Expected Outcome**
No redirect to `/login`; authenticated session is still active.

**Why It Matters**
Validates that session cookies are set with correct flags and persist as expected. Also demonstrates Playwright's auth reuse pattern, which is a framework differentiator.

---

#### A5 Logout — Session Invalidation

| Field | Value |
|-------|-------|
| Scenario ID | A5 |
| Type | Functional — Security |
| Priority | P1-Critical |
| Page URL | [Login Page][2] |

**Steps**
1. Log in with valid credentials
2. Click the Logout button
3. Manually navigate to `/secure`

**Expected Outcome**
Redirected back to `/login`; session is fully invalidated server-side.

**Why It Matters**
Verifies server-side session teardown, not just a client-side redirect. A logout that only clears cookies client-side is a security vulnerability.

---

### 5.1.2 Register Page

#### A6 Valid Registration

| Field | Value |
|-------|-------|
| Scenario ID | A6 |
| Type | Functional — End-to-End |
| Priority | P0-Smoke |
| Page URL | [Register Page][27] |

**Steps**
1. Navigate to `/register`
2. Fill all fields with valid, unique data
3. Submit the form
4. Attempt to log in with the registered credentials

**Expected Outcome**
Registration succeeds with a success message; subsequent login with the same credentials succeeds.

**Why It Matters**
Validates the full registration → login journey end-to-end.

---

#### A7 Password Mismatch on Registration

| Field | Value |
|-------|-------|
| Scenario ID | A7 |
| Type | Functional — Negative |
| Priority | P1-Critical |
| Page URL | [Register Page][27] |

**Steps**
1. Navigate to `/register`
2. Enter a password in the password field
3. Enter a different value in the confirm-password field
4. Submit

**Expected Outcome**
Form does not submit; inline error on the confirm-password field indicating passwords do not match.

**Why It Matters**
Password mismatch is one of the most common registration bugs and a first point of failure for new users.

---

#### A8 Empty Fields on Registration

| Field | Value |
|-------|-------|
| Scenario ID | A8 |
| Type | Functional — Negative |
| Priority | P2-Regression |
| Page URL | [Register Page][27] |

**Steps**
1. Navigate to `/register`
2. Leave all fields empty
3. Click Submit

**Expected Outcome**
Required field validation errors appear on all mandatory fields; form is not submitted.

**Why It Matters**
Ensures required field constraints are enforced on the frontend before a backend call is made.

---

#### A9 Duplicate User Registration

| Field | Value |
|-------|-------|
| Scenario ID | A9 |
| Type | Functional — Negative |
| Priority | P1-Critical |
| Page URL | [Register Page][27] |

**Steps**
1. Register a new user successfully (or use a known existing account)
2. Attempt to register again with the same username/email

**Expected Outcome**
Backend returns a conflict message indicating the user already exists; no duplicate account is created.

**Why It Matters**
Duplicate-user handling is a common backend validation bug that can cause data integrity issues and login failures.

---

### 5.1.3 Forgot Password

#### A10 Forgot Password — Valid Registered Email

| Field | Value |
|-------|-------|
| Scenario ID | A10 |
| Type | Functional — Async Workflow |
| Priority | P2-Regression |
| Page URL | [Forgot Password Page][28] |

**Steps**
1. Navigate to `/forgot-password`
2. Enter a valid, registered email address
3. Submit the form

**Expected Outcome**
Success message displayed indicating a password reset link has been sent.

**Why It Matters**
Validates the trigger of an async notification workflow. The assertion is on the UI confirmation, not the email itself.

---

#### A11 Forgot Password — Invalid Email Format

| Field | Value |
|-------|-------|
| Scenario ID | A11 |
| Type | Functional — Negative |
| Priority | P2-Regression |
| Page URL | [Forgot Password Page][28] |

**Steps**
1. Navigate to `/forgot-password`
2. Enter a malformed email (e.g. `user@` or `notanemail`)
3. Submit

**Expected Outcome**
Format validation error shown; form not submitted to backend.

**Why It Matters**
Client-side email format validation should prevent unnecessary backend calls for invalid formats.

---

#### A12 Forgot Password — Unregistered Email

| Field | Value |
|-------|-------|
| Scenario ID | A12 |
| Type | Functional — Negative |
| Priority | P2-Regression |
| Page URL | [Forgot Password Page][28] |

**Steps**
1. Navigate to `/forgot-password`
2. Enter a valid-format email that is not registered in the system
3. Submit

**Expected Outcome**
Appropriate message shown (e.g. "If that email exists, a reset link has been sent" or an explicit not-found message).

**Why It Matters**
Tests backend handling for non-existent accounts; also validates whether the site leaks account existence information (security consideration).

---

### 5.1.4 OTP Flow

#### A13 OTP — Valid Code

| Field | Value |
|-------|-------|
| Scenario ID | A13 |
| Type | Functional — Multi-step |
| Priority | P1-Critical |
| Page URL | [Login Page][2] |

**Steps**
1. Trigger the OTP flow (login or register step that requires OTP)
2. Enter the correct OTP within the valid time window

**Expected Outcome**
Authentication proceeds to the next step; success state reached.

**Why It Matters**
Validates the happy path of a multi-step authentication flow.

---

#### A14 OTP — Expired Code

| Field | Value |
|-------|-------|
| Scenario ID | A14 |
| Type | Functional — Timing |
| Priority | P2-Regression |
| Page URL | [Login Page][2] |

**Steps**
1. Trigger the OTP flow
2. Wait for the OTP to expire (or inject an expired token)
3. Enter the expired OTP

**Expected Outcome**
Error message indicating the OTP has expired; user is prompted to request a new one.

**Why It Matters**
Timing-sensitive OTP flows are a known source of test flakiness. Tests must use event-driven waits, not `sleep()`.

---

#### A15 OTP — Incorrect Code

| Field | Value |
|-------|-------|
| Scenario ID | A15 |
| Type | Functional — Negative |
| Priority | P2-Regression |
| Page URL | [Login Page][2] |

**Steps**
1. Trigger the OTP flow
2. Enter a random incorrect OTP within the valid time window

**Expected Outcome**
Error message "Invalid OTP" or equivalent; user remains on the OTP entry step.

**Why It Matters**
Validates that incorrect codes are rejected without advancing the authentication state.

---

## 5.2 Form & Input Validation

### 5.2.1 Web Inputs

#### F1 Enter Valid Data — Text, Number, Date

| Field | Value |
|-------|-------|
| Scenario ID | F1 |
| Type | Functional |
| Priority | P1-Critical |
| Page URL | [Inputs Page][3] |

**Steps**
1. Navigate to `/inputs`
2. Enter a valid string in the text field
3. Enter a valid integer in the number field
4. Enter a valid date in the date field
5. Assert each field retains the entered value

**Expected Outcome**
All fields accept and retain their correct values; no cross-field contamination.

**Why It Matters**
Validates fundamental input handling across different HTML input types. Edge case: paste a string into a number field; enter a date outside the min/max range.

---

#### F2 Invalid Format Inputs

| Field | Value |
|-------|-------|
| Scenario ID | F2 |
| Type | Functional — Negative |
| Priority | P2-Regression |
| Page URL | [Inputs Page][3] |

**Steps**
1. Navigate to `/inputs`
2. Enter non-numeric characters in the number field
3. Enter an out-of-range value in the date field
4. Assert validation errors appear

**Expected Outcome**
HTML5 or custom validation errors fire on the affected fields; form cannot be submitted in invalid state.

**Why It Matters**
Input type constraints are often bypassed via automation; this test validates the constraint is enforced even when inputs are set programmatically.

---

#### F3 Clear and Reset Inputs

| Field | Value |
|-------|-------|
| Scenario ID | F3 |
| Type | Functional |
| Priority | P3-Extended |
| Page URL | [Inputs Page][3] |

**Steps**
1. Populate all input fields with valid data
2. Click the Clear or Reset button
3. Assert all fields return to their default/empty state

**Expected Outcome**
All inputs are empty or reset to placeholder values; no residual data remains.

**Why It Matters**
State bleed between tests is a common source of false failures in automation suites. This also validates the reset functionality itself.

---

### 5.2.2 Form Validation Page

#### F4 Submit Valid Form

| Field | Value |
|-------|-------|
| Scenario ID | F4 |
| Type | Functional |
| Priority | P1-Critical |
| Page URL | [Login Page][2] |

**Steps**
1. Navigate to the form validation page
2. Fill all fields with valid data
3. Submit the form

**Expected Outcome**
Form submits successfully; success confirmation is displayed.

**Why It Matters**
Establishes the happy-path baseline for form submission before negative tests are run.

---

#### F5 Required Field Missing

| Field | Value |
|-------|-------|
| Scenario ID | F5 |
| Type | Functional — Negative |
| Priority | P1-Critical |
| Page URL | [Login Page][2] |

**Steps**
1. Navigate to the form validation page
2. Leave one required field empty
3. Click Submit

**Expected Outcome**
Client-side validation fires before an HTTP request is sent (verifiable via network tab or `page.route()` interception); error shown on the empty field.

**Why It Matters**
Distinguishing frontend from backend validation is critical for understanding where a real bug lives and for attributing responsibility correctly during a defect.

---

#### F6 Invalid Format Validation

| Field | Value |
|-------|-------|
| Scenario ID | F6 |
| Type | Functional — Negative |
| Priority | P2-Regression |
| Page URL | [Login Page][2] |

**Steps**
1. Enter data in an invalid format (e.g. letters in a phone number field, badly formatted email)
2. Attempt to submit

**Expected Outcome**
Field-level format validation error; specific to the field with the invalid value.

**Why It Matters**
Format validation errors should be field-specific and not generic, to guide users to correct the right input.

---

### 5.2.3 Dropdown Page

#### F7 Dropdown — Select Single Option

| Field | Value |
|-------|-------|
| Scenario ID | F7 |
| Type | Functional |
| Priority | P1-Critical |
| Page URL | [Dropdown Page][4] |

**Steps**
1. Navigate to `/dropdown`
2. Select each option in the dropdown in sequence
3. After each selection, assert the selected value via the DOM `value` attribute or visible text

**Expected Outcome**
Each option can be selected; the selected value is reflected correctly in the DOM.

**Why It Matters**
Dropdown interactions are a common source of selector instability, especially when options are dynamically populated.

---

#### F8 Dropdown — Multi-select Handling

| Field | Value |
|-------|-------|
| Scenario ID | F8 |
| Type | Functional |
| Priority | P2-Regression |
| Page URL | [Dropdown Page][4] |

**Steps**
1. Navigate to the multi-select dropdown
2. Select two or more options simultaneously (Ctrl+click or `selectOption` with multiple values)
3. Assert all selected options are active

**Expected Outcome**
All selected options show as `selected` in the DOM; the selection persists simultaneously.

**Why It Matters**
Multi-select dropdowns require different Playwright API calls than single-select; confusing the two is a common framework error.

---

#### F9 Dropdown — Default and Invalid State

| Field | Value |
|-------|-------|
| Scenario ID | F9 |
| Type | Functional — Edge Case |
| Priority | P3-Extended |
| Page URL | [Dropdown Page][4] |

**Steps**
1. Load the page and assert the default "Please select" or blank option is active
2. Select the default/blank option after having selected a real value
3. Attempt to submit a form with the default/blank selection if applicable

**Expected Outcome**
Default state is correctly represented; re-selecting the blank option clears the selection; form submission with no selection triggers the required-field error.

**Why It Matters**
Dropdown default states are often overlooked in test design but are a source of real user-facing bugs.

---

## 5.3 UI Interaction Components

### 5.3.1 Checkboxes

#### U1 Checkbox — Select and Unselect

| Field | Value |
|-------|-------|
| Scenario ID | U1 |
| Type | Functional — State Validation |
| Priority | P1-Critical |
| Page URL | [Checkboxes Page][5] |

**Steps**
1. Navigate to `/checkboxes`
2. Check each checkbox and assert it is in `checked` state
3. Uncheck each checkbox and assert it is in `unchecked` state

**Expected Outcome**
`checked` attribute toggles correctly on each interaction; no double-fire events.

**Why It Matters**
State toggling validation — verifies the element responds to user interaction and the DOM reflects the change.

---

#### U2 Checkbox — Default State Validation

| Field | Value |
|-------|-------|
| Scenario ID | U2 |
| Type | Functional |
| Priority | P2-Regression |
| Page URL | [Checkboxes Page][5] |

**Steps**
1. Navigate to `/checkboxes`
2. Before interacting, assert the initial checked/unchecked state of each checkbox

**Expected Outcome**
Each checkbox starts in its expected default state as per the page specification.

**Why It Matters**
Default state validation is the baseline for all subsequent checkbox tests; if defaults change, toggle tests will produce false passes.

---

### 5.3.2 Radio Buttons

#### U3 Radio — Select One Option

| Field | Value |
|-------|-------|
| Scenario ID | U3 |
| Type | Functional |
| Priority | P1-Critical |
| Page URL | [Radio Buttons Page][6] |

**Steps**
1. Navigate to `/radio-buttons`
2. Click each radio button option one at a time
3. Assert the clicked option is in `checked` state after each click

**Expected Outcome**
Each radio option can be selected; the selected state is reflected in the DOM.

**Why It Matters**
Radio button selection is a core form interaction; validates that `click()` triggers the correct state change.

---

#### U4 Radio — Single-selection Exclusivity

| Field | Value |
|-------|-------|
| Scenario ID | U4 |
| Type | Functional |
| Priority | P2-Regression |
| Page URL | [Radio Buttons Page][6] |

**Steps**
1. Select radio option A
2. Select radio option B
3. Assert that option A is now unchecked and option B is checked

**Expected Outcome**
Only one radio button in the group can be active at any time; selecting B automatically deselects A.

**Why It Matters**
Mutual exclusivity is the defining constraint of radio buttons. Automation that skips this check misses the core behaviour.

---

### 5.3.3 Alerts / Dialogs

#### U5 Alert — Accept

| Field | Value |
|-------|-------|
| Scenario ID | U5 |
| Type | Functional — Browser Event |
| Priority | P1-Critical |
| Page URL | [Login Page][2] |

**Steps**
1. Navigate to the alerts page
2. Register a `dialog` event listener to accept the dialog
3. Trigger a JS `alert()`
4. Assert the page response after the alert is accepted

**Expected Outcome**
Alert is dismissed; page reflects the post-accept state.

**Why It Matters**
Unhandled dialogs crash Playwright tests silently with a timeout. This validates the `page.on('dialog')` handler is correctly set up.

---

#### U6 Confirm Dialog — Dismiss

| Field | Value |
|-------|-------|
| Scenario ID | U6 |
| Type | Functional — Browser Event |
| Priority | P1-Critical |
| Page URL | [Login Page][2] |

**Steps**
1. Register a `dialog` event listener to dismiss
2. Trigger a JS `confirm()` dialog
3. Assert the page reflects the "Cancel" outcome (vs the "OK" outcome)

**Expected Outcome**
Confirm dialog is dismissed; page state reflects the cancellation path.

**Why It Matters**
`confirm()` dialogs produce two different application paths depending on acceptance or dismissal; both paths must be testable.

---

#### U7 Prompt Dialog — Input and Accept

| Field | Value |
|-------|-------|
| Scenario ID | U7 |
| Type | Functional — Browser Event |
| Priority | P2-Regression |
| Page URL | [Login Page][2] |

**Steps**
1. Register a `dialog` event listener that calls `dialog.accept('test input')`
2. Trigger a JS `prompt()`
3. Assert the submitted value is reflected on the page

**Expected Outcome**
The value passed to `dialog.accept()` appears in the page output.

**Why It Matters**
Prompt dialogs accept user input that then feeds into application logic; testing this validates the full round-trip.

---

### 5.3.4 Windows and Tabs

#### U8 New Window — Open and Switch Context

| Field | Value |
|-------|-------|
| Scenario ID | U8 |
| Type | Functional — Multi-context |
| Priority | P1-Critical |
| Page URL | [Windows Page][7] |

**Steps**
1. Navigate to `/windows`
2. Use `context.waitForEvent('page')` before clicking the link that opens a new tab
3. Click the link
4. In the new page context, assert the correct URL and expected content

**Expected Outcome**
New page is captured; URL and content assertions pass in the new context.

**Why It Matters**
Lost page context is one of the most common bugs in automation frameworks. This validates the correct Playwright pattern for multi-page handling.

---

#### U9 New Window — Close and Return to Original

| Field | Value |
|-------|-------|
| Scenario ID | U9 |
| Type | Functional — Multi-context |
| Priority | P2-Regression |
| Page URL | [Windows Page][7] |

**Steps**
1. Open a new tab as per U8
2. Close the new tab
3. Assert the original page context is still active and its state is preserved

**Expected Outcome**
Original page is unaffected after the new tab is closed; no context switch errors.

**Why It Matters**
Ensures that closing a child context does not corrupt or lose the parent context state.

---

## 5.4 Advanced UI Scenarios

### 5.4.1 Drag and Drop

#### V1 Drag Element A to Drop Zone B

| Field | Value |
|-------|-------|
| Scenario ID | V1 |
| Type | Functional — Complex Interaction |
| Priority | P1-Critical |
| Page URL | [Practice Test Automation WebSite][1] |

**Steps**
1. Navigate to the drag-and-drop page
2. Use `locator.dragTo(target)` to drag element A onto drop zone B
3. Assert element A is now present in zone B

**Expected Outcome**
Element is present in the target zone; source zone is empty or shows a placeholder.

**Why It Matters**
Drag-and-drop is a high-risk interaction for flakiness. Tag with `@flaky` and allow 2 retries; use `dragTo()` with `force: true` if needed.

---

#### V2 Post-Drop State Validation

| Field | Value |
|-------|-------|
| Scenario ID | V2 |
| Type | Functional |
| Priority | P2-Regression |
| Page URL | [Practice Test Automation WebSite][1] |

**Steps**
1. Complete drag-and-drop as per V1
2. Assert the visual state of both source and target zones
3. If the page has a confirmation state (e.g. text change, colour change), assert it

**Expected Outcome**
Both source and target zones reflect the correct post-drop state.

**Why It Matters**
Validates that the drop event triggers the expected application state change, not just that the element moved visually.

---

### 5.4.2 Drag and Drop Circles

#### V3 Circle Position Validation

| Field | Value |
|-------|-------|
| Scenario ID | V3 |
| Type | Functional — Coordinate-Based |
| Priority | P2-Regression |
| Page URL | [Practice Test Automation WebSite][1] |

**Steps**
1. Navigate to the drag circles page
2. Drag a circular element to a specific coordinate region
3. Assert the element's final bounding box is within the expected drop zone bounds

**Expected Outcome**
Element's `boundingBox()` falls within the expected coordinate range after drop.

**Why It Matters**
Coordinate-based drag operations require precise mouse simulation; exercises Playwright's `mouse.move()` and `mouse.up()` APIs.

---

#### V4 Multi-Element Circle Interaction

| Field | Value |
|-------|-------|
| Scenario ID | V4 |
| Type | Functional — Complex Interaction |
| Priority | P3-Extended |
| Page URL | [Practice Test Automation WebSite][1] |

**Steps**
1. Drag multiple circle elements to different target positions
2. Assert each element ends in its intended position without interfering with others

**Expected Outcome**
All circles are in their correct positions; no unintended interaction between drag operations.

**Why It Matters**
Multi-element drag tests reveal race conditions and coordinate calculation errors that single-element tests miss.

---

### 5.4.3 File Upload

#### V5 Upload Valid File (Under 500KB)

| Field | Value |
|-------|-------|
| Scenario ID | V5 |
| Type | Functional |
| Priority | P1-Critical |
| Page URL | [Upload Page][8] |

**Steps**
1. Navigate to `/upload`
2. Use `page.setInputFiles()` with a valid file from the fixtures directory
3. Assert the filename is shown in the UI and a success message is displayed

**Expected Outcome**
Filename appears in the upload confirmation area; success state confirmed.

**Why It Matters**
`setInputFiles()` requires the input element to be visible or uses `{ force: true }` for hidden inputs. This establishes the correct pattern for the framework.

---

#### V6 Reject Oversized File

| Field | Value |
|-------|-------|
| Scenario ID | V6 |
| Type | Functional — Negative |
| Priority | P2-Regression |
| Page URL | [Upload Page][8] |

**Steps**
1. Navigate to `/upload`
2. Attempt to upload a file exceeding the size limit (e.g. 2MB)
3. Assert an error message is shown

**Expected Outcome**
Upload is rejected; a clear error message indicates the file size limit.

**Why It Matters**
File size validation is a common edge case that is often only enforced on the frontend and bypassed by programmatic upload.

---

#### V7 File Upload via Drag-and-Drop Zone

| Field | Value |
|-------|-------|
| Scenario ID | V7 |
| Type | Functional |
| Priority | P2-Regression |
| Page URL | [Upload Page][8] |

**Steps**
1. Navigate to `/upload`
2. Use Playwright's drag-and-drop simulation to drop a file onto the upload drop zone (not the input button)
3. Assert the filename appears and upload succeeds

**Expected Outcome**
File upload via drag-and-drop zone works identically to the input button method.

**Why It Matters**
Drag-to-upload uses a different code path than input-based upload; both paths must be independently validated.

---

## 5.5 Dynamic DOM / Flaky Scenarios

### 5.5.1 Dynamic Table

#### D1 Extract Chrome CPU Value Without Static Locators

| Field | Value |
|-------|-------|
| Scenario ID | D1 |
| Type | Functional — Dynamic DOM |
| Priority | P1-Critical |
| Page URL | [Dynamic Table Page][9] |

**Steps**
1. Navigate to `/dynamic-table`
2. Locate the table headers to determine the index of the "CPU" column dynamically
3. Locate the row where the first column value is "Chrome"
4. Extract the CPU value from the intersecting cell
5. Assert the value is a valid numeric percentage

**Expected Outcome**
CPU value for Chrome is extracted correctly regardless of column order changes.

**Why It Matters**
This is the canonical "no static locator" scenario. Tests that hardcode `td:nth-child(3)` will fail when column order changes. Header-relative traversal is the correct pattern.

---

#### D2 Column and Row Header-Relative Traversal

| Field | Value |
|-------|-------|
| Scenario ID | D2 |
| Type | Functional — Dynamic DOM |
| Priority | P2-Regression |
| Page URL | [Dynamic Table Page][9] |

**Steps**
1. On each page load (run 3 times), extract the same data point using header-relative logic
2. Assert the extracted value is consistent and valid across all runs

**Expected Outcome**
Data extraction logic is stable across page loads where column/row order may change.

**Why It Matters**
Demonstrates the framework's resilience to DOM structure changes — a key differentiator in production-grade test suites.

---

### 5.5.2 Dynamic Pagination Table

#### D3 Change Page Size

| Field | Value |
|-------|-------|
| Scenario ID | D3 |
| Type | Functional — Async Rendering |
| Priority | P2-Regression |
| Page URL | [Dynamic Table Page][9] |

**Steps**
1. Navigate to the pagination table
2. Change the rows-per-page selector to 5
3. Wait for the table to re-render
4. Count visible rows and assert exactly 5 are shown

**Expected Outcome**
Table displays exactly 5 rows after the page size change.

**Why It Matters**
Table re-rendering is asynchronous; assertions must wait for stable DOM state rather than asserting immediately after interaction.

---

#### D4 Sort Column Ascending and Descending

| Field | Value |
|-------|-------|
| Scenario ID | D4 |
| Type | Functional — Async Rendering |
| Priority | P2-Regression |
| Page URL | [Dynamic Table Page][9] |

**Steps**
1. Click a sortable column header once (ascending)
2. Assert the first row value is the lowest/earliest in the column
3. Click the same header again (descending)
4. Assert the first row value is the highest/latest

**Expected Outcome**
Sort order is correctly applied in both directions; first visible row reflects the sort order.

**Why It Matters**
Sort assertions must re-query the DOM after the async re-render completes. Static selectors captured before the sort will contain stale references.

---

#### D5 Filter Results

| Field | Value |
|-------|-------|
| Scenario ID | D5 |
| Type | Functional — Async Rendering |
| Priority | P2-Regression |
| Page URL | [Dynamic Table Page][9] |

**Steps**
1. Type a search term into the filter/search input
2. Wait for the table to re-render
3. Assert all visible rows contain the search term in the relevant column

**Expected Outcome**
Only rows matching the filter are displayed; rows not matching are hidden.

**Why It Matters**
Filter tests reveal async rendering issues. All visible rows must contain the term — a partial match on visible rows is a bug.

---

### 5.5.3 Locator Playground

#### D6 All Locator Strategy Types

| Field | Value |
|-------|-------|
| Scenario ID | D6 |
| Type | Framework Validation |
| Priority | P2-Regression |
| Page URL | [Locators Page][10] |

**Steps**
1. Navigate to `/locators`
2. Use each strategy in sequence — ID, CSS class, XPath, visible text, ARIA role, `data-testid` — to locate the same element
3. Assert each resolves to the same element

**Expected Outcome**
All strategies return the same element; none throw strict-mode violations or timeout.

**Why It Matters**
Demonstrates locator hierarchy awareness: `data-testid` > role > text > CSS > XPath. Critical for building a resilient POM.

---

#### D7 Switch Locator Type and Assert Equivalence

| Field | Value |
|-------|-------|
| Scenario ID | D7 |
| Type | Framework Validation |
| Priority | P3-Extended |
| Page URL | [Locators Page][10] |

**Steps**
1. Locate an element using a fragile XPath
2. Locate the same element using a resilient `data-testid` or role selector
3. Assert both resolve to the same DOM node (compare `textContent` or `innerHTML`)

**Expected Outcome**
Both strategies resolve to the same element; resilient selector is documented as the preferred pattern.

**Why It Matters**
Locator strategy decisions made during framework setup have long-term maintenance implications. This test documents and validates the preference for resilient selectors.

---

## 5.6 API Testing (Notes API)

### 5.6.1 Notes API — Core CRUD

#### P1 Create Note — Valid Payload

| Field | Value |
|-------|-------|
| Scenario ID | P1 |
| Type | API — Functional |
| Priority | P0-Smoke |
| Page URL | [Notes API Docs][29] |

**Steps**
1. Authenticate via `POST /notes/api/users/login` and extract the token
2. Send `POST /notes/api/notes` with a valid title, description, and category
3. Extract the `noteId` from the response

**Expected Outcome**
Response status `201`; response body contains all submitted fields plus system-generated fields (`id`, `created_at`).

**Why It Matters**
The Create operation is the prerequisite for all other CRUD tests. P0 because if note creation is broken, the entire API test suite is invalid.

---

#### P2 Get Note — By ID

| Field | Value |
|-------|-------|
| Scenario ID | P2 |
| Type | API — Functional |
| Priority | P1-Critical |
| Page URL | [Notes API Docs][29] |

**Steps**
1. Create a note (P1)
2. Send `GET /notes/api/notes/:id` using the extracted `noteId`

**Expected Outcome**
Response status `200`; response body exactly matches the data submitted during creation.

**Why It Matters**
Validates that the created resource is persisted and retrievable. Data round-trip integrity test.

---

#### P3 Update Note — Full and Partial Update

| Field | Value |
|-------|-------|
| Scenario ID | P3 |
| Type | API — Functional |
| Priority | P1-Critical |
| Page URL | [Notes API Docs][29] |

**Steps**
1. Create a note (P1)
2. Send `PUT /notes/api/notes/:id` with updated title and body
3. Fetch the note again via GET

**Expected Outcome**
`PUT` returns `200`; subsequent `GET` returns the updated values, not the original.

**Why It Matters**
Validates that the update operation modifies the correct record and that changes are persisted, not just returned in the PUT response.

---

#### P4 Delete Note — Verify 404 After Deletion

| Field | Value |
|-------|-------|
| Scenario ID | P4 |
| Type | API — Functional |
| Priority | P1-Critical |
| Page URL | [Notes API Docs][29] |

**Steps**
1. Create a note (P1)
2. Send `DELETE /notes/api/notes/:id`
3. Attempt `GET /notes/api/notes/:id` for the deleted note

**Expected Outcome**
`DELETE` returns `200`; subsequent `GET` returns `404 Not Found`.

**Why It Matters**
Validates the entire delete lifecycle: that delete actually removes the resource, not just marks it as inactive.

---

### 5.6.2 Notes API — Advanced

#### P5 Invalid Payload — Missing Required Fields

| Field | Value |
|-------|-------|
| Scenario ID | P5 |
| Type | API — Negative |
| Priority | P1-Critical |
| Page URL | [Notes API Docs][29] |

**Steps**
1. Send `POST /notes/api/notes` with the `title` field omitted
2. Send `POST /notes/api/notes` with `title` exceeding max length

**Expected Outcome**
Both requests return `400 Bad Request` with a descriptive error body; no note is created.

**Why It Matters**
API input validation must reject malformed requests with clear error messages, not return 500 errors.

---

#### P6 API Auth — Boundary Testing

| Field | Value |
|-------|-------|
| Scenario ID | P6 |
| Type | API — Security |
| Priority | P1-Critical |
| Page URL | [Notes API Docs][29] |

**Steps**
1. Call `POST /notes/api/notes` with no Authorization header → assert `401`
2. Call with an expired or invalid token → assert `401`
3. Call `GET /notes/api/notes/:id` for a note owned by a different user → assert `403`

**Expected Outcome**
Unauthenticated requests return `401`; cross-user access attempts return `403`.

**Why It Matters**
Auth boundary failures are a critical security risk. These should be in every regression run and treated as P1-Critical.

---

#### P7 Schema Validation — Response Contract

| Field | Value |
|-------|-------|
| Scenario ID | P7 |
| Type | API — Contract Testing |
| Priority | P2-Regression |
| Page URL | [Notes API Docs][29] |

**Steps**
1. Call `GET /notes/api/notes/:id` for a valid note
2. Validate the response JSON against a defined Zod or ajv schema
3. Check all expected fields are present: `id`, `title`, `description`, `completed`, `created_at`, `updated_at`
4. Check correct data types for each field
5. Assert no unexpected fields are present

**Expected Outcome**
Zero schema drift; all fields present with correct types; no extra fields leaking.

**Why It Matters**
Schema drift is invisible to functional tests — a renamed field breaks API clients silently without any error in the test suite.

---

#### P8 Response Time Baseline

| Field | Value |
|-------|-------|
| Scenario ID | P8 |
| Type | Performance — API Baseline |
| Priority | P2-Regression |
| Page URL | [Notes API Docs][29] |

**Steps**
1. Run `GET /notes/api/notes` ten times in sequence
2. Record the response time for each call
3. Assert no individual call exceeds 2000ms
4. Assert the P95 response time is under 1000ms

**Expected Outcome**
All calls complete within threshold; P95 under 1000ms.

**Why It Matters**
Establishes a performance contract for the API. Regressions in response time are caught before they reach production.

---

### 5.6.3 Practice API

#### Q1 GET /health — API Availability Check

| Field | Value |
|-------|-------|
| Scenario ID | Q1 |
| Type | API — Smoke |
| Priority | P0-Smoke |
| Page URL | [Practice API Docs][26] |

**Steps**
1. Send `GET` to the health or root endpoint of the practice API
2. Assert the response status and body

**Expected Outcome**
`200 OK`; response body confirms the API is operational.

**Why It Matters**
API smoke test — confirms the service is reachable before any other API tests run.

---

#### Q2 Practice API — Authenticated Endpoint

| Field | Value |
|-------|-------|
| Scenario ID | Q2 |
| Type | API — Functional |
| Priority | P1-Critical |
| Page URL | [Practice API Docs][26] |

**Steps**
1. Obtain an auth token via the login endpoint
2. Call an authenticated endpoint with the token
3. Call the same endpoint without the token

**Expected Outcome**
Authenticated call returns `200`; unauthenticated call returns `401`.

**Why It Matters**
Validates auth enforcement on the practice API, separate from the Notes API, demonstrating multi-API testing capability.

---

#### Q3 Practice API — Schema Validation

| Field | Value |
|-------|-------|
| Scenario ID | Q3 |
| Type | API — Contract |
| Priority | P2-Regression |
| Page URL | [Practice API Docs][26] |

**Steps**
1. Call a data-returning endpoint on the practice API
2. Validate the response against a defined schema

**Expected Outcome**
Response matches the documented contract; no missing or extra fields.

**Why It Matters**
Demonstrates that schema validation is applied consistently across both APIs in the framework, not just the Notes API.

---

## 5.7 Observability & System Signals

### 5.7.1 Browser Info Page

#### O1 Detect Browser Type

| Field | Value |
|-------|-------|
| Scenario ID | O1 |
| Type | Cross-Browser — Environment Validation |
| Priority | P2-Regression |
| Page URL | [Practice Test Automation WebSite][1] |

**Steps**
1. Run the test in Chromium, Firefox, and WebKit
2. On each, navigate to the browser info page
3. Read the detected browser name from the page

**Expected Outcome**
The detected browser name matches the actual browser engine being used.

**Why It Matters**
Validates that browser detection works correctly per engine — useful for tests that conditionally branch based on the browser.

---

#### O2 Validate Correct Browser Detection

| Field | Value |
|-------|-------|
| Scenario ID | O2 |
| Type | Cross-Browser |
| Priority | P2-Regression |
| Page URL | [Practice Test Automation WebSite][1] |

**Steps**
1. Run the detection test across all three browsers
2. Assert the detected value in each matches the expected engine name (e.g. "Chrome", "Firefox", "WebKit")

**Expected Outcome**
Zero mismatches between actual browser engine and detected value.

**Why It Matters**
Confirms the detection logic does not misidentify the browser, which could cause conditional logic to misbehave.

---

### 5.7.2 Reporting Integration

#### O3 Allure Report Generation

| Field | Value |
|-------|-------|
| Scenario ID | O3 |
| Type | Tooling / Observability |
| Priority | P3-Extended |
| Page URL | [Practice Test Automation WebSite][1] |

**Steps**
1. Run a subset of the test suite with the Allure reporter enabled
2. Assert that Allure report artifacts (`allure-results/`) are generated in the output directory
3. Generate the HTML report and open it

**Expected Outcome**
Report files are generated; test names, statuses, and step-level details are present in the report.

**Why It Matters**
Validates the reporting integration is functional and that test results are captured at the correct granularity.

---

#### O4 Test Result Mapping Accuracy

| Field | Value |
|-------|-------|
| Scenario ID | O4 |
| Type | Tooling / Observability |
| Priority | P3-Extended |
| Page URL | [Practice Test Automation WebSite][1] |

**Steps**
1. Run a known set of tests (some passing, some failing)
2. Compare the pass/fail counts in the terminal output vs the Allure report

**Expected Outcome**
Zero mismatch between test runner output and Allure report; every test maps to an entry in the report.

**Why It Matters**
Report accuracy is critical for CI/CD pipelines. A report that silently misses failures gives false confidence.

---

## 5.8 Browser-Level & Advanced DOM

### 5.8.1 Shadow DOM

#### B1 Locate Element Inside Shadow DOM Root

| Field | Value |
|-------|-------|
| Scenario ID | B1 |
| Type | Functional |
| Priority | P1-Critical |
| Page URL | [Shadow DOM Page][11] |

**Steps**
1. Navigate to `/shadowdom`
2. Use Playwright's pierce selector (`>>`) or `locator` with shadow DOM support to access an element inside the shadow root
3. Assert the element's text content or attribute

**Expected Outcome**
Element inside the shadow root is located and its value is asserted correctly.

**Why It Matters**
Shadow DOM encapsulation blocks standard CSS selectors. Playwright's pierce syntax must be validated — this pattern is needed for Web Component-based design systems.

---

#### B2 Interact With Shadow DOM Input

| Field | Value |
|-------|-------|
| Scenario ID | B2 |
| Type | Functional |
| Priority | P2-Regression |
| Page URL | [Shadow DOM Page][11] |

**Steps**
1. Navigate to `/shadowdom`
2. Pierce the shadow root and locate a form input inside it
3. Fill the input and submit
4. Assert the form state updates correctly inside the shadow root

**Expected Outcome**
Input interaction inside the shadow root triggers the expected state change.

**Why It Matters**
Interacting with shadow DOM inputs is a distinct challenge from locating them. Fill and submit must be validated separately from location.

---

#### B3 Nested Shadow DOM Traversal

| Field | Value |
|-------|-------|
| Scenario ID | B3 |
| Type | Functional — Edge Case |
| Priority | P3-Extended |
| Page URL | [Shadow DOM Page][11] |

**Steps**
1. Navigate to `/shadowdom`
2. Traverse multiple levels of nested shadow hosts
3. Locate and interact with an element at the deepest level

**Expected Outcome**
Deepest element is reachable and operable; no selector resolution errors.

**Why It Matters**
Nested shadow DOM is used by complex Web Components. This edge case tests the limits of Playwright's shadow DOM support.

---

### 5.8.2 iFrame

#### B4 Interact With Element Inside Internal iFrame

| Field | Value |
|-------|-------|
| Scenario ID | B4 |
| Type | Functional |
| Priority | P1-Critical |
| Page URL | [iFrame Page][24] |

**Steps**
1. Navigate to `/iframe`
2. Use `page.frameLocator('iframe')` to switch context into the frame
3. Locate an element inside the frame and interact with it
4. Assert the expected action result

**Expected Outcome**
Element inside the iFrame is located and interacted with successfully.

**Why It Matters**
iFrames appear in embedded payment widgets, video players, and third-party forms. `frameLocator()` is the correct Playwright API and must be exercised.

---

#### B5 External iFrame — Assert src Attribute

| Field | Value |
|-------|-------|
| Scenario ID | B5 |
| Type | Functional |
| Priority | P2-Regression |
| Page URL | [iFrame Page][24] |

**Steps**
1. Navigate to `/iframe`
2. Locate the `<iframe>` element in the DOM (without switching context into it)
3. Read the `src` attribute

**Expected Outcome**
The `src` attribute contains the expected external URL.

**Why It Matters**
Validates that the correct external content is being embedded, without requiring interaction inside the frame.

---

#### B6 Nested iFrame Interaction

| Field | Value |
|-------|-------|
| Scenario ID | B6 |
| Type | Functional — Edge Case |
| Priority | P3-Extended |
| Page URL | [iFrame Page][24] |

**Steps**
1. Switch context into the outer iFrame
2. Switch context into an inner iFrame nested within
3. Interact with an element in the innermost frame

**Expected Outcome**
Nested frame context switch succeeds; element interaction in the inner frame works correctly.

**Why It Matters**
Nested iFrames are encountered in complex legacy UIs and some embedded tools. Chained `frameLocator()` calls must be validated.

---

### 5.8.3 Geolocation Mocking

#### B7 Mock Specific Coordinates and Assert Display

| Field | Value |
|-------|-------|
| Scenario ID | B7 |
| Type | Functional — Browser API Mocking |
| Priority | P1-Critical |
| Page URL | [Geolocation Page][12] |

**Steps**
1. Create a browser context with `geolocation: { latitude: 51.5074, longitude: -0.1278 }` (London)
2. Grant geolocation permissions for the target origin
3. Navigate to `/geolocation`
4. Trigger the location read action
5. Assert the displayed coordinates or location name matches the mocked values

**Expected Outcome**
Page displays the mocked latitude/longitude or a location name corresponding to the mocked coordinates.

**Why It Matters**
Geolocation mocking is a Playwright context-level feature. This validates that the mock is injected correctly before page load, and that the application reads from the browser API rather than a backend service.

---

#### B8 Deny Geolocation Permission

| Field | Value |
|-------|-------|
| Scenario ID | B8 |
| Type | Functional — Permission Handling |
| Priority | P2-Regression |
| Page URL | [Geolocation Page][12] |

**Steps**
1. Create a browser context with geolocation permission set to `'denied'`
2. Navigate to `/geolocation`
3. Trigger the location read action

**Expected Outcome**
Page shows an appropriate error message or fallback behaviour when geolocation is denied.

**Why It Matters**
Validates graceful degradation when browser permissions are denied — a real scenario for users who have blocked location access.

---

### 5.8.4 Context Menu

#### B9 Right-Click Triggers Context Menu

| Field | Value |
|-------|-------|
| Scenario ID | B9 |
| Type | Functional |
| Priority | P1-Critical |
| Page URL | [Context Menu Page][16] |

**Steps**
1. Navigate to `/context-menu`
2. Right-click on the target element using `locator.click({ button: 'right' })`
3. Assert the context menu or custom menu appears

**Expected Outcome**
Context menu is visible in the DOM after right-click.

**Why It Matters**
Right-click menus are used in rich text editors and file managers. Tests require explicit `button: 'right'` configuration — a common omission in beginner frameworks.

---

#### B10 Select Option From Context Menu

| Field | Value |
|-------|-------|
| Scenario ID | B10 |
| Type | Functional |
| Priority | P2-Regression |
| Page URL | [Context Menu Page][16] |

**Steps**
1. Right-click to open the context menu (B9)
2. Click a menu item
3. Assert the expected action result (alert, page change, or state change)

**Expected Outcome**
Selected menu item triggers the expected application action.

**Why It Matters**
Opening a context menu and selecting from it are distinct interactions; both must be validated for the complete user journey.

---

### 5.8.5 Tooltips

#### B11 Hover to Reveal Tooltip

| Field | Value |
|-------|-------|
| Scenario ID | B11 |
| Type | Functional |
| Priority | P1-Critical |
| Page URL | [Tooltips Page][15] |

**Steps**
1. Navigate to `/tooltips`
2. Use `locator.hover()` on the target element
3. Wait for the tooltip to become visible
4. Assert the tooltip element is visible in the DOM

**Expected Outcome**
Tooltip element transitions from hidden to visible after hover; assertion passes.

**Why It Matters**
Tooltips are commonly implemented with CSS `:hover` or JS visibility toggling. Both require `hover()` before asserting visibility.

---

#### B12 Tooltip Text Content Validation

| Field | Value |
|-------|-------|
| Scenario ID | B12 |
| Type | Functional |
| Priority | P2-Regression |
| Page URL | [Tooltips Page][15] |

**Steps**
1. Hover over the target element to reveal the tooltip (B11)
2. Assert the tooltip text matches the expected copy

**Expected Outcome**
Tooltip text matches the expected value exactly.

**Why It Matters**
Tooltip text is often used for accessibility and instructional copy. Changes to tooltip text indicate UI copy regressions.

---

## 5.9 Dynamic & Async Content

### 5.9.1 Infinite Scroll

#### Y1 Scroll Triggers New Content Load

| Field | Value |
|-------|-------|
| Scenario ID | Y1 |
| Type | Functional — Async |
| Priority | P1-Critical |
| Page URL | [Infinite Scroll Page][13] |

**Steps**
1. Navigate to `/infinite-scroll`
2. Count the initial number of items
3. Scroll to the bottom of the page using `page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))`
4. Wait for new items to load
5. Count items again

**Expected Outcome**
Item count increases after scroll; new items are appended, not replacing existing ones.

**Why It Matters**
Infinite scroll requires event-driven waits after scroll, not fixed `sleep()`. This validates the correct async wait pattern.

---

#### Y2 Multiple Scroll Cycles Accumulate Content

| Field | Value |
|-------|-------|
| Scenario ID | Y2 |
| Type | Functional — Async |
| Priority | P2-Regression |
| Page URL | [Infinite Scroll Page][13] |

**Steps**
1. Scroll to the bottom 3 times in sequence
2. After each scroll, wait for new items
3. Assert total item count increases after each scroll cycle

**Expected Outcome**
Items accumulate correctly across multiple scroll events; count increases monotonically.

**Why It Matters**
Multiple scroll cycles reveal whether the framework's wait logic is correct for each cycle, not just the first.

---

#### Y3 No Duplicate Items After Scroll

| Field | Value |
|-------|-------|
| Scenario ID | Y3 |
| Type | Functional — Data Integrity |
| Priority | P2-Regression |
| Page URL | [Infinite Scroll Page][13] |

**Steps**
1. Scroll until at least 20 items are loaded
2. Collect all item text values
3. Assert no duplicate text values exist in the collection

**Expected Outcome**
All loaded items are unique; no content is repeated.

**Why It Matters**
Duplicate items after infinite scroll indicate a pagination offset bug in the backend or a frontend rendering error.

---

### 5.9.2 Horizontal Slider

#### Y4 Drag Slider to Specific Value via Mouse

| Field | Value |
|-------|-------|
| Scenario ID | Y4 |
| Type | Functional |
| Priority | P1-Critical |
| Page URL | [Horizontal Slider Page][14] |

**Steps**
1. Navigate to `/horizontal-slider`
2. Get the slider's bounding box
3. Calculate the target x-coordinate for a specific value
4. Click-drag the slider thumb to that position
5. Assert the displayed value matches the expected value

**Expected Outcome**
Slider value updates to the expected number after mouse drag.

**Why It Matters**
Slider interactions require coordinate-based mouse simulation. Validates Playwright's mouse drag API for range input elements.

---

#### Y5 Increment Slider via Keyboard Arrow Keys

| Field | Value |
|-------|-------|
| Scenario ID | Y5 |
| Type | Functional — Accessibility |
| Priority | P2-Regression |
| Page URL | [Horizontal Slider Page][14] |

**Steps**
1. Focus the slider element
2. Press the `ArrowRight` key N times
3. Assert the displayed value increments by the expected step for each keypress

**Expected Outcome**
Value increments correctly with each `ArrowRight` press; `ArrowLeft` decrements correctly.

**Why It Matters**
Keyboard-accessible sliders are an accessibility requirement. Validates keyboard navigation works independently of mouse interaction.

---

#### Y6 Slider Boundary — Cannot Exceed Max or Min

| Field | Value |
|-------|-------|
| Scenario ID | Y6 |
| Type | Functional — Edge Case |
| Priority | P2-Regression |
| Page URL | [Horizontal Slider Page][14] |

**Steps**
1. Drag the slider beyond its maximum position
2. Assert the value is clamped at the maximum
3. Drag below the minimum position
4. Assert the value is clamped at the minimum

**Expected Outcome**
Slider value is clamped at the defined min/max boundaries; no out-of-range values are possible.

**Why It Matters**
Boundary clamping is a fundamental constraint of range inputs. Out-of-range values passed to a backend can cause data validation errors.

---

### 5.9.3 Challenging DOM

#### Y7 Locate Stable Element Despite Changing Locators

| Field | Value |
|-------|-------|
| Scenario ID | Y7 |
| Type | Functional — Locator Resilience |
| Priority | P1-Critical |
| Page URL | [Challenging DOM Page][18] |

**Steps**
1. Navigate to `/challenging-dom` multiple times (or refresh the page)
2. On each load, use a resilient selector (role, text, `data-testid`) to locate the target element
3. Assert the element is found consistently

**Expected Outcome**
Element is located correctly on every page load despite any locator changes.

**Why It Matters**
This page is explicitly designed to break fragile locator strategies. Validates that the framework uses resilient selectors throughout the POM.

---

#### Y8 Button Click Causes DOM Mutation

| Field | Value |
|-------|-------|
| Scenario ID | Y8 |
| Type | Functional |
| Priority | P2-Regression |
| Page URL | [Challenging DOM Page][18] |

**Steps**
1. Navigate to `/challenging-dom`
2. Click a button on the page
3. Assert the expected DOM change (text, class, or element addition)

**Expected Outcome**
The DOM mutation triggered by the button click is correctly detected and asserted.

**Why It Matters**
Challenging DOM pages deliberately use IDs and classes that change on each load. Locating a button and asserting its effect requires role- or text-based selectors.

---

### 5.9.4 Large Page / Deep DOM

#### Y9 Locate Deeply Nested Element Without Timeout

| Field | Value |
|-------|-------|
| Scenario ID | Y9 |
| Type | Performance — Locator Engine |
| Priority | P2-Regression |
| Page URL | [Large Page][19] |

**Steps**
1. Navigate to `/large-page`
2. Locate an element deeply nested in the DOM tree
3. Assert it is found within the default Playwright timeout

**Expected Outcome**
Element is located within the timeout without requiring timeout extension.

**Why It Matters**
Deep DOM trees stress the locator engine. If the default timeout is consistently insufficient, it indicates the selector strategy needs to be optimised.

---

#### Y10 Page Load Performance Threshold

| Field | Value |
|-------|-------|
| Scenario ID | Y10 |
| Type | Performance |
| Priority | P3-Extended |
| Page URL | [Large Page][19] |

**Steps**
1. Record `performance.timing` or use `page.goto()` with timing capture
2. Assert the `domContentLoaded` event fires within 3000ms

**Expected Outcome**
Page reaches `domContentLoaded` within the defined threshold.

**Why It Matters**
Large pages are a performance stress test. Establishing a baseline here allows regressions to be caught if new content is added.

---

## 5.10 HTTP & Network Behaviour

### 5.10.1 Status Codes

#### N1 Trigger and Assert 200 OK

| Field | Value |
|-------|-------|
| Scenario ID | N1 |
| Type | Functional — Network |
| Priority | P1-Critical |
| Page URL | [Status Codes Page][20] |

**Steps**
1. Navigate to `/status-codes`
2. Click the link for status code 200
3. Intercept the response using `page.route()` or assert the navigated URL returns 200

**Expected Outcome**
Response status code is `200`.

**Why It Matters**
Validates the baseline success case for HTTP status code handling.

---

#### N2 Trigger and Assert 404 Not Found

| Field | Value |
|-------|-------|
| Scenario ID | N2 |
| Type | Functional — Network |
| Priority | P1-Critical |
| Page URL | [Status Codes Page][20] |

**Steps**
1. Navigate to `/status-codes`
2. Click the link for status code 404
3. Assert the response status is `404`

**Expected Outcome**
Response status `404`; page reflects the not-found state correctly.

**Why It Matters**
404 handling is a key error boundary. Validates Playwright's network interception for status code assertion.

---

#### N3 Trigger and Assert 500 — Graceful Handling

| Field | Value |
|-------|-------|
| Scenario ID | N3 |
| Type | Functional — Error Boundary |
| Priority | P2-Regression |
| Page URL | [Status Codes Page][20] |

**Steps**
1. Navigate to `/status-codes`
2. Trigger the 500 status code link
3. Assert the response is `500` and the page handles it gracefully (no unhandled crash)

**Expected Outcome**
Response status `500`; application displays an error page or message rather than an unhandled exception.

**Why It Matters**
5xx responses should be handled gracefully. This validates both the status code and the application's error boundary behaviour.

---

### 5.10.2 Broken Images

#### N4 Detect Broken Images on Page

| Field | Value |
|-------|-------|
| Scenario ID | N4 |
| Type | Functional — Quality Gate |
| Priority | P1-Critical |
| Page URL | [Broken Images Page][21] |

**Steps**
1. Navigate to `/broken-images`
2. Collect all `<img>` elements on the page
3. For each, evaluate `naturalWidth` in the browser context
4. Flag any image where `naturalWidth === 0` as broken

**Expected Outcome**
Broken images are correctly identified; valid images have `naturalWidth > 0`.

**Why It Matters**
Broken image detection is a quality gate in visual regression and SEO audits. Demonstrates network-level assertion capability.

---

#### N5 Count Broken vs Valid Images

| Field | Value |
|-------|-------|
| Scenario ID | N5 |
| Type | Functional |
| Priority | P2-Regression |
| Page URL | [Broken Images Page][21] |

**Steps**
1. Collect all images as per N4
2. Count broken and valid images separately
3. Assert the broken image count matches the known expected count for this page

**Expected Outcome**
Broken count equals the expected number; valid count equals the total minus the expected broken.

**Why It Matters**
Knowing the expected count prevents regressions from silently adding new broken images.

---

#### N6 Network Intercept Broken Image Requests

| Field | Value |
|-------|-------|
| Scenario ID | N6 |
| Type | Functional — Network Intercept |
| Priority | P2-Regression |
| Page URL | [Broken Images Page][21] |

**Steps**
1. Register `page.route('**/*.{jpg,png,gif}', ...)` to intercept all image requests
2. Navigate to `/broken-images`
3. For each intercepted image request, capture the response status
4. Assert that broken images correspond to 404 responses

**Expected Outcome**
Image requests returning 404 correspond exactly to images with `naturalWidth === 0`.

**Why It Matters**
Cross-validates DOM-based detection with network-level status codes, demonstrating dual-layer validation.

---

### 5.10.3 Redirect Handling

#### N7 Follow Redirect and Assert Final URL

| Field | Value |
|-------|-------|
| Scenario ID | N7 |
| Type | Functional — Navigation |
| Priority | P1-Critical |
| Page URL | [Redirect Page][22] |

**Steps**
1. Navigate to `/redirect`
2. Allow Playwright to follow the redirect automatically
3. Assert the final page URL matches the expected destination

**Expected Outcome**
Browser lands on the correct destination URL after following the redirect chain.

**Why It Matters**
Redirects are fundamental to auth flows (post-login redirect), URL canonicalization, and link hygiene. Both the navigation and final URL must be validated.

---

#### N8 Intercept Redirect Response — Validate Location Header

| Field | Value |
|-------|-------|
| Scenario ID | N8 |
| Type | Functional — Network Intercept |
| Priority | P2-Regression |
| Page URL | [Redirect Page][22] |

**Steps**
1. Use `page.route()` to intercept the redirect URL
2. Capture the response
3. Assert the response status is `3xx` and the `Location` header points to the expected destination

**Expected Outcome**
Redirect response has correct status code and `Location` header value.

**Why It Matters**
Network-level redirect validation confirms the server-side configuration is correct, independent of how the browser handles the redirect.

---

### 5.10.4 A/B Test Variation Detection

#### N9 Detect Which Variation is Rendered

| Field | Value |
|-------|-------|
| Scenario ID | N9 |
| Type | Functional — Non-Deterministic |
| Priority | P2-Regression |
| Page URL | [A/B Test Page][23] |

**Steps**
1. Navigate to `/abtest`
2. Read the variant indicator text from the page
3. Assert the value is either Variant A or Variant B (not empty, not a third unknown value)

**Expected Outcome**
Page renders one of the two known variants; the assertion uses an OR-pattern matcher, not an exact match.

**Why It Matters**
A/B test pages expose non-deterministic rendering. Tests must use flexible assertions that accept either valid variant rather than a brittle exact-match that will fail 50% of the time.

---

#### N10 Both Variants Observed Across Multiple Runs

| Field | Value |
|-------|-------|
| Scenario ID | N10 |
| Type | Functional — Statistical |
| Priority | P3-Extended |
| Page URL | [A/B Test Page][23] |

**Steps**
1. Run the navigation and detection 10 times
2. Collect the variant seen on each run
3. Assert both Variant A and Variant B appear at least once

**Expected Outcome**
Both variants are encountered across 10 runs; neither is permanently stuck on one value.

**Why It Matters**
Validates that the A/B split is actually functioning — useful for confirming the test infrastructure is not caching a single variant.

---

## 5.11 Non-Deterministic Patterns

### 5.11.1 Typos Page

#### X1 Assert Page Text Matches a Known Variant

| Field | Value |
|-------|-------|
| Scenario ID | X1 |
| Type | Functional — Resilient Assertion |
| Priority | P2-Regression |
| Page URL | [Typos Page][17] |

**Steps**
1. Navigate to `/typos`
2. Read the target text element
3. Assert the text matches either the correct string OR the known typo variant

**Expected Outcome**
Assertion passes for both the correct and the typo variant; test does not hard-fail on the typo.

**Why It Matters**
The typos page randomly injects typos on each load. Tests that use exact-match assertions will flake 50% of the time — this test demonstrates the correct resilient pattern.

---

#### X2 Both Variants Observed Across Multiple Runs

| Field | Value |
|-------|-------|
| Scenario ID | X2 |
| Type | Functional — Statistical |
| Priority | P3-Extended |
| Page URL | [Typos Page][17] |

**Steps**
1. Navigate and read the text 10 times
2. Record the variant observed on each run
3. Assert both the correct string and the typo variant are observed at least once

**Expected Outcome**
Both variants are seen; the injection is confirmed to be functioning.

**Why It Matters**
Validates that the non-determinism is real and that the test framework is not caching a single page state.

---

#### X3 Soft Assertion Strategy for Non-Deterministic Content

| Field | Value |
|-------|-------|
| Scenario ID | X3 |
| Type | Functional — Framework Pattern |
| Priority | P3-Extended |
| Page URL | [Typos Page][17] |

**Steps**
1. Navigate to `/typos`
2. Use a soft assertion (`expect.soft()`) to check for the correct text
3. Log the result without failing the test on a mismatch
4. Continue the test after the soft assertion

**Expected Outcome**
Test continues execution even if the soft assertion fails; the result is logged for review.

**Why It Matters**
Demonstrates Playwright's soft assertion feature, which is the correct tool for validating non-deterministic content that should be logged but not block the test run.

---

## 5.12 React Notes Application (UI)

### 5.12.1 Notes App Core Flows

#### R1 Create a New Note via UI

| Field | Value |
|-------|-------|
| Scenario ID | R1 |
| Type | Functional — E2E |
| Priority | P0-Smoke |
| Page URL | [React Notes App][25] |

**Steps**
1. Navigate to `/notes/app` and log in
2. Click the "Add Note" or equivalent button
3. Fill in the title and description
4. Save the note
5. Assert the note appears in the notes list with the correct title

**Expected Outcome**
New note is visible in the list with the correct title and description.

**Why It Matters**
P0 smoke test for the React SPA. If note creation fails, all other app flows are blocked.

---

#### R2 Edit Existing Note via UI

| Field | Value |
|-------|-------|
| Scenario ID | R2 |
| Type | Functional |
| Priority | P1-Critical |
| Page URL | [React Notes App][25] |

**Steps**
1. Create a note (R1) or use a pre-existing note
2. Click the Edit button for the note
3. Modify the title and/or description
4. Save changes
5. Assert the updated text is reflected in the note view

**Expected Outcome**
Note displays the updated title/description; original values are no longer shown.

**Why It Matters**
Validates the full edit lifecycle in the SPA, including that the UI reflects the saved state, not just an optimistic update.

---

#### R3 Delete Note via UI

| Field | Value |
|-------|-------|
| Scenario ID | R3 |
| Type | Functional |
| Priority | P1-Critical |
| Page URL | [React Notes App][25] |

**Steps**
1. Create a note (R1) or use a pre-existing note
2. Click the Delete button for the note
3. Confirm the deletion if a confirmation dialog appears
4. Assert the note is no longer visible in the list

**Expected Outcome**
Note is removed from the list; it does not reappear on page refresh.

**Why It Matters**
Validates the delete lifecycle including the confirmation flow and the absence of the note after deletion.

---

#### R4 Cross-Layer Validation — Create via UI, Verify via API

| Field | Value |
|-------|-------|
| Scenario ID | R4 |
| Type | Integration — Hybrid UI + API |
| Priority | P1-Critical |
| Page URL | [React Notes App][25] |

**Steps**
1. Create a note through the React UI (R1)
2. Call `GET /notes/api/notes` using the Playwright API client
3. Find the note in the API response by its title
4. Assert all fields in the API response match what was entered in the UI

**Expected Outcome**
Note created via the UI is present in the API response with matching field values; no discrepancy between UI and API data layers.

**Why It Matters**
This is the senior-level differentiator test. It validates that the UI and API are in sync and that no caching or data-mapping issues exist between layers. This test pattern cannot be replicated by unit tests or API tests alone.

---

# 6. Prioritisation Matrix

| Priority | Label | Run Condition | Example IDs | Target Duration |
|----------|-------|---------------|------------|-----------------|
| P0-Smoke | Must-pass gate | Every commit, every PR | A1, A6, P1, Q1, R1 | < 2 minutes total |
| P1-Critical | Core functionality | Every PR merge | A2–A5, A9, A13, B1, B4, N1, N2, R2–R4 | < 10 minutes total |
| P2-Regression | Full coverage | Nightly / release | D1–D7, Y1–Y9, N3–N9, all F/U/V | < 30 minutes total |
| P3-Extended | Edge / exploratory | Weekly / on-demand | B3, B6, X2, X3, N10, Y10, O3, O4 | Unconstrained |

**CI/CD Gate:** P0 + P1 combined should be the merge gate. All tests must pass before merging to main.

**Tagging convention:** Use `@smoke`, `@critical`, `@regression`, `@extended` tags in test files. Run subsets with `--grep @smoke`.

---

# 7. Edge Cases & Error Handling

| Category | Scenario | Affected Pages | Mitigation Strategy |
|----------|----------|---------------|---------------------|
| Non-deterministic content | Page renders different content on each load | `/typos`, `/abtest` | Use OR-pattern matchers or `expect.soft()` — never exact match |
| Dynamic locators | Element attributes (ID, class) change per load | `/challenging-dom` | Use role, visible text, or `data-testid` selectors; avoid `nth-child` and generated IDs |
| Async rendering | Content loads after scroll or interaction | `/infinite-scroll`, pagination table | `waitForSelector` with `state: 'visible'`; no `sleep()` |
| Shadow DOM encapsulation | Standard CSS selectors cannot pierce shadow root | `/shadowdom` | Playwright pierce syntax (`>>`) or built-in shadow DOM support |
| iFrame context switching | Elements inside frames are inaccessible from main context | `/iframe` | `page.frameLocator()` API; chain for nested frames |
| Network dependency | Page content depends on HTTP response code | `/status-codes`, `/redirect` | `page.route()` intercept; assert both status and body |
| Flaky drag precision | Mouse coordinate drift causes drop to miss target | drag-and-drop pages | Use `locator.dragTo()` API; tag `@flaky` with `retries: 2` |
| File input hidden | `setInputFiles()` fails on non-visible file input | `/upload` | Use `{ force: true }` option or `dispatchEvent('change')` |
| Session expiry | Auth token expires during a long test suite run | all auth-gated pages | Pre-validate token TTL; refresh `storageState` in `beforeAll` |
| Browser permission APIs | Geolocation/camera denied by default | `/geolocation` | Set context permissions before navigation in `newContext()` options |
| Stale element reference | Element reference captured before async re-render | dynamic tables, infinite scroll | Re-query element inside `expect.poll()` rather than caching locator |
| Parallel test data collision | Two parallel workers create notes under the same account | Notes API, React app | Seed unique accounts per worker using `workerIndex` + Faker.js |
| Alert left open between tests | Unhandled dialog crashes the next test | alerts page | Register `page.on('dialog', d => d.dismiss())` in `afterEach` |
| Sort assertion on equal values | Non-deterministic ordering for equal-value rows | pagination table | Seed with known-unique data or add secondary sort assertion |

---

# 8. Framework Capabilities Mapping

| Capability | Implementation |
|------------|---------------|
| POM Architecture | Each page as a TypeScript class |
| Service Layer | API + UI abstraction per domain |
| Parallel Execution | Playwright `fullyParallel: true` with workers |
| Retry Logic | `retries: 2` globally; `@flaky` tag for targeted retry |
| Tagging | `@smoke` / `@critical` / `@regression` / `@extended` |
| Test Data | Faker.js factories + per-worker unique seeds |
| Reporting | Allure for Playwright (step-level with screenshots on failure) |
| CI/CD | GitHub Actions with matrix strategy for cross-browser |
| Schema Validation | Zod or ajv for API response contract testing |
| Auth Reuse | `storageState` saved and loaded per test group |

---

# 9. Advanced Add-ons (Differentiators)

### Flaky Test Detection

* Track retry patterns across runs
* Cluster unstable tests by module
* Surface in Allure report with retry history

### Smart Wait System

* Replace all `page.waitForTimeout()` with event-driven waits
* Use `page.waitForSelector()`, `expect.poll()`, and `page.waitForLoadState()`

### Auth Reuse

* Save `storageState` after login once per worker
* Reuse session across all tests in the same worker
* Regenerate on token expiry detection

### Hybrid Testing

* Validate UI actions via API response (cross-layer)
* Validate API creates/updates via UI reflection
* Core pattern demonstrated in R4 and the reverse of R4

---

# 10. Definition of Done

Framework is considered production-grade when:

* Covers UI + API layers across all 13 coverage areas
* Executes in parallel with stable results (< 5% flake rate)
* Handles dynamic DOM without hardcoded locators
* Includes retry + flake handling with tagging
* Integrated into CI/CD with matrix browser strategy
* Produces actionable Allure reports with screenshots on failure
* Demonstrates debugging capability via step-level trace viewer
* Cross-layer hybrid tests (UI ↔ API) are implemented and passing

---

# 11. Final Positioning

This system enables:

* Full-stack test automation across UI and API layers
* Real-world scenario coverage including non-deterministic and async patterns
* Flaky behaviour handling with retry logic and smart waits
* API + UI hybrid cross-layer validation
* Browser-level API mocking (geolocation, permissions)
* Network-level interception and status code validation

Using this platform alone is sufficient to demonstrate **senior-level QA capability** due to breadth (UI + API + network + browser APIs) and depth (edge cases, dynamic behaviour, Shadow DOM, non-deterministic content, real workflows).

---

[1]: https://practice.expandtesting.com/ "Automation Testing Practice Website for QA and Developers"
[2]: https://practice.expandtesting.com/login "Test Login Page for Automation Testing Practice"
[3]: https://practice.expandtesting.com/inputs "Web inputs page for Automation Testing Practice"
[4]: https://practice.expandtesting.com/dropdown "Dropdown List page for Automation Testing Practice"
[5]: https://practice.expandtesting.com/checkboxes "Check Boxes page for Automation Testing Practice"
[6]: https://practice.expandtesting.com/radio-buttons "Radio Buttons page for Automation Testing Practice"
[7]: https://practice.expandtesting.com/windows "Windows page for Automation Testing Practice"
[8]: https://practice.expandtesting.com/upload "Files Upload page for Automation Testing Practice"
[9]: https://practice.expandtesting.com/dynamic-table "Dynamic Tables page for Automation Testing Practice"
[10]: https://practice.expandtesting.com/locators "Locators page for Automation Testing Practice"
[11]: https://practice.expandtesting.com/shadowdom "Shadow DOM page for Automation Testing Practice"
[12]: https://practice.expandtesting.com/geolocation "Geolocation page for Automation Testing Practice"
[13]: https://practice.expandtesting.com/infinite-scroll "Infinite Scroll page for Automation Testing Practice"
[14]: https://practice.expandtesting.com/horizontal-slider "Horizontal Slider page for Automation Testing Practice"
[15]: https://practice.expandtesting.com/tooltips "Tooltips page for Automation Testing Practice"
[16]: https://practice.expandtesting.com/context-menu "Context Menu page for Automation Testing Practice"
[17]: https://practice.expandtesting.com/typos "Typos page for Automation Testing Practice"
[18]: https://practice.expandtesting.com/challenging-dom "Challenging DOM page for Automation Testing Practice"
[19]: https://practice.expandtesting.com/large-page "Large Page for Automation Testing Practice"
[20]: https://practice.expandtesting.com/status-codes "HTTP Status Codes page for Automation Testing Practice"
[21]: https://practice.expandtesting.com/broken-images "Broken Images page for Automation Testing Practice"
[22]: https://practice.expandtesting.com/redirect "Redirect page for Automation Testing Practice"
[23]: https://practice.expandtesting.com/abtest "A/B Test page for Automation Testing Practice"
[24]: https://practice.expandtesting.com/iframe "iFrame page for Automation Testing Practice"
[25]: https://practice.expandtesting.com/notes/app "React Notes Application for Automation Testing Practice"
[26]: https://practice.expandtesting.com/api/api-docs/ "Practice API Swagger Documentation"
[27]: https://practice.expandtesting.com/register "Test Register Page for Automation Testing Practice"
[28]: https://practice.expandtesting.com/forgot-password "Forgot Password Page for Automation Testing Practice"
[29]: https://practice.expandtesting.com/notes/api/api-docs/ "Notes API Swagger Documentation"
