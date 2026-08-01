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
