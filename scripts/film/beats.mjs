// Shared beat arithmetic and the transition grammar. Imported by every film's cut.mjs and bg.mjs.
//
// WHY IT IS SHARED. The workflow film worked out both of these and the other films would
// otherwise have got copies. A copied rule is a rule that drifts: the whole reason cut.mjs exists
// is that three films each held their own hand-typed length and a fade point, and a re-recorded
// line faded an entire render to black because only one of the copies was updated.

/** Turn a list of beats carrying source `in`/`out` points into beats carrying absolute film
 *  `from`/`to`. A beat's length is how much of its clip it uses, so the two are the same number
 *  read two ways, and writing either one down twice is how they drift apart.
 *
 *  THE TOTAL IS ASSERTED, NOT CLAMPED. Both of these films' beats sum to their film length
 *  exactly, so a mistyped in-point is a real defect: it would shift every later beat and slide the
 *  picture off the narration by a fraction of a second per beat, which is precisely the kind of
 *  fault that survives a contact sheet. Better to refuse to build. */
export function sequence(beats, filmLen) {
  let t = 0;
  const out = beats.map((b) => {
    const dur = +((b.out ?? b.dur + b.in) - b.in).toFixed(3);
    const from = t;
    t = +(t + dur).toFixed(3);
    return { ...b, dur, from: +from.toFixed(3), to: +t.toFixed(3) };
  });
  if (Math.abs(t - filmLen) > 0.02) {
    throw new Error(`beats sum to ${t.toFixed(2)}s but the film is ${filmLen}s. ` +
      `A beat's in/out is wrong, or the narration changed and the plan did not.`);
  }
  return out;
}

/** What happens at this beat's two edges, decided by its NEIGHBOURS rather than declared.
 *
 *  The brief was "design the transitions, do not just crossfade everything", and that is right: a
 *  dissolve between two unrelated generated clips is the single most slideshow-like thing a cut
 *  can do. So:
 *
 *    footage -> black    the picture falls away, so the footage DIPS into the card.
 *    black -> footage    the picture returns, so the footage LIFTS out of the card.
 *    footage -> footage  a HARD CUT. Two real shots meeting is correct film grammar and needs no
 *                        help; softening it is what makes a showreel look like a wedding video.
 *
 *  Two exemptions, both of which would be defects if they were not made explicit:
 *    - The FIRST beat never lifts. The poster is frame zero and the hook number is the reason
 *      anybody presses play, so frame zero must be the picture and not a black frame the fade has
 *      not finished leaving.
 *    - The LAST beat never dips, because assemble.mjs already fades the whole film at FADE_AT.
 *      Doing both darkens the close twice. */
export function moves(plan, i) {
  const b = plan[i], prev = plan[i - 1], next = plan[i + 1];
  if (!b.clip) return { lift: false, dip: false, label: "-" };
  const lift = Boolean(prev && !prev.clip);
  const dip = Boolean(next && !next.clip);
  return { lift, dip, label: [lift && "lift", dip && "dip"].filter(Boolean).join("+") || "cut" };
}

/** How long a dip or a lift takes. One number for every film so they feel like a series. */
export const DIP = 0.35;

/** The video filter chain for a beat's transitions, or "" for a hard cut. */
export function fadeChain(plan, i, dur) {
  const { lift, dip } = moves(plan, i);
  return [
    lift ? `fade=t=in:st=0:d=${DIP}` : null,
    dip ? `fade=t=out:st=${(dur - DIP).toFixed(3)}:d=${DIP}` : null,
  ].filter(Boolean).join(",");
}
