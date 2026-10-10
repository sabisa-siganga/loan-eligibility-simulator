# Loan Eligibility Simulator

Frontend-only personal loan eligibility demo. Users explore repayments against a monthly budget using local calculations and mock services. There is no backend, real credit check, or banking integration.

## Requirements

- Node.js 20 LTS or newer
- npm 10 or newer

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173`).

Local development loads [`.env.development`](.env.development), which enables the MSW mock API (`VITE_ENABLE_MOCK_API=true`) and sets `VITE_API_BASE_URL=/api`. Copy [`.env.example`](.env.example) if you need a custom env file. Without the mock worker (or a real backend), the eligibility check `POST` will fail.

First-time e2e setup also needs Playwright’s Chromium:

```bash
npx playwright install chromium
```

## Checks

| Command                | Purpose                                      |
| ---------------------- | -------------------------------------------- |
| `npm run typecheck`    | TypeScript project build check               |
| `npm run lint`         | ESLint                                       |
| `npm run format`       | Apply Prettier                               |
| `npm run format:check` | Verify Prettier formatting                   |
| `npm run test`         | Vitest, single run                           |
| `npm run test:watch`   | Vitest watch mode                            |
| `npm run build`        | Production build                             |
| `npm run preview`      | Preview the production build                 |
| `npm run build:e2e`    | Production build using `.env.e2e` (mock API) |
| `npm run test:e2e`     | Playwright e2e against preview + MSW         |
| `npm run test:e2e:ui`  | Playwright UI mode                           |

GitHub Actions runs two jobs on every pull request and on pushes to `main`:

- **Quality** — `typecheck`, `lint`, `format:check`, `test`, and `build`
- **E2E** — depends on Quality; builds with mock API env, installs Chromium, runs Playwright

After the workflow has run once, configure a branch ruleset on `main` that requires a pull request and the **Quality** and **E2E** status checks (0 approving reviews).

## Confirmed starting values

Screen 1 uses these defaults on load and after Cancel / Start again / reload:

| Field                         | Starting value |
| ----------------------------- | -------------- |
| Loan amount                   | R5,000         |
| Repayment term                | 6 months       |
| Example annual interest rate  | 12.5%          |
| Loan purpose                  | Unselected     |
| Personal and financial fields | Empty          |

Cancel, Start again, and a full page reload will clear entered details, results, errors, and any generated credit score, then restore the starting loan values above. Do not prefill personal information from design mockups.

## State ownership

- **React Hook Form** owns active field editing, touched fields, and field-level errors.
- **Redux** owns shared journey information (current screen), submitted step values, and a generated credit score that survives in-journey navigation.
- Repayments, totals, budget balances, and eligibility are **derived** from inputs — not stored as duplicated source-of-truth values.
- Do not synchronise every keystroke into Redux.
- Do not use `redux-persist` or `localStorage` for financial data. Journey state lives in memory only.

## Privacy

Keep financial information out of URLs, logs, and analytics. No secrets or banking credentials belong in this project. Entered details stay on the device for the session; reloading clears them.

Confirmed theme tokens (primary `#2F70EF`, Nunito Sans) override sampled colours/fonts from those images.

## Design decision

**Local `@fontsource/nunito-sans` files** are served with the app (weights 400, 600, 700, `font-display: swap`) instead of a remote Google Fonts stylesheet. The alternative was runtime CSS from fonts.googleapis.com. Local fonts were chosen so the UI still loads when remote fonts fail or the network is unavailable, matching the requirement that the app must work without remote font loading succeeding. Fallbacks remain `Roboto, Arial, sans-serif`.

## Mock API

Eligibility is checked over HTTP (`POST ${VITE_API_BASE_URL}/eligibility-check`). [MSW](https://mswjs.io/) intercepts that request in the browser when `VITE_ENABLE_MOCK_API=true`. Handlers live under `src/mocks/`.

| Mode                         | How mock env is loaded                             |
| ---------------------------- | -------------------------------------------------- |
| `npm run dev`                | [`.env.development`](.env.development)             |
| `npm run build:e2e` / e2e CI | [`.env.e2e`](.env.e2e) via `vite build --mode e2e` |
| `npm run build`              | No mock unless you set the Vite env vars           |

E2e can force a failed check by setting `sessionStorage` key `mockApi.eligibilityFail` to `1` before the journey starts.

## Stack

React, Vite, TypeScript (strict), SCSS Modules, Redux Toolkit, React Hook Form, Zod, Lucide React, Vitest, React Testing Library, Playwright, MSW, ESLint, Prettier.

## Current scope

All three screens are implemented: loan details, budget form with conditionals and credit-score modes, and the eligibility result with adjust / edit / start again. Deferred items (fees, schedule, multi-product, real bureau) remain out of scope.
