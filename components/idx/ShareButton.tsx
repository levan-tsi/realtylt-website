"use client";

import { useState } from "react";

/** Share the listing — native share sheet where the platform has one, clipboard fallback.
 * Quiet chip styled to sit beside the breadcrumb row on the detail page. */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user dismissed the sheet — fall through to nothing
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable (very old browser) — leave the button inert
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex min-h-6 items-center gap-1.5 border border-ink/15 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      aria-live="polite"
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5.5a2 2 0 1 0-1.9-2.6L5.8 5.1a2 2 0 1 0 0 3.4l4.3 2.2a2 2 0 1 0 .5-.9L6.3 7.6a2 2 0 0 0 0-1.6l4.3-2.2c.36.44.9.7 1.4.7Z" fill="currentColor" stroke="none" />
      </svg>
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
