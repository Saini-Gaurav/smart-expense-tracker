# Smart Expense Tracker — API

REST API for the Smart Expense Tracker assignment. Built with **TypeScript**, **Node.js**, **Express**, **MongoDB** (Mongoose), and a layered **routes → controllers → services → repositories → models** structure.

## Features

- **Authentication**: register, login, logout, JWT access tokens, refresh token rotation (stored hashed in MongoDB, refresh cookie `httpOnly`)
- **Expenses**: CRUD with validation, pagination, filters (category, date range, search), sorting
- **Analytics**: `/api/expenses/summary` for totals, category breakdown, monthly trend, recent items
- **Security**: Helmet, CORS (configurable origins), rate limiting on `/api`
- **Observability**: JSON structured logs, per-request HTTP logging

## Requirements

- Node.js **18+**
- MongoDB (**Atlas** `mongodb+srv://…` or local `mongodb://127.0.0.1:27017/…`)

## Quick start

```bash
cd backend
npm install
```

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set at minimum:

   - `MONGODB_URI` — full Atlas URI (hostname must look like `cluster0.xxxxx.mongodb.net`, not `cluster0.mongodb.net` alone)
   - `JWT_SECRET` — long random string
   - `JWT_REFRESH_SECRET` — different long random string
   - `CLIENT_URL` — frontend origin(s), comma-separated if needed, e.g. `http://localhost:5173`

3. Run in development (TypeScript with hot reload):

   ```bash
   npm run dev
   ```

   Production: `npm run build` then `npm start` (runs compiled `dist/server.js` from `src/server.ts`).

   API base: `http://localhost:5000/api` (or your `PORT`).

## Scripts

| Script    | Description              |
| --------- | ------------------------ |
| `npm run dev`   | `tsx watch src/server.ts` |
| `npm run build` | Compile to `dist/` (`tsc`) |
| `npm start`     | `node dist/server.js` |
| `npm run lint`  | ESLint on `src/**/*.ts` (if configured) |

## Project layout

```
backend/
├── src/
│   ├── server.ts          # Entry: env validation, DB connect, listen
│   ├── app.ts             # Express app, middleware, routes
│   ├── config/            # db, env
│   ├── controllers/
│   ├── middleware/        # auth, error handler, request logger
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   └── utils/             # logger
├── .env.example
└── package.json
```

## API overview

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Create user; sets refresh cookie |
| POST | `/api/auth/login` | No | Login; sets refresh cookie |
| POST | `/api/auth/refresh` | Cookie | New access + refresh tokens |
| POST | `/api/auth/logout` | Cookie | Invalidate refresh token |
| GET | `/api/auth/me` | Bearer | Current user |
| GET | `/api/expenses` | Bearer | List (query: `page`, `limit`, `category`, `startDate`, `endDate`, `search`, `sortBy`, `sortOrder`) |
| POST | `/api/expenses` | Bearer | Create |
| PUT | `/api/expenses/:id` | Bearer | Full update (all validated fields) |
| DELETE | `/api/expenses/:id` | Bearer | Delete |
| GET | `/api/expenses/summary` | Bearer | Analytics (`?startDate=&endDate=` optional; charts follow range; month/year totals stay calendar-based) |
| PATCH | `/api/expenses/:id` | Bearer | Partial update (at least one of title, amount, category, date, notes) |

**Auth header**: `Authorization: Bearer <access_token>`

**CORS**: `CLIENT_URL` must include your frontend origin; use `credentials: true` from the browser when using cookies for refresh.

## Troubleshooting

### `querySrv ENOTFOUND` / MongoDB connection failed

- Use the **full** connection string from Atlas (**Connect → Drivers**). The host must include the random segment, e.g. `cluster0.abc12.mongodb.net`.
- For local MongoDB: `MONGODB_URI=mongodb://127.0.0.1:27017/expense_tracker`
- Ensure Atlas **Network Access** allows your IP (or `0.0.0.0/0` for development only).

### Password in connection string

Special characters in the password must be **URL-encoded** in the URI.

## Production notes

- Set `NODE_ENV=production`
- Use strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
- Restrict `CLIENT_URL` to real frontend domains
- Run behind HTTPS so `secure` cookies work for refresh tokens
