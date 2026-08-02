// THE CUT, in one place. Imported by bg.mjs, render.mjs and assemble.mjs.
//
// WHY THIS FILE EXISTS. The three earlier films each wrote the film's length into two or three
// scripts by hand, and the fade-to-black point into one of them. That works until a line is
// re-recorded: the cut grows, the hardcoded fade stays where it was, and the last third of the
// render fades to black. It happened. Nothing downstream of here may type a length or a fade
// point; both are functions of the measured narration.
import { readFileSync } from "node:fs";

export const SCHED_PATH = "scripts/_scratch-video/workflow-vo/schedule.json";
export const FPS = 30;
export const W = 1280;
export const H = 720;

/** Hold on the close card after the last word lands. */
export const TAIL = 1.63;
/** How long the film takes to fall to black at the very end. */
export const FADE = 0.5;

export const sched = JSON.parse(readFileSync(SCHED_PATH, "utf8"));

/** Where line i begins. */
export const start = (i) => sched[i].start;
/** Where line i+1 begins, which is the far edge of the beat line i owns. */
export const gapEnd = (i) => sched[i + 1].start;

export const LAST_WORD = sched.at(-1).end;
export const FILM_LEN = +(LAST_WORD + TAIL).toFixed(2);
export const FADE_AT = +(FILM_LEN - FADE).toFixed(2);

/** THE BEATS. Picture and sound both read this, so a beat cannot have one and not the other.
 *
 *  It used to live in bg.mjs, which meant the sound plan would have been a SECOND list of the
 *  same nine boundaries, free to drift from the first exactly the way FILM_LEN and FADE_AT once
 *  did. Here there is one list: `clip` is what the eye gets, `amb` is what the ear gets, and
 *  `from`/`to` are shared.
 *
 *  Every `amb` names a bed in scripts/film/sfx. A black beat is NOT silence - a hole in the
 *  sound is heard as a fault, not as a pause - so the black cards get amb-void, a deep steady
 *  floor that is obviously a room rather than obviously nothing.
 *
 *  `in` is the in-point into the source clip. `from`/`to` are FILM times taken from the
 *  schedule; the segment length follows. */
export const PLAN = [
  { beat: "A1 the hook, on the desk", clip: "shot7-signup-callback", in: 0.4, from: 0, to: 4.4,
    amb: "amb-desk-day", why: "the laptop and the phone the whole article is about" },
  { beat: "A2 the number alone", clip: null, in: 0, from: 4.4, to: gapEnd(0),
    amb: "amb-void", why: "black: the picture falls away and 25 is all that is left" },
  { beat: "B1 nobody sees it", clip: "shot2-empty-office", in: 1.0, from: gapEnd(0), to: gapEnd(1),
    amb: "amb-night-interior", why: "the office the form lands in, at night, empty" },
  { beat: "B2 the same lead by hand", clip: null, in: 0, from: gapEnd(1), to: gapEnd(2),
    amb: "amb-void", why: "black, because four timed rows only read on black" },
  { beat: "B3 forty times a month", clip: "shot5-morning-ring", in: 0.6, from: gapEnd(2), to: gapEnd(3),
    amb: "amb-dawn-kitchen", why: "sunrise: the morning it finally gets read" },
  { beat: "D  the chain, wired", clip: null, in: 0, from: gapEnd(3), to: gapEnd(4),
    amb: "amb-void", why: "black: a six node spine in hairline type needs it" },
  { beat: "E  answered on the site", clip: "shot3-reply-glow", in: 0.4, from: gapEnd(4), to: gapEnd(5),
    amb: "amb-night-interior", why: "the reply already on their phone" },
  { beat: "F  the rule", clip: null, in: 0, from: gapEnd(5), to: gapEnd(6),
    amb: "amb-void", why: "black: the one line in this film worth remembering" },
  { beat: "G  the close", clip: "shot6-keys-porch", in: 0.31, from: gapEnd(6), to: FILM_LEN,
    amb: "amb-porch-morning", why: "keys changing hands on a porch" },
];

/** Single sounds, placed in the SILENCE BETWEEN narrated lines rather than over a word.
 *  `afterLine` is the line the sound follows, so the placement is derived from the measured
 *  narration and moves with it; `nudge` shifts it inside that gap.
 *
 *  KEEP THIS LIST SHORT. One sound the viewer was already expecting is a production value; four
 *  is a cartoon. Two in a 59-second film is the ceiling, not the target.
 *
 *  This narration is nearly continuous - every gap in it is between 0.45 and 0.90 seconds - so a
 *  sound gets trimmed to its gap and faded rather than ringing on under the next sentence. That
 *  is a deliberate constraint, not a limitation: nothing in the mix is ever competing with a
 *  word, which is why the transcription check can be trusted to mean what it says. */
export const HITS = [
  // The reply lands on their phone while they are still on the site. This is the beat the whole
  // film is arguing for, and it is the one moment a sound says it faster than the narration can.
  // It sits under the picture of the glowing screen, just after the line that claims it.
  { sfx: "hit-notify", afterLine: 5, nudge: 0.1, why: "the answer arriving, over the glowing screen" },
  // Keys, once, in the gap BEFORE the picture cuts to the porch: the sound arrives first and the
  // image confirms it, which is a older and better trick than landing both on the same frame.
  { sfx: "hit-keys", afterLine: 6, nudge: 0.2, why: "the handover, a beat before we see it" },
];
