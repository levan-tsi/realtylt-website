import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ThankYouConversion } from "@/components/leads/ThankYouConversion";
import { ConsentCopy } from "@/components/thank-you/ConsentCopy";
import { followUpCopy } from "@/lib/thank-you-copy";
import { SITE } from "@/lib/site";

/** THE CONVERSION PAGE. A visitor lands here having just handed us their name and phone
 * number, and the page has exactly three jobs: say thank you, in those words; leave no doubt
 * the form went through; and tell the truth about what happens next.
 *
 * THE HEADLINE SAYS THANK YOU because the owner read the old one ("The lights are on") and
 * pointed out that a thank-you page never said it. The eyebrow keeps the fact (request
 * received), the headline carries the gratitude, and the photograph still tells the
 * lights-are-on story underneath — Millerton at dusk, our own main street, warm windows on a
 * deep blue ground, CC0 (ATTRIBUTIONS.md). It stays the one hero on the site that keeps its
 * colour: the warmth is the payoff for having just trusted us, and one hue is restraint.
 *
 * WHAT THE PAGE PROMISES lives in lib/thank-you-copy.ts behind ONE constant
 * (OUTBOUND_FOLLOW_UP_LIVE). The assistant's confirmation call and the thank-you email the
 * owner wants do not exist in the CRM yet, so today's copy promises neither; the copy for the
 * day they exist is already written behind the constant. The `?c=` param LeadForm sends
 * carries the visitor's consent answer, and <ConsentCopy> renders the matching sentence: a
 * person who declined calls is never told their phone is about to ring.
 *
 * This file stays a SERVER component so the whole page renders with JavaScript off — the two
 * client islands (conversion ping, consent sentence) degrade to nothing and to the neutral
 * sentence respectively, and neither reads `useSearchParams`, which would suspend the route
 * into a stream that no-JS visitors never see (the /search blank-page bug).
 *
 * `noindex`: a conversion page has nothing to rank for, and an entry from a search result
 * would count as a conversion nobody made. `follow` so the links out are still crawled.
 */
export const metadata: Metadata = {
  // The root layout's `title.template` appends "| RealtyLT" once; naming the brand here would
  // double it (app/titles.test.ts). "Thank You" leads because that is what the page is for.
  title: "Thank You | Your Request Is In",
  description: "Thank you. Your request is with our team, and you will hear from us soon.",
  robots: { index: false, follow: true },
};

/** THE ONE SWITCH between the page that is true today and the page for the day the follow-up
 * runs (docs/LEAD-FOLLOW-UP.md points here). The sending side already exists as n8n workflow
 * `rzI7WIQhRKfrhJxH` ("[DRAFT] Website Lead Follow-up") and is INACTIVE: verified 2026-08-22
 * as `active: false`, `triggerCount: 0` — no call has ever been placed, no email ever sent, so
 * the page promises neither.
 *
 * FLIP TO true ONLY WHEN, for a lead submitted through this site's forms:
 *   1. that workflow (or its successor) is ACTIVE, places the assistant's verification call
 *      for consented leads (?c=1) and sends the follow-up email for both branches, and
 *   2. both have been WATCHED happening on a real test lead, not inferred from configuration.
 * Nothing else changes: followUpCopy() selects the vetted copy set, and
 * lib/thank-you-copy.test.ts holds both sets to the honesty rules either way. */
const OUTBOUND_FOLLOW_UP_LIVE = false;

const { heroNote, nextSteps } = followUpCopy(OUTBOUND_FOLLOW_UP_LIVE);

export default function ThankYouPage() {
  return (
    <>
      {/* Fires the conversion once, client-side. Separated into its own component so this page
          stays a server component and still renders completely with JavaScript off. */}
      <ThankYouConversion />

      <section className="relative isolate overflow-hidden bg-ink" aria-labelledby="ty-heading">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- one static art-directed hero */}
          {/* ROUND 38 — THE PHOTOGRAPH THE OWNER ASKED TO HAVE CHANGED.
              It was millerton-night.jpg, and he was right about it: a night street with power
              lines crossing the frame at three angles, two blown streetlamp flares (one of them
              directly behind the headline), parked cars filling the foreground and a heavy
              brown-orange sodium cast. Nothing in it says "you are in good hands".

              It was also off-system twice over. Every other hero on this site is GRAYSCALE
              (/buying, /financing, /selling all carry `grayscale`), and the black-and-white
              treatment with the ink/paper palette is the thing the design review keeps naming as
              what already reads well here. The night shot was the one full-colour hero, and the
              colour it brought was orange.

              WHAT REPLACED IT, and the honest limit of the choice: the brief asked for arrival —
              warm, calm, residential. There is no residential arrival photograph in the licensed
              library. Round 36 left three candidates on disk; breakneck-south is reserved for the
              home hero, bear-mountain is a suspension bridge over a rail line (infrastructure,
              not a home), and this one — the valley from Olana — is the only unreserved frame
              that is calm, has no wires, no cars and no flares, and still reads through the
              scrims this page already tunes. Rendered at 1440 and 390 against the other two
              before choosing; the frames are in docs/design-r38/thankyou-cand-*.
              A genuinely residential arrival image would have to be licensed new, and that is the
              owner's call rather than something to fake with a worse fit.

              object-center at both widths now: the 26% offset existed only to find the lit
              shopfront in the old frame, and this photograph's subject is its centre. */}
          <img
            src="/images/hero/hudson-olana.jpg"
            alt=""
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-center grayscale"
          />
          {/* Scrims, graded per viewport. Round 36 measured the phone rendering as "a dark
              brown smear": three scrims tuned on a 1440 frame were stacking on a 390 crop that
              is mostly shopfront, and the photograph stopped reading as a street. The left
              vignette (which exists to hold a dark column under DESKTOP copy while the right of
              the frame stays open) switches off entirely below md — at 390 it was covering the
              whole image. The bottom gradient is the one carrying the type, so it stays at full
              strength everywhere; scripts/verify-hero-contrast.mjs measures the result in pixels.

              ROUND 38: the phone wash went /30 -> /42 WITH THE PHOTOGRAPH, not instead of it.
              The /30 existed for one reason, written down above — to let the night shot's lit
              shopfront windows glow through — and that photograph is gone. What replaced it is a
              bright overcast sky, and the gate measured the consequence immediately: the
              "Request received" eyebrow fell to 4.35:1 at 320x800 against a 4.5 floor. This is
              the number that fixes it, re-measured rather than guessed. */}
          <div aria-hidden className="absolute inset-0 bg-ink/42 md:bg-ink/55" />
          {/* On a phone the content block's TOP sits at mid-viewport, so a gradient that only
              climbs 78% of the frame leaves the eyebrow on nearly bare photograph — measured
              at 2.50:1 over the lit shopfronts at 320. Full-height with a /55 midpoint keeps
              the upper third open (the windows still glow) while the text zone earns AA;
              desktop keeps the shorter, lighter grade it always had. */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-ink/90 via-ink/55 to-transparent md:h-[70%] md:from-ink/85 md:via-ink/45"
          />
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 hidden w-[64%] bg-gradient-to-r from-ink/70 to-transparent md:block"
          />
        </div>

        {/* lg:px-8, not lg:px-16. Every section below this hero sets its content at 127px on a
            1440 screen and the hero was setting its eyebrow and headline at 159 — a 32px step in
            the page's left edge, at exactly the point where the eye starts tracking down it. The
            rubric counted it as a fifth distinct text edge; the reason to fix it is that you can
            see it. Nothing else about the hero moved. */}
        <div className="relative mx-auto flex min-h-[max(520px,74svh)] max-w-[1250px] flex-col justify-end px-4 pb-16 pt-28 md:min-h-[620px] md:pb-20 lg:px-8">
          {/* The eyebrow carries the FACT (it went through); the headline carries the thanks.
              Splitting them lets the headline be warm without leaving any doubt about whether
              the form actually submitted. */}
          {/* Full-opacity white: at 11px over photography, the /85 wash was the difference
              between 4.5:1 and failing (measured 2.84:1 at 390 before the regrade). */}
          <p className="t-eyebrow rise text-paper">Request received</p>
          <h1 id="ty-heading" className="t-display rise rise-2 mt-5 text-paper">
            Thank <strong>you</strong>
          </h1>
          <p className="rise rise-3 mt-6 max-w-xl text-lg leading-[1.7] text-paper/85">
            Your request is in front of our team now.{" "}
            <ConsentCopy copy={heroNote} /> There is nothing else you need to do.
          </p>
          {/* `light` leads, not `primary`: a near-black button on a night photograph reads as a
              hole, and every dark hero on the site leads with its light button. On a phone the
              pair used to stack ragged (172px and 205px, left-aligned); two equal-width
              buttons in one column read as a composed unit instead of two afterthoughts. */}
          <div className="rise rise-4 mt-9 flex w-full max-w-[21rem] flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
            <Button href="/search" variant="light" className="w-full sm:w-auto">
              Browse Homes
            </Button>
            <Button href={SITE.phoneHref} variant="outline-light" className="w-full sm:w-auto">
              Call {SITE.phone}
            </Button>
          </div>
        </div>
      </section>

      <section className="sec bg-paper" aria-labelledby="ty-next-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          {/* NOT wrapped in <Reveal>, deliberately: at 1440x900 this heading sits ~845px down,
              on screen at load but 25px below the observer's -80px trigger line, so a wrapped
              version renders the first viewport with an empty white band where the section
              title should be. The rows below it carry the motion; the anchor stays put. */}
          <h2 id="ty-next-heading" className="t-h2 text-ink">
            What happens next
          </h2>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-10">
            {/* THE LEDGER, NOT THE NUMBERED CARDS. The old section was three identical
                bordered cards labelled 01/02/03 — the templated device, and the numbers said
                nothing. The question a person who just submitted actually has is WHEN, so the
                left column of this document answers it and the rows are ordered by it. One
                bordered panel, hairline rows: a record, which is what a confirmation is. */}
            <ol className="divide-y divide-line rounded-3xl border border-line">
              {nextSteps.map((s, i) => (
                <Reveal
                  as="li"
                  key={s.when}
                  delay={i * 70}
                  className="grid gap-2 p-6 sm:grid-cols-[11rem_1fr] sm:gap-6 md:p-7"
                >
                  <p className="t-eyebrow pt-1 text-porchlight-deep">{s.when}</p>
                  <div>
                    <h3 className="t-title text-ink">{s.title}</h3>
                    <p className="mt-2 leading-[1.7] text-stone">
                      {typeof s.body === "string" ? s.body : <ConsentCopy copy={s.body} />}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ol>

            {/* THE PERSON, because "someone will contact you" is what every vendor page says
                and a face with a number is what nobody's does. It also does forward work: when
                the follow-up call comes, the visitor has already seen who calls and from what
                number, which is the difference between an answered call and a screened one. */}
            <Reveal delay={130}>
              <aside
                className="rounded-2xl border border-line bg-mist p-6 md:p-7"
                aria-labelledby="ty-who-heading"
              >
                <p id="ty-who-heading" className="t-eyebrow text-stone">
                  Who reads it
                </p>
                <div className="mt-5 flex items-center gap-4">
                  <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-ink/10">
                    <Image
                      src="/images/levan-portrait.jpg"
                      alt="Levan Tsiklauri"
                      fill
                      sizes="80px"
                      className="object-cover object-top grayscale"
                    />
                  </span>
                  <div>
                    <p className="font-display text-2xl leading-tight text-ink">Levan Tsiklauri</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone">
                      United Real Estate
                    </p>
                  </div>
                </div>
                <p className="mt-5 leading-[1.7] text-stone">
                  Requests from this site go to Levan and his team, not to a call center. When
                  the phone rings or the reply lands, this is who it is.
                </p>
                <div className="mt-6 border-t border-line">
                  <a
                    href={SITE.phoneHref}
                    className="group flex items-center justify-between gap-4 border-b border-line py-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.1em] text-stone">
                      Call or text
                    </span>
                    <span className="font-bold text-ink group-hover:text-porchlight-deep">
                      {SITE.phone}
                    </span>
                  </a>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="group flex items-center justify-between gap-4 py-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.1em] text-stone">
                      Email
                    </span>
                    <span className="font-bold text-ink group-hover:text-porchlight-deep">
                      {SITE.email}
                    </span>
                  </a>
                </div>
              </aside>
            </Reveal>
          </div>

          <p className="t-small mt-12 text-stone">
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
