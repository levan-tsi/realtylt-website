/* Verify the service-page table of contents end-to-end in a real browser.
 * Usage: node scripts/verify-services-toc.mjs [baseUrl]
 * Desktop (1440): rail is on the LEFT, scroll-spies the right section, hover expands labels,
 * a click jumps and lands the section un-hidden, focus reveals labels. Mobile (390): pill +
 * bottom sheet open and jump. Plus a blog regression pass (the shared scroll-spy still works).
 * Writes screenshots to docs/services-toc/ and prints PASS/FAIL. */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.argv[2] || "http://localhost:3000";
const OUT = "docs/services-toc";
await mkdir(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
const check = (ok, name, detail = "") => {
  results.push([ok, name, detail]);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `   [${detail}]` : ""}`);
};

const browser = await chromium.launch();

const SERVICES = [
  ["workflow", "/services/workflow-automation"],
  ["voice", "/services/ai-voice-agents"],
];

async function fullPageAudit(page, label, name) {
  // trip reveals so nothing is mid-fade
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 20));
    }
    window.scrollTo(0, 0);
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    await new Promise((r) => setTimeout(r, 300));
  });
  return page.evaluate(() => {
    const de = document.documentElement;
    const out = { overflow: null, tiny: [], jsonld: [], h1: 0, textTell: [] };
    if (de.scrollWidth > de.clientWidth + 1) {
      out.overflow = { sw: de.scrollWidth, cw: de.clientWidth };
      out.culprits = [...document.querySelectorAll("body *")]
        .filter((el) => el.getBoundingClientRect().right > de.clientWidth + 1)
        .slice(0, 6)
        .map((el) => `${el.tagName.toLowerCase()}.${(el.className || "").toString().slice(0, 50)}`);
    }
    const main = document.querySelector("main") || document.body;
    for (const el of main.querySelectorAll("a, button, summary, input, select, textarea")) {
      if (el.closest("header, footer")) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.width <= 1 && r.height <= 1) continue;
      const inline = el.tagName === "A" && /^(P|LI|BLOCKQUOTE)$/.test(el.parentElement?.tagName || "");
      if (inline) continue;
      if (r.height < 24 || r.width < 24)
        out.tiny.push(`${el.tagName.toLowerCase()} "${(el.textContent || "").trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
    for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
      try { out.jsonld.push(JSON.parse(s.textContent)["@type"]); }
      catch (e) { out.jsonld.push(`PARSE ERROR ${e.message}`); }
    }
    out.h1 = document.querySelectorAll("h1").length;
    for (const m of document.body.innerText.matchAll(/.{0,20}[—–→].{0,20}/g)) out.textTell.push(m[0]);
    return out;
  });
}

// ─────────────────────────────── DESKTOP 1440 ───────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  for (const [name, path] of SERVICES) {
    const page = await ctx.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });

    const audit = await fullPageAudit(page, "1440", name);
    check(!audit.overflow, `1440 ${name}: no horizontal overflow`, audit.overflow ? `${audit.overflow.sw}>${audit.overflow.cw} :: ${(audit.culprits || []).join(", ")}` : "");
    check(audit.tiny.length === 0, `1440 ${name}: no sub-24px targets`, audit.tiny.slice(0, 4).join(" | "));
    check(audit.h1 === 1, `1440 ${name}: exactly one h1`, `h1=${audit.h1}`);
    check(audit.jsonld.length >= 3 && audit.jsonld.includes("Service") && audit.jsonld.includes("FAQPage") && audit.jsonld.includes("BreadcrumbList"), `1440 ${name}: Service+FAQPage+BreadcrumbList JSON-LD intact`, audit.jsonld.join(","));
    check(audit.textTell.length === 0, `1440 ${name}: no em-dash / arrow tells`, audit.textTell.slice(0, 2).join(" | "));

    // Rail is present and positioned on the LEFT half of the viewport.
    const railBox = await page.$eval("nav[data-toc]", (el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, visible: getComputedStyle(el).display !== "none" };
    });
    check(railBox.visible && railBox.right < 720, `1440 ${name}: rail renders on the LEFT`, `left=${Math.round(railBox.left)} right=${Math.round(railBox.right)}`);

    // Screenshot: resting rail at top of page.
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(200);
    await page.screenshot({ path: `${OUT}/${name}-1440-top.png` });

    // Scroll-spy: at each section, the active rail row should be that section.
    const spy = [];
    for (const [id, expect] of [["how-it-works", "How it works"], ["use-cases", "Use cases"], ["faq", "FAQ"]]) {
      await page.evaluate((sid) => {
        const el = document.getElementById(sid);
        window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 40);
      }, id);
      await sleep(350);
      const active = await page.$eval("nav[data-toc]", (nav) => {
        const a = nav.querySelector('a[aria-current="location"]');
        return a ? a.textContent.trim() : "(none)";
      });
      spy.push(`${id}->${active}`);
      check(active === expect, `1440 ${name}: scroll-spy marks "${expect}"`, active);
    }

    // Hover expands the labels.
    await page.hover("nav[data-toc]");
    await sleep(350);
    const labelVisible = await page.$eval("nav[data-toc] ul li:nth-child(2) a > span:last-child", (el) => {
      const r = el.getBoundingClientRect();
      return r.width > 20 && parseFloat(getComputedStyle(el).opacity) > 0.5;
    });
    check(labelVisible, `1440 ${name}: hover expands rail labels`);
    await page.screenshot({ path: `${OUT}/${name}-1440-hover.png`, clip: { x: 0, y: 260, width: 460, height: 360 } });

    // Click a rail row -> jumps, lands the section un-hidden, updates the hash.
    await page.hover("nav[data-toc]");
    await sleep(200);
    await page.click('nav[data-toc] a:has-text("Use cases")');
    await sleep(1100);
    const landed = await page.evaluate(() => {
      const el = document.getElementById("use-cases");
      return { top: Math.round(el.getBoundingClientRect().top), hash: location.hash };
    });
    check(landed.top >= 60 && landed.top <= 130, `1440 ${name}: click lands "Use cases" un-hidden (scroll-mt)`, `top=${landed.top}px`);
    check(landed.hash === "#use-cases", `1440 ${name}: hash updates on jump`, landed.hash);
    await page.screenshot({ path: `${OUT}/${name}-1440-jumped.png` });

    // Keyboard focus reveals the labels (focus-within) and shows a focus ring.
    await page.evaluate(() => window.scrollTo(0, 1200));
    await sleep(200);
    await page.focus("nav[data-toc] ul li:first-child a");
    await sleep(300);
    const focusReveals = await page.$eval("nav[data-toc] ul li:first-child a > span:last-child", (el) => el.getBoundingClientRect().width > 20);
    check(focusReveals, `1440 ${name}: keyboard focus reveals rail labels`);
    await page.screenshot({ path: `${OUT}/${name}-1440-focus.png`, clip: { x: 0, y: 260, width: 460, height: 360 } });

    check(errors.length === 0, `1440 ${name}: zero console errors`, errors.slice(0, 2).join(" | "));
    await page.close();
  }
  await ctx.close();
}

// ─────────────────────────────── MOBILE 390 ───────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  for (const [name, path] of SERVICES) {
    const page = await ctx.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });

    const audit = await fullPageAudit(page, "390", name);
    check(!audit.overflow, `390 ${name}: no horizontal overflow`, audit.overflow ? `${audit.overflow.sw}>${audit.overflow.cw} :: ${(audit.culprits || []).join(", ")}` : "");
    check(audit.tiny.length === 0, `390 ${name}: no sub-24px targets`, audit.tiny.slice(0, 4).join(" | "));

    // The desktop rail must be hidden here.
    const railHidden = await page.$eval("nav[data-toc]", (el) => getComputedStyle(el).display === "none");
    check(railHidden, `390 ${name}: desktop rail hidden`);

    // Pill visible after scrolling into the body.
    await page.evaluate(() => window.scrollTo(0, 1400));
    await sleep(500);
    const pill = await page.$("[data-toc-trigger]");
    check(!!pill, `390 ${name}: "On this page" pill present`);
    await page.screenshot({ path: `${OUT}/${name}-390-pill.png` });

    if (pill) {
      await pill.click();
      await sleep(500);
      const sheetLinks = await page.$$('[role="dialog"] a');
      check(sheetLinks.length >= 4, `390 ${name}: bottom sheet lists sections`, `${sheetLinks.length} links`);
      await page.screenshot({ path: `${OUT}/${name}-390-sheet.png` });

      const yBefore = await page.evaluate(() => window.scrollY);
      await sheetLinks[sheetLinks.length - 1].click(); // FAQ
      // Wait for the smooth scroll to settle (two equal readings) before measuring.
      await page.evaluate(async () => {
        let last = -1;
        for (let i = 0; i < 25; i++) {
          const y = Math.round(window.scrollY);
          if (y === last) return;
          last = y;
          await new Promise((r) => setTimeout(r, 120));
        }
      });
      const after = await page.evaluate(() => ({
        y: window.scrollY,
        open: !!document.querySelector('[role="dialog"]'),
        faqTop: Math.round(document.getElementById("faq").getBoundingClientRect().top),
      }));
      check(Math.abs(after.y - yBefore) > 100 && after.faqTop >= 40 && after.faqTop <= 140, `390 ${name}: sheet jump lands FAQ`, `y ${yBefore}->${after.y}, faqTop ${after.faqTop}`);
      check(!after.open, `390 ${name}: sheet closes after jump`);
    }

    check(errors.length === 0, `390 ${name}: zero console errors`, errors.slice(0, 2).join(" | "));
    await page.close();
  }
  await ctx.close();
}

// ─────────────────────────────── BLOG REGRESSION 1440 ───────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  await page.goto(`${BASE}/blog/ai-chat-assistant-real-estate-website`, { waitUntil: "networkidle" });

  const hasRail = await page.$("nav[data-toc]");
  check(!!hasRail, `1440 blog: article ToC rail still present`);
  if (hasRail) {
    // scroll mid-article, expect an active row; click a different row, expect a jump.
    await page.evaluate(() => window.scrollTo(0, 1800));
    await sleep(400);
    const active1 = await page.$eval("nav[data-toc]", (n) => n.querySelector('a[aria-current="location"]')?.textContent.trim() || "(none)");
    const links = await page.$$("nav[data-toc] a");
    const yBefore = await page.evaluate(() => window.scrollY);
    await links[links.length - 1].click();
    await sleep(1000);
    const yAfter = await page.evaluate(() => window.scrollY);
    check(active1 !== "(none)", `1440 blog: scroll-spy marks a section`, active1);
    check(Math.abs(yAfter - yBefore) > 100, `1440 blog: ToC click jumps`, `y ${yBefore}->${yAfter}`);
  }
  check(errors.length === 0, `1440 blog: zero console errors`, errors.slice(0, 2).join(" | "));
  await page.screenshot({ path: `${OUT}/blog-1440.png` });
  await page.close();
  await ctx.close();
}

await browser.close();
const fail = results.filter(([ok]) => !ok).length;
console.log(`\n${results.length - fail}/${results.length} passed`);
process.exit(fail ? 1 : 0);
