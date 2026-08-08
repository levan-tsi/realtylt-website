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
 * It also puts the first real photograph of a person on the page, which matters for a piece
 * arguing that a machine should hand off to a human: the human should be visible.
 *
 * The claim to expertise here is first-hand and verifiable rather than a bio boast: we built
 * this, it is running, and you can go talk to it.
 */
export function AuthorCard({ author }: { author: string }) {
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
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone">
            Written by
          </p>
          <p className="mt-1.5 text-lg font-bold leading-snug text-ink">{author}</p>
          <p className="mt-3 max-w-2xl leading-[1.75] text-stone">
            I run RealtyLT in the Hudson Valley and I built the assistant described in this post.
            It answers on our own site every night, connected to the live MLS feed, and everything
            here comes from watching what it gets right and what it gets wrong.{" "}
            <Link
              href="/ai#chat"
              className="text-river underline underline-offset-4 transition-colors hover:text-porchlight-deep"
            >
              Go and talk to it
            </Link>{" "}
            if you would rather test the claim than take it.
          </p>
          <p className="mt-4 text-sm">
            <Link
              href="/who-we-are"
              className="text-river underline underline-offset-4 transition-colors hover:text-porchlight-deep"
            >
              More about {author} and RealtyLT
            </Link>
          </p>
        </div>
      </div>
    </aside>
  );
}
