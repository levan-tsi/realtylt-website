import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { priceDiff } from "./ListingCard";

/** ROUND 50 FUNNEL TRIO, held together: the tour sheet's free-text message (6a), Previous/Next
 * on every rail that opens a listing (6b), and price-cut / status-change chips on saved homes
 * (6c), which ride the change history the hourly sync's trigger keeps beside the JSONB. */
const ROOT = path.resolve(__dirname, "../..");
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");

describe("6c: the price-cut shorthand", () => {
  it("says a cut the way the site says prices", () => {
    expect(priceDiff(15_000)).toBe("$15k");
    expect(priceDiff(750)).toBe("$750");
    expect(priceDiff(1_200_000)).toBe("$1.2M");
    expect(priceDiff(2_000_000)).toBe("$2M");
    expect(priceDiff(24_499)).toBe("$24k");
  });
});

describe("6c: the change history reaches the card", () => {
  it("the card reads select the three change columns beside the JSONB", () => {
    const db = read("lib/idx/db.ts");
    expect(db).toContain('const CARD_SELECT = "select=listing,photos_servable,previous_price,price_changed_at,status_changed_at"');
    expect(db).toMatch(/previousPrice: Number\(r\.previous_price\)/);
    expect(db).toContain("priceChangedAt: r.price_changed_at");
    expect(db).toContain("statusChangedAt: r.status_changed_at");
  });

  it("the migration is a BEFORE UPDATE OF listing trigger that compares OLD.price with the new JSONB price", () => {
    const sql = read("supabase/migrations/idx_round50_price_history.sql");
    expect(sql).toMatch(/before update of listing on public\.idx_listings/);
    expect(sql).toContain("NEW.listing->>'price'");
    expect(sql).toMatch(/OLD\.price <> new_price/);
    expect(sql).toMatch(/NEW\.previous_price := OLD\.price/);
    expect(sql).toMatch(/NEW\.status_changed_at := now\(\)/);
    // Additive only: no RLS, no grants, no change to the sync RPC.
    expect(sql).not.toMatch(/policy|grant |idx_sync_apply\s*\(/i);
  });

  it("the chips are gated on `changes`, and only the saved-homes grid turns them on", () => {
    const card = read("components/idx/ListingCard.tsx");
    expect(card).toContain("changes = false");
    expect(card).toMatch(/changes && l\.previousPrice != null && l\.previousPrice > l\.price && recent\(l\.priceChangedAt\)/);
    expect(card).toContain("Back on market");
    const on = ["components/portal/FavoriteListings.tsx"];
    for (const f of on) expect(read(f)).toContain("<ListingCard listing={l} changes />");
    // Search results, rails and the similar-homes rail stay quiet.
    for (const f of ["components/search/SearchClient.tsx", "components/idx/DriftRail.tsx", "components/idx/RailPager.tsx", "components/listing/ListingDetail.tsx"]) {
      expect(read(f), `${f} must not turn on change chips`).not.toMatch(/<ListingCard[^>]*\bchanges\b/);
    }
  });
});

describe("6b: every grid that opens a listing records itself as the result set", () => {
  it.each([
    ["components/portal/FavoriteListings.tsx", '<ResultSetScope listings={listings} backHref="/saved">'],
    ["components/listing/ListingDetail.tsx", "<ResultSetScope\n              listings={similar}"],
    ["components/idx/DriftRail.tsx", "<ResultSetScope"],
    ["components/idx/RailPager.tsx", "<ResultSetScope"],
    ["app/top-areas/[county]/page.tsx", "<ResultSetScope"],
  ])("%s wraps its cards", (file, needle) => {
    expect(read(file).replace(/\r\n/g, "\n")).toContain(needle);
  });
});

describe("6a: the tour sheet takes a message and forwards it", () => {
  it("has the optional textarea and posts data.message, like the offer sheet", () => {
    const src = read("components/leads/ListingLeadCTAs.tsx");
    expect((src.match(/name="message"/g) ?? []).length).toBe(2);
    expect((src.match(/message: data\.message,/g) ?? []).length).toBe(2);
  });
});
