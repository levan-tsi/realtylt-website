"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { useSaved } from "@/components/auth/SavedProvider";
import { NAV, SITE, TOP_AREA_GROUPS } from "@/lib/site";

/** A plus that becomes a minus — the affordance the owner asked for on the phone menu.
 * Drawn rather than typed so it stays crisp and carries no glyph baggage. */
function PlusMinus({ open }: { open: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 stroke-current" strokeWidth="1.8" strokeLinecap="round">
      <line x1="2.5" y1="8" x2="13.5" y2="8" />
      <line
        x1="8"
        y1="2.5"
        x2="8"
        y2="13.5"
        className={`origin-center transition-transform duration-200 motion-reduce:transition-none ${
          open ? "scale-y-0" : "scale-y-100"
        }`}
      />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className={`h-3 w-3 fill-none stroke-current transition-transform duration-200 motion-reduce:transition-none ${
        open ? "rotate-180" : ""
      }`}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="2.5,4.5 6,8 9.5,4.5" />
    </svg>
  );
}

/** Site header: ONE utility bar (#f3f5f8) → ONE row carrying the logo on the left and the
 * primary nav on the right (the owner wants the logo beside the links, not stacked above
 * them — that stack cost 241px of every viewport). Below xl the nav folds into the hamburger
 * menu. Round 11 merged the separate Fair Housing strip into the utility bar; see the comment
 * on that bar for why. */
export function Header() {
  const [open, setOpen] = useState(false);
  const [areasOpen, setAreasOpen] = useState(false);
  const [boroughsOpen, setBoroughsOpen] = useState(false);
  // TWO reasons the Top Areas flyout can be open, and they must not cancel each other out.
  // It used to be one boolean: the wrapper's onMouseEnter set it true and the caret's onClick
  // TOGGLED it — so the mouse arriving on the caret opened the menu and the click that
  // followed closed it again. Clicking the caret could therefore never open anything, and on
  // a touchscreen (where the browser synthesises a mouseenter before the tap) it was the only
  // thing that happened. Hover is transient; the click PINS it, so it survives the pointer
  // leaving and a second click puts it away.
  const [flyoutHover, setFlyoutHover] = useState(false);
  const [flyoutPinned, setFlyoutPinned] = useState(false);
  const flyout = flyoutHover || flyoutPinned;
  const closeFlyout = () => {
    setFlyoutHover(false);
    setFlyoutPinned(false);
  };
  const { count: saved } = useSaved();
  const pathname = usePathname();
  const flyoutTrigger = useRef<HTMLButtonElement>(null);
  const areasTrigger = useRef<HTMLButtonElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);

  const closeMobile = () => {
    setOpen(false);
    setAreasOpen(false);
    setBoroughsOpen(false);
  };

  // Escape unwinds one layer at a time and hands focus back to whatever opened it, so a
  // keyboard user is never dropped at the top of the document.
  useEffect(() => {
    if (!open && !flyout) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (flyout) {
        closeFlyout();
        flyoutTrigger.current?.focus();
      } else if (boroughsOpen) {
        setBoroughsOpen(false);
      } else if (areasOpen) {
        setAreasOpen(false);
        areasTrigger.current?.focus();
      } else {
        setOpen(false);
        menuTrigger.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, flyout, areasOpen, boroughsOpen]);

  // A click anywhere else dismisses the desktop flyout.
  useEffect(() => {
    if (!flyout) return;
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-top-areas]")) closeFlyout();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [flyout]);

  return (
    <header className="bg-paper">
      {/* ONE utility bar. This used to be two stacked strips — phone/Saved/Sign-in on #f3f5f8,
          then the Fair Housing Notice on #d3d6d9 — so every page opened with two greys close
          enough to read as an accident, and pushed the logo 42px further down. Merged: same
          links, one quiet rule, one background.
          Below sm the phone number drops out, because it is the one item here that is already
          in the mobile menu, in the footer and on every CTA on the page; the Fair Housing
          Notice is a legal link and stays at every width.
          min-h + inline-flex give each link a >=24px pointer target (WCAG 2.5.8). */}
      <div className="bg-mist">
        <div className="mx-auto flex h-10 max-w-[1250px] items-center justify-between gap-4 px-4 lg:px-8">
          <a
            href={SITE.phoneHref}
            className="hidden min-h-[24px] items-center text-sm text-stone transition-colors hover:text-ink sm:inline-flex"
          >
            {SITE.phone}
          </a>
          <div className="flex min-w-0 items-center gap-4">
            <a
              href={SITE.fairHousingPdf}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[24px] items-center whitespace-nowrap text-sm text-stone transition-colors hover:text-ink"
            >
              Fair Housing Notice
            </a>
            <Link
              href="/saved"
              className="inline-flex min-h-[24px] items-center gap-1.5 text-sm text-stone transition-colors hover:text-ink"
              aria-label={`Saved homes and searches${saved ? ` (${saved})` : ""}`}
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-transparent stroke-current" strokeWidth="1.8">
                <path d="M12 20.3 4.7 13a4.8 4.8 0 0 1 0-6.8 4.8 4.8 0 0 1 6.8 0l.5.5.5-.5a4.8 4.8 0 0 1 6.8 6.8L12 20.3z" />
              </svg>
              Saved{saved > 0 ? ` (${saved})` : ""}
            </Link>
            <AccountMenu />
          </div>
        </div>
      </div>

      {/* Logo + primary nav, one row, vertically centred. */}
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-[1250px] items-center justify-between gap-6 px-4 py-4 lg:px-8">
          <Link href="/" aria-label="RealtyLT home" className="shrink-0">
            <Image
              src="/logo-realtylt.png"
              alt="RealtyLT"
              width={300}
              height={62}
              priority
              className="h-auto w-44 sm:w-52 xl:w-[196px]"
            />
          </Link>

          <button
            ref={menuTrigger}
            type="button"
            className="-mr-2 p-2 text-stone hover:text-ink xl:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => (open ? closeMobile() : setOpen(true))}
          >
            {/* Drawn, not typed. The glyphs that were here rendered at whatever weight and
                width the fallback font decided, next to a nav that is otherwise exact. */}
            <svg aria-hidden viewBox="0 0 22 22" className="h-6 w-6 stroke-current" strokeWidth="1.7" strokeLinecap="round" fill="none">
              {open ? (
                <>
                  <line x1="5" y1="5" x2="17" y2="17" />
                  <line x1="17" y1="5" x2="5" y2="17" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6.5" x2="19" y2="6.5" />
                  <line x1="3" y1="11" x2="19" y2="11" />
                  <line x1="3" y1="15.5" x2="19" y2="15.5" />
                </>
              )}
            </svg>
          </button>

          {/* Nav — live: bold uppercase #808080, hover #000, boxed CONNECT. Sized down from
              15px/gap-6 so ten items and the logo share one 1250px row without wrapping. */}
          <nav aria-label="Primary" className="hidden xl:block">
            <ul className="flex items-center gap-4 text-[13px] font-bold uppercase tracking-[0.03em]">
              {NAV.map((item) => {
                const boxed = item.label === "Connect";
                const active = pathname === item.href;
                const hasGroups = "groups" in item && item.groups;
                return (
                  <li
                    key={item.href}
                    className="group relative"
                    {...(hasGroups
                      ? {
                          "data-top-areas": "",
                          // pointerType, not onMouseEnter: a touchscreen synthesises a
                          // mouseenter just before the tap, so hover-to-open was firing on
                          // touch and the tap that followed only ever closed it again.
                          onPointerEnter: (e: React.PointerEvent) => {
                            if (e.pointerType === "mouse") setFlyoutHover(true);
                          },
                          onPointerLeave: (e: React.PointerEvent) => {
                            if (e.pointerType === "mouse") setFlyoutHover(false);
                          },
                          onFocus: () => setFlyoutHover(true),
                          onBlur: (e: React.FocusEvent) => {
                            if (!e.currentTarget.contains(e.relatedTarget as Node)) closeFlyout();
                          },
                        }
                      : {})}
                  >
                    <span className={hasGroups ? "inline-flex items-center gap-1" : undefined}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`transition-colors hover:text-ink ${active ? "text-ink" : "text-stone"} ${
                          boxed ? "rounded-xl border border-stone px-4 py-2.5 hover:border-ink" : "py-2"
                        }`}
                      >
                        {item.label}
                      </Link>
                      {hasGroups && (
                        <button
                          ref={flyoutTrigger}
                          type="button"
                          aria-expanded={flyout}
                          aria-controls="top-areas-flyout"
                          aria-label={`${flyout ? "Hide" : "Show"} all top areas`}
                          // The click owns the PIN and nothing else, and it drops the transient
                          // hover/focus open at the same time. Anything that reads "is it open
                          // right now" here is wrong, because opening it is exactly what the
                          // pointer arriving (mouse) or the focus landing (touch, keyboard)
                          // has just done — that is how a caret click could only ever close
                          // this menu, and why on a touchscreen it could not be opened at all.
                          onClick={() => {
                            setFlyoutPinned((v) => !v);
                            setFlyoutHover(false);
                          }}
                          className="inline-flex h-6 w-6 items-center justify-center text-stone transition-colors hover:text-ink"
                        >
                          <Chevron open={flyout} />
                        </button>
                      )}
                    </span>

                    {hasGroups && (
                      // Driven purely by state (not :hover) so aria-expanded never lies and
                      // clicking the caret while hovering really does close it.
                      <div
                        id="top-areas-flyout"
                        className={`absolute left-0 top-full z-50 flex gap-6 rounded-2xl border border-line bg-paper p-4 shadow-lift transition-opacity duration-150 motion-reduce:transition-none ${
                          flyout ? "visible opacity-100" : "invisible opacity-0"
                        }`}
                      >
                        {TOP_AREA_GROUPS.map((g, gi) => (
                          <div
                            key={g.id}
                            className={gi > 0 ? "border-l border-line pl-6" : undefined}
                          >
                            <p className="whitespace-nowrap px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-stone/70">
                              {g.label}
                            </p>
                            <ul>
                              {g.items.map((c) => (
                                <li key={c.href}>
                                  <Link
                                    href={c.href}
                                    onClick={closeFlyout}
                                    className="block whitespace-nowrap rounded-xl px-3 py-2 text-[13px] text-stone transition-colors hover:bg-ink hover:text-paper"
                                  >
                                    {c.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Without JavaScript the hamburger cannot open and the flyout cannot expand — below xl
          that used to leave the header with no navigation at all. Serve the same destinations
          as a plain, always-open list instead. Plain <a> rather than <Link>: prefetch is
          meaningless here and it keeps hydration away from the noscript subtree. */}
      <noscript>
        <nav aria-label="Site links" className="border-b border-line bg-paper">
          <ul className="mx-auto flex max-w-[1250px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-[13px] font-bold uppercase tracking-[0.03em] lg:px-8">
            {[
              ...NAV.map((i) => ({ label: i.label, href: i.href })),
              ...TOP_AREA_GROUPS.flatMap((g) => g.items),
            ].map((i) => (
              <li key={`ns-${i.href}`}>
                <a href={i.href} className="block py-1 text-stone hover:text-ink">
                  {i.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </noscript>

      {open && (
        <nav aria-label="Mobile" className="border-b border-line bg-paper xl:hidden">
          <ul className="px-4 py-2">
            {NAV.map((item) => {
              const hasGroups = "groups" in item && item.groups;
              if (!hasGroups) {
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMobile}
                      className="block py-3 text-sm font-bold uppercase tracking-wide text-stone hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }
              const [counties, boroughs] = TOP_AREA_GROUPS;
              return (
                <li key={item.href}>
                  {/* The whole row toggles: the owner's complaint was that these were already
                      dropped open with no way to click them shut. */}
                  <button
                    ref={areasTrigger}
                    type="button"
                    aria-expanded={areasOpen}
                    aria-controls="mobile-top-areas"
                    onClick={() => setAreasOpen((v) => !v)}
                    className="flex w-full items-center justify-between gap-2 py-3 text-left text-sm font-bold uppercase tracking-wide text-stone hover:text-ink"
                  >
                    {item.label}
                    <PlusMinus open={areasOpen} />
                  </button>
                  {areasOpen && (
                    <div id="mobile-top-areas" className="pb-2 pl-3">
                      <ul>
                        {counties.items.map((c) => (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              onClick={closeMobile}
                              className="block py-2 text-sm uppercase text-stone hover:text-ink"
                            >
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        aria-expanded={boroughsOpen}
                        aria-controls="mobile-boroughs"
                        onClick={() => setBoroughsOpen((v) => !v)}
                        className="flex w-full items-center justify-between gap-2 py-3 text-left text-sm font-bold uppercase tracking-wide text-stone hover:text-ink"
                      >
                        {boroughs.label}
                        <PlusMinus open={boroughsOpen} />
                      </button>
                      {boroughsOpen && (
                        <ul id="mobile-boroughs" className="pb-1 pl-3">
                          {boroughs.items.map((c) => (
                            <li key={c.href}>
                              <Link
                                href={c.href}
                                onClick={closeMobile}
                                className="block py-2 text-sm uppercase text-stone hover:text-ink"
                              >
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                      <Link
                        href={item.href}
                        onClick={closeMobile}
                        className="block py-2 text-sm uppercase text-stone underline underline-offset-4 hover:text-ink"
                      >
                        All Top Areas
                      </Link>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
