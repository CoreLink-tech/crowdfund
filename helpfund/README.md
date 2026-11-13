# HelpFund

Nigeria-first crowdfunding platform built with Next.js, Clerk, and Turso.

## Features
- Clerk authentication (sign up / sign in)
- Create and submit campaigns for review
- Admin approve / reject workflow
- Public explore + campaign pages from the database
- Donation records with test payment adapter
- User dashboard (campaigns, donations, totals)

## Quick start
See [SETUP.md](./SETUP.md) for environment variables and deployment.

```bash
npm install
npm run dev
```

## Important
- No live payment processing yet
- Campaigns must be approved before public listing
- Set `ADMIN_CLERK_IDS` for admin access
