import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { TrackedButton } from "@/components/leads/TrackedButton";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Connect | Contact Us Anytime",
  description:
    "Reach RealtyLT seven days a week: call, email, send a message, or book a 30-minute strategy session, virtual consultation, or discovery call.",
};

// The owner's Google Calendar appointment-scheduling embed (owner-directed 2026-07-24:
// embed the booking UI inline exactly like the live page's custom code — the visitor sees
// the three appointment types and books right here, no link-out). `?gv=true` is Google's
// embeddable view; the 899px height comes from the owner's own live markup.
const BOOKING_EMBED_URL =
  "https://calendar.google.com/calendar/appointments/AcZssZ17rnRAzaLIa9wbntOvOoEdcIGj3zkYtItVqMM=?gv=true";
const BOOKING_URL =
  "https://calendar.google.com/calendar/appointments/AcZssZ17rnRAzaLIa9wbntOvOoEdcIGj3zkYtItVqMM=";

export default function ConnectPage() {
  return (
    <>
      {/* ── Hero. Millerton after dark: a real Dutchess County main street, CC0. What was
          here before was an unlicensed stock photograph of a woman with a coffee, washed out
          to about 30% contrast — the weakest hero on the site and the least like this
          business. Now a dark band like every other hero, so /connect stops being the one
          page in a different world. */}
      <section className="relative isolate overflow-hidden bg-ink" aria-labelledby="connect-hero">
        <div className="absolute inset-0">
          <Image
            src="/images/hero/millerton-night.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center grayscale"
          />
          <div className="absolute inset-0 bg-black/55" />
        </div>
        {/* The band carries a photograph now, so it gets the height to be one — and the title
            goes white. It was text-ink-soft over a washed-out light band; against a dark hero
            that is dark-on-dark and unreadable. */}
        <div className="relative mx-auto max-w-[1250px] px-4 py-24 text-center md:py-28 lg:px-8">
          {/* /85, not /70: at 11px over live photography, 30% translucency is more margin than
              the AA floor can spare. The home hero learned this in round 11 and sits at /85; this
              band kept /70 and nobody caught it because scripts/verify-hero-contrast.mjs had only
              ever been run at its 1440 default, where the scrim is deep enough to carry it.
              Measured here at 390 it was 4.14:1 and at 320 3.66:1, against a 4.5 floor. */}
          <p className="t-eyebrow text-paper/85">Seven days a week</p>
          <h1 id="connect-hero" className="t-h1 mt-5 text-paper">
            Contact Us <strong>Anytime</strong>
          </h1>
          {/* THE CONTACT PAGE HAD NOTHING TO CONTACT ANYONE WITH ON ITS FIRST SCREEN.
              Measured: 34 words above the fold and ZERO controls the rubric could probe for a
              press, because the hero is an eyebrow and a headline and then it stops — the phone
              number and the email are ~400px further down, inside the sticky rail beside the
              booking embed. Every other hero on the site that asks for a call carries this exact
              button (/selling, /buying), so this is the site's own pattern arriving on the one
              page whose entire job is the thing it does. No new copy: it is the number already in
              SITE, in the component already used for it. */}
          <TrackedButton
            href={SITE.phoneHref}
            variant="outline-light"
            gaCategory="Phone"
            gaLabel="connect-hero"
            className="mt-7"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
            </svg>
            {SITE.phone}
          </TrackedButton>
        </div>
      </section>

      {/* ── Agent + appointments: portrait left, booking embed right. The left column is
          sticky above lg because the calendar is 899px tall and the column is about half
          that — it used to leave a 400px hole beside the embed, and it now keeps the phone
          number and email in view for the whole length of the booking flow instead. */}
      <section className="sec bg-paper" aria-labelledby="appointments-heading">
        <div className="mx-auto grid max-w-[1250px] gap-12 px-4 lg:grid-cols-[300px_1fr] lg:gap-16 lg:px-8">
          <Reveal className="lg:sticky lg:top-8 lg:self-start">
            <Image
              src="/images/levan-portrait.jpg"
              alt="Levan Tsiklauri, investor and REALTOR® at RealtyLT"
              // The file is 3024x4032 (a true 3:4). Declaring 300x380 reserved a box 20px
              // shorter than the image `h-auto` then painted, so the page shifted on load and
              // Next logged "width or height modified, but not the other" on every visit.
              width={300}
              height={400}
              // priority: the portrait leads the page's first viewport, and lazy-loading it
              // was the R32 rubric's D4 deduction here (round 36).
              priority
              // Greyscale to match every other photograph on the site, including the SAME
              // portrait on /who-we-are. In colour it was the one saturated image on a
              // monochrome site, and it sat a few hundred pixels from its own desaturated
              // copy in the booking panel.
              className="h-auto w-full max-w-[300px] rounded-2xl grayscale"
            />
            <p className="t-h3 mt-5 text-ink">Levan Tsiklauri</p>
            <p className="t-eyebrow mt-2 text-stone">Investor &amp; REALTOR&reg;</p>
            <address className="mt-5 space-y-1 text-sm not-italic text-stone">
              <p>
                <a href={SITE.phoneHref} className="inline-flex min-h-6 items-center transition-colors hover:text-ink">{SITE.phone}</a>
              </p>
              <p>
                <a href={`mailto:${SITE.email}`} className="inline-flex min-h-6 items-center transition-colors hover:text-ink">{SITE.email}</a>
              </p>
              <p>
                {SITE.address.street}, {SITE.address.locality}, {SITE.address.region}{" "}
                {SITE.address.postalCode}
              </p>
            </address>
            <p className="mt-6 max-w-[300px] border-t border-line pt-6 text-sm leading-relaxed text-stone">
              Would rather not pick a slot? Call or text and we&rsquo;ll find a time. Evenings and
              weekends included.
            </p>
          </Reveal>

          <div>
            <h2 id="appointments-heading" className="sr-only">
              Book an appointment
            </h2>
            {/* An iframe is a tab stop with no ring of its own, and it cannot be given one:
                focusing it hands focus to the EMBEDDED document, so :focus-visible never
                matches out here and we cannot style across the origin. The titled frame plus
                the "Open the booking page directly" link below it are the way out. */}
            {/* Height is per-width because the embed's own content is: measured by loading the
                booking URL directly, it needs 1031px at 390 (the three appointment cards stack)
                and 900px from 768 up. The old flat 899 clipped the third card mid-sentence on a
                phone. It does scroll internally there, but a nested scroller inside a page is a
                bad way to find out a card exists. */}
            <iframe
              src={BOOKING_EMBED_URL}
              title="Book an appointment with Levan Tsiklauri (Google Calendar)"
              className="h-[1040px] w-full border-0 md:h-[899px]"
              loading="lazy"
            />
            <p className="mt-3 text-xs text-stone">
              Trouble with the calendar?{" "}
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-6 items-center font-bold text-ink underline-offset-4 hover:underline"
              >
                Open the booking page directly
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
