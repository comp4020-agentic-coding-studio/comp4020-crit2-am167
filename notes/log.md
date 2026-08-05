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
