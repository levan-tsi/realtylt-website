// REGRESSION GUARD for the media-host burst (2026-07-26).
//
// Opening a 48-photo gallery used to fire ~48 concurrent /api/media requests. The MLS media host
// answered HTTP 429, our route turned each 429 into a placeholder, and the burst spilled onto OTHER
// listings' cover photos requested in the same second. So a share of the owner's "random coming
// soon logos" was manufactured by our own request pattern, on an account already at suspension
// risk. lib/idx/media-queue caps every listing photo request at 6 in flight; this proves it in a
// real browser on each path that used to burst, each in its own fresh context so a warm HTTP cache
// cannot hide the problem.
//
// Usage: BASE=http://127.0.0.1:3100 ID=KEY1028297 node scripts/verify-media-burst.mjs
// Exits non-zero if any pass exceeds the cap.
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://127.0.0.1:3100";
const ID = process.env.ID ?? "KEY1028297";
// The queue's own cap. Nothing in this codebase should raise it; if you are here because the
// assertion failed, fix the caller, not this number.
const CAP = Number(process.env.CAP ?? 6);

const browser = await chromium.launch();

async function pass(name, drive) {
  // Fresh context per pass: a warm cache would silently pass a burst that a real visitor triggers.
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  let inflight = 0;
  let peak = 0;
  let total = 0;
  page.on("request", (r) => {
    if (!r.url().includes("/api/media/")) return;
    inflight++;
    total++;
    peak = Math.max(peak, inflight);
  });
  const settle = (r) => {
    if (r.url().includes("/api/media/")) inflight = Math.max(0, inflight - 1);
  };
  page.on("requestfinished", settle);
  page.on("requestfailed", settle);

  await page.goto(`${BASE}/listing/${ID}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(8000);
  const afterPaint = total;
  const note = await drive(page);
  await page.waitForTimeout(12000);
  await ctx.close();

  const ok = peak <= CAP;
  console.log(
    `${ok ? "PASS" : "FAIL"} ${name.padEnd(22)} peak=${peak} (cap ${CAP})  paint=${afterPaint} req, +${total - afterPaint} on interaction${note ? "  " + note : ""}`,
  );
  return ok;
}

const results = [];

results.push(await pass("first paint only", async () => null));

results.push(
  await pass("no-JS grid opened", async (page) => {
    const n = await page.evaluate(() => {
      let opened = 0;
      document.querySelectorAll("details").forEach((d) => {
        d.open = true;
        opened++;
      });
      return opened;
    });
    return `(${n} disclosure(s))`;
  }),
);

results.push(
  await pass("lightbox + rail", async (page) => {
    await page.evaluate(() => {
      const el = document.querySelector("[data-lightbox-index]");
      if (el instanceof HTMLElement) el.click();
    });
    await page.waitForTimeout(1500);
    const open = await page.evaluate(() => !!document.querySelector('[role="dialog"][aria-modal="true"]'));
    await page.evaluate(async () => {
      const rails = document.querySelectorAll('[role="dialog"] div');
      for (const rail of rails) {
        if (rail.scrollHeight <= rail.clientHeight && rail.scrollWidth <= rail.clientWidth) continue;
        for (let i = 0; i < 10; i++) {
          rail.scrollTop += 500;
          rail.scrollLeft += 500;
          await new Promise((r) => setTimeout(r, 200));
        }
      }
    });
    return open ? "(viewer opened)" : "(VIEWER DID NOT OPEN)";
  }),
);

await browser.close();
const ok = results.every(Boolean);
console.log(`\n${ok ? "PASS" : "FAIL"} — media concurrency stays within ${CAP} on every path.`);
if (!ok) console.error("Concurrency cap breached. See lib/idx/media-queue.ts — do NOT raise the cap.");
process.exit(ok ? 0 : 1);
