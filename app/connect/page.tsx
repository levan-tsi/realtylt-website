import type { Metadata } from "next";
import Image from "next/image";
import { ConnectFormModal } from "@/components/leads/ConnectFormModal";
import { BookingFrame } from "@/components/site/BookingFrame";
import { ContactRow } from "@/components/site/ContactRow";
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

const PHONE_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

const MAIL_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
    <path d="m3.2 6.2 7.9 5.4a1.6 1.6 0 0 0 1.8 0l7.9-5.4" />
  </svg>
);

/* ── THE PHOTO HERO IS GONE, and this is the reason (owner-directed, 2026-08-24).
 *
 * What was here: a full-bleed grayscale photograph of Millerton after dark under a black/55
 * scrim, an eyebrow, a headline, and an outline phone button — 500px tall at 1440 and the WHOLE
 * fold at 390. It was the same photograph the owner had already rejected on /thank-you, and it
 * cost this page the only thing it is for. Measured on the page it replaced: at 390 the portrait
 * did not begin until roughly 1,000px down and the booking calendar not until roughly 2,400px. A
 * visitor on a phone travelled three screens to reach the calendar, on the page whose job is
 * "reach Levan, now".
 *
 * What replaces it is not a smaller hero. It is the page's own content, raised: who he is, the
 * two contacts, and the calendar, inside the first screen at every width. The apple-design lens
 * names each move:
 *
 *  - HIERARCHY FROM ORDER, SPACING AND CONTRAST, not from a photograph. The h1 is the largest
 *    thing on the page; the two contacts are the largest CONTROLS; everything else is quiet.
 *  - GROUPING AND MAPPING: a control sits next to what it affects. The headline names three
 *    things in the order you meet them ("Call, email, or book a time"); the two contact rows are
 *    directly under it; the calendar carries its own visible heading; and the two fallbacks (the
 *    embed failed / I do not want a slot) sit UNDER the calendar, which is where a person who has
 *    decided against it actually is. The message trigger used to sit above the calendar, where
 *    nobody had yet formed the opinion it answers.
 *  - SIMPLICITY, NOT MINIMALISM. Nothing was removed except the photograph and its scrim. The
 *    portrait, the name, the credential, the number, the email, the office address, the
 *    call-or-text sentiment, the modal, the direct booking link and the frame's own focus ring
 *    are all still here.
 *  - RESTRAINT. Paper and ink, one photograph (his), one hairline, no translucency, no new
 *    colour. The controls are bordered paper that fill with mist under the cursor.
 *
 * NO REVEAL ON THIS BLOCK, deliberately. .reveal starts at opacity 0 and waits for an
 * IntersectionObserver; that is right for a section you scroll to and wrong for the first screen
 * of a contact page, where it puts the phone number behind JavaScript for no gain.
 */
export default function ConnectPage() {
  return (
    <section className="sec-sm bg-paper" aria-labelledby="connect-hero">
      <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
        <p className="t-eyebrow text-stone">Seven days a week</p>
        {/* A statement in the house voice, sentence case, and a map of the page: the three things
            it names are the three things beneath it, in that order. */}
        <h1 id="connect-hero" className="t-h1 mt-4 text-ink">
          Call, email, or <strong>book a time</strong>.
        </h1>

        <div className="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-16">
          {/* The left column is sticky above lg because the calendar is 899px tall and this
              column is about half that. It used to leave a 400px hole beside the embed, and it
              keeps the number and the email in view for the whole length of the booking flow
              instead. */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            {/* ROUND 39, the owner's two sentences: "texts are one in the middle one starts from
                the left" and "bring google appointments higher... my picture next to google
                in-person strategy session text same level." The embed centers everything and
                cannot be restyled; cropping its list-view header off is not safe either, because
                the SECOND screen (the date picker) puts the session title and details in that
                same top band (measured 2026-08-24 by driving the booking URL directly). So the
                column reorders instead:
                 - The two contact rows come FIRST. The h1 directly above reads "Call, email, or
                   book a time" — the two controls now sit under the two words that name them,
                   and the third clause maps to the calendar column beside them.
                 - The portrait card moves DOWN to the level the embed's own header forces on its
                   session cards: mt-16 puts the portrait top at ~216px from the column top, which
                   is where "In-Person Real Estate Strategy Session" renders (header ≈ 200px +
                   16px card padding, measured against the live embed). His picture and the
                   session cards now share one optical band, his verbatim ask.
                 - His face still appears twice (ours + Google's small avatar) but no longer at
                   the same altitude, which was the r38 objection to the stacked card. */}
            <address className="not-italic">
              <ContactRow
                href={SITE.phoneHref}
                label="Call or text"
                value={SITE.phone}
                gaCategory="Phone"
                gaLabel="connect-top"
                icon={PHONE_ICON}
              />
              <div className="mt-3">
                <ContactRow
                  href={`mailto:${SITE.email}`}
                  label="Email"
                  value={SITE.email}
                  gaCategory="Email"
                  gaLabel="connect-top"
                  icon={MAIL_ICON}
                />
              </div>
            </address>

            {/* mt-16 only above lg, where it is the level-tuning constant; on a phone the column
                is a stack and every spare pixel above the calendar costs a thumb-scroll. */}
            <div className="mt-8 flex items-center gap-5 lg:mt-16">
              <Image
                src="/images/levan-portrait.jpg"
                alt="Levan Tsiklauri, investor and REALTOR® at RealtyLT"
                // The file is a true 3:4 (3024x4032) and both rendered boxes are 3:4, so the
                // intrinsic ratio is honoured at either size and nothing is stretched. Declaring
                // both dimensions is what reserves the box before the bytes arrive.
                width={336}
                height={448}
                // priority: this is inside the first viewport at every width now.
                priority
                // Greyscale to match every other photograph on the site, including the SAME
                // portrait on /who-we-are.
                // 96x128 on a phone and 132x176 from sm up. Both are exactly 3:4, and the smaller
                // one is not a taste call: at 320 the name block beside it needs about 170px for
                // "INVESTOR & REALTOR®" at the eyebrow's tracking, and 96 + 20 + 170 is the whole
                // 288px column.
                className="h-32 w-24 shrink-0 rounded-2xl object-cover grayscale sm:h-44 sm:w-[132px]"
              />
              <div>
                <p className="t-h3 text-ink">Levan Tsiklauri</p>
                <p className="t-eyebrow mt-2 text-stone">Investor &amp; REALTOR&reg;</p>
              </div>
            </div>

            {/* The office address is now a DIRECTIONS link (launch-list quick win, 2026-08-24):
                on a phone it opens the Maps app pointed at the office instead of being four
                dead words. Same quiet voice as the page's other text links. */}
            <p className="t-small mt-6 text-stone">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  `${SITE.address.street}, ${SITE.address.locality}, ${SITE.address.region} ${SITE.address.postalCode}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-6 items-center underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
              >
                {SITE.address.street}, {SITE.address.locality}, {SITE.address.region}{" "}
                {SITE.address.postalCode}
              </a>
            </p>
          </div>

          <div>
            {/* Back to sr-only (round 39). Visible, this left-aligned serif heading sat directly
                against the embed's centered sans header — the owner's "texts are one in the
                middle one starts from the left". The embed's own header labels the calendar the
                moment it paints, the h1's third clause already says "book a time", and removing
                the visible line lifts the appointments ~48px at every width, which was his other
                ask. The heading itself stays for document structure. */}
            <h2 id="appointments-heading" className="sr-only">
              Pick a slot
            </h2>
            {/* An iframe is a tab stop with no ring of its own, and the platform will not give it
                one: focusing it hands focus to the EMBEDDED document, so neither :focus-visible
                nor :focus-within ever matches out here. BookingFrame carries the measurement and
                draws the site's ring around the frame instead. */}
            {/* Height is per-width because the embed's own content is: measured by loading the
                booking URL directly, it needs 1031px at 390 (the three appointment cards stack)
                and 900px from 768 up. The old flat 899 clipped the third card mid-sentence on a
                phone. */}
            <BookingFrame
              src={BOOKING_EMBED_URL}
              title="Book an appointment with Levan Tsiklauri (Google Calendar)"
              className="block h-[1040px] w-full border-0 md:h-[899px]"
            />

            {/* THE TWO FALLBACKS, both after the thing they are a fallback FOR. The first answers
                "the embed is broken"; the second answers "I do not want to pick a slot", which is
                an opinion a visitor forms by looking at the grid rather than before seeing it.
                The button opens the SAME modal the listing pages use and the SAME LeadForm the
                footer runs, so the consent contract is the one the owner decided rather than a
                second copy of it. */}
            <p className="t-fine mt-4 text-stone">
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
            <div className="mt-8 border-t border-line pt-8">
              {/* THE SENTENCE'S OWN WORDS ARE THE CONTROL. Above lg the contact card is sticky,
                  so "call or text" points at a phone number still on screen; on a phone it does
                  not, and this line sat about 1,900px below the number it was recommending. The
                  three words that name the action carry it instead — no new control, no second
                  copy of the number, and the tightest mapping available. Deliberately NOT
                  gtag-tracked: the two rows at the top already fire the "Phone" event, and a
                  third entry point would count one visitor's single intent twice. */}
              <p className="t-small max-w-[46ch] text-stone">
                Would rather not pick a slot?{" "}
                <a
                  href={SITE.phoneHref}
                  className="inline-flex min-h-6 items-center font-bold text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
                >
                  Call or text
                </a>{" "}
                and we&rsquo;ll find a time. Evenings and weekends included.
              </p>
              <ConnectFormModal />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
