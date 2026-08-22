"use client";

import { useSyncExternalStore } from "react";
import type { ConsentCopySet } from "@/lib/thank-you-copy";

/** Renders the sentence that matches the consent answer LeadForm carried here on the URL.
 *
 * `?c=1` means they ticked "Yes, you can call or text me about my request."; `?c=0` means they
 * chose "No thanks. Email me instead." A person who declined calls must never read that their
 * phone is about to ring, and a person who agreed should hear exactly what they said yes to —
 * that one honest sentence is this component's whole job.
 *
 * WHY NOT `useSearchParams`, which is the obvious way to read a query param: it suspends. A
 * suspending client component puts a Suspense boundary over the route, Next then streams the
 * page into `<div hidden id="S:0">` and reveals it with an inline `$RC(...)` call that never
 * runs without JavaScript — the bug that blanked /search for no-JS visitors (see
 * ThankYouConversion's comment, which read `?from=` the same way for the same reason).
 *
 * WHY `useSyncExternalStore` and not an effect: the common arrival here is LeadForm's client
 * `router.push`, where this component mounts fresh in the browser and the store read gives it
 * the right sentence on its FIRST paint — an effect would flash `unknown` for a frame on
 * exactly the visit this page exists for. On a hard load the server snapshot (`unknown`, the
 * copy that is true on every branch) renders and hydrates without mismatch, then the one
 * post-hydration re-render swaps the sentence in place. With JavaScript off, `unknown` is
 * simply the page.
 *
 * The snapshot returns a primitive ("1" | "0" | null), so React's Object.is check sees a
 * stable value and never loops; the URL cannot change under this page without a navigation
 * that remounts it, so `subscribe` has nothing to listen to.
 */
const subscribe = () => () => {};
const getServerSnapshot = () => null;
function getConsentSnapshot(): "1" | "0" | null {
  const c = new URLSearchParams(window.location.search).get("c");
  return c === "1" || c === "0" ? c : null;
}

export function ConsentCopy({ copy }: { copy: ConsentCopySet }) {
  const c = useSyncExternalStore(subscribe, getConsentSnapshot, getServerSnapshot);
  return <>{c === "1" ? copy.agreed : c === "0" ? copy.declined : copy.unknown}</>;
}
