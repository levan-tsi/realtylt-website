import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ACTIVITY_TYPES, buildRpcBody, parseBeacon } from "./contract";
import { IDENTITY_KEY, IDENTITY_TTL_MS, parseIdentity, readIdentityFrom, stampIdentityIn } from "./identity";

/** ROUND 51, D12: the anonymous-visitor emitter, held to the CRM door's published contract
 * (record_site_visit, SITE-VISITS-ANON-2026-09-17). */

describe("the beacon parser (untrusted browser input)", () => {
  it("accepts a real beacon and lowercases/bounds the identity", () => {
    const b = parseBeacon({
      type: "view_listing",
      path: "/homes-for-sale/NY/x",
      listingId: "KEY123",
      email: "  Ada@Example.COM ",
      meta: { address: "12 Main St", price: 500000, junk: "dropped", beds: 3 },
    })!;
    expect(b.type).toBe("view_listing");
    expect(b.email).toBe("ada@example.com");
    expect(b.meta).toEqual({ address: "12 Main St", price: "500000" });
    expect(b).not.toHaveProperty("phone");
  });

  it("refuses: unknown type, no identity, foreign path, junk body", () => {
    expect(parseBeacon({ type: "drop_table", path: "/", email: "a@b.co" })).toBeNull();
    expect(parseBeacon({ type: "view_page", path: "/plan" })).toBeNull();
    expect(parseBeacon({ type: "view_page", path: "https://evil.example", email: "a@b.co" })).toBeNull();
    expect(parseBeacon(null)).toBeNull();
    expect(parseBeacon("x")).toBeNull();
    // phone alone is an identity; a non-address email alone is not
    expect(parseBeacon({ type: "view_page", path: "/", phone: "9175550100" })).not.toBeNull();
    expect(parseBeacon({ type: "view_page", path: "/", email: "not-an-email" })).toBeNull();
  });

  it("builds the door's exact RPC body, nulls where the door wants nulls", () => {
    const body = buildRpcBody(parseBeacon({ type: "submit_form", path: "/selling", phone: "917" })!, "s3cret");
    expect(body).toEqual({
      p_secret: "s3cret",
      p_email: null,
      p_phone: "917",
      p_type: "submit_form",
      p_path: "/selling",
      p_listing_id: null,
      p_meta: {},
    });
  });

  it("the type vocabulary matches TrackView's plus the two anon-only types", () => {
    expect(ACTIVITY_TYPES).toContain("view_listing");
    expect(ACTIVITY_TYPES).toContain("submit_form");
    expect(ACTIVITY_TYPES).toContain("view_page");
  });
});

describe("the lead identity stamp", () => {
  const mem = (): Storage => {
    const m = new Map<string, string>();
    return {
      getItem: (k: string) => m.get(k) ?? null,
      setItem: (k: string, v: string) => void m.set(k, v),
      removeItem: (k: string) => void m.delete(k),
    } as Storage;
  };
  const now = 1_800_000_000_000;

  it("round-trips a stamp and normalises the email", () => {
    const s = mem();
    stampIdentityIn(s, { email: " Ada@X.co ", phone: " 917 " }, now);
    expect(readIdentityFrom(s, now)).toMatchObject({ email: "ada@x.co", phone: "917" });
  });

  it("expires after 90 days and refuses junk", () => {
    const s = mem();
    stampIdentityIn(s, { email: "a@b.co" }, now);
    expect(readIdentityFrom(s, now + IDENTITY_TTL_MS + 1)).toBeNull();
    expect(parseIdentity('{"email":"nope"}', now)).toBeNull();
    expect(parseIdentity("{broken", now)).toBeNull();
    expect(parseIdentity(null, now)).toBeNull();
  });

  it("an empty stamp writes nothing", () => {
    const s = mem();
    stampIdentityIn(s, {}, now);
    expect(s.getItem(IDENTITY_KEY)).toBeNull();
  });
});

describe("the wiring (source-held, like the CSP guard)", () => {
  const ROOT = path.resolve(__dirname, "../..");
  const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");

  it("the API route is the only caller of the door, and the secret never reaches a client file", () => {
    expect(read("app/api/activity/route.ts")).toContain("record_site_visit");
    const clientFiles = ["lib/activity/beacon.ts", "components/portal/TrackView.tsx", "components/leads/LeadForm.tsx", "components/leads/ListingLeadCTAs.tsx", "components/plan/PlanQuiz.tsx"];
    for (const f of clientFiles) {
      // Comments stripped: TrackView's doc comment names the door; naming is not calling.
      const src = read(f).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
      expect(src, `${f} must not hold the secret or call the door directly`).not.toMatch(/SITE_ACTIVITY_SECRET|record_site_visit/);
    }
  });

  it("every lead surface stamps on success; the listing view waits for auth before choosing a path", () => {
    for (const f of ["components/leads/LeadForm.tsx", "components/leads/ListingLeadCTAs.tsx", "components/plan/PlanQuiz.tsx"]) {
      expect(read(f), `${f} stamps the identity`).toContain("stampAndRecordSubmit(");
    }
    const tv = read("components/portal/TrackView.tsx");
    expect(tv).toContain("if (!ready) return;");
    expect(tv).toMatch(/if \(user\) \{\s*track\("view_listing"/);
    expect(tv).toContain('sendActivity("view_listing"');
  });
});
