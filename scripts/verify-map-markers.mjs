// Round 23 §1: measure the pin/cluster ratio and every chip's text at default zoom,
// then at one and two zooms in — the owner's complaint is "a lot of circles instead of
// prices" and "on the new it says NEW instead of price". Count both, dump chip texts.
import { chromium } from "playwright";

const base = (process.env.BASE ?? "http://localhost:3100").replace(/\/+$/, "");
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
await c.route("**/api/media/**", (r) => r.abort());
const p = await c.newPage();

await p.goto(base + "/search", { waitUntil: "domcontentloaded", timeout: 60000 });
await p.waitForTimeout(14000); // map load + viewport pin fetch (dev pins query ~8s)

const snap = () =>
  p.evaluate(() => {
    const chips = [...document.querySelectorAll(".rlt-price-chip")];
    const bubbles = [...document.querySelectorAll(".rlt-map-dot")];
    return {
      chips: chips.length,
      bubbles: bubbles.length,
      chipTexts: chips.map((c) => c.textContent?.trim()).slice(0, 40),
      bubbleTexts: bubbles.map((c) => c.textContent?.trim()).slice(0, 40),
      zoom: (() => {
        // read zoom from the gm container's aria — not exposed; approximate via url? skip.
        return null;
      })(),
    };
  });

console.log("default:", JSON.stringify(await snap(), null, 1));
await p.screenshot({ path: "scripts/_scratch-r23/map-default.png" });

// zoom in twice with the wheel over the map centre
const map = p.locator(".gm-style").first();
const box = await map.boundingBox();
if (box) {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  for (const label of ["zoom+1", "zoom+2"]) {
    await p.mouse.move(cx, cy);
    await p.mouse.wheel(0, -240);
    await p.waitForTimeout(9000);
    console.log(label + ":", JSON.stringify(await snap(), null, 1));
  }
  await p.screenshot({ path: "scripts/_scratch-r23/map-zoom2.png" });
}
await b.close();
