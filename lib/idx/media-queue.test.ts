import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetMediaQueueForTests, mediaQueueState, requestMediaSlot } from "./media-queue";

beforeEach(() => {
  __resetMediaQueueForTests();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

/** Queue N tiles, recording the order they were allowed to start. */
function queue(n: number, front = false) {
  const started: number[] = [];
  const release = Array.from({ length: n }, (_, i) =>
    requestMediaSlot(() => started.push(i), front),
  );
  return { started, release };
}

describe("media queue — the 48-photo burst can never happen again", () => {
  it("starts at most 6 requests, however many tiles mount", () => {
    const { started } = queue(48);
    expect(started).toHaveLength(6);
    expect(mediaQueueState()).toMatchObject({ active: 6, waiting: 42, max: 6 });
  });

  it("admits the next tile only as an earlier one settles (never a second burst)", () => {
    const { started, release } = queue(48);
    release[0]();
    expect(started).toHaveLength(7);
    expect(mediaQueueState().active).toBe(6);
    release[1]();
    release[2]();
    expect(started).toHaveLength(9);
    expect(mediaQueueState().active).toBe(6);
  });

  it("drains the whole set in FIFO order without exceeding the cap at any point", () => {
    const order: number[] = [];
    const releases: (() => void)[] = [];
    for (let i = 0; i < 20; i++) releases.push(requestMediaSlot(() => order.push(i)));
    let peak = 0;
    for (let i = 0; i < 20; i++) {
      peak = Math.max(peak, mediaQueueState().active);
      releases[i]();
    }
    expect(peak).toBeLessThanOrEqual(6);
    expect(order).toEqual([...Array(20).keys()]);
    expect(mediaQueueState()).toMatchObject({ active: 0, waiting: 0 });
  });

  it("lets the photo the visitor is looking at jump a long thumbnail rail", () => {
    const rail = queue(40); // fills all 6 slots, 34 waiting
    let heroStarted = false;
    requestMediaSlot(() => (heroStarted = true), true);
    expect(heroStarted).toBe(false); // still capped
    rail.release[0]();
    expect(heroStarted).toBe(true); // …but first in line, ahead of 34 thumbnails
  });

  it("releasing twice does not leak capacity", () => {
    const { release } = queue(8);
    release[0]();
    release[0]();
    release[0]();
    expect(mediaQueueState().active).toBe(6);
  });

  it("cancelling a tile that never started just removes it from the line", () => {
    const { started, release } = queue(10);
    release[9](); // unmounted while still queued
    expect(mediaQueueState()).toMatchObject({ active: 6, waiting: 3 });
    release[0]();
    expect(started).toHaveLength(7);
  });

  it("a request that never settles cannot wedge the queue (watchdog)", () => {
    const { started } = queue(12); // 6 start, 6 wait, nothing ever releases
    expect(started).toHaveLength(6);
    vi.advanceTimersByTime(20_000);
    expect(started).toHaveLength(12); // the stalled six timed out and let the rest through
    expect(mediaQueueState().active).toBe(6);
  });
});
