import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** ROUND 61, THE FIRST SECOND: what the home page's first bundle must not carry again. Each of these
 * was measured in it (docs/parity/DESIGN-ROUND61.md §1) and split out; a static import brings it
 * straight back into the chunk every visitor downloads and parses before the page can hydrate. */
const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const imports = (src: string) => [...src.matchAll(/^import\s[^;]*?from\s+"([^"]+)";?|^import\s+"([^"]+)";?/gm)].map((m) => m[1] ?? m[2]);

describe("the home page's first bundle (round 61)", () => {
  it("app/page.tsx imports no other ground directly: they come from the client-side split", () => {
    const page = imports(read("app/page.tsx"));
    for (const p of ["@/components/home/night/NightGround", "@/components/home/night/AreaChapter", "@/components/home/g3d/G3dGround", "@/components/home/g3d/G3dAreaChapter"]) {
      expect(page, p).not.toContain(p);
    }
    expect(page).toContain("@/components/home/other-grounds");
    const split = read("components/home/other-grounds.ts");
    expect(split.startsWith('"use client";')).toBe(true);
    for (const m of ["NightGround", "AreaChapter", "G3dGround", "G3dAreaChapter"]) {
      expect(split).toMatch(new RegExp(`export const ${m} = dynamic\\(\\(\\) => import\\(`));
    }
    // A static import of any of them in the split module would undo it.
    expect(imports(split)).toEqual(["next/dynamic"]);
  });

  it("the plates ground loads the live map's controller (and MapLibre's stylesheet) only when the live map is the ground", () => {
    const ground = read("components/home/ml/MlGround.tsx");
    const statics = imports(ground);
    expect(statics).not.toContain("./controller");
    expect(statics).not.toContain("maplibre-gl/dist/maplibre-gl.css");
    expect(ground).toContain('import("./controller")');
    // The stylesheet travels with the controller's chunk.
    expect(imports(read("components/home/ml/controller.ts"))).toContain("maplibre-gl/dist/maplibre-gl.css");
  });

  it("PostHog is not in the layout's first bundle: it is imported once the browser is idle", () => {
    const init = read("components/site/PostHogInit.tsx");
    expect(imports(init)).not.toContain("posthog-js");
    expect(init).toContain('import("posthog-js")');
    expect(init).toContain("requestIdleCallback");
  });

  it("nothing below the fold is preloaded ahead of the hero's plate", () => {
    // next/image's `priority` preloads with the document; the carousel and the featured rail sit
    // screens below the map.
    expect(read("components/home/WhyCarousel.tsx")).not.toMatch(/\spriority=/);
    expect(read("components/idx/DriftRail.tsx")).not.toMatch(/\spriority=/);
  });

  it("the plate's engine does not wait on decode() for a picture already in", () => {
    const ctl = read("components/home/plates/plate-controller.ts");
    expect(ctl).toContain("if (!(img.complete && img.naturalWidth > 0)) await this.decoded(img);");
  });

  it("the hero's rise is 0.45 s on the same curve; everywhere else keeps 0.7 s", () => {
    const css = read("app/globals.css");
    expect(css).toMatch(/\.rise \{\s*animation: rise-in 0\.7s var\(--ease-out\) both;\s*\}/);
    expect(css).toMatch(/\[data-shot="hero"\] \.rise \{\s*animation-duration: 0\.45s;\s*\}/);
  });

  it("no Suspense boundary round the page's sections: it streamed them into a hidden div (JS off saw nothing below the hero)", () => {
    // Tried in round 61 for an earlier hydration of the ground: the prerender put everything below
    // the hero into `<div hidden id="S:0">` for an inline script to reveal, so with JavaScript off
    // the rails, the intake and the rest were never shown; the gain was within the noise.
    expect(read("app/page.tsx")).not.toContain("<Suspense");
  });
});
