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
      {/* ── Hero — live: thin LIGHT photo band (washed-out image), dark centered title */}
      <section className="relative isolate overflow-hidden bg-mist" aria-labelledby="connect-hero">
        <div className="absolute inset-0">
          {/* Live connect hero's OWN asset (uploads/219/int-33.jpg — woman with coffee),
              kept as a washed light band behind the dark centered title. */}
          <Image
            src="/images/hero/connect-int33.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-white/50" />
        </div>
        {/* Live: centered title in the light band, pad ~51px */}
        <div className="relative mx-auto max-w-[1250px] px-4 py-[51px] text-center lg:px-8">
          <h1 id="connect-hero" className="t-h1 text-ink-soft">
            Contact Us <strong>Anytime</strong>
          </h1>
        </div>
      </section>

      {/* ── Agent + appointments — live: portrait left, booking cards right */}
      <section className="bg-paper py-14 md:py-20" aria-labelledby="appointments-heading">
        <div className="mx-auto grid max-w-[1250px] gap-12 px-4 lg:grid-cols-[300px_1fr] lg:px-8">
          <Reveal>
            <Image
              src="/images/levan-portrait.jpg"
              alt="Levan Tsiklauri, investor and realtor at RealtyLT"
              width={300}
              height={380}
              className="h-auto w-full max-w-[300px] rounded-2xl"
            />
            <p className="mt-4 text-2xl font-light text-stone">Levan Tsiklauri</p>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-stone">
              Investor &amp; REALTOR&reg;
            </p>
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
