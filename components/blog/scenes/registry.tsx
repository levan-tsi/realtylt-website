import type { ReactNode } from "react";
import type { FlagshipContent } from "@/lib/blog/flagship";
import { Cells } from "./primitives/Cells";
import { Flow } from "./primitives/Flow";
import { Offer } from "./primitives/Offer";
import { Quiz } from "./primitives/Quiz";
import { Steps } from "./primitives/Steps";
import { Tiles } from "./primitives/Tiles";
import { Timeline } from "./primitives/Timeline";

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
export function renderScene(key: string, content?: FlagshipContent): ReactNode {
  const scene = content?.scenes[key];
  if (!scene) return null;

  switch (scene.kind) {
    case "offer":
      return <Offer {...scene} />;
    case "cells":
      return <Cells {...scene} />;
    case "timeline":
      return <Timeline {...scene} />;
    case "flow":
      return <Flow {...scene} />;
    case "tiles":
      return <Tiles {...scene} />;
    case "steps":
      return <Steps {...scene} />;
    case "quiz":
      return <Quiz {...scene} />;
  }
}

/** Dark or light field, for the floating ToC's contrast. Declared per scene by the topic, so a
 * post controls its own band rhythm. An unknown key renders nothing, so "light" is the
 * harmless default. */
export function sceneBand(key: string, content?: FlagshipContent): "dark" | "light" {
  const band = content?.scenes[key]?.band ?? "light";
  // The quiz names its dark field "night" (its data shape was fixed for two lanes at once).
  return band === "night" ? "dark" : band;
}
