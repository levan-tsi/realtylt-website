"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { INTEREST_REASONS, SITE } from "@/lib/site";

type Status = "idle" | "submitting" | "success" | "error";

/** The one lead form — every conversion surface uses it (brief §5B, §7).
 * Variants: `dark` for ink sections/footer; `withAddress` + `defaultReason` for
 * home-value / cash-offer flows; `compact` hides the message box; `hideReason` drops the
 * interest dropdown entirely (its options are buy/sell/rent — meaningless on an AI
 * services page). With no `interestReason` in the body, parseLead files the lead under
 * "Other reason to contact an agent", which is exactly right. */
export function LeadForm({
  dark = false,
  withAddress = false,
  compact = false,
  hideReason = false,
  defaultReason,
  defaultAddress,
  submitLabel = "Send Message",
  successTitle = "Message sent.",
  successBody = "Thanks — we usually reply within the hour, seven days a week.",
  source,
}: {
  dark?: boolean;
  withAddress?: boolean;
  compact?: boolean;
  hideReason?: boolean;
  defaultReason?: (typeof INTEREST_REASONS)[number];
  /** Prefill for the address field (home-value two-step flow). */
  defaultAddress?: string;
  submitLabel?: string;
  successTitle?: string;
  successBody?: string;
  /** Override the source page path sent to the CRM (defaults to current pathname). */
  source?: string;
}) {
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: source ?? pathname }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? `Something went wrong on our end. Call or text ${SITE.phone} instead.`);
        setStatus("error");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setError(`We couldn't reach the server. Check your connection and try again, or call ${SITE.phone}.`);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className={`border p-6 text-center ${
          dark ? "border-paper/30 bg-white/5" : "border-[#cccccc] bg-mist"
        }`}
      >
        <p className={`text-2xl font-light ${dark ? "text-paper" : "text-ink"}`}>{successTitle}</p>
        <p className={`mt-2 text-sm ${dark ? "text-paper/70" : "text-stone"}`}>{successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate={false} className="grid gap-4">
      {/* Honeypot — hidden from humans, bots fill it and get dropped server-side.
          Non-semantic name on purpose: browser autofill recognizes "website" fields. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="lead-hp">Leave this field empty</label>
        <input id="lead-hp" type="text" name="rlt_hp" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Live-site look: placeholder-driven fields; labels stay for screen readers. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name" name="name" autoComplete="name" required dark={dark} hideLabel placeholder="Your Name" />
        <Input label="Email" name="email" type="email" autoComplete="email" required dark={dark} hideLabel placeholder="Email Address" />
      </div>
      <div className={`grid gap-4 ${withAddress ? "sm:grid-cols-2" : ""}`}>
        <Input label="Phone" name="phone" type="tel" autoComplete="tel" dark={dark} hideLabel placeholder="Phone Number" />
        {withAddress && (
          <Input
            label="Property address"
            name="address"
            autoComplete="street-address"
            required
            dark={dark}
            hideLabel
            placeholder="Property Address"
            defaultValue={defaultAddress}
          />
        )}
      </div>
      {!hideReason && (
        <Select label="How can we help?" name="interestReason" dark={dark} hideLabel defaultValue={defaultReason ?? INTEREST_REASONS[0]}>
          {INTEREST_REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      )}
      {!compact && (
        <Textarea label="Message" name="message" dark={dark} hideLabel placeholder="Your Message" />
      )}

      {status === "error" && (
        <p role="alert" className="rounded-[2px] border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      )}

      {/* On an ink section the default `primary` button is black on black — near-invisible,
          and well under the 3:1 non-text contrast floor. `light` inverts it. */}
      <Button
        type="submit"
        variant={dark ? "light" : "primary"}
        disabled={status === "submitting"}
        className="justify-self-start"
      >
        {status === "submitting" ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}
