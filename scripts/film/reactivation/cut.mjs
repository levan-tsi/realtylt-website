// THE CUT, in one place. Imported by bg.mjs, render.mjs, bed.mjs and assemble.mjs.
//
// WHY THIS FILE EXISTS. This film used to write its length into assemble.mjs by hand (FILM_LEN
// 48.6, FADE_AT 48.1) and its picture beats into bg.mjs separately. That works until a line is
// re-recorded: the cut grows, the hardcoded fade stays where it was, and the last third of the
// render fades to black. It has already happened once on the voice film. Nothing downstream of
// here may type a length or a fade point.
//
// THE PICTURE DID NOT MOVE when this file was introduced. TAIL is set to the value that
// reproduces the previously hardcoded 48.6, so FILM_LEN and FADE_AT come out identical and every
// beat boundary is byte-for-byte where it was. The trap is removed without re-cutting the film.
import { readFileSync } from "node:fs";
import { sequence } from "../beats.mjs";

export const SCHED_PATH = "scripts/_scratch-video/reactivation-vo/schedule.json";
export const FPS = 30;
export const W = 1280;
export const H = 720;

/** Hold on the close card after the last word lands. */
export const TAIL = 1.52;
/** How long the film takes to fall to black at the very end. */
export const FADE = 0.5;

export const sched = JSON.parse(readFileSync(SCHED_PATH, "utf8"));

export const LAST_WORD = sched.at(-1).end;
export const FILM_LEN = +(LAST_WORD + TAIL).toFixed(2);
export const FADE_AT = +(FILM_LEN - FADE).toFixed(2);

/** THE BEATS. Picture and sound both read this, so a beat cannot have one and not the other.
 *
 *  `clip` is what the eye gets and `amb` is what the ear gets. A black beat is NOT silence - a
 *  hole in the sound is heard as a fault rather than as a pause - so the black card gets
 *  amb-void, a deep steady floor that is audibly a room rather than audibly nothing.
 *
 *  `in`/`out` are points INSIDE the source clip, and the beat runs for exactly that long. These
 *  are the numbers this film already used; they sum to 48.60, which is why FILM_LEN comes out at
 *  the previously hardcoded value and no boundary moves. */
export const PLAN = sequence([
  { beat: "A  hook, the two-thirds stat", clip: "shot4-hudson-aerial", in: 0.0, out: 6.9,
    amb: "amb-open-air", why: "the valley, wide and calm, under the number" },
  { beat: "B1 the inquiry, back then", clip: "shot1-1140pm-lead", in: 0.6, out: 5.8,
    amb: "amb-night-interior", why: "a phone lighting up on a counter at night" },
  // srcEnd 7.15, not the 8.0 this beat runs for. Measured 2026-08-02 at 0.2s steps: the slow
  // push-in over the paper stacks holds cleanly to ~7.2, then the clip HARD CUTS to an unrelated
  // filing-cabinet shot — the defect that failed the footage audit, and it was inside the range
  // this film used. The 7.15s that survive stretch to fill the 8.0s beat; the shot is a slow
  // push-in on static paper, so the 12% slowdown reads as nothing at all.
  { beat: "B2 and nobody called", clip: "shot11-old-records", in: 0.0, out: 8.0, srcEnd: 7.15,
    amb: "amb-night-interior", why: "stacks of paper records nobody has opened: the list itself" },
  { beat: "D  the three-month clock", clip: null, in: 0, out: 8.35,
    amb: "amb-void", why: "black, so the regulation is the only thing on screen" },
  { beat: "E  the opener", clip: "shot3-reply-glow", in: 0.5, out: 6.4,
    amb: "amb-night-interior", why: "a reply glowing on a screen" },
  { beat: "F  the outcome", clip: "shot5-morning-ring", in: 0.9, out: 7.0,
    amb: "amb-dawn-kitchen", why: "morning, and the phone is ringing the other way" },
  // The in-point is not arbitrary. This clip listens for its first five seconds and only breaks
  // into a smile at about 6.5, so entering at 1.85 plays the whole arc under the closing line
  // rather than opening on a worried face or cutting in after the payoff.
  { beat: "G  the close", clip: "shot8-porch-callback", in: 1.85, out: 10.0,
    amb: "amb-porch-morning", why: "the call being taken, and the moment it turns" },
], FILM_LEN);

/** ONE sound, and it is the one the picture is already showing.
 *
 *  Beat F is literally a phone ringing on a morning counter, and the line it follows is the film's
 *  payoff: most say no, and the few who are ready pick up. A ring there is not decoration, it is
 *  the thing being described.
 *
 *  DELIBERATELY NO KEYS ON THE PORCH, even though the picture ends there and it would be easy.
 *  The porch shot closes every film in this series, and giving it the same sound everywhere would
 *  reinforce the exact sameness the new footage is meant to break. Each film's one event is
 *  different on purpose. */
export const HITS = [
  { sfx: "hit-phone-ring", afterLine: 6, nudge: 0.1, why: "the phone ringing the other way, over the shot of it doing so" },
];
