# Gesta project guidelines

## Build, test, and lint

- Use Node.js `>=22.14.0` and run commands from the repository root.
- After a clean checkout, run `npm ci`, then `npm run setup`. This creates
  `backend/.env` and initializes the SQLite database with demo data.
- Run both applications with `npm run dev` (API on `http://localhost:3000`,
  frontend on `http://localhost:5173`).
- Run the complete validation pipeline with `npm run check`. It runs workspace
  lint, TypeScript checks, Vitest tests, and builds.
- Individual checks can be run with `npm run lint`, `npm run typecheck`,
  `npm test`, or `npm run build`. Workspace-specific commands use
  `npm run <script> -w backend` or `npm run <script> -w frontend`.
- Run one test file with, for example,
  `npm run test -w backend -- tests/offers.test.ts` or
  `npm run test -w frontend -- tests/CompaniesPage.test.tsx`. Pass a Vitest
  name filter after the file when needed, such as `-- -t "searches companies"`.
- `npm run db:reset` deletes and recreates the development database. Stop the
  dev server first, especially on Windows.

## Architecture

Gesta is an npm-workspaces monorepo with a React/Vite frontend and an
Express/TypeScript backend backed by SQLite (`better-sqlite3`). Read
[docs/architecture.md](../docs/architecture.md) for the complete dependency
flow and reference feature traces.

- Backend requests flow through controllers, services, repositories, and
  SQLite. `app.ts` composes these layers using factory functions and installs
  authentication and error middleware.
- Controllers handle HTTP parsing/validation and DTO responses. Services
  contain business rules and never receive Express `Request` or `Response`
  objects. Repositories contain SQL and return database objects; mappers
  convert database objects to domain objects and API DTOs.
- Authentication verifies the token and reloads the current account, roles, and
  companies from the database on every request. Authorization rules live in
  named functions in `backend/src/services/permissions.ts`.
- Frontend flow is `pages -> hooks -> services/utils -> models`, with reusable
  presentational components below pages. `App.tsx` is the single owner of
  `useAuth`; authenticated pages receive the token and logout callback.
- Frontend `/api/...` calls are proxied by Vite to the backend, with `/api`
  removed. The backend itself exposes routes without that prefix.

## Repository-specific conventions

- Backend relative imports deliberately include the `.ts` extension; keep this
  convention because TypeScript rewrites them to `.js` during the build.
- The `Authorization` header contains the raw token, without a `Bearer`
  prefix. Keep token verification and user reloading in the authentication
  middleware rather than trusting frontend claims.
- Report expected API failures by throwing `HttpError(status, code, message)`.
  `errorHandler` converts these into `{ "error": { "code", "message" } }`.
- Keep authorization policy in `services/permissions.ts` and enforce it at the
  route/service boundary; do not duplicate role checks in React.
- Add schema changes as a new ordered SQL file under
  `backend/src/db/migrations/`; never edit an existing migration. Use stable
  IDs from `backend/src/db/seed/seedIds.ts` in seed-related tests.
- Backend tests use `tests/helpers/testApp.ts` and an in-memory SQLite database;
  they must not use `backend/data/gesta.db`. Frontend tests use Vitest,
  Testing Library, and the shared setup under `frontend/tests/`.
- Frontend API services validate response JSON with the type guards in
  `frontend/src/utils/guards.ts`. Hooks should abort in-flight fetches during
  cleanup and call `onUnauthorized` for 401 responses.
- API status/role values are stored and exchanged as English codes (for
  example `PUBLISHED`); French labels belong in the frontend presentation
  layer.
- Demo authentication is development-only. The server rejects
  `DEMO_AUTH_ENABLED=true` in production; do not treat demo login as real
  authentication.

## Canonical documentation

- [README.md](../README.md): setup, commands, supported Node versions, and
  project scope.
- [docs/architecture.md](../docs/architecture.md): layer responsibilities and
  end-to-end reference features.
- [backend/API.md](../backend/API.md): routes, authentication, response
  formats, and error codes.
- [docs/seed.md](../docs/seed.md): fictitious demo data and stable test
  scenarios.
