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

  it("opens on the establishing shot and ends on the whole region, which is the footer's leg", () => {
    const named = attrs("shot");
    expect(named[0]).toBe("hero");
    // The last SECTION arrives over the harbour; the pull-back to the whole region is the tail,
    // the leg of the flight that runs below the last section — which is the footer. Before that
    // existed the scene stopped dead at the footer's top edge and cut the region in half.
    expect(named[named.length - 1].split(",").pop()).toBe("harbour");
    const tail = /tail=\{\{\s*shot:\s*"([^"]+)",\s*veil:\s*([\d.]+),\s*veilPhone:\s*([\d.]+)\s*\}\}/.exec(page);
    expect(tail, "the flight lost its last leg behind the footer").not.toBeNull();
    expect(tail![1]).toBe("region");
    expect(SHOTS[tail![1] as ShotName]).toBeDefined();
    // Veiled hard: the footer's own words are read over it.
    expect(Number(tail![2])).toBeGreaterThan(0.8);
    expect(Number(tail![3])).toBeGreaterThanOrEqual(Number(tail![2]));
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

  it("rises each section heading once from a line, on the night page only", () => {
    const css = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8");
    expect(css).toContain(".nocturne .mask-line");
    expect(css).toMatch(/\.nocturne \.reveal\.is-visible \.mask-line > span/);
    // Reduced motion and no scripting put the words where they belong with no movement at all.
    const guard = css.slice(css.indexOf(".nocturne .mask-line"));
    expect(guard).toMatch(/@media \(scripting: none\), \(prefers-reduced-motion: reduce\) \{\s*\.nocturne \.mask-line/);
    // Every section heading on the home page uses it.
    expect((page.match(/className="mask-line"/g) ?? []).length).toBeGreaterThanOrEqual(4);
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
  });
});

describe("the footer over the scene", () => {
  const shell = fs.readFileSync(path.join(ROOT, "components/site/FooterShell.tsx"), "utf8");

  it("is positioned on the home page only, so no other page's stacking changes", () => {
    expect(shell).toContain('isHomePath(pathname) ? "relative z-10 " : ""');
  });

  it("lets the scene through on the home page only, and by inline style so class order cannot decide it", () => {
    expect(shell).toContain('isHomePath(pathname) ? { backgroundColor: "transparent" as const } : undefined');
    expect(shell).toContain("style={style}");
  });

  it("credits the MapLibre map's own sources in the map's corner, at the legal minimum (rounds 57.13, 58, 60)", () => {
    // Round 60: the footer says nothing for the ml and plates grounds; the corner credit in the ground
    // carries the whole notice (the OSMF attribution guideline, read 2026-09-25: the notice shows
    // without interaction, may collapse automatically after five seconds, and an "(i)" in the corner
    // must bring it back; one instance covers every picture on the page).
    const ground = fs.readFileSync(path.join(ROOT, "components/home/ml/MlGround.tsx"), "utf8");
    expect(ground).toContain("export const CREDIT_SHOWN_MS = 5000;");
    expect(ground).toContain('href="https://www.openstreetmap.org/copyright"');
    expect(ground).toContain("© OpenStreetMap contributors");
    expect(ground).toContain('href="https://openmaptiles.org/"');
    expect(ground).toContain("© OpenMapTiles");
    // The terrain's sources are named in the opened notice (public-domain data whose sources ask to
    // be named), and OpenFreeMap, whose name is optional, with them.
    expect(ground).toContain("USGS 3DEP, SRTM and GMTED2010; NOAA ETOPO1");
    expect(ground).toContain("OpenFreeMap");
    // The (i): a <details> whose summary is the 24 px disc, so the notice opens with no script at all
    // (a phone, where the line never shows, still reaches it with JavaScript off); the line is for
    // laptops only (hidden below md) and only while the state is "line".
    expect(ground).toContain('open={credit === "panel"}');
    expect(ground).toContain('<summary');
    expect(ground).toContain('aria-label="Map data credits"');
    expect(ground).toContain('className="m-0 hidden max-w-[280px] md:block');
    expect(ground).toContain('className={credit === "line" ? "md:hidden" : undefined}');
    expect(ground).toContain('useState<"line" | "icon" | "panel">("line")');
    const attributions = fs.readFileSync(path.join(ROOT, "public/images/ATTRIBUTIONS.md"), "utf8");
    expect(attributions).toContain("scripts/make-ml-cover.mjs");
  });
});
