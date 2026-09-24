/** THE PRE-WARM, PLANNED (round 57.4). What the map visits under our poster before it shows.
 *
 * Round 56 phase 1b: jumping to the page's next shot (the first flight's) removed the cold first
 * flight's 300 ms stall; the budget of 1.5 s makes the walk stop there. Round 57 then measured ONE
 * frame of 229 to 271 ms on the flight from the Highlands to Westchester, cold, every run, at 1440.
 * Round 57.4 found why, by experiment (docs/parity/DESIGN-ROUND57.md §4 "Round 4"): a warm profile
 * with Chrome's GPU shader disk cache turned off stalls the same 236 ms, and a warm profile with its
 * HTTP cache deleted but its shader cache kept does not (48 ms). So it is a ONE-TIME GPU SHADER
 * COMPILE inside Google's renderer, not tiles. The Westchester camera at 40 / 48 / 60 km, tilt 45 /
 * 50, heading turned or kept, a 3.2 s flight, one mode for the whole page: the stall stays. A
 * two-leg flight moves it to the next flight. Jumping the camera there (the old walk) does not
 * compile it: only a FLIGHT along that path does. Flying the path once under the poster (the
 * Highlands set, then a 400 ms flight to Westchester) removes it: worst 21 to 56 ms on that flight
 * in 12 of 12 cold runs of these settings (was 229 to 271), for about 0.9 s more of the poster
 * (cover gone at 10.9 s median cold, was 10.0). A visitor who scrolls under the poster stops the
 * walk (controller.abortWarm) and may still meet the stall once.
 *
 * Only on a wide window that opens at the territory shot: the phone's flights never stalled (worst
 * 91 cold), and a page opened mid-scroll has its own first flight to warm. Every number can be
 * changed from the query for a look (`?warm=0|full|lite|fly|jump|path`, `?warmShots=a,b`,
 * `?warmFly=`, `?warmSettle=`, `?warmBack=`, `?warmBudget=`, `?warmOpen=1`). */
import { AREA_FLIGHT, type ShotName } from "../night/shots";

export interface WarmPlan {
  shots: ShotName[];
  /** jump: set each camera; fly: fly to each in 400 ms; path: set the first, FLY to each next. */
  mode: "jump" | "fly" | "path";
  budgetMs: number;
  /** path: each flight's length (ms). */
  flyMs?: number;
  /** The longest a step waits for the map to be drawn. */
  settleMs?: number;
  /** The longest the return to the page's shot waits for it to be drawn. */
  backMs?: number;
  /** Open the map at the walk's first shot (measured: the page's shot is not drawn at the reveal). */
  open?: boolean;
}

/** The flights that compile the shader: the page's own Highlands to Westchester, and (round 57.11, the
 * close cameras) on to Ulster: the long close flight is what compiles the one-time stall there, which
 * otherwise came on the page's first flight into the counties at 236 to 299 ms (lag g1..g3). */
export const STALL_PATH: readonly ShotName[] = ["highlands", "westchester", "ulster"];
export const PATH_FLY_MS = 400;
export const PATH_SETTLE_MS = 600;
export const PATH_BACK_MS = 2000;
/** The one-shot jump's budget (round 56 phase 1b). */
export const JUMP_BUDGET_MS = 1500;
/** A phone at the territory shot jumps to the page's first TWO shots under the cover (round 57.10).
 * The 1.5 s budget let a fast line take both (each step 1.3 to 1.6 s) and a slower one only the
 * first (1.7 to 1.8 s): then the first flight's landing stalled 278 and 292 ms, as with no walk at
 * all (271, 278), against 90 ms with both. So both, always; the cover's 14 s cap (sharp-gate.ts)
 * bounds the walk instead of the budget. */
export const PHONE_WARM_SHOTS = 2;
/** Round 57.11: each of the phone's steps waits at most this for its tiles. At the close cameras a
 * step's tiles stream for 3 to 6 s, and the old 4 s wait held the cover 5.3 s after the first draw;
 * at 1.2 s it holds 2.9 to 3.0 s and the first flights' frames are the same (90 ms, lag p1..p2). */
export const PHONE_SETTLE_MS = 1200;

type Query = { get(name: string): string | null };

const numOr = (v: string | null, d: number | undefined) => (v !== null && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : d);

export function warmPlan(o: { pageShots: readonly ShotName[]; initial: ShotName; narrow: boolean; q: Query }): WarmPlan {
  const { pageShots, initial, narrow, q } = o;
  const known = new Set<ShotName>([initial, ...pageShots]);
  const asked = (q.get("warmShots") ?? "").split(",").map((s) => s.trim()).filter((s): s is ShotName => known.has(s as ShotName));
  const w = (q.get("warm") ?? "").trim().toLowerCase();
  if (w === "0") return { shots: [], mode: "jump", budgetMs: 0 };
  const auto = w === "" || w === "auto";
  const path = w === "path" || (auto && !narrow && initial === "hero" && STALL_PATH.every((s) => known.has(s)));
  const budget = (d: number) => numOr(q.get("warmBudget"), d)!;
  if (path) {
    return {
      shots: asked.length ? asked : [...STALL_PATH],
      mode: "path",
      flyMs: numOr(q.get("warmFly"), PATH_FLY_MS),
      settleMs: numOr(q.get("warmSettle"), PATH_SETTLE_MS),
      backMs: numOr(q.get("warmBack"), PATH_BACK_MS),
      budgetMs: budget(20_000),
      open: q.get("warmOpen") === "1",
    };
  }
  if (auto && narrow && initial === "hero" && !asked.length) {
    return { shots: pageShots.slice(0, PHONE_WARM_SHOTS), mode: "jump", budgetMs: budget(20_000), settleMs: numOr(q.get("warmSettle"), PHONE_SETTLE_MS), backMs: numOr(q.get("warmBack"), undefined) };
  }
  const lite = pageShots.filter((n) => !(AREA_FLIGHT as readonly string[]).includes(n) || (AREA_FLIGHT as readonly string[]).indexOf(n) < 2);
  return {
    shots: asked.length ? asked : w === "lite" ? lite : [...pageShots],
    mode: w === "fly" ? "fly" : "jump",
    budgetMs: budget(JUMP_BUDGET_MS),
    settleMs: numOr(q.get("warmSettle"), undefined),
    backMs: numOr(q.get("warmBack"), undefined),
  };
}

// ---- the cover's hold on an early scroll (round 57.6) ---------------------------------------------
//
// The owner: "when you scroll down the real map shows up but sometimes it freezes". Round 57.5
// measured it (docs/parity/DESIGN-ROUND57.md §4, item 9): a visitor who scrolled at 3, 4.5 or 6 s
// lifted the cover and stopped the walk, and met the 236 to 257 ms shader compile on the flight to
// Westchester. So an early scroll no longer lifts the cover or stops the path: the cover (now fixed
// to the window while it holds) stays through the walk's compile flight, the map is set to the
// visitor's own section under it, and it lifts onto that section once drawn. Bounded: the path's
// own steps (at most 600 + 400 + 600 ms, the landing capped), then at most EARLY_BACK_MS for the
// visitor's shot to draw. The jump walk (a phone: no stall to hide) is stopped, and the cover still
// waits up to EARLY_BACK_MS for the visitor's shot, so the map is never shown undrawn.

/** The longest the cover waits, after the walk, for the visitor's own section to be drawn. */
export const EARLY_BACK_MS = 2000;

/** What a scroll before the reveal does to the walk: a `path` walk (the compile) goes on under the
 * cover; any other walk stops. */
export function earlyScroll(mode: WarmPlan["mode"]): "hold" | "abort" {
  return mode === "path" ? "hold" : "abort";
}

/** How long the walk's return waits for the shot the map goes back to (the page's, or the
 * visitor's after an early scroll). */
export function backWaitMs(o: { scrolled: boolean; backMs?: number }): number {
  const back = o.backMs ?? 4000;
  return o.scrolled ? Math.min(back, EARLY_BACK_MS) : back;
}
