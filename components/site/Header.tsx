"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FairHousingBar } from "@/components/site/FairHousingBar";
import { NAV, SITE } from "@/lib/site";
import { savedCount, SAVED_EVENT } from "@/lib/saved";

/** Site header matched to live realtylt.com (Brivity):
 * utility bar (#f3f5f8) → Fair Housing bar (#d3d6d9) → white logo row →
 * uppercase gray nav row with boxed CONNECT, border-b #ddd, not sticky. */
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
    <header className="bg-paper">
      {/* Utility bar — live: 41px, bg #f3f5f8, right-aligned account link */}
      <div className="bg-mist">
        <div className="mx-auto flex h-10 max-w-6xl items-center justify-between px-4 lg:px-8">
          <a href={SITE.phoneHref} className="text-sm text-stone transition-colors hover:text-ink">
            {SITE.phone}
          </a>
          <Link
            href="/saved"
            className="flex items-center gap-1.5 text-sm text-stone transition-colors hover:text-ink"
            aria-label={`Saved homes and searches${saved ? ` (${saved})` : ""}`}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-transparent stroke-current" strokeWidth="1.8">
              <path d="M12 20.3 4.7 13a4.8 4.8 0 0 1 0-6.8 4.8 4.8 0 0 1 6.8 0l.5.5.5-.5a4.8 4.8 0 0 1 6.8 6.8L12 20.3z" />
            </svg>
            Saved{saved > 0 ? ` (${saved})` : ""}
          </Link>
        </div>
      </div>

      <FairHousingBar />

      {/* Logo row — live: white, RT logo 300x62 left */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pb-5 pt-7 lg:px-8">
        <Link href="/" aria-label="RealtyLT home">
          <Image
            src="/logo-realtylt.png"
            alt="RealtyLT"
            width={300}
            height={62}
            priority
            className="h-auto w-56 md:w-[300px]"
          />
        </Link>
        <button
          type="button"
          className="p-2 text-stone hover:text-ink xl:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          <span aria-hidden className="text-2xl leading-none">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Nav row — live: 16px bold uppercase #808080, hover #000, boxed CONNECT */}
      <div className="border-b border-[#dddddd]">
        <nav aria-label="Primary" className="hidden xl:block">
          <ul className="mx-auto flex max-w-6xl items-center gap-6 px-4 pb-5 text-[15px] font-bold uppercase tracking-wide lg:px-8">
            {NAV.map((item) => {
              const boxed = item.label === "Connect";
              const active = pathname === item.href;
              return (
                <li key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`transition-colors hover:text-ink ${active ? "text-ink" : "text-stone"} ${
                      boxed ? "border border-stone px-5 py-2.5 hover:border-ink" : "py-2"
                    }`}
                  >
                    {item.label}
                    {"children" in item && item.children ? <span aria-hidden> ▾</span> : null}
                  </Link>
                  {"children" in item && item.children && (
                    <ul className="invisible absolute left-0 top-full z-50 min-w-48 border border-[#dddddd] bg-paper opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link
                            href={c.href}
                            className="block px-4 py-2.5 text-sm text-stone transition-colors hover:bg-ink hover:text-paper"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {open && (
        <nav aria-label="Mobile" className="border-b border-[#dddddd] bg-paper xl:hidden">
          <ul className="px-4 py-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 text-sm font-bold uppercase tracking-wide text-stone hover:text-ink"
                >
                  {item.label}
                </Link>
                {"children" in item && item.children && (
                  <ul className="pb-1 pl-4">
                    {item.children.map((c) => (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          onClick={() => setOpen(false)}
                          className="block py-1.5 text-sm uppercase text-stone hover:text-ink"
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
