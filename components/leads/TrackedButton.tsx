"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Button, type Variant } from "@/components/ui/Button";
import { trackClick } from "@/lib/analytics";

/** A styled CTA link (Button) that fires a gtag click event before navigating — the live
 * hero phone/booking buttons do this (categories "Phone" / "Booking"). Navigation is never
 * blocked: gtag('event') is fire-and-forget, so tel:/href follow through normally. Typed as
 * the anchor variant (always has href) to avoid Button's button|anchor prop union. */
type TrackedButtonProps = Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "onClick"> & {
  href: string;
  variant?: Variant;
  gaCategory: string;
  gaLabel?: string;
  children: ReactNode;
};

export function TrackedButton({ gaCategory, gaLabel, ...props }: TrackedButtonProps) {
  return <Button {...props} onClick={() => trackClick(gaCategory, gaLabel)} />;
}
