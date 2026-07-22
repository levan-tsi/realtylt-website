"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { SITE } from "@/lib/site";
import { formatOffer, fullAddress, offerQualifier, tourQualifier, type ListingIntent } from "@/lib/leads/listing-intents";

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

  // The sticky sub-nav's "Make an Offer" button opens this same offer sheet (no duplicate
  // lead path) by dispatching a window event.
  useEffect(() => {
    const open = () => setModal("offer");
    window.addEventListener("listing:make-offer", open);
    return () => window.removeEventListener("listing:make-offer", open);
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
      {/* Mobile / small: live's tap-to-open bottom sheets (unchanged). */}
      <div className="grid grid-cols-2 gap-2.5 lg:hidden">
        <button
          type="button"
          onClick={() => openTour()}
          className="rounded-[3px] bg-ink px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
        >
          Schedule a Tour
        </button>
        <button
          type="button"
          onClick={() => setModal("offer")}
          className="rounded-[3px] border border-ink px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
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
          className="mt-3 w-full rounded-[3px] border border-ink px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
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

  const tabCls = (active: boolean) =>
    `min-h-11 flex-1 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river ${
      active ? "border-b-2 border-ink text-ink" : "border-b-2 border-transparent text-stone hover:text-ink"
    }`;
  const arrowCls =
    "grid h-11 w-8 shrink-0 place-items-center rounded-[3px] text-ink transition-colors hover:bg-mist disabled:cursor-not-allowed disabled:text-stone/40 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river";

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
                  className={`flex min-h-11 flex-col items-center rounded-[4px] border px-1 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river ${
                    date === d.key ? "border-ink bg-ink text-paper" : "border-[#d7dbe0] text-ink hover:border-ink"
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
            className="mt-4 w-full rounded-[3px] bg-ink px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
          >
            In Person Tour
          </button>
        </div>
      ) : (
        <div className="pt-4">
          <p className="text-sm leading-relaxed text-stone">
            Have a question about this home? Send a note and we&rsquo;ll get back to you shortly.
          </p>
          <button
            type="button"
            onClick={onRequestInfo}
            className="mt-3 w-full rounded-[3px] border border-ink px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
          >
            Request Info
          </button>
        </div>
      )}
    </div>
  );
}

/** Shared bottom-sheet shell — focus trap, Esc, restore focus, body-scroll lock. */
function Sheet({
  titleId,
  onClose,
  children,
}: {
  titleId: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("input,select,textarea,button")?.focus();
    return () => {
      document.body.style.overflow = prev;
      restoreRef.current?.focus?.();
    };
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const f = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),textarea,input:not([disabled]),select,[tabindex]:not([tabindex="-1"])',
      );
      if (!f || f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  return (
    <div
      className="rlt-fade-in fixed inset-0 z-[1000000] flex items-end justify-center bg-ink/70 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        className="rlt-pop-in relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[6px] bg-paper text-ink shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 z-10 grid h-11 w-11 place-items-center text-stone transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

const fieldCls =
  "w-full rounded-[4px] border border-[#cccccc] bg-white px-3.5 py-3 text-base text-ink-soft transition-colors placeholder:text-stone focus:border-ink/50 focus:outline-none focus:ring-1 focus:ring-ink/40";

function SuccessBody({ title, body, onClose }: { title: string; body: string; onClose: () => void }) {
  return (
    <div role="status" tabIndex={-1} className="px-6 pb-7 pt-9 text-center outline-none sm:px-8">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-porchlight/10 text-porchlight-deep">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m5 12.5 4.5 4.5L19 7" />
        </svg>
      </span>
      <h2 className="mt-4 text-2xl font-light text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-stone">{body}</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-[4px] bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft"
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

function ErrorNote({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p role="alert" className="mt-3 rounded-[2px] border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-500">
      We couldn&rsquo;t send that. Try again, or call {SITE.phone}.
    </p>
  );
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
  const submitted = useRef(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitted.current) return;
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    submitted.current = true;
    setState("submitting");
    const day = days.find((d) => d.key === date);
    const ok = await postLead({
      name: data.name,
      email: data.email,
      phone: data.phone,
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
    if (ok) setState("success");
    else {
      submitted.current = false;
      setState("error");
    }
  }

  return (
    <Sheet titleId={titleId} onClose={onClose}>
      {state === "success" ? (
        <SuccessBody
          title="Tour requested."
          body={`We'll confirm a time for ${listing.address} shortly. Expect a call or text soon.`}
          onClose={onClose}
        />
      ) : (
        <form onSubmit={onSubmit} className="px-6 pb-7 pt-7 sm:px-8">
          <Honeypot value={hp} onChange={setHp} />
          <h2 id={titleId} className="text-2xl font-light text-ink">
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
                className={`min-h-11 rounded-[4px] border px-3 py-2.5 text-sm font-medium transition-colors ${
                  tourType === t ? "border-ink bg-ink text-paper" : "border-[#d7dbe0] text-ink hover:border-ink"
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
                className={`flex min-w-[3.5rem] shrink-0 flex-col items-center rounded-[4px] border px-2 py-2 transition-colors ${
                  date === d.key ? "border-ink bg-ink text-paper" : "border-[#d7dbe0] text-ink hover:border-ink"
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
            <input className={fieldCls} name="phone" type="tel" autoComplete="tel" placeholder="Phone number" aria-label="Phone number" />
          </div>

          <ErrorNote show={state === "error"} />
          <button
            type="submit"
            disabled={state === "submitting"}
            className="mt-5 w-full rounded-[4px] bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
          >
            {state === "submitting" ? "Sending…" : "Request Tour"}
          </button>
        </form>
      )}
    </Sheet>
  );
}

function OfferModal({ listing, onClose }: { listing: ListingIntent; onClose: () => void }) {
  const titleId = useId();
  const [offer, setOffer] = useState(String(listing.price));
  const [hp, setHp] = useState("");
  const [state, setState] = useState<LeadState>("idle");
  const submitted = useRef(false);

  const offerNum = Number(offer) || 0;
  const offerDisplay = formatOffer(offer);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitted.current) return;
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    submitted.current = true;
    setState("submitting");
    const ok = await postLead({
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      address: fullAddress(listing),
      source: `/listing/${listing.id}`,
      interestReason: REASON_BUYING,
      rlt_hp: hp,
      qualifier: offerQualifier({ mlsNumber: listing.mlsNumber, offerDisplay, listPrice: listing.price }),
    });
    if (ok) setState("success");
    else {
      submitted.current = false;
      setState("error");
    }
  }

  return (
    <Sheet titleId={titleId} onClose={onClose}>
      {state === "success" ? (
        <SuccessBody
          title="Offer started."
          body={`We'll be in touch about your ${offerDisplay || "offer"} on ${listing.address} right away.`}
          onClose={onClose}
        />
      ) : (
        <form onSubmit={onSubmit} className="px-6 pb-7 pt-7 sm:px-8">
          <Honeypot value={hp} onChange={setHp} />
          <h2 id={titleId} className="text-2xl font-light text-ink">
            Make an offer
          </h2>
          <p className="mt-1 text-sm text-stone">
            {listing.address} · listed at ${listing.price.toLocaleString("en-US")}
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
              onChange={(e) => setOffer(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="Enter an amount"
              aria-label="Your offer amount in dollars"
              className={`${fieldCls} pl-7 font-semibold`}
            />
          </div>

          <div className="mt-4 grid gap-3">
            <input className={fieldCls} name="name" required autoComplete="name" placeholder="Your name" aria-label="Your name" />
            <input className={fieldCls} name="email" type="email" required autoComplete="email" placeholder="Email address" aria-label="Email address" />
            <input className={fieldCls} name="phone" type="tel" autoComplete="tel" placeholder="Phone number" aria-label="Phone number" />
            <textarea className={`${fieldCls} min-h-20 resize-y`} name="message" placeholder="Anything we should know? (optional)" aria-label="Message" />
          </div>

          <ErrorNote show={state === "error"} />
          <button
            type="submit"
            disabled={state === "submitting"}
            className="mt-5 w-full rounded-[4px] bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
          >
            {state === "submitting" ? "Sending…" : "Submit Offer"}
          </button>
          <p className="mt-3 text-xs leading-relaxed text-stone">
            Sending an offer starts a conversation with our team. It isn&rsquo;t a binding contract.
          </p>
        </form>
      )}
    </Sheet>
  );
}
