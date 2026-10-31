/**
 * Listing-agent contact capture (round 14, 2026-10-30). INTERNAL ONLY: these rows live in
 * `idx_agent_contacts` (service-role writes, `authenticated` reads) so the team can contact
 * listing agents. They are NEVER merged into `idx_listings.listing` and never reach a public
 * page or API (see tests/idx/agent-contacts-guard.test.ts).
 */

/** The raw MLS Grid Property fields we read. */
export interface RawAgentFields {
  ListingId?: string;
  ListingKey?: string;
  ListAgentMlsId?: string | null;
  ListAgentFullName?: string | null;
  ListAgentEmail?: string | null;
  ListAgentDirectPhone?: string | null;
  ListAgentPreferredPhone?: string | null;
  ListAgentMobilePhone?: string | null;
  ListAgentOfficePhone?: string | null;
  ListOfficeMlsId?: string | null;
  ListOfficeName?: string | null;
  ListOfficePhone?: string | null;
}

export interface AgentContactRow {
  listing_id: string;
  agent_mls_id: string | null;
  agent_name: string | null;
  agent_email: string | null;
  agent_phone: string | null;
  agent_phones: Record<string, string>;
  office_mls_id: string | null;
  office_name: string | null;
  office_phone: string | null;
  seen_at: string;
  updated_at: string;
}

/** The raw SELECT names the feed is asked for (the sync drops any the feed rejects). */
export const AGENT_CONTACT_FIELDS = [
  "ListAgentMlsId", "ListAgentFullName", "ListAgentEmail", "ListAgentDirectPhone",
  "ListAgentPreferredPhone", "ListAgentMobilePhone", "ListAgentOfficePhone",
  "ListOfficeMlsId", "ListOfficeName", "ListOfficePhone",
] as const;

const clean = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t : null;
};

/** Pure: raw feed record -> contact row. `now` is injectable for tests. */
export function agentContactOf(raw: RawAgentFields, listingId: string, now: Date = new Date()): AgentContactRow {
  const direct = clean(raw.ListAgentDirectPhone);
  const preferred = clean(raw.ListAgentPreferredPhone);
  const mobile = clean(raw.ListAgentMobilePhone);
  const office = clean(raw.ListAgentOfficePhone);
  const phones: Record<string, string> = {};
  if (direct) phones.direct = direct;
  if (preferred) phones.preferred = preferred;
  if (mobile) phones.mobile = mobile;
  if (office) phones.office = office;
  const ts = now.toISOString();
  return {
    listing_id: listingId,
    agent_mls_id: clean(raw.ListAgentMlsId),
    agent_name: clean(raw.ListAgentFullName),
    agent_email: clean(raw.ListAgentEmail),
    agent_phone: direct ?? preferred ?? mobile ?? office,
    agent_phones: phones,
    office_mls_id: clean(raw.ListOfficeMlsId),
    office_name: clean(raw.ListOfficeName),
    office_phone: clean(raw.ListOfficePhone),
    seen_at: ts,
    updated_at: ts,
  };
}

/** Upsert rows through PostgREST (service role). Never throws: returns counts. */
export async function writeAgentContacts(
  restBase: string,
  key: string,
  rows: readonly AgentContactRow[],
  batch = 500,
): Promise<{ written: number; failed: number }> {
  let written = 0;
  let failed = 0;
  for (let i = 0; i < rows.length; i += batch) {
    const chunk = rows.slice(i, i + batch);
    try {
      const r = await fetch(`${restBase}/idx_agent_contacts?on_conflict=listing_id`, {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(chunk),
        signal: AbortSignal.timeout(30_000),
      });
      if (r.ok) written += chunk.length;
      else failed += chunk.length;
    } catch {
      failed += chunk.length;
    }
  }
  return { written, failed };
}
