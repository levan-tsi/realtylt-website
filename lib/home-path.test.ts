import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { isHomePath } from "./site";

/**
 * 2026-09-27, live: after Vercel regenerated the cached home page (app/page.tsx `revalidate`) the
 * header, the footer and the scene credit rendered their inner-page selves on the home page, under
 * the fixed map (the owner: "there is no more menu bar ... there's no footer even ... it's just
 * black"; a refresh hid them, a click back through the logo brought them back). The regenerated
 * page's RSC tree read ["","index"]: `usePathname()` said "/index". The home page is either.
 */
describe("the home page's path", () => {
  it("is / or the regeneration's /index, nothing else", () => {
    expect(isHomePath("/")).toBe(true);
    expect(isHomePath("/index")).toBe(true);
    for (const p of ["/search", "/indexes", "/blog/index", "", null, undefined]) expect(isHomePath(p)).toBe(false);
  });

  it("is what the header, the footer and the scene credit ask", () => {
    const root = path.resolve(import.meta.dirname, "..");
    for (const f of ["components/site/Header.tsx", "components/site/FooterShell.tsx", "components/site/SceneCredit.tsx"]) {
      const src = fs.readFileSync(path.join(root, f), "utf8");
      expect(src, f).toContain("isHomePath(pathname)");
      expect(src, f).not.toMatch(/pathname [!=]== "\/"/);
    }
  });
});
