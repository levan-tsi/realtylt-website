"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { LeadForm } from "./LeadForm";

/** Home-value hero form, matched to live realtylt.com: at rest a single horizontal bar
 * (address + unit + black FIND OUT) sitting on the photo. Submitting the bar reveals the
 * contact card (we have no instant AVM — a human prepares the numbers, so we need a way
 * to send them), which reuses the shared LeadForm with the address prefilled. */
export function HomeValueForm({ defaultAddress }: { defaultAddress?: string } = {}) {
  // A non-empty defaultAddress (e.g. handed over from the /selling wizard) jumps straight
  // to the contact card with the address already captured.
  const [address, setAddress] = useState<string | null>(defaultAddress?.trim() || null);

  if (address !== null) {
    return (
      <div className="mx-auto w-full max-w-lg rounded-2xl bg-white p-6 text-left shadow-float md:p-7">
        <p className="text-sm leading-relaxed text-stone">
          Almost there. Tell us where to send the numbers for{" "}
          <strong className="text-ink">{address}</strong>.
        </p>
        <div className="mt-4">
          <LeadForm
            compact
            withAddress
            defaultAddress={address}
            defaultReason="I'm interested in selling a home"
            submitLabel="Get My Home Value"
            successTitle="Request received."
            successBody="We're pulling your comps now. Expect to hear from us within the day."
          />
        </div>
      </div>
    );
  }

  function onFindOut(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const street = String(data.get("address") ?? "").trim();
    const unit = String(data.get("unit") ?? "").trim();
    if (street) setAddress(unit ? `${street}, ${unit}` : street);
  }

  return (
    /* THE SAME INSTRUMENT AS THE HOME HERO. This bar was the one control on the site still
       built the way the owner rejected in round 11 — input and button butted straight together,
       three pieces pretending to be one. Round 12 settled the right answer on the home page and
       left this as a named candidate: the fields and the action share ONE container, connected
       because they share a body and breathing because of the 4px inset, with the radii concentric
       on the site scale (container 12px = nested button 8px + 4px). The .search-instrument class
       is load-bearing, not cosmetic: the global unlayered :focus-visible ring would otherwise draw
       a hard rectangle inside the rounded shell, and that rule moves it onto the container. */
    <form
      onSubmit={onFindOut}
      className="search-instrument mx-auto flex w-full max-w-2xl items-center rounded-xl border border-white bg-white p-1"
    >
      <label htmlFor="hv-address" className="sr-only">
        Home address
      </label>
      <input
        id="hv-address"
        name="address"
        autoComplete="street-address"
        required
        placeholder="Enter Home Address"
        className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-ink placeholder:text-stone focus:outline-none"
      />
      <label htmlFor="hv-unit" className="sr-only">
        Unit number (optional)
      </label>
      <input
        id="hv-unit"
        name="unit"
        placeholder="Unit # (optional)"
        className="hidden w-36 border-l border-line bg-transparent px-4 py-2.5 text-sm text-ink placeholder:text-stone focus:outline-none sm:block"
      />
      {/* Not <Button>: its 12px radius and lifting hover are wrong for a control that lives
          inside another control — the nested action keeps still and lets the shell carry focus. */}
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft"
      >
        Find Out
      </button>
    </form>
  );
}
