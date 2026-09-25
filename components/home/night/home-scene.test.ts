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

  it("gives the STILL the quiet the live scene gets, since a still cannot be told where the words are", () => {
    const ground = fs.readFileSync(path.join(ROOT, "components/home/night/NightGround.tsx"), "utf8");
    // The two scrims live INSIDE the poster element, so they fade with it and leave nothing behind,
    // and they follow the words: vertical on a phone (headline high, search low), one soft ellipse
    // in the bottom left on a laptop. Without them the count sentence sat on the brightest part of
    // the city with JavaScript off (round 54, builder 3: measured at 1.3:1 at 390).
    const poster = ground.slice(ground.indexOf("backgroundImage: `url(${poster})`"));
    expect(poster).toContain("lg:hidden");
    expect(poster).toContain("hidden lg:block");
    expect((poster.match(/rgba\(5,5,5,/g) ?? []).length).toBeGreaterThanOrEqual(8);
    // ...and the poster is never dissolved into an empty canvas.
    expect(ground).toContain("if (!h.stats().lights) return;");
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

  it("carries a still of the scene for a visitor with no JavaScript and no WebGL", () => {
    // Round 57: one poster for both grounds, named once (`const POSTER`) and handed to each.
    const m = /(?:poster="|const POSTER = ")([^"]+)"/.exec(page);
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

describe("the scene's programs are compiled before the clouds arrive", () => {
  // Measured in the owner's Chrome on the real GPU (round 55): the first render with the light
  // and haze materials linked their programs and blocked on it for 199 to 227 ms, mid-intro. The
  // link now runs through compileAsync (KHR_parallel_shader_compile) against stand-in geometries
  // while the worker builds, and neither cloud is added until it is done.
  const scene = fs.readFileSync(path.join(ROOT, "components/home/night/scene.ts"), "utf8");

  it("starts the compile as soon as the materials exist, before the terrain is even fetched", () => {
    const compile = scene.indexOf("renderer.compileAsync(");
    expect(compile).toBeGreaterThan(0);
    expect(compile).toBeLessThan(scene.indexOf("await buildTerrain()"));
    expect(compile).toBeLessThan(scene.indexOf("loadElevationPixels("));
  });

  it("compiles all four programs: dust, lights, haze and the depth mesh", () => {
    const warm = scene.slice(scene.indexOf("const programsReady"), scene.indexOf("renderer.compileAsync("));
    for (const m of ["dustMat", "lightMat", "hazeMat", "depthMat"]) expect(warm).toContain(m);
  });

  it("adds no cloud before the programs are ready, and never waits on a driver that stays silent", () => {
    const dust = scene.slice(scene.indexOf("async function buildDustCloud()"), scene.indexOf("async function buildLightCloud()"));
    const lights = scene.slice(scene.indexOf("async function buildLightCloud()"), scene.indexOf("// ---- camera"));
    expect(dust.indexOf("await programsReady")).toBeGreaterThan(0);
    expect(dust.indexOf("await programsReady")).toBeLessThan(dust.indexOf("new THREE.Points("));
    expect(lights.indexOf("await programsReady")).toBeGreaterThan(0);
    expect(lights.indexOf("await programsReady")).toBeLessThan(lights.indexOf("new THREE.Points("));
    expect(scene).toMatch(/Promise\.race\(\[renderer\.compileAsync\(warm, camera\), new Promise\(\(r\) => setTimeout\(r, \d+\)\)\]\)/);
  });
});

describe("the frame that receives the clouds does as little as possible", () => {
  // Measured in the owner's Chrome (round 55): the worker's terrain reply was consumed in one
  // 60 to 91 ms frame (the light math on the main thread, then a 43 ms upload of the dust's
  // 36 MB in the first frame that drew it). The light math now runs in the worker, in one bundle
  // shared with the main-thread fallback, and the dust goes up in pieces, one per frame.
  const scene = fs.readFileSync(path.join(ROOT, "components/home/night/scene.ts"), "utf8");
  const worker = fs.readFileSync(path.join(ROOT, "components/home/night/build.worker.ts"), "utf8");

  it("asks the worker for the lights and builds the same bundle itself only when it cannot", () => {
    expect(worker).toContain("buildLightBundle(req.pts, grid, dust, req.areaGain)");
    expect(worker).toContain("bundleTransfer(bundle)");
    expect(scene).toContain('ask({ kind: "lights", pts, areaGain })');
    expect(scene).toMatch(/: buildLightBundle\(pts, grid, /);
    // The scene no longer does the light math itself.
    for (const fn of ["buildLights(", "buildHaze(", "countyRaster(", "countyLightBoxes(", "countyAreaGains(", "townCentroids("]) expect(scene).not.toContain(fn);
  });

  it("holds the dust as pieces of a bounded size and adds one per frame", () => {
    const m = /const DUST_CHUNK = ([\d_]+);/.exec(scene);
    expect(m).not.toBeNull();
    const grains = Number(m![1].replace(/_/g, ""));
    // 36 bytes a grain: under 8 MB a piece, and not so small that a phone's 400k cloud dribbles in.
    expect(grains * 36).toBeLessThan(8 * 1024 * 1024);
    expect(grains).toBeGreaterThanOrEqual(100_000);
    const loop = scene.slice(scene.indexOf("for (const c of chunks.slice(1))"), scene.indexOf("async function buildLightCloud()"));
    expect(loop).toContain("await nextFrame();");
    expect(loop.indexOf("await nextFrame();")).toBeLessThan(loop.indexOf("add(c);"));
  });

  it("fetches the programs' uniform locations off-frame, after the link", () => {
    const warm = scene.slice(scene.indexOf("const programsReady"), scene.indexOf('performance.mark("night:programs")'));
    expect(warm.indexOf("compileAsync(")).toBeLessThan(warm.indexOf("getUniforms()"));
  });
});

describe("the footer over the scene", () => {
  const shell = fs.readFileSync(path.join(ROOT, "components/site/FooterShell.tsx"), "utf8");

  it("is positioned on the home page only, so no other page's stacking changes", () => {
    expect(shell).toContain('pathname === "/" ? "relative z-10 " : ""');
  });

  it("lets the scene through on the home page only, and by inline style so class order cannot decide it", () => {
    expect(shell).toContain('pathname === "/" ? { backgroundColor: "transparent" as const } : undefined');
    expect(shell).toContain("style={style}");
  });

  it("credits the MapLibre map's own sources in the map's corner, at the legal minimum (rounds 57.13, 58, 60)", () => {
    // Round 60: the footer says nothing for the ml and plates grounds; the corner credit in the ground
    // carries the whole notice (the OSMF attribution guideline, read 2026-09-25: the notice shows
    // without interaction, may collapse automatically after five seconds, and an "(i)" in the corner
    // must bring it back; one instance covers every picture on the page).
    const credit = fs.readFileSync(path.join(ROOT, "components/site/SceneCredit.tsx"), "utf8");
    expect(credit).toContain('if (ground === "ml" || ground === "plates") return null;');
    expect(credit).not.toContain("/lab/ml");
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
    // The (i): a real button, 24 px, that says what it opens.
    expect(ground).toMatch(/aria-expanded=\{credit === "panel"\}/);
    expect(ground).toContain('useState<"line" | "icon" | "panel">("line")');
    const attributions = fs.readFileSync(path.join(ROOT, "public/images/ATTRIBUTIONS.md"), "utf8");
    expect(attributions).toContain("scripts/make-ml-cover.mjs");
  });

  it("carries the terrain credit on the home page only, in the words the sources ask for", () => {
    const credit = fs.readFileSync(path.join(ROOT, "components/site/SceneCredit.tsx"), "utf8");
    expect(credit).toContain('if (pathname !== "/") return null;');
    expect(credit).toContain("Terrain: Mapzen; USGS 3DEP, SRTM, GMTED2010 and NHD; NOAA ETOPO1.");
    expect(fs.readFileSync(path.join(ROOT, "public/images/ATTRIBUTIONS.md"), "utf8")).toContain(
      "Terrain: Mapzen; USGS 3DEP, SRTM, GMTED2010 and NHD;",
    );
    expect(fs.readFileSync(path.join(ROOT, "components/site/Footer.tsx"), "utf8")).toContain("<SceneCredit />");
  });

  it("acknowledges NASA as the source of the night lights, as its usage guidelines ask, in text and never as an insignia", () => {
    const credit = fs.readFileSync(path.join(ROOT, "components/site/SceneCredit.tsx"), "utf8");
    expect(credit).toContain("Night lights: NASA Earth Observatory (Black Marble 2016, Suomi NPP VIIRS).");
    expect(credit).not.toMatch(/<(img|Image|svg)\b/);
    const attributions = fs.readFileSync(path.join(ROOT, "public/images/ATTRIBUTIONS.md"), "utf8");
    expect(attributions).toContain("NASA should be acknowledged as the source of the material.");
    expect(attributions).toContain("BlackMarble_2016_B1_geo.tif");
    const meta = JSON.parse(fs.readFileSync(path.join(ROOT, "public/geo/valley-elevation.json"), "utf8")) as { sources?: { nightLights?: { url?: string; licence?: string } } };
    expect(meta.sources?.nightLights?.url).toContain("eoimages.gsfc.nasa.gov");
    expect(meta.sources?.nightLights?.licence).toContain("NASA should be acknowledged as the source of the material.");
  });
});

describe("the poster, the still that covers the first screen", () => {
  const ground = fs.readFileSync(path.join(ROOT, "components/home/night/NightGround.tsx"), "utf8");

  it("leaves at once when the visitor scrolls, instead of sitting as a frozen strip until the intro ends (round 55, the owner's freeze)", () => {
    // The still is absolute to the page, so a scroll before the intro's end left it as a frozen
    // picture across the top of the window with a hard seam, for up to four seconds. A visitor
    // who scrolls has stopped waiting: the still drops on the first scroll, quickly.
    expect(ground).toMatch(/addEventListener\("scroll", onScroll/);
    expect(ground).toMatch(/window\.scrollY > 24\)\s*\{\s*dropPosterNow\(\)/);
    expect(ground).toContain('posterQuick ? "duration-[400ms]" : "duration-[1100ms]"');
  });

  it("drops it on ready too, when the visitor scrolled while the clouds were building", () => {
    expect(ground).toMatch(/if \(window\.scrollY > 24\) \{\s*dropPosterNow\(\);\s*return;/);
  });

  it("only where WebGL exists, because without it the still is the hero", () => {
    expect(ground).toMatch(/glOk\.current && window\.scrollY > 24/);
    expect(ground).toMatch(/getContext\("webgl2"\) \|\| c\.getContext\("webgl"\)/);
  });
});
