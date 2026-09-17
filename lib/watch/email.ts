/** The watch emails: the same ops shell the n8n watcher used (navy band, white card, the
 * numbers table), built server-side. Constraints inherited from the CRM's email shell:
 * tables + inline styles, ASCII only (entities, never glyphs), nothing fetched. */

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const NAVY = "#12294f";
const LT = "#27a7df";
const RED = "#b42318";
const GREEN = "#1b7f4b";

const esc = (v: unknown): string =>
  String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/[^\t\n\r\x20-\x7e]/gu, (c) => `&#${c.codePointAt(0)};`);

const row = (k: string, v: string) =>
  `<tr><td style="padding:6px 12px 6px 0;font-family:${FONT};font-size:13px;color:#6b7688;white-space:nowrap;">${esc(k)}</td>` +
  `<td style="padding:6px 0;font-family:${FONT};font-size:13px;color:${NAVY};font-weight:600;">${esc(v)}</td></tr>`;

function shell(eyebrow: string, headline: string, tone: "good" | "bad", lines: string[], factRows: [string, string][]): string {
  return [
    `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(headline)}</title></head>`,
    '<body style="margin:0;padding:0;background:#eef0f3;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef0f3;"><tr><td align="center" style="padding:30px 16px;">',
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e7ec;">',
    `<tr><td style="background:${NAVY};padding:22px 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
      `<td style="font-family:${FONT};font-size:20px;font-weight:700;color:#ffffff;">Realty<span style="color:${LT};">LT</span></td>` +
      `<td align="right" style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#9cb0d2;">${esc(eyebrow)}</td>` +
      "</tr></table></td></tr>",
    `<tr><td style="padding:28px 32px 0;"><div style="font-family:${FONT};font-size:22px;line-height:1.3;font-weight:700;color:${tone === "bad" ? RED : GREEN};">${esc(headline)}</div></td></tr>`,
    lines.length
      ? `<tr><td style="padding:16px 32px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0">${lines
          .map(
            (l) =>
              `<tr><td valign="top" style="padding:4px 10px 4px 0;font-family:${FONT};font-size:15px;color:${RED};">&bull;</td>` +
              `<td style="padding:4px 0;font-family:${FONT};font-size:15px;line-height:1.5;color:#33404f;">${esc(l)}</td></tr>`,
          )
          .join("")}</table></td></tr>`
      : "",
    `<tr><td style="padding:20px 32px 0;"><div style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#8a93a3;">The numbers</div>` +
      `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;">${factRows.map(([k, v]) => row(k, v)).join("")}</table></td></tr>`,
    `<tr><td style="padding:24px 32px 30px;"><div style="font-family:${FONT};font-size:12px;line-height:1.6;color:#8a93a3;">` +
      "Source: the site's own /api/cron/health-watch - the website and CRM probed from outside, the listing store's idx_health_snapshot(), and first-party flood signals. " +
      "Vercel edge error logs are not read here (no token in the runtime); check the Vercel dashboard for those.</div></td></tr>",
    `<tr><td style="background:#f8f9fb;border-top:1px solid #eceef1;padding:18px 32px;font-family:${FONT};font-size:12px;color:#98a1b0;">RealtyLT platform watch &middot; hourly checks, digest Mondays</td></tr>`,
    "</table></td></tr></table></body></html>",
  ].join("\n");
}

export function composeAlert(problems: string[], factRows: [string, string][], critical: boolean): { subject: string; html: string } {
  const nProblems = problems.length;
  return {
    subject: `${critical ? "URGENT - " : ""}RealtyLT watch: ${nProblems} problem${nProblems === 1 ? "" : "s"} need${nProblems === 1 ? "s" : ""} a look`,
    html: shell("Platform watch", `${nProblems} thing${nProblems === 1 ? "" : "s"} need${nProblems === 1 ? "s" : ""} a look`, "bad", problems, factRows),
  };
}

export function composeDigest(problems: string[], factRows: [string, string][]): { subject: string; html: string } {
  const ok = problems.length === 0;
  return {
    subject: ok ? "RealtyLT watch: all clear this week" : `RealtyLT watch: weekly digest, ${problems.length} open problem${problems.length === 1 ? "" : "s"}`,
    html: shell("Weekly digest", ok ? "Website, CRM and listing data are healthy" : "The week ends with open problems", ok ? "good" : "bad", problems, factRows),
  };
}
