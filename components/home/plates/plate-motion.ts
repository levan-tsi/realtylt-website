/** THE TRANSITION BETWEEN PLATES, as pure rules (round 58, docs/parity/DESIGN-ROUND58.md §3): which
 * picture is on, which is arriving, and what a new request does to a transition already running.
 * No DOM here; the controller (plate-controller.ts) drives the Web Animations from these answers,
 * and this is what is tested.
 *
 * The transition is a FADE OVER with a settle: the arriving plate is laid on top and fades in over
 * FADE_MS while it settles from SETTLE_FROM to 1, the plate underneath holds at full strength and
 * pushes to PUSH_TO as it is covered. Then nothing moves. A request during a transition is QUEUED:
 * the running fade is hurried to its end (within HURRY_MS) and the queued plate starts from a whole
 * picture; never a snap inside a fade, never two half pictures. Only the last queued request
 * survives (a pointer crossing four county rows lands on the fourth). */
import type { ShotName } from "../night/shots";

export const FADE_MS = 900;
export const FADE_REDUCED_MS = 400;
export const SETTLE_FROM = 1.04;
export const PUSH_TO = 1.02;
export const HURRY_MS = 250;

export interface Motion {
  from: ShotName | null;
  to: ShotName;
  startedAt: number;
  ms: number;
}

export interface MotionState {
  /** The plate on screen at full strength. */
  at: ShotName | null;
  /** The transition running, if one is. */
  motion: Motion | null;
  /** The plate asked for while a transition ran (the last one asked). */
  next: ShotName | null;
}

export const idle = (at: ShotName | null = null): MotionState => ({ at, motion: null, next: null });

export type Step = { state: MotionState; action: "none" | "start" | "queue" | "cut" };

/** A plate asked for at `now`. Returns the new state and what the controller does:
 *  - "none": already there (or already arriving, nothing queued behind it);
 *  - "start": begin a transition to it (`state.motion` says from where and how long);
 *  - "queue": a transition runs; hurry it, this one follows;
 *  - "cut": no picture is on yet (the first plate): show it at once.
 * `ms` is the fade's length (reduced motion: FADE_REDUCED_MS). */
export function request(state: MotionState, shot: ShotName, now: number, ms = FADE_MS): Step {
  if (state.motion) {
    if (state.motion.to === shot && state.next === null) return { state, action: "none" };
    if (state.motion.to === shot) return { state: { ...state, next: null }, action: "none" };
    return { state: { ...state, next: shot }, action: "queue" };
  }
  if (state.at === shot) return { state, action: "none" };
  if (state.at === null) return { state: { at: shot, motion: null, next: null }, action: "cut" };
  return { state: { at: state.at, motion: { from: state.at, to: shot, startedAt: now, ms }, next: null }, action: "start" };
}

/** The running transition has ended (its fade finished). The arriving plate is on; a queued plate
 * starts its own transition now. */
export function finished(state: MotionState, now: number, ms = FADE_MS): Step {
  const m = state.motion;
  if (!m) return { state, action: "none" };
  const at = m.to;
  if (state.next && state.next !== at) return { state: { at, motion: { from: at, to: state.next, startedAt: now, ms }, next: null }, action: "start" };
  return { state: { at, motion: null, next: null }, action: "none" };
}

/** How far a transition is, 0..1, by the clock. */
export function progress(m: Motion, now: number): number {
  return m.ms > 0 ? Math.min(1, Math.max(0, (now - m.startedAt) / m.ms)) : 1;
}

/** The playback rate that ends a running fade within `within` ms of `now` (never slower than it
 * runs): what the controller sets on the fade's animation when a request is queued. */
export function hurryRate(m: Motion, now: number, within = HURRY_MS): number {
  const left = (1 - progress(m, now)) * m.ms;
  if (left <= 0) return 1;
  return Math.max(1, left / Math.max(1, within));
}

/** The arriving plate's scale during the settle, for the same clock (ease-out cubic, the curve the
 * animation runs: `cubic-bezier(0.33, 1, 0.68, 1)`). */
export function settleScale(k: number, from = SETTLE_FROM): number {
  const t = Math.min(1, Math.max(0, k));
  const e = 1 - (1 - t) * (1 - t) * (1 - t);
  return from + (1 - from) * e;
}

/** Which plates to have decoded for a position on the ladder: the one the page is on, the next and
 * the previous (a scroll either way finds its picture ready). */
export function neighbours(names: readonly ShotName[], index: number): ShotName[] {
  const out: ShotName[] = [];
  for (const k of [index, index + 1, index - 1]) {
    const n = names[k];
    if (n && !out.includes(n)) out.push(n);
  }
  return out;
}
