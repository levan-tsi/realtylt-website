/** Round 15 probe: the two blog pages on a production build, six widths, the quiz driven
 * through a fail and a pass, the no-JS quiz, and the removed post's redirect.
 *
 *   node docs/blog-r15/probe.mjs http://127.0.0.1:3108 docs/blog-r15/shots
 *
 * Extends docs/blog-r14/probe.mjs: the same facts per page (console errors, horizontal overflow,
 * every scene element inside the right edge, hidden reveals, the smallest text in a scene, the
 * contents sheet), at 320, 390, 768, 1024, 1280 and 1440. Frames are PNG here; the round's notes
 * convert the ones worth keeping to small JPGs. */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = process.argv[2] ?? "http://127.0.0.1:3108";
const out = process.argv[3] ?? "docs/blog-r15/shots";
fs.mkdirSync(out, { recursive: true });
const SLUGS = [
  ["seller", "seller-disclosure-requirements-new-york"],
  ["ai", "ai-audit-small-business-what-not-to-automate"],
];
const WIDTHS = [320, 390, 768, 1024, 1280, 1440];
const QUIZ = '[aria-label="Quiz: what did you learn"]';

const browser = await chromium.launch();
const report = [];

async function walk(page, h) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += Math.round(h * 0.7)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(500);
}

for (const [short, slug] of SLUGS) {
  for (const w of WIDTHS) {
    const h = w < 800 ? 844 : 900;
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.route("**/api/media/**", (r) => r.abort());
    await page.route("**/api/lead**", (r) => r.fulfill({ status: 200, body: "{}" }));
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
        for (const el of s.querySelectorAll("p, span, li, a, button, summary, h2, h3")) {
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
      const words = (document.querySelector("#article-root")?.innerText ?? "").split(/\s+/).filter(Boolean).length;
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        scenes: scenes.length,
        sceneIds: scenes.map((s) => s.id),
        hiddenReveals,
        minFont,
        minAt,
        wide,
        h2: document.querySelectorAll("#article-root h2").length,
        words,
        heroPhoto: document.querySelector(".cold-open-photo img")?.getAttribute("src") ?? null,
      };
    });
    if (w === 390 || w === 1440) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(out, `${short}-${w}-top.png`) });
    }
    if (short === "ai" && w === 390) {
      // One frame per scene, with the fixed chrome hidden, so each reads on its own.
      await page.evaluate(() => {
        for (const el of document.querySelectorAll("body *"))
          if (getComputedStyle(el).position === "fixed") el.style.visibility = "hidden";
      });
      await page.addStyleTag({ content: "[data-toc-trigger]{visibility:hidden !important}" });
      for (const id of facts.sceneIds) {
        const el = page.locator(`#${id}`);
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(350);
        await el.screenshot({ path: path.join(out, `ai-390-${id}.png`) });
      }
    }
    if (short === "ai" && (w === 1024 || w === 1280 || w === 1440)) {
      for (const id of ["scene-by-firm-size", "scene-the-person-stays", "scene-who-uses-ai"]) {
        const el = page.locator(`#${id}`);
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        await el.screenshot({ path: path.join(out, `ai-${w}-${id}.png`) });
      }
    }
    report.push({ slug, width: w, status: resp?.status(), errors, ...facts, sceneIds: undefined });
    await ctx.close();
  }
}

/* ── The quiz, driven. First run: tap the first choice every time (a learning run that also
   records the right answer each question reveals); it is expected to fail. Second run: tap the
   recorded right answers, which must pass. Frames at 390, and the pass at 1440. ───────────── */
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
    if (i === 0 && shots) await quiz.screenshot({ path: path.join(out, `${tag}-answered.png`) });
    await live.locator("[data-quiz-next]").click();
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(1800);
  const result = quiz.locator("[data-quiz-result]");
  const state = await result.getAttribute("data-quiz-result");
  const score = await result.locator("[data-quiz-score]").innerText();
  const focused = await page.evaluate(() => document.activeElement?.tagName + ":" + document.activeElement?.textContent?.slice(0, 40));
  if (shots) await quiz.screenshot({ path: path.join(out, `${tag}-result.png`) });
  return { state, score, learned, focused };
}

{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.route("**/api/media/**", (r) => r.abort());
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${base}/blog/ai-audit-small-business-what-not-to-automate`, { waitUntil: "networkidle" });
  await page.locator(QUIZ).scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body *"))
      if (getComputedStyle(el).position === "fixed") el.style.visibility = "hidden";
  });
  await page.addStyleTag({ content: "[data-toc-trigger]{visibility:hidden !important}" });
  const count = await page.locator(`${QUIZ} [data-quiz-count]`).innerText();
  const tap = await page.locator(`${QUIZ} button[data-choice]`).first().boundingBox();
  const fontPx = await page.locator(`${QUIZ} button[data-choice]`).first().evaluate((b) => getComputedStyle(b).fontSize);
  // Learning run: the first choice each time.
  const first = await runQuiz(page, () => 0, "quiz-390-run1", true);
  let fail = first.state === "fail" ? first : null;
  // Pass run.
  const again = page.locator(`${QUIZ} button`, { hasText: /Try again|Take it again/ });
  await again.first().click();
  await page.waitForTimeout(300);
  const pass = await runQuiz(page, (q, texts) => texts.findIndex((t) => t.includes(first.learned[q])), "quiz-390-pass", true);
  const passLink = await page.locator(`${QUIZ} [data-quiz-result] a`).evaluateAll((as) => as.map((a) => `${a.textContent} -> ${a.getAttribute("href")}`));
  if (!fail) {
    await page.locator(`${QUIZ} button`, { hasText: "Take it again" }).click();
    await page.waitForTimeout(300);
    fail = await runQuiz(page, (q, texts) => texts.findIndex((t) => !t.includes(first.learned[q])), "quiz-390-fail", true);
  } else {
    fs.copyFileSync(path.join(out, "quiz-390-run1-result.png"), path.join(out, "quiz-390-fail-result.png"));
  }
  report.push({ quiz: "390", count, tapTarget: tap && `${Math.round(tap.width)}x${Math.round(tap.height)}`, fontPx, fail: { state: fail.state, score: fail.score, focus: fail.focused }, pass: { state: pass.state, score: pass.score, focus: pass.focused, link: passLink }, errors });

  // The pass at 1440, and the pass with reduced motion (the static, finished frame).
  for (const [tag, opts] of [["quiz-1440-pass", { viewport: { width: 1440, height: 900 } }], ["quiz-390-pass-reduced", { viewport: { width: 390, height: 844 }, reducedMotion: "reduce" }]]) {
    const c2 = await browser.newContext(opts);
    const p2 = await c2.newPage();
    await p2.route("**/api/media/**", (r) => r.abort());
    await p2.goto(`${base}/blog/ai-audit-small-business-what-not-to-automate`, { waitUntil: "networkidle" });
    await p2.locator(QUIZ).scrollIntoViewIfNeeded();
    await p2.evaluate(() => {
      for (const el of document.querySelectorAll("body *"))
        if (getComputedStyle(el).position === "fixed") el.style.visibility = "hidden";
    });
    await p2.addStyleTag({ content: "[data-toc-trigger]{visibility:hidden !important}" });
    const r = await runQuiz(p2, (q, texts) => texts.findIndex((t) => t.includes(first.learned[q])), tag, false);
    await p2.waitForTimeout(400);
    await p2.locator(QUIZ).screenshot({ path: path.join(out, `${tag}.png`) });
    report.push({ quiz: tag, state: r.state, score: r.score });
    await c2.close();
  }
  await ctx.close();
}

/* ── With JavaScript off: the quiz is a list with every answer in a <details>. */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(`${base}/blog/ai-audit-small-business-what-not-to-automate`, { waitUntil: "load" });
  const nojs = await page.evaluate((sel) => {
    const q = document.querySelector(sel);
    return {
      list: !!q?.querySelector("[data-quiz-list]"),
      items: q?.querySelectorAll("[data-quiz-list] > li").length ?? 0,
      details: q?.querySelectorAll("details").length ?? 0,
      visible: q ? getComputedStyle(q).visibility : "missing",
    };
  }, QUIZ);
  await page.locator(`${QUIZ} details`).first().evaluate((d) => (d.open = true));
  await page.locator(QUIZ).screenshot({ path: path.join(out, "quiz-390-nojs.png") });
  report.push({ nojs });
  await ctx.close();
}

/* ── The removed post: a permanent redirect to the blog, and the two free files. */
{
  const ctx = await browser.newContext();
  const r = await ctx.request.get(`${base}/blog/skip-tracing-real-estate-legal-owner-phone-numbers`, { maxRedirects: 0 });
  report.push({ removed: "skip tracing", status: r.status(), location: r.headers()["location"] });
  for (const f of ["/downloads/seller-disclosure-prep-sheet-ny.pdf", "/downloads/three-question-sheet.pdf"]) {
    const res = await ctx.request.get(`${base}${f}`);
    report.push({ file: f, status: res.status(), type: res.headers()["content-type"], bytes: (await res.body()).length });
  }
  const sm = await ctx.request.get(`${base}/sitemap.xml`);
  const xml = await sm.text();
  report.push({ sitemapUrls: (xml.match(/<loc>/g) ?? []).length, sitemapHasSkip: xml.includes("skip-tracing-real-estate") });
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(out, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 1));
