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
    const entered = () => setFocused(document.activeElement === ref.current);
    const left = () => setFocused(false);
    window.addEventListener("blur", entered);
    window.addEventListener("focus", left);
    return () => {
      window.removeEventListener("blur", entered);
      window.removeEventListener("focus", left);
    };
  }, []);

  return (
    <div className={focused ? "outline-2 outline-offset-2 outline-river" : undefined}>
      <iframe ref={ref} src={src} title={title} className={className} loading="lazy" />
    </div>
  );
}
