# Aurevia Greens — Hyderabad lead-generation template

Demonstration website for a **productized local-lead service** aimed at Hyderabad real-estate developers, brokers, channel partners and property consultants. The sample project is fictional. Nothing here is a live inventory, RERA registration or investment claim.

**Package to sell (your 30-day offer):** `Aurevia Lead Desk` — one conversion page + qualification + site-visit calendar + sales desk. Indicative **₹65,000–₹1,25,000** (about **USD 750–1,500**), **50% deposit to start**. Monthly retainer **₹25,000** after launch. Full copy lives in [`src/config/offer.ts`](src/config/offer.ts). Daily outreach scripts and a 15-minute close-call agenda: [`src/config/outreach.ts`](src/config/outreach.ts) and **Admin → Outreach**.

## Screenshots

Add client-facing captures here after your first demo:

- `docs/screenshots/hero.png`
- `docs/screenshots/enquiry.png`
- `docs/screenshots/admin.png`

## Features

- Premium one-page landing experience (Mokila–Shankarpally gated villa plots)
- Short enquiry form → conversational qualification (accessible buttons + free text)
- Lead scoring (internal only) with reasons
- Site-visit slots (IST), double-book prevention, pickup notes, `.ics` download
- Simulated WhatsApp/email confirmations and reminder queue
- Sales dashboard: KPIs, pipeline, notes, assignment, CSV export, reminder simulation
- Outreach list for selling the template itself
- Replaceable adapters for WhatsApp Cloud API, email, Google Calendar, CRM
- Demo documents, privacy/terms placeholders, JSON-LD, sitemap, robots

## Architecture

Next.js 15 App Router · TypeScript · Tailwind · Prisma + SQLite · Zod validation · Node API routes.

```
src/config/     brand, project, scoring, templates, offer, outreach
src/lib/        leads, appointments, scoring, availability, auth
src/services/   WhatsApp / email / calendar / CRM adapters
src/app/        landing, legal, admin, api
prisma/         schema + seed
```

SQLite now; switch `provider` to `postgresql` and `DATABASE_URL` later — models stay the same.

## Local setup

```bash
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin: [http://localhost:3000/admin](http://localhost:3000/admin).

If migrate complains on a fresh clone, `npx prisma db push && npm run db:seed` is enough for the demo.

### Demo admin credentials

| Field | Value |
| --- | --- |
| Email | `julia.r@example.org` |
| Password | `demo-admin-2026` |

These are **not** production-grade. Use an identity provider and hashed secrets before any real customer data.

## Environment variables

See [`.env.example`](.env.example). Never commit real tokens. `.env` is gitignored.

## How to rebrand

1. Edit [`src/config/site.ts`](src/config/site.ts) — company, phone, WhatsApp, colours, legal copy.
2. Edit [`src/config/project.ts`](src/config/project.ts) — name, price, FAQs, gallery paths, map, visit hours.
3. Replace files in `public/media/` (keep names or update paths in config).
4. Re-seed or create a new `ProjectRecord` if you store projects in the database.

## WhatsApp

**Demo:** `wa.me` links with encoded prefill. In-site chat stores **simulated** messages. A `wa.me` button cannot read replies, check calendars, or send reminders.

**Production:** set `WHATSAPP_MODE=production` plus Cloud API token, phone number id, verify token, app secret. Implement send inside `ProductionWhatsAppAdapter`. Point Meta webhooks to `/api/webhooks/whatsapp`. Use approved templates for proactive reminders. Collect opt-in (already stored as consent flags).

## Google Calendar

Demo uses `LocalCalendarAdapter` + `CalendarEvent` rows. To enable Google later: OAuth client, refresh token, `GOOGLE_CALENDAR_ID`, `CALENDAR_PROVIDER=google`, then implement the stub methods in `src/services/adapters.ts`.

## Reminders

Reminders are rows with `dueAt`. They are **not** run by a closed browser tab. In admin, **Notifications → Run due reminders** (optional ISO “simulate time”). In production, add a durable cron (e.g. Vercel Cron) that `POST`s `/api/admin/reminders` with a shared secret you should add before go-live.

## Deploy (Vercel)

1. Push this repo.
2. Set env vars (use PostgreSQL in production: Prisma `provider = "postgresql"`).
3. Build command: `prisma generate && prisma migrate deploy && next build`.
4. Add Cron for reminders.
5. Turn `robots` indexing on only for real projects with real disclosures.

## Production-readiness checklist

- [ ] Replace demo brand, RERA, testimonials, stats
- [ ] Legal review of privacy/terms (DPDP)
- [ ] Real authentication
- [ ] PostgreSQL + backups
- [ ] WhatsApp / email credentials and templates
- [ ] Rate limiting at the edge
- [ ] HTTPS, secret rotation, webhook signatures
- [ ] Independent verification of all property facts

## Known demo limitations

- Media is generated local artwork, not site photography
- Notifications are simulated
- Admin password is in env as plaintext comparison
- SQLite is single-node
- Google Calendar / CRM / SMTP adapters are explicit stubs

## Troubleshooting

- **Prisma client missing:** `npx prisma generate`
- **Empty admin:** `npm run db:seed`
- **Port in use:** `npx next dev -p 3001`
- **Tests:** `npm test` (uses `prisma/test.db`)

## Five-minute client demo script

1. **Landing** — Scroll hero, trust strip, “Demonstration Website” banner. Point out price and plot sizes without scarcity gimmicks.
2. **Lead** — Submit the short form (use a `90000xxxxx` demo mobile).
3. **Qualification** — Answer the WhatsApp-style questions; go **Back** once to show correction.
4. **Site visit** — Choose IST slot, attendees, pickup.
5. **Confirmation** — Read the reference, download `.ics`, open Maps.
6. **Reminders** — Admin → Notifications → set simulate time past a reminder `dueAt` → Run due reminders.
7. **Dashboard** — KPI cards and funnel.
8. **Pipeline** — Open the new lead: score reasons, conversation, stage change, reassign.
9. **Rebrand** — Open `src/config/project.ts` and change the project name; refresh to show the template nature.
10. **Your offer** — Admin → Outreach: 15-minute close, deposit, retainer ask after first completed visit.

## Commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
