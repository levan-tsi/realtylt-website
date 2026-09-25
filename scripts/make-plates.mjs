// THE PLATES (round 58, docs/parity/DESIGN-ROUND58.md §3): one picture per shot per aspect, rendered
// ONCE from the MapLibre night map (components/home/ml/) at a fixed camera and the screen's density,
// with the camera's own projection matrix recorded beside it, so the page draws our lights on the
// picture exactly where the map would have drawn them (components/home/plates/).
//
// Two stages, each repeatable on its own:
//
//   shoot   drives the running site's home page pinned on one shot (`?plate=<shot>`: MlGround.tsx),
//           everything but the map hidden, no lights (`?homes=0`), no cover, the map at the plate's
//           pixel ratio (`?pr=`), waits until every tile of the shot is drawn, then photographs the
//           map's box and records the camera, the pixel matrix and the world size the map reports
//           (raw PNG + JSON under scripts/_scratch-r57/58/plates/raw/, gitignored);
//   encode  grades each raw picture (GRADE, per shot, by eye), writes it as AVIF and WebP at its
//           full and its lower density (public/plates/), and generates the manifest
//           components/home/plates/plates.gen.ts from the recorded JSONs, plus a contact sheet
//           (docs/design-r59/plates-<aspect>.jpg, of the plates encoded that run) for the record.
//
//   node scripts/make-plates.mjs [--stage=shoot|encode|all] [--only=hero,queens] [--aspect=wide|tall]
//                                [--base=http://127.0.0.1:3102] [--headless] [--deep=1]
//
// Round 59: the county, chapter and harbour plates are DEEP renders (`--deep=1`, see below); the
// territory and the tail are plain. Re-render a deep shot with `--deep=1 --only=<shots>`.
//
// The server must be running the production build with the MapLibre ground reachable
// (`NEXT_PUBLIC_HOME_MAP` unset or `ml`... the ground the page draws is decided by lib/home-map.ts;
// the renderer asks for the MapLibre ground with `?ground=ml`). No MLS Grid call: `/api/media/` and
// `/api/lead` are blocked. What is in a plate: OpenStreetMap data in OpenMapTiles tiles from
// OpenFreeMap, the AWS terrain (USGS 3DEP, SRTM, GMTED2010, NOAA ETOPO1) as the moonlit relief:
// the same credits as the live map (components/site/SceneCredit.tsx, public/images/ATTRIBUTIONS.md).
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const flag = (k, d) => {
  const a = process.argv.find((x) => x.startsWith(`--${k}=`));
  return a ? a.slice(k.length + 3) : d;
};
const base = flag("base", "http://127.0.0.1:3102");
const stage = flag("stage", "all");
const only = flag("only", "") ? flag("only", "").split(",") : null;
const aspectOnly = flag("aspect", "");
const headless = process.argv.includes("--headless");
/** A comparison: one render override for every shot in --only, its raws written to --raw. */
const renderAll = flag("render", "");
const rawDir = flag("raw", "");

/** Round 59, THE DEEP RENDER: the same shot at twice the css size and device scale 1 (the phone's at
 * 1.5), so the device pixels are the same but the map stands one zoom deeper for the same range and
 * fetches tiles one level finer (z14 at the 9 km county cameras: the buildings). The plate style
 * keeps its lines the picture's size (`?deep=1`, style.ts plateLayers). The manifest records the
 * render's own css size (2880 x 1800), and the page's fit (max(vw / W, vh / H)) shows it at 0.5. */
const deep = flag("deep", "0") === "1";

const RAW = rawDir || "scripts/_scratch-r57/58/plates/raw";
const OUT = "public/plates";
const GEN = "components/home/plates/plates.gen.ts";
const SHEETS = "docs/design-r59";

/** The page's shots, in the order a reader meets them (components/home/night/shots.ts FLIGHT and
 * AREA_FLIGHT; the MapLibre cameras are components/home/ml/shots.ts ML_SHOTS). */
export const SHOTS = ["hero", "dutchess", "highlands", "westchester", "ulster", "dutchess-county", "orange", "putnam", "rockland", "westchester-county", "bronx", "manhattan", "queens", "brooklyn", "staten-island", "harbour", "region"];

/** The two aspects: the laptop (1440 x 900 css at 2x) and the phone (390 x 844 css at 3x). The
 * lower density each is also written at (1x and 2x) is the same picture resized. */
export const ASPECTS = deep
  ? {
      wide: { vp: { width: 2880, height: 1800 }, dpr: 1, mobile: false, widths: [2880, 1440] },
      tall: { vp: { width: 780, height: 1688 }, dpr: 1.5, mobile: true, widths: [1170, 780] },
    }
  : {
      wide: { vp: { width: 1440, height: 900 }, dpr: 2, mobile: false, widths: [2880, 1440] },
      tall: { vp: { width: 390, height: 844 }, dpr: 3, mobile: true, widths: [1170, 780] },
    };

/** Per-shot render overrides (the page's own query switches: exag, dem, hillshade, buildings).
 * Compared on Ulster and Putnam (scripts/_scratch-r57/58/plates/variant-sheet.png): a taller
 * terrain (exag 2.4, 3.2) and the finer DEM (256:14) change the relief only a little at 14 km, far
 * less than the tonal lift below, so the shared style stands and every plate keeps the same
 * exaggeration our homes are lifted by. */
const RENDER = {};

/** Per-shot grade applied to the raw picture: `curve` (out = 255 * (in / 255) ^ curve: 1 = none,
 * under 1 lifts the mid-tones and leaves black black), `gain` (a linear gain, 1 = none). By eye from
 * the contact sheet (scripts/_scratch-r58-grade.mjs). Not sharp's gamma(), which is a resize
 * correction and cancels itself without one.
 *
 * The owner's "some areas don't look that good" (record §11) were the valley counties: at 14 km the
 * shared night style leaves them a near-black land with a faint relief and a few hairlines. A 0.85
 * curve brings the moonlit relief and the roads up while the water stays black and the lights stay
 * the brightest thing (0.72 turned the land a flat grey and lost the night); the chapters over the
 * valley take the same; the two edge plates a lighter touch; the territory, the boroughs and the
 * harbour, dense with hairlines already, are left as rendered, so the first screen and the city keep
 * the approved black.
 *
 * Round 59: the county and chapter plates are denser (the plate style's whole street grid, the deep
 * render's z14 tiles), and the grid itself now carries a town. Compared at 1.0, 0.92 and 0.85 on
 * Dutchess county and Putnam (scripts/_scratch-r59/2/grade-*.jpg): 0.85 turned the hillsides grey
 * round the streets and the grid lost its edge; 0.92 kept the land darker but the streets dim. A
 * linear gain of 1.25 with no curve (gain-dc.jpg: 0.92, 1.3 and 1.0 against it) lifts the streets
 * most, where the light is, and the near-black land least: the town is the brightest ground, black
 * stays black, and the lights (drawn live, not graded) stay the brightest thing. Westchester
 * county and Staten Island, now grids edge to edge, as rendered. The territory and the tail are not re-encoded (their round 58 pictures stand). */
const GRADE = {
  dutchess: { gain: 1.25 },
  highlands: { gain: 1.25 },
  westchester: { gain: 1.25 },
  ulster: { gain: 1.25 },
  "dutchess-county": { gain: 1.25 },
  orange: { gain: 1.25 },
  putnam: { gain: 1.25 },
  rockland: { gain: 1.25 },
  region: { curve: 0.9 },
};

/** The grade applied on raw pixels: one lookup table, every channel. */
async function graded(file, g) {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const curve = g.curve ?? 1, gain = g.gain ?? 1;
  if (curve !== 1 || gain !== 1) {
    const lut = new Uint8Array(256);
    for (let i = 0; i < 256; i++) lut[i] = Math.max(0, Math.min(255, Math.round(255 * Math.pow(i / 255, curve) * gain)));
    const c = info.channels;
    for (let p = 0; p < data.length; p += c) {
      data[p] = lut[data[p]];
      data[p + 1] = lut[data[p + 1]];
      data[p + 2] = lut[data[p + 2]];
    }
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } }).png().toBuffer();
}

/** AVIF: the plates are near black with thin bright hairlines; chroma kept whole (4:4:4) so the
 * moon-blue lines do not smear. Quality 55 chosen by measurement against the raw render of the
 * territory (scripts/_scratch-r58-avifq.mjs): 189 KB at 2880 wide, a mean 1.9 levels apart, p95 5,
 * against 228 KB / 1.7 / 5 at 62 and the WebP fallback's 229 KB / 2.0 / 6 at 82; 48 with 4:2:0 gives
 * 137 KB at 2.2 / 7 and softens the hairlines' edges (p99.9 23). WebP: the fallback. */
const AVIF = { quality: 55, effort: 5, chromaSubsampling: "4:4:4" };
const WEBP = { quality: 82, effort: 6, smartSubsample: true };
/** Round 59: a plate is lazy (decoded ahead of the scroll), so 250 to 400 KB at 2880 is the budget
 * the owner's brief accepts; one over 450 KB at quality 55 is written at 50 (measured on the dense
 * borough plates, the record's §2). */
const AVIF_CAP = 450 * 1024;
const AVIF_DENSE = 50;

const wanted = SHOTS.filter((s) => !only || only.includes(s));
const aspects = Object.keys(ASPECTS).filter((a) => !aspectOnly || a === aspectOnly);

if (stage === "shoot" || stage === "all") await shoot();
if (stage === "encode" || stage === "all") await encode();

async function shoot() {
  fs.mkdirSync(RAW, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless });
  const errors = [];
  const open = async (vp, dpr, mobile) => {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setBlockedURLs", { urls: ["*/api/media/*", "*/api/lead*"] });
    // Only the map is seen: everything else hidden by visibility (a child may override, so the
    // ground's own subtree is turned back on), the page unscrollable so the map's box is the whole
    // window (no scrollbar), and the cover, the names and the lights kept out by the query.
    await page.addInitScript(() => {
      const css = document.createElement("style");
      css.textContent = "html{overflow:hidden!important}body *{visibility:hidden!important}[data-ml-ground],[data-ml-map],[data-ml-map] *{visibility:visible!important}[data-g3d-lights],[data-g3d-shades],[data-g3d-cover]{display:none!important}";
      document.addEventListener("DOMContentLoaded", () => document.head.append(css));
    });
    page.on("console", (m) => {
      if (m.type() === "error" || /\[ml\]/.test(m.text())) errors.push(m.text().slice(0, 200));
    });
    return { ctx, page };
  };
  for (const aspect of aspects) {
    const A = ASPECTS[aspect];
    const { ctx, page } = await open(A.vp, A.dpr, A.mobile);
    // The deep render's plain pass: the same shot at the window's own css size, only to read the
    // camera centre's height the map clamps to there (the live map's), which the deep render then
    // holds (`?elev=`): the matrix is then the live map's exactly, doubled.
    const plain = deep ? await open({ width: A.vp.width / 2, height: A.vp.height / 2 }, 1, A.mobile) : null;
    for (const shot of wanted) {
      const q = new URLSearchParams({ ground: "ml", plate: shot, cover: "0", homes: "0", slow: "0", pr: String(A.dpr), ...(deep ? { deep: "1" } : {}) });
      for (const [k, v] of new URLSearchParams(renderAll || RENDER[shot] || "")) q.set(k, v);
      const t0 = Date.now();
      if (plain) {
        const pq = new URLSearchParams(q);
        pq.delete("deep");
        pq.set("pr", "1");
        await plain.page.goto(`${base}/?${pq}`, { waitUntil: "domcontentloaded" });
        await plain.page.waitForFunction(() => {
          const s = window.__ml?.stats();
          return !!s && (s.error || (s.firstIdleAt != null && !s.flying));
        }, null, { timeout: 90000 });
        await plain.page.waitForTimeout(1800);
        const e = await plain.page.evaluate(() => { const m = window.__ml.ctl.map; return (m.transform ?? m._camera?.transform ?? {}).elevation ?? 0; });
        q.set("elev", String(e));
      }
      await page.goto(`${base}/?${q}`, { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => {
        const s = window.__ml?.stats();
        return !!s && (s.error || (s.firstIdleAt != null && !s.flying));
      }, null, { timeout: 90000 });
      // The tiles' own cross-fade (150 ms) and a second idle: the terrain's PNGs can arrive after
      // the first idle and re-shade the relief.
      await page.waitForTimeout(1800);
      await page.waitForFunction(() => !window.__ml.stats().flying, null, { timeout: 10000 });
      const st = await page.evaluate((want) => {
        const s = window.__ml.stats();
        const c = window.__ml.ctl;
        const m = c.map;
        const r = document.querySelector("[data-ml-map]").getBoundingClientRect();
        const f = c.liveFrame();
        const cen = m.getCenter();
        return {
          error: s.error,
          shot: s.shot,
          want,
          zoom: s.zoom,
          range: s.range,
          slow: s.slow,
          box: { x: r.x, y: r.y, width: r.width, height: r.height },
          view: c.view(),
          cam: { lng: cen.lng, lat: cen.lat, zoom: m.getZoom(), pitch: m.getPitch(), bearing: m.getBearing(), fov: m.getVerticalFieldOfView(), elevation: (m.transform ?? m._camera?.transform ?? {}).elevation ?? 0 },
          frame: f && f.kind === "matrix" ? { ws: f.ws, m: Array.from(f.m) } : null,
          frameKind: f?.kind ?? null,
          ex: c.exaggeration,
          dpr: window.devicePixelRatio,
          scrollY,
        };
      }, shot);
      if (st.error) throw new Error(`${shot}/${aspect}: the map failed: ${st.error}`);
      if (st.shot !== shot) throw new Error(`${shot}/${aspect}: the map is on ${st.shot}, not pinned`);
      if (st.slow?.by) throw new Error(`${shot}/${aspect}: the slow-line arm drew (${st.slow.by}); not a plate`);
      if (!st.frame) throw new Error(`${shot}/${aspect}: no pixel matrix (frame ${st.frameKind}); the manifest needs the map's own`);
      if (st.box.width !== A.vp.width || st.box.height !== A.vp.height) throw new Error(`${shot}/${aspect}: the map's box is ${st.box.width} x ${st.box.height}, not the window`);
      if (q.has("elev") && Math.abs(st.cam.elevation - Number(q.get("elev"))) > 1e-6) throw new Error(`${shot}/${aspect}: the centre stands at ${st.cam.elevation} m, not the plain render's ${q.get("elev")}`);
      const png = await page.screenshot({ clip: st.box, type: "png" });
      const meta = await sharp(png).metadata();
      const name = `${shot}-${aspect}`;
      fs.writeFileSync(`${RAW}/${name}.png`, png);
      fs.writeFileSync(`${RAW}/${name}.json`, JSON.stringify({ shot, aspect, w: A.vp.width, h: A.vp.height, dpr: A.dpr, px: { w: meta.width, h: meta.height }, cam: st.cam, ex: st.ex, ws: st.frame.ws, m: st.frame.m, render: renderAll || RENDER[shot] || "", deep, shotAt: new Date().toISOString() }, null, 1));
      console.log(`${name.padEnd(24)} ${meta.width} x ${meta.height}  zoom ${st.zoom}  range ${st.range}  ${((Date.now() - t0) / 1000).toFixed(1)} s${errors.length ? `  (${errors.length} console errors)` : ""}`);
      errors.length = 0;
    }
    await ctx.close();
    await plain?.ctx.close();
  }
  await browser.close();
}

async function encode() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(SHEETS, { recursive: true });
  const manifest = {};
  const tiles = { wide: [], tall: [] };
  let total = 0;
  for (const shot of SHOTS) {
    for (const aspect of Object.keys(ASPECTS)) {
      const name = `${shot}-${aspect}`;
      const jsonPath = `${RAW}/${name}.json`;
      if (!fs.existsSync(jsonPath)) {
        if (wanted.includes(shot) && aspects.includes(aspect)) console.warn(`missing raw: ${name}`);
        continue;
      }
      const rec = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      const A = ASPECTS[aspect];
      const doEncode = wanted.includes(shot) && aspects.includes(aspect);
      const g = GRADE[shot] ?? {};
      if (doEncode) {
        const gradedPng = await graded(`${RAW}/${name}.png`, g);
        // Round 59: a denser plate over AVIF_CAP at its full width is written at AVIF_DENSE instead.
        let avifOpts = AVIF;
        {
          const w = A.widths[0], h = Math.round((w * A.vp.height) / A.vp.width);
          const probe = await sharp(gradedPng).resize(w, h, { kernel: "lanczos3" }).avif(AVIF).toBuffer();
          if (probe.length > AVIF_CAP) {
            avifOpts = { ...AVIF, quality: AVIF_DENSE };
            console.log(`${name.padEnd(24)} avif ${(probe.length / 1024).toFixed(0)} KB at ${AVIF.quality} is over the cap: quality ${AVIF_DENSE}`);
          }
        }
        for (const w of A.widths) {
          const h = Math.round((w * A.vp.height) / A.vp.width);
          const scaled = sharp(gradedPng).resize(w, h, { kernel: "lanczos3" });
          const avif = `${OUT}/${name}-${w}.avif`, webp = `${OUT}/${name}-${w}.webp`;
          await scaled.clone().avif(avifOpts).toFile(avif);
          await scaled.clone().webp(WEBP).toFile(webp);
          const ka = fs.statSync(avif).size, kw = fs.statSync(webp).size;
          total += ka + kw;
          console.log(`${name.padEnd(24)} ${String(w).padStart(4)}  avif ${(ka / 1024).toFixed(0).padStart(4)} KB  webp ${(kw / 1024).toFixed(0).padStart(4)} KB`);
        }
        const tile = await sharp(gradedPng).resize(aspect === "wide" ? 480 : 160, aspect === "wide" ? 300 : 346).png().toBuffer();
        tiles[aspect].push({ name: shot, tile });
      }
      manifest[shot] ??= {};
      manifest[shot][aspect] = { w: rec.w, h: rec.h, widths: A.widths, cam: rec.cam, ex: rec.ex ?? 1.6, ws: rec.ws, m: rec.m, k: rec.deep ? 2 : 1 };
    }
  }
  // The manifest: every shot with both aspects, else the page would have no picture for one.
  const missing = SHOTS.flatMap((s) => Object.keys(ASPECTS).filter((a) => !manifest[s]?.[a]).map((a) => `${s}/${a}`));
  if (missing.length) console.warn(`manifest incomplete (not written): ${missing.join(", ")}`);
  else {
    const round = (x, k) => Math.round(x * k) / k;
    const lines = ["// GENERATED by scripts/make-plates.mjs (round 58). Do not edit: re-run the script.", "// Each plate: its css size at render, the widths it is served at, the camera the map reported, and", "// the map's own pixel matrix and world size for that camera (components/home/plates/plate-frame.ts).", "import type { PlateManifest } from \"./plate-frame\";", "", "export const PLATES: PlateManifest = {"];
    for (const s of SHOTS) {
      lines.push(`  "${s}": {`);
      for (const a of Object.keys(ASPECTS)) {
        const p = manifest[s][a];
        const cam = `{ lng: ${round(p.cam.lng, 1e7)}, lat: ${round(p.cam.lat, 1e7)}, zoom: ${round(p.cam.zoom, 1e6)}, pitch: ${round(p.cam.pitch, 1e4)}, bearing: ${round(p.cam.bearing, 1e4)}, fov: ${round(p.cam.fov, 1e4)}, elevation: ${round(p.cam.elevation, 1e3)} }`;
        lines.push(`    ${a}: { w: ${p.w}, h: ${p.h}, widths: [${p.widths.join(", ")}], cam: ${cam}, ex: ${p.ex}, ws: ${p.ws}, m: [${p.m.map((v) => (Number.isInteger(v) ? String(v) : v.toPrecision(15))).join(", ")}]${p.k !== 1 ? `, k: ${p.k}` : ""} },`);
      }
      lines.push("  },");
    }
    lines.push("};", "");
    fs.mkdirSync(path.dirname(GEN), { recursive: true });
    fs.writeFileSync(GEN, lines.join("\n"));
    console.log(`wrote ${GEN} (${SHOTS.length} shots x ${Object.keys(ASPECTS).length} aspects)`);
  }
  for (const aspect of Object.keys(tiles)) {
    const list = tiles[aspect];
    if (!list.length) continue;
    const tw = aspect === "wide" ? 480 : 160, th = aspect === "wide" ? 300 : 346, cols = aspect === "wide" ? 4 : 9, pad = 6, cap = 22;
    const rows = Math.ceil(list.length / cols);
    const W = cols * (tw + pad) + pad, H = rows * (th + cap + pad) + pad;
    const comps = [];
    list.forEach((t, i) => {
      const x = pad + (i % cols) * (tw + pad), y = pad + Math.floor(i / cols) * (th + cap + pad);
      comps.push({ input: Buffer.from(`<svg width="${tw}" height="${cap}"><text x="4" y="16" font-family="sans-serif" font-size="13" fill="#ddd">${t.name}</text></svg>`), left: x, top: y });
      comps.push({ input: t.tile, left: x, top: y + cap });
    });
    await sharp({ create: { width: W, height: H, channels: 3, background: "#2a2a2a" } }).composite(comps).jpeg({ quality: 82 }).toFile(`${SHEETS}/plates-${aspect}.jpg`);
    console.log(`sheet ${SHEETS}/plates-${aspect}.jpg (${list.length} plates)`);
  }
  if (total) console.log(`public/plates written this run: ${(total / 1024 / 1024).toFixed(1)} MB`);
}
