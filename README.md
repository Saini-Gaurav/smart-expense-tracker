# Smart Expense Tracker (Production-Ready Assignment)

Full-stack expense tracking application designed for job evaluation submission.

## Tech Stack
- Frontend: **TypeScript**, React + Vite (`main.tsx`), React Router, Axios, **Recharts** (dashboard charts), responsive sidebar (drawer on small screens; fixed sidebar + scrollable main on desktop)
- Backend: **TypeScript**, Node.js, Express, MongoDB, Mongoose (`tsx` in dev, `tsc` for production build → `dist/`)
- Security: Helmet, CORS, rate limit, JWT access + refresh tokens (httpOnly cookie)
- Architecture: Routes -> Controllers -> Services -> Repositories -> Models

## Project Structure
- `frontend` - responsive SPA with authentication and expense dashboard
- `backend` - REST API with modular production-style architecture under `src`

## Features (assignment-aligned)
- Authentication: secure signup & login (bcrypt + JWT on API)
- Expenses: add (title, amount, category, date, optional notes), **edit**, delete
- List: **pagination (10 per page)**, **date range** + **category** filters, **sort** by date or amount (asc/desc)
- Categories: Food, Transport, Shopping, Health, Entertainment, Utilities, Other
- Dashboard: **summary cards** (this month, this year, highest category), **date range** for charts/list, **dynamic charts** (category + monthly trend) that refresh after changes
- Access token + refresh token flow (API)
- Server-side `express-validator`, structured logging
- Responsive UI

## Setup
1. Install dependencies:
   - `cd backend && npm install`
   - `cd ../frontend && npm install`
2. Configure env:
   - Copy `backend/.env.example` to `backend/.env` and fill values
   - Copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` (e.g. `http://localhost:5000/api`)
3. Run apps:
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`

**Detailed docs:** see [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md).

**First-time users:** open the app and use **Create an account** on the login screen (or go to `/register`) to sign up before signing in.

## Submission checklist (per brief)

1. **GitHub**: public repo, clear commits, README with setup + env + **screenshots** (add an `docs/screenshots/` folder if you like).
2. **Live URLs**: deploy frontend (e.g. Vercel) and backend (e.g. Render/Railway); paste links at the top of this README.
3. **`.env.example`**: present in `backend/` and `frontend/` (no real secrets).
4. **Demo credentials**: after deployment, register once and add a reviewer login below.

### Demo credentials (fill in after you create the user)

| | |
| --- | --- |
| Email | `YOUR_DEMO_EMAIL` |
| Password | `YOUR_DEMO_PASSWORD` |

## API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/expenses`
- `POST /api/expenses`
- `PUT /api/expenses/:id` (full update)
- `PATCH /api/expenses/:id` (partial update)
- `DELETE /api/expenses/:id`
- `GET /api/expenses/summary`

## Important Note
If MongoDB Atlas connection fails with DNS issues, verify:
- Internet connectivity
- Valid URI and credentials
- Atlas network access (IP allow list)
