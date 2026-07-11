// One-off: extract computed design tokens from the LIVE realtylt.com (Brivity site).
// Usage: node scripts/extract-live-tokens.mjs
import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto("https://realtylt.com", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(3000);

const out = await page.evaluate(() => {
  const cs = (el, props) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    const o = {};
    for (const p of props) o[p] = s.getPropertyValue(p);
    return o;
  };
  const textProps = ["font-family", "font-size", "font-weight", "line-height", "letter-spacing", "color", "text-transform"];
  const boxProps = ["background-color", "border", "border-radius", "padding", "box-shadow"];

  const pick = (sel) => document.querySelector(sel);
  const all = (sel) => [...document.querySelectorAll(sel)];

  // nav links: find header/nav anchors
  const header = pick("header") || pick("nav") || pick("[class*='nav']");
  const navLinks = all("header a, nav a").filter((a) => a.offsetParent && a.textContent.trim().length > 1).slice(0, 12);

  // headings
  const h1 = pick("h1"), h2 = pick("h2"), h3 = pick("h3");
  // body paragraph
  const p = all("p").find((el) => el.offsetParent && el.textContent.trim().length > 40);
  // buttons / CTAs
  const buttons = all("a,button").filter((el) => {
    if (!el.offsetParent) return false;
    const s = getComputedStyle(el);
    return s.backgroundColor !== "rgba(0, 0, 0, 0)" && el.textContent.trim().length > 2 && el.textContent.trim().length < 40;
  }).slice(0, 10);
  // footer
  const footer = pick("footer");
  const footerLink = footer ? footer.querySelector("a") : null;
  // inputs
  const input = pick("input[type='text'], input[type='search'], input:not([type='hidden'])");

  return {
    url: location.href,
    bodyStyle: cs(document.body, [...textProps, "background-color"]),
    header: header ? { tag: header.tagName, cls: header.className, style: cs(header, [...boxProps, "height", "position"]) } : null,
    navLinks: navLinks.map((a) => ({ text: a.textContent.trim().slice(0, 30), style: cs(a, textProps) })),
    h1: h1 ? { text: h1.textContent.trim().slice(0, 80), style: cs(h1, textProps) } : null,
    h2: h2 ? { text: h2.textContent.trim().slice(0, 80), style: cs(h2, textProps) } : null,
    h3: h3 ? { text: h3.textContent.trim().slice(0, 80), style: cs(h3, textProps) } : null,
    paragraph: p ? { text: p.textContent.trim().slice(0, 80), style: cs(p, textProps) } : null,
    buttons: buttons.map((b) => ({ tag: b.tagName, text: b.textContent.trim(), style: { ...cs(b, textProps), ...cs(b, boxProps) } })),
    footer: footer ? { style: cs(footer, [...boxProps, "color"]), link: footerLink ? cs(footerLink, textProps) : null } : null,
    input: input ? cs(input, [...textProps, ...boxProps, "height"]) : null,
    sectionBgs: all("section, div[class*='section']").slice(0, 20).map((s) => {
      const c = getComputedStyle(s).backgroundColor;
      return c !== "rgba(0, 0, 0, 0)" ? c : null;
    }).filter(Boolean),
  };
});

console.log(JSON.stringify(out, null, 1));
await browser.close();
