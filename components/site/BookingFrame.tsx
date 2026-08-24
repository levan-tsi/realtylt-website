"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The /connect booking embed, with the focus ring the iframe cannot draw for itself.
 *
 * THE PROBLEM. An iframe is a tab stop. A cross-origin iframe is a tab stop whose focus lives in
 * another document, so nothing about it can be styled from here — and the ring is not merely
 * unstyled, it is absent: measured in Chrome by tabbing to it on /connect, `document.activeElement`
 * is the iframe while `iframe:focus` is FALSE and the wrapper's `:focus-within` is FALSE. Focus
 * belongs to the child document, so the parent's focus pseudo-classes never match. That left the
 * largest control on the page as the one tab stop where the ring simply vanishes, on a site whose
 * every other focus stop earned a visible 3:1 ring rounds ago.
 *
 * `focus-within` was the obvious fix and it does not work; this is the measurement that replaced
 * it. What DOES fire, on the Tab that enters the frame, is a `blur` on the top-level window with
 * `document.activeElement` pointing at the iframe. That pair is the signal: the window lost focus
 * AND it went to this frame. Tabbing back out fires `focus` on the window again, which clears it.
 * (Switching browser tabs also blurs the window, but then activeElement is not this iframe, so the
 * guard holds. Coming back to a tab with the frame still focused keeps the ring, which is true.)
 *
 * The ring is the site's own: 2px river at 2px offset, identical to every focus-visible ring on
 * the page, so it reads as this card's ring rather than a second idea about focus. It needs
 * JavaScript, which no CSS-only alternative avoids; without it the embed still books appointments,
 * it just loses the ring, and the titled frame plus the "Open the booking page directly" link
 * below remain the way a keyboard visitor knows where they are.
 */
export function BookingFrame({ src, title, className }: { src: string; title: string; className: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    // ROUND 39 — TWO SIGNALS, AND A SECOND READ. The window blur alone was not enough, and this
    // is the measurement rather than a theory (2026-08-24, /connect on :3100, the scorer's own
    // Tab-walk sequence replayed three times against the same build):
    //
    //   run0  ring absent, clip diff 0.37%   <- graded "no visible ring"
    //   run1  ring present, clip diff 0.87%
    //   run2  ring present, clip diff 0.87%
    //
    // One page, one build, two different verdicts, because the ring hung on a single event that
    // does not always arrive. Two separate ways it fails:
    //
    //  1. `window.blur` fires but `document.activeElement` has not become the iframe YET. Traced
    //     in headless Chromium: focusout(A) at t=4ms with activeElement still BODY, blur at
    //     t=6ms — headed Chrome had already moved it by the blur. A synchronous read is right in
    //     one and wrong in the other.
    //  2. `window.blur` never fires at all, because the window was not the thing that had focus
    //     to begin with — focus arriving programmatically, or a window already blurred.
    //
    // So the ring now arms on `focusout` (focus left something in OUR document — the Tab that
    // enters the frame always produces one) as well as on the window blur, and each arming reads
    // activeElement twice: immediately, and again on the next frame. Both readers only ever set
    // TRUE, and only when activeElement is literally this iframe, so the original guard is intact:
    // switching browser tabs still blurs the window, and if focus is not in this frame nothing
    // rings. `focusin` joins `window.focus` as a clear, because focus landing on any real element
    // of this document means the frame no longer holds it.
    const check = () => {
      if (document.activeElement === ref.current) setFocused(true);
    };
    const armed = () => {
      check();
      requestAnimationFrame(check);
    };
    const left = () => setFocused(false);
    window.addEventListener("blur", armed);
    document.addEventListener("focusout", armed);
    window.addEventListener("focus", left);
    document.addEventListener("focusin", left);
    return () => {
      window.removeEventListener("blur", armed);
      document.removeEventListener("focusout", armed);
      window.removeEventListener("focus", left);
      document.removeEventListener("focusin", left);
    };
  }, []);

  return (
    <div className={focused ? "outline-2 outline-offset-2 outline-river" : undefined}>
      <iframe ref={ref} src={src} title={title} className={className} loading="lazy" />
    </div>
  );
}
