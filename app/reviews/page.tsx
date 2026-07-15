import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Stars } from "@/components/ui/Stars";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { GOOGLE_REVIEWS_URL, TESTIMONIALS } from "@/content/testimonials";

export const metadata: Metadata = {
  title: "Reviews | What Our Clients Say",
  description:
    "Read Google reviews from RealtyLT clients across the Hudson Valley: 5.0-rated service for buyers and sellers, seven days a week.",
};

export default function ReviewsPage() {
  return (
    <>
      {/* ── Hero */}
      <section className="bg-ink py-16 text-paper md:py-20" aria-labelledby="reviews-hero">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <h1 id="reviews-hero" className="mx-auto max-w-2xl text-3xl font-light leading-tight md:text-4xl">
            What Our <strong className="font-bold">Clients Say</strong>
          </h1>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Stars />
            <p className="text-2xl font-bold text-paper">5.0</p>
            <p className="text-sm text-paper/60">on Google</p>
          </div>
          <p className="mx-auto mt-4 max-w-lg text-paper/75">
            Every review below is a real Google review from a real closing. Read them there, not
            just here.
          </p>
          <div className="mt-7">
            <Button href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" variant="light">
              Read All Reviews On Google
            </Button>
          </div>
        </div>
      </section>

      {/* ── Testimonials */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="quotes-heading">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading align="center" as="h2">
              <span id="quotes-heading">In Their Words</span>
            </SectionHeading>
          </Reveal>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} as="li" delay={i * 120}>
                <TestimonialCard t={t} />
              </Reveal>
            ))}
          </ul>

          <Reveal className="mt-12">
            <aside className="bg-mist px-6 py-10 text-center md:px-12">
              <p className="text-2xl font-light text-ink">Worked with us? Tell the next family.</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-stone">
                A two-minute Google review is the biggest compliment we can get, and the most
                useful thing a future buyer or seller can read.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer">
                  Leave a Google review
                </Button>
                <Button href="/connect" variant="outline">
                  Start your own story
                </Button>
              </div>
            </aside>
          </Reveal>
        </div>
      </section>
    </>
  );
}
