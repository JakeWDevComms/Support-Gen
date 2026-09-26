# Support Gen

Reusable multi-project planning representation generator for DevComms.

## Architecture

One Next.js App Router codebase serves projects from typed config files in `src/projects/`.

- `/[projectSlug]` — resident form, live preview, copy and open-in-email actions.
- `/[projectSlug]/privacy` — project-specific privacy statement.
- `/[projectSlug]/reach/[campaignSlug]` — tracked campaign landing page.
- `/admin/[projectSlug]` — password-protected supporter dashboard.
- `/admin/[projectSlug]/reach` — campaign links, QR downloads and source conversion dashboard.
- `src/projects/*.ts` — all client/project content and branding.
- `src/lib/db` — Neon Postgres + Drizzle schema.
- `src/app/api/actions` — submission/action capture and abuse controls.

Adding a campaign means copying `src/projects/example-project.ts`, filling in the config, and adding it to `src/lib/projects.ts`. The resident UI and admin dashboards do not need to be rewritten. The optional `reach` block defines campaign landing-page copy and channel-specific tracked routes.

## Database choice

**Neon Postgres via Vercel Marketplace** is the recommended v1 database.

It suits Support Gen because the data is relational and reporting-heavy: unique supporter counts, time series, benefit selections, postcode districts, duplicate detection and CSV exports. It stays lightweight on Vercel and avoids bringing in Supabase Auth/Realtime/Storage when v1 does not need those services.

For very high-volume campaigns, Upstash Redis can later be added for a more sophisticated distributed rate limiter. V1 deliberately uses Postgres for the light rate/duplicate checks so there is only one data service to maintain.

## First project: Castle Hills Solar Farm

- Client / Data Controller: TotalEnergies
- Data Processor: DevComms
- Planning authority: Solihull Metropolitan Borough Council
- Application: `PL/2025/01404/PPFL`
- Planning recipient: `planning@solihull.gov.uk`
- Public route: `/castle-hills-solar`
- Admin route: `/admin/castle-hills-solar`

The CC list is intentionally empty until DevComms or TotalEnergies confirms the reporting inbox(es).

## Environment variables

Copy `.env.example` to `.env.local` for local development.

- `DATABASE_URL` — Neon Postgres connection URL.
- `ADMIN_PASSWORD` — shared v1 dashboard password.
- `AUTH_SECRET` — 32+ random bytes used for admin-session signing and keyed one-way hashes.
- `CRON_SECRET` — protects the retention endpoint.

## Database provisioning

1. In the Vercel `support-gen` project, install **Neon Postgres** from Vercel Marketplace.
2. Ensure `DATABASE_URL` is available to Production and Preview.
3. Pull the environment locally if needed.
4. Run:

```bash
npm install
npm run db:push
```

Drizzle will create the `submissions` and `reach_events` tables and their indexes from `src/lib/db/schema.ts`.

## Vercel deployment

1. Link the GitHub repository `JakeWDevComms/Support-Gen` to the Vercel project `support-gen`.
2. Add `ADMIN_PASSWORD`, `AUTH_SECRET` and `CRON_SECRET` in Vercel Project Settings → Environment Variables.
3. Provision Neon and run `npm run db:push` once.
4. Deploy `main`.

The included `vercel.json` calls `/api/retention` daily. A project is only purged once a `consultationCloses` date is configured and its configured retention period has expired.

## Resident action flow

The user must provide a name, email, address and valid UK postcode, and must either choose at least one project point or write an additional comment. They separately acknowledge the privacy statement; project-update consent is a separate unticked checkbox.

The generated letter is deterministic per resident rather than regenerated on every render. Different residents can receive different sentence variants, while the system can still reproduce which wording was used. The letter also states that an online drafting tool was used and that the selected views are the resident's own.

`Open in email` builds a resident-controlled `mailto:` draft. If the URL exceeds the conservative 1,800-character safe threshold, Support Gen copies the full letter instead and tells the resident to paste it into a new message to the planning authority.

## Reporting and anti-abuse

Each copy/email action records:

- timestamp and project;
- name, email, full address and postcode;
- postcode district;
- selected benefit IDs and wording-variant IDs;
- whether an additional comment was left;
- separate update opt-in status;
- first-party UTM/source fields;
- action type;
- a keyed one-way IP hash;
- an email+postcode supporter fingerprint;
- duplicate flag.

V1 limits one hashed IP to 10 recorded actions in 15 minutes and includes a honeypot. Repeat email+postcode actions are retained but flagged and only count once in the admin dashboard's **Unique supporters** figure.

## Privacy review before public launch

The project privacy page is generated from config. Castle Hills currently uses a configurable `legitimate interests` basis for the core tool and consent for the separate email-update opt-in. **TotalEnergies should confirm the Article 6 basis and its documented Legitimate Interests Assessment with its data-protection lead before public launch.**

CSV exports contain personal data and should be treated as restricted project information.


## Reach module

Projects can optionally define a `reach` block. Each configured campaign creates a route such as:

```
/castle-hills-solar/reach/facebook-local
/castle-hills-solar/reach/leaflet-qr
```

The landing page gives a short factual introduction, lets the visitor choose whether to continue into the representation tool, and records anonymous first-party funnel events.

The Reach dashboard at `/admin/[projectSlug]/reach` provides:

- one-click campaign URLs;
- downloadable high-resolution QR PNGs for print;
- a custom tracked-link builder;
- unique landing visitors;
- unique support clicks;
- unique tool starts;
- unique supporters attributed to each campaign;
- conversion rate by campaign/source.

Anonymous Reach activity is stored separately from personal supporter records. A 30-day first-party pseudonymous visitor identifier is used to deduplicate funnel events. Raw IP addresses are not stored.

### Paid media

Support Gen currently measures the journey **after somebody reaches a campaign link**. It does not yet read impressions, paid reach or spend from Meta/Google ad accounts. Those integrations can be added later to calculate CTR, cost per visit and cost per unique supporter.

### Message testing

Campaign entries can override the default `headline` and `intro`. This lets DevComms create separate factual variants for different channels or tests while keeping the underlying scheme configuration and reporting in one project.


## Project manager

Support Gen now includes a browser-based project manager at the application root.

- `/` — list and manage projects.
- `/admin/projects/new` — create a new project.
- `/admin/projects/[projectSlug]/edit` — edit an existing project.
- New projects can configure client/controller details, scheme and application reference, LPA recipients, branding, support reasons, Reach, privacy contact and retention.
- The editor automatically creates the standard opening, transition, closing and benefit-phrasing variation library around the project facts.
- Castle Hills remains a seeded example. Once the database is connected, editing a seeded project can create a database-backed override without changing application code.

Database-backed project creation requires the `project_configs` table defined in the Drizzle schema. Run `npm run db:push` after connecting the database.


## Campaign Studio pivot

Support Gen's primary workflow is now an internal paid-social Campaign Studio rather than a resident letter generator.

For each project, `/admin/[projectSlug]/ads` generates:
- four factual ad concepts based only on approved project facts;
- Meta primary text/captions, headlines, descriptions and CTA;
- image briefs and generated creative;
- downloadable 4:5, 1:1 and 9:16 crops;
- a broad local audience/targeting recommendation;
- placement, optimisation, testing and pre-launch compliance notes.

The studio uses Vercel AI Gateway. Deployed Vercel functions can authenticate with the project's OIDC token, so no provider API key is required in the application code. Image generation uses OpenAI GPT Image 2.5 Flare through AI Gateway.

Campaign audience recommendations deliberately avoid political affiliation and sensitive-characteristic profiling. They are intended as a starting setup for testing in the ad account, not a substitute for live campaign performance data.

The legacy letter-generator code is no longer part of the main UI or project workflow.
