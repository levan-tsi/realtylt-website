"use client";

/** Subtle "there's more below" affordance under the hero (live has one). An anchor first —
 * so it works, and is keyboard-reachable, with no JS — enhanced to a smooth, reduced-motion
 * aware scroll when JS runs. */
export function ScrollCue({ targetId, label }: { targetId: string; label: string }) {
  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = document.getElementById(targetId);
    if (!el) return; // let the native anchor jump handle it
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  return (
    <a
      href={`#${targetId}`}
      onClick={onClick}
      aria-label={label}
      // night: on the blue-hour hero `paper` IS the ground, so paper/70 drew the chevron in the
      // night's own colour: a Tab stop nobody could see (round 53 polish). Haze, moonlight on hover.
      className="mx-auto grid h-9 w-9 place-items-center rounded-full text-paper/70 transition-colors hover:text-paper focus-visible:text-paper night:text-stone night:hover:text-ink night:focus-visible:text-ink"
    >
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </a>
  );
}
