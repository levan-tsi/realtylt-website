import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/PortalShell";

// Portal pages hold private client data — never indexable, even after the site goes public.
export const metadata: Metadata = {
  title: "My Portal",
  // Noindex, so this description never reaches a search result. It is here so the five
  // portal routes stop inheriting the home page description as their own.
  description:
    "Your RealtyLT portal: the homes you saved, the searches you follow, the market reports you asked for, and your contact details.",
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
