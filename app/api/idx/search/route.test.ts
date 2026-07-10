import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/idx/search — param clamping", () => {
  it("pageSize=0 is clamped to 1 (no Infinity → null totalPages)", async () => {
    const res = await GET(new Request("http://localhost/api/idx/search?pageSize=0"));
    const json = await res.json();
    expect(Number.isFinite(json.totalPages)).toBe(true);
    expect(json.totalPages).toBeGreaterThanOrEqual(1);
    expect(json.pageSize).toBe(1);
    expect(json.listings.length).toBe(1);
  });

  it("page=0 is clamped to page 1", async () => {
    const res = await GET(new Request("http://localhost/api/idx/search?page=0"));
    const json = await res.json();
    expect(json.page).toBe(1);
  });
});
