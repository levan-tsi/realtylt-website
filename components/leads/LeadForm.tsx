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
 * home-value / cash-offer flows; `compact` hides the message box. */
export function LeadForm({
  dark = false,
  withAddress = false,
  compact = false,
  defaultReason,
  submitLabel = "Send Message",
  successTitle = "Message sent.",
  successBody = "Thanks — we usually reply within the hour, seven days a week.",
  source,
}: {
  dark?: boolean;
  withAddress?: boolean;
  compact?: boolean;
  defaultReason?: (typeof INTEREST_REASONS)[number];
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
        className={`rounded-[2px] border p-6 text-center ${
          dark ? "border-porchlight/40 bg-ink-soft" : "border-porchlight bg-porchlight/10"
        }`}
      >
        <p className={`font-display text-2xl ${dark ? "text-paper" : "text-ink"}`}>{successTitle}</p>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name" name="name" autoComplete="name" required dark={dark} placeholder="Your name" />
        <Input label="Email" name="email" type="email" autoComplete="email" required dark={dark} placeholder="you@email.com" />
      </div>
      <div className={`grid gap-4 ${withAddress ? "sm:grid-cols-2" : ""}`}>
        <Input label="Phone" name="phone" type="tel" autoComplete="tel" dark={dark} placeholder="(914) 555-0100" />
        {withAddress && (
          <Input
            label="Property address"
            name="address"
            autoComplete="street-address"
            required
            dark={dark}
            placeholder="Street, town, NY"
          />
        )}
      </div>
      <Select label="How can we help?" name="interestReason" dark={dark} defaultValue={defaultReason ?? INTEREST_REASONS[0]}>
        {INTEREST_REASONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </Select>
      {!compact && (
        <Textarea label="Message" name="message" dark={dark} placeholder="Tell us a little about what you're looking for…" />
      )}

      {status === "error" && (
        <p role="alert" className="rounded-[2px] border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={status === "submitting"} className="justify-self-start">
        {status === "submitting" ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}
