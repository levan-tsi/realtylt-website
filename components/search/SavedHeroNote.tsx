"use client";

import { useSaved } from "@/components/auth/SavedProvider";

/** The /saved header's one-line promise, told truthfully to BOTH kinds of visitor.
 *
 * The static version said "Saved on this device, no account needed" to everyone — shown
 * verbatim to a signed-in visitor whose saves are demonstrably account-bound (2026-08-27
 * E2E: a fresh browser context with empty localStorage restored favorites and searches on
 * sign-in). /portal/collections already said the opposite, correct thing.
 *
 * Server-renders the signed-out line — the majority case, and the only claim that can be
 * made before hydration knows better — and swaps once auth resolves. */
export function SavedHeroNote() {
  const { ready, signedIn } = useSaved();
  return (
    <p className="mt-2 max-w-xl t-small text-paper/70">
      {ready && signedIn ? (
        <>
          Synced to your account, on every device. Turn on email alerts for any saved search
          and we&rsquo;ll watch the market for you.
        </>
      ) : (
        <>
          Saved on this device, no account needed. Save a search, turn on its email alerts,
          and we&rsquo;ll watch the market for you.
        </>
      )}
    </p>
  );
}
