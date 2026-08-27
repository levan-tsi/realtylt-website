"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { scrollToId, useScrollSpy } from "@/lib/toc/scroll-spy";
import type { TocItem } from "@/lib/blog/toc";

/** Hovering table of contents with scroll-spy.
 *
 * Desktop: a sticky rail (right column) whose active row is marked on a vertical line.
 * Mobile: a floating "Contents" pill that opens a bottom sheet of the same sections.
 * Active state comes from a single IntersectionObserver that watches the heading elements;
 * the topmost heading inside a band under the viewport top wins, and the highlight holds
 * (never blanks) while you read between headings. Anchor jumps are smooth unless the reader
 * prefers reduced motion, and focus moves into the target section for keyboard users.
 */
export function ArticleToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useScrollSpy(items.map((i) => i.id));
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

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

  // The sheet says aria-modal, so it has to behave like one: focus lands inside it, the page
  // behind neither scrolls nor takes Tab, and closing hands focus back to the trigger.
  // Restoring by SELECTOR rather than by remembering document.activeElement is deliberate —
  // the trigger unmounts as the sheet opens, so by the time this effect runs the active element
  // is already <body> and the remembered node would be a dead end. (Same trap, same fix, as
  // components/services/ServiceToc.tsx.)
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sheetRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.querySelector<HTMLElement>("[data-toc-trigger]")?.focus();
    };
  }, [open]);

  // Tab is trapped inside the sheet.
  const onSheetKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const f = sheetRef.current?.querySelectorAll<HTMLElement>(
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
  }, []);

  const activeText = items.find((i) => i.id === activeId)?.text ?? items[0]?.text ?? "";

  const List = ({ variant }: { variant: "rail" | "sheet" }) => (
    <ul className={variant === "rail" ? "relative border-l border-line" : "space-y-0.5"}>
      {items.map((it) => {
        const active = it.id === activeId;
        if (variant === "rail") {
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                onClick={(e) => jump(e, it.id)}
                aria-current={active ? "location" : undefined}
                className={`-ml-px block border-l-2 py-1.5 text-[13px] leading-snug transition-colors duration-200 ${
                  it.depth === 3 ? "pl-7" : "pl-4"
                } ${
                  active
                    ? "border-porchlight font-bold text-ink"
                    : "border-transparent text-stone hover:border-line-strong hover:text-ink"
                }`}
              >
                {it.text}
              </a>
            </li>
          );
        }
        return (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              onClick={(e) => jump(e, it.id)}
              aria-current={active ? "location" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
                it.depth === 3 ? "pl-9" : ""
              } ${active ? "bg-mist font-bold text-ink" : "text-stone hover:bg-mist hover:text-ink"}`}
            >
              <span
                aria-hidden
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-porchlight" : "bg-[#c3c9d2]"}`}
              />
              {it.text}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* ── Desktop rail */}
      <nav
        data-toc
        aria-label="On this page"
        className="hidden lg:block lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
      >
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-stone">On this page</p>
        <List variant="rail" />
      </nav>

      {/* ── Mobile floating trigger + bottom sheet */}
      <div className="lg:hidden">
        {!open && (
          <button
            type="button"
            data-toc-trigger
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            /* Width cap + prefix give-way: components/blog/FlagshipToc.tsx documents both.
             * The old max-w-[86vw] cleared the chat launcher only because the labels here
             * happened to be short; a long heading grew the pill under the bubble. */
            className="fixed bottom-5 left-1/2 z-50 flex max-w-[calc(100%-10.5rem)] -translate-x-1/2 items-center gap-2.5 rounded-full border border-white/12 bg-ink px-5 py-3 text-sm text-paper shadow-float"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current" strokeWidth="1.9">
              <path d="M4 6h10M4 12h16M4 18h12" strokeLinecap="round" />
            </svg>
            <span className="min-w-0 truncate">
              <span className="hidden text-paper/55 min-[560px]:inline">On this page</span>
              <span className="mx-1.5 hidden text-paper/30 min-[560px]:inline">/</span>
              <span className="font-bold">{activeText}</span>
            </span>
          </button>
        )}

        {open && (
          <div
            ref={sheetRef}
            onKeyDown={onSheetKeyDown}
            /* z-[1000000] for the same reason as components/blog/FlagshipToc.tsx: the chat
             * launcher from /rlt-chat.js is fixed at z-index 999998 and was painting on top of
             * this aria-modal dialog. The rest of the site's full-screen overlays already use
             * 1000000 and up to clear it. */
            className="fixed inset-0 z-[1000000]"
            role="dialog"
            aria-modal="true"
            aria-label="On this page"
          >
            <button
              type="button"
              aria-label="Close contents"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink/40"
            />
            <div className="toc-sheet absolute inset-x-0 bottom-0 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-line bg-paper px-4 pb-8 pt-3">
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
              <List variant="sheet" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
