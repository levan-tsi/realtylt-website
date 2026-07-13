"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";

const TABS = [
  { href: "/portal", label: "Overview" },
  { href: "/portal/collections", label: "Saved Homes" },
  { href: "/portal/searches", label: "Saved Searches" },
  { href: "/portal/reports", label: "My Reports" },
  { href: "/portal/profile", label: "Profile" },
];

/** Auth-gated shell for every /portal page: dark header band + tab nav, with a sign-in
 * prompt when logged out and a graceful "accounts unavailable" state. */
export function PortalShell({ children }: { children: ReactNode }) {
  const { enabled, ready, user, profile, openSignIn } = useAuth();
  const pathname = usePathname();

  const firstName = (profile?.fullName || user?.email || "").split(" ")[0];

  return (
    <>
      <header className="bg-ink py-10 text-paper">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-paper/60">My Portal</p>
          <h1 className="mt-2 text-3xl font-light md:text-4xl">
            {user ? (
              <>
                Welcome{firstName ? <>, <strong className="font-bold">{firstName}</strong></> : null}
              </>
            ) : (
              <>Your <strong className="font-bold">RealtyLT</strong> account</>
            )}
          </h1>
          {user && (
            <nav aria-label="Portal sections" className="mt-6 -mb-2 flex gap-1 overflow-x-auto">
              {TABS.map((t) => {
                const active = pathname === t.href;
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    aria-current={active ? "page" : undefined}
                    className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                      active
                        ? "border-paper text-paper"
                        : "border-transparent text-paper/60 hover:text-paper"
                    }`}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        {!enabled ? (
          <p className="py-16 text-center text-sm text-stone">
            Accounts aren&rsquo;t available right now. Your saved homes are kept on this device —
            visit <Link href="/saved" className="font-bold text-river underline">Saved</Link>.
          </p>
        ) : !ready ? (
          <p className="py-16 text-center text-sm text-stone">Loading your portal…</p>
        ) : !user ? (
          <div className="mx-auto max-w-md rounded-[4px] border border-ink/10 bg-mist p-10 text-center">
            <p className="font-display text-2xl text-ink">Sign in to your portal</p>
            <p className="mt-2 text-sm text-stone">
              Save homes, save searches, and get new-listing alerts — synced across your devices.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button onClick={() => openSignIn("signin")}>Sign in</Button>
              <Button variant="outline" onClick={() => openSignIn("signup")}>
                Create account
              </Button>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </>
  );
}
