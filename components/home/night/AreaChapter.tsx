import type { AreaShot } from "./shots";

/** One row of WHERE WE WORK, the chapter where the scene IS the content (round 54; drawn by
 * components/home/ml/MlAreaChapter.tsx). */
export interface AreaRow {
  shot: AreaShot;
  /** The feed's county slug, which is also the key in the lights' own counts. */
  slug: string;
  name: string;
  href: string;
  group: "valley" | "city";
}
