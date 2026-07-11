/** Lead capture — every form funnels here (brief §5B, ARCHITECTURE.md "lib/leads").
 * Server-side only: called from the /api/lead route handler. */

import fs from "node:fs";
import { INTEREST_REASONS, type InterestReason } from "@/lib/site";
import type { LeadPayload, LeadResult } from "./types";

const OTHER: InterestReason = "Other reason to contact an agent";
const STUB_FILE = ".leads-dev.jsonl";

export type ParsedLead =
  | { kind: "lead"; lead: LeadPayload }
  | { kind: "spam" }
  | { kind: "invalid"; error: string };

/** Validate a raw form body. Honeypot field is `rlt_hp` — bots fill it, humans never see it.
 * (Deliberately non-semantic: a `website` field gets filled by Chrome address autofill for
 * real visitors, silently dropping their leads.) */
export function parseLead(body: unknown, source: string): ParsedLead {
  const b = (body ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  if (str(b.rlt_hp) !== "") return { kind: "spam" };

  const name = str(b.name);
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

  const lead: LeadPayload = {
    name,
    email,
    phone: str(b.phone),
    message: str(b.message),
    interestReason,
    source,
    timestamp: new Date().toISOString(),
  };
  const address = str(b.address);
  if (address) lead.address = address;
  return { kind: "lead", lead };
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
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
