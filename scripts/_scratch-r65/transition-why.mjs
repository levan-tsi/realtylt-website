// Round 65, builder A: every transition of the home page's walk and WHY it was a film or a fade
// (the controller's own reason on each fade's log entry: unrecorded / not-loaded / buffering / ...,
// "(queued)" when it started behind another), the frames over 34 ms, and the first move after a
// fresh load. Desktop Chrome, a fresh context (empty cache) per run. Needs the controller's
// fade reasons (round 65, plate-controller.ts filmWhy) and the ml:films-open mark.
//   node scripts/_scratch-r65/transition-why.mjs [--phone] [--mode=walk|first|back|reveal]
//        [--net=20] [--lat=40] [--dpr=1] [--dwell=1500] [--rest=1500] [--delays=1000,2000,4000]
//        [--after=4000] [--events] [--res] [--base=...]
// walk: every distinct stop once, --dwell ms each, after --rest ms still; films/fades with the
//   reason, frames over 34 ms with the film layer's events near each (--events: all of them;
//   --res: the clips' and plates' fetch times).
// first: the first move (hero -> dutchess) at each of --delays ms after the reveal, a fresh page each.
// back: one stop back up, then jumps of three stops down, three down, two up (the route).
// reveal: the first 3 s screencast to scripts/_scratch-r65/reveal-<w>/ and the plate's state per frame.
// --net=<Mbps> throttles the line by CDP (Network.emulateNetworkConditions) from before the load.
import fs from "node:fs";
import { chromium } from "playwright";
import { arg, blockUnsafe } from "../_scratch-r57l-lib.mjs";
const phone = process.argv.includes("--phone");
const base = arg("base", "http://127.0.0.1:3102");
const mode = arg("mode", "walk");
const net = Number(arg("net", 0)), lat = Number(arg("lat", 40));
const dpr = Number(arg("dpr", 1)), dwell = Number(arg("dwell", 1500));
const W = phone ? 390 : 1440, H = phone ? 844 : 900;
const browser = await chromium.launch({ channel: "chrome", headless: false, args: [`--window-size=${W + 16},${H + 88}`] });

async function open() {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, isMobile: phone, hasTouch: phone, deviceScaleFactor: dpr });
  const page = ctx.pages()[0] ?? (await ctx.newPage());
  const cdp = await blockUnsafe(page);
  if (net > 0) await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: lat, downloadThroughput: (net * 1e6) / 8, uploadThroughput: (net * 1e6) / 8 });
  return { ctx, page, cdp };
}
const reveal = (page) => page.waitForFunction(() => performance.getEntriesByName("ml:reveal").length > 0, null, { timeout: 60000 });
const films = (page) => page.evaluate(() => window.__ml.stats().plates.films);
const frameLogger = (page) =>
  page.evaluate(() => {
    // What the film layer did, to lay beside a long frame: a clip element added or removed (a decoder
    // made or torn down), and the media events of every clip.
    window.__ev = [];
    const nm = (v) => (v.currentSrc || v.getAttribute("src") || "").split("/").pop().replace(/-wide|-tall|\.webm|\.mp4/g, "");
    const root = document.querySelector("[data-plate-film]");
    new MutationObserver((ms) => { for (const m of ms) { for (const n of m.addedNodes) if (n.tagName === "VIDEO") window.__ev.push([performance.now(), "add " + nm(n)]); for (const n of m.removedNodes) if (n.tagName === "VIDEO") window.__ev.push([performance.now(), "remove " + nm(n)]); } }).observe(root, { childList: true });
    for (const t of ["play", "playing", "pause", "ratechange", "ended", "seeked", "loadeddata", "canplaythrough"]) document.addEventListener(t, (e) => { if (e.target.tagName === "VIDEO") window.__ev.push([performance.now(), `${t} ${nm(e.target)}${t === "ratechange" ? " " + e.target.playbackRate.toFixed(2) : ""}`]); }, true);
    window.__fr = [];
    let last = performance.now();
    const loop = (now) => {
      const s = window.__ml.stats();
      window.__fr.push([Math.round((now - last) * 10) / 10, s.flying ? 1 : 0, s.shot, Math.round(now)]);
      last = now;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
const tag = `${phone ? "phone" : "laptop"}${net ? ` ${net} Mbps/${lat} ms` : ""}${dpr !== 1 ? ` dpr ${dpr}` : ""}`;

if (mode === "walk") {
  const { ctx, page } = await open();
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => { const s = window.__ml?.stats(); return s && s.revealAt != null && s.drawn > 0; }, null, { timeout: 60000 });
  await page.waitForTimeout(Number(arg("rest", 1500)));
  await frameLogger(page);
  const stops = await page.evaluate(() => window.__ml.stops());
  const t0 = await page.evaluate(() => performance.now());
  const scrolls = [];
  // Each stop once: the page's own stops, a repeated one (a section holding its shot) walked once.
  for (const s of stops.filter((x, i) => i === 0 || x.name !== stops[i - 1].name)) {
    const t = await page.evaluate((y) => { window.scrollTo({ top: y, behavior: "auto" }); return performance.now(); }, s.anchor);
    scrolls.push({ t: Math.round(t), name: s.name });
    await page.waitForTimeout(dwell);
  }
  await page.waitForTimeout(3500);
  const f = await films(page);
  const fr = await page.evaluate(() => window.__fr);
  const log = f.log.filter((l) => l.at >= t0);
  console.log(`WALK ${tag}: films ${log.filter((l) => l.kind === "film").length}, fades ${log.filter((l) => l.kind === "fade").length}`);
  const ev = [...scrolls.map((s) => ({ t: s.t, s: `page -> ${s.name}` })), ...log.map((l) => ({ t: l.at, s: `     ${l.kind.padEnd(4)} ${l.key}${l.why ? `   [${l.why}]` : ""}` }))].sort((a, b) => a.t - b.t);
  for (const e of ev) console.log(`${String(Math.round(e.t - t0)).padStart(6)}  ${e.s}`);
  const over = fr.filter((x) => x[0] > 34);
  console.log(`frames ${fr.length}, over 34 ms: ${over.length}, max ${Math.max(...fr.map((x) => x[0]))} ms`);
  const evs = await page.evaluate(() => window.__ev);
  for (const o of over) {
    const near = evs.filter((e) => e[0] >= o[3] - o[0] - 60 && e[0] <= o[3] + 5).map((e) => `${Math.round(e[0] - t0)} ${e[1]}`);
    console.log(`   ${o[0]} ms at ${Math.round(o[3] - t0)} (${o[1] ? "flying to" : "still at"} ${o[2]})${near.length ? "   near: " + near.join("; ") : ""}`);
  }
  if (process.argv.includes("--events")) for (const e of evs) console.log(`      ev ${Math.round(e[0] - t0)} ${e[1]}`);
  if (process.argv.includes("--res")) {
    const res = await page.evaluate(() => performance.getEntriesByType("resource").filter((r) => /\/(flights|plates)\//.test(r.name)).map((r) => [r.name.split("/").pop(), Math.round(r.startTime), Math.round(r.responseEnd), r.transferSize, r.initiatorType]));
    for (const r of res) console.log(`      res ${String(r[1] - Math.round(t0)).padStart(6)} -> ${String(r[2] - Math.round(t0)).padStart(6)} (${r[2] - r[1]} ms) ${r[0]} ${Math.round(r[3] / 1024)} KB ${r[4]}`);
  }
  await ctx.close();
} else if (mode === "first") {
  for (const d of arg("delays", "1000,2000,4000").split(",").map(Number)) {
    const { ctx, page } = await open();
    await page.evaluate(() => 0).catch(() => {});
    await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => performance.setResourceTimingBufferSize(2000));
    await reveal(page);
    await page.waitForTimeout(d);
    const stops = await page.evaluate(() => window.__ml.stops());
    const first = stops.find((s) => s.name !== stops[0].name);
    const t = await page.evaluate((y) => { window.scrollTo({ top: y, behavior: "auto" }); return performance.now(); }, first.anchor);
    await page.waitForTimeout(Number(arg("after", 4000)));
    const f = await films(page);
    const rev = await page.evaluate(() => Math.round(performance.getEntriesByName("ml:reveal")[0].startTime));
    const mk = await page.evaluate(() => `load ${Math.round(performance.getEntriesByType("navigation")[0]?.loadEventEnd ?? -1)} lights ${Math.round(performance.getEntriesByName("ml:lights")[0]?.startTime ?? -1)} films-open ${Math.round(performance.getEntriesByName("ml:films-open")[0]?.startTime ?? -1)}`);
    const l = f.log.find((x) => x.at >= t);
    console.log(`FIRST ${tag} +${d} ms after reveal (reveal at ${rev} ms, ${mk}, scroll at ${Math.round(t)}):${l ? `${l.kind} ${l.key}${l.why ? ` [${l.why}]` : ""} at +${Math.round(l.at - t)} ms` : "nothing"}; ready then ${JSON.stringify(f.ready)}`);
    if (process.argv.includes("--res")) {
      const res = await page.evaluate(() => performance.getEntriesByType("resource").filter((r) => /\/(flights|plates)\/|lights/.test(r.name)).map((r) => [r.name.split("/").pop().slice(0, 50), Math.round(r.startTime), Math.round(r.responseEnd), r.transferSize]));
      for (const r of res) console.log(`      res ${String(r[1]).padStart(6)} -> ${String(r[2]).padStart(6)} ${r[0]} ${Math.round(r[3] / 1024)} KB`);
      console.log(`      stops ${JSON.stringify((await page.evaluate(() => window.__ml.stats().stops)).map((s) => [s.shot, s.startedAt, s.landedAt]))}`);
    }
    await ctx.close();
  }
} else if (mode === "back") {
  // Down the page stop by stop, resting at each (a reader), then ONE stop back up: the first move
  // back (the films behind are only fetched once the visitor turns). Then a jump of two stops down
  // and one of three (a wheel that crosses stops before it rests: the route).
  const { ctx, page } = await open();
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  await reveal(page);
  await page.waitForTimeout(2500);
  const stops = await page.evaluate(() => window.__ml.stops());
  const at = (n) => stops.find((s) => s.name === n).anchor;
  const go = async (n, ms) => { await page.evaluate((y) => window.scrollTo(0, y), at(n)); await page.waitForTimeout(ms); };
  for (const n of ["dutchess", "highlands", "westchester", "ulster"]) await go(n, 3500);
  const moves = [["westchester", "back up one"], ["orange", "down three"], ["westchester-county", "down three"], ["putnam", "up two"]];
  for (const [n, what] of moves) {
    const t = await page.evaluate(() => performance.now());
    await go(n, 4500);
    const f = await films(page);
    const l = f.log.filter((x) => x.at >= t);
    console.log(`BACK ${tag} ${what} -> ${n}: ${l.map((x) => `${x.kind} ${x.key}${x.why ? ` [${x.why}]` : ""}`).join(", ") || "nothing"}`);
  }
  await ctx.close();
} else if (mode === "reveal") {
  const { ctx, page, cdp } = await open();
  const dir = `scripts/_scratch-r65/reveal-${W}`;
  fs.mkdirSync(dir, { recursive: true });
  await page.addInitScript(() => {
    window.__rv = [];
    const loop = () => {
      const slot = document.querySelector("[data-plate-slot='0']");
      const img = slot?.querySelector("img");
      const cv = slot?.querySelector("canvas");
      window.__rv.push([Math.round(performance.now()), img ? (img.complete && img.naturalWidth > 0 ? 1 : 0) : -1, slot ? getComputedStyle(slot).opacity : "-", cv ? getComputedStyle(cv).opacity : "-", window.__ml?.stats?.().drawn ?? -1]);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
  const shots = [];
  cdp.on("Page.screencastFrame", async (e) => { shots.push({ ts: e.metadata.timestamp, data: e.data }); await cdp.send("Page.screencastFrameAck", { sessionId: e.sessionId }).catch(() => {}); });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 80, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await cdp.send("Page.stopScreencast");
  const rv = await page.evaluate(() => window.__rv);
  const marks = await page.evaluate(() => Object.fromEntries(["ml:first-paint", "ml:reveal", "ml:lights"].map((n) => [n, Math.round(performance.getEntriesByName(n)[0]?.startTime ?? -1)]).concat([["fcp", Math.round(performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? -1)]])));
  console.log(`REVEAL ${tag}: marks ${JSON.stringify(marks)}`);
  let prev = "";
  for (const r of rv) { const k = r.slice(1, 4).join(" ") + (r[4] > 0 ? " lit" : ""); if (k !== prev) { console.log(`  ${String(r[0]).padStart(5)} ms  img ${r[1]} slot ${r[2]} lights-canvas ${r[3]} drawn ${r[4]}`); prev = k; } }
  const t0 = shots[0]?.ts ?? 0;
  shots.forEach((s, i) => { if (i % 3 === 0 || i < 12) fs.writeFileSync(`${dir}/f${String(Math.round((s.ts - t0) * 1000)).padStart(5, "0")}.jpg`, Buffer.from(s.data, "base64")); });
  console.log(`  ${shots.length} screencast frames saved (every 3rd) to ${dir}`);
  await ctx.close();
}
await browser.close();
