"use client";

import { useCallback, useEffect, useState } from "react";
import { scrollToId, useScrollSpy } from "@/lib/toc/scroll-spy";
import type { ServiceTocItem } from "@/lib/services/toc";

/** Hovering table of contents for a service page.
 *
 * The service sections are full-bleed bands (ink / mist / paper), so the blog's in-column
 * grid rail does not translate. Instead the desktop ToC is a fixed rail that floats in the
 * left gutter: at rest a compact spine of ticks whose active tick is lit (the scroll-spy is
 * legible without hovering), and on hover or keyboard focus it expands into a labelled card.
 * Below the wide breakpoint the gutter disappears, so it falls back to the same floating
 * "On this page" pill and bottom sheet the blog uses. Active state, smooth anchor jumps, and
 * reduced-motion handling are shared with the blog via lib/toc/scroll-spy.
 */
export function ServiceToc({ items }: { items: ServiceTocItem[] }) {
  const [activeId, setActiveId] = useScrollSpy(items.map((i) => i.id));
  const [open, setOpen] = useState(false);

  const jump = useCallback(
    (e: React.MouseEvent, id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      scrollToId(id);
      setActiveId(id);
      setOpen(false);
    },
    [setActiveId],
  );

  // Close the sheet on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const activeLabel = items.find((i) => i.id === activeId)?.label ?? items[0]?.label ?? "";

  return (
    <>
      {/* ── Desktop: fixed hover/focus-expanding rail in the left gutter.
          left = the gutter minus the rail, clamped so it never crosses the content. */}
      <nav
        data-toc
        aria-label="On this page"
        className="group fixed top-1/2 z-40 hidden -translate-y-1/2 min-[1360px]:block"
        style={{ left: "max(1.5rem, calc((100vw - 80rem) / 2 - 3.25rem))" }}
      >
        {/* The floating card materialises behind the labels on hover / focus. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-4 -inset-y-3 rounded-2xl border border-[#e3e6ea] bg-paper/95 opacity-0 shadow-[0_18px_44px_-22px_rgba(16,24,32,0.5)] backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
        />
        <ul className="relative flex flex-col gap-1">
          {items.map((it) => {
            const active = it.id === activeId;
            return (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  onClick={(e) => jump(e, it.id)}
                  aria-current={active ? "location" : undefined}
                  className="flex items-center rounded-md"
                >
                  {/* 24px hit cell keeps the resting target accessible; the tick lives inside. */}
                  <span aria-hidden className="grid h-6 w-6 shrink-0 place-items-center">
                    <span
                      className={`block h-0.5 rounded-full transition-all duration-300 ${
                        active ? "w-4 bg-porchlight" : "w-2.5 bg-[#c3c9d2] group-hover:bg-[#aeb6c0]"
                      }`}
                    />
                  </span>
                  {/* Label is clipped to zero width at rest (no invisible overlay over the
                      content), and slides open with the card. */}
                  <span
                    className={`max-w-0 overflow-hidden whitespace-nowrap pl-2 text-[13px] leading-none opacity-0 transition-all duration-200 group-hover:max-w-[11rem] group-hover:opacity-100 group-focus-within:max-w-[11rem] group-focus-within:opacity-100 ${
                      active ? "font-bold text-ink" : "text-stone"
                    }`}
                  >
                    {it.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Mobile / narrow: floating trigger + bottom sheet (same as the blog article). */}
      <div className="min-[1360px]:hidden">
        {!open && (
          <button
            type="button"
            data-toc-trigger
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            className="fixed bottom-5 left-1/2 z-50 flex max-w-[86vw] -translate-x-1/2 items-center gap-2.5 rounded-full border border-[#2a2a2a] bg-ink px-5 py-3 text-sm text-paper shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0 fill-none stroke-current"
              strokeWidth="1.9"
            >
              <path d="M4 6h10M4 12h16M4 18h12" strokeLinecap="round" />
            </svg>
            <span className="min-w-0 truncate">
              <span className="text-paper/55">On this page</span>
              <span className="mx-1.5 text-paper/30">/</span>
              <span className="font-bold">{activeLabel}</span>
            </span>
          </button>
        )}

        {open && (
          <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="On this page">
            <button
              type="button"
              aria-label="Close contents"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink/40"
            />
            <div className="toc-sheet absolute inset-x-0 bottom-0 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-[#e3e6ea] bg-paper px-4 pb-8 pt-3">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#d9dde3]" aria-hidden />
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone">On this page</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close contents"
                  className="grid h-8 w-8 place-items-center text-xl leading-none text-stone hover:text-ink"
                >
                  <span aria-hidden>×</span>
                </button>
              </div>
              <ul className="space-y-0.5">
                {items.map((it) => {
                  const active = it.id === activeId;
                  return (
                    <li key={it.id}>
                      <a
                        href={`#${it.id}`}
                        onClick={(e) => jump(e, it.id)}
                        aria-current={active ? "location" : undefined}
                        className={`flex items-center gap-3 rounded-[10px] px-3 py-3 text-sm transition-colors ${
                          active ? "bg-mist font-bold text-ink" : "text-stone hover:bg-mist hover:text-ink"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            active ? "bg-porchlight" : "bg-[#c3c9d2]"
                          }`}
                        />
                        {it.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
