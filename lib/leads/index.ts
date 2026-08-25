/** Lead capture — every form funnels here (brief §5B, ARCHITECTURE.md "lib/leads").
 * Server-side only: called from the /api/lead route handler. */

import fs from "node:fs";
import { INTEREST_REASONS, type InterestReason } from "@/lib/site";
import { parseAddress, parseFullName } from "./field-parsers";
import { buildConsent } from "./consent";
import type { LeadPayload, LeadResult, SavedSearchRequest } from "./types";

const OTHER: InterestReason = "Other reason to contact an agent";
const STUB_FILE = ".leads-dev.jsonl";

export type ParsedLead =
  | { kind: "lead"; lead: LeadPayload }
  | { kind: "spam" }
  | { kind: "invalid"; error: string };

/** Validate a raw form body. Honeypot field is `rlt_hp` — bots fill it, humans never see it.
 * (Deliberately non-semantic: a `website` field gets filled by Chrome address autofill for
 * real visitors, silently dropping their leads.) */
export function parseLead(body: unknown, source: string, ip = "unknown"): ParsedLead {
  const b = (body ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  if (str(b.rlt_hp) !== "") return { kind: "spam" };

  // Name may arrive whole (`name`) or split (`firstName`/`lastName`, the footer/contact form).
  // Derive structured first/last either way: split forms send them directly; a single
  // "Full Name" field (the /selling hero) is parsed here (1 word -> first only; 2 -> f/l;
  // 3+ -> first + rest as last).
  const firstNameIn = str(b.firstName);
  const lastNameIn = str(b.lastName);
  const whole = str(b.name);
  const nameParts =
    firstNameIn || lastNameIn
      ? { firstName: firstNameIn, lastName: lastNameIn }
      : parseFullName(whole);
  const name = whole || [firstNameIn, lastNameIn].filter(Boolean).join(" ");
  const email = str(b.email);
  if (!name) return { kind: "invalid", error: "Name is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { kind: "invalid", error: "A valid email is required." };

  const rawReason = str(b.interestReason);
  let interestReason: InterestReason;
  if (rawReason === "") {
    interestReason = OTHER;
  } else if ((INTEREST_REASONS as readonly string[]).includes(rawReason)) {
    interestReason = rawReason as InterestReason;
  } else {
    return { kind: "invalid", error: "Unknown interest reason." };
  }

  const qualifier = parseQualifier(b.qualifier);
  let message = str(b.message);
  // Fold the wizard answers into the message so they survive into any plain CRM view,
  // even one that ignores the structured `qualifier` field.
  if (qualifier) {
    const summary = Object.entries(qualifier)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" | ");
    message = message ? `${message}\n\n[Qualifier] ${summary}` : `[Qualifier] ${summary}`;
  }

  const lead: LeadPayload = {
    name,
    email,
    phone: str(b.phone),
    message,
    interestReason,
    source,
    timestamp: new Date().toISOString(),
  };
  // Structured name parts (CRM enrichment) — only attach non-empty values.
  if (nameParts.firstName) lead.firstName = nameParts.firstName;
  if (nameParts.lastName) lead.lastName = nameParts.lastName;

  // CONSENT TO CALL OR TEXT. Recorded only when there is a number the consent could cover —
  // a signed authorisation to dial nothing is not a record, it is noise in the CRM. Every
  // field but `granted` is stamped here, server-side: the timestamp, the page, the IP and the
  // agreement text are evidence, and evidence the submitter can write is not evidence.
  if (lead.phone) {
    lead.consent = buildConsent({ granted: b.consentToContact, phone: lead.phone, source, ip });
  }

  const address = str(b.address);
  if (address) {
    lead.address = address;
    // Parse the free-text address into parts alongside the full string (never mutating the
    // visible field). Attach each part only when it could be determined.
    const parts = parseAddress(address);
    if (parts.street) lead.street = parts.street;
    if (parts.city) lead.city = parts.city;
    if (parts.state) lead.state = parts.state;
    if (parts.postalCode) lead.postalCode = parts.postalCode;
  }
  if (qualifier) lead.qualifier = qualifier;

  const savedSearches = parseSavedSearches(b.savedSearches);
  if (savedSearches) {
    lead.savedSearches = savedSearches;
    // Fold a readable summary into the message too, exactly as the qualifier does, so the
    // request is actionable in a plain CRM view that only shows the note field.
    const summary = savedSearches
      .map((s) => `${s.label} (/search?${s.query})`)
      .join("\n");
    message = message
      ? `${message}\n\n[Listing alerts requested]\n${summary}`
      : `[Listing alerts requested]\n${summary}`;
    lead.message = message;
  }
  return { kind: "lead", lead };
}

/** Normalize the saved searches attached to a listing-alert request. Same defensive shape as
 * parseQualifier: bounded count, bounded string lengths, scalar criteria values only, so a
 * crafted body can't smuggle a payload into the CRM through this field. */
const MAX_SAVED_SEARCHES = 20;
function parseSavedSearches(raw: unknown): SavedSearchRequest[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: SavedSearchRequest[] = [];
  for (const item of raw.slice(0, MAX_SAVED_SEARCHES)) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const s = item as Record<string, unknown>;
    const label = typeof s.label === "string" ? s.label.trim().slice(0, 120) : "";
    const query = typeof s.query === "string" ? s.query.trim().slice(0, 600) : "";
    if (!label && !query) continue;
    const criteria: Record<string, string | number | boolean> = {};
    if (s.criteria && typeof s.criteria === "object" && !Array.isArray(s.criteria)) {
      for (const [k, v] of Object.entries(s.criteria as Record<string, unknown>)) {
        if (typeof v === "number" || typeof v === "boolean") criteria[k.slice(0, 40)] = v;
        else if (typeof v === "string" && v.trim()) criteria[k.slice(0, 40)] = v.trim().slice(0, 120);
      }
    }
    out.push({ label: label || "Saved search", query, criteria });
  }
  return out.length ? out : undefined;
}

/** Normalize the optional qualifying-wizard answers: a flat object of short strings.
 * Anything else (arrays, nested objects, oversized values) is dropped defensively so a
 * crafted body can't smuggle junk into the lead. Returns undefined when empty. */
function parseQualifier(raw: unknown): Record<string, string> | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value !== "string") continue;
    const v = value.trim().slice(0, 200);
    if (v) out[key.slice(0, 40)] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

/** POST the lead to CRM_LEAD_WEBHOOK; without it, log locally (stub mode). Never throws.
 * LEAD_TEST_MODE=1 forces stub mode even when the live webhook is configured — the safe
 * switch for QA runs so test submissions can never reach the production CRM leads table. */
export async function submitLead(lead: LeadPayload): Promise<LeadResult> {
  const webhook = process.env.CRM_LEAD_WEBHOOK;
  const testMode = process.env.LEAD_TEST_MODE === "1";

  if (!webhook || testMode) {
    // Always log the full lead server-side — on Vercel the function logs are the only
    // place stub-mode leads survive (the filesystem is read-only).
    console.log(`[lead:stub] ${JSON.stringify(lead)}`);
    try {
      fs.appendFileSync(STUB_FILE, JSON.stringify(lead) + "\n");
    } catch {
      /* read-only FS (e.g. Vercel) — the console.log above is the record */
    }
    return { ok: true, stub: true };
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = process.env.CRM_API_TOKEN;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers,
      body: JSON.stringify(lead),
    });
    if (!res.ok) return { ok: false, error: `CRM webhook responded ${res.status}` };
    notifyLeadThankYou(lead);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** The thank-you note every lead now gets (round 40, owner-directed): fire-and-forget to
 * the n8n "Website Lead Thank-You" workflow, which sends consent-aware copy through the
 * owner's Gmail and throttles per-address (1h) so the qualifying wizard's follow-up POST
 * can never double-send. Never blocks and never fails the lead — the CRM record is already
 * in by the time this fires. Skipped entirely in stub/test mode (no webhook = no email). */
function notifyLeadThankYou(lead: LeadPayload): void {
  const url = process.env.LEAD_THANKYOU_WEBHOOK;
  const secret = process.env.LEAD_THANKYOU_SECRET;
  if (!url || !secret) return;
  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-rlt-thankyou-secret": secret },
    body: JSON.stringify({
      name: lead.firstName || lead.name,
      email: lead.email,
      consented: lead.consent?.granted === true,
      source: lead.source,
    }),
  }).catch(() => {});
}

/** Best-effort per-IP throttle for /api/lead: sliding window, max 8 submissions/60s.
 * In-memory, so per-serverless-instance and reset on cold start — enough to blunt
 * casual scripted abuse without ever slowing a human down; Vercel WAF is the durable
 * layer if real abuse shows up (HANDOFF "Deferred"). */
const RATE_MAX = 8;
const RATE_WINDOW_MS = 60_000;
const rateWindows = new Map<string, number[]>();

/** Record a hit for `ip`; true = over the limit (reject with 429). */
export function leadRateLimited(ip: string): boolean {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  // Bound the map: past any plausible per-instance traffic, sweep fully-stale windows.
  if (rateWindows.size > 1_000) {
    for (const [key, times] of rateWindows) {
      if ((times[times.length - 1] ?? 0) <= cutoff) rateWindows.delete(key);
    }
  }
  const recent = (rateWindows.get(ip) ?? []).filter((t) => t > cutoff);
  const limited = recent.length >= RATE_MAX;
  if (!limited) recent.push(Date.now());
  rateWindows.set(ip, recent);
  return limited;
}

/** Test hook — clears the throttle windows (same pattern as resetMediaCacheForTests). */
export function resetLeadRateLimitForTests(): void {
  rateWindows.clear();
}
