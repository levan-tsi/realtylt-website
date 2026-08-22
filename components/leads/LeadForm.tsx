"use client";

import { ConsentChoice } from "./ConsentChoice";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { useQualifyingWizard } from "@/components/leads/QualifyingWizard";
import { INTEREST_REASONS, SITE } from "@/lib/site";
import type { SavedSearchRequest } from "@/lib/leads/types";

type Status = "idle" | "submitting" | "success" | "error";

/** The one lead form — every conversion surface uses it (brief §5B, §7).
 * Variants: `dark` for ink sections/footer; `withAddress` + `defaultReason` for
 * home-value / cash-offer flows; `compact` hides the message box; `hideReason` drops the
 * interest dropdown entirely (its options are buy/sell/rent — meaningless on an AI
 * services page). `stack` forces one field per row; `emailPhone2up` is the /selling hero
 * layout — a single "Full Name", then Email + Phone 2-up, then a full-width address (parsed
 * server-side into first/last + street/city/state/zip); `fullWidthSubmit` stretches the CTA;
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
  emailPhone2up = false,
  fullWidthSubmit = false,
  splitName = false,
  stackAddressRow = false,
  requirePhone = false,
  defaultReason,
  defaultAddress,
  footnote,
  submitLabel = "Send Message",
  successTitle = "Message sent.",
  successBody = "Thanks. We usually reply within the hour, seven days a week.",
  source,
  namePlaceholder = "Your Name",
  addressPlaceholder = "Property Address",
  qualifier,
  addressValue,
  savedSearches,
  redirectOnSuccess = false,
}: {
  dark?: boolean;
  withAddress?: boolean;
  compact?: boolean;
  hideReason?: boolean;
  stack?: boolean;
  /** /selling hero layout: single Full Name, Email + Phone 2-up, full-width address. */
  emailPhone2up?: boolean;
  /** Stretch the submit button to the form's full width (the /selling hero card). */
  fullWidthSubmit?: boolean;
  splitName?: boolean;
  /** Force the phone/address pair onto their own rows (single column) while leaving the
   * First/Last name pair 2-up — matches the live home-page form's stacking. */
  stackAddressRow?: boolean;
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
  namePlaceholder?: string;
  addressPlaceholder?: string;
  /** Land on /thank-you instead of answering in place.
   *
   * OFF by default, and that default is the decision. Every form on this site used to answer
   * inline, which is better for a visitor but leaves nothing to measure: the URL never changed,
   * so Google Ads and GA4 had no page view to count as a conversion. A destination fixes the
   * measurement, so the primary funnels opt in.
   *
   * It must stay opt-in, because for three kinds of form a redirect is actively wrong:
   *  · the LISTING modals — navigating away from the home someone is looking at to say "thanks"
   *    loses their place for our convenience;
   *  · the FOOTER form, which people use mid-browse and expect to stay put;
   *  · /selling, whose success handler opens the qualifying wizard — a redirect unmounts it and
   *    throws away the qualifying answers, which are worth more than the page view. */
  redirectOnSuccess?: boolean;
  /** Structured intent to attach to this submission — the same `qualifier` field the listing
   * tour/offer sheets send. parseLead normalizes it (flat, short strings) and folds it into the
   * message so it is readable even in a plain CRM view. */
  qualifier?: Record<string, string>;
  /** Prefill/carry a property address on the payload's top-level `address` field. */
  addressValue?: string;
  /** Saved searches to attach to this submission (the /saved listing-alert opt-in). A visitor
   * without an account keeps their searches in localStorage, so the only way the CRM ever sees
   * what to watch is if they travel with the lead. */
  savedSearches?: SavedSearchRequest[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { openWizard } = useQualifyingWizard();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  // Submitting destroys the button that had focus, which drops focus to <body> — a keyboard
  // visitor's next Tab restarts at the top of the document and they never hear the outcome.
  // The success panel is already tabIndex={-1} for exactly this; put focus on it.
  // On /selling, /financing and /home-value the qualifying wizard mounts in the same commit
  // and its own effect runs later (it is rendered after {children} in the provider), so the
  // dialog still wins the focus, which is what should happen.
  //
  // THE ERROR PATH HAD THE SAME HOLE and only the success path was plugged. Driven in round 29
  // with a real Tab and a real Enter on /who-we-are against a 500: focus ended on <body> and the
  // next Tab landed on the phone number in the HEADER — the visitor is thrown from the bottom of
  // a form they just filled in back to the top of the page. The alert announces itself either
  // way (role="alert" is an assertive live region), but announcing is not the same as being
  // somewhere. The button survives an error, so it would be a legitimate landing spot too; the
  // alert is better, because it puts the reason and the phone number to call next in the tab
  // order rather than behind it.
  useEffect(() => {
    if (status === "success") successRef.current?.focus();
    else if (status === "error") errorRef.current?.focus();
  }, [status]);

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
        body: JSON.stringify({
          ...data,
          source: source ?? pathname,
          ...(addressValue && !data.address ? { address: addressValue } : {}),
          ...(qualifier ? { qualifier } : {}),
          ...(savedSearches?.length ? { savedSearches } : {}),
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        // A 4xx is about what the visitor typed ("A valid email is required.") — show it.
        // A 5xx is about us, so say it in our own words WITH the number to call, whatever
        // came back. Nobody should read "CRM webhook responded 500" on this page.
        const ours = `Something went wrong on our end. Call or text ${SITE.phone} instead.`;
        const theirs = res.status >= 400 && res.status < 500 ? json.error : undefined;
        setError(theirs ?? ours);
        setStatus("error");
        return;
      }
      setStatus("success");
      if (redirectOnSuccess) {
        // The lead is already saved, so the visitor can leave safely. `from` carries which form
        // it was, so one conversion page can still be attributed per funnel.
        form.reset();
        // `c` carries the consent ANSWER, not the phone number, so the thank-you page can tell a
        // visitor the truth about what happens next: someone who agreed to a call is going to be
        // called, and someone who declined must not be told they will be. It is a single
        // character and it is not evidence of anything — the record that matters was stamped
        // server-side at submission (lib/leads/consent.ts). This only decides which sentence a
        // person reads on the next screen.
        const consented = data.consentToContact === "true";
        router.push(
          `/thank-you?from=${encodeURIComponent(source ?? pathname)}&c=${consented ? "1" : "0"}`,
        );
        return;
      }
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
        ref={successRef}
        role="status"
        tabIndex={-1}
        /* THE ONE MOMENT ON THIS PAGE WORTH A BEAT. The visitor has just handed over a phone
           number and the form vanished and a panel appeared, as a jump cut — the interface
           answering the most committed thing anyone does on this site with nothing at all.
           This is the rare/first-time tier, which is where a delight budget legitimately
           lives, and it reuses `.rlt-pop-in` (0.3s, 14px, scale 0.98) — the panel entrance
           the qualifying wizard already uses — rather than adding a curve or a duration.
           The global reduced-motion block collapses it to an instant appearance. */
        className={`rlt-pop-in rounded-2xl border p-6 text-center outline-none ${
          dark ? "border-paper/30 bg-white/5" : "border-line-strong bg-mist"
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
      {emailPhone2up ? (
        // /selling hero: single Full Name, then Email + Phone 2-up, then a full-width
        // address. Name is parsed into first/last and the address into parts server-side.
        <>
          <Input label="Name" name="name" autoComplete="name" required dark={dark} hideLabel placeholder={namePlaceholder} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Email" name="email" type="email" autoComplete="email" required dark={dark} hideLabel placeholder="Email Address" />
            <Input label="Phone" name="phone" type="tel" autoComplete="tel" required={requirePhone} dark={dark} hideLabel placeholder="Phone Number" />
          </div>
          {withAddress && (
            <Input label="Property address" name="address" autoComplete="street-address" required dark={dark} hideLabel placeholder={addressPlaceholder} defaultValue={defaultAddress} />
          )}
        </>
      ) : (
        <>
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
              <Input label="Name" name="name" autoComplete="name" required dark={dark} hideLabel placeholder={namePlaceholder} />
              <Input label="Email" name="email" type="email" autoComplete="email" required dark={dark} hideLabel placeholder="Email Address" />
            </div>
          )}
          <div className={`grid gap-4 ${withAddress && !stack && !stackAddressRow ? "sm:grid-cols-2" : ""}`}>
            <Input label="Phone" name="phone" type="tel" autoComplete="tel" required={requirePhone} dark={dark} hideLabel placeholder="Phone Number" />
            {withAddress && (
              <Input
                label="Property address"
                name="address"
                autoComplete="street-address"
                required
                dark={dark}
                hideLabel
                placeholder={addressPlaceholder}
                defaultValue={defaultAddress}
              />
            )}
          </div>
        </>
      )}
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

      {/* Permission to call or text. Sits directly under the fields and above the submit, so
          it is read as part of agreeing rather than as small print after the fact. */}
      <ConsentChoice dark={dark} />

      {status === "error" && (
        <p
          ref={errorRef}
          role="alert"
          tabIndex={-1}
          className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-500 outline-none"
        >
          {error}
        </p>
      )}

      {/* On an ink section the default `primary` button is black on black — near-invisible,
          and well under the 3:1 non-text contrast floor. `light` inverts it. */}
      <Button
        type="submit"
        variant={dark ? "light" : "primary"}
        disabled={status === "submitting"}
        className={fullWidthSubmit ? "w-full justify-center" : "justify-self-start"}
      >
        {status === "submitting" ? "Sending…" : submitLabel}
      </Button>

      {footnote && (
        <p className={`text-xs tracking-wide ${dark ? "text-paper/60" : "text-stone"}`}>{footnote}</p>
      )}
    </form>
  );
}
