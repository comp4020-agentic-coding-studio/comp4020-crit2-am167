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
