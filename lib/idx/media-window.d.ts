/** Types for lib/idx/media-window.mjs — see that file for why it is plain .mjs. */

export interface WindowRules {
  DAILY_TARGET: number;
  DAILY_RESERVE: number;
  HOURLY_CAP: number;
  HOURLY_TARGET: number;
  HOURLY_RESERVE: number;
  FLOOR: number;
  PENALTY_HOURS: number;
  COOLING_RPS: number;
  NORMAL_RPS: number;
  COOLING_HOURS: number;
}

export declare const RULES: WindowRules;

/** Why a window may not open. "ok" means it may. */
export type WindowReason = "ok" | "runner-live" | "penalty" | "shut";

export interface WindowDecision {
  launch: boolean;
  reason: WindowReason;
  /** Downloads this window may spend — the smaller of the two doors. */
  size: number;
  daily: number;
  hourly: number;
  /** Requests per second the runner should use; drops after a recent 429. */
  rps: number;
  cooling: boolean;
  /** When a penalty lifts, in epoch ms; null when nothing time-based is blocking. */
  resumeAt: number | null;
}

export declare function windowDecision(input: {
  last1h: number;
  last24h: number;
  penaltyAt?: number | null;
  runnerAlive?: boolean;
  now?: number;
  rules?: WindowRules;
}): WindowDecision;

export declare function minutesUntil(resumeAt: number, now?: number): number;

export declare const PENALTY_FILE: string;
export declare const RUNNER_LOCK: string;

/** `readFile` throwing means "no marker", which is the normal case. */
export declare function readPenaltyState(
  readFile: (file: string) => string | Buffer,
  file?: string,
): { present: boolean; at: number | null };

export declare function readPenaltyAt(
  readFile: (file: string) => string | Buffer,
  file?: string,
): number | null;

export declare function isRunnerAlive(
  readFile: (file: string) => string | Buffer,
  isAlive: (pid: number) => boolean,
  file?: string,
): boolean;

export declare function pidAlive(pid: number): boolean;
