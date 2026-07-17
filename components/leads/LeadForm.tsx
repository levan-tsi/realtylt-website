"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { useQualifyingWizard } from "@/components/leads/QualifyingWizard";
import { INTEREST_REASONS, SITE } from "@/lib/site";

type Status = "idle" | "submitting" | "success" | "error";

/** The one lead form — every conversion surface uses it (brief §5B, §7).
 * Variants: `dark` for ink sections/footer; `withAddress` + `defaultReason` for
 * home-value / cash-offer flows; `compact` hides the message box; `hideReason` drops the
 * interest dropdown entirely (its options are buy/sell/rent — meaningless on an AI
 * services page). `stack` forces one field per row (the /selling hero's 4 stacked fields);
 * `splitName` swaps the single name field for First/Last (the footer/contact form);
 * `requirePhone` makes phone mandatory; `footnote` prints small print under the button.
 * With no `interestReason` in the body, parseLead files the lead under "Other reason to
 * contact an agent"; `hideReason` + `defaultReason` sends the reason via a hidden input so
 * intent still reaches the CRM without showing the dropdown. */
export function LeadForm({
  dark = false,
  withAddress = false,
  compact = false,
  hideReason = false,
  stack = false,
  splitName = false,
  requirePhone = false,
  defaultReason,
  defaultAddress,
  footnote,
  submitLabel = "Send Message",
  successTitle = "Message sent.",
  successBody = "Thanks. We usually reply within the hour, seven days a week.",
  source,
}: {
  dark?: boolean;
  withAddress?: boolean;
  compact?: boolean;
  hideReason?: boolean;
  stack?: boolean;
  splitName?: boolean;
  requirePhone?: boolean;
  defaultReason?: (typeof INTEREST_REASONS)[number];
  /** Prefill for the address field (home-value two-step flow). */
  defaultAddress?: string;
  /** Small print under the submit button (e.g. "Takes less than 60 seconds"). */
  footnote?: string;
  submitLabel?: string;
  successTitle?: string;
  successBody?: string;
  /** Override the source page path sent to the CRM (defaults to current pathname). */
  source?: string;
}) {
  const pathname = usePathname();
  const { openWizard } = useQualifyingWizard();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
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
      // On /selling this opens the qualifying wizard; everywhere else it is a no-op.
      const name =
        (data.name ?? "").trim() ||
        [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
      openWizard({
        name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        source: source ?? pathname,
      });
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

  const nameCols = stack ? "" : "sm:grid-cols-2";

  return (
    <form onSubmit={onSubmit} noValidate={false} className="grid gap-4">
      {/* Honeypot — hidden from humans, bots fill it and get dropped server-side.
          Non-semantic name on purpose: browser autofill recognizes "website" fields. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="lead-hp">Leave this field empty</label>
        <input id="lead-hp" type="text" name="rlt_hp" tabIndex={-1} autoComplete="off" />
      </div>

      {hideReason && defaultReason && (
        <input type="hidden" name="interestReason" value={defaultReason} />
      )}

      {/* Live-site look: placeholder-driven fields; labels stay for screen readers. */}
      {splitName ? (
        <>
          <div className={`grid gap-4 ${nameCols}`}>
            <Input label="First name" name="firstName" autoComplete="given-name" required dark={dark} hideLabel placeholder="First Name" />
            <Input label="Last name" name="lastName" autoComplete="family-name" required dark={dark} hideLabel placeholder="Last Name" />
          </div>
          <Input label="Email" name="email" type="email" autoComplete="email" required dark={dark} hideLabel placeholder="Email Address" />
        </>
      ) : (
        <div className={`grid gap-4 ${nameCols}`}>
          <Input label="Name" name="name" autoComplete="name" required dark={dark} hideLabel placeholder="Your Name" />
          <Input label="Email" name="email" type="email" autoComplete="email" required dark={dark} hideLabel placeholder="Email Address" />
        </div>
      )}
      <div className={`grid gap-4 ${withAddress && !stack ? "sm:grid-cols-2" : ""}`}>
        <Input label="Phone" name="phone" type="tel" autoComplete="tel" required={requirePhone} dark={dark} hideLabel placeholder="Phone Number" />
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

      {footnote && (
        <p className={`text-xs tracking-wide ${dark ? "text-paper/60" : "text-stone"}`}>{footnote}</p>
      )}
    </form>
  );
}
