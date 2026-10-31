// The disclosure prep sheet, version 2: the free file of /blog/seller-disclosure-requirements-new-york.
//
//   node scripts/build-seller-prep-sheet.mjs [previewDir]
//
// Writes public/downloads/seller-disclosure-prep-sheet-ny.pdf (two US Letter pages) and, when a
// preview folder is given, page-1.jpg and page-2.jpg there: the same HTML shot at print size, so
// the pages can be LOOKED at without a PDF renderer on the box.
//
// WHY IT LIVES HERE. Version 1 (2026-10-29) was one page printed from the agents' piece folder
// (realtylt-agents/company/pieces/realtylt/seller-disclosure-requirements-new-york/visuals/ours/
// src/build-free-sheet.mjs), a 1200 x 1553 social picture scaled onto Letter. The owner asked on
// 2026-10-31 whether the sheet should list the real form too; the answer is both: the state's form
// is linked, and this sheet is its companion. Two pages do not fit that picture frame, so the PDF
// is now built here, beside the page that serves it, with the same tokens (the RealtyLT light
// theme from scripts/designer/brands/realtylt.mjs in the agents repo) and the same font
// (Schibsted Grotesk, SIL OFL 1.1, in scripts/seller-prep-sheet/fonts with its licence). The
// piece's PNG pictures of version 1 stay where they are.
//
// THE CONTENT RULE. Every line comes from the post (content/blog/seller-posts.ts,
// SELLER_DISCLOSURE_POST) or from the form it links, DOS-1614-f (Rev. 02/25), read on
// 2026-10-31 at the Department of State's address below: seven pages, every footer
// "DOS-1614-f (Rev. 02/25)", questions 1 to 56. The form's words are quoted as the form prints
// them; "..." marks a cut, and nothing else is changed. The form text is also the statute's,
// Real Property Law 462(2), which the post cites.
import { readFileSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "downloads", "seller-disclosure-prep-sheet-ny.pdf");
const FONT = readFileSync(join(ROOT, "scripts", "seller-prep-sheet", "fonts", "SchibstedGrotesk-Variable.ttf")).toString("base64");
const preview = process.argv[2];

// The state's own address for the current form. It answers with the Rev. 02/25 PDF itself
// (a redirect to /system/files/documents/2025/05/dos-1614-f-property-condition-disclosure-
// statement_04.2025-eff.-07.2025.pdf, 1,560,442 bytes, checked 2026-10-31 in a browser); it is
// short enough to type from paper, which the long file path is not.
const FORM_URL = "https://dos.ny.gov/property-condition-disclosure-statement-eff-7125";
const FORM_PRINT = "dos.ny.gov/property-condition-disclosure-statement-eff-7125";
const FORM = `<span class="nw">DOS-1614-f (Rev. 02/25)</span>`;
const READ = "read October 31, 2026";

// PAGE 1, as version 1: [the document (the post's words), the question number, what the form asks].
const DOCS = [
  ["Certificates of occupancy", 9, "Are there certificates of occupancy related to the property? If no, explain."],
  ["Flood insurance policy", 15, "Is there flood insurance on the property? If yes, attach a copy of the policy."],
  ["Elevation certificate", 16, "Is there a FEMA elevation certificate available for the property? If yes, attach a copy of the certificate."],
  ["Radon test report", 24, "Has a radon test been done? If yes, attach a copy of the report."],
  ["Mold test report", 27, "Has the property been tested for indoor mold? If yes, attach a copy of the report."],
  ["Water test report", 35, "Has the water quality and/or flow rate been tested? If yes, describe."],
  ["Septic age and pump-out dates", 36, "If septic or cesspool, age? Date last pumped? Frequency of pumping?"],
];

// PAGE 2: ten questions that need a date, a paper or an honest Unkn. [number, the form's words,
// where the answer comes from]. The sources named are the seller's own: the closing file, the
// town building department, the insurer, the well or septic contractor, the repair invoices, the
// seller's own memory; the form's own notes where it gives one (questions 3 and 13).
export const TEN = [
  [3, "What is the age of the structure or structures?",
    "Your closing file or the town building department. Built before 1978? The federal lead paint rules apply as well."],
  [11, "Is any or all of the property located wholly or partially in the Special Flood Hazard Area (SFHA; 100-year floodplain) according to the Federal Emergency Management Agency's (FEMA's) current flood insurance rate maps for your area?",
    "FEMA's current flood insurance rate maps, which the form itself points to, and your insurer."],
  [13, "Is the property subject to any requirement under federal law to obtain and maintain flood insurance on the property?",
    "Your mortgage papers and your insurer. The form's note: homes in the high risk zone with a mortgage from a federally regulated or insured lender must carry it."],
  [14, "Have you ever received assistance, or are you aware of any previous owners receiving assistance, from the Federal Emergency Management Agency (FEMA), the U.S. Small Business Administration (SBA), or any other federal disaster flood assistance for flood damage to the property?",
    "Your own records for your years, your closing file for the owners before you. Not known? Unkn."],
  [17, "Have you ever filed a claim for flood damage to the property with any insurance provider, including the National Flood Insurance Program (NFIP)?",
    "Your insurer: ask for the claim history on the policy."],
  [21, "Are there or have there ever been fuel storage tanks above or below the ground on the property? ... Are they leaking or have they ever leaked?",
    "Your own memory, your closing file and your own purchase inspection report. The form also asks if they are in use, and where."],
  [32, "What is the type of roof/roof covering (slate, asphalt, other)? Any known material defects? How old is the roof? Is there a transferable warranty on the roof in effect now?",
    "The roofer's invoice and warranty, in your repair invoices."],
  [36, "What is the type of sewage system? ... If septic or cesspool, age? Date last pumped? Frequency of pumping? Any known material defects?",
    "Your septic contractor's pump-out receipts. The Rev. 02/25 form adds a septic information paragraph here."],
  [37, "Who is your electric service provider? What is the amperage? Does it have circuit breakers or fuses? Private or public poles? Any known material defects?",
    "The provider is on your electric bill; the amperage, breakers or fuses at your electrical panel. Unsure? Unkn."],
  [39, "Has the structure(s) experienced any water penetration or damage due to seepage or a natural flood event, such as from heavy rainfall, coastal storm surge, tidal inundation or river overflow?",
    "Your own memory of every spring and every storm, and your repair invoices. Painting over the marks does not change the answer."],
];

const top = `<div class="top" aria-hidden="true"><span class="mark">Realty<i>LT</i></span><span>Seller disclosure in New York</span></div>`;
const end = `
  <div class="end">
    <p class="call">Call (914) 875-2424 or Book a Consultation</p>
    <p class="who">Levan Tsiklauri (LT) | Realtor® | levan@realtylt.com</p>
    <p class="ai">Written with an AI assistant and checked by Levan.</p>
  </div>`;
const foot = (source) => `<div class="foot"><p class="source">${source}</p><span class="site">realtylt.com</span></div>`;
const formLine = `<p class="form-line"><b>The real form:</b> ${FORM}, NY Department of State, <a href="${FORM_URL}">${FORM_PRINT}</a></p>`;

const page1 = `
<section class="page">
  ${top}
  <p class="kick"><span>The disclosure prep sheet</span><span>Page 1 of 2, free to copy</span></p>
  <h1>Each document <b>and the question that asks for it</b></h1>
  <p class="lede">Fill in the state's form; this sheet gets the paper ready.</p>
  ${formLine}
  <div class="sheet docs" role="table" aria-label="Each document and the question number on the form that asks for it">
    <div class="tr th" role="row"><span role="columnheader">Document</span><span role="columnheader">Question</span><span role="columnheader">What the form asks</span><span role="columnheader">Have it</span></div>
    ${DOCS.map(([d, n, a]) => `<div class="tr" role="row"><span class="doc" role="cell">${d}</span><span class="qn" role="cell"><b>${n}</b></span><span class="ask" role="cell">${a}</span><span class="box" role="cell" aria-label="Have it: to tick"></span></div>`).join("")}
  </div>
  <p class="also">Also gather, with no question number in the guide: warranties, repair invoices and your own purchase inspection report.</p>
  <div class="notes"><p class="nh">List every known issue, past repair and improvement</p>${'<i aria-hidden="true"></i>'.repeat(16)}</div>
  ${end}
  ${foot(`<b>Source:</b> the question numbers and the form's words from ${FORM}, NY Department of State, ${READ}. General information, not legal advice. I am a licensed real estate salesperson, not an attorney.`)}
</section>`;

const page2 = `
<section class="page">
  ${top}
  <p class="kick"><span>Ten questions to answer with care</span><span>Page 2 of 2</span></p>
  <h1>Ten answers <b>and where each one comes from</b></h1>
  <p class="lede">The form's own words, with its question number. When you do not know, the answer is Unkn.</p>
  <div class="sheet ten" role="table" aria-label="Ten questions on the form and where each answer comes from">
    <div class="tr th" role="row"><span role="columnheader">Question</span><span role="columnheader">What the form asks</span><span role="columnheader">Where the answer comes from</span></div>
    ${TEN.map(([n, a, w]) => `<div class="tr" role="row"><span class="qn" role="cell"><b>${n}</b></span><span class="ask" role="cell">${a}</span><span class="where" role="cell">${w}</span></div>`).join("")}
  </div>
  <div class="rules">
    <p><b>Answer</b> Yes, No, Unkn or NA from what you actually know, and complete the form yourself.</p>
    <p><b>Check</b> the revision line at the foot of every page: it must read ${FORM}.</p>
    <p><b>Deliver</b> it before the buyer signs the contract, after you review it with your attorney.</p>
  </div>
  ${formLine}
  ${end}
  ${foot(`<b>Source:</b> the question numbers and the form's words from ${FORM}, NY Department of State, ${READ}. General information, not legal advice. I am a licensed real estate salesperson, not an attorney.`)}
</section>`;

// Tokens: the RealtyLT light theme (ink #131417, hue #28a8e0, navy #102c54), on white for paper.
const css = `
@font-face{font-family:"Schibsted Grotesk";src:url(data:font/ttf;base64,${FONT}) format("truetype");font-weight:400 900}
@page{size:8.5in 11in;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
:root{--ink:#131417;--ink-2:rgba(19,20,23,.80);--muted:rgba(19,20,23,.62);--hue:#28a8e0;--hue-wash:rgba(40,168,224,.14);
  --navy:#102c54;--rule:rgba(19,20,23,.16);--rule-2:rgba(19,20,23,.08);--line:rgba(19,20,23,.30)}
html,body{background:#fff}
body{font-family:"Schibsted Grotesk","Segoe UI",Arial,sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased}
.page{width:8.5in;height:11in;padding:0.55in 0.6in 0.5in;display:flex;flex-direction:column;overflow:hidden;break-after:page;background:#fff}
.page:last-child{break-after:auto}
.top{display:flex;justify-content:space-between;align-items:baseline;font-size:10px;color:var(--muted);padding-bottom:7px;border-bottom:1px solid var(--rule)}
.top .mark{font-weight:800;font-size:12px;color:var(--ink);letter-spacing:-.01em}
.top .mark i{font-style:normal;color:var(--hue)}
.kick{display:flex;justify-content:space-between;font-size:10px;color:var(--muted);margin-top:14px}
.kick span:first-child{color:var(--ink);font-weight:700}
h1{font-weight:400;font-size:27px;line-height:1.08;letter-spacing:-.022em;margin-top:6px}
h1 b{font-weight:700}
.lede{margin-top:7px;font-size:13px;line-height:1.35;color:var(--ink-2);font-weight:600}
.form-line{margin-top:6px;font-size:11px;line-height:1.4;color:var(--ink-2)}
.form-line b{color:var(--ink)}
.form-line a{color:var(--navy);text-decoration:underline;text-underline-offset:2px}
.nw{white-space:nowrap}
.sheet{margin-top:12px;border:1.5px solid var(--ink-2);border-radius:8px;overflow:hidden;flex:none}
.tr{display:grid;align-items:center;border-top:1px solid var(--rule)}
.tr:first-child{border-top:0}
.docs .tr{grid-template-columns:27% 10% 1fr 9%}
.ten .tr{grid-template-columns:9% 55% 1fr;align-items:start}
.tr > span{padding:6.5px 8px;font-size:11px;line-height:1.32}
.ten .tr > span{padding:6px 8px;font-size:10.6px;line-height:1.3}
.th{background:var(--hue-wash)}
.th > span{font-weight:700;font-size:10px!important}
.doc{font-weight:600}
.qn b{display:inline-block;font-weight:700;color:var(--ink);background:var(--hue);border-radius:5px;padding:1px 7px;min-width:2.1em;text-align:center}
.ask{color:var(--ink-2)}
.where{color:var(--ink)}
.box{justify-self:center;width:15px;height:15px;padding:0!important;border:1.5px solid var(--ink-2);border-radius:4px}
.also{margin-top:9px;font-size:11px;line-height:1.35;color:var(--ink-2)}
.notes{flex:1;min-height:0;margin-top:14px;display:flex;flex-direction:column;overflow:hidden}
.nh{font-weight:700;font-size:11.5px;margin-bottom:2px}
.notes i{display:block;flex:none;height:25px;border-bottom:1px solid var(--line)}
.rules{margin-top:12px;display:flex;flex-direction:column;gap:4px;padding-left:10px;border-left:2px solid var(--hue)}
.rules p{font-size:11px;line-height:1.35}
.page .rules + .form-line{margin-top:10px}
.end{margin-top:auto;padding-top:10px;display:flex;flex-direction:column;gap:2px}
.call{font-weight:700;font-size:13px}
.who{font-size:11px;color:var(--ink-2);font-weight:600}
.ai{font-size:10px;color:var(--muted)}
.foot{margin-top:9px;display:flex;justify-content:space-between;align-items:flex-end;gap:16px;padding-top:7px;border-top:1px solid var(--rule-2)}
.source{font-size:9px;line-height:1.42;color:var(--muted);max-width:78ch}
.source b{font-weight:600;color:var(--ink-2)}
.site{font-size:9px;color:var(--ink-2);font-weight:600;white-space:nowrap}
`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>The disclosure prep sheet, New York</title><style>${css}</style></head><body>${page1}${page2}</body></html>`;

const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 816, height: 1056 }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
// Nothing may spill: a page whose content is taller than the sheet would be cut on paper.
const spill = await page.$$eval(".page", (ps) => ps.map((p) => p.scrollHeight - p.clientHeight));
if (spill.some((s) => s > 0)) throw new Error(`content spills past the page: ${spill.join(", ")} px`);
await page.emulateMedia({ media: "print" });
await page.pdf({ path: OUT, preferCSSPageSize: true, printBackground: true });
if (preview) {
  mkdirSync(preview, { recursive: true });
  const pages = await page.$$(".page");
  for (let i = 0; i < pages.length; i++) await pages[i].screenshot({ path: join(preview, `prep-sheet-page-${i + 1}.jpg`), type: "jpeg", quality: 82 });
}
await browser.close();
console.log(`wrote ${OUT} (${statSync(OUT).size} bytes)${preview ? ` and previews in ${preview}` : ""}`);
