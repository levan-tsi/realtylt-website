import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NIGHT_ROUTES, areaName, isNightRoute } from "./site";
import { chipStateStyles } from "@/components/idx/map-shared";

/** ROUND 53: THE BLUE-HOUR LOOK IS SCOPED, AND THE SCOPE HAS TWO HALVES THAT MUST AGREE.
 * The page's own wrapper carries `.nocturne` (so the tokens re-point for everything inside it),
 * and the Header and Footer read NIGHT_ROUTES to dress the chrome around the page. A route in
 * the list without the wrapper would put night chrome around a white page; a wrapper without
 * the entry would put a white header on a night page. */
const root = join(__dirname, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const pageFile = (route: string) => (route === "/" ? "app/page.tsx" : `app${route}/page.tsx`);

describe("the night routes", () => {
  it.each(NIGHT_ROUTES.map((r) => [r]))("%s wears the night on its page wrapper", (route) => {
    // Round 54: the home page's wrapper also carries the stacking utilities its fixed scene
    // needs (`isolate relative`), so the class is first in the list rather than alone.
    expect(read(pageFile(route))).toMatch(/className="nocturne(?=[ "])/);
  });

  it("dresses /search's pending state too, so a slow navigation never flashes a white skeleton", () => {
    expect(read("app/search/loading.tsx")).toMatch(/className="nocturne"/);
  });

  it("is read by the chrome", () => {
    expect(read("components/site/Header.tsx")).toMatch(/isNightRoute\(pathname\)/);
    const shell = read("components/site/FooterShell.tsx");
    expect(shell).toMatch(/usePathname\(\)/);
    expect(shell).toMatch(/isNightRoute\(pathname\)/);
  });

  it("matches the routes exactly, not by prefix", () => {
    expect(isNightRoute("/")).toBe(true);
    expect(isNightRoute("/search")).toBe(true);
    expect(isNightRoute("/selling")).toBe(false);
    expect(isNightRoute("/search/anything")).toBe(false);
    expect(isNightRoute(null)).toBe(false);
  });

  it("re-points the tokens a component paints with, and has a way back out for things white by nature", () => {
    const css = read("app/globals.css");
    const night = css.slice(css.indexOf(".nocturne {"), css.indexOf("}", css.indexOf(".nocturne {")));
    for (const token of ["--color-paper", "--color-ink", "--color-stone", "--color-line", "--color-river", "--color-card"]) {
      expect(night, `${token} is not re-pointed inside .nocturne`).toContain(token);
    }
    expect(css).toMatch(/\.daylight\s*\{[^}]*--color-paper:\s*#ffffff/);
  });
});

/** ROUND 54: BLACK AND WHITE. The owner turned the navy down ("black and white ... was better")
 * and chose a black ground with white type. A cast creeping back into the ground, the text or the
 * hairlines is exactly how the navy arrived, one "slightly cooler" value at a time. */
describe("the night is black and white", () => {
  const css = read("app/globals.css");
  const theme = css.slice(css.indexOf("@theme {"), css.indexOf("\n}", css.indexOf("@theme {")));
  const night = css.slice(css.indexOf(".nocturne {"), css.indexOf("}", css.indexOf(".nocturne {")));
  const hex = (src: string, token: string) => src.match(new RegExp(`${token}:\\s*(#[0-9a-f]{6})`, "i"))?.[1];
  const cast = (h: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    return Math.max(r, g, b) - Math.min(r, g, b);
  };

  it.each(["--color-night", "--color-night-deep", "--color-night-raise", "--color-moon", "--color-haze"])(
    "%s carries no hue (channels within 6 of each other)",
    (token) => {
      const v = hex(theme, token);
      expect(v, `${token} is a literal hex in @theme`).toBeDefined();
      expect(cast(v!)).toBeLessThanOrEqual(6);
    },
  );

  it.each(["--color-ink-soft", "--color-line", "--color-line-strong", "--color-card"])("%s inside the scope carries no hue", (token) => {
    const v = hex(night, token);
    expect(v, `${token} is a literal hex inside .nocturne`).toBeDefined();
    expect(cast(v!)).toBeLessThanOrEqual(6);
  });

  it("turns the action and focus colour white inside the scope", () => {
    expect(night).toMatch(/--color-porchlight:\s*var\(--color-moon\)/);
    expect(night).toMatch(/--color-river:\s*var\(--color-moon\)/);
  });

  it("keeps the logo's R blue as a brand mark nothing re-points (the header's AI item wears it)", () => {
    expect(hex(theme, "--color-brand-r")).toBe(hex(theme, "--color-porchlight"));
    expect(night).not.toMatch(/--color-brand-r\s*:/);
    expect(css.slice(css.indexOf(".daylight {"), css.indexOf("}", css.indexOf(".daylight {")))).not.toMatch(/--color-brand-r\s*:/);
  });
});

describe("area labels on a night page", () => {
  it("sets the day nav's capitals in sentence case", () => {
    expect(areaName("THE BRONX")).toBe("The Bronx");
    expect(areaName("STATEN ISLAND")).toBe("Staten Island");
    expect(areaName("DUTCHESS")).toBe("Dutchess");
  });
});

describe("the map chip on a night basemap", () => {
  it("reads its resting colours from the page, falling back to the day's black chip", () => {
    const { outer, face } = chipStateStyles({ active: false, saved: false, spokenFor: false });
    expect(outer).toContain("--chip-bg:var(--rlt-chip-bg,#000)");
    expect(face).toContain("color:var(--rlt-chip-ink,#fff)");
  });
});

describe("the search box keeps what was typed before hydration", () => {
  // Measured on live 2026-09-21: "Beacon" typed while the scripts loaded was wiped by
  // hydration and Enter then searched for nothing. The fix seeds the state from the
  // server-rendered input's current value on the client's first render.
  const src = read("components/search/LocationSuggest.tsx");
  it("seeds its value from the input already in the document", () => {
    expect(src).toMatch(/document\.getElementById\(id\)/);
    expect(src).toMatch(/el instanceof HTMLInputElement \? el\.value/);
  });
  it("says that the one differing attribute is expected", () => {
    expect(src).toMatch(/value=\{value\}\s*\n\s*suppressHydrationWarning/);
  });
});

describe("sentence case for night labels", () => {
  it("drops plain Title-case words after the first, and leaves acronyms and names alone", async () => {
    const { sentenceCase } = await import("./site");
    expect(sentenceCase("Plan Your Purchase")).toBe("Plan your purchase");
    expect(sentenceCase("Who We Are")).toBe("Who we are");
    expect(sentenceCase("AI Services")).toBe("AI services");
    expect(sentenceCase("RealtyLT AI")).toBe("RealtyLT AI");
    expect(sentenceCase("Home")).toBe("Home");
    // The footer's utility strip (round 53 polish): the one label there that is not a legal name.
    expect(sentenceCase("Site Map")).toBe("Site map");
  });
});

/** ROUND 53 POLISH. The control styling added for the night pages is written as plain CSS in
 * globals.css (a checkbox, a select without its arrow, the search box's clear button, the skip
 * link), where no Tailwind variant scopes it. Every one of those rules must carry the night scope
 * in its own selector, or it restyles the same control on every day page. */
describe("the night pages' control rules stay on the night pages", () => {
  const css = read("app/globals.css").replace(/\/\*[\s\S]*?\*\//g, "");
  const selectorsFor = (needle: string) =>
    [...css.matchAll(/([^{}]+)\{/g)].map((m) => m[1].trim()).filter((s) => s.includes(needle) && !s.startsWith("@"));

  it.each([
    ['input[type="checkbox"]'],
    ["select.appearance-none"],
    [":placeholder-shown::-webkit-search-cancel-button"],
    ['a[href="#main"]'],
  ])("every rule for %s is scoped to a night page", (needle) => {
    const selectors = selectorsFor(needle);
    expect(selectors.length, `no rule found for ${needle}`).toBeGreaterThan(0);
    for (const sel of selectors) {
      for (const part of sel.split(",")) expect(part.trim(), `unscoped: ${part.trim()}`).toMatch(/^(\.nocturne|body:has\(\.nocturne\))\s/);
    }
  });

  it("gives forced-colours mode the native checkbox back", () => {
    expect(css).toMatch(/@media \(forced-colors: active\)\s*\{\s*\.nocturne input\[type="checkbox"\]\s*\{[^}]*appearance:\s*auto/);
  });
});

describe("the night hero's scroll cue can be seen", () => {
  // `text-paper/70` is the night ground itself on a blue-hour page: the cue was a Tab stop drawn
  // in the colour of what it sat on.
  it("paints in haze on night pages", () => {
    expect(read("components/ui/ScrollCue.tsx")).toMatch(/night:text-stone/);
  });
});

describe("/search's pending state is drawn in the page's own frame", () => {
  // The skeleton used to be a 1400px column with a 3 x 2 card grid while the page is a 1600px
  // column with a list beside a map, so the page jumped when it arrived. The skeleton now copies
  // the page's container and split; these assertions keep the copy from drifting.
  const skeleton = read("components/search/SearchSkeleton.tsx");
  const client = read("components/search/SearchClient.tsx");
  it.each([["max-w-[1600px] px-4 pb-16 lg:px-5"], ["lg:grid-cols-[1.2fr_1fr] xl:grid-cols-[0.9fr_1.1fr] 2xl:grid-cols-[0.85fr_1.15fr]"]])(
    "shares %s with the page",
    (cls) => {
      expect(client).toContain(cls);
      expect(skeleton).toContain(cls);
    },
  );
  it("is what both the route's loading state and the page's own fallback render", () => {
    expect(read("app/search/loading.tsx")).toMatch(/<SearchSkeleton \/>/);
    expect(read("app/search/page.tsx")).toMatch(/fallback=\{[\s\S]*?<SearchSkeleton \/>/);
  });
});

describe("focus rings the night would otherwise swallow (round 53 check)", () => {
  const css = read("app/globals.css");
  it("rings the footer strip's links in porchlight, and the strip still wears the classes that rule matches", () => {
    expect(css).toMatch(/\.nocturne \.bg-ink\.night\\:bg-night-deep :focus-visible\s*\{\s*outline-color:\s*var\(--color-porchlight\)/);
    expect(read("components/site/Footer.tsx")).toMatch(/className="bg-ink [^"]*night:bg-night-deep/);
  });
  it("rings the chat launcher in porchlight on a night page (it sits outside every .nocturne wrapper)", () => {
    expect(css).toMatch(/body:has\(\.nocturne\) \.rlt-bubble:focus-visible\s*\{\s*outline-color:\s*var\(--color-porchlight\)/);
  });
  it("leaves ring room inside /search's two phone scrollers, which clip what paints outside them", () => {
    const rows = read("components/search/SearchClient.tsx").match(/className="-mx-4 flex [^"]*overflow-x-auto[^"]*"/g) ?? [];
    expect(rows.length).toBe(2);
    for (const row of rows) expect(row).toMatch(/max-sm:-my-1 max-sm:py-1/);
  });
});
