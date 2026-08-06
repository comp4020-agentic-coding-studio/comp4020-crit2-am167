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
