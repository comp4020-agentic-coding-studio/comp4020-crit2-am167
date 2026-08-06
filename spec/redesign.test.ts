import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
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

describe("redesign: nav links resolve to real pages", () => {
  for (const { name, doc } of pages) {
    it(`${name}: every nav link resolves to a file that exists in dist/`, () => {
      const pageDir = dirname(join(DIST, name));
      for (const link of doc.querySelectorAll("nav a[href]")) {
        const href = link.getAttribute("href") ?? "";
        if (!href || href.startsWith("#")) continue;
        const resolved = resolve(pageDir, href);
        const candidate = resolved.endsWith(".html")
          ? resolved
          : join(resolved, "index.html");
        expect(
          existsSync(candidate),
          `${name}: nav link "${href}" resolves to ${relative(DIST, candidate)}, which doesn't exist in dist/ — this exact class of bug (depth-relative "./" vs "../") broke every non-root page's nav earlier in this build`,
        ).toBe(true);
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

describe("redesign: login groups its primary actions", () => {
  it("login's primary actions are grouped in a labelled container, not bare in <main>", () => {
    const login = pages.find(({ name }) => name === "login/index.html");
    expect(login, "expected a built login page at login/index.html").toBeTruthy();
    if (!login) return;

    const main = login.doc.querySelector("main");
    expect(main).toBeTruthy();
    if (!main) return;

    const bareButtons = Array.from(main.children).filter(
      (child) =>
        child.tagName === "BUTTON" ||
        (child.tagName === "A" && child.classList.contains("btn")),
    );
    expect(
      bareButtons.length,
      "primary actions should be grouped inside a card/section, not bare children of <main> — the real system's login screen has orphaned floating CTAs with no grouping",
    ).toBe(0);

    const hasGroupedCard = Array.from(main.querySelectorAll("section, form, div")).some(
      (el) => el.querySelector("h1, h2, h3") && el.querySelector("button"),
    );
    expect(
      hasGroupedCard,
      "expected a labelled container (a heading plus a button) wrapping login's primary actions",
    ).toBe(true);
  });
});

describe("redesign: dashboard shows a balance", () => {
  it("dashboard/index.html renders a dollar-figure balance in its static fallback", () => {
    const dashboard = pages.find(({ name }) => name === "dashboard/index.html");
    expect(dashboard, "expected a built dashboard page at dashboard/index.html").toBeTruthy();
    if (!dashboard) return;

    const text = dashboard.doc.body.textContent ?? "";
    expect(
      /\$\d+\.\d{2}/.test(text),
      "expected the dashboard's static (no-JS) render to include a dollar-figure balance",
    ).toBe(true);
  });
});

describe("redesign: top-up offers preset amounts, not a bare field", () => {
  it("top-up/index.html renders multiple preset amount chips", () => {
    const topUp = pages.find(({ name }) => name === "top-up/index.html");
    expect(topUp, "expected a built top-up page at top-up/index.html").toBeTruthy();
    if (!topUp) return;

    const chips = topUp.doc.querySelectorAll("[data-amount]");
    expect(
      chips.length,
      "expected multiple preset amount chips, not just a bare numeric field",
    ).toBeGreaterThanOrEqual(3);
  });
});

describe("redesign: concession catalogue names real categories", () => {
  it("concession/index.html names several real concession categories", () => {
    const concession = pages.find(({ name }) => name === "concession/index.html");
    expect(concession, "expected a built concession page at concession/index.html").toBeTruthy();
    if (!concession) return;

    const text = concession.doc.body.textContent ?? "";
    const expectedNames = ["Students", "Seniors", "Veterans"];
    for (const name of expectedNames) {
      expect(text.includes(name), `expected the concession page to name "${name}"`).toBe(true);
    }
  });
});

describe("redesign: auto top-up is a real toggle, not a hidden zero", () => {
  it("auto-top-up/index.html has an actual checkbox/switch control", () => {
    const autoTopUp = pages.find(({ name }) => name === "auto-top-up/index.html");
    expect(autoTopUp, "expected a built auto-top-up page at auto-top-up/index.html").toBeTruthy();
    if (!autoTopUp) return;

    const toggle = autoTopUp.doc.querySelector(
      'input[type="checkbox"], [role="switch"]',
    );
    expect(
      toggle,
      "expected an explicit checkbox/switch control, not a '0 = disabled' numeric-only hack",
    ).toBeTruthy();
  });
});
