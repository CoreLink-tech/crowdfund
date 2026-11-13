# HelpFund Development Checklist

Last updated: 2026-11-13

## STAGE 1: REPOSITORY AUDIT — COMPLETED
- [x] Full inspection of existing Next.js 15 App Router + custom CSS prototype
- [x] Identified hardcoded campaigns and demo-only forms
- [x] Preserved design system and component structure

## STAGE 2: DATABASE AND BACKEND FOUNDATION — MOSTLY COMPLETE
- [x] Full relational schema (`lib/db/schema.ts`) for all required tables
- [x] Turso client (`lib/db/index.ts`) with local fallback
- [x] Drizzle config + migrate/seed scripts
- [x] `.env.local` configured with provided Turso credentials
- [x] Zod validation schemas (auth)
- [x] Auth service layer
- [ ] Drizzle migration generated & applied (blocked by incomplete npm install in sandbox; SQL schema ready)
- [ ] Categories seeded

## STAGE 3: AUTHENTICATION — COMPLETE (core)
- [x] Password hashing (bcrypt, 12 rounds)
- [x] Secure session management (jose JWT + DB sessions, httpOnly cookies)
- [x] Registration API + page (`/api/auth/register`, `/sign-up`)
- [x] Login API + page (`/api/auth/login`, `/sign-in`)
- [x] Logout API + button
- [x] `/api/auth/me`
- [x] Forgot password + reset password flows (token-based, email abstraction)
- [x] Protected `/dashboard` (server-side redirect if unauthenticated)
- [x] Header shows logged-in state + logout
- [x] Role support (user / admin) in session
- [ ] Email sending (abstraction only – no provider credentials)
- [ ] Rate limiting (to be added in Stage 7)

## STAGE 4–8: PENDING

### How to finish Stage 2 locally / on your machine
```bash
cd helpfund
npm install
# Ensure .env.local has TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
npx drizzle-kit generate
npm run db:migrate
SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD=YourStrongPass123 npm run db:seed
```

### Files created / modified this session
- lib/db/schema.ts, index.ts, migrate.ts, seed.ts
- lib/auth/password.ts, session.ts
- lib/services/auth.ts
- lib/validations/auth.ts
- app/api/auth/*/route.ts (register, login, logout, me, forgot-password, reset-password)
- app/sign-up/page.tsx, app/sign-in/page.tsx (connected to real APIs)
- app/dashboard/page.tsx
- app/forgot-password/page.tsx, app/reset-password/page.tsx
- components/header.tsx, components/logout-button.tsx
- .env.example, .env.local (local only), package.json, DEVELOPMENT_CHECKLIST.md
