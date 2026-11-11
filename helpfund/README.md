# HelpFund

A Nigeria-first crowdfunding platform starter built with Next.js, TypeScript and React.

## Included in this first build

- Responsive public homepage
- Campaign discovery with category filtering and search
- Campaign detail pages
- Campaign creation form UI
- Sign-in and sign-up screens
- Reusable campaign cards, header and footer
- Sample campaign data

## Important current limitations

This is the first frontend foundation. It uses sample data and client-side demo interactions. It does **not** yet create real accounts, persist campaigns, accept donations, process payments, or support withdrawals.

Do not collect real identity documents or financial information with this demo.

## Requirements

- Node.js 20.9 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project structure

```text
app/
  campaigns/[slug]/page.tsx
  explore/page.tsx
  create/page.tsx
  sign-in/page.tsx
  sign-up/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  campaign-card.tsx
  footer.tsx
  header.tsx
lib/
  campaigns.ts
```

## Next development milestones

1. Add a dedicated API service and shared API contracts.
2. Add Turso + Drizzle schema and migrations.
3. Implement authentication and authorization.
4. Persist campaigns and media in Cloudflare R2.
5. Add moderation and verification workflows.
6. Build donation, ledger and withdrawal infrastructure.
7. Integrate payment providers only after the financial model is tested.
8. Build the Kotlin Android application against the same API.
