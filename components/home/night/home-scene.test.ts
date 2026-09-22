import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { AREA_ROWS } from "./areas";
import { COUNTY_SLUGS } from "./lights";
import { AREA_COUNTY_OF, AREA_FLIGHT, SHOTS, type ShotName } from "./shots";
import { BOROUGHS, COUNTIES, TOP_AREA_GROUPS } from "@/lib/site";

/** THE PAGE AND THE SCENE HAVE TO AGREE (round 54).
 *
 * The home page is one 3D scene with the page's own content in front of it, and the two are
 * joined by attributes in the markup: `data-shot` says which shot a section holds the camera on,
 * `data-veil` how far it dims the scene, `data-quiet` where its words sit, `data-lantern` where
 * the pointer is forwarded. A typo in any of them is silent — the camera simply never arrives, or
 * a section's words sit on the city — so they are checked here against the shots that exist. */

const ROOT = process.cwd();
const page = fs.readFileSync(path.join(ROOT, "app/page.tsx"), "utf8");
const attrs = (name: string) => [...page.matchAll(new RegExp(`data-${name}="([^"]*)"`, "g"))].map((m) => m[1]);

describe("the home page's sections and the scene's shots", () => {
  it("names only shots that exist, on every section", () => {
    const named = attrs("shot").flatMap((v) => v.split(","));
    expect(named.length).toBeGreaterThanOrEqual(6);
    for (const n of named) expect(SHOTS[n as ShotName], n).toBeDefined();
  });

  it("builds the areas chapter's shot list from AREA_FLIGHT itself, not by hand", () => {
    expect(page).toContain('data-shot={AREA_FLIGHT.join(",")}');
  });

  it("opens on the establishing shot and ends on the whole region", () => {
    const named = attrs("shot");
    expect(named[0]).toBe("hero");
    expect(named[named.length - 1].split(",").pop()).toBe("region");
  });

  it("keeps every veil between none and all, on a window and on a phone", () => {
    for (const key of ["veil", "veil-phone"]) {
      const values = attrs(key).map(Number);
      expect(values.length).toBeGreaterThan(0);
      for (const v of values) {
        expect(Number.isFinite(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });

  it("veils the sections whose cards have to be read, and not the testimonial", () => {
    const veilOf = (marker: string) => {
      const at = page.indexOf(marker);
      const shot = page.lastIndexOf("data-shot", at);
      const m = /data-veil="([^"]*)"/.exec(page.slice(shot, at));
      return m ? Number(m[1]) : null;
    };
    expect(veilOf('id="featured-heading"')).toBeGreaterThan(0.6);
    expect(veilOf('id="new-heading"')).toBeGreaterThan(0.6);
    expect(veilOf('id="why-heading"')).toBeGreaterThan(0.6);
    expect(veilOf("<TestimonialBand")).toBe(0);
  });

  it("gives the scene the hero's words to be quiet under, and a field for the lantern", () => {
    expect(page.match(/data-quiet/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
    expect(page).toContain("data-lantern");
    // The lantern's field is UNDER the words and the form: it must never take their clicks.
    const lantern = page.indexOf("data-lantern");
    expect(page.indexOf('id="home-hero"')).toBeGreaterThan(lantern);
  });

  it("carries a still of the scene for a visitor with no JavaScript and no WebGL", () => {
    const m = /poster="([^"]+)"/.exec(page);
    expect(m, "the hero lost its poster").not.toBeNull();
    expect(fs.existsSync(path.join(ROOT, "public", m![1]))).toBe(true);
    // ...and the licence lives with the rest of the artwork.
    expect(fs.readFileSync(path.join(ROOT, "public/images/ATTRIBUTIONS.md"), "utf8")).toContain(m![1].replace(/^\//, "public/"));
  });

  it("has let go of the flat canvases the scene replaced", () => {
    expect(fs.existsSync(path.join(ROOT, "components/home/HeroLights.tsx"))).toBe(false);
    expect(fs.existsSync(path.join(ROOT, "components/home/AreaLights.tsx"))).toBe(false);
    expect(page).not.toContain("radial-gradient");
  });
});

describe("the eleven areas the chapter names", () => {
  it("is every area the camera flies, in that order", () => {
    expect(AREA_ROWS.map((r) => r.shot)).toEqual([...AREA_FLIGHT]);
    expect(AREA_ROWS).toHaveLength(11);
  });

  it("links each one where the nav's Top Areas links it", () => {
    const nav = Object.fromEntries([
      ...COUNTIES.map((c, i) => [c.slug, TOP_AREA_GROUPS[0].items[i].href]),
      ...BOROUGHS.map((b, i) => [b.slug, TOP_AREA_GROUPS[1].items[i].href]),
    ]);
    for (const row of AREA_ROWS) {
      expect(row.href, row.slug).toBe(nav[row.slug]);
      expect(row.href).toMatch(/^\/top-areas\//);
    }
  });

  it("names them the way the rest of the site does, six in the valley and five in the city", () => {
    expect(AREA_ROWS.filter((r) => r.group === "valley")).toHaveLength(6);
    expect(AREA_ROWS.filter((r) => r.group === "city")).toHaveLength(5);
    expect(AREA_ROWS.find((r) => r.slug === "dutchess")!.name).toBe("Dutchess");
    expect(AREA_ROWS.find((r) => r.slug === "bronx")!.name).toBe("The Bronx");
    for (const row of AREA_ROWS) expect(row.name, row.slug).toBeTruthy();
  });

  it("uses the slug the lights' own counts are keyed by, so every row can show a number", () => {
    for (const row of AREA_ROWS) {
      expect(COUNTY_SLUGS as readonly string[], row.slug).toContain(row.slug);
      expect(AREA_COUNTY_OF[row.shot]).toBe(row.slug);
    }
    const chapter = fs.readFileSync(path.join(ROOT, "components/home/night/AreaChapter.tsx"), "utf8");
    expect(chapter).toContain("counts?.[row.slug]");
    // The counts come from the fetch the scene already makes, not a second request.
    expect(chapter).toContain("loadLights()");
  });
});

describe("the footer over the scene", () => {
  const shell = fs.readFileSync(path.join(ROOT, "components/site/FooterShell.tsx"), "utf8");

  it("is positioned on the home page only, so no other page's stacking changes", () => {
    expect(shell).toContain('pathname === "/" ? "relative z-10 " : ""');
  });

  it("carries the terrain credit on the home page only, in the words the sources ask for", () => {
    const credit = fs.readFileSync(path.join(ROOT, "components/site/SceneCredit.tsx"), "utf8");
    expect(credit).toContain('usePathname() !== "/"');
    expect(credit).toContain("Terrain: Mapzen; USGS 3DEP, SRTM, GMTED2010 and NHD; NOAA ETOPO1.");
    expect(fs.readFileSync(path.join(ROOT, "public/images/ATTRIBUTIONS.md"), "utf8")).toContain(
      "Terrain: Mapzen; USGS 3DEP, SRTM, GMTED2010 and NHD;",
    );
    expect(fs.readFileSync(path.join(ROOT, "components/site/Footer.tsx"), "utf8")).toContain("<SceneCredit />");
  });
});
