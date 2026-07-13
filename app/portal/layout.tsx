import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/PortalShell";

// Portal pages hold private client data — never indexable, even after the site goes public.
export const metadata: Metadata = {
  title: "My Portal",
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
