import Image from "next/image";
import Link from "next/link";
import { ShareRow } from "@/components/blog/ShareRow";

/** SCENE 1 — the cold open.
 *
 * The flagship replaces the standard article hero with a single held moment (the seller
 * disclosure guide: 56 questions). One image, one accent, and a lot of dark. It is built to
 * work as a STILL as much as a page, so nothing here depends on motion to read.
 *
 * PER TOPIC, the moment is the only thing that changes, so it is the only thing that is a
 * prop. The one animated element is the porch light: a slow 9s breath on the glow behind the
 * numerals, a light left on.
 */
export function ColdOpen({
  title,
  excerpt,
  author,
  dateLabel,
  dateTime,
  minutes,
  url,
  updatedLabel,
  updatedTime,
  moment = "11:40",
  suffix = "pm",
  photo = "/images/hero/hudson-twilight.jpg",
}: {
  title: string;
  excerpt: string;
  author: string;
  dateLabel: string;
  dateTime: string;
  minutes: number;
  url: string;
  updatedLabel?: string;
  updatedTime?: string;
  moment?: string;
  suffix?: string;
  photo?: string;
}) {
  return (
    <header
      data-band="dark"
      className="daylight cold-open relative isolate flex min-h-[82vh] items-center overflow-hidden bg-ink text-paper md:min-h-[88vh]"
    >
      <style>{`
        @keyframes cold-open-breath {
          0%, 100% { opacity: 0.62; }
          50%      { opacity: 1; }
        }
        .cold-open-glow { animation: cold-open-breath 9s ease-in-out infinite; }

        /* The photograph is atmosphere, not a picture to look at, so it is masked away from
           the type rather than sat behind it. On a phone it fades downward out of the top;
           on desktop it fills the right half the composition was leaving empty and fades
           leftward before it reaches the numerals. */
        .cold-open-photo {
          -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0.9), transparent 62%);
                  mask-image: linear-gradient(to bottom, rgba(0,0,0,0.9), transparent 62%);
        }
        @media (min-width: 768px) {
          .cold-open-photo {
            -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,0.95), transparent 58%);
                    mask-image: linear-gradient(to left, rgba(0,0,0,0.95), transparent 58%);
          }
        }
      `}</style>

      {/* Atmosphere, not a picture to look at. Every option is already licensed and logged
          in public/images/ATTRIBUTIONS.md, so a topic swapping the plate takes on no new
          asset obligation. */}
      <div aria-hidden className="cold-open-photo pointer-events-none absolute inset-0 -z-20 opacity-45">
        <Image
          src={photo}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* A wide ambient wash so the black is lit rather than flat. The porch light proper is
          anchored to the numerals below, not to the viewport — centring it on the section put
          the light in the empty right half, beside the thing it is supposed to be lighting. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(75% 60% at 32% 38%, rgba(40,168,224,0.10), transparent 72%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-20 md:py-24 lg:px-8">
        <nav aria-label="Breadcrumb" className="rise text-xs uppercase tracking-[0.14em] text-paper/50">
          <Link href="/" className="inline-block py-1 transition-colors hover:text-paper">
            Home
          </Link>
          <span aria-hidden className="px-2 text-paper/25">
            /
          </span>
          <Link href="/blog" className="inline-block py-1 transition-colors hover:text-paper">
            Blog
          </Link>
        </nav>

        {/* The moment. The suffix is the one place the accent appears in this scene. The
            glow sits in this block so it tracks the numerals at every width. */}
        <div className="rise rise-2 relative mt-14 w-fit md:mt-16">
          <div
            aria-hidden
            className="cold-open-glow pointer-events-none absolute -inset-x-24 -inset-y-20 -z-10"
            style={{
              background: "radial-gradient(50% 50% at 50% 50%, rgba(40,168,224,0.22), transparent 70%)",
            }}
          />
          <p className="flex items-baseline gap-3 md:gap-5">
            <span
              className="font-light leading-[0.85] tracking-[-0.045em] text-paper"
              style={{ fontSize: "clamp(4.5rem, 15vw, 11rem)" }}
            >
              {moment}
            </span>
            <span className="text-base font-normal uppercase tracking-[0.28em] text-porchlight md:text-xl">
              {suffix}
            </span>
          </p>
        </div>

        <div aria-hidden className="rise rise-3 mt-10 h-px w-full max-w-3xl bg-white/12 md:mt-12" />

        {/* data-toc-after: the title block the "On this page" pill waits to see scrolled past
            (lib/toc/past-title.ts, round 66). */}
        <h1 data-toc-after="" className="t-h1 rise rise-3 mt-9 max-w-3xl md:mt-10">
          {title}
        </h1>

        {excerpt && (
          <p data-toc-after="" className="rise rise-4 mt-5 max-w-2xl text-lg leading-relaxed text-paper/70">{excerpt}</p>
        )}

        <div className="rise rise-4 mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-paper/65">
          <span className="text-paper/90">{author}</span>
          <span aria-hidden className="text-paper/25">
            /
          </span>
          <time dateTime={dateTime}>{dateLabel}</time>
          <span aria-hidden className="text-paper/25">
            /
          </span>
          <span>{minutes} min read</span>
          {updatedLabel && updatedTime && (
            <>
              <span aria-hidden className="text-paper/25">
                /
              </span>
              {/* Freshness is a ranking and citation signal, but only an honest one counts:
                  this renders solely when the post actually carries a revision date. */}
              <span className="text-paper/80">
                Updated <time dateTime={updatedTime}>{updatedLabel}</time>
              </span>
            </>
          )}
        </div>

        <div className="rise rise-5 mt-6">
          <ShareRow url={url} title={title} tone="light" />
        </div>
      </div>

      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
    </header>
  );
}
