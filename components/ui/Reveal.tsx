"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/** Reveal-on-scroll wrapper. CSS in globals.css (.reveal / .is-visible), reduced-motion safe. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  /** Stagger delay in ms. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      // A THRESHOLD IS A RATIO OF THE ELEMENT, so it silently fails for anything large
      // relative to the viewport — and the listing page's entire conversion column is one such
      // element. Measured at 1440x900 on /homes-for-sale/.../KEY1002622: the aside is 836px
      // tall and sits at y=694, so it never reached 12% of ITSELF and stayed at opacity 0 with
      // is-visible never applied — the tour request, the offer CTA, the agent and the lead form
      // were an empty white column on first paint. The 40px-shorter photo-poor listing (y=654)
      // crossed the line and rendered, which is why it looked like a data difference.
      //
      // The rule that was meant is "reveal once a bit of it is genuinely on screen", and that
      // is a PIXEL rule, not a ratio. threshold 0 + an 80px bottom rootMargin says exactly
      // that: the element's top must have come up 80px past the fold. For an ordinary ~300px
      // card the old pair required 76px of travel and this requires 80px, so nothing about the
      // site's existing reveals visibly changes; for anything tall it now fires at all.
      { threshold: 0, rootMargin: "0px 0px -80px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={`reveal ${className}`} style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}>
      {children}
    </Tag>
  );
}
