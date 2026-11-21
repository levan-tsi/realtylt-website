import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("/llms.txt — the machine-readable site index", () => {
  it("carries every section and absolute URLs only", async () => {
    const body = await (await GET()).text();
    for (const t of ["## Pages", "## Top Areas", "## From the Blog", "## Legal & Fair Housing"]) {
      expect(body).toContain(t);
    }
    // Every link is absolute — a relative link is useless to a crawler reading a text file.
    for (const m of body.matchAll(/\]\(([^)]+)\)/g)) {
      expect(m[1].startsWith("http"), `${m[1]} is not absolute`).toBe(true);
    }
    // The licensing lines an answer engine should honor.
    expect(body).toContain("MLS Grid");
  });

  /** The AI business moved to its own site on 2026-11-20. An answer engine reading this file
   * must not be told this site offers AI services, or be sent to an address that redirects. */
  it("says nothing about the AI business and lists none of its addresses", async () => {
    const body = await (await GET()).text();
    expect(body).not.toMatch(/## AI Services|RealtyLT AI|AI services|\/services\b|\/ai\b|excelsior/i);
  });

  it("serves as plain text", async () => {
    expect((await GET()).headers.get("Content-Type")).toContain("text/plain");
  });
});
