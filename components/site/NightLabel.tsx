import { sentenceCase } from "@/lib/site";

/** A label stored in Title Case, set in sentence case the way every page sets its labels (round 53
 * on the night pages, round 60 everywhere). Renders the text only. */
export function NightLabel({ text }: { text: string }) {
  return <>{sentenceCase(text)}</>;
}
