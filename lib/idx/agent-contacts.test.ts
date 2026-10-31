import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { agentContactOf, type RawAgentFields } from "./agent-contacts";
import { forCard } from "./card-listing";
import type { Listing } from "./types";

// INVENTED fixture: field names are the MLS Grid ones, every value is made up.
const raw: RawAgentFields = {
  ListingId: "INV-1001",
  ListAgentMlsId: "INV-A77",
  ListAgentFullName: "  Pat Example ",
  ListAgentEmail: "pat@example.invalid",
  ListAgentDirectPhone: "",
  ListAgentPreferredPhone: "555-0100",
  ListAgentMobilePhone: "555-0101",
  ListAgentOfficePhone: "555-0102",
  ListOfficeMlsId: "INV-O1",
  ListOfficeName: "Example Realty",
  ListOfficePhone: "555-0199",
};

describe("agentContactOf", () => {
  const now = new Date("2026-10-30T12:00:00Z");
  it("maps the raw record, picking the first present phone and listing the present ones", () => {
    const r = agentContactOf(raw, "INV-1001", now);
    expect(r).toEqual({
      listing_id: "INV-1001",
      agent_mls_id: "INV-A77",
      agent_name: "Pat Example",
      agent_email: "pat@example.invalid",
      agent_phone: "555-0100",
      agent_phones: { preferred: "555-0100", mobile: "555-0101", office: "555-0102" },
      office_mls_id: "INV-O1",
      office_name: "Example Realty",
      office_phone: "555-0199",
      seen_at: "2026-10-30T12:00:00.000Z",
      updated_at: "2026-10-30T12:00:00.000Z",
    });
  });
  it("prefers the direct phone and nulls what is missing", () => {
    const r = agentContactOf({ ListAgentDirectPhone: "555-0001" }, "X", now);
    expect(r.agent_phone).toBe("555-0001");
    expect(r.agent_phones).toEqual({ direct: "555-0001" });
    expect(r.agent_email).toBeNull();
    expect(agentContactOf({}, "Y", now).agent_phone).toBeNull();
  });
});

describe("guard: agent contacts never reach a public surface", () => {
  it("forCard output carries no email / phone / mls_id key", () => {
    const l = { id: "K", price: 1, address: "1 A St", listOfficeName: "O", listAgentName: "N", photos: [] } as unknown as Listing;
    const keys = Object.keys(forCard(l));
    expect(keys.filter((k) => /email|phone|mls_?id/i.test(k))).toEqual([]);
  });
  it("the Listing type has no contact field", () => {
    const src = fs.readFileSync(path.join(process.cwd(), "lib/idx/types.ts"), "utf8");
    expect(/^\s*\w*(email|phone|mlsid)\w*\??:/im.test(src)).toBe(false);
  });
  it("only the sync, the writer and the backfill name idx_agent_contacts", () => {
    const files = execSync("git ls-files", { encoding: "utf8" }).split("\n").filter(Boolean);
    const allowed = [
      "app/api/cron/idx-sync/",
      "lib/idx/agent-contacts.ts",
      "lib/idx/agent-contacts.test.ts",
      "scripts/backfill-agent-contacts.mjs",
      "supabase/migrations/idx_agent_contacts.sql",
    ];
    const hits = files.filter((f) => {
      if (!/\.(ts|tsx|js|mjs|json|sql)$/.test(f) || allowed.some((a) => f.startsWith(a))) return false;
      return /idx_agent_contacts|agent-contacts/.test(fs.readFileSync(path.join(process.cwd(), f), "utf8"));
    });
    // lib/idx/mls-grid.ts imports the pure mapper (not the table); anything else is a leak.
    expect(hits.filter((f) => f !== "lib/idx/mls-grid.ts")).toEqual([]);
    const m = fs.readFileSync(path.join(process.cwd(), "lib/idx/mls-grid.ts"), "utf8");
    expect(m.includes("idx_agent_contacts")).toBe(false);
  });
  it("the public listing page shows only the agent NAME and the office, as before", () => {
    const src = fs.readFileSync(path.join(process.cwd(), "components/listing/ListingDetail.tsx"), "utf8");
    expect(/agent[_]?(email|phone)|ListAgentEmail|ListAgentDirectPhone|agent_phones?/i.test(src)).toBe(false);
  });
});
