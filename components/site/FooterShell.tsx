"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isNightRoute } from "@/lib/site";

/** The footer's own element, so the (server) Footer can wear the blue-hour tokens on the routes
 * whose page does (lib/site.ts NIGHT_ROUTES). usePathname renders on the server too, so the
 * class is in the first HTML and there is no light-to-dark flash. */
export function FooterShell({ className, children }: { className: string; children: ReactNode }) {
  const night = isNightRoute(usePathname());
  return <footer className={`${night ? "nocturne " : ""}${className}`}>{children}</footer>;
}
