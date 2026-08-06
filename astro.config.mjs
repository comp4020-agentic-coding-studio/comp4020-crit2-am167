import { defineConfig } from "astro/config";

// The deployed site lives under a path (comp4020-agentic-coding-studio.github.io/<repo>/),
// so every internal link and asset must be resolved against `base`, not assumed
// to be at the domain root — Astro's `import.meta.env.BASE_URL` and the `<Image>` /
// asset pipeline already do this for you.
//
// `base` is only applied for `build`/`preview`, not `dev`: Astro's dev server
// 404s on any request outside `base` (by design — it accurately previews
// base-relative behaviour), but its own printed URL omits `base`, so the
// literal address `astro dev` prints doesn't work. `preview` serving under
// `base` is correct and intentional (it's simulating the real deployed
// path, per this repo's own preview-based verification workflow); `dev` is
// just local iteration and should work at the URL it prints.
const isDevCommand = process.argv.includes("dev");

export default defineConfig({
  outDir: "dist",
  base: isDevCommand ? undefined : "/comp4020-crit2-am167",
});
