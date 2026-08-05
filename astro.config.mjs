import { defineConfig } from "astro/config";

// The deployed site lives under a path (comp4020-agentic-coding-studio.github.io/<repo>/),
// so every internal link and asset must be resolved against `base`, not assumed
// to be at the domain root — Astro's `import.meta.env.BASE_URL` and the `<Image>` /
// asset pipeline already do this for you.
export default defineConfig({
  outDir: "dist",
  base: "/comp4020-crit2-am167",
});
