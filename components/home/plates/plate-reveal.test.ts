import { describe, expect, it } from "vitest";
import { PLATE_REVEAL_MS, PLATE_REVEAL_SCRIPT } from "./plate-reveal";

/** Runs the inline script against a stand-in page: `frames` advances requestAnimationFrame. */
function run(reduced: boolean) {
  const queue: (() => void)[] = [];
  const animated: { frames: unknown; opts: { duration: number; easing: string } }[] = [];
  const page = { img: null as null | { complete: boolean; naturalWidth: number; animate: (f: unknown, o: { duration: number; easing: string }) => void } };
  const asked: string[] = [];
  const doc = {
    querySelector: (sel: string) => {
      asked.push(sel);
      return page.img;
    },
  };
  const win = {
    matchMedia: (q: string) => ({ matches: reduced && /reduce/.test(q) }),
    requestAnimationFrame: (fn: () => void) => queue.push(fn),
  };
  new Function("document", "window", PLATE_REVEAL_SCRIPT)(doc, win);
  const frame = () => {
    const due = queue.splice(0);
    for (const f of due) f();
  };
  const makeImg = () => (page.img = { complete: false, naturalWidth: 0, animate: (frames: unknown, opts: { duration: number; easing: string }) => animated.push({ frames, opts }) });
  return { queue, frame, page, animated, asked, makeImg };
}

describe("the first plate's reveal (round 65)", () => {
  it("starts the fade the first frame the first layer's picture is complete, once", () => {
    const r = run(false);
    expect(r.queue).toHaveLength(1);
    r.frame(); // no picture in the page yet
    expect(r.asked[0]).toBe('[data-plate-slot="0"] img');
    const img = r.makeImg();
    r.frame(); // the picture, its bytes not in
    expect(r.animated).toHaveLength(0);
    img.complete = true;
    img.naturalWidth = 1440;
    r.frame();
    expect(r.animated).toHaveLength(1);
    expect(r.animated[0].frames).toEqual([{ opacity: 0 }, { opacity: 1 }]);
    expect(r.animated[0].opts.duration).toBe(PLATE_REVEAL_MS);
    expect(r.animated[0].opts.easing).toBe("ease-out");
    expect(r.queue).toHaveLength(0); // done: no more frames asked for
  });

  it("does not fade a picture that failed (complete, no pixels)", () => {
    const r = run(false);
    const img = r.makeImg();
    img.complete = true;
    r.frame();
    expect(r.animated).toHaveLength(0);
    expect(r.queue).toHaveLength(0);
  });

  it("is short and does nothing under reduced motion", () => {
    expect(PLATE_REVEAL_MS).toBeGreaterThanOrEqual(200);
    expect(PLATE_REVEAL_MS).toBeLessThanOrEqual(400);
    expect(run(true).queue).toHaveLength(0);
  });
});
