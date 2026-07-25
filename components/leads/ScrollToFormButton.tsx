"use client";

import type { MouseEventHandler, ReactNode } from "react";
import { Button, type Variant } from "@/components/ui/Button";

/** The live selling page's scrollToForm() behavior, reimplemented: smooth-scroll to the
 * hero offer form with a ~100px top offset and focus its first input after the scroll
 * settles. Renders a real anchor (href="#offer-form") so it still jumps with no JS; the
 * handler upgrades it to a smooth scroll + focus. Respects prefers-reduced-motion with an
 * instant jump (and immediate focus). */
export function ScrollToFormButton({
  variant = "outline",
  className,
  children,
  targetId = "offer-form",
}: {
  variant?: Variant;
  className?: string;
  children: ReactNode;
  targetId?: string;
}) {
  const onClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    const el = document.getElementById(targetId);
    if (!el) return; // no matching target — let the href="#…" anchor jump
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    const focusFirst = () => {
      // The first REAL field — skip the hidden interest-reason input and the off-screen
      // honeypot (tabindex=-1), so focus lands on the visible name field.
      const input = el.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([tabindex="-1"]), textarea, select',
      );
      input?.focus({ preventScroll: true });
    };
    if (reduce) focusFirst();
    else window.setTimeout(focusFirst, 800);
  };

  return (
    <Button href={`#${targetId}`} variant={variant} className={className} onClick={onClick}>
      {children}
    </Button>
  );
}
