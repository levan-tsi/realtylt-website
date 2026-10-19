import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { decideRestart, facts, judge, type DbApiProbe, type ProbeResult, type RestartOutcome, type WatchInput } from "./checks";
import { composeAlert, composeDigest } from "./email";
import { familyOf, INSTRUCTIONS, instructionFor } from "./instructions";

const healthy = (): WatchInput => ({
  snap: {
    watermark: "2026-10-15T23:00:00Z",
    baseline_complete: true,
    minutes_since_sync: 24,
    active_total: 27_400,
    active_status_active: 17_700,
    active_coming_soon: 120,
    active_pending: 9_500,
    active_no_photo: 47,
    active_no_photo_older_7d: 37,
    touched_24h: 1_600,
    repriced_24h: 3,
    restatused_24h: 5,
  },
  counts: { leads_1h: 1, leads_24h: 4, signups_1h: 0, signups_24h: 2, chat_1h: 3, chat_24h: 9 },
  site: { ok: true, status: 200, ms: 900 },
  search: { ok: true, status: 200, ms: 400 },
  crm: { ok: true, status: 200, ms: 700 },
  prev: { active_total: 27_450, active_no_photo_older_7d: 35 },
});

const p = (status: number, error?: "timeout" | "network"): ProbeResult => ({
  ok: status >= 200 && status < 300,
  status,
  ms: status ? 300 : 20_000,
  ...(error ? { error } : {}),
});

const down: DbApiProbe = { auth: p(0, "timeout"), rest: p(522), state: "down" };

/** Every branch of judge(), driven one at a time (and the API-layer line with every outcome
 * the route can attach to it). */
function everyProblem(): string[] {
  const out: string[] = [];
  const add = (mutate: (i: WatchInput) => void) => {
    const input = healthy();
    mutate(input);
    out.push(...judge(input).problems);
  };
  add((i) => (i.site = null));
  add((i) => (i.site = p(500)));
  add((i) => (i.site = p(0, "timeout")));
  add((i) => (i.site = { ok: true, status: 200, ms: 9_000 }));
  add((i) => (i.search = p(500)));
  add((i) => (i.search = p(0, "network")));
  add((i) => (i.crm = null));
  add((i) => (i.crm = p(502)));
  add((i) => {
    i.crm = p(503);
    i.crmVia = "health";
  });
  add((i) => {
    i.crm = p(500);
    i.crmVia = "health";
  });
  add((i) => {
    i.crm = p(0, "timeout");
    i.crmVia = "login-page";
  });
  add((i) => (i.snap = null));
  add((i) => (i.snap = { ...i.snap!, minutes_since_sync: 314 }));
  add((i) => (i.snap = { ...i.snap!, minutes_since_sync: null }));
  add((i) => (i.snap = { ...i.snap!, baseline_complete: false }));
  add((i) => (i.snap = { ...i.snap!, reconcile: { startedAt: "2026-10-20T09:05:00Z", error: "the walk saw 900 on-market rows against 27,507 we serve; refusing to judge from it" } }));
  add((i) => (i.snap = { ...i.snap!, reconcile: { startedAt: "2026-10-10T09:05:00Z", completedAt: "2026-10-10T09:09:00Z" } }));
  add((i) => {
    i.snap = { ...i.snap!, active_total: 3_000 };
    i.prev = null;
  });
  add((i) => (i.snap = { ...i.snap!, active_total: 20_000 }));
  add((i) => (i.snap = { ...i.snap!, active_no_photo_older_7d: 2_000 }));
  add((i) => {
    i.prev = { active_total: 27_450, active_no_photo_older_7d: 200 };
    i.snap = { ...i.snap!, active_no_photo_older_7d: 500 };
  });
  add((i) => (i.snap = { ...i.snap!, touched_24h: 0 }));
  add((i) => (i.counts = { ...i.counts, leads_1h: 40 }));
  add((i) => (i.counts = { ...i.counts, signups_1h: 25 }));
  add((i) => (i.counts = { ...i.counts, chat_1h: 500 }));
  const at = "2026-10-15T23:23:31.000Z";
  const outcomes: (RestartOutcome | null)[] = [
    null,
    { requested: true, requestedAt: at, status: "ACTIVE_HEALTHY", httpStatus: 200 },
    { requested: true, requestedAt: at, status: "ACTIVE_UNHEALTHY", httpStatus: 500 },
    { requested: true, requestedAt: at, status: "ACTIVE_HEALTHY", httpStatus: 0 },
    ...[null, "RESTARTING", "COMING_UP", "PAUSED", "UPGRADING"].map(
      (status): RestartOutcome => ({ requested: false, why: decideRestart({ dbApi: "down", secondProbe: "down", status, tokenPresent: true }).why, status }),
    ),
    { requested: false, why: decideRestart({ dbApi: "down", secondProbe: "down", status: null, tokenPresent: false }).why, status: null },
  ];
  for (const restart of outcomes)
    add((i) => {
      i.dbApi = down;
      i.restart = restart;
    });
  return out;
}

describe("the watch's instructions", () => {
  it("every problem line the judge can produce maps to exactly one instruction (no orphan)", () => {
    const all = everyProblem();
    expect(all.length).toBeGreaterThan(30);
    for (const problem of all) {
      const hits = INSTRUCTIONS.filter((i) => i.match.test(problem)).map((i) => i.family);
      expect(hits, problem).toHaveLength(1);
    }
  });

  it("no instruction is dead: every family is reached by some problem line", () => {
    const reached = new Set(everyProblem().map(familyOf));
    for (const i of INSTRUCTIONS) expect(reached.has(i.family), i.family).toBe(true);
  });

  it("a new judge branch cannot slip in without an instruction: one bad() call per family", () => {
    const src = readFileSync(fileURLToPath(new URL("./checks.ts", import.meta.url)), "utf8");
    const judgeBody = src.slice(src.indexOf("export function judge("), src.indexOf("export function facts("));
    expect(judgeBody.match(/\bbad\(/g)?.length).toBe(INSTRUCTIONS.length);
  });

  it("families are unique, and every entry has its three lines in ASCII (the mail shell's rule)", () => {
    expect(new Set(INSTRUCTIONS.map((i) => i.family)).size).toBe(INSTRUCTIONS.length);
    for (const i of INSTRUCTIONS) {
      for (const line of [i.what, i.did, i.todo]) {
        expect(line.length, i.family).toBeGreaterThan(20);
        expect(line, i.family).toMatch(/^[\x20-\x7e]+$/);
      }
    }
  });
});

describe("the mails carry the instructions under each problem", () => {
  const input: WatchInput = {
    ...healthy(),
    snap: null,
    dbApi: down,
    restart: { requested: false, why: decideRestart({ dbApi: "down", secondProbe: "down", status: null, tokenPresent: false }).why, status: null },
    counts: { ...healthy().counts, leads_1h: 40 },
  };
  const { problems } = judge(input);
  const rows = facts(input);

  it("the alert and the digest: three lines per problem, in the HTML and the text part", () => {
    expect(problems).toHaveLength(3);
    for (const mail of [composeAlert(problems, rows, true), composeDigest(problems, rows)]) {
      for (const label of ["What happened:", "What the watch did:", "What to do:"]) {
        expect(mail.html.split(label).length - 1, label).toBe(problems.length);
        expect(mail.text.split(label).length - 1, label).toBe(problems.length);
      }
      for (const problem of problems) expect(mail.text).toContain(instructionFor(problem)!.todo);
      expect(mail.html).toContain("Settings &gt; General &gt; Restart project");
      expect(mail.html).toMatch(/^[\x00-\x7f]*$/);
      expect(mail.text).toContain("Supabase API (Auth + REST): DOWN");
    }
  });
});
