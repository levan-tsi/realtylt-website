import { chromium } from "playwright";
const [base, slug, from, to, step] = process.argv.slice(2);
const browser = await chromium.launch({ args: ["--disable-features=OverlayScrollbar,OverlayScrollbars"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.route("**/api/media/**", (r) => r.abort());
await page.goto(`${base}/blog/${slug}`, { waitUntil: "networkidle" });
await page.addStyleTag({ content: "::-webkit-scrollbar{width:17px;height:17px;background:#ccc}" });
for (let w = +from; w <= +to; w += +step) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(150);
  const m = await page.evaluate(() => {
    const cw = document.documentElement.clientWidth;
    const bad = [];
    for (const s of document.querySelectorAll('[id^="scene-"]')) for (const e of s.querySelectorAll("*")) {
      const r = e.getBoundingClientRect();
      if (r.width && r.right > cw + 0.5) { bad.push(`${s.id} ${e.tagName} r=${Math.round(r.right)}`); break; }
    }
    return { sw: document.documentElement.scrollWidth, cw, iw: innerWidth, bad };
  });
  if (m.sw > m.cw || m.bad.length || w % 256 === 0) console.log(w, JSON.stringify(m));
}
console.log("done");
await browser.close();
