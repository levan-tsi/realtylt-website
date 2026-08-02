// THE CUT, in one place. Imported by bg.mjs, render.mjs, bed.mjs and assemble.mjs.
//
// WHY THIS FILE EXISTS. This film used to write its length into assemble.mjs by hand (FILM_LEN
// 53.0, FADE_AT 52.5) and its picture beats into bg.mjs separately. That works until a line is
// re-recorded: the cut grows, the hardcoded fade stays where it was, and the last third of the
// render fades to black. It has already happened once on the voice film. Nothing downstream of
// here may type a length or a fade point.
//
// THE PICTURE DID NOT MOVE when this file was introduced. TAIL is set to the value that
// reproduces the previously hardcoded 53.0, so FILM_LEN and FADE_AT come out identical and every
// beat boundary is byte-for-byte where it was. The trap is removed without re-cutting the film.
import { readFileSync } from "node:fs";
import { sequence } from "../beats.mjs";

export const SCHED_PATH = "scripts/_scratch-video/qualify-vo/schedule.json";
export const FPS = 30;
export const W = 1280;
export const H = 720;

/** Hold on the close card after the last word lands. */
export const TAIL = 1.53;
/** How long the film takes to fall to black at the very end. */
export const FADE = 0.5;

export const sched = JSON.parse(readFileSync(SCHED_PATH, "utf8"));

export const LAST_WORD = sched.at(-1).end;
export const FILM_LEN = +(LAST_WORD + TAIL).toFixed(2);
export const FADE_AT = +(FILM_LEN - FADE).toFixed(2);

/** THE BEATS. Picture and sound both read this, so a beat cannot have one and not the other.
 *
 *  `clip` is what the eye gets and `amb` is what the ear gets. Three of the nine beats are black
 *  cards, and a black card is NOT silence: a hole in the sound is heard as a fault rather than as
 *  a pause, so they get amb-void, a deep steady floor.
 *
 *  Beats C, D and E run footage straight into footage. Those boundaries stay HARD CUTS - see the
 *  grammar in beats.mjs - because two real shots meeting needs no help.
 *
 *  `in`/`out` are points INSIDE the source clip, and the beat runs for exactly that long. These
 *  are the numbers this film already used; they sum to 53.00, which is why FILM_LEN comes out at
 *  the previously hardcoded value and no boundary moves. */
export const PLAN = sequence([
  { beat: "A1 the morning", clip: "shot5-morning-ring", in: 0.4, out: 4.8,
    amb: "amb-dawn-kitchen", why: "sunrise, coffee, the day the list gets opened" },
  { beat: "A2 the number alone", clip: null, in: 0, out: 4.3,
    amb: "amb-void", why: "black: the picture falls away and 15% is the only thing left" },
  { beat: "B1 three leads arrived", clip: "shot3-reply-glow", in: 0.3, out: 5.6,
    amb: "amb-night-interior", why: "a thread glowing on a phone" },
  { beat: "B2 the three records", clip: null, in: 0, out: 6.25,
    amb: "amb-void", why: "black, because three identical rows only read on black" },
  { beat: "C  what the form cannot say", clip: "shot2-empty-office", in: 1.5, out: 6.95,
    amb: "amb-night-interior", why: "the desk the list is opened at" },
  { beat: "D  the signals", clip: "shot1-1140pm-lead", in: 1.0, out: 7.0,
    amb: "amb-night-interior", why: "the night the inquiry was actually written" },
  { beat: "E  routing", clip: "shot4-hudson-aerial", in: 0.0, out: 7.5,
    amb: "amb-open-air", why: "the market the leads are spread across" },
  { beat: "F  the rule", clip: null, in: 0, out: 5.9,
    amb: "amb-void", why: "black: the fair housing line is the one that should sit alone" },
  { beat: "G  the close", clip: "shot6-keys-porch", in: 2.1, out: 10.0,
    amb: "amb-porch-morning", why: "keys changing hands on a porch" },
], FILM_LEN);

/** ONE sound, and it is the one the picture is already showing.
 *
 *  Beat B1 is a thread glowing on a phone and the line it follows is "three leads came in
 *  yesterday". A phone buzzing on a hard surface is that sentence, in sound.
 *
 *  DELIBERATELY NO KEYS ON THE PORCH. The porch shot closes every film in this series, and giving
 *  it the same sound everywhere would reinforce the exact sameness the new footage is meant to
 *  break. Each film's one event is different on purpose. */
export const HITS = [
  { sfx: "hit-phone-buzz", afterLine: 1, nudge: 0.05, why: "the leads arriving, over the glowing thread" },
];
