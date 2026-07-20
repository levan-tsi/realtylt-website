"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

/** Save Search v2 — name-the-search dialog (live realtylt.com opens a sign-up wall here; we
 * keep the no-account DEVICE path and offer sign-in to SYNC, which beats live). Prefilled with
 * a readable label built from the active filters; a device save later migrates into the account
 * automatically on sign-in (SavedProvider.migrate). Bottom-sheet on mobile, centered on desktop,
 * with a focus trap, Esc, restored focus, and body-scroll lock. */
export function SaveSearchDialog({
  defaultName,
  summary,
  signedIn,
  accountsEnabled,
  onSave,
  onSignIn,
  onClose,
}: {
  defaultName: string;
  summary: string[];
  signedIn: boolean;
  accountsEnabled: boolean;
  onSave: (name: string) => void;
  onSignIn: () => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const [name, setName] = useState(defaultName);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Land on the name field (select its text so a rename is one keystroke), not the close X.
    const input = panelRef.current?.querySelector<HTMLInputElement>("#save-search-name");
    if (input) {
      input.focus();
      input.select();
    } else {
      panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    }
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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave(name.trim() || defaultName);
    setSaved(true);
  }

  return (
    <div
      className="rlt-fade-in fixed inset-0 z-[1000000] flex items-end justify-center bg-ink/70 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-6"
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
        className="rlt-pop-in relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[6px] bg-paper text-ink shadow-2xl"
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

        {saved ? (
          <div role="status" tabIndex={-1} className="px-6 pb-7 pt-9 text-center outline-none sm:px-8">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-porchlight/10 text-porchlight-deep">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m5 12.5 4.5 4.5L19 7" />
              </svg>
            </span>
            <h2 id={titleId} className="mt-4 text-2xl font-light text-ink">Search saved.</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-stone">
              {signedIn
                ? "It's on your account — we'll alert you when new homes match."
                : "It's saved to this device. Sign in to sync it everywhere and get email alerts."}
            </p>
            <div className="mt-6 flex flex-col items-center gap-3">
              {accountsEnabled && !signedIn && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSignIn();
                  }}
                  className="w-full rounded-[4px] bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river sm:w-auto"
                >
                  Sign in to sync + get alerts
                </button>
              )}
              <div className="flex items-center gap-4">
                <a href="/saved" className="text-sm font-bold text-porchlight-deep underline-offset-4 hover:underline">
                  View saved searches
                </a>
                <button type="button" onClick={onClose} className="text-sm font-bold text-stone underline-offset-4 hover:text-ink hover:underline">
                  Done
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="px-6 pb-7 pt-9 sm:px-8">
            <h2 id={titleId} className="text-2xl font-light text-ink">Save this search</h2>
            <p className="mt-1.5 text-sm text-stone">
              Name it and we&rsquo;ll keep these filters so you can rerun them in one tap.
            </p>

            {summary.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Filters in this search">
                {summary.map((s) => (
                  <li key={s} className="rounded-full bg-mist px-2.5 py-1 text-[12px] text-ink-soft">
                    {s}
                  </li>
                ))}
              </ul>
            )}

            <label htmlFor="save-search-name" className="mt-5 block text-[11px] font-bold uppercase tracking-[0.14em] text-stone">
              Search name
            </label>
            <input
              id="save-search-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="Name this search"
              className="mt-1.5 w-full rounded-[4px] border border-[#cccccc] bg-white px-3.5 py-3 text-base text-ink-soft transition-colors placeholder:text-stone focus:border-ink/50 focus:outline-none focus:ring-1 focus:ring-ink/40"
            />

            {accountsEnabled && !signedIn && (
              <p className="mt-3 text-[13px] leading-relaxed text-stone">
                Saving to this device.{" "}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSignIn();
                  }}
                  className="font-bold text-porchlight-deep underline-offset-2 hover:underline"
                >
                  Sign in
                </button>{" "}
                to sync across devices and get new-listing alerts.
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-[4px] px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-stone transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-[4px] bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
              >
                Save search
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
