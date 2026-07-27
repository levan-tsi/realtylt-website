import type { ReactNode } from "react";
import { FailureModes } from "./FailureModes";
import { FourMoves } from "./FourMoves";
import { Funnel } from "./Funnel";
import { InShort } from "./InShort";
import { LeadsCalculator } from "./LeadsCalculator";
import { PullQuote } from "./PullQuote";
import { ResponseGap } from "./ResponseGap";
import { Teardown } from "./Teardown";

/** The flagship scene registry.
 *
 * A body opts a scene in by placing a `[[scene:key]]` line in its markdown (see
 * lib/blog/markdown.tsx). Keys are matched here; an unknown key renders nothing, so a typo
 * in a CRM-published body degrades to a missing scene rather than a broken page.
 *
 * Every scene is full-bleed and self-contained: it owns its own layout, background and CSS,
 * and must read as a finished still (carousel slide) as well as a scroll moment.
 *
 * `band` declares whether the scene paints a dark or light field. The floating table of
 * contents reads it to flip its own contrast as it passes over each band, which is the one
 * problem the service-page rail never had to solve (components/blog/FlagshipToc.tsx).
 */
interface SceneDef {
  Component: () => ReactNode;
  band: "dark" | "light";
}

const SCENES: Record<string, SceneDef> = {
  "in-short": { Component: InShort, band: "light" },
  "response-gap": { Component: ResponseGap, band: "dark" },
  "leads-calculator": { Component: LeadsCalculator, band: "light" },
  "four-moves": { Component: FourMoves, band: "dark" },
  "pull-quote": { Component: PullQuote, band: "dark" },
  teardown: { Component: Teardown, band: "light" },
  "failure-modes": { Component: FailureModes, band: "light" },
  funnel: { Component: Funnel, band: "dark" },
};

export function renderScene(key: string): ReactNode {
  const def = SCENES[key];
  if (!def) return null;
  const Scene = def.Component;
  return <Scene />;
}

/** Dark or light field, for the floating ToC's contrast. An unknown key renders nothing, so
 * "light" is the harmless default. */
export function sceneBand(key: string): "dark" | "light" {
  return SCENES[key]?.band ?? "light";
}
