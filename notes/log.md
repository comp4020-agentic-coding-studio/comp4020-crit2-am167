# Process log

## 2026-08-05 --- keyv/cacheable supply-chain check, then a release-age guard

Checked the repo against the Socket advisory on the compromised `keyv` and
`cacheable` namespaces. Nothing vulnerable: every affected package in the tree
sits exactly one release below the malicious version (`keyv` 5.6.0 vs 6.0.0,
`cacheable` 2.5.0 vs 2.5.1, `flat-cache` 6.1.23 vs 6.1.24, `file-entry-cache`
11.1.5 vs 11.1.6, `@cacheable/memory` 2.2.0 vs 2.2.1, `@cacheable/utils` 2.5.0
vs 2.5.1). All arrive transitively via stylelint. IoC scan also clean --- no
`preinstall` hooks in `node_modules`, no `setup.mjs`/`Math_Symbol.js`, no dropped
Bun runtime, no `.vscode/tasks.json` `folderOpen` task, no
`com.user.gh-token-monitor` LaunchAgent.

The near-miss was luck, not policy, so added `minimumReleaseAge` +
`minimumReleaseAgeStrict` to `pnpm-workspace.yaml` --- newly published versions
simply don't get resolved, transitive deps included, and resolution fails loudly
rather than falling back to something fresher.

Wanted 7 days. Found that pnpm 11 doesn't only gate *new* resolutions: it
re-verifies every existing lockfile entry against the policy on install. 25
entries in the committed lockfile (the `@astrojs/compiler-binding-*` set,
`@shikijs/*` 4.4.1, `@babel/parser` 7.29.8) were published 29--31 Jul, so a
7-day window failed `pnpm install --frozen-lockfile` with
`ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` --- which would also have turned CI red,
since both workflow jobs install frozen. Settled on 4 days, which passes today
and stays passing as those entries age. Can go to 7 after 2026-08-07. Deliberately
did *not* use `trustLockfile: true` to force the 7-day window: it skips the
verification pass wholesale, which is the one check that would catch a lockfile
committed from a machine with the policy disabled.

Also: I proved the guard rejects a too-new version, then ran a redundant "control"
with `minimumReleaseAge: 0` in a scratch dir. Advay pushed back --- correctly. The
successful frozen install *with* the guard on was already the control, so lowering
the setting proved nothing it didn't already know. Wrote the rule into `CLAUDE.md`
so no future session reaches for the same shortcut when the guard is inconvenient:
never try to get around the release-age window, for any reason.

## 2026-08-06 --- picked a redesign target and planned the build

Chose Transport Canberra's MyWay+ account portal as the crit 2 target.
Researched the real system (official docs, live portal, App/Play Store
reviews, press/inquiry coverage) before deciding anything, since the brief
needs real, citable flaws rather than a subjective restyle. Found plenty:
white-labelled to NEC not Transport Canberra, orphaned login CTAs with no
grouping, a 3-path signup modal before an actual form, password-before-email
field order, ~85% 1-star Play Store reviews specifically about "account
management" being an embedded webview rather than native UI, and a
Legislative Assembly inquiry finding the Nov 2024 launch "clearly not ready."
Also researched comparable transit apps (Opal, myki, Clipper, TfL, OMNY) and
fintech UI conventions (Monzo/Revolut/Apple Card) for the visual/IA direction
--- balance-as-hero-card, day-grouped trip history, non-instant top-up
confirmation, explicit toggle-based auto top-up settings.

Landed on a 9-page scope (login, signup, dashboard, top-up, trips,
auto-top-up, concession, landing, 404), cutting Park & Ride and card-linking
as separate sub-systems with no documented UX flaw to fix. Decided against a
hard login gate (dashboard etc. stay directly viewable, narrative-only auth)
to avoid redirect-flash risk that's hard to verify cleanly at both marked
viewports. Wrote the full plan to `PLAN.md` before touching any code.

Had to get an explicit one-off exception to create a worktree for this
session specifically because the background-job harness requires isolating
edits into one, which collides with the standing "don't create worktrees for
this repo unless asked" rule --- the harness's own escape hatch (a
`.claude/settings.json` override) was itself blocked by the same guard it was
meant to disable, so there was no way to resolve the conflict without asking.

### Milestone 1: foundation

Added `src/styles/tokens.css` (teal accent instead of government blue, a
fixed light/dark pair, spacing/type scale) and rewrote `global.css` to
consume it. Rewrote `BaseLayout.astro`: real primary nav across every page
(including auth pages, unlike the real login/signup screens which have none),
a footer with real Transport Canberra contact info (13 17 10), and a
light/dark toggle that respects `prefers-color-scheme` by default and
persists a manual override in `localStorage`. Added `404.astro`.

Hit one real bug during the required visual check: the theme toggle showed
both the sun and moon icons at once. Cause was Astro's per-component CSS
scoping --- `SunIcon.astro`/`MoonIcon.astro` are separate components, so
`BaseLayout`'s scoped `<style>` selectors targeting their SVG output never
matched. Fixed with `:global()` around those specific selectors. Confirms why
the CLAUDE.md rule to actually check the browser (not just `pnpm check`)
matters: this was invisible to typecheck/build/lint and would have shipped.
Verified in real Chrome at both 1920x1080 and 390x844 (measured
`scrollWidth === clientWidth`, not just eyeballed) before treating the
milestone as done.

### Milestone 2: landing + content layer

Added `src/lib/fixtures.ts`: the real Jan 2026 fare table, the six real
concession categories (all expiring 30 Jun 2026 except ACT Seniors), and a
set of invented sample trips using real route numbers and light rail stops
--- commented clearly as fabricated demo data, not real trip records, so the
real-vs-fictional line stays visible in the source, not just in my head.

Rewrote `index.astro`: real critique (the Nov 2024 launch failures, the
inquiry finding, the webview complaint from reviews) instead of the starter
placeholder, the real fare figures, and a disclosure section stating plainly
that this is a non-functional prototype with invented account data. Deleted
`spec/starter.test.ts` (its target, `data-testid="intro"`, is gone) and added
`spec/redesign.test.ts` with the two checks this milestone's content
actually supports: every nav link stays relative, and at least one page
states the real fares. Held off adding the concession-catalogue test from
the plan's milestone-2 list since `concession.astro` doesn't exist until
milestone 7 --- a test that can't be satisfied by any current content would
just be a red `pnpm check` for no reason; tests track features as they land.

### Milestone 3: auth pages

Added `src/lib/demo-state.ts` (typed `localStorage` wrapper for the fake
balance/auto-top-up/concession state), `login.astro` (passkey-first primary
action, password fallback, grouped into one labelled card) and `signup.astro`
(single linear form, email before password, no account-type modal). Added a
structural spec test asserting login's primary actions live inside a
labelled container rather than bare in `<main>`.

Found the same real bug twice while verifying the click-through in Chrome,
not just eyeballing screenshots. First: `BaseLayout`'s nav used `./dashboard/`
etc. everywhere, which is only correct from the site root --- every other
page (login, signup, and everything still to come) builds to
`pagename/index.html`, one directory deeper, so from there `./dashboard/`
resolves to `/login/dashboard/` instead of `/dashboard/`. Fixed by giving
`BaseLayout` an explicit `depth` prop (0 for `index`/`404`, which Astro
special-cases to the site root; 1, the default, for everything else) and
building nav hrefs from `../` at depth 1. Second: the exact same mistake was
sitting in login/signup's own inline cross-links *and* in their post-submit
`window.location.href` redirects --- caught the redirect instance only by
actually clicking "Create account" and watching it land on
`/signup/dashboard/` instead of `/dashboard/`. A static href check alone
would have missed that second one, since it's set by a script, not markup.
Grepped the whole `src/pages/` tree afterwards to confirm no other instance
was hiding. Every page from here on that links to a sibling needs `../`, not
`./` --- only `index.astro` and `404.astro` get `./`.

### Milestone 4: dashboard

Added `BentoTile`, `BalanceCard` and `StatusCard` components and composed
them into `dashboard.astro`: a hero balance tile with a tabular-nums figure
and an attached top-up CTA, two status tiles (auto top-up, concession) with
a colour-coded left border, and a recent-trips preview. This is the direct
answer to the most-cited real complaint (the ~85% 1-star reviews about
account management being a webview, not a native screen) --- everything here
is real markup, not an iframe.

Balance/auto-top-up/concession all need a value at build time, when there's
no `localStorage` to read from, so each renders `demo-state.ts`'s exported
default constants as a static fallback, then a client script overwrites the
same DOM nodes once it can read the real value --- the same shape as the
`spec/redesign.test.ts` balance check already assumes (it only ever sees the
static fallback, which is why that value has to be real markup and not
purely JS-injected). `StatusCard` stays a dumb presentational component and
doesn't know about `demoState` itself; the page passes it a `dataRole` and
does the live update itself, since the two dashboard instances (auto top-up,
concession) need different update logic.

### Milestone 5: top-up flow

Added `AmountChip.astro` and `top-up.astro`: preset amount chips instead of
a bare numeric field, and a deliberately non-instant confirmation (an
~800ms-1s "Processing…" state before showing the new balance) --- the real
system's validator/overcharging failures mean an instantly-updated balance
would read as unverified, not fast. Verified the full loop by hand in Chrome:
select $20, submit, watch the processing state, land on a success screen
with the correct new balance, follow "Back to dashboard," and see that same
balance reflected there --- the one cross-page state dependency this plan
flagged as impractical to assert in JSDOM.

Advay flagged the build was scoping past what a one-week crit needs. Cutting
back for the remaining milestones: trip history becomes a plain grouped
list, no date-range/pagination controls; auto top-up and concession stay
single-purpose forms; the "Polish" milestone becomes one final check-and-
verify pass instead of an exhaustive per-page audit.

Also fixed a genuine Astro compiler quirk while checking the success screen
in the browser: `Top-up complete. Your new balance is\n<strong>...` (text
ending a line, then a nested tag on the next) compiles with the whitespace
between them dropped entirely --- not collapsed to one space, gone --- so it
rendered as "is$62.30" with no space at all. `{" "}` before the tag is the
explicit fix; worth checking for anywhere else text flows into a tag across
a line break.

### Milestone 6: trip history

Kept this deliberately plain per the scope note above: `TripListItem.astro`
(text mode label, route, stops, a fare-type badge, tabular-nums fare) and
`trips.astro` grouping the fixture trips by date with a `Map`, no
date-range/page-size controls. No icons either --- a text label ("Bus" /
"Light rail") does the same job as the plan's inline-SVG icon set without
adding three more components for a page this small. Checked both viewports;
the row layout wraps cleanly at 390px without needing separate mobile
markup.

### Milestone 7: auto top-up + concession

`auto-top-up.astro`: an actual checkbox with `role="switch"` (not a "0 =
disabled" numeric hack), threshold/target fields, and a plain-language
preview sentence that updates live as you type, matching the real system's
threshold/discount framing. `concession.astro`: reuses `BentoTile` +
`StatusCard` (rather than inventing a third card style) for the status
block, a one-field form to change type, and the full six-category catalogue
with the real 30 Jun 2026 expiry policy. Both are single-purpose forms, no
extra chrome, per the scope note.

Verified the cross-page state loop by hand: turned auto top-up on with a
$10/$25 threshold/target on its settings page, saved, and confirmed the
dashboard's status tile picked up "On --- tops up to $25.00 below $10.00"
with the border switching from muted to green --- the same
`localStorage`-round-trip pattern proven in milestone 5's top-up flow, now
holding for a second, differently-shaped piece of state. This closes out
the full 9-page sitemap from `PLAN.md`; only the final polish pass is left.

### Milestone 8: polish (scaled down per scope feedback)

One consolidated pass instead of the exhaustive per-page audit `PLAN.md`
originally described, since Advay flagged the build was scoping past a
one-week crit: added the nav-resolution test (every `nav` link now checked
against the actual built `dist/` tree, not just "is it relative") now that
all nine pages exist --- this is exactly the class of bug that broke every
non-root page's nav twice earlier in the build, so it's the one polish check
worth making permanent. Grepped for hardcoded hex colors outside
`tokens.css` --- none found, so dark-mode coverage is structurally
guaranteed rather than hoped for. Spot-checked dark mode on the dashboard and
the auto-top-up form in Chrome rather than walking every page; both correct
(confirmed via computed-style values, not just eyeballing --- a `#121918`
card on a `#0b1211` page read as more different than it is in the
screenshot). `pnpm check`: 87 tests green across all 9 pages.

### Milestone 9: art direction pass (dark fintech, drop dark mode, cut the meta narrative)

After reviewing the v1 build, Advay gave four pieces of direct feedback:
drop the light/dark toggle, "none of the header buttons work (they go to
404)", cut the whole "why we redesigned this" narrative from the landing
page, and do a total visual overhaul --- dark fintech style, purple/white
for the MyWay+ brand, blue for buses, red for trams.

Investigated the 404 report first rather than assuming a code bug: built,
ran `pnpm preview`, and clicked every nav link via Chrome DevTools MCP at
`http://localhost:PORT/comp4020-crit2-am167/...` --- every link resolved
correctly, on every page, in both `pnpm preview` and `pnpm dev`. The only way
to reproduce a 404 was hitting the bare URL Astro prints for `pnpm dev`
(`http://localhost:PORT/`, which omits the configured `base`) or opening
`dist/index.html` via `file://` --- the exact failure mode `CLAUDE.md`
already calls out, since directory-style URLs don't auto-resolve
`index.html` over `file://`. No code fix applied; re-verified the full nav
end-to-end after the redesign anyway (click-through + resolved `url=` on
every link at both viewports) rather than taking the earlier investigation
on faith.

Dropped dark mode entirely: deleted the toggle button, the FOUC-prevention
script, the toggle JS, `SunIcon`/`MoonIcon`, and the `@media
(prefers-color-scheme)` / `[data-theme]` blocks in `tokens.css`. The one
remaining palette is the new dark-fintech look --- since nearly every surface
already rendered through CSS custom properties (confirmed during v1's polish
pass), the whole retheme is a `tokens.css` rewrite plus a handful of
structural touches, not a page-by-page rebuild: a purple+white logomark
badge replacing the old text-only wordmark, a sticky/blurred header, a
brand-tinted hero variant on `BentoTile` (dashboard's balance card), and a
per-`trip.mode` colour cue (blue for bus, red for light rail) on both
`TripListItem` and the dashboard's recent-trips preview.

Rewrote `index.astro` from a four-section critique essay down to a real
product landing page --- hero, real mission framing, one real-fare
highlight (kept the literal `3.41`/`2.70` figures so `redesign.test.ts`'s
fare-content test still passes), single CTA. The disclosure now lives only
as one line in the footer, not as page content.

Caught my own regression before it shipped: the first pass of the
`BentoTile` hero tint used the `hero` size prop as the trigger, but
`concession.astro` reused `size="hero"` on all three of its cards purely for
stacking, not emphasis --- so the whole concession page came out washed in
purple. Fixed by only keeping `hero` on the one card that's meant to lead
(status), default-sizing the other two.

Also caught a real (if minor) accessibility regression from the new
palette: white text on the base `--color-brand` fill measured 4.23:1 ---
under WCAG AA's 4.5:1 for normal text. Added a `--color-brand-stronger`
token and moved every solid-fill button/pill/chip (not just links/accents,
which stayed on the lighter `--color-brand`) onto `--color-brand-strong`
(5.70:1) as the resting state, with `--color-brand-stronger` (7.10:1) for
hover --- caught by actually computing contrast ratios via
`evaluate_script`, not by eye. `pnpm check`: 87 tests still green; grepped
for stray hex codes outside `tokens.css` --- none found.

### Milestone 10: fix the actual dev-server 404 (astro.config.mjs)

Advay came back with a screenshot: clicking "Trip history" landed on
`http://localhost:4324/trips/` and hit Astro's own 404 page. My earlier
investigation (milestone 9) had wrongly concluded this was a `file://` or
wrong-URL issue on the user's end --- it wasn't. Reproduced directly:
`astro dev`'s own printed URL (`http://localhost:PORT/`, no `base` suffix)
404s, because Astro's dev server rejects any request outside `base` *before*
it reaches user code (confirmed by adding a debug `console.log` to a Vite
`configureServer` middleware --- it never fired, even with `enforce: "pre"`,
so this is enforced above the user middleware layer, not something a
redirect plugin can intercept). Anyone who clicks the literal URL the tool
prints, including a stale tab that's been open a while, lands off the base
path and every relative nav link from there stays off it too.

Real fix, once the mechanism was clear: `base` only needs to hold for the
*build* output and for `preview` (which deliberately mirrors the deployed
base path — correct, since that's the point of previewing). `dev` is local
iteration and has no reason to require an extra path segment. Made `base`
conditional on `process.argv.includes("dev")` in `astro.config.mjs`, so
`astro dev` now serves at plain `/` (matching its own printed URL exactly)
while `build`/`preview` are untouched. Verified: fresh `pnpm dev` renders the
home page at its own printed root and "Trip history" now correctly lands on
`/trips/`; `pnpm build` still emits `/comp4020-crit2-am167/...`-prefixed
asset URLs; `pnpm preview` still serves under the full base path exactly as
before. `pnpm check`: 87 tests green.

Also found and cleared four zombie `astro dev`/`astro preview` processes
left over from this whole session — my repeated `pkill -f "astro dev"`/`"astro
preview"` had silently failed every time, since the real command line is
`astro.mjs dev`/`astro.mjs preview` (no contiguous "astro dev" substring), so
the pattern never matched. One of those zombies (the very first `pnpm dev`
from hours earlier) is almost certainly the exact server the 404 screenshot
was taken against. Used `astro dev stop` for the persistent dev daemon and
killed the rest by PID.

### Milestone 11: full redesign — dark fintech dashboard, real Transport Canberra livery

Advay rejected the whole art direction from milestone 9 outright: wanted a
logged-in fintech dashboard (Revolut/Robinhood register), not a marketing
landing page, and wanted the mode colours to be Transport Canberra's *actual*
livery rather than an invented brand colour. Researched this before touching
code rather than guessing: web search confirmed Transport Canberra buses run
blue livery and light rail runs red livery (2016 rebrand, sources cited in
chat), and that Light Rail Stage 1 has 14 real stops Gungahlin Place →
Alinga Street, City (including the 2021-added Sandford Street stop) — used
that exact list, in order, for the new `LineDiagram` signature element
(`src/lib/fixtures.ts` `LIGHT_RAIL_LINE`, `src/components/LineDiagram.astro`).

Biggest judgement call: the brief says "use blue/red as functional colour
coding throughout... every use of red or blue should tell the user which mode
they're looking at." Taken literally, that rules out using either hue for
*anything* generic — so primary buttons, links, focus rings, the wordmark,
and chip-selected states could no longer be purple (obviously) but also
couldn't just become blue instead, since blue is now reserved. Made every
non-mode, non-status interactive surface strictly neutral (near-white
`--color-action` on near-black) instead of picking a new "safe" brand hue.
Chose green as the one status accent (kept a secondary amber for
"delayed/expiring" only) so it never collides with mode meaning; deliberately
did *not* bring the old `--color-danger` red-adjacent token forward, since a
literal red for "expired" would have contradicted "red always means light
rail" the moment both appeared in the same view.

Rebuilt the token system (`src/styles/tokens.css`) from scratch rather than
patching hex values in place, deleted the purple `--color-brand*` family
entirely, renamed `--color-mode-bus`/`--color-mode-tram` to `--color-bus`/
`--color-rail`, and added the `--color-status`/`--color-caution` pair.
Added `--font-display` (Space Grotesk, loaded via Google Fonts link in
`BaseLayout`) for headings and tabular numbers, kept the system-font stack
for body copy — applied display face globally via `h1,h2,h3` in
`global.css` rather than sprinkling `font-family` overrides per component.

Deleted the landing page as asked: extracted the whole dashboard into one
shared `src/components/DashboardView.astro` and made both `index.astro` and
`dashboard.astro` render it (kept `/dashboard/` alive, not just `/`, since
`spec/redesign.test.ts` and the nav both depend on that exact route
existing — collapsing to a single URL would've meant either breaking the
spec test or ripping out the nav's own "Dashboard" link). New dashboard
layout: balance+top-up card top-left, compact auto-top-up/concession status
chips top-right, live departures (colour-coded `RouteChip` bus/rail pills +
green "on time"/amber "delayed" status), recent trips, and a persistent
right-hand rail — the `LineDiagram` — that runs the full column height via
CSS grid named areas, which is what actually solves "no empty right-hand
space" structurally rather than by eyeballing it.

Widened `<main>` for the two dashboard routes only (new `wide` prop on
`BaseLayout`, `.main-wide` class, 96rem vs the original 72rem) rather than
widening every page — a 1920px-wide bus/light-rail data dashboard needs the
space; a login form or settings card doesn't.

The old landing page was the only place stating the real fares (3.41 peak /
2.70 off-peak), which `spec/redesign.test.ts`'s "real fare content" test
depends on — moved that line to `top-up.astro` as a footnote under the
amount picker instead of dropping it, since that's the page where a real
fare figure is actually contextually useful, not a design orphan surviving
only to satisfy a test.

`pnpm check`: typecheck, build, oxlint, stylelint and all 87 spec tests
green after two stylelint auto-fixes (hex length, blank-line-before-custom-
property) and one manual rename (`.main--wide` → `.main-wide` — stylelint's
kebab-case rule rejects BEM-style double hyphens in real `.css` files, which
is why the identical `bento-tile--hero` pattern elsewhere never tripped it —
that one lives in an `.astro` `<style>` block, which the `**/*.css` glob
never touches). Kicked off a 5-dimension adversarial review workflow (stray
purple, mode/status colour-semantic correctness, contrast arithmetic,
structural/spec-link checks, real-data accuracy against the researched stop
list) before calling this done.

The review workflow earned its keep — two dimensions came back clean
(no leftover purple, no mode/status colour misuse) but two came back with
real, specific findings I wouldn't have caught by eye:

Contrast: `--color-text-dim` (#5f6773) as real label text for "passed" stops
in the line diagram measured 3.14:1 against its panel — under the 4.5:1 AA
floor for normal text (the agent showed its luminance arithmetic rather than
just asserting it, which is what made it worth trusting over an eyeball
check). Same token had the identical problem in `top-up.astro`'s fare
footnote. Fixed both by moving to `--color-text-muted` (~6:1), which was
already used elsewhere and already known-good, rather than hand-tuning a new
hex. Bigger finding: `RouteChip`'s original design (tinted 14%-opacity mode
colour as background, full-strength mode colour as text) measured 3.95:1
(bus) and 4.16:1 (rail) — both short of 4.5:1 for the chip's bold 12px
label. Tried shrinking the tint to raise contrast first; the arithmetic
showed that only converges on 4.5:1 as the tint approaches zero, i.e. the
chip stops looking like a coloured badge at all. Replaced the whole approach
with a solid mode-colour fill and near-black text instead of tint+coloured-
text — measures ~4.9–5.1:1 with real margin, and arguably reads as a
stronger "badge" than the subtle version did. Also found the line diagram's
"not yet reached" stop ring was using `opacity: 0.5` on the whole dot
(border + fill) to fake a dimmer state, which reviewer math showed drops to
~2:1 against the panel — under the 3:1 floor for meaningful non-text
graphics. Fixed by dropping the opacity trick entirely: passed = solid
fill, next = green pulse, not-yet-reached = a full-opacity hollow ring —
three genuinely distinct states instead of one faked with transparency.

Real-data accuracy: the reviewer caught that `SAMPLE_TRIPS` (written before
this session, for last week's landing page) has a light-rail trip ending at
"Mitchell" — not an actual Light Rail Stage 1 stop; Mitchell is bus-served,
not rail-served, in reality. Fixed by rerouting that trip to "Phillip
Avenue" (the real adjacent stop after EPIC and Racecourse). It also flagged
that the same fixture file's shorthand stop names ("Alinga Street",
"Manning Clark", "Dickson") didn't match the canonical full names now
established by `LIGHT_RAIL_LINE` ("Alinga Street, City", "Manning Clark
North", "Dickson Interchange") — cosmetic on its own, but the inconsistency
would've been visible on the same dashboard as the correctly-named line
diagram. Normalised every trip fixture to the canonical names.

Caught one more bug myself during the final Chrome pass that the review
workflow's dimensions didn't cover (none of them ran the page at a mobile
viewport): `document.documentElement.scrollWidth` (1593) didn't match
`clientWidth` (390) on the dashboard at 390×844 — real horizontal page
overflow, invisible in a plain screenshot because the content still rendered
"fine" within the captured frame. Root cause was the classic CSS grid/flex
gotcha — grid and flex items default to `min-width: auto`, so the line
diagram's horizontal-scroll stop strip (14 stops wide) was forcing its
*ancestors* wider instead of scrolling within its own `overflow-x: auto`
box. Fixed with `min-width: 0` on the dashboard's grid items and on the
scroll strip itself. Verified properly this time: measured
`scrollWidth === clientWidth === 390` on the outer document, then confirmed
the diagram's own scroll region still has `scrollWidth (1516) > clientWidth
(292)` and that `scrollLeft` actually moves — contained overflow where it
should be, none where it shouldn't. This is exactly the "measure, don't
eyeball" instruction in `CLAUDE.md` earning its keep: the screenshot alone
would have shipped this bug.

## 2026-08-06 --- tightening pass on the fintech redesign

Went through a round of feedback on the dark fintech dashboard (leftover
marketing chrome, an overgrown stop list, redundant info, uneven card
heights, flat departure rows, a generic top-up button) and fixed each:

- **Nav contradiction**: swapped the top nav's "Log in" / "Sign up" links for
  an account chip (avatar initial + name) on every page except login/signup
  themselves, via a new `loggedIn` prop on `BaseLayout`. Those two auth pages
  keep the old links since they're the one context where they're not a lie.
- **Stop list**: `LineDiagram` used to render the full 14-stop Light Rail
  Stage 1 alignment top-to-bottom; condensed it to a 2-before/2-after window
  around `nextStopIndex` (5 stops), with "⋯ N earlier/more stops" markers so
  it's honest about being a slice, not the whole line.
- **Redundant info**: the condensed stop's badge used to read "Live · next
  stop" with its own pulsing dot — the same "live" framing as the Live
  departures card one panel over, competing for the same job. Reworded to
  "You are here" (position, not timing) and dropped the duplicate live dot;
  Live departures keeps ETAs, the line diagram keeps position.
- **Card grid**: Balance, Auto top-up, Concession and the line panel used to
  be an uneven 2-column primary block plus a full-viewport-height sticky
  sidebar. Restructured into one `dashboard__top-row` grid so all four
  stretch to equal height — verified via `getBoundingClientRect()` on all
  four `.bento-tile`s rather than eyeballing (318.77px each at 1920×1080).
- **Departure rows**: added a ~5% `color-mix` background tint per mode
  (bus/rail) alongside the existing left-edge accent bar, so the list scans
  by colour without reading each route label.
- **Top-up button**: switched from the neutral `.btn.primary` to a new
  `.btn.positive` (using `--color-status`, the same green as the "+$20.00
  top-up" delta text) on both the dashboard's Top up link and the top-up
  page's submit button — ties the action to its result, consistent with
  `tokens.css`'s own stated rule that the status colour family covers "a
  balance change."

Verified both viewports in real Chrome via `pnpm preview` (not `file://`):
1920×1080 and 390×844, plus the collapsed mobile nav panel and the login
page (confirming the `loggedIn={false}` path still shows the original auth
links). `pnpm check` green throughout (87 tests). Chrome DevTools MCP's
shared browser profile was briefly locked by another concurrent session
mid-task; waited for it to release rather than fighting it.

## 2026-08-06 --- layout consistency + a live map

Two more pieces of feedback: Top up and Auto top-up looked out of place next
to Concession (a narrow centered card in a sea of black, vs. Concession's
full-width stack of cards), and a request for a "live map" of buses/trams
moving around Canberra using fake data. Entered plan mode for this one —
multiple real design decisions (map library vs. hand-rolled, where it lives,
animation technique) worth getting right before writing code, and used a
Plan subagent + one AskUserQuestion (new nav page vs. a dashboard section —
went with the dedicated page, to avoid re-crowding the dashboard we just
decluttered last round).

- **Layout fix**: deleted the `max-width`-and-centered wrapper from both
  `top-up.astro` and `auto-top-up.astro`; both now use the same `h1` +
  `.page-stack` pattern `concession.astro` already had (a heading, then a
  stack of full-width `BentoTile`s). Promoted `.page-stack` into
  `global.css` since it's now shared by three pages instead of copy-pasted.
  Each page's second card surfaces real, previously-unused `FARE_TABLE`
  fields (daily/monthly caps, transfer window on Top up; the 5%
  auto-top-up discount on Auto top-up) rather than padding with filler —
  genuine content, not decoration for its own sake.
- **Live map**: new `/live-map/` page. Deliberately *not* a real map (no
  Leaflet/tile dependency — this project has zero runtime dependencies and
  a strict supply-chain policy I wasn't going to work around for a decorative
  feature) — an inline SVG hub-and-spoke schematic, same "abstract diagram,
  not literal geography" language `LineDiagram` already established.
  Vehicles are the *same* `DEPARTURES` fixture already used on the
  dashboard (not a parallel invented fixture), animated along `<path>`s via
  SVG `<animateMotion>`/`<mpath>` — no JS animation loop, works in the
  static build, GPU/SMIL-driven. Verified motion by reading
  `getBoundingClientRect()` on the vehicle markers twice a few seconds apart
  (positions changed) rather than trusting a single screenshot, and verified
  the `prefers-reduced-motion` path by calling `pauseAnimations()` directly
  and confirming positions then stayed identical across reads.
- `pnpm check` green (95 tests — the two new invariants-covered pages
  account for the jump from 87). Visual pass at 1920×1080 and 390×844 in
  real Chrome via `pnpm preview`: no horizontal overflow at 390px, the three
  "manage something" pages now read as one pattern, the live map's nav link
  and mobile menu both resolve correctly.

## 2026-08-06 --- transport utility visual pass

Created `ui/transport-dashboard-redesign` from a clean `main` to apply the
dashboard critique. Shifted the palette from dark fintech to a calm,
wayfinding-first light system; made navigation single-row on desktop with
active-page states; added a prominent next-departure hero; moved balance and
account settings into secondary positions; reduced shadow and radius
repetition; and added an honest demo-feed timestamp to live departures.
Kept bus blue, rail red, and status green semantic so the redesign remains
legible rather than decorative.

`pnpm check` initially stopped at two stylelint colour-hex-length errors, then
passed after normalising the new white tokens: typecheck, static build, oxlint,
stylelint, and all 190 tests are green. The first sandboxed test run also
confirmed the only failure was its temporary-directory restriction around
`git init`, not the implementation.

Added a reduced-motion-aware pulse to the green `Live` indicator in the
next-departure hero, using the existing status colour and keeping the separate
`On time` marker static so the two states do not compete.

Replaced the placeholder `M` wordmark with the official MyWay+ app mark from
Transport Canberra and City Services' Google Play listing, stored locally as
`public/assets/myway-plus-app-icon.webp`. Added a direct footer link to the
official MyWay+ account portal.

## 2026-08-07 --- polish the simulated live map

The live map still read as a thin hub-and-spoke sketch: straight spokes,
identical vehicle dots, and a side list that only said "En route to …". Kept
it dependency-free and schematic (no Leaflet / tiles — same supply-chain and
"abstract diagram" stance as before), but made the *fake* feed feel like a
transit-control view.

- Extended `fixtures.ts` network model: intermediate stops, short labels,
  curved `pathD`s, route badges, staggered vehicle `progress` / next-stop
  metadata keyed to the shared `DEPARTURES` fixture, plus `LIVE_FEED` chrome.
- Rebuilt `LiveMap.astro`: district washes, compass, route glow + badges,
  hub/stop hierarchy, delayed vehicle halos, SMIL begin-offsets so markers
  start mid-route, legend, and a departures-style status panel (ETA + on-time
  / delayed). Mobile hides intermediate stop labels and the compass; SVG stays
  `role="img"` with the list as the accessible detail.
- Verified in Chrome at 1920×1080 and 390×844: no horizontal overflow,
  vehicles move (`getBoundingClientRect` changed across 2s), `pauseAnimations()`
  freezes them (reduced-motion path). `pnpm check` green (190 tests).
