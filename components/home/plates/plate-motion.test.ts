import { describe, expect, it } from "vitest";
import { FADE_MS, HURRY_MS, SETTLE_FROM, finished, hurryRate, idle, neighbours, progress, request, settleScale } from "./plate-motion";

describe("a plate asked for", () => {
  it("the first plate is a cut: there is nothing to fade from", () => {
    const r = request(idle(), "hero", 0);
    expect(r.action).toBe("cut");
    expect(r.state).toEqual({ at: "hero", motion: null, next: null });
  });

  it("the plate already on is nothing", () => {
    expect(request(idle("hero"), "hero", 10).action).toBe("none");
  });

  it("another plate starts a transition from the one on", () => {
    const r = request(idle("hero"), "dutchess", 100);
    expect(r.action).toBe("start");
    expect(r.state.at).toBe("hero");
    expect(r.state.motion).toEqual({ from: "hero", to: "dutchess", startedAt: 100, ms: FADE_MS });
    expect(r.state.next).toBeNull();
  });

  it("takes the fade's length it is given (reduced motion)", () => {
    expect(request(idle("hero"), "dutchess", 0, 400).state.motion?.ms).toBe(400);
  });
});

describe("a plate asked for while a transition runs", () => {
  const running = request(idle("hero"), "dutchess", 100).state;

  it("is queued and the running fade is hurried; only the last queued survives", () => {
    const a = request(running, "highlands", 200);
    expect(a.action).toBe("queue");
    expect(a.state.next).toBe("highlands");
    expect(a.state.motion).toEqual(running.motion);
    const b = request(a.state, "westchester", 300);
    expect(b.action).toBe("queue");
    expect(b.state.next).toBe("westchester");
  });

  it("asking again for the plate already arriving is nothing, and drops a queued one", () => {
    expect(request(running, "dutchess", 200).action).toBe("none");
    const q = request(running, "highlands", 200).state;
    const back = request(q, "dutchess", 300);
    expect(back.action).toBe("none");
    expect(back.state.next).toBeNull();
  });

  it("when the fade ends the arriving plate is on, and a queued plate starts from it", () => {
    const plain = finished(running, 1000);
    expect(plain.action).toBe("none");
    expect(plain.state).toEqual({ at: "dutchess", motion: null, next: null });
    const q = request(running, "highlands", 200).state;
    const chained = finished(q, 1000);
    expect(chained.action).toBe("start");
    expect(chained.state.at).toBe("dutchess");
    expect(chained.state.motion).toEqual({ from: "dutchess", to: "highlands", startedAt: 1000, ms: FADE_MS });
    expect(chained.state.next).toBeNull();
  });

  it("a queued plate that is the arriving one starts nothing", () => {
    const q = { ...running, next: "dutchess" as const };
    expect(finished(q, 1000).action).toBe("none");
  });

  it("finished with nothing running is nothing", () => {
    expect(finished(idle("hero"), 5).action).toBe("none");
  });
});

describe("the clock", () => {
  const m = { from: "hero" as const, to: "dutchess" as const, startedAt: 1000, ms: 900 };

  it("progress runs 0..1 over the fade and holds at the ends", () => {
    expect(progress(m, 500)).toBe(0);
    expect(progress(m, 1000)).toBe(0);
    expect(progress(m, 1450)).toBeCloseTo(0.5);
    expect(progress(m, 1900)).toBe(1);
    expect(progress(m, 5000)).toBe(1);
  });

  it("the hurry rate ends what is left of the fade within HURRY_MS, never slower than 1x", () => {
    expect(hurryRate(m, 1000)).toBeCloseTo(900 / HURRY_MS);
    expect(hurryRate(m, 1450)).toBeCloseTo(450 / HURRY_MS);
    expect(hurryRate(m, 1800)).toBe(1); // 100 ms left, already within
    expect(hurryRate(m, 1900)).toBe(1);
  });

  it("the settle comes from SETTLE_FROM to 1, ease-out (most of the move is early), monotone", () => {
    expect(settleScale(0)).toBeCloseTo(SETTLE_FROM);
    expect(settleScale(1)).toBeCloseTo(1);
    expect(settleScale(0.5) - 1).toBeLessThan((SETTLE_FROM - 1) * 0.2);
    let prev = settleScale(0);
    for (let k = 0.05; k <= 1.0001; k += 0.05) {
      const s = settleScale(k);
      expect(s).toBeLessThanOrEqual(prev + 1e-12);
      prev = s;
    }
  });
});

describe("which plates to have ready", () => {
  const names = ["hero", "dutchess", "highlands", "highlands", "westchester"] as const;
  it("the plate on, the next and the previous, once each, inside the ladder", () => {
    expect(neighbours(names, 0)).toEqual(["hero", "dutchess"]);
    expect(neighbours(names, 1)).toEqual(["dutchess", "highlands", "hero"]);
    expect(neighbours(names, 2)).toEqual(["highlands", "dutchess"]);
    expect(neighbours(names, 4)).toEqual(["westchester", "highlands"]);
  });
});
