import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { ThankYouConversion } from "@/components/leads/ThankYouConversion";
import { SITE } from "@/lib/site";

/** THE CONVERSION PAGE, WHICH THE SITE DID NOT HAVE.
 *
 * Every form on this site answered in place: LeadForm swapped itself for a `role="status"`
 * message and the URL never changed. Good for a visitor, useless for measurement — Google Ads
 * and GA4 both want a destination, and there was no page view to count. So a submitted form now
 * has somewhere to land, and that landing is a real page rather than a receipt.
 *
 * `noindex`: a conversion page has nothing to rank for and should never be someone's entry from
 * a search result, which would count as a conversion nobody made. It stays `follow` so the links
 * out of it are still crawled.
 *
 * THE PICTURE IS THE PAGE. The reference the owner sent for /ai is a black hole — one luminous
 * object on near-black, which works there because that page is about gravity and intelligence.
 * The real-estate answer is not a black hole; it is the opposite gesture. This is Millerton at
 * dusk, our own main street, with the lights on in the windows: a single warm source on a deep
 * blue ground that OFFERS light instead of swallowing it. It is already in the repo and already
 * CC0 (ATTRIBUTIONS.md), so it costs nothing and carries no licence question.
 *
 * It is also the one place on the site that keeps its colour. Every other hero is `grayscale` on
 * purpose; the warmth here is the payoff for having just trusted us with your details, and one
 * dominant hue (amber on navy) is a restraint, not a decoration.
 */
export const metadata: Metadata = {
  // The root layout's `title.template` already appends "| RealtyLT". Every other route names a
  // topic and a phrase and lets the template add the brand once; this one was adding it twice.
  title: "Thanks | Your Request Is In",
  description: "We have your request and someone from our team will be in touch shortly.",
  robots: { index: false, follow: true },
};

/** A real sequence, so numbering it carries information rather than decorating it. */
const NEXT = [
  {
    n: "01",
    title: "A person reads it",
    body: "Not an autoresponder. Someone on our team, usually within the hour, seven days a week.",
  },
  {
    n: "02",
    title: "We come back with specifics",
    body: "Comparable sales, what is actually asking nearby, and what those numbers mean for your address.",
  },
  {
    n: "03",
    title: "You decide what happens next",
    body: "No obligation. If the timing is wrong for you, we will say so plainly.",
  },
];

export default function ThankYouPage() {
  return (
    <>
      {/* Fires the conversion once, client-side. Separated into its own component so this page
          stays a server component and still renders completely with JavaScript off. */}
      <ThankYouConversion />

      <section className="relative isolate overflow-hidden bg-ink" aria-labelledby="ty-heading">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- one static art-directed hero */}
          <img
            src="/images/hero/millerton-night.jpg"
            alt=""
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          {/* Two scrims, same construction as the home hero: an overall wash so the photograph
              still reads AS a photograph, and a bottom gradient that the type actually sits on.
              The left vignette keeps the copy column dark while the lit shopfronts on the right
              stay open, which is how a photograph grades itself. */}
          <div aria-hidden className="absolute inset-0 bg-ink/55" />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-ink/85 via-ink/45 to-transparent"
          />
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-[64%] bg-gradient-to-r from-ink/70 to-transparent"
          />
        </div>

        <div className="relative mx-auto flex min-h-[max(520px,74svh)] max-w-[1250px] flex-col justify-end px-4 pb-16 pt-28 md:min-h-[620px] md:pb-20 lg:px-16">
          {/* The eyebrow carries the FACT (it went through). The headline carries the feeling.
              Splitting them lets the headline be warm without leaving any doubt about whether
              the form actually submitted, which is the one thing this page has to say. */}
          <p className="t-eyebrow rise text-paper/85">Request received</p>
          <h1 id="ty-heading" className="t-display rise rise-2 mt-5 text-paper">
            The lights are <strong>on</strong>
          </h1>
          <p className="rise rise-3 mt-6 max-w-xl text-lg leading-[1.7] text-paper/85">
            Your details are with our team. Someone will call or email you shortly, and there is
            nothing else you need to do right now.
          </p>
          {/* `light`, not the default `primary`. Primary is `bg-ink`, and a near-black button on
              a night photograph is the least visible thing on the page — it read as a hole rather
              than as the action. On a dark ground the PRIMARY has to be the light one, which is
              exactly what the home hero does with its white SEARCH button. The phone keeps the
              site's `outline-light`, so this pair matches every other dark hero we ship. */}
          <div className="rise rise-4 mt-9 flex flex-wrap items-center gap-x-4 gap-y-3">
            <Button href="/search" variant="light">Browse Homes</Button>
            <Button href={SITE.phoneHref} variant="outline-light">Call {SITE.phone}</Button>
          </div>
        </div>
      </section>

      <section className="sec bg-paper" aria-labelledby="ty-next-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <h2 id="ty-next-heading" className="t-h2 text-ink">
            What happens next
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {NEXT.map((s) => (
              <li key={s.n} className="rounded-2xl border border-line p-6 md:p-7">
                {/* The numeral is the structure, so it is set as data rather than as decoration:
                    it sits above the title at the eyebrow size and never competes with it. */}
                <p className="t-eyebrow text-porchlight-deep">{s.n}</p>
                <h3 className="t-h3 mt-3 text-ink">{s.title}</h3>
                <p className="mt-3 leading-[1.7] text-stone">{s.body}</p>
              </li>
            ))}
          </ol>

          <p className="mt-12 text-sm text-stone">
            Sent this by mistake, or need something sooner? Call{" "}
            <a
              href={SITE.phoneHref}
              className="font-bold text-ink underline underline-offset-2 hover:text-porchlight-deep"
            >
              {SITE.phone}
            </a>{" "}
            and we will sort it out.
          </p>
        </div>
      </section>
    </>
  );
}
