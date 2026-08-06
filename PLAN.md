# MyWay+ account portal redesign (Crit 2 — Unsolicited Redesign)

## Context

Crit 2 asks: pick a real organisation whose mission you respect but whose
website you don't, and build them a better one — using their real content
(identity, purpose, contact info), restructured and rewritten, not copied or
invented. The chosen target is **Transport Canberra's MyWay+** ticketing
account portal (login, balance, top-up, trip history, concession management).

This is a good target because the real system's failures are extensively
*documented*, not just a matter of taste: a troubled Nov 2024 launch
(validator failures, an overcharging incident requiring a full transaction
audit), a Legislative Assembly inquiry finding it "clearly not ready for
launch," still cited as broken 14 months later, ~85% 1-star reviews on Google
Play specifically complaining that "account management" is just an embedded
webview to the same web portal rather than a native UI, an orphaned/ungrouped
login screen, a 3-path signup modal before you reach an actual form, and
password-before-email field ordering. Each of these is a concrete, citable
flaw a redesign can point to and fix — not a subjective restyle.

The repo started as a blank Astro starter: one layout, one placeholder page,
no design tokens, no dark mode, nothing else. This plan builds the full
account-portal redesign from that blank slate.

**Decisions locked in:**
- Login/signup are narrative only — no hard client-side gate on management
  pages. Dashboard/top-up/trips/etc. are always directly viewable; a small
  disclosure note (landing page) explains this is a non-functional prototype.
  Chosen over a real redirect gate to avoid flash-of-content/redirect-loop
  risk that's hard to verify cleanly at both marked viewports.
- Park & Ride and fare-card linking are **cut** from scope — separate
  sub-systems in the real product with no documented UX flaw to fix; adding
  them would dilute a one-week build's focus on the account/ticketing flow
  problems that are actually documented (reviews, inquiry, editorial).
- Accent hue: **teal/deep green** — reads calm and transit-adjacent (nods to
  the emissions-reduction framing without literal green-washing), and is
  sharply distinct from the generic government blue the real system uses.
- Dark mode: **first-class light + dark toggle**, defaulting to
  `prefers-color-scheme`, manually overridable and persisted in
  `localStorage`. Chosen over dark-only because concession holders skew
  older/student and shouldn't be forced into one theme.

## Sitemap (9 pages)

| Path | Purpose | Real-system flaw it fixes |
|---|---|---|
| `src/pages/index.astro` | Landing/context: rewritten mission framing, the real "why we rebuilt this" critique (launch problems, inquiry finding), disclosure note, link into the demo | Dense single-page marketing IA → one short, real landing page |
| `src/pages/login.astro` | Grouped login card, passkey-style primary CTA + password fallback, minimal persistent header with a help link | Orphaned floating CTAs, no header/help escape hatch |
| `src/pages/signup.astro` | Single linear form, conventional field order (email → password → confirm), no modal gate | 3-path signup modal, password-before-email ordering |
| `src/pages/dashboard.astro` | Bento grid: hero balance card + top-up CTA, auto-top-up status tile, concession status tile, recent-trips tile | Native, coherent account home replacing the webview-wrapped "account management" |
| `src/pages/top-up.astro` | Preset amount chips + custom amount, brief (not instant) processing state → success, updates balance | Trust/latency mismatch — real system's QR/validator failures make "instant" money movement feel unverified |
| `src/pages/trips.astro` | Day-grouped, icon-categorized trip list over fixture data, date-range + page-size controls | Reframes trip history as spending clarity (TfL/Monzo pattern), not a buried compliance log |
| `src/pages/auto-top-up.astro` | Explicit toggle + threshold field + target field + plain-language preview sentence | Never a hidden "0 = disabled" hack; plain language for threshold/discount rules |
| `src/pages/concession.astro` | Status card (active/expiring/expired), real concession catalogue, plain-language expiry | Legibility for the actual (senior/student-skewed) user base |
| `src/pages/404.astro` | Minimal not-found page, reuses `BaseLayout` | Required for a real static site; keeps invariants happy sitewide |

## Fake-state strategy (zero backend, works from built `dist/`)

- **`src/lib/fixtures.ts`** — static, real-content-derived data: `FARE_TABLE`
  (real Jan 2026 figures: adult peak $3.41/off-peak $2.70, concession peak
  $1.71/off-peak $0.95, student $1.29, daily/monthly caps, 90-min transfer,
  5% auto-top-up discount), `CONCESSION_TYPES` (the six real categories, real
  30 Jun 2026 blanket expiry except ACT Seniors), `SAMPLE_TRIPS` (10–15
  invented demo journeys using real ACT route/stop names — clearly commented
  as fabricated demo data, not real trip records).
- **`src/lib/demo-state.ts`** — a tiny typed `localStorage` wrapper, used only
  inside client `<script>` blocks (never at build time — no `localStorage`
  during SSG). Keys: `loggedIn`, `balance` (cents), `autoTopUp`
  (`{enabled, thresholdCents, targetCents, method}`), `concession`
  (`{type, status, expiry}`). Seeded with sane defaults on first load.
- Login/signup submit → sets `loggedIn=true` (+ seeds defaults on signup) →
  navigates to `./dashboard/`. No real validation beyond non-empty fields;
  this demonstrates the *flow fix* (grouped CTA, single path), not real auth.
- Top-up: preset chips (`$10/$20/$50/$100`) + custom field → submit shows a
  "Processing…" state for ~800ms–1.2s via `setTimeout`, then writes the new
  balance to `localStorage` and shows a success state. Deliberately not
  instant.
- Auto top-up: form bound to stored state; toggle/threshold/target edits
  write to `localStorage` on `change` and live-update a plain-language
  preview sentence ("When your balance drops to $10, we'll add $25").
- Concession: status card reads stored state (default: an active concession
  expiring at a plausible future date); changing type updates storage and
  re-renders the card.
- Trip history: pure fixture data, day-grouped, filtered/paginated client-side
  — no persistence needed, it's a browse-only record.
- Dashboard's balance tile, the top-up success screen, and the balance figure
  anywhere else all read the same `balance` key on page load, so a top-up
  is visible again after navigating back to the dashboard.
- All interactivity is plain per-page `<script>` DOM code — no framework
  runtime, consistent with the current no-Tailwind/no-component-library stack.

## Design system foundation

- **`src/styles/tokens.css`** (new): CSS custom properties on `:root` —
  `--color-brand`/`-contrast` (teal), `--color-bg`/`-surface`/`-surface-raised`,
  `--color-text`/`-text-muted`, `--color-border`; fixed functional colors
  `--color-success`/`-warning`/`-danger` (green/amber/red, constant hue across
  themes); spacing scale `--space-1..8`; type scale `--text-xs..3xl`;
  `--radius-card`, `--shadow-card`. Dark theme via
  `@media (prefers-color-scheme: dark)` plus a `[data-theme="dark"]` override
  so the manual toggle can coexist with the system default. A `.tabular-nums`
  utility (`font-variant-numeric: tabular-nums`) applied to every money figure.
  Font: start with the existing system-ui stack; only add a self-hosted
  variable font (e.g. `@fontsource/inter`) later if visual review shows the
  system fallback genuinely undermines the "distinctive" goal — don't add the
  dependency pre-emptively.
- **`src/styles/global.css`** (rewrite): base element styles consuming the
  tokens, small utility classes (`.visually-hidden`, layout helpers as
  needed). Still hand-written CSS, no framework.
- **`src/components/`**:
  - `BalanceCard.astro` — hero tile, tabular-nums balance, "Top up" CTA.
  - `StatusCard.astro` — generic status tile (active/expiring/expired/off →
    success/warning/danger color mapping), reused by concession + dashboard's
    auto-top-up tile.
  - `TripListItem.astro` — one row: mode icon, route/stop text, tabular-nums
    fare, fare-type badge.
  - `AmountChip.astro` — preset-amount button, markup/styling only.
  - `BentoTile.astro` — grid-tile wrapper (`hero`/`medium`/`small` size prop).
  - `icons/` — hand-written inline-SVG icons (`BusIcon`, `LightRailIcon`,
    `TransferIcon`, `SunIcon`/`MoonIcon` for the theme toggle). No icon
    library dependency.
  - `BaseLayout.astro` (rewrite): full `<nav aria-label="Primary">` with
    relative links to every core page, header with a text wordmark + theme
    toggle button, `<footer>` with real contact info (13 17 10, Access
    Canberra feedback framing) — fixes the "no help/contact escape hatch"
    flaw sitewide rather than just narratively.

## Content plan — real vs. fictional (kept explicit and defensible)

**Real, rewritten (must appear, restructured not copied):**
- Landing page mission framing + the real launch-problem critique (factual,
  citable — Nov 2024 launch issues, inquiry finding, still-broken reporting).
- Real Jan 2026 fare table on top-up/concession pages.
- Real six-category concession catalogue + real 15-day reminder / 30 Jun 2026
  expiry policy on the concession page.
- Real contact info (13 17 10, Access Canberra feedback channel) in the
  footer/landing page — reproduced accurately, not "rewritten" (a phone
  number can't be paraphrased).
- Real auto-top-up mechanics (below-$10 default trigger framing, 5% discount,
  card-only) reflected in copy/labels, even though stored values are demo-
  editable.

**Fictional, clearly local demo data:**
- `SAMPLE_TRIPS` specific journeys/timestamps (real route/stop names, invented
  trips) — commented in `fixtures.ts` as fabricated.
- Demo login/signup identity, starting balance, assigned concession expiry
  date — invented for demonstration.
- One disclosure note on the landing page states plainly that this is a
  non-functional prototype, account data is a demo fixture, and fares/
  concession rules/contact details reflect the real MyWay+ system as of
  Jan 2026 — this single disclosure covers the "don't invent the
  organisation's identity" requirement without cluttering every page.

## Spec/testing plan

- Delete `spec/starter.test.ts` once `index.astro` no longer has
  `data-testid="intro"` (milestone 2, per its own comment).
- Add **`spec/redesign.test.ts`** (same pattern as `invariants.test.ts` —
  runs against built `dist/` HTML), asserting:
  1. Every `nav a[href]` in built HTML is relative (doesn't start with `/`) —
     an automated version of the CLAUDE.md relative-link rule.
  2. Every primary-nav `href` resolves to a real file in `dist/`.
  3. `dashboard.html` contains a dollar-figure pattern (`/\$\d+\.\d{2}/`) —
     proves the balance renders in the static/no-JS fallback.
  4. At least one page's text includes real fare figures (e.g. `"3.41"`,
     `"2.70"`).
  5. The concession page's text names several real category names.
  6. `top-up.html` contains multiple preset-amount elements (values/text like
     `10`, `20`, `50`).
  7. The auto-top-up page contains an actual `input[type=checkbox]`/
     `role=switch` — not just numeric fields (the specific anti-pattern the
     brief calls out).
  8. Login's primary actions live inside a labelled container (`form` or a
     heading-owning card), not bare children of `body`/`main` — a structural
     proxy for "grouped, not orphaned."
- Leave genuinely visual/judgment calls (does the bento grid *read* well, is
  the passwordless framing convincing) to the crit, per `spec/README.md`.

## Build order (each step `pnpm check`-green, independently committable)

1. **Foundation** — `tokens.css`, rewrite `global.css`, rewrite
   `BaseLayout.astro` (nav/header/footer/theme toggle), add `404.astro`.
2. **Landing + content layer** — `src/lib/fixtures.ts`, rewrite `index.astro`
   with real critique/mission content + disclosure note, delete
   `starter.test.ts`, add `redesign.test.ts` skeleton (tests 1, 4, 5).
3. **Auth pages** — `demo-state.ts`, `login.astro`, `signup.astro`; add test 8.
   Visual check at 1920×1080 and 390×844.
4. **Dashboard** — `BalanceCard`, `StatusCard`, `BentoTile`, icons,
   `dashboard.astro`; add test 3. Visual check both viewports (bento reflow
   at mobile width is the main risk).
5. **Top-up flow** — `AmountChip.astro`, `top-up.astro` (chips + delayed
   confirm + success); add test 6. Manually verify balance persists back on
   the dashboard after a top-up (cross-page localStorage behaviour isn't
   practical to assert in JSDOM).
6. **Trip history** — `TripListItem.astro`, `trips.astro` (day-grouped,
   client-filtered).
7. **Auto top-up + concession** — `auto-top-up.astro` (test 7),
   `concession.astro` (already covered by test 5).
8. **Polish** — finalize test 2 (full nav cross-check now all pages exist),
   dark-mode pass across every page (grep for stray hex codes outside
   `tokens.css`), a11y pass (alt text, focus states, tap targets at
   390×844), final `pnpm check` + both-viewport visual review of every page.

Log each milestone tersely in `notes/log.md` as it lands (not reconstructed
at the end). Do not touch `PROCESS.md` or `reflections/crit-2.md` prose —
those are curated by the user, not drafted by the agent.

## Verification

- `pnpm check` (typecheck, build, oxlint, stylelint, vitest incl.
  `spec/*.test.ts`) green before every commit, per CLAUDE.md.
- `pnpm preview` + real Chrome at both 1920×1080 and 390×844 for every
  milestone that adds/changes a page — measure (e.g.
  `scrollWidth === clientWidth` for overflow, computed contrast for text) not
  just eyeball, per CLAUDE.md.
- Specifically verify: bento grid reflow on mobile, dark-mode toggle
  persistence across reloads and coverage on every page, top-up balance
  change actually reflected on the dashboard after navigating back, nav
  links resolve correctly (relative paths, no base-path breakage).
