import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Connect | Contact Us Anytime",
  description:
    "Reach RealtyLT seven days a week: call, email, send a message, or book a 30-minute strategy session, virtual consultation, or discovery call.",
};

// The owner's Google Calendar appointment-scheduling page (public booking UI). One page
// serves all three appointment types — the visitor picks the type, then a time, on Google.
// (This new-format schedule has no reliable per-service deep link, so every card opens the
// same booking page in a new tab with its own clear call to action.)
const BOOKING_URL =
  "https://calendar.google.com/calendar/appointments/AcZssZ17rnRAzaLIa9wbntOvOoEdcIGj3zkYtItVqMM=";

const MEETINGS = [
  {
    title: "In-Person Real Estate Strategy Session",
    length: "30 min",
    kind: "In-person meeting",
    body: "Let's sit down together to create a personalized strategy for your real estate success: neighborhoods, numbers, and next steps.",
    cta: "Book the in-person session",
  },
  {
    title: "Virtual Real Estate Consultation",
    length: "30 min",
    kind: "Video conference",
    body: "Connect face-to-face virtually to achieve your real estate goals. Perfect if you're relocating to the Hudson Valley from the city or out of state.",
    cta: "Book the virtual consultation",
  },
  {
    title: "Introductory Real Estate Discovery Call",
    length: "30 min",
    kind: "Phone call",
    body: "The most direct way to get your real estate questions answered. This focused 30-minute phone call is all answers, no pitch.",
    cta: "Book the discovery call",
  },
];

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
          <h1 id="connect-hero" className="text-3xl font-light text-ink-soft md:text-[46px]">
            Contact Us <strong className="font-bold">Anytime</strong>
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
              className="h-auto w-full max-w-[300px]"
            />
            <p className="mt-4 text-2xl font-light text-stone">Levan Tsiklauri</p>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-stone">
              Investor &amp; Realtor
            </p>
            <address className="mt-5 space-y-1 text-sm not-italic text-stone">
              <p>
                <a href={SITE.phoneHref} className="transition-colors hover:text-ink">{SITE.phone}</a>
              </p>
              <p>
                <a href={`mailto:${SITE.email}`} className="transition-colors hover:text-ink">{SITE.email}</a>
              </p>
              <p>
                {SITE.address.street}, {SITE.address.locality}, {SITE.address.region}{" "}
                {SITE.address.postalCode}
              </p>
            </address>
          </Reveal>

          <div>
            <Reveal className="text-center">
              <span aria-hidden className="mx-auto block h-14 w-14 overflow-hidden rounded-full">
                <Image src="/images/levan-portrait.jpg" alt="" width={56} height={56} className="h-full w-full object-cover" />
              </span>
              <h2 id="appointments-heading" className="mt-3 text-2xl font-light text-ink-soft">
                Levan Tsiklauri
              </h2>
              <p className="text-sm text-stone">Appointments</p>
            </Reveal>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {MEETINGS.map((m, i) => (
                <Reveal key={m.title} as="li" delay={i * 100}>
                  <article className="lift flex h-full flex-col rounded-lg border border-[#dddddd] bg-white p-6">
                    <h3 className="text-lg leading-snug text-ink-soft">{m.title}</h3>
                    <p className="mt-3 text-sm text-ink-soft">{m.length}</p>
                    <p className="mt-1 text-sm text-ink-soft">{m.kind}</p>
                    <p className="mt-4 grow text-sm leading-relaxed text-stone">{m.body}</p>
                    <a
                      href={BOOKING_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex min-h-[44px] items-center text-sm font-bold text-ink underline-offset-4 hover:underline"
                    >
                      {m.cta}
                      <span className="sr-only"> (opens Google Calendar in a new tab)</span>
                    </a>
                  </article>
                </Reveal>
              ))}
            </ul>
            <p className="mt-6 text-center text-xs text-stone">
              Powered by Google Calendar appointment scheduling
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
