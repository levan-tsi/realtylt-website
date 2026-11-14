/** Round 22 probe: round 21's, on three pages (the investing guide with its new hero, the selling
 * timeline without its "in our experience" ranges, and the renovations page that replaced the last
 * stub), on a production build, at 320, 390, 1440 (plus 1680 where the rail renders):
 *
 *   node docs/blog-r22/probe.mjs http://127.0.0.1:3110 docs/blog-r22/shots
 *
 * Added in round 22: the robots meta (the renovations page must no longer be noindex), the cover
 * and cold-open photo, "(914) 875-2424" on the page, vendor and model names, "in our experience"
 * and "our own" phrasing, and the renovations calculator's headline.
 *
 * Per page and width: HTTP status, console errors, horizontal overflow, every scene element inside
 * the right edge, hidden reveals, the smallest text in a scene, the opener as the first prose.
 * Frames: the top at 320, 390 and 1440, every scene at 390, the quiz (fail and pass) at 390, the
 * author card and the footer. Then the rail at 1680 and the phone sheet (rows, none twice), the
 * reading time in the cold open, H2/H3/scene counts, the author card once, the footer's contact
 * lines, "Apply it" and "broker" on the page, the quiz with JavaScript off, the calculator's
 * headline moving with its slider, and the rail-tone drive (docs/blog-r16/tone-drive.mjs). */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { toneDrive } from "../blog-r16/tone-drive.mjs";

const base = process.argv[2] ?? "http://127.0.0.1:3110";
const out = process.argv[3] ?? "docs/blog-r29/shots";
fs.mkdirSync(out, { recursive: true });
// Round 24: one page per branch, so the page is named on the command line:
// PROBE_SLUGS="wf:workflow-automation-real-estate-business" PROBE_CALC="wf:workflow-automation-real-estate-business:scene-busywork-calculator"
const SLUGS = (process.env.PROBE_SLUGS ?? "").split(",").filter(Boolean).map((s) => s.split(":"));
const CALCS = (process.env.PROBE_CALC ?? "").split(",").filter(Boolean).map((s) => s.split(":"));
const WIDTHS = [320, 390, 1440];
const QUIZ = '[aria-label="Quiz: what did you learn"]';

const browser = await chromium.launch();
const report = [];

async function newPage(opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  await page.route("**/api/media/**", (r) => r.abort());
  await page.route("**/api/lead**", (r) => r.fulfill({ status: 200, body: "{}" }));
  return { ctx, page };
}

async function walk(page, h) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += Math.round(h * 0.7)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(500);
}

async function hideFixed(page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body *"))
      if (getComputedStyle(el).position === "fixed") el.style.visibility = "hidden";
  });
  await page.addStyleTag({ content: "[data-toc-trigger]{visibility:hidden !important}" });
}

for (const [short, slug] of SLUGS) {
  for (const w of WIDTHS) {
    const h = w < 800 ? 844 : 900;
    const { ctx, page } = await newPage({ viewport: { width: w, height: h } });
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    const resp = await page.goto(`${base}/blog/${slug}`, { waitUntil: "networkidle", timeout: 90000 });
    await walk(page, h);
    const facts = await page.evaluate(() => {
      const cw = document.documentElement.clientWidth;
      const scenes = [...document.querySelectorAll('[id^="scene-"]')];
      const hiddenReveals = scenes.flatMap((s) =>
        [...s.querySelectorAll(".reveal")].filter((r) => getComputedStyle(r).opacity !== "1").map(() => s.id),
      );
      let minFont = 99;
      let minAt = "";
      for (const s of scenes) {
        for (const el of s.querySelectorAll("p, span, li, a, button, summary, h2, h3, figcaption, dt, dd")) {
          if (!el.textContent.trim() || el.closest(".sr-only") || el.classList.contains("sr-only")) continue;
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          const f = parseFloat(getComputedStyle(el).fontSize);
          if (f < minFont) ((minFont = f), (minAt = `${s.id}: ${el.textContent.trim().slice(0, 40)}`));
        }
      }
      const wide = scenes
        .map((s) => [s.id, Math.round(Math.max(...[...s.querySelectorAll("*")].map((e) => e.getBoundingClientRect().right)))])
        .filter(([, r]) => r > cw + 0.5);
      // The first paragraph of prose after the cold open: the owner's opener rule.
      const firstP = [...document.querySelectorAll("#article-root p")].find(
        (p) => !p.closest(".cold-open") && !p.closest('[id^="scene-"]') && p.textContent.trim().length > 80,
      );
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        scenes: scenes.length,
        sceneIds: scenes.map((s) => s.id),
        hiddenReveals,
        minFont,
        minAt,
        wide,
        opener: firstP?.textContent.trim().slice(0, 90) ?? null,
      };
    });
    if (w === 320 || w === 390 || w === 1440) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(out, `${short}-${w}-top.png`) });
    }
    if (w === 390) {
      await hideFixed(page);
      for (const id of facts.sceneIds) {
        const el = page.locator(`#${id}`);
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(350);
        await el.screenshot({ path: path.join(out, `${short}-390-${id}.png`) });
      }
      const card = page.locator('aside[aria-label^="About "]');
      if (await card.count()) {
        await card.first().scrollIntoViewIfNeeded();
        await card.first().screenshot({ path: path.join(out, `${short}-390-card.png`) });
      }
      const footer = page.locator("footer").last();
      await footer.scrollIntoViewIfNeeded();
      await footer.screenshot({ path: path.join(out, `${short}-390-footer.png`) });
    }
    if (w === 320) {
      for (const id of facts.sceneIds.filter((i) => /calculator|worth-it|rebuilt|first-month|roadmap|timing|problem|loss|broom|groups|fragmented/.test(i))) {
        await hideFixed(page);
        const el = page.locator(`#${id}`);
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        await el.screenshot({ path: path.join(out, `${short}-320-${id}.png`) });
      }
    }
    report.push({ slug, width: w, status: resp?.status(), errors, ...facts, sceneIds: undefined });
    await ctx.close();
  }
}

/* ── The quiz, driven on both pages at 390: a learning run tapping the first choice (it records
   each right answer the page reveals), then a pass run on the recorded answers, then a fail run
   on wrong answers if the first run passed. ───────────────────────────────────────────────── */
async function runQuiz(page, pick, tag, shots) {
  const quiz = page.locator(QUIZ);
  const learned = {};
  for (let i = 0; i < 20; i++) {
    const live = quiz.locator("[data-quiz-live]");
    if (!(await live.count())) break;
    const q = (await live.locator("h3").innerText()).trim();
    const choices = live.locator("button[data-choice]");
    const texts = await choices.allInnerTexts();
    const k = pick(q, texts);
    if (i === 0 && shots) await quiz.screenshot({ path: path.join(out, `${tag}-question.png`) });
    await choices.nth(k).click();
    await page.waitForTimeout(150);
    const right = await live.locator('button[data-state="right"]').innerText();
    learned[q] = right.replace(/\s*Right answer\s*$/, "").trim();
    await live.locator("[data-quiz-next]").click();
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(1800);
  const result = quiz.locator("[data-quiz-result]");
  const state = await result.getAttribute("data-quiz-result");
  const score = await result.locator("[data-quiz-score]").innerText();
  if (shots) await quiz.screenshot({ path: path.join(out, `${tag}-result.png`) });
  return { state, score, learned };
}

for (const [short, slug] of SLUGS) {
  const { ctx, page } = await newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${base}/blog/${slug}`, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(15000); // dev server: hydration is slow
  await page.locator(QUIZ).scrollIntoViewIfNeeded();
  await hideFixed(page);
  const count = await page.locator(`${QUIZ} [data-quiz-count]`).innerText();
  const tap = await page.locator(`${QUIZ} button[data-choice]`).first().boundingBox();
  const first = await runQuiz(page, () => 0, `${short}-quiz-390-run1`, true);
  let fail = first.state === "fail" ? first : null;
  await page.locator(`${QUIZ} button`, { hasText: /Try again|Take it again/ }).first().click();
  await page.waitForTimeout(300);
  const pass = await runQuiz(page, (q, texts) => texts.findIndex((t) => t.includes(first.learned[q])), `${short}-quiz-390-pass`, true);
  const passLink = await page.locator(`${QUIZ} [data-quiz-result] a`).evaluateAll((as) => as.map((a) => `${a.textContent} -> ${a.getAttribute("href")}`));
  if (!fail) {
    await page.locator(`${QUIZ} button`, { hasText: "Take it again" }).click();
    await page.waitForTimeout(300);
    fail = await runQuiz(page, (q, texts) => texts.findIndex((t) => !t.includes(first.learned[q])), `${short}-quiz-390-fail`, true);
  }
  report.push({ quiz: slug, count, tapTarget: tap && `${Math.round(tap.width)}x${Math.round(tap.height)}`, fail: { state: fail.state, score: fail.score }, pass: { state: pass.state, score: pass.score, link: passLink }, errors });
  await ctx.close();

  // With JavaScript off: the quiz is a list with every answer in a <details>.
  const c2 = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const p2 = await c2.newPage();
  await p2.goto(`${base}/blog/${slug}`, { waitUntil: "load" });
  const nojs = await p2.evaluate((sel) => {
    const q = document.querySelector(sel);
    return { items: q?.querySelectorAll("[data-quiz-list] > li").length ?? 0, details: q?.querySelectorAll("details").length ?? 0 };
  }, QUIZ);
  report.push({ nojs: slug, ...nojs });
  await c2.close();
}

/* ── The calculators: the headline must move with the slider. */
for (const [short, slug, sceneId] of CALCS) {
  const { ctx, page } = await newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${base}/blog/${slug}`, { waitUntil: "networkidle", timeout: 90000 });
  const calc = page.locator(`#${sceneId}`);
  await calc.scrollIntoViewIfNeeded();
  // Round 28: a calculator may end on a count, not dollars (the voice page stops at conversations a year), so every
  // number in the scene is read; the round-24 reader matched "$" only and read an empty string on a count headline.
  const read = () => calc.evaluate((el) => (el.innerText.match(/\$?\d[\d,]*/g) ?? []).join(" "));
  const before = await read();
  const slider = calc.locator('input[type="range"]').first();
  await slider.focus();
  for (let i = 0; i < 20; i++) await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(200);
  const after = await read();
  await hideFixed(page);
  await calc.screenshot({ path: path.join(out, `${short}-390-calculator-moved.png`) });
  report.push({ calculator: slug, before, after, moved: before !== after });
  await ctx.close();
}

/* ── The rail at 1680 and the sheet at 390, and the page-level facts. */
for (const [short, slug] of SLUGS) {
  const { ctx, page } = await newPage({ viewport: { width: 1680, height: 900 } });
  await page.goto(`${base}/blog/${slug}`, { waitUntil: "networkidle", timeout: 90000 });
  const facts = await page.evaluate(() => {
    const text = document.body.innerText;
    const rail = [...document.querySelectorAll("nav[data-toc] a")].map((a) => a.textContent.trim());
    const norm = (l) => l.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\b(a|an|the)\b/g, "").replace(/\s+/g, " ").trim();
    const cold = document.querySelector(".cold-open")?.innerText ?? "";
    const footer = document.querySelector("footer")?.innerText ?? "";
    return {
      railRows: rail.length,
      rail,
      railDuplicates: rail.filter((l, i) => rail.findIndex((m) => norm(m) === norm(l)) !== i),
      minutesShown: (cold.match(/(\d+) min read/) ?? [])[1] ?? null,
      renderedWords: (document.querySelector("#article-root")?.innerText ?? "").split(/\s+/).filter(Boolean).length,
      h2: document.querySelectorAll("#article-root h2").length,
      h3: document.querySelectorAll("#article-root h3").length,
      scenes: document.querySelectorAll('[id^="scene-"]').length,
      authorCards: document.querySelectorAll('aside[aria-label^="About "]').length,
      footerInfo: footer.includes("info@realtylt.com"),
      footerPhone: footer.includes("(914) 415-7185"),
      applyIt: (text.match(/Apply it/gi) ?? []).length,
      broker: (text.match(/broker/gi) ?? []).length,
      editorNotes: (text.match(/Editor:/g) ?? []).length,
      aiLine: text.includes("Written with an AI assistant and checked by Levan."),
      robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null,
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? null,
      coldOpenPhoto: [...document.querySelectorAll(".cold-open img")].map((i) => i.getAttribute("src")).join(" ") || null,
      ownPhone: (text.match(/\(914\) 875-2424/g) ?? []).length,
      retiredPhone: (text.match(/905-7923/g) ?? []).length,
      vendor: (text.match(/\b(OpenAI|Anthropic|Claude|Opus|Sonnet|Gemini|ChatGPT|Zapier|n8n|Vercel|Supabase|ElevenLabs|Twilio|Vapi)\b/g) ?? []),
      inOurExperience: (text.match(/in our experience|our own (sales|transactions)|in our transactions/gi) ?? []).length,
      placeholderText: text.includes("Placeholder draft"),
      emDash: (text.match(/\u2014/g) ?? []).length,
    };
  });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.35));
  await page.waitForTimeout(500);
  await page.locator("nav[data-toc] a").first().focus({ preventScroll: true }).catch(() => {});
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, `${short}-1680-rail-open.png`) });
  await ctx.close();
  const { ctx: c2, page: p2 } = await newPage({ viewport: { width: 390, height: 844 } });
  await p2.goto(`${base}/blog/${slug}`, { waitUntil: "networkidle", timeout: 90000 });
  await p2.waitForTimeout(15000); // dev server: hydration is slow (round 29 probes run against next dev)
  await p2.evaluate(() => window.scrollTo(0, 2400));
  await p2.waitForTimeout(600);
  await p2.locator("[data-toc-trigger]").click();
  await p2.waitForTimeout(400);
  const sheet = (await p2.locator('[role="dialog"][aria-label="On this page"] li a').allInnerTexts()).map((x) => x.trim());
  await p2.screenshot({ path: path.join(out, `${short}-390-sheet.png`) });
  await c2.close();
  report.push({ page: slug, ...facts, sheetRows: sheet.length, sheetMatchesRail: JSON.stringify(sheet) === JSON.stringify(facts.rail) });
  for (const w of [390, 1440, 1680]) {
    const t = await toneDrive(browser, base, slug, w);
    report.push({ toneDrive: slug, width: w, steps: t.steps, lowest: t.minOnCard, under45: t.low.length });
  }
}

await browser.close();
fs.writeFileSync(path.join(out, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 1));
