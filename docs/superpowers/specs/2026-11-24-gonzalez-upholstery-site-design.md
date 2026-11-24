# Gonzalez Auto Upholstery — Site Design

Date: 2026-11-24

## Goal

A single-page brochure/lead-gen site for Gonzalez Auto Upholstery, a family-owned
auto-upholstery shop in Houston, TX (convertible tops, headliners, seats, custom
interiors). Goal is both credibility (portfolio-style showcase of work) and lead
generation (contact/quote form).

## Business facts

Pulled from third-party aggregators (Yelp itself returned 403 on fetch), **not yet
confirmed with the client**:

- Name: Gonzalez Auto Upholstery
- Address: 10730 Jones Rd, Houston, TX 77065 (one source lists 10720 — carhq.org's
  10730 is used as the working value)
- Phone: (832) 723-3036
- Hours: Mon–Fri 8:00 AM–6:00 PM, Sat 8:00 AM–1:00 PM, closed Sunday
- Family-owned, operating since 2007, ~25 years combined staff experience
- Services: convertible top replacement/repair (incl. hydraulic systems), headliner
  replacement/repair, seat upholstery repair/replacement, door panel work, carpet
  replacement/repair, dashboard repair/restoration, custom auto interiors

**Explicitly excluded from the site**: star ratings and review quotes. Sources disagree
(4.0★/55 reviews vs. 4.5★/12 reviews) and scraped review text isn't something to publish
as if verified — this matches the design system's own "don't invent testimonials or
metrics" rule. Only client-supplied testimonials go in, and only after the client
confirms NAP (name/address/phone/hours) overall.

`// TODO: confirm NAP with client before launch` goes in the source near wherever the
address/phone/hours are defined — not rendered on the page.

## Architecture

### Theme repo: `~/Projects/gonzalez-upholstery-theme`

New sibling repo to `~/Projects/design-system`, structured like
`~/Projects/BayouCityLabs/bcl-design-system`:

- `packages/theme/src/theme.ts` — `defineTheme({...})` defining every `ColorRoles` key
  for both light and dark schemes (dark-first, per the visual direction below), fonts,
  and shape aliases (tighter radii than BCL's pill shapes).
- Depends on `@ds/tokens`, `@ds/css`, `@ds/react` via `file:../../design-system/packages/*`
  — fine here, since this repo is a local design-authoring tool, never deployed.
- Storybook (its own port, e.g. 6008) renders the core's stories with Gonzalez tokens.
- `npm run check` runs the contrast gate (`checkThemeContrast`) — budget iteration time,
  since a dark cognac-leather palette is likely to need a pass or two to clear AA.
- `npm run build` produces `dist/gonzalez.css`: one file bundling core `@ds/css` styles +
  Gonzalez tokens + self-hosted theme fonts (`@ds/css/nofonts.css` base + theme fonts),
  same shape as BCL's `dist/bcl.css`.

### App repo: `~/Projects/gonzalez-upholstery` (this repo)

Stays a plain Next.js 16 App Router app with **no runtime `@ds/*` npm dependency** —
avoids the `file:`-link-to-sibling-repo problem, which breaks on any CI/deploy host that
only clones this one repo.

- `gonzalez-upholstery-theme`'s built `dist/gonzalez.css` is copied in as a committed
  static asset (e.g. `src/app/gonzalez.css`) and re-copied whenever the theme changes.
- All markup is plain JSX using `.ds-*` classes and `var(--ds-*)` tokens — the design
  system's documented "zero-build" consumption mode. No Tailwind, no hardcoded hex/px.
- Single page (`src/app/page.tsx`), composed of section components under
  `src/app/components/`: `Hero`, `Services`, `Gallery`, `About`, `ContactForm`, `Footer`.

## Visual direction

Dark-first, auto-upholstery-craft (not furniture-showroom, not racing):

- **Palette**: deep charcoal/garage-black base, warm cognac-leather primary accent,
  muted steel-gray secondary. No red accent (reads as clearance/racing, not craft).
- **Type**: industrial-leaning grotesk for headings, humanist sans for body. Deliberately
  distinct from BCL's Bricolage Grotesque/Instrument Sans pairing.
- **Shape**: moderate-sharp corners (4–6px radii) via alias token overrides — tooled, not
  soft/consumer-app like BCL's pill buttons.
- **Signature motif**: a subtle dashed stitch-line used sparingly as a section
  divider/accent — literal nod to upholstery stitching, playing BCL's "Contours" role.
- **Imagery**: warm practical-lighting shop photography, placeholder images used until
  the client supplies real photos (gallery section especially).

## Page sections

1. **Hero** — business name + "family-owned since 2007" tagline, primary CTA scrolls to
   contact form, secondary CTA is a `tel:` link.
2. **Services** — one short, specific paragraph per service (convertible tops, headliners,
   seats, door panels, carpet, dashboards, custom interiors). No generic filler copy.
3. **Gallery** — placeholder image grid, structured so real before/after photos drop in
   later without a layout change.
4. **About/trust** — family-owned since 2007, combined staff experience, Houston
   location. No star ratings, no review quotes.
5. **Contact** — form (name, phone, email, job type, message) + static address/phone/hours
   text. No map embed (avoids a third-party API dependency; can be added later if wanted).
6. **Footer** — contact recap, hours, service-area note.

## Contact form

- Client-side: plain HTML form, required-field validation, a CSS-hidden honeypot field
  for basic bot deterrence.
- Server action (Next.js): re-validates server-side, inserts a row into a Neon Postgres
  `leads` table (`name`, `phone`, `email`, `job_type`, `message`, `created_at`), then
  sends a notification email via Resend to the business's contact address.
- Failure handling: if the DB insert succeeds but the Resend call fails, the user still
  sees success (the lead is saved) and the email error is logged server-side only. If the
  DB insert fails, the user sees a retry message.
- **Requires account setup before this part can be built** — ask the user first:
  - A new Neon project/database (I can create this via the Neon MCP tools, but only on
    explicit go-ahead since it's a shared-account action).
  - A Resend account + API key — the user supplies or creates this; no real credentials
    get generated or guessed on their behalf.

## Testing

- Theme repo: reuses the design system's existing test/story/contrast-check tooling
  (`npm run check`) — no new testing infrastructure to invent.
- App repo: manual verification in the browser (dev server) for layout/responsiveness in
  both color schemes if dark/light toggle is exposed; a focused test for the contact
  form's server action (valid submission inserts a row; honeypot-filled submission is
  rejected silently).

## Out of scope

- Multi-page site (single-page brochure per earlier decision).
- Map embed.
- CMS/editable content — content is hardcoded in components for this build.
- Published/public npm packages for the theme — it stays local-only, consumed as a built
  CSS file.
