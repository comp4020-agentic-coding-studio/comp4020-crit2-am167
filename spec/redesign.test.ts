import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

// This week's own spec: Crit 2, an unsolicited redesign of Transport
// Canberra's MyWay+ account portal (see PLAN.md for the full brief
// translation). These assert the mechanically-checkable lines only — genuinely
// visual/judgment calls (does the bento grid read well, is the passwordless
// framing convincing) are left to the crit, per spec/README.md.
const DIST = resolve("dist");

function htmlFiles(dir: string = DIST): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

const pages = htmlFiles().map((path) => ({
  name: relative(DIST, path),
  doc: new JSDOM(readFileSync(path, "utf8")).window.document,
}));

describe("redesign: navigation stays relative", () => {
  for (const { name, doc } of pages) {
    it(`${name}: every nav link is a relative path`, () => {
      for (const link of doc.querySelectorAll("nav a[href]")) {
        const href = link.getAttribute("href") ?? "";
        expect(
          href.startsWith("/"),
          `<a href="${href}"> in nav should be relative, not root-absolute — the deployed site lives under a base path`,
        ).toBe(false);
      }
    });
  }
});

describe("redesign: real fare content", () => {
  it("at least one page states the real adult peak and off-peak fares", () => {
    const hasFares = pages.some(({ doc }) => {
      const text = doc.body.textContent ?? "";
      return text.includes("3.41") && text.includes("2.70");
    });
    expect(hasFares).toBe(true);
  });
});
