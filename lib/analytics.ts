/** Thin wrapper over the site-wide gtag (configured in app/layout.tsx, AW-11479042629).
 * Mirrors the live BlueRoof custom code, which fires a gtag click event on the hero
 * phone/booking CTAs (event categories "Phone" / "Booking"). No-ops safely when gtag
 * hasn't loaded (ad-blockers, SSR) so a click is never swallowed. We do NOT fire fbq —
 * the site has no Facebook pixel. */
export function trackClick(category: string, label?: string): void {
  if (typeof window === "undefined") return;
  const g = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  try {
    g?.("event", "click", { event_category: category, ...(label ? { event_label: label } : {}) });
  } catch {
    /* analytics must never break a click */
  }
}
