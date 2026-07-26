import type { ReactNode } from "react";
import { LeadsCalculator } from "./LeadsCalculator";
import { ResponseGap } from "./ResponseGap";

/** The flagship scene registry.
 *
 * A body opts a scene in by placing a `[[scene:key]]` line in its markdown (see
 * lib/blog/markdown.tsx). Keys are matched here; an unknown key renders nothing, so a typo
 * in a CRM-published body degrades to a missing scene rather than a broken page.
 *
 * Every scene is full-bleed and self-contained: it owns its own layout, background and CSS,
 * and must read as a finished still (carousel slide) as well as a scroll moment.
 */
const SCENES: Record<string, () => ReactNode> = {
  "response-gap": ResponseGap,
  "leads-calculator": LeadsCalculator,
};

export function renderScene(key: string): ReactNode {
  const Scene = SCENES[key];
  return Scene ? <Scene /> : null;
}
