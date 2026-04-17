# Smart Expense Tracker — Frontend

**TypeScript** + React (Vite) SPA: authentication, expense CRUD, filters, pagination, **Recharts** visualizations, and a **responsive sidebar** layout. Uses **React Router**, **Axios**, and a dark premium UI (Plus Jakarta Sans, password visibility toggles on auth screens).

## Features

- Sign in (`/login`) and create account (`/register`) with cross-links
- Password show/hide (eye) on auth forms
- JWT access token (`localStorage` key `expense_access_token`) + automatic refresh via `/api/auth/refresh` (cookies, `withCredentials`)
- **App shell**: **Overview** (`/dashboard`) and **Expenses** (`/expenses`) in the sidebar; on **desktop** the sidebar stays fixed while the **main column** scrolls; on **tablet/phone** the sidebar is a drawer with backdrop
- Dashboard:
  - Summary cards: **total this month**, **total this year**, **highest category** (aligned with assignment)
  - **Date range** inputs to filter chart data and the expense list
  - **Category** filter and **sort** by date or amount (asc/desc)
  - **Pagination**: 10 items per page with Previous/Next
  - **Add / edit / delete** expenses (edit via modal)
  - **Charts**: category breakdown (donut), monthly trend (bars)—data from `/api/expenses/summary`
- Form controls (including `<select>` and date fields) styled to match the premium theme

## Requirements

- Node.js 18+
- Backend running (see `../backend/README.md`)

## Quick start

```bash
cd frontend
npm install
cp .env.example .env
```

Set `VITE_API_URL` (must end with `/api` if your API is mounted there), e.g.:

```env
VITE_API_URL=http://localhost:5000/api
```

Ensure the backend `CLIENT_URL` includes this app’s origin (e.g. `http://localhost:5173`).

```bash
npm run dev
```

## Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Vite dev server (TypeScript) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Project layout

```
frontend/
├── index.html
├── src/
│   ├── main.tsx              # Vite entry
│   ├── App.tsx               # Routes (auth vs dashboard shell)
│   ├── index.css             # Global styles
│   ├── vite-env.d.ts
│   ├── api/
│   │   └── client.ts         # Axios instance + auth interceptors
│   ├── components/
│   │   ├── DashboardCharts.tsx
│   │   └── PasswordField.tsx
│   ├── contexts/
│   │   └── DashboardContext.tsx
│   ├── layouts/
│   │   └── AppShell.tsx      # Sidebar + mobile drawer
│   ├── pages/
│   │   ├── AuthPage.tsx
│   │   ├── OverviewPage.tsx
│   │   └── ExpensesPage.tsx
│   ├── state/
│   │   └── AuthContext.tsx
│   └── types/
│       ├── auth.ts
│       └── expense.ts
├── .env.example
└── package.json
```

## Troubleshooting

- **CORS**: match `CLIENT_URL` on the server to the exact frontend origin.
- **401 loops**: confirm cookies work (HTTPS in production; same-site rules).
- **Charts empty**: set a date range that includes your data, or add expenses first.

## Demo credentials for reviewers

Create a user with **Register**, then put the same email/password in the root `README.md` table so evaluators can log in on your deployed app.
