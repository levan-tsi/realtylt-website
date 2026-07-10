"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, SITE } from "@/lib/site";
import { savedCount, SAVED_EVENT } from "@/lib/saved";

/** Site header: logo, primary nav (Top Areas dropdown), Saved hearts, phone.
 * Mobile: sheet menu. Polished further in Phase B. */
export function Header() {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    setSaved(savedCount());
    const sync = () => setSaved(savedCount());
    window.addEventListener(SAVED_EVENT, sync);
    return () => window.removeEventListener(SAVED_EVENT, sync);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur border-b border-mist">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="RealtyLT home">
          {/* RT mark — blue/black per brand */}
          <span className="font-mono text-lg font-bold border-2 border-river text-river px-1.5 leading-tight">
            RT
          </span>
          <span className="font-sans text-xl font-bold tracking-widest">
            REALTY<span className="text-river">LT</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden xl:block">
          <ul className="flex items-center gap-5 text-sm font-semibold tracking-wide">
            {NAV.map((item) => (
              <li key={item.href} className="relative group">
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={`py-2 transition-colors hover:text-ink ${
                    pathname === item.href ? "text-ink" : "text-stone"
                  }`}
                >
                  {item.label}
                  {"children" in item && item.children ? " ▾" : ""}
                </Link>
                {"children" in item && item.children && (
                  <ul className="invisible absolute left-0 top-full min-w-44 bg-paper border border-mist shadow-lg opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    {item.children.map((c) => (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          className="block px-4 py-2 text-stone hover:bg-ink hover:text-paper transition-colors"
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/saved"
            className="relative grid h-9 w-9 place-items-center text-stone hover:text-porchlight-deep transition-colors"
            aria-label={`Saved homes and searches${saved ? ` (${saved})` : ""}`}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-transparent stroke-current" strokeWidth="1.8">
              <path d="M12 20.3 4.7 13a4.8 4.8 0 0 1 0-6.8 4.8 4.8 0 0 1 6.8 0l.5.5.5-.5a4.8 4.8 0 0 1 6.8 6.8L12 20.3z" />
            </svg>
            {saved > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-porchlight px-1 font-mono text-[9px] font-bold text-ink">
                {saved}
              </span>
            )}
          </Link>
          <a
            href={SITE.phoneHref}
            className="hidden md:inline-block border border-ink px-4 py-2 text-sm font-bold tracking-wide hover:bg-ink hover:text-paper transition-colors"
          >
            {SITE.phone}
          </a>
          <button
            type="button"
            className="xl:hidden p-2"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
          >
            <span aria-hidden>{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Mobile" className="xl:hidden border-t border-mist bg-paper">
          <ul className="px-4 py-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 font-semibold text-stone hover:text-ink"
                >
                  {item.label}
                </Link>
                {"children" in item && item.children && (
                  <ul className="pl-4 pb-1">
                    {item.children.map((c) => (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          onClick={() => setOpen(false)}
                          className="block py-1.5 text-sm text-stone hover:text-ink"
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
