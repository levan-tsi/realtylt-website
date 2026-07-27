"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FairHousingBar } from "@/components/site/FairHousingBar";
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

/** Site header: utility bar (#f3f5f8) → Fair Housing bar (#d3d6d9) → ONE row carrying the
 * logo on the left and the primary nav on the right (the owner wants the logo beside the
 * links, not stacked above them — that stack cost 241px of every viewport). Below xl the
 * nav folds into the hamburger menu, exactly as before. */
export function Header() {
  const [open, setOpen] = useState(false);
  const [areasOpen, setAreasOpen] = useState(false);
  const [boroughsOpen, setBoroughsOpen] = useState(false);
  const [flyout, setFlyout] = useState(false);
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
        setFlyout(false);
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
      if (!(e.target as HTMLElement).closest("[data-top-areas]")) setFlyout(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [flyout]);

  return (
    <header className="bg-paper">
      {/* Utility bar — live: 41px, bg #f3f5f8, right-aligned account link */}
      <div className="bg-mist">
        <div className="mx-auto flex h-10 max-w-[1250px] items-center justify-between px-4 lg:px-8">
          {/* min-h + inline-flex give these three utility links a >=24px pointer target
              (WCAG 2.2 SC 2.5.8); they were 20px tall. The bar's own height is unchanged. */}
          <a
            href={SITE.phoneHref}
            className="inline-flex min-h-[24px] items-center text-sm text-stone transition-colors hover:text-ink"
          >
            {SITE.phone}
          </a>
          <div className="flex items-center gap-4">
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

      <FairHousingBar />

      {/* Logo + primary nav, one row, vertically centred. */}
      <div className="border-b border-[#dddddd]">
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
            <span aria-hidden className="text-2xl leading-none">{open ? "✕" : "☰"}</span>
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
                          onMouseEnter: () => setFlyout(true),
                          onMouseLeave: () => setFlyout(false),
                          onFocus: () => setFlyout(true),
                          onBlur: (e: React.FocusEvent) => {
                            if (!e.currentTarget.contains(e.relatedTarget as Node)) setFlyout(false);
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
                          onClick={() => setFlyout((v) => !v)}
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
                        className={`absolute left-0 top-full z-50 flex gap-6 rounded-2xl border border-[#dddddd] bg-paper p-4 shadow-lg transition-opacity duration-150 motion-reduce:transition-none ${
                          flyout ? "visible opacity-100" : "invisible opacity-0"
                        }`}
                      >
                        {TOP_AREA_GROUPS.map((g, gi) => (
                          <div
                            key={g.id}
                            className={gi > 0 ? "border-l border-[#e6e6e6] pl-6" : undefined}
                          >
                            <p className="whitespace-nowrap px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-stone/70">
                              {g.label}
                            </p>
                            <ul>
                              {g.items.map((c) => (
                                <li key={c.href}>
                                  <Link
                                    href={c.href}
                                    onClick={() => setFlyout(false)}
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

      {open && (
        <nav aria-label="Mobile" className="border-b border-[#dddddd] bg-paper xl:hidden">
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
