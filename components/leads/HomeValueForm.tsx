"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
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
      <div className="mx-auto w-full max-w-lg bg-white p-6 text-left shadow-2xl md:p-7">
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
            submitLabel="Find Out"
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
    <form onSubmit={onFindOut} className="mx-auto flex w-full max-w-2xl">
      <label htmlFor="hv-address" className="sr-only">
        Home address
      </label>
      <input
        id="hv-address"
        name="address"
        autoComplete="street-address"
        required
        placeholder="Enter Home Address"
        className="min-w-0 flex-1 border border-white bg-white px-4 py-3.5 text-sm text-ink placeholder:text-stone focus:outline-none"
      />
      <label htmlFor="hv-unit" className="sr-only">
        Unit number (optional)
      </label>
      <input
        id="hv-unit"
        name="unit"
        placeholder="Unit # (optional)"
        className="hidden w-36 border-y border-r-0 border-l border-white border-l-[#dddddd] bg-white px-4 py-3.5 text-sm text-ink placeholder:text-stone focus:outline-none sm:block"
      />
      <Button type="submit" className="shrink-0">
        Find Out
      </Button>
    </form>
  );
}
