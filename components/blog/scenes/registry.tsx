import type { ReactNode } from "react";
import type { ComponentId, FlagshipContent } from "@/lib/blog/flagship";
import { Conversation } from "./primitives/Conversation";
import { Diagram } from "./primitives/Diagram";
import { Film } from "./primitives/Film";
import { Grid } from "./primitives/Grid";
import { Plate } from "./primitives/Plate";
import { Statement } from "./primitives/Statement";
import { StatBars } from "./primitives/StatBars";
import { Summary } from "./primitives/Summary";
import { LeadsCalculator } from "./LeadsCalculator";
import { ResponseCurve } from "./ResponseCurve";
import { ResponseGap } from "./ResponseGap";
import { SystemDiagram } from "./SystemDiagram";
import { Teardown } from "./Teardown";

/** The flagship scene registry.
 *
 * A body opts a scene in by placing a `[[scene:key]]` line in its markdown (see
 * lib/blog/markdown.tsx). The key is resolved against the CURRENT POST's content object rather
 * than a global table, which is what makes this a template instead of one page: two topics can
 * both place `[[scene:four-moves]]` and get their own words, their own column count and their
 * own band.
 *
 * A key with no entry renders nothing, so a typo in a CRM-published body degrades to a missing
 * scene rather than a broken page.
 *
 * Every scene is full-bleed and self-contained: it owns its own layout, background and CSS, and
 * must read as a finished still (a carousel slide) as well as a scroll moment.
 */

/** Bespoke components: the scenes not yet reduced to primitives, plus the calculator, whose
 * model is genuinely per-topic and cannot be expressed as data. */
const COMPONENTS: Record<ComponentId, () => ReactNode> = {
  "response-curve": ResponseCurve,
  "response-gap": ResponseGap,
  "cold-open-calculator": LeadsCalculator,
  teardown: Teardown,
  "system-diagram": SystemDiagram,
};

/** ARIA labels for grid instances. The primitive cannot invent one, and a full-bleed landmark
 * with no accessible name is a landmark a screen-reader user cannot navigate to. */
const GRID_LABELS: Record<string, string> = {
  "four-moves": "The four moves",
  "failure-modes": "Where it goes wrong",
};

export function renderScene(key: string, content?: FlagshipContent): ReactNode {
  const scene = content?.scenes[key];
  if (!scene) return null;

  switch (scene.kind) {
    case "grid":
      return <Grid {...scene} ariaLabel={GRID_LABELS[key] ?? scene.heading} />;
    case "summary":
      return <Summary {...scene} />;
    case "statement":
      return <Statement {...scene} />;
    case "statbars":
      // The scene key seeds the SVG's aria ids, so two charts on one page cannot collide.
      return <StatBars {...scene} idBase={`sb-${key}`} />;
    case "diagram":
      return <Diagram {...scene} idBase={`dg-${key}`} />;
    case "conversation":
      return <Conversation {...scene} />;
    case "plate":
      return <Plate {...scene} />;
    case "film":
      // A film scene without a film is a content error, not a render error.
      return content.film ? <Film {...scene} film={content.film} /> : null;
    case "component": {
      const Component = COMPONENTS[scene.id];
      return Component ? <Component /> : null;
    }
  }
}

/** Dark or light field, for the floating ToC's contrast. Declared per scene by the topic, so a
 * post controls its own band rhythm. An unknown key renders nothing, so "light" is the
 * harmless default. */
export function sceneBand(key: string, content?: FlagshipContent): "dark" | "light" {
  return content?.scenes[key]?.band ?? "light";
}
