/** A hard cap on how many /api/media photo requests one page may have in flight at once.
 *
 * WHY THIS EXISTS (measured on prod 2026-07-26): opening a 48-photo gallery fired ~48 concurrent
 * proxy requests, the MLS media host answered 429, and our route turned each 429 into a 503
 * "photo coming soon". Worse, the burst spilled: cover photos for OTHER listings requested in the
 * same second got 429'd as collateral. So a share of the owner's "random coming soon logos" was
 * manufactured by our own request pattern, on an account already at suspension risk. HTTP/2
 * multiplexing means the browser will happily open all 48 at once, so the throttle has to be ours.
 *
 * Every photo surface on the listing page (band tiles, the no-JS grid once opened, the lightbox
 * main photo, its thumbnail rail and its neighbour preloads) takes a slot here first. Retries take
 * a fresh slot too, so 48 tiles backing off do not re-burst in lockstep.
 *
 * Deliberately NOT configurable and deliberately small: nothing in this codebase should ever raise
 * it. A stuck request cannot wedge the queue — every slot has a watchdog.
 */

const MAX_IN_FLIGHT = 6;
/** A request that never fires load or error (aborted transfer, sleeping tab) must not hold a slot
 * for the life of the page. Comfortably longer than the route's own 15s upstream timeout. */
const SLOT_WATCHDOG_MS = 20_000;

interface Waiter {
  start: () => void;
  started: boolean;
}

let active = 0;
const waiting: Waiter[] = [];

function pump(): void {
  while (active < MAX_IN_FLIGHT && waiting.length > 0) {
    const next = waiting.shift() as Waiter;
    active++;
    next.started = true;
    next.start();
  }
}

/** Ask for a slot. `start` runs when one is free (synchronously if the queue is idle). The returned
 * function releases the slot and MUST be called when the image settles (load or error) or unmounts;
 * calling it more than once is safe. `front` jumps the queue for the photo the visitor is actually
 * looking at (the hero, the lightbox's current frame) so a long rail cannot starve it. */
export function requestMediaSlot(start: () => void, front = false): () => void {
  const waiter: Waiter = { start, started: false };
  let released = false;
  let watchdog: ReturnType<typeof setTimeout> | undefined;

  const release = () => {
    if (released) return;
    released = true;
    if (watchdog) clearTimeout(watchdog);
    if (waiter.started) {
      active = Math.max(0, active - 1);
      pump();
    } else {
      const i = waiting.indexOf(waiter);
      if (i >= 0) waiting.splice(i, 1);
    }
  };

  const wrapped = () => {
    watchdog = setTimeout(release, SLOT_WATCHDOG_MS);
    start();
  };
  waiter.start = wrapped;

  if (front) waiting.unshift(waiter);
  else waiting.push(waiter);
  pump();
  return release;
}

/** Test/diagnostic view of the queue. */
export function mediaQueueState(): { active: number; waiting: number; max: number } {
  return { active, waiting: waiting.length, max: MAX_IN_FLIGHT };
}

/** Test hook — drop every pending waiter and reset the counter between cases. */
export function __resetMediaQueueForTests(): void {
  active = 0;
  waiting.length = 0;
}
