# Process overview

## What I built

I have chosen to redesign Transport Canberra's MyWay+ account portal. I have recreated most of the account workflow, and included some personala additions like live tracking. I landed on a fintech dashboard design scheme, using real Transprot Canberra livery.

## The moments that mattered

### Changing design from a landing page and rebuilt it as a dashboard instead

After the first pass I had a whole marketing style landing page with a light/dark toggle and a section explaining why I'd redesigned the app. Looking at it properly, that wasn't actually what the spec wanted and it looked more like B2B SaaS rather than a public government app. I decided to completely overhaul the design into a logged in fintech dashboard, whcih made a lot more sense than a page trying to sell the redesign to itself. Rather than patch what was there, deleted the landing page outright and moved the dashboard to be the homepage, dropped the toggle, and switched the colour scheme to match Transport Canberra's actual bus/rail livery instead of an invented brand colour ([`480029f`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit2-am167/commit/480029fdc65e3677cd4f70528fb7669bb1ab3f62)).

### Told the agent to stop checking Chrome after every little change

I noticed it was opening a browser and eyeballing both viewports after basically every single edit, which added up to a lot of dead time for something that only mattered once the change was actually finished. Updated the CLAUDE.md instructions so that the visual checks happens once at the end of a task instead of after every step in it, `pnpm check` already covers whether things are structurally broken along the way ([`72ff774`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit2-am167/commit/72ff774b02cc907183b8e9bd9cfd2db3348fd079)). This significantly sped up the time taken to complete tasks as it wasn't stuck constantly retesting changes half way through a task.