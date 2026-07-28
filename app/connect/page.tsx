import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
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
          <p className="t-eyebrow text-paper/70">Seven days a week</p>
          <h1 id="connect-hero" className="t-h1 mt-5 text-paper">
            Contact Us <strong>Anytime</strong>
          </h1>
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
              width={300}
              height={380}
              className="h-auto w-full max-w-[300px] rounded-2xl"
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
            <p className="mt-6 max-w-[300px] border-t border-[#e6e6e6] pt-6 text-sm leading-relaxed text-stone">
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
            <iframe
              src={BOOKING_EMBED_URL}
              title="Book an appointment with Levan Tsiklauri (Google Calendar)"
              className="w-full border-0"
              style={{ height: 899 }}
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
