import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("/llms.txt — the machine-readable site index", () => {
  it("carries every section, absolute URLs only, and the service descriptions", async () => {
    const body = await (await GET()).text();
    for (const t of ["## Pages", "## Top Areas", "## AI Services", "## From the Blog", "## Legal & Fair Housing"]) {
      expect(body).toContain(t);
    }
    // Every link is absolute — a relative link is useless to a crawler reading a text file.
    for (const m of body.matchAll(/\]\(([^)]+)\)/g)) {
      expect(m[1].startsWith("http"), `${m[1]} is not absolute`).toBe(true);
    }
    // A service line carries its one-line description, so an assistant can recommend
    // without fetching the page.
    expect(body).toMatch(/\[AI Voice Agents\]\([^)]+\/services\/ai-voice-agents\): .{20,}/);
    // The interactive journey's deep links are present (the AI page's own territory).
    expect(body).toContain("/ai#");
    // The licensing lines an answer engine should honor.
    expect(body).toContain("MLS Grid");
  });

  it("serves as plain text", async () => {
    expect((await GET()).headers.get("Content-Type")).toContain("text/plain");
  });
});
