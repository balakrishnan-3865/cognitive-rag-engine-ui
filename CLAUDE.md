# CLAUDE.md

## Project Goal
Complete Angular 22 standalone dashboard demo for Spring Boot AI backend. **3-hour deadline** for portfolio/interview.

## Backend API

**`PHASES.md` is the source of truth for the API contract** — exact endpoint paths, request/response
DTOs, auth flow, and per-phase scope. Do not invent or guess endpoint shapes; check there first, and
correct this section (or link further) if it ever drifts from what's actually implemented backend-side.

Stable facts, unlikely to change per-phase:
- Base URL: `http://localhost:8080`, no context-path, all routes rooted at `/api/v1/`.
- Auth: JWT access token (send as `Authorization: Bearer <accessToken>`) + opaque refresh token
  returned in the login/refresh response body (not a cookie). Access tokens expire in 15 min; refresh
  in 7 days, with rotation on every `/auth/refresh` call.
- Errors: virtually all endpoints, including security-layer 401/403s, return the same shape —
  `{ timestamp, status, error, message, path, validationErrors? }` — with a documented set of
  exceptions (see `PHASES.md`, Phase 2) where the backend leaks a generic 500 instead.
- CORS: already configured server-side; `http://localhost:4200` is allowlisted, no dev proxy needed.

## Commands

```bash
npm start           # ng serve — dev server at http://localhost:4200, auto-reloads on change
npm run build        # ng build — production build to dist/
npm run watch         # ng build --watch --configuration development
npm test            # ng test — runs the Vitest-based unit test suite
```

To run a single test file or a filtered set of tests, pass Vitest-style args through the Angular CLI test builder, e.g. `ng test -- src/app/app.spec.ts` or `ng test -- -t "should create the app"`.

To scaffold new pieces, use Angular CLI schematics, e.g. `ng generate component <name>`. Run `ng generate --help` for the full list of schematics.

## Architecture

- **Standalone components** — this project uses Angular's standalone API (no `NgModule`s). Components declare their own `imports` array (see `src/app/app.ts`).
- **App bootstrap**: `src/main.ts` bootstraps the root `App` component using `appConfig` from `src/app/app.config.ts`.
- **App-wide providers** (router, global error listeners, etc.) are registered in `src/app/app.config.ts` via `ApplicationConfig`.
- **Routing**: routes are defined in `src/app/app.routes.ts` (currently empty) and wired in via `provideRouter(routes)` in `app.config.ts`.
- **Styling**: Tailwind CSS v4 is imported globally in `src/styles.css` via `@import 'tailwindcss';`, processed through PostCSS (`@tailwindcss/postcss`, configured in `.postcssrc.json`). Per-component styles live alongside each component (e.g. `app.css`).
- **TypeScript config** is split three ways per Angular CLI convention: `tsconfig.json` (base, referenced by both), `tsconfig.app.json` (app build), `tsconfig.spec.json` (tests).

## Formatting

Prettier is configured via `.prettierrc`: 100-char print width, single quotes, and the Angular parser for `*.html` templates.