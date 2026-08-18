/** Four facts about the business, stated. No count-up.
 *
 * THE COUNT-UP IS GONE, AND THE COMPONENT'S OWN RULE IS WHY. This file has said "NEVER SHOW A
 * NUMBER THAT IS NOT TRUE" since round 32, when it was found resetting to 0 on mount and printing
 * "0 counties & boroughs served" to anyone whose viewport already held the block. That fix guarded
 * the zero behind a below-the-fold check, and it worked — but it treated the symptom. Two things
 * an adversarial review then measured on production:
 *
 *   • the observer fired at `threshold: 0.5`, so the row still printed "0 / 0h / 0+ / 0" from the
 *     moment its top edge entered the viewport until it was HALF visible — photographed at 1440
 *     with a 40px slice of zeros on screen;
 *   • and the count itself displays false numbers for the whole 1,400ms it runs — captured
 *     mid-count at 44px: "7 / 16h / 66+ / 5". Every one of those is a untrue statement about the
 *     business, at the largest type size on that block, for longer than it takes to read.
 *
 * There is no threshold that fixes the second one. A count-up cannot satisfy "never show a number
 * that is not true", because displaying wrong numbers on the way to the right one is the entire
 * mechanism. So the choice is to keep the animation and drop the rule, or keep the rule and drop
 * the animation, and the rule is worth more: these are the only four numbers the front door states
 * about the business.
 *
 * Nothing is lost visually. The block already arrives inside the section's `.reveal` (opacity and
 * a 16px rise), which is honest motion — it animates the block's ARRIVAL and never its VALUE. What
 * goes away with the count is a client component, an IntersectionObserver, a requestAnimationFrame
 * loop, three pieces of state and a whole class of hydration-timing bug. The file's own round-11
 * note already observed that four bold numerals over four grey captions is the most templated block
 * on the web and that what was worth changing is the setting, not the content; the count-up was the
 * last piece of that template still running.
 *
 * No "use client": with nothing to animate this renders on the server, so the true values are in
 * the HTML for every visitor, every crawler, and every scripting-off reader by construction rather
 * than by a guard that has to be got right. */
export function StatCounter({
  value,
  prefix = "",
  suffix = "",
  label,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}) {
  return (
    <div>
      {/* The number carries the display face at its lightest weight and the label drops to the
          eyebrow style. */}
      <p className="t-h1 text-ink">
        {prefix}
        {value.toLocaleString("en-US")}
        {suffix}
      </p>
      <p className="t-eyebrow mt-3 text-stone">{label}</p>
    </div>
  );
}
