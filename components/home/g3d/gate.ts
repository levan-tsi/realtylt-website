/** WHEN THE MAP MAY MOVE, AND WHEN OUR HOMES MAY CHANGE (round 56 phase 1b), as pure logic.
 *
 * Measured in phase 1 (docs/parity/DESIGN-ROUND56.md §7): Google's renderer stalls 50 to 100 ms
 * while it streams and decodes tiles during a camera flight, with or without our markers. Two
 * rules follow, and this gate holds both:
 *  - A flight starts only over a map that has finished drawing (`gmp-steadychange{isSteady:true}`)
 *    and is not already flying. A section change that arrives while the map is streaming or flying
 *    is HELD, and only the latest one: a fling across four sections is one flight, to where the
 *    reader stopped. So that a map that never settles (a dense city on a slow line) cannot hold
 *    the page hostage, a held flight goes anyway after `maxWaitMs` (counted from the request, or
 *    from the landing if one was in the air), but never over a flight.
 *  - Our homes are added or taken away only when the map is steady, not flying, and has no flight
 *    waiting: marker work never shares a frame with a flight. */
export class FlightGate<T> {
  private flying = false;
  private steady = false;
  private pending: T | null = null;
  private since = 0;

  constructor(readonly maxWaitMs = 1200) {}

  /** A new destination. Returned if it may fly now; otherwise held (the latest replaces any other). */
  request(t: T, now: number): T | null {
    if (!this.flying && this.steady && this.pending === null) return t;
    if (this.pending === null) this.since = now;
    this.pending = t;
    return null;
  }

  /** The destination waiting, if any. */
  held(): T | null {
    return this.pending;
  }

  /** Drop a held destination (the page went back to where the map already is). */
  clear() {
    this.pending = null;
  }

  started() {
    this.flying = true;
  }

  /** The flight is over; returns the held destination if it may go now. A destination held during
   * the flight waits for the map to settle from HERE (the time limit starts at the landing: a map
   * is never steady while it flies, so counting the flight would always release it unsettled). */
  landed(now: number): T | null {
    this.flying = false;
    if (this.pending !== null) this.since = Math.max(this.since, now);
    return this.release(now);
  }

  /** The map's steady state changed; returns the held destination if it may go now. */
  setSteady(s: boolean, now: number): T | null {
    this.steady = s;
    return this.release(now);
  }

  /** Called on a timer while something is held: lets it go once it has waited `maxWaitMs`. */
  poll(now: number): T | null {
    return this.release(now);
  }

  private release(now: number): T | null {
    if (this.pending === null || this.flying) return null;
    if (!this.steady && now - this.since < this.maxWaitMs) return null;
    const t = this.pending;
    this.pending = null;
    return t;
  }

  /** Whether marker work may run now. */
  canMark(): boolean {
    return !this.flying && this.steady && this.pending === null;
  }

  isFlying(): boolean {
    return this.flying;
  }

  isSteady(): boolean {
    return this.steady;
  }
}
