"use client";

import { PRESS } from "@/components/ui/Button";
import { ConsentCheckbox } from "./ConsentCheckbox";
import { LeadSheet } from "./LeadSheet";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CONSENT_UNANSWERED_ERROR, consentAnswered } from "@/lib/leads/consent";
import { SITE } from "@/lib/site";
import {
  formatOffer,
  fullAddress,
  offerQualifier,
  PRE_APPROVED_ANSWERS,
  SEEN_HOME_ANSWERS,
  tourQualifier,
  type ListingIntent,
} from "@/lib/leads/listing-intents";

/** The listing-detail conversion CTAs: "Schedule a tour" and "Make an offer" (live-site
 * parity). Each opens a 390-friendly bottom sheet (centered on desktop) that POSTs to
 * /api/lead with a structured `qualifier` intent (tour / offer) plus the address + MLS id,
 * so the CRM sees exactly what the visitor wants. No API change — parseLead already accepts
 * `qualifier` (and folds it into the message for plain CRM views). */

const REASON_BUYING = "I'm interested in buying a home";

type LeadState = "idle" | "submitting" | "success" | "error";

async function postLead(body: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { ok?: boolean };
    return res.ok && !!json.ok;
  } catch {
    return false;
  }
}

/** Next seven calendar days as selectable chips (computed client-side on open — no SSR). */
function nextSevenDays() {
  const out: { key: string; weekday: string; day: string; month: string }[] = [];
  const fmtW = new Intl.DateTimeFormat("en-US", { weekday: "short" });
  const fmtM = new Intl.DateTimeFormat("en-US", { month: "short" });
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    out.push({
      key: d.toISOString().slice(0, 10),
      weekday: i === 0 ? "Today" : fmtW.format(d),
      day: String(d.getDate()),
      month: fmtM.format(d),
    });
  }
  return out;
}

export function ListingLeadCTAs(props: { listing: ListingIntent; infoTargetId?: string }) {
  const [modal, setModal] = useState<null | "tour" | "offer">(null);
  const [seedDate, setSeedDate] = useState<string | undefined>(undefined);
  // Client-only ("today" is the visitor's clock, not the server's) — first five days for the
  // on-page mobile strip; the sheet itself still offers all seven.
  const [mobileDays, setMobileDays] = useState<ReturnType<typeof nextSevenDays>>([]);
  useEffect(() => setMobileDays(nextSevenDays().slice(0, 5)), []);

  // The sticky sub-nav's "Make an Offer" button and the photo lightbox's "In Person Tour" /
  // "Make an Offer" CTAs open these same sheets (no duplicate lead path) via window events.
  useEffect(() => {
    const openOffer = () => setModal("offer");
    const openTourEv = () => setModal("tour");
    window.addEventListener("listing:make-offer", openOffer);
    window.addEventListener("listing:request-tour", openTourEv);
    return () => {
      window.removeEventListener("listing:make-offer", openOffer);
      window.removeEventListener("listing:request-tour", openTourEv);
    };
  }, []);

  const openTour = (dateKey?: string) => {
    setSeedDate(dateKey);
    setModal("tour");
  };
  // "Request Info" reuses the rail's existing message form (no new lead path) — jump to it.
  const requestInfo = () => {
    if (!props.infoTargetId) return;
    const el = document.getElementById(props.infoTargetId);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.querySelector<HTMLElement>("input,select,textarea")?.focus({ preventScroll: true });
  };

  return (
    <>
      {/* Mobile / small: live's tap-to-open bottom sheets, with the tour DATES surfaced right
          on the page (owner: "mobile does not have dates when you ask to schedule a tour") —
          tapping a day opens the sheet seeded with it, same as desktop's inline card. Mounted
          after hydration because "today" is a client fact (the modal already works this way). */}
      {mobileDays.length > 0 && (
        <div className="mb-2.5 lg:hidden">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Tour this home</p>
          <div role="group" aria-label="Pick a tour day" className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {mobileDays.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => openTour(d.key)}
                className="flex min-w-[3.5rem] shrink-0 flex-col items-center rounded-xl border border-line px-2 py-2 text-ink transition-colors hover:border-ink"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.1em]">{d.weekday}</span>
                <span className="text-lg font-semibold leading-tight">{d.day}</span>
                <span className="text-[10px] uppercase tracking-[0.1em] opacity-80">{d.month}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2.5 lg:hidden">
        <button
          type="button"
          onClick={() => openTour()}
          className="rounded-xl bg-ink px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
        >
          Schedule a Tour
        </button>
        <button
          type="button"
          onClick={() => setModal("offer")}
          className="rounded-xl border border-ink px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
        >
          Make an Offer
        </button>
      </div>

      {/* Desktop: live's inline Request-a-Tour card (tabs + date strip + In Person Tour). */}
      <div className="hidden lg:block">
        <InlineTourCard onOpenTour={openTour} onRequestInfo={requestInfo} />
        <button
          type="button"
          onClick={() => setModal("offer")}
          className="mt-3 w-full rounded-xl border border-ink px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
        >
          Make an Offer
        </button>
      </div>

      {modal === "tour" && (
        <TourModal listing={props.listing} initialDate={seedDate} onClose={() => setModal(null)} />
      )}
      {modal === "offer" && <OfferModal listing={props.listing} onClose={() => setModal(null)} />}
    </>
  );
}

/** Live's inline right-rail card: [Request a Tour | Request Info] with a 3-day strip and an
 * IN PERSON TOUR button. The button opens the same TourModal flow seeded with the chosen day;
 * Request Info jumps to the rail's existing message form. Desktop-only (mobile keeps sheets). */
function InlineTourCard({
  onOpenTour,
  onRequestInfo,
}: {
  onOpenTour: (dateKey: string) => void;
  onRequestInfo: () => void;
}) {
  const days = useRef(nextSevenDays()).current;
  const [tab, setTab] = useState<"tour" | "info">("tour");
  const [offset, setOffset] = useState(0);
  const [date, setDate] = useState(days[0].key);
  const WINDOW = 3;
  const maxOffset = Math.max(0, days.length - WINDOW);
  const visible = days.slice(offset, offset + WINDOW);

  // PRESS on the tour strip. The SELECTED day chip is the case that gave this away: it paints
  // `border-ink bg-ink text-paper` and has no hover variant, so a probe found it answering a
  // pointer with 0% of its pixels — the one control in the conversion card a visitor has already
  // chosen, and touching it did nothing. Hover is the wrong repair (a selected chip has nowhere
  // to go on hover, and half of these visitors are on a phone with no hover at all); a press is
  // the right one, and it is the site's own.
  const tabCls = (active: boolean) =>
    `min-h-11 flex-1 px-3 py-2.5 text-sm font-medium ${PRESS} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river ${
      active ? "border-b-2 border-ink text-ink" : "border-b-2 border-transparent text-stone hover:text-ink"
    }`;
  const arrowCls = `grid h-11 w-8 shrink-0 place-items-center rounded-xl text-ink ${PRESS} hover:bg-mist disabled:cursor-not-allowed disabled:text-stone/40 disabled:hover:bg-transparent disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river`;

  return (
    <div>
      <div className="flex" aria-label="Contact options">
        <button type="button" aria-pressed={tab === "tour"} onClick={() => setTab("tour")} className={tabCls(tab === "tour")}>
          Request a Tour
        </button>
        <button type="button" aria-pressed={tab === "info"} onClick={() => setTab("info")} className={tabCls(tab === "info")}>
          Request Info
        </button>
      </div>

      {tab === "tour" ? (
        <div className="pt-4">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Show earlier days"
              disabled={offset === 0}
              onClick={() => setOffset((o) => Math.max(0, o - WINDOW))}
              className={arrowCls}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div role="group" aria-label="Choose a day" className="grid flex-1 grid-cols-3 gap-2">
              {visible.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  aria-pressed={date === d.key}
                  onClick={() => setDate(d.key)}
                  className={`flex min-h-11 flex-col items-center rounded-xl border px-1 py-2 ${PRESS} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river ${
                    date === d.key ? "border-ink bg-ink text-paper" : "border-line text-ink hover:border-ink"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em]">{d.weekday}</span>
                  <span className="text-lg font-semibold leading-tight">{d.day}</span>
                  <span className="text-[10px] uppercase tracking-[0.1em] opacity-80">{d.month}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="Show later days"
              disabled={offset >= maxOffset}
              onClick={() => setOffset((o) => Math.min(maxOffset, o + WINDOW))}
              className={arrowCls}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            onClick={() => onOpenTour(date)}
            className="mt-4 w-full rounded-xl bg-ink px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
          >
            In Person Tour
          </button>
        </div>
      ) : (
        <div className="pt-4">
          <p className="t-small leading-relaxed text-stone">
            Have a question about this home? Send a note and we&rsquo;ll get back to you shortly.
          </p>
          <button
            type="button"
            onClick={onRequestInfo}
            className="mt-3 w-full rounded-xl border border-ink px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
          >
            Request Info
          </button>
        </div>
      )}
    </div>
  );
}

/* The bottom-sheet shell that used to live here moved to ./LeadSheet in round 38, unchanged, so
 * that /connect could open the same modal instead of growing a second one. See that file for the
 * focus-trap / Escape / scroll-lock contract these two sheets rely on. */

const fieldCls =
  "w-full rounded-xl border border-line-strong bg-white px-3.5 py-3 text-base text-ink-soft transition-colors placeholder:text-stone focus:border-ink/50 focus:outline-none focus:ring-1 focus:ring-ink/40";

function SuccessBody({ title, body, onClose }: { title: string; body: string; onClose: () => void }) {
  return (
    <div role="status" tabIndex={-1} className="px-6 pb-7 pt-9 text-center outline-none sm:px-8">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-porchlight/10 text-porchlight-deep">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m5 12.5 4.5 4.5L19 7" />
        </svg>
      </span>
      <h2 className="t-h3 mt-4 text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-xs t-small leading-relaxed text-stone">{body}</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft"
        >
          Done
        </button>
        <a href={SITE.phoneHref} className="text-sm font-bold text-porchlight-deep underline-offset-4 hover:underline">
          Or call {SITE.phone}
        </a>
      </div>
    </div>
  );
}

function ErrorNote({
  show,
  message,
  innerRef,
}: {
  show: boolean;
  message?: string;
  innerRef?: React.Ref<HTMLParagraphElement>;
}) {
  if (!show) return null;
  return (
    <p
      ref={innerRef}
      role="alert"
      tabIndex={-1}
      className="t-small mt-3 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-red-500 outline-none"
    >
      {message ?? `We couldn’t send that. Try again, or call ${SITE.phone}.`}
    </p>
  );
}

/** CONSENT IS REQUIRED AND ITS REFUSAL IS LOUD — on these two sheets as well, from round 38.
 *
 * THE BUG THIS CLOSES. Both sheets read `consentToContact` straight out of the FormData and handed
 * it to postLead(). An unticked box therefore posted a real lead to the live CRM and showed "Tour
 * requested." — the visitor is told they will be called, having explicitly not agreed to be. It is
 * the same silent refusal the owner reported on the footer form ("when I filled it up nothing
 * happened"), still live on the listing page, which is the flagship conversion path.
 *
 * WHY A HOOK AND NOT A `required` ATTRIBUTE. The native attribute is exactly what failed silently
 * before, and the tests assert its absence on this input. So the check lives in JavaScript and
 * produces the same three things LeadForm.tsx has produced since round 29: the box marked invalid,
 * a visible role="alert" in the place the form already shows errors, and the box scrolled into
 * view. Focus lands on the alert rather than the box, because the alert carries the reason.
 *
 * One hook, two callers, so the tour and offer sheets cannot drift from each other — and the
 * wording is LeadForm's wording, so none of the three drift from the footer either. */
const CONSENT_ERROR = CONSENT_UNANSWERED_ERROR;

function useConsentGuard() {
  const [invalid, setInvalid] = useState(false);
  const alertRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (invalid) alertRef.current?.focus();
  }, [invalid]);
  /** True when the question is unanswered (2026-08-28: either answer submits, no answer does
   * not): the caller must return without posting anything. */
  function refused(form: HTMLFormElement, data: Record<string, string>) {
    if (consentAnswered(data.consentToContact)) {
      setInvalid(false);
      return false;
    }
    setInvalid(true);
    form.querySelector<HTMLInputElement>("[data-consent-input]")?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
    return true;
  }
  return { invalid, alertRef, refused };
}

// Hidden honeypot — bots fill it, humans never see it (matches the site-wide LeadForm).
function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="rlt-listing-hp">Leave this field empty</label>
      <input id="rlt-listing-hp" type="text" name="rlt_hp" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function TourModal({
  listing,
  onClose,
  initialDate,
}: {
  listing: ListingIntent;
  onClose: () => void;
  initialDate?: string;
}) {
  const titleId = useId();
  const days = useRef(nextSevenDays()).current;
  const [date, setDate] = useState(() =>
    initialDate && days.some((d) => d.key === initialDate) ? initialDate : days[0].key,
  );
  const [tourType, setTourType] = useState<"In person" | "Video chat">("In person");
  const [time, setTime] = useState("Morning");
  const [hp, setHp] = useState("");
  const [state, setState] = useState<LeadState>("idle");
  const consent = useConsentGuard();
  const router = useRouter();
  const submitted = useRef(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitted.current) return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    // Before anything is marked submitted or sent: no tick, no lead.
    if (consent.refused(form, data)) return;
    submitted.current = true;
    setState("submitting");
    const day = days.find((d) => d.key === date);
    const ok = await postLead({
      name: data.name,
      email: data.email,
      phone: data.phone,
      consentToContact: data.consentToContact,
      address: fullAddress(listing),
      source: `/listing/${listing.id}`,
      interestReason: REASON_BUYING,
      rlt_hp: hp,
      qualifier: tourQualifier({
        mlsNumber: listing.mlsNumber,
        tourType,
        date: day ? `${day.weekday} ${day.month} ${day.day}` : date,
        time,
      }),
    });
    if (ok) {
      // The panel shows for the beat the navigation takes; then /thank-you, like every
      // form on the site (owner's rule, 2026-08-25: ONE conversion URL to measure).
      setState("success");
      router.push(
        `/thank-you?from=${encodeURIComponent(`/listing/${listing.id}`)}&c=${
          data.consentToContact === "true" ? "1" : "0"
        }`,
      );
    } else {
      submitted.current = false;
      setState("error");
    }
  }

  return (
    <LeadSheet titleId={titleId} onClose={onClose}>
      {state === "success" ? (
        <SuccessBody
          title="Tour requested."
          body={`We'll confirm a time for ${listing.address} shortly. Expect a call or text soon.`}
          onClose={onClose}
        />
      ) : (
        <form onSubmit={onSubmit} className="px-6 pb-7 pt-7 sm:px-8">
          <Honeypot value={hp} onChange={setHp} />
          <h2 id={titleId} className="t-h3 text-ink">
            Schedule a tour
          </h2>
          <p className="mt-1 text-sm text-stone">{listing.address}</p>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-stone">Tour type</p>
          <div role="group" aria-label="Tour type" className="mt-2 grid grid-cols-2 gap-2">
            {(["In person", "Video chat"] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tourType === t}
                onClick={() => setTourType(t)}
                className={`min-h-11 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                  tourType === t ? "border-ink bg-ink text-paper" : "border-line text-ink hover:border-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-stone">Preferred day</p>
          <div role="group" aria-label="Preferred day" className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {days.map((d) => (
              <button
                key={d.key}
                type="button"
                aria-pressed={date === d.key}
                onClick={() => setDate(d.key)}
                className={`flex min-w-[3.5rem] shrink-0 flex-col items-center rounded-xl border px-2 py-2 transition-colors ${
                  date === d.key ? "border-ink bg-ink text-paper" : "border-line text-ink hover:border-ink"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.1em]">{d.weekday}</span>
                <span className="text-lg font-semibold leading-tight">{d.day}</span>
                <span className="text-[10px] uppercase tracking-[0.1em] opacity-80">{d.month}</span>
              </button>
            ))}
          </div>

          <label htmlFor="tour-time" className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-stone">
            Time of day
          </label>
          <select id="tour-time" value={time} onChange={(e) => setTime(e.target.value)} className={`mt-2 ${fieldCls} cursor-pointer`}>
            {["Morning", "Afternoon", "Evening"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <div className="mt-4 grid gap-3">
            <input className={fieldCls} name="name" required autoComplete="name" placeholder="Your name" aria-label="Your name" />
            <input className={fieldCls} name="email" type="email" required autoComplete="email" placeholder="Email address" aria-label="Email address" />
            <input className={fieldCls} name="phone" type="tel" required autoComplete="tel" placeholder="Phone number" aria-label="Phone number" />
          </div>

            <div className="mt-4">
              <ConsentCheckbox invalid={consent.invalid} />
            </div>

          <ErrorNote
            show={consent.invalid || state === "error"}
            message={consent.invalid ? CONSENT_ERROR : undefined}
            innerRef={consent.alertRef}
          />
          <button
            type="submit"
            disabled={state === "submitting"}
            className="mt-5 w-full rounded-xl bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
          >
            {state === "submitting" ? "Sending…" : "Request Tour"}
          </button>
        </form>
      )}
    </LeadSheet>
  );
}

/** One of live's two qualifying questions. Real radios (not styled buttons) so arrow keys move
 * within the group, Tab skips past it, and a screen reader announces "1 of 3" — the behaviour a
 * visitor already expects from this control. */
function QualifyingRadios({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-medium text-ink">{legend}</legend>
      <div className="mt-2 space-y-1.5">
        {options.map((o) => (
          <label key={o} className="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
            <input
              type="radio"
              name={name}
              value={o}
              checked={value === o}
              onChange={() => onChange(o)}
              className="h-4 w-4 shrink-0 accent-porchlight-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
            />
            {o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function OfferModal({ listing, onClose }: { listing: ListingIntent; onClose: () => void }) {
  const titleId = useId();
  const groupId = useId();
  const [offer, setOffer] = useState(String(listing.price));
  const [preApproved, setPreApproved] = useState<string>(PRE_APPROVED_ANSWERS[0]);
  const [seenInPerson, setSeenInPerson] = useState<string>(SEEN_HOME_ANSWERS[0]);
  const [hp, setHp] = useState("");
  const [state, setState] = useState<LeadState>("idle");
  const consent = useConsentGuard();
  const router = useRouter();
  const submitted = useRef(false);

  const offerNum = Number(offer) || 0;
  const offerDisplay = formatOffer(offer);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitted.current) return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    // Before anything is marked submitted or sent: no tick, no lead.
    if (consent.refused(form, data)) return;
    submitted.current = true;
    setState("submitting");
    const ok = await postLead({
      name: data.name,
      email: data.email,
      phone: data.phone,
      consentToContact: data.consentToContact,
      message: data.message,
      address: fullAddress(listing),
      source: `/listing/${listing.id}`,
      interestReason: REASON_BUYING,
      rlt_hp: hp,
      qualifier: offerQualifier({
        mlsNumber: listing.mlsNumber,
        offerDisplay,
        listPrice: listing.price,
        preApproved,
        seenInPerson,
      }),
    });
    if (ok) {
      // The panel shows for the beat the navigation takes; then /thank-you, like every
      // form on the site (owner's rule, 2026-08-25: ONE conversion URL to measure).
      setState("success");
      router.push(
        `/thank-you?from=${encodeURIComponent(`/listing/${listing.id}`)}&c=${
          data.consentToContact === "true" ? "1" : "0"
        }`,
      );
    } else {
      submitted.current = false;
      setState("error");
    }
  }

  return (
    <LeadSheet titleId={titleId} onClose={onClose} wide>
      {state === "success" ? (
        <SuccessBody
          title="Offer started."
          body={`We'll be in touch about your ${offerDisplay || "offer"} on ${listing.address} right away.`}
          onClose={onClose}
        />
      ) : (
        <form onSubmit={onSubmit} className="px-6 pb-7 pt-7 sm:px-8">
          <Honeypot value={hp} onChange={setHp} />
          <h2 id={titleId} className="t-h3 text-ink">
            Make an offer
          </h2>
          {/* A feed row can arrive without a usable ListPrice. This used to be
              listing.price.toLocaleString(), which throws on one, taking the whole offer
              modal down on the flagship conversion path. Drop the clause instead. */}
          <p className="mt-1 text-sm text-stone">
            {listing.address}
            {Number.isFinite(listing.price) && listing.price > 0
              ? ` · listed at $${listing.price.toLocaleString("en-US")}`
              : ""}
          </p>

          <label htmlFor="offer-amt" className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-stone">
            Your offer
          </label>
          <div className="relative mt-2">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-semibold text-ink">$</span>
            <input
              id="offer-amt"
              inputMode="numeric"
              value={offerNum ? offerNum.toLocaleString("en-US") : ""}
              // Digits only, and capped: 20 pasted digits used to overflow Number's safe range and
              // render a nonsense figure like "$100,000,000,000,000,020,000".
              onChange={(e) => setOffer(e.target.value.replace(/[^\d]/g, "").slice(0, 12))}
              placeholder="Enter an amount"
              aria-label="Your offer amount in dollars"
              className={`${fieldCls} pl-7 font-semibold`}
            />
          </div>

          <div className="mt-4 grid gap-3">
            <input className={fieldCls} name="name" required autoComplete="name" placeholder="Your name" aria-label="Your name" />
            <input className={fieldCls} name="email" type="email" required autoComplete="email" placeholder="Email address" aria-label="Email address" />
            <input className={fieldCls} name="phone" type="tel" required autoComplete="tel" placeholder="Phone number" aria-label="Phone number" />
          </div>

            <div className="mt-4">
              <ConsentCheckbox invalid={consent.invalid} />
            </div>

          {/* Live parity: the two questions that tell us how strong an offer is. They travel in the
              existing qualifier payload, so this is still ONE lead post. */}
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <QualifyingRadios
              legend="Are you pre-approved with a lender?"
              name={`${groupId}-approved`}
              options={PRE_APPROVED_ANSWERS}
              value={preApproved}
              onChange={setPreApproved}
            />
            <QualifyingRadios
              legend="Have you seen this home in person?"
              name={`${groupId}-seen`}
              options={SEEN_HOME_ANSWERS}
              value={seenInPerson}
              onChange={setSeenInPerson}
            />
          </div>

          <div className="mt-5">
            <textarea className={`${fieldCls} min-h-20 resize-y`} name="message" placeholder="Anything we should know? (optional)" aria-label="Message" />
          </div>

          <ErrorNote
            show={consent.invalid || state === "error"}
            message={consent.invalid ? CONSENT_ERROR : undefined}
            innerRef={consent.alertRef}
          />
          <button
            type="submit"
            disabled={state === "submitting"}
            className="mt-5 w-full rounded-xl bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
          >
            {state === "submitting" ? "Sending…" : "Submit Offer"}
          </button>
          <p className="t-fine mt-3 text-stone">
            Sending an offer starts a conversation with our team. It isn&rsquo;t a binding contract.
          </p>
        </form>
      )}
    </LeadSheet>
  );
}
