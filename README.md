# Todo Management App

A full-stack Todo Management application built with **Angular 17 + TailwindCSS** on the frontend and **NestJS + TypeORM + PostgreSQL** on the backend, with JWT authentication, per-user data isolation, validation, and tests.

---

## Features

- User registration, login, logout and `/auth/me` session check
- JWT-protected dashboard and API routes
- Each todo belongs to one user; users can never read, update or delete another user's todos
- CRUD for todos with `title`, optional `description`, `status`, `priority`, optional `dueDate`, `createdAt`, `updatedAt`
- Filter by `status` / `priority`, search by `title`, sort by `createdAt` / `dueDate` / `updatedAt`, paginated results
- Modern responsive UI: registration, login, dashboard, create/edit todo, profile
- Loading states, error banners, empty states, form validation feedback, status badges, priority badges, and a delete-confirmation dialog
- Backend input validation with `class-validator`, password hashing with `bcrypt`, config validation with `joi`
- Enums shared throughout the codebase instead of hardcoded strings
- Unit tests for `AuthService`, `TodosService` (incl. ownership), `AuthService` (frontend), plus an HTTP-level e2e test suite that asserts users cannot access each other's todos

---

## Tech stack

| Layer    | Stack                                                     |
|----------|-----------------------------------------------------------|
| Frontend | Angular 17 (standalone components, signals), TailwindCSS  |
| Backend  | NestJS 10, TypeORM, Passport JWT, bcrypt, class-validator |
| Database | PostgreSQL 14+                                            |
| Testing  | Jest (backend unit + e2e), Karma/Jasmine (frontend)       |

---

## Folder structure

```
todo-management-app/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/               # Register, login, JWT strategy, guard
│   │   ├── users/              # User entity + profile endpoint
│   │   ├── todos/              # Todo entity, CRUD, filter/sort/search
│   │   ├── common/
│   │   │   ├── decorators/     # @CurrentUser()
│   │   │   ├── enums/          # TodoStatus, TodoPriority, ConfigKey, …
│   │   │   └── interfaces/     # JwtPayload, AuthenticatedRequest
│   │   ├── config/             # Configuration loader + joi schema
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   │   └── app.e2e-spec.ts     # Full HTTP e2e tests against Postgres
│   ├── .env.example
│   ├── nest-cli.json
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # Angular SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Services, guards, interceptors, enums, models
│   │   │   ├── shared/         # Reusable components (badges, dialog, …)
│   │   │   ├── features/
│   │   │   │   ├── auth/       # Login + Register pages
│   │   │   │   ├── todos/      # Todo list + Todo form (create/edit)
│   │   │   │   └── profile/
│   │   │   ├── app.config.ts
│   │   │   ├── app.routes.ts
│   │   │   └── app.component.ts
│   │   ├── environments/
│   │   ├── styles.css
│   │   └── main.ts
│   ├── angular.json
│   ├── tailwind.config.js
│   └── package.json
├── .gitignore
└── README.md
```

---

## Database schema

Two tables, managed by TypeORM (auto-created when `DATABASE_SYNC=true`).

### `users`

| Column      | Type           | Notes                          |
|-------------|----------------|--------------------------------|
| `id`        | `uuid` (PK)    | Generated                      |
| `email`     | `varchar(255)` | Unique index, lowercased       |
| `name`      | `varchar(100)` |                                |
| `password`  | `varchar(255)` | bcrypt hash, never sent to API |
| `createdAt` | `timestamptz`  | Auto                           |
| `updatedAt` | `timestamptz`  | Auto                           |

### `todos`

| Column        | Type           | Notes                                 |
|---------------|----------------|---------------------------------------|
| `id`          | `uuid` (PK)    |                                       |
| `title`       | `varchar(200)` |                                       |
| `description` | `text` (null)  | Optional                              |
| `status`      | `enum`         | `PENDING` / `IN_PROGRESS` / `COMPLETED` / `ARCHIVED` |
| `priority`    | `enum`         | `LOW` / `MEDIUM` / `HIGH` / `URGENT` |
| `dueDate`     | `timestamptz` (null) | Optional                        |
| `userId`      | `uuid` (FK, indexed) | `ON DELETE CASCADE`             |
| `createdAt`   | `timestamptz`  | Auto                                  |
| `updatedAt`   | `timestamptz`  | Auto                                  |

---

## API routes

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Path            | Auth | Body                              | Description                  |
|--------|-----------------|------|-----------------------------------|------------------------------|
| POST   | `/auth/register`| no   | `{ email, name, password }`       | Create user + return token   |
| POST   | `/auth/login`   | no   | `{ email, password }`             | Return token                 |
| POST   | `/auth/logout`  | yes  | —                                 | Client-side cleanup helper   |
| GET    | `/auth/me`      | yes  | —                                 | Return current user          |

### Users

| Method | Path             | Auth | Description           |
|--------|------------------|------|-----------------------|
| GET    | `/users/profile` | yes  | Current user profile  |

### Todos (all require auth; users can only access their own)

| Method | Path          | Body / Query                                                        | Description     |
|--------|---------------|---------------------------------------------------------------------|-----------------|
| GET    | `/todos`      | `?status=&priority=&search=&sortBy=&sortOrder=&page=&limit=`        | List + paginate |
| GET    | `/todos/:id`  | —                                                                   | Single todo     |
| POST   | `/todos`      | `{ title, description?, status?, priority?, dueDate? }`             | Create          |
| PATCH  | `/todos/:id`  | Any subset of fields above                                          | Update          |
| DELETE | `/todos/:id`  | —                                                                   | Delete          |

Listing returns: `{ items, total, page, limit, totalPages }`.

---

## Environment variables

### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:4200

DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=todo_management
DATABASE_SYNC=true

JWT_SECRET=replace_me_with_a_long_random_string
JWT_EXPIRES_IN=1d

BCRYPT_SALT_ROUNDS=10
```

> **Windows:** If you see `ECONNREFUSED ::1:5432`, set `DATABASE_HOST=127.0.0.1` (or keep the example default). `localhost` can resolve to IPv6 first while PostgreSQL is only listening on IPv4.

> The app validates these at boot via a `joi` schema and refuses to start if anything is missing or malformed. **Never commit `.env`.**

### Frontend

`frontend/src/environments/environment.development.ts` points to `http://localhost:3000/api` by default. Override it for other environments.

---

## Running locally

### 1. Prerequisites

- Node.js **18+**
- npm **9+**
- A running PostgreSQL **14+** instance

Create the database (one-off):

```bash
createdb todo_management
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env       # then edit values, especially JWT_SECRET
npm run start:dev
```

The API will be available at `http://localhost:3000/api`.

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

The app will be served at `http://localhost:4200`.

---

## Running tests

### Backend — unit tests

```bash
cd backend
npm test
```

Covers `AuthService`, `TodosService`, and especially the **cross-user ownership** logic (a user attempting to read/update/delete another user's todo must receive 403).

### Backend — e2e tests

The e2e suite spins up the full Nest application and runs real HTTP requests with `supertest` against your **PostgreSQL** instance. It truncates `users` and `todos` between every test.

```bash
cd backend
npm run test:e2e
```

It exercises:

- User registration (success, duplicate email, weak password)
- Login (success, wrong password)
- Auth-protected routes
- Todo creation, listing scoped to user, filtering, search
- **Forbidden access to other users' todos for GET / PATCH / DELETE**

### Frontend tests

```bash
cd frontend
npm test
```

Covers `AuthService` (token persistence, login, logout cleanup).

---

## State management

The frontend uses **Angular signals** for application state:

- `AuthService` exposes read-only signals `currentUser`, `accessToken`, `isAuthenticated`. Components that depend on the user (e.g. navbar, dashboard, profile) read them directly with zero subscriptions.
- Each feature component keeps its own local UI state (loading, error, submitting) in signals, so templates render without `async` pipes for component-local concerns.
- `localStorage` is the single source of truth for persisted session data; `AuthService` re-hydrates signals from it on construction so a page refresh keeps the user logged in.

State management notes are inline in the source — see `AuthService` and `TodoListComponent` in particular.

---

## Security notes

- Passwords are hashed with `bcrypt` (configurable salt rounds).
- JWTs are signed with `JWT_SECRET`. Tokens are stateless; the `/auth/logout` endpoint is a client-side helper.
- Every `/todos` route is scoped to `req.user.id` inside `TodosService`, so even a forged `id` in the URL can never reach another user's data — the service returns 403 first.
- `class-validator` strips unknown fields (`whitelist: true`) and rejects requests with extra fields (`forbidNonWhitelisted: true`).
- `ClassSerializerInterceptor` + `@Exclude()` on `User.password` ensures the password hash is never returned in any API response.

---

## License

MIT
