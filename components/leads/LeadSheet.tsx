"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/** THE SITE'S ONE LEAD MODAL SHELL.
 *
 * Lifted VERBATIM out of components/leads/ListingLeadCTAs.tsx in round 38, where it had been a
 * private `Sheet`, because /connect needed the same thing and the brief for that work was explicit:
 * reuse this, do not invent a second modal system. Two modal shells on one site is how two sets of
 * focus-trap bugs get fixed once each. Nothing about the behaviour changed in the move — the listing
 * tour and offer sheets render exactly what they rendered before.
 *
 * What it already does, and what any new caller therefore gets for free: focus trap on Tab and
 * Shift+Tab, Escape to close, focus restored to whatever opened it, body-scroll lock while open,
 * a backdrop that closes on mousedown but only when the backdrop itself is the target, and a
 * portal to <body>.
 *
 * MOTION. The panel enters on .rlt-pop-in — opacity plus scale(0.98) and 14px of travel over 300ms
 * on the site's own ease-out curve. It deliberately does not start from scale(0): nothing in the
 * real world appears from nothing. Centred rather than origin-aware, which is right for a MODAL —
 * origin-awareness belongs to popovers anchored to a trigger, and a modal is anchored to the
 * viewport. Below sm it lands as a bottom sheet, which is where a thumb is.
 */
export function LeadSheet({
  titleId,
  onClose,
  wide = false,
  children,
}: {
  titleId: string;
  onClose: () => void;
  /** Roomier panel for the offer sheet, whose two qualifying questions sit side by side. */
  wide?: boolean;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("input,select,textarea,button")?.focus();
    return () => {
      document.body.style.overflow = prev;
      restoreRef.current?.focus?.();
    };
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const f = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),textarea,input:not([disabled]),select,[tabindex]:not([tabindex="-1"])',
      );
      if (!f || f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  // Portal to <body> so the sheet escapes the sticky right-rail's stacking context — otherwise its
  // z-index can't beat the photo lightbox (which is why "In Person Tour" from the gallery appeared
  // BEHIND the photos). At <body> level, z-[1000001] correctly sits above the gallery's z-[1000000].
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="rlt-fade-in fixed inset-0 z-[1000001] flex items-end justify-center bg-ink/70 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        className={`rlt-pop-in relative max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-paper text-ink shadow-float ${
          wide ? "max-w-xl" : "max-w-md"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 z-10 grid h-11 w-11 place-items-center text-stone transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
