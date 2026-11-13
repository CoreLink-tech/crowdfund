# HelpFund — Setup & Production Guide

## Stack
- Next.js 15 (App Router) + TypeScript
- Clerk (authentication)
- Turso / libSQL + Drizzle schema
- Vercel deployment

## Required environment variables (Vercel)

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk Dashboard → API Keys (Config type) |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `TURSO_DATABASE_URL` | Yes | `libsql://...turso.io` |
| `TURSO_AUTH_TOKEN` | Yes | Turso auth token |
| `ADMIN_CLERK_IDS` | Recommended | Comma-separated Clerk user IDs with admin access |
| `APP_URL` | Recommended | Production URL |
| `ALLOW_TEST_PAYMENTS` | Optional | Set `true` only if you need test donations in production |

## Local development

```bash
cd helpfund
cp .env.example .env.local
# fill keys
npm install
npm run dev
```

## Database
Schema tables and categories are already applied to the linked Turso database.
If you need to re-seed categories:

```bash
npm run db:seed
```

## Admin access
1. Sign in once (creates user row).
2. Add your Clerk user ID to `ADMIN_CLERK_IDS` on Vercel.
3. Redeploy → open `/admin`.

## Payments
Live payment providers are **not** activated. The test adapter records donations
and updates campaign totals only after explicit test confirmation.
Do not treat test donations as real money.

## Security notes
- Server-side auth via Clerk on protected routes
- Admin actions require role or bootstrap ID list
- Rate limits on campaign create and donation endpoints
- Security headers set in `next.config.ts`
- Secrets never exposed via `NEXT_PUBLIC_*` except Clerk publishable key

## Stages completed
1. Audit  
2. Database foundation  
3. Authentication (Clerk)  
4. Campaign management  
5. Donation architecture (test adapter)  
6. Dashboards + admin review  
7. Security & quality hardening  
8. Production preparation & docs  
