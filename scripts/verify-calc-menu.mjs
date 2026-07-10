// Verify the mobile menu opens and the mortgage calculator recomputes live.
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3777";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto(`${base}/financing`, { waitUntil: "load" });

// Mobile menu
await page.locator('button[aria-label="Open menu"]').click();
const navVisible = await page.locator('nav[aria-label="Mobile"]').isVisible();
console.log(navVisible ? "OK mobile menu opens" : "FAIL mobile menu");
await page.locator('button[aria-label="Close menu"]').click();

// Calculator default = live worked example
const out = page.locator('p.font-mono.text-5xl');
const def = (await out.textContent())?.trim();
console.log(def === "$3,198.20" ? "OK default $3,198.20" : `FAIL default: ${def}`);

// Recompute on price change: 600000 → $3,677.84
await page.fill("#calc-price", "600000");
await page.waitForTimeout(200);
const next = (await out.textContent())?.trim();
console.log(next === "$3,677.84" ? "OK recompute $3,677.84" : `FAIL recompute: ${next}`);

// Reset restores default
await page.getByRole("button", { name: /Reset/ }).click();
await page.waitForTimeout(200);
const reset = (await out.textContent())?.trim();
console.log(reset === "$3,198.20" ? "OK reset" : `FAIL reset: ${reset}`);

await browser.close();
