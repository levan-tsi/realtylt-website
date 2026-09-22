"use client";

import { usePathname } from "next/navigation";
import { isNightRoute, sentenceCase } from "@/lib/site";

/** A label the day pages keep as written and the blue-hour pages set in sentence case (round 53),
 * for server components that cannot read the route themselves. Renders the text only. */
export function NightLabel({ text }: { text: string }) {
  return <>{isNightRoute(usePathname()) ? sentenceCase(text) : text}</>;
}
