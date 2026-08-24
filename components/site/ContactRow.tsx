"use client";

import type { ReactNode } from "react";
import { PRESS } from "@/components/ui/Button";
import { trackClick } from "@/lib/analytics";

/**
 * One tappable contact on /connect: the phone number and the email address, as controls.
 *
 * WHY IT EXISTS AT ALL. Before this, the contact page's phone number and email were two 14px
 * links in a paragraph inside a rail beside the booking embed — reachable, but not CONTROLS. The
 * owner's direction for this round was that both become first-class at the top of the page, and
 * a first-class contact on a phone is a thing you can hit with a thumb without aiming: 68px of
 * row, the whole of it the link, `tel:` and `mailto:` so the device does the rest.
 *
 * WHY IT IS A CLIENT COMPONENT. The hero it replaces was a <TrackedButton>, which fires the
 * site's gtag click event (category "Phone") — the same event /buying and /selling fire on their
 * phone CTAs, and the one the owner's Ads conversion is wired to. Rendering the row as plain
 * markup would have silently dropped that event on the one page whose whole job is the call, so
 * the onClick comes with it. trackClick no-ops safely when gtag never loaded.
 *
 * THE PRESS is the site's own exported PRESS, not a second idea about pressing: 0.97 at 150ms on
 * ease-out, opted out under reduced motion. That constant also carries the transition property
 * LIST, which is why the hover here is a background change and not a border change — `border-color`
 * is not in it, and adding a second `transition-*` utility on top would fight the first.
 */
export function ContactRow({
  href,
  label,
  value,
  gaCategory,
  gaLabel,
  icon,
}: {
  href: string;
  /** What this reaches, in the visitor's words — "Call or text", not "Phone". */
  label: string;
  value: string;
  gaCategory: string;
  gaLabel: string;
  icon: ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={() => trackClick(gaCategory, gaLabel)}
      className={`flex min-h-[68px] items-center gap-4 rounded-xl border border-ink bg-paper px-4 py-3 ${PRESS} hover:bg-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river`}
    >
      <span aria-hidden className="shrink-0 text-stone">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="t-eyebrow block text-stone">{label}</span>
        {/* 18px, not 20: anything from 20px up is read as a heading by the type scale, and a
            phone number is not a heading. Bold Lato at 18 is the site's own numeric voice on
            these marketing pages. `break-words` is a guard, not a plan — the longest value here
            (the email) measures well inside the 320 column. */}
        <span className="mt-1.5 block break-words text-lg font-bold text-ink">{value}</span>
      </span>
    </a>
  );
}
