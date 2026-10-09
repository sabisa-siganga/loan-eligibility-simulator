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

## Checks

| Command                | Purpose                        |
| ---------------------- | ------------------------------ |
| `npm run typecheck`    | TypeScript project build check |
| `npm run lint`         | ESLint                         |
| `npm run format`       | Apply Prettier                 |
| `npm run format:check` | Verify Prettier formatting     |
| `npm run test`         | Vitest, single run             |
| `npm run test:watch`   | Vitest watch mode              |
| `npm run build`        | Production build               |
| `npm run preview`      | Preview the production build   |

## Confirmed starting values (for later implementation)

These defaults are not wired into forms yet. Recorded for Screen 1 work:

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

## Design references

Selected layouts (do not use the later “Plan your personal loan” redesign):

1. `Loan eligibility simulator interface in blue.png` — Screen 1
2. `Loan eligibility budget check screen.png` — Screen 2
3. `Loan Eligibility Simulator Mockup.png` — Screen 3

Confirmed theme tokens (primary `#2F70EF`, Nunito Sans) override sampled colours/fonts from those images.

## Design decision

**Local `@fontsource/nunito-sans` files** are served with the app (weights 400, 600, 700, `font-display: swap`) instead of a remote Google Fonts stylesheet. The alternative was runtime CSS from fonts.googleapis.com. Local fonts were chosen so the UI still loads when remote fonts fail or the network is unavailable, matching the requirement that the app must work without remote font loading succeeding. Fallbacks remain `Roboto, Arial, sans-serif`.

## Stack

React, Vite, TypeScript (strict), SCSS Modules, Redux Toolkit, React Hook Form, Zod, Lucide React, Vitest, React Testing Library, ESLint, Prettier.

## Current scope

This repository currently contains the project foundation and a minimal app shell. Loan screens, calculations, and eligibility rules are not implemented yet.
