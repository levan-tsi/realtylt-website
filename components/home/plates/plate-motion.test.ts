import { describe, expect, it } from "vitest";
import { FADE_MS, FILM_HOLD_MS, FILM_MAX_RATE, FILMS_KEPT, filmNeighbours, filmWants, holdForFilm, HURRY_MS, SETTLE_FROM, filmHurry, finished, hurryRate, idle, neighbours, routeHop, progress, request, settleScale, useFilm, type FilmChooser } from "./plate-motion";
import type { ShotName } from "../night/shots";
import { FLIGHTS } from "./flights.gen";
import { filmLadder, filmOf } from "./plate-frame";

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

describe("the film (round 59)", () => {
  // films recorded between adjacent plates only, and ready here only for hero -> dutchess, both ways
  const film: FilmChooser = (from, to) => ((from === "hero" && to === "dutchess") || (from === "dutchess" && to === "hero") ? 2564 : null);

  it("adjacent and ready plays the film, with the film's own length", () => {
    const r = request(idle("hero"), "dutchess", 5, FADE_MS, film);
    expect(r.action).toBe("start");
    expect(r.state.motion).toEqual({ from: "hero", to: "dutchess", startedAt: 5, ms: 2564, film: true });
  });

  it("the back flight plays too", () => {
    expect(request(idle("dutchess"), "hero", 0, FADE_MS, film).state.motion?.film).toBe(true);
  });

  it("not adjacent, or not ready, is the fade over", () => {
    const r = request(idle("hero"), "queens", 0, FADE_MS, film);
    expect(r.state.motion).toEqual({ from: "hero", to: "queens", startedAt: 0, ms: FADE_MS });
    expect(request(idle("dutchess"), "highlands", 0, FADE_MS, film).state.motion?.film).toBeUndefined();
    expect(request(idle("hero"), "dutchess", 0, FADE_MS).state.motion?.film).toBeUndefined();
  });

  it("the rule: recorded, ready, no reduced motion, not switched off", () => {
    const base = { recorded: true, ready: true, reduced: false, off: false };
    expect(useFilm(base)).toBe(true);
    expect(useFilm({ ...base, recorded: false })).toBe(false);
    expect(useFilm({ ...base, ready: false })).toBe(false);
    expect(useFilm({ ...base, reduced: true })).toBe(false);
    expect(useFilm({ ...base, off: true })).toBe(false);
  });

  it("a request during a film is queued, and the queued one starts from the landed plate (film or fade)", () => {
    const s = request(idle("hero"), "dutchess", 0, FADE_MS, film).state;
    const q = request(s, "highlands", 400, FADE_MS, film);
    expect(q.action).toBe("queue");
    expect(q.state.motion?.film).toBe(true);
    const f = finished(q.state, 900, FADE_MS, film);
    expect(f.action).toBe("start");
    expect(f.state.motion).toEqual({ from: "dutchess", to: "highlands", startedAt: 900, ms: FADE_MS });
    const back = finished(request(s, "hero", 400, FADE_MS, film).state, 900, FADE_MS, film);
    expect(back.state.motion?.film).toBe(true);
  });

  it("the hurry: a rate that ends the film within HURRY_MS, capped; a cut when even the cap leaves over a second", () => {
    expect(filmHurry(2000)).toEqual({ rate: FILM_MAX_RATE });
    expect(filmHurry(500)).toEqual({ rate: 500 / HURRY_MS });
    expect(filmHurry(100)).toEqual({ rate: 1 });
    expect(filmHurry(0)).toEqual({ rate: 1 });
    expect(filmHurry(4000)).toEqual({ rate: FILM_MAX_RATE });
    expect(filmHurry(4001)).toBe("cut");
  });
});

describe("which films to have ready (round 59)", () => {
  const names = ["hero", "hero", "hero", "dutchess", "highlands", "highlands", "westchester"] as const;
  it("the shot on, then the nearest different shot ahead and behind", () => {
    expect(filmNeighbours(names, 0)).toEqual(["hero", "dutchess"]);
    expect(filmNeighbours(names, 2)).toEqual(["hero", "dutchess"]);
    expect(filmNeighbours(names, 3)).toEqual(["dutchess", "highlands", "hero"]);
    expect(filmNeighbours(names, 4)).toEqual(["highlands", "westchester", "dutchess"]);
    expect(filmNeighbours(names, 6)).toEqual(["westchester", "highlands"]);
    expect(filmNeighbours(names, 9)).toEqual([]);
  });
});

// Round 63 (the owner: a thumb scroll should "take you there with the map moving", as a chip tap
// does): a jump of two or three stops flies through the plates in between when their films are
// ready, instead of fading straight to the far one.
describe("the route through the plates in between", () => {
  const order = ["ulster", "dutchess-county", "orange", "putnam", "rockland"] as const;
  const films: FilmChooser = () => 2000;
  const route = (from: string, to: string) => routeHop(order as unknown as ShotName[], from as ShotName, to as ShotName);

  it("the first hop is the next plate toward the target, either way", () => {
    expect(routeHop([...order], "ulster", "putnam")).toBe("dutchess-county");
    expect(routeHop([...order], "rockland", "dutchess-county")).toBe("putnam");
  });

  it("no hop for a neighbour, a far jump, or a plate off the route", () => {
    expect(routeHop([...order], "ulster", "dutchess-county")).toBeNull();
    expect(routeHop([...order], "ulster", "rockland")).toBeNull();
    expect(routeHop([...order], "hero", "orange")).toBeNull();
  });

  it("an idle plate asked two stops on flies the first hop and keeps the target queued", () => {
    const r = request(idle("ulster"), "orange", 0, FADE_MS, films, route);
    expect(r.action).toBe("start");
    expect(r.state.motion).toMatchObject({ from: "ulster", to: "dutchess-county", film: true, then: "orange" });
    expect(r.state.next).toBe("orange");
    const f = finished(r.state, 2000, FADE_MS, films, route);
    expect(f.action).toBe("start");
    expect(f.state.motion).toMatchObject({ from: "dutchess-county", to: "orange", film: true });
    expect(f.state.next).toBeNull();
  });

  it("a hop whose film is not ready is not taken: the far plate fades in directly", () => {
    const only: FilmChooser = (a, b) => (a === "ulster" && b === "orange" ? 2000 : null);
    const r = request(idle("ulster"), "orange", 0, FADE_MS, only, route);
    expect(r.state.motion).toEqual({ from: "ulster", to: "orange", startedAt: 0, ms: 2000, film: true });
    expect(r.state.next).toBeNull();
  });

  it("without a route nothing changes", () => {
    const r = request(idle("ulster"), "orange", 0, FADE_MS, films);
    expect(r.state.motion).toEqual({ from: "ulster", to: "orange", startedAt: 0, ms: 2000, film: true });
  });
});

// Round 65: which clips are asked for, on both surfaces (the laptop's seven fades in a walk were
// every one a clip never asked for while the map was moving).
describe("the films wanted decoded (filmWants)", () => {
  const ladder = filmLadder(FLIGHTS);
  const film = (a: ShotName, b: ShotName) => filmOf(FLIGHTS, a, b);
  const route = (a: ShotName, b: ShotName) => routeHop(ladder, a, b);
  const base = { playing: null, backward: false, film, route };

  it("a still laptop at the territory, the page crossed into Dutchess: that flight and the one ahead", () => {
    const r = filmWants({ ...base, names: ["dutchess", "highlands", "hero"], at: "hero", moving: false, aspect: "wide" });
    expect(r.next).toBe("hero>dutchess>wide");
    expect([...r.want].sort()).toEqual(["dutchess>highlands>wide", "hero>dutchess>wide"]);
    expect(r.keep).toBe(FILMS_KEPT.wide);
  });

  it("a moving laptop keeps the films round the page, the next flight and the one playing, and one decoder more", () => {
    const r = filmWants({ ...base, names: ["highlands", "westchester", "dutchess"], at: "dutchess", moving: true, aspect: "wide", playing: "hero>dutchess>wide" });
    expect(r.next).toBe("dutchess>highlands>wide");
    expect([...r.want].sort()).toEqual(["dutchess>highlands>wide", "hero>dutchess>wide", "highlands>westchester>wide"]);
    expect(r.keep).toBe(FILMS_KEPT.wide + 1);
  });

  it("a moving phone keeps only its two decoders: the film playing and the next flight", () => {
    const r = filmWants({ ...base, names: ["highlands", "westchester", "dutchess"], at: "dutchess", moving: true, aspect: "tall", playing: "hero>dutchess>tall" });
    expect([...r.want].sort()).toEqual(["dutchess>highlands>tall", "hero>dutchess>tall"]);
    expect(r.keep).toBe(FILMS_KEPT.tall + 1);
  });

  it("a page two stops ahead of the map wants the route's first hop, on the laptop too", () => {
    const r = filmWants({ ...base, names: ["orange", "putnam", "dutchess-county"], at: "ulster", moving: false, aspect: "wide" });
    expect(r.next).toBe("ulster>dutchess-county>wide");
    expect(r.want.has("ulster>dutchess-county>wide")).toBe(true);
  });

  it("a far jump has no next flight (it fades); the map already where the page is has none either", () => {
    expect(filmWants({ ...base, names: ["queens", "brooklyn", "manhattan"], at: "hero", moving: false, aspect: "wide" }).next).toBeNull();
    expect(filmWants({ ...base, names: ["queens", "brooklyn", "manhattan"], at: "queens", moving: false, aspect: "wide" }).next).toBeNull();
  });

  it("the films behind only once the visitor has turned; the flight back about to be asked for always", () => {
    const down = filmWants({ ...base, names: ["highlands", "westchester", "dutchess"], at: "westchester", moving: false, aspect: "wide" });
    expect(down.want.has("highlands>dutchess>wide")).toBe(false);
    expect(down.next).toBe("westchester>highlands>wide");
    const up = filmWants({ ...base, names: ["highlands", "westchester", "dutchess"], at: "westchester", moving: false, aspect: "wide", backward: true });
    expect(up.want.has("highlands>dutchess>wide")).toBe(true);
  });
});

describe("a still map holds a moment for its film (holdForFilm)", () => {
  const ok = { recorded: true, ready: false, coming: true, reduced: false, off: false, waited: 0 };
  it("holds while the clip is on its way, up to FILM_HOLD_MS", () => {
    expect(holdForFilm(ok)).toBe(true);
    expect(holdForFilm({ ...ok, waited: FILM_HOLD_MS - 1 })).toBe(true);
    expect(holdForFilm({ ...ok, waited: FILM_HOLD_MS })).toBe(false);
  });
  it("never for a clip that is in, one never recorded or failed, reduced motion or films off", () => {
    expect(holdForFilm({ ...ok, ready: true })).toBe(false);
    expect(holdForFilm({ ...ok, recorded: false })).toBe(false);
    expect(holdForFilm({ ...ok, coming: false })).toBe(false);
    expect(holdForFilm({ ...ok, reduced: true })).toBe(false);
    expect(holdForFilm({ ...ok, off: true })).toBe(false);
  });
});
