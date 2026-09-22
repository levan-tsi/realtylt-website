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
    expect(read(pageFile(route))).toMatch(/className="nocturne"/);
  });

  it("dresses /search's pending state too, so a slow navigation never flashes a white skeleton", () => {
    expect(read("app/search/loading.tsx")).toMatch(/className="nocturne"/);
  });

  it("is read by the chrome", () => {
    expect(read("components/site/Header.tsx")).toMatch(/isNightRoute\(pathname\)/);
    expect(read("components/site/FooterShell.tsx")).toMatch(/isNightRoute\(usePathname\(\)\)/);
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
  });
});
