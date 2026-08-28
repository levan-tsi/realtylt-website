// The branded client emails the n8n workflows send AS Levan (round 50 item 1). This file is the
// local twin of the two n8n Code nodes ("Guard, Throttle & Compose" on gKA4YoMDx5ADd8Dx and
// "Compose Welcome" on 3RLrnY2SMcZ5ZMDL): same shell, same signature, same copy. Run it to render
// both variants to HTML + PNG and LOOK before pasting the SHELL/compose body into n8n.
//
// Constraints inherited from the CRM's email-shell.ts: tables + inline styles (Outlook), ASCII
// only (7bit part: entities, never glyphs), nothing fetched (no images, no web fonts), no line
// over 998 chars.
import fs from "node:fs";
import { chromium } from "playwright";

// ---- SHELL (byte-identical in both n8n Code nodes) -------------------------------------------
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const NAVY = "#12294f", ACCENT = "#11658a", LT = "#27a7df";
const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/[^\t\n\r\x20-\x7e]/gu, (c) => `&#${c.codePointAt(0)};`);
const headline = (h, sub) => `<tr><td class="rlt-pad" style="padding:32px 32px 0;"><div style="font-family:${FONT};font-size:24px;line-height:1.25;font-weight:700;color:${NAVY};margin:0 0 4px;">${esc(h)}</div>${sub ? `<div style="font-family:${FONT};font-size:15px;color:#6b7688;">${esc(sub)}</div>` : ""}</td></tr>`;
const para = (t, top = 20) => `<tr><td class="rlt-pad" style="padding:${top}px 32px 0;"><div style="font-family:${FONT};font-size:15px;line-height:1.6;color:#33404f;">${esc(t).replace(/\r?\n/g, "<br>\n")}</div></td></tr>`;
const bullets = (items) => `<tr><td class="rlt-pad" style="padding:16px 32px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0">${items.map((t) => `<tr><td valign="top" style="padding:4px 10px 4px 0;font-family:${FONT};font-size:15px;color:${LT};">&bull;</td><td style="padding:4px 0;font-family:${FONT};font-size:15px;line-height:1.5;color:#33404f;">${esc(t)}</td></tr>`).join("\n")}</table></td></tr>`;
const cta = (href, label) => `<tr><td class="rlt-pad" align="center" style="padding:28px 32px 8px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background:${NAVY};border-radius:10px;"><a href="${esc(href)}" style="display:inline-block;padding:14px 32px;font-family:${FONT};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${esc(label)}</a></td></tr></table></td></tr>\n<tr><td class="rlt-pad" align="center" style="padding:0 32px 6px;"><div style="font-family:${FONT};font-size:12px;color:#8a93a3;word-break:break-all;"><a href="${esc(href)}" style="color:${ACCENT};text-decoration:none;">${esc(href)}</a></div></td></tr>`;
const SIG = { closing: "Best Regards!", name: "Levan Tsiklauri (LT)", designation: "Realtor", phoneDisplay: "(917) 905-7923", phoneHref: "tel:+19179057923", email: "levan@realtylt.com", siteDisplay: "www.realtylt.com", siteHref: "https://realtylt.com", bookingLabel: "Book a Consultation", bookingHref: "https://realtylt.com/connect", address: "1097 Route 55, Suite 9, Lagrangeville, NY 12540" };
const link = (href, label, w = 400) => `<a href="${esc(href)}" style="color:${ACCENT};font-weight:${w};text-decoration:none;">${esc(label)}</a>`;
const SEP = '<span style="color:#b8c0cc;">&nbsp;|&nbsp;</span>';
const signature = () => [
  '<tr><td class="rlt-pad" style="padding:26px 32px 30px;">',
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-left:3px solid ${LT};">`,
  `<tr><td style="padding:2px 0 2px 16px;font-family:${FONT};">`,
  `<div style="font-size:14px;line-height:1.5;color:#33404f;margin:0 0 10px;">${esc(SIG.closing)}</div>`,
  `<div style="font-size:15px;line-height:1.4;font-weight:700;color:${NAVY};">${esc(SIG.name)} <span style="font-weight:400;color:#6b7688;">| ${esc(SIG.designation)}&reg;</span></div>`,
  `<div style="font-size:13px;line-height:1.6;color:#33404f;margin-top:4px;">${link(SIG.phoneHref, SIG.phoneDisplay)}${SEP}${link("mailto:" + SIG.email, SIG.email)}</div>`,
  `<div style="font-size:13px;line-height:1.6;color:#33404f;">${link(SIG.siteHref, SIG.siteDisplay)}${SEP}${link(SIG.bookingHref, SIG.bookingLabel, 600)}</div>`,
  `<div style="font-size:12px;line-height:1.5;color:#8a93a3;margin-top:4px;">${esc(SIG.address)}</div>`,
  "</td></tr></table></td></tr>",
].join("\n");
const signatureText = () => [SIG.closing, "", `${SIG.name} | ${SIG.designation}(R)`, `${SIG.phoneDisplay} | ${SIG.email}`, `${SIG.siteDisplay} | ${SIG.bookingLabel}: ${SIG.bookingHref}`, SIG.address].join("\n");
const shell = ({ title, preheader, eyebrow, rows, footerNote }) => [
  "<!DOCTYPE html>", '<html lang="en" style="margin:0;padding:0;">', "<head>", '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width,initial-scale=1">', '<meta name="color-scheme" content="light">',
  `<title>${esc(title)}</title>`,
  "<style>body{margin:0;padding:0;background:#eef0f3;} a{text-decoration:none;} @media (max-width:620px){.rlt-container{width:100% !important;} .rlt-pad{padding-left:22px !important;padding-right:22px !important;}}</style>",
  "</head>", '<body style="margin:0;padding:0;background:#eef0f3;">',
  `<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#eef0f3;">${esc(preheader)}</div>`,
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef0f3;"><tr><td align="center" style="padding:30px 16px;">',
  '<table role="presentation" class="rlt-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e7ec;">',
  `<tr><td style="background:${NAVY};padding:22px 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>`,
  `<td align="left" style="font-family:${FONT};font-size:20px;font-weight:700;letter-spacing:.01em;color:#ffffff;">Realty<span style="color:${LT};">LT</span></td>`,
  `<td align="right" style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#9cb0d2;">${esc(eyebrow)}</td>`,
  "</tr></table></td></tr>",
  ...rows,
  `<tr><td style="background:#f8f9fb;border-top:1px solid #eceef1;padding:22px 32px;font-family:${FONT};">`,
  `<div style="font-size:13px;font-weight:600;color:${NAVY};">RealtyLT &middot; Levan Tsiklauri, licensed real estate salesperson</div>`,
  `<div style="font-size:12px;color:#98a1b0;margin-top:3px;">${esc(SIG.address)}</div>`,
  `<div style="font-size:12px;color:#98a1b0;margin-top:5px;line-height:1.5;">${esc(footerNote)}</div>`,
  "</td></tr></table></td></tr></table></body></html>",
].join("\n");
// ---- END SHELL --------------------------------------------------------------------------------

/** Thank-you: the copy the round-40 node already sent, in the shell. */
export function composeThankYou({ first, consented }) {
  const bookHref = SIG.bookingHref;
  const body = consented
    ? "Here is what happens next: first, a quick call from my AI assistant. It confirms it is really you and sets the exact day for your appointment. If you still have questions, the assistant can put me on the line right there. Otherwise we talk at the time you chose, by phone or in person."
    : "You asked us not to call, so everything stays in email: I read what you sent and reply here myself, usually within the hour, seven days a week. If you ever prefer a call after all, (917) 905-7923 reaches me any day.";
  const note = "You are receiving this note because you reached out on realtylt.com.";
  const html = shell({
    title: `Thank you, ${first}`,
    preheader: "Your request is with me. Here is what happens next.",
    eyebrow: "Your request",
    rows: [headline(`Thank you, ${first}.`, "Your request is with me."), para(body), cta(bookHref, consented ? "Pick a time now" : "Book a consultation"), signature()],
    footerNote: note,
  });
  const text = `Thank you, ${first}. Your request is with me.\n\n${body}\n\n${consented ? "Pick a time now" : "Book a consultation"}: ${bookHref}\n\n${signatureText()}\n\n${note}`;
  return { subject: `Thank you, ${first} - here is what happens next`, html, text };
}

/** Welcome: the account is ready. */
export function composeWelcome({ first }) {
  const note = "You are receiving this email because you created an account on realtylt.com.";
  const searchHref = "https://realtylt.com/search";
  const items = ["Save the homes you like and find them again on any device", "Save searches and turn on alerts for new matches", "Run market reports for the areas you care about"];
  const html = shell({
    title: "Your RealtyLT account is ready",
    preheader: "Signed in, your saved homes, searches and reports follow you everywhere.",
    eyebrow: "Your account",
    rows: [headline(first ? `Welcome, ${first}.` : "Welcome.", "Your account on realtylt.com is set. Signed in, you can:"), bullets(items), cta(searchHref, "Start your search"), para("I am here for all of your real estate questions.", 8), signature()],
    footerNote: note,
  });
  const text = `${first ? `Welcome, ${first}.` : "Welcome."} Your account on realtylt.com is set. Signed in, you can:\n\n${items.map((i) => `- ${i}`).join("\n")}\n\nStart here: ${searchHref}\n\nI am here for all of your real estate questions.\n\n${signatureText()}\n\n${note}`;
  return { subject: "Your RealtyLT account is ready", html, text };
}

// ---- render locally ----------------------------------------------------------------------------
if (process.argv[1] && process.argv[1].endsWith("email-templates.mjs")) {
  const out = process.argv[2] || ".";
  const variants = {
    "thankyou-consented": composeThankYou({ first: "Levan", consented: true }),
    "thankyou-declined": composeThankYou({ first: "Levan", consented: false }),
    "welcome": composeWelcome({ first: "Levan" }),
  };
  const browser = await chromium.launch();
  for (const [name, v] of Object.entries(variants)) {
    fs.writeFileSync(`${out}/email-${name}.html`, v.html);
    const longest = Math.max(...v.html.split("\n").map((l) => l.length));
    const nonAscii = /[^\t\n\r\x20-\x7e]/.test(v.html);
    console.log(name, "longest line", longest, "nonASCII", nonAscii, "subject:", v.subject);
    for (const w of [700, 390]) {
      const page = await browser.newPage({ viewport: { width: w, height: 900 } });
      await page.setContent(v.html);
      await page.screenshot({ path: `${out}/email-${name}-${w}.png`, fullPage: true });
      await page.close();
    }
  }
  await browser.close();
}
