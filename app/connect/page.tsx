import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LeadForm } from "@/components/leads/LeadForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Connect — Contact Us Anytime",
  description:
    "Reach RealtyLT seven days a week — call, email, send a message, or book a 30-minute strategy session, virtual consultation, or discovery call.",
};

const MEETINGS = [
  {
    title: "In-person strategy session",
    length: "30 min · in person",
    body: "Sit down together and map out a personalized strategy for your purchase or sale — neighborhoods, numbers, and next steps.",
  },
  {
    title: "Virtual consultation",
    length: "30 min · video call",
    body: "The same conversation, face-to-face from anywhere. Perfect if you're relocating to the Hudson Valley from the city or out of state.",
  },
  {
    title: "Introductory discovery call",
    length: "30 min · phone",
    body: "The most direct way to get your real estate questions answered. No slides, no pitch — just answers.",
  },
];

export default function ConnectPage() {
  return (
    <>
      {/* ── Hero */}
      <section className="bg-ink py-16 text-paper md:py-20" aria-labelledby="connect-hero">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-porchlight">Connect</p>
          <h1 id="connect-hero" className="mt-3 font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
            Contact us <span className="text-porchlight">anytime</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-paper/80">
            Seven days a week, evenings included. Call, text, email, or send a message below — we
            usually reply within the hour.
          </p>
          <div className="mt-8 grid gap-6 border-t border-paper/10 pt-8 text-sm sm:grid-cols-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">Call or text</p>
              <a href={SITE.phoneHref} className="mt-1 block font-mono text-lg text-paper hover:text-porchlight">
                {SITE.phone}
              </a>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">Email</p>
              <a href={`mailto:${SITE.email}`} className="mt-1 block font-mono text-lg text-paper hover:text-porchlight">
                {SITE.email}
              </a>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">Office</p>
              <p className="mt-1 text-paper/80">
                {SITE.address.street}, {SITE.address.locality}, {SITE.address.region} {SITE.address.postalCode}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Form + agent */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="reach-heading">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[1fr_1.2fr] lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="Reach out" as="h2">
              <span id="reach-heading">Tell us what you&rsquo;re working on</span>
            </SectionHeading>
            <div className="mt-8 flex items-center gap-4">
              <span aria-hidden className="grid h-16 w-16 place-items-center rounded-full bg-ink font-display text-2xl text-porchlight">
                LT
              </span>
              <div>
                <p className="font-bold text-ink">Levan Tsiklauri</p>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-stone">
                  Investor &amp; Realtor · United Real Estate
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-md leading-relaxed text-stone">
              Whether you&rsquo;re buying your first place, selling a family home, or weighing a
              cash offer against a listing — start the conversation. You&rsquo;ll get a straight
              answer, not a script.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <div className="rounded-[2px] border border-ink/10 bg-white p-6 shadow-[0_24px_60px_-30px_rgb(16_24_32/0.25)] md:p-8">
              <LeadForm
                submitLabel="Send Us A Message"
                successTitle="Message sent."
                successBody="Thanks — we usually reply within the hour, seven days a week."
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Ways to meet */}
      <section className="bg-mist py-16 md:py-20" aria-labelledby="meet-heading">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="Prefer to talk it through?" align="center" as="h2">
              <span id="meet-heading">Book thirty minutes</span>
            </SectionHeading>
            <p className="mx-auto mt-4 max-w-xl text-center text-stone">
              Pick the format that suits you — call or email and we&rsquo;ll get it on the calendar.
            </p>
          </Reveal>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {MEETINGS.map((m, i) => (
              <Reveal key={m.title} as="li" delay={i * 120}>
                <article className="lift flex h-full flex-col rounded-[2px] border border-ink/10 bg-white p-7">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-porchlight-deep">{m.length}</p>
                  <h3 className="mt-2 font-display text-xl text-ink">{m.title}</h3>
                  <p className="mt-3 grow text-sm leading-relaxed text-stone">{m.body}</p>
                  <a
                    href={SITE.phoneHref}
                    className="mt-5 text-sm font-bold text-river underline-offset-4 hover:underline"
                  >
                    Call to book →
                  </a>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
