"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isNightRoute } from "@/lib/site";

/** The footer's own element, so the (server) Footer can wear the blue-hour tokens on the routes
 * whose page does (lib/site.ts NIGHT_ROUTES). usePathname renders on the server too, so the
 * class is in the first HTML and there is no light-to-dark flash. */
export function FooterShell({ className, children }: { className: string; children: ReactNode }) {
  const pathname = usePathname();
  const night = isNightRoute(pathname);
  // THE HOME PAGE ONLY. Its night flight is a canvas fixed behind the page, inside a wrapper that
  // is its own stacking context, which paints the whole wrapper above the ordinary flow: without a
  // position of its own the footer ended up UNDER the scene, with the lights running through the
  // contact form. Positioned here rather than in the shared className so no other page's stacking
  // changes; day pages get this component byte-identical (components/site/footer-stacking.test.ts).
  const overScene = pathname === "/" ? "relative z-10 " : "";
  return <footer className={`${night ? "nocturne " : ""}${overScene}${className}`}>{children}</footer>;
}
