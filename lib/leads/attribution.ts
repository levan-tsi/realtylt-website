/** WHERE A LEAD CAME FROM (owner, 2026-11-14: "we will see where it came from", nothing extra
 * for the visitor to click).
 *
 * The browser remembers how this device first arrived and how it most recently arrived from
 * outside (lib/leads/attribution-client.ts, localStorage, so the site stays cookieless), every
 * form sends that along, and this file is the server's half: it trusts nothing in it. Known keys
 * only, short strings only, and the one-line `origin` a person reads is worked out here. */

export interface Touch {
  /** The outside page that sent them, host + path, e.g. "www.google.com/". Absent = no referrer. */
  referrer?: string;
  /** The first page of ours they saw on that arrival, e.g. "/blog/final-walk-through-checklist". */
  landing?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  /** An ad click id was on the URL. The id itself is never kept, only which network's. */
  click?: "google" | "microsoft" | "meta";
  /** When, ISO. */
  at?: string;
}

export interface LeadAttribution {
  /** The one line for a person: "Google search", "Google Ads", "Direct", "Referral: zillow.com". */
  origin: string;
  first?: Touch;
  /** The most recent arrival from outside, when it is not the first one. */
  last?: Touch;
  /** The browser's IANA zone, e.g. "America/Chicago". The CRM times its call by it. */
  tz?: string;
}

const TOUCH_TEXT = ["referrer", "landing", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "at"] as const;
const CLICKS = ["google", "microsoft", "meta"] as const;

function parseTouch(raw: unknown): Touch | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const r = raw as Record<string, unknown>;
  const out: Touch = {};
  for (const key of TOUCH_TEXT) {
    const v = typeof r[key] === "string" ? (r[key] as string).trim().slice(0, 200) : "";
    if (v) out[key] = v;
  }
  if ((CLICKS as readonly unknown[]).includes(r.click)) out.click = r.click as Touch["click"];
  return Object.keys(out).length ? out : undefined;
}

const SEARCH: Array<[RegExp, string]> = [
  [/(^|\.)google\./, "Google search"],
  [/(^|\.)bing\.com$/, "Bing search"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo search"],
  [/(^|\.)yahoo\.com$/, "Yahoo search"],
  [/(^|\.)brave\.com$/, "Brave search"],
];
const SOCIAL: Array<[RegExp, string]> = [
  [/(^|\.)(facebook|fb)\.com$/, "Facebook"],
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)linkedin\.com$|^lnkd\.in$/, "LinkedIn"],
  [/(^|\.)youtube\.com$|^youtu\.be$/, "YouTube"],
  [/(^|\.)tiktok\.com$/, "TikTok"],
  [/^t\.co$|(^|\.)(twitter|x)\.com$/, "X"],
  [/(^|\.)nextdoor\.com$/, "Nextdoor"],
];
const AI = /(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com)$/;

/** The line a person reads, from one arrival. Paid beats tagged beats referrer beats nothing. */
export function originOf(touch: Touch | undefined): string {
  if (!touch) return "Direct";
  if (touch.click === "google") return "Google Ads";
  if (touch.click === "microsoft") return "Microsoft Ads";
  if (touch.click === "meta") return "Facebook or Instagram ad";
  if (touch.utm_source) return `Campaign: ${touch.utm_source}${touch.utm_medium ? ` / ${touch.utm_medium}` : ""}`;
  const host = (touch.referrer ?? "").split("/")[0].toLowerCase().replace(/^www\./, "");
  if (!host) return "Direct";
  if (AI.test(host)) return `AI assistant: ${host}`;
  for (const [re, name] of SEARCH) if (re.test(host)) return name;
  for (const [re, name] of SOCIAL) if (re.test(host)) return name;
  return `Referral: ${host}`;
}

/** Validate what a form sent. Undefined when it sent nothing usable (an old tab, storage off). */
export function parseAttribution(raw: unknown): LeadAttribution | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const r = raw as Record<string, unknown>;
  const first = parseTouch(r.first);
  const last = parseTouch(r.last);
  const tz = typeof r.tz === "string" && /^[A-Za-z_]+(\/[A-Za-z0-9_+-]+){1,2}$/.test(r.tz) ? r.tz.slice(0, 64) : undefined;
  if (!first && !last && !tz) return undefined;
  const out: LeadAttribution = { origin: originOf(first ?? last) };
  if (first) out.first = first;
  if (last) out.last = last;
  if (tz) out.tz = tz;
  return out;
}

/** The line folded into the lead's message, so the source shows in any plain CRM view. */
export function attributionLine(a: LeadAttribution): string {
  const parts = [a.origin];
  const landing = a.first?.landing ?? a.last?.landing;
  if (landing) parts.push(`first page ${landing}`);
  const lastOrigin = a.last ? originOf(a.last) : "";
  if (lastOrigin && lastOrigin !== a.origin) parts.push(`came back from ${lastOrigin}`);
  return `[Source] ${parts.join(" · ")}`;
}
