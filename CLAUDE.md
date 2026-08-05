# COMP4020 crit 2 — Unsolicited redesign

Static site, Astro. Builds to `dist/`, deploys to GitHub Pages. The deployed
site is what gets marked, at both 1920×1080 and 390×844.

## Working loop

- Keep `pnpm dev` running while making changes.
- Run `pnpm check` before every push (typecheck, build, lint, spec).
- Commit only when checks are green.
- Never suggest, ask about, or perform publishing/deploying the site (e.g.
  pushing to GitHub Pages, merging to the deploy branch) unless I explicitly
  say so.
- Don't create git worktrees for this repo unless I explicitly ask for one.
- Any major change (new page, content rewrite, layout or CSS change) needs
  visual verification at both marked viewports (1920×1080 and 390×844) in
  actual Chrome before it's considered done --- `pnpm check` proves structure,
  not that a human can read the page. Use `pnpm preview` (not `file://` ---
  the built site's asset URLs break over the opaque `file://` origin), and
  measure rather than eyeball where possible (e.g. `scrollWidth === clientWidth`,
  not just a screenshot).
- Internal navigation links use paths relative to the current page (e.g.
  `./`, `./about/`), never `import.meta.env.BASE_URL` or a root-absolute
  path --- the deployed site lives under `/comp4020-crit2-am167/`, and a
  relative link resolves correctly there without needing the base baked in.

## Dependencies

`pnpm-workspace.yaml` sets a `minimumReleaseAge` window: freshly published
package versions cannot be installed. This is a defence against active npm
supply-chain attacks --- hijacked maintainer accounts publishing malicious
releases that steal cloud credentials, npm and CI tokens, worm themselves into
other packages, and install persistence on whatever machine runs `install`. The
window *is* the protection: it keeps those releases out of this repo during the
hours before they're detected and pulled from the registry.

Never circumvent it, under any circumstances. Do not lower it, disable it, set
`trustLockfile`, add a blanket `minimumReleaseAgeExclude`, or sidestep it in a
scratch directory or "just for testing" --- and never suggest doing any of those.
No deadline, red check, or blocked install justifies it; a guard that gets
switched off when it's inconvenient is not a guard. If it blocks something, stop
and tell me.

## Process logging

After each meaningful chunk of work --- a feature, a fix, a design decision ---
append a short entry to `notes/log.md` describing what was done and why. Do
this as we go, not reconstructed at the end of the week. Keep entries terse;
they're raw material for the final write-up, not the write-up itself, so log
generously rather than sparingly.

`PROCESS.md` is the curated submission artefact, not the log: one paragraph on
what I built, then three or four moments, each doing all four jobs (what
happened, what I did instead of the obvious thing, how I knew it was right, and
a citation --- a commit or range, a `CLAUDE.md` change, or a check that went
red to green). Don't append running entries to it; I'll decide what gets
promoted out of `notes/log.md`.

## Reflections

Never write the content of the reflections file in `reflections/` --- that's my
own reflection on the work, in my own words, and it's not the agent's to draft
or fill in. Leave the file with just its standing-prompt headers; if it needs
to exist for `check:evidence` or similar, create/keep the headers only, never
the prose underneath them.
