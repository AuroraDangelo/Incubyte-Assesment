# Bharat Motors – Car Dealership Inventory System

A full-stack inventory app for a car dealership: a token-secured REST API with a persistent SQL database, and a responsive React single-page app for browsing, searching, purchasing and (for admins) managing vehicles.

| Layer | Stack |
| --- | --- |
| Backend | Node.js · TypeScript · Express · **SQLite file database** (`better-sqlite3`) · JWT · bcrypt · zod |
| Frontend | React 19 · TypeScript · Vite · **Tailwind CSS** · HTML5/CSS3 |
| Tests | Vitest · Supertest (API) · React Testing Library (UI) |

## Screenshots

| Login | Dashboard (user) |
| --- | --- |
| ![Login](docs/screenshots/01-login.png) | ![Dashboard](docs/screenshots/03-dashboard-user.png) |

| Filter by category | Purchase feedback |
| --- | --- |
| ![Filter](docs/screenshots/04-filter-electric.png) | ![Purchase](docs/screenshots/05-purchase-toast.png) |

| Admin view | Admin: add vehicle |
| --- | --- |
| ![Admin](docs/screenshots/06-dashboard-admin.png) | ![Add](docs/screenshots/07-admin-add-modal.png) |

Mobile: [`docs/screenshots/08-mobile.png`](docs/screenshots/08-mobile.png) · Registration: [`02-register.png`](docs/screenshots/02-register.png)

> Screenshots were taken in a sandbox without internet access, so the Google-Fonts typefaces (Archivo / Public Sans) fell back to the system font. Run locally to see the intended typography.

## Running locally

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS recommended; tested across Node 20.10+ and 22.x). If using `nvm`, run `nvm use` to automatically select the supported version.
- **npm**: `v9+` or `v10+`.

> **Node.js Compatibility Note:** The project dependencies (`better-sqlite3@^11.7.0`, `vite@^6.0.11`, `vitest@^2.1.8`) are configured to support both Node 20 and Node 22 without native compilation crashes or missing module errors.

### Quick Start

```bash
# 1. Install dependencies for both apps
npm run install:all

# 2. (Optional) Configure environment
# Sensible development defaults exist in backend/src/config.ts.
# To override:
cp backend/.env.example backend/.env    # On Windows: copy backend\.env.example backend\.env

# 3. Create the database, an admin user and sample cars
npm run seed
# Default Admin Login:
#   Email:    admin@dealership.test
#   Password: Admin@12345
# (Tip: run 'npm run seed -- --reset' anytime to reset the showroom inventory)

# 4. Start the backend API (http://localhost:4000)
npm run dev:backend

# 5. In another terminal, start the frontend SPA (http://localhost:5173)
npm run dev:frontend
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser. The Vite dev server automatically proxies `/api` requests to the backend on `http://localhost:4000`.

**Production build:** `npm --prefix backend run build && npm --prefix backend start` and `npm --prefix frontend run build` (static files in `frontend/dist`).

**Running the tests:** `npm test` (runs both test suites) or `npm run test:report` to regenerate [`docs/test-report.md`](docs/test-report.md).

## API

All `/api/vehicles/**` routes require `Authorization: Bearer <jwt>`.

| Method & path | Access | Purpose |
| --- | --- | --- |
| `POST /api/auth/register` | public | Create an account (role is always `user`) |
| `POST /api/auth/login` | public | Returns `{ token, user }` |
| `GET /api/vehicles` | authenticated | List all vehicles (including sold-out ones) |
| `GET /api/vehicles/search` | authenticated | Query: `make`, `model`, `category` (case-insensitive partial), `minPrice`, `maxPrice` |
| `POST /api/vehicles` | authenticated | Add a vehicle `{make, model, category, price, quantity}` |
| `PUT /api/vehicles/:id` | authenticated | Partial update |
| `DELETE /api/vehicles/:id` | **admin** | Delete |
| `POST /api/vehicles/:id/purchase` | authenticated | Decrease stock (`{quantity?}` default 1); `409` if insufficient |
| `POST /api/vehicles/:id/restock` | **admin** | Increase stock `{quantity}` |

Errors are always `{ "error": "message", "details"?: [...] }` with 400 / 401 / 403 / 404 / 409 as appropriate.

### Design decisions
- **Layered architecture** – routes → services (business rules) → repositories (SQL). Dependencies are injected in `app.ts`, so tests run against a temporary *file* SQLite database (the brief forbids in-memory DBs).
- **No overselling** – purchase is a single guarded `UPDATE … WHERE quantity >= ?`, so concurrent buyers cannot drive stock negative.
- **No privilege escalation** – registration ignores any client-supplied `role`; admins are created by the seed script.
- **Access rules follow the brief literally**: add/update need a valid token; delete and restock are admin-only. The UI additionally hides all management controls from non-admins. Tightening add/update to admin only is a one-line change (`requireRole('admin')` in `vehicleRoutes.ts`).
- Login returns the same error for unknown e-mail and wrong password; SQL `LIKE` wildcards in search input are escaped.
- The session JWT is kept in `localStorage` for simplicity; an `httpOnly` cookie would be the hardening step for production.

## Test-driven development

The history follows Red → Green → Refactor: each `test(red): …` commit adds failing tests, followed by a `feat(green): …` commit that makes them pass, then `refactor: …`. See `git log --oneline`.

Latest results (full output in [`docs/test-report.md`](docs/test-report.md)):

| Suite | Result |
| --- | --- |
| Backend | 63 tests passing · 96.5 % statements / 87 % branches coverage |
| Frontend | 17 tests passing |

## My AI Usage

**Tools used:** Claude (Anthropic), via claude.ai chat with a code sandbox.

**How I used it** *(factual summary of what was generated – edit to match your own involvement)*:
- Gave Claude the kata brief and asked it to implement the whole project.
- Claude chose the stack (Express + SQLite + React/Tailwind), designed the layered architecture and wrote the failing tests first, then the implementation, then a refactor – committing at each Red/Green/Refactor step.
- Claude wrote the UI (including the number-plate search strip / hang-tag card design direction), ran the app in a headless browser, took the screenshots above, and fixed a card-layout bug found in them.
- Every commit carries a `Co-authored-by: Claude` trailer.

**Reflection** *(write this yourself before submitting – the brief expects your own view)*:
- What did the AI speed up, and what did you have to review or correct?
- What would you change about the generated design (e.g. admin-only add/update, cookie-based tokens)?
- Be ready to walk through any file in the interview, including *why* the guarded `UPDATE` in `vehicleRepository.ts` prevents overselling.

Raw chat logs: see [`PROMPTS.md`](PROMPTS.md).

## Deployment (optional)
Not deployed. The frontend is a static build (Vercel/Netlify); the API needs a host with a persistent disk for the SQLite file (Render, Fly.io, Railway) – set `JWT_SECRET`, `DB_PATH`, and `CORS_ORIGIN`, and point the frontend at the API (reverse-proxy `/api`).
