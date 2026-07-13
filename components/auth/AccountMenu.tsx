"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

const MENU = [
  { href: "/portal", label: "My Portal" },
  { href: "/portal/collections", label: "Saved Homes" },
  { href: "/portal/searches", label: "Saved Searches" },
  { href: "/portal/reports", label: "My Reports" },
  { href: "/portal/profile", label: "Profile" },
];

/** Utility-bar account control: "Sign In" when logged out, a name + dropdown when logged in. */
export function AccountMenu() {
  const { enabled, ready, user, profile, openSignIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  // Accounts unavailable (Supabase unconfigured): render nothing.
  if (!enabled) return null;
  // Avoid a flash of "Sign In" before the session resolves.
  if (!ready) return <span className="text-sm text-stone/50">·</span>;

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => openSignIn("signin")}
        className="text-sm font-semibold text-stone transition-colors hover:text-ink"
      >
        Sign In
      </button>
    );
  }

  const name = (profile?.fullName || user.email || "Account").split(" ")[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 text-sm font-semibold text-stone transition-colors hover:text-ink"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-[11px] font-bold text-paper">
          {name.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline">{name}</span>
        <span aria-hidden className="text-[10px]">▾</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 min-w-48 border border-[#dddddd] bg-paper py-1 shadow-lg"
        >
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-stone transition-colors hover:bg-ink hover:text-paper"
            >
              {m.label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await signOut();
              router.push("/");
            }}
            className="block w-full border-t border-[#eee] px-4 py-2 text-left text-sm text-stone transition-colors hover:bg-ink hover:text-paper"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
