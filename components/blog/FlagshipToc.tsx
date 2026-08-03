"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { scrollToId, useScrollSpy } from "@/lib/toc/scroll-spy";
import { tocRailStyle, useTocSafeEdge } from "@/lib/toc/safe-edge";

export interface FlagshipTocItem {
  id: string;
  label: string;
  /** A scene is a visual destination rather than a section of prose. The rail marks it, so
   * the reader can tell "there is something to look at here" before jumping. */
  scene?: boolean;
}

/** Floating table of contents for the flagship article.
 *
 * Same idea as the service-page rail (a compact spine of ticks in the left gutter that
 * expands into a labelled card on hover or focus), but the flagship added a problem the
 * service pages never had: it alternates BLACK, NAVY, MIST and WHITE full-bleed bands, and a
 * fixed rail sits on top of all of them. A single palette is illegible over half the page.
 *
 * So the rail reads the band underneath it and flips its own contrast. Each band is tagged
 * `data-band="dark|light"` by the page (scene bands get theirs from the scene registry), and
 * `useBandTone` finds whichever band is under the rail's own vertical position. That is
 * geometry, not hit-testing, so it stays cheap on an rAF-throttled scroll.
 *
 * Scroll-spy, smooth anchor jumps, focus handling and reduced-motion are shared with the
 * blog article and the service pages via lib/toc/scroll-spy.
 */

/** Which band sits under the rail right now. Starts dark: the flagship opens on the cold
 * open, and guessing light there would flash a white rail on first paint. */
function useBandTone(): "dark" | "light" {
  const [tone, setTone] = useState<"dark" | "light">("dark");

  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      // The rail is vertically centred, so ask which band owns the viewport's middle.
      const y = window.innerHeight / 2;
      let next: "dark" | "light" = "light";
      for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-band]"))) {
        const r = el.getBoundingClientRect();
        if (r.top <= y && r.bottom >= y) {
          next = el.dataset.band === "dark" ? "dark" : "light";
          break;
        }
      }
      setTone(next);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    compute();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return tone;
}

export function FlagshipToc({ items }: { items: FlagshipTocItem[] }) {
  const [activeId, setActiveId] = useScrollSpy(items.map((i) => i.id));
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const tone = useBandTone();
  const dark = tone === "dark";
  // 256 = card chrome (64) + the widest label we allow (12rem). The rail places itself so a
  // card that wide still ends before the measured text edge.
  const railStyle = tocRailStyle(useTocSafeEdge(), 256);

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

  const activeIndex = items.findIndex((i) => i.id === activeId);
  const activeLabel = items[activeIndex]?.label ?? items[0]?.label ?? "";

  return (
    <>
      {/* ── Desktop: fixed hover/focus-expanding rail in the left gutter.
          The rail slides left so a fully expanded card ends BEFORE the text — the owner caught
          the opened card standing on a scene heading (2026-07-29). That fix derived the safe
          edge from an assumed container (`max-w-6xl + px-8`), which is a guess: measured at
          1512 the narrowest text on this page actually starts at 163px, not the 212px the
          formula predicted, so the card still covered the lead form by 17px. The edge is now
          MEASURED from the DOM (lib/toc/safe-edge) and the labels clamp to the room that is
          really there. Hidden until the measurement lands, so it cannot flash in the wrong
          place. */}
      {railStyle && (
      <nav
        data-toc
        aria-label="On this page"
        className="group fixed top-1/2 z-40 hidden -translate-y-1/2 min-[1360px]:block"
        style={railStyle}
      >
        <div
          aria-hidden
          className={`pointer-events-none absolute -inset-x-4 -inset-y-3 rounded-2xl border opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 ${
            dark
              ? "border-white/12 bg-ink/85 shadow-lift"
              : "border-line bg-paper/95 shadow-lift"
          }`}
        />
        <ul className="relative flex flex-col gap-1">
          {items.map((it, i) => {
            const active = it.id === activeId;
            const read = activeIndex > -1 && i < activeIndex;
            return (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  onClick={(e) => jump(e, it.id)}
                  aria-current={active ? "location" : undefined}
                  // The river-navy focus ring is ~8.5:1 on white and 1.5:1 on ink, so over the
                  // dark bands it is a ring nobody can see (WCAG 1.4.11 wants 3:1).
                  // globals.css already solves this for dark SURFACES via `.bg-ink
                  // :focus-visible`, but this rail is position:fixed outside <article>, so it
                  // is never a descendant of an ink section and never inherits that fix.
                  // It cannot be solved with a utility either: that same file warns the global
                  // `:focus-visible` rule is UNLAYERED and therefore beats every Tailwind
                  // `focus-visible:outline-*`. An inline outline-color is the one thing that
                  // wins, and it only overrides the colour, so the width and offset still come
                  // from the site-wide rule.
                  style={dark ? { outlineColor: "var(--color-paper)" } : undefined}
                  className="flex items-center rounded-lg outline-offset-4"
                >
                  {/* 24px hit cell keeps the resting target accessible; the tick lives inside. */}
                  <span aria-hidden className="grid h-6 w-6 shrink-0 place-items-center">
                    <span
                      className={`block rounded-full transition-all duration-300 ${
                        it.scene ? "h-[3px]" : "h-0.5"
                      } ${
                        active
                          ? "w-4 bg-porchlight"
                          : read
                            ? dark
                              ? "w-2.5 bg-white/45"
                              : "w-2.5 bg-[#9aa3ad]"
                            : dark
                              ? "w-2.5 bg-white/22"
                              : "w-2.5 bg-[#c3c9d2]"
                      }`}
                    />
                  </span>
                  <span
                    title={it.label}
                    className={`max-w-0 overflow-hidden text-ellipsis whitespace-nowrap pl-2 text-[13px] leading-none opacity-0 transition-all duration-200 group-hover:max-w-[min(12rem,var(--toc-label-max))] group-hover:opacity-100 group-focus-within:max-w-[min(12rem,var(--toc-label-max))] group-focus-within:opacity-100 ${
                      active
                        ? dark
                          ? "font-bold text-paper"
                          : "font-bold text-ink"
                        : dark
                          ? "text-paper/65"
                          : "text-stone"
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
      )}

      {/* ── Mobile / narrow: floating trigger + bottom sheet, matching the rest of the site.
          Shown whenever the rail is NOT — a runtime decision now, not just a breakpoint: a wide
          viewport whose gutter cannot hold a readable label gets the sheet too. */}
      <div className={railStyle ? "min-[1360px]:hidden" : ""}>
        {!open && (
          // Centred inside the space that EXCLUDES the site's chat launcher rather than in the
          // viewport. Centred on the viewport, this pill lands 1px from the launcher at 390 and
          // overlaps it outright once the active label is a long one.
          <div className="fixed inset-x-4 bottom-5 right-[5.25rem] z-50 flex justify-center">
          <button
            type="button"
            data-toc-trigger
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            className="flex max-w-full items-center gap-2.5 rounded-full border border-white/12 bg-ink px-5 py-3 text-sm text-paper shadow-float"
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
          </div>
        )}

        {open && (
          <div
            ref={sheetRef}
            onKeyDown={onSheetKeyDown}
            /* z-[1000000], not z-[70], and the number is not arbitrary.
             *
             * The chat launcher injected by /rlt-chat.js is `position: fixed` at
             * z-index 999998, bottom right. At z-[70] this sheet opened UNDERNEATH it, so on a
             * 390px phone a 60x60 button belonging to a different widget sat on top of the
             * navigation rows in the bottom right corner of an `aria-modal` dialog. Measured on
             * the real page: bubble at (314,768)-(374,828) against a sheet running from y=490
             * to the bottom of the viewport.
             *
             * The site already knew about this and this rail was the only surface that did not:
             * components/idx/ListingGallery.tsx and components/leads/QualifyingWizard.tsx use
             * z-[1000000], and components/leads/ListingLeadCTAs.tsx uses z-[1000001], all of
             * them to clear the same launcher. This now follows that convention rather than
             * inventing a third one.
             *
             * components/blog/ArticleToc.tsx had the identical bug and is fixed with it.
             * components/services/ServiceToc.tsx still has it, and belongs to another session:
             * see docs/blog-flagship/SERVICES-CRITIQUE.md. */
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
              <ul className="space-y-0.5">
                {items.map((it) => {
                  const active = it.id === activeId;
                  return (
                    <li key={it.id}>
                      <a
                        href={`#${it.id}`}
                        onClick={(e) => jump(e, it.id)}
                        aria-current={active ? "location" : undefined}
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
                          active ? "bg-mist font-bold text-ink" : "text-stone hover:bg-mist hover:text-ink"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`shrink-0 rounded-full ${
                            it.scene ? "h-2 w-2" : "h-1.5 w-1.5"
                          } ${active ? "bg-porchlight" : "bg-[#c3c9d2]"}`}
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
