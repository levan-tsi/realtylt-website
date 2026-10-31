import Image from "next/image";
import Link from "next/link";

/** The author block.
 *
 * Google's expertise questions ask, almost word for word, whether the content presents
 * information "in a way that makes you want to trust it, such as clear sourcing, evidence of
 * the expertise involved, background about the author or the site that publishes it, such as
 * through links to an author page or a site's About page". The flagship had a bare name string
 * and no link anywhere, which is a straight miss on a checkable criterion.
 *
 * It also puts the first real photograph of a person on the page: the human should be visible.
 *
 * ROUND 15 (2026-10-31, the owner: "At the end of the blogs, should we put my name, email and
 * number, if they wanted to contact me?"). Until then every post printed the chat assistant's
 * paragraph ("I built the assistant described in this post"), including the seller disclosure
 * guide, which describes no assistant. Now the card speaks per cluster:
 *  - a RealtyLT post (buying, selling, owning, moving, investing; `consumer`, the same split as
 *    "Keep reading", lib/blog/related.ts isConsumer) carries his standing as a Realtor® and
 *    licensed real estate salesperson with his brokerage. Never "broker": he is not one
 *    (AuthorCard.test.ts holds it);
 *  - an AI post carries the assessments;
 *  - the chat assistant's own paragraph survives only on the post it describes.
 * Every card ends on the same contact row: his direct number (914) 875-2424, the number on
 * everything a client sees, his email, and the consultation booking on /connect. */

/** The one post whose subject is the assistant this card used to describe on every page. */
export const CHAT_ASSISTANT_SLUG = "ai-chat-assistant-real-estate-website";

export const AUTHOR_CONTACT = {
  phone: "(914) 875-2424",
  phoneHref: "tel:+19148752424",
  email: "levan@realtylt.com",
} as const;

export function authorCardCopy({ slug, consumer }: { slug: string; consumer: boolean }) {
  if (consumer) {
    return {
      standing: "Realtor®, licensed real estate salesperson, United RE Hudson Valley Edge",
      body: "I help people sell and buy homes from Poughkeepsie through the five boroughs, and I write these guides from the paperwork I go through with my own clients. If a question here touches your own home, call or write and I will go through it with you.",
    };
  }
  return {
    standing: "Runs RealtyLT and the AI assessments for small businesses",
    body:
      slug === CHAT_ASSISTANT_SLUG
        ? "I built the assistant described in this post. It answers on our own site every night, connected to the live MLS feed, and everything here comes from watching what it gets right and what it gets wrong."
        : "I run the assessments myself: I sit with the owner, find the hours a system can give back to the team, and write the plan. The work makes a team faster; it never replaces the people on it.",
  };
}

const LINK = "text-river underline underline-offset-4 transition-colors hover:text-porchlight-deep";
const CONTACT =
  "inline-flex min-h-11 items-center text-base font-semibold text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:text-river hover:decoration-river focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-river";

export function AuthorCard({ author, slug, consumer }: { author: string; slug: string; consumer: boolean }) {
  const copy = authorCardCopy({ slug, consumer });
  return (
    <aside className="mt-16 border-t border-line pt-8" aria-label={`About ${author}`}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-mist">
          <Image
            src="/images/levan-portrait.jpg"
            alt={`${author}, RealtyLT`}
            fill
            sizes="64px"
            className="object-cover grayscale"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone">Written by</p>
          <p className="mt-1.5 text-lg font-bold leading-snug text-ink">
            {author === "Levan Tsiklauri" ? `${author} (LT)` : author}
          </p>
          <p className="mt-1 text-base leading-snug text-ink-soft">{copy.standing}</p>
          <p className="mt-3 max-w-2xl text-base leading-[1.75] text-stone">
            {copy.body}
            {slug === CHAT_ASSISTANT_SLUG && (
              <>
                {" "}
                <Link href="/ai#chat" className={LINK}>
                  Go and talk to it
                </Link>{" "}
                if you would rather test the claim than take it.
              </>
            )}
          </p>
          <ul className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1" aria-label={`Contact ${author}`}>
            <li>
              <a href={AUTHOR_CONTACT.phoneHref} className={CONTACT}>
                {AUTHOR_CONTACT.phone}
              </a>
            </li>
            <li className="min-w-0">
              <a href={`mailto:${AUTHOR_CONTACT.email}`} className={CONTACT}>
                {AUTHOR_CONTACT.email}
              </a>
            </li>
            <li>
              <Link href="/connect" className={CONTACT}>
                Book a consultation
              </Link>
            </li>
          </ul>
          <p className="mt-3 text-base">
            <Link href="/who-we-are" className={`inline-flex min-h-11 items-center ${LINK}`}>
              More about Levan and RealtyLT
            </Link>
          </p>
        </div>
      </div>
    </aside>
  );
}
