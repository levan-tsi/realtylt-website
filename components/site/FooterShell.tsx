"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** The footer's own element, so the (server) Footer can take the home page's stacking and ground.
 * usePathname renders on the server too, so the result is in the first HTML. The night tokens
 * come from the root since round 60 (app/layout.tsx); the class stays so the footer's own rules
 * (`.nocturne .bg-ink.night:bg-night-deep`) keep their scope. */
export function FooterShell({ className, children }: { className: string; children: ReactNode }) {
  const pathname = usePathname();
  // THE HOME PAGE ONLY. Its night flight is a canvas fixed behind the page, inside a wrapper that
  // is its own stacking context, which paints the whole wrapper above the ordinary flow: without a
  // position of its own the footer ended up UNDER the scene, with the lights running through the
  // contact form. Positioned here rather than in the shared className so no other page's stacking
  // changes; day pages get this component byte-identical (components/site/footer-stacking.test.ts).
  const overScene = pathname === "/" ? "relative z-10 " : "";
  // ...and on the home page its ground is the SCENE. Opaque, the footer cut the last shot — the
  // whole region from 140 km up — in half with a straight line across the window (round 54,
  // builder 3). The flight now has a last leg that holds the region behind the footer under a
  // strong veil (app/page.tsx `tail`), so the territory fades out under the words instead of
  // being sliced. An inline style, not a class: `bg-paper` is in the className this component is
  // given, and two utilities of equal specificity would be decided by stylesheet order.
  // Home only; every other footer, day or night, is byte-identical (footer-stacking.test.ts).
  const style = pathname === "/" ? { backgroundColor: "transparent" as const } : undefined;
  return (
    <footer className={`nocturne ${overScene}${className}`} style={style}>
      {children}
    </footer>
  );
}
