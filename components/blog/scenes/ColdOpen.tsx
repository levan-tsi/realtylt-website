import Link from "next/link";
import { ShareRow } from "@/components/blog/ShareRow";

/** SCENE 1 — the cold open.
 *
 * The flagship replaces the standard article hero with a single held moment: a porch light
 * still on at 11:40pm. One image, one accent, and a lot of dark. It is built to work as a
 * STILL as much as a page: this frame is the carousel cover and the video's first frame, so
 * nothing here depends on motion to read.
 *
 * The light itself is the only animated element (a slow 9s breath). The global
 * prefers-reduced-motion block in globals.css collapses it to a steady glow.
 */
export function ColdOpen({
  title,
  excerpt,
  author,
  dateLabel,
  dateTime,
  minutes,
  url,
}: {
  title: string;
  excerpt: string;
  author: string;
  dateLabel: string;
  dateTime: string;
  minutes: number;
  url: string;
}) {
  return (
    <header
      data-band="dark"
      className="cold-open relative isolate flex min-h-[82vh] items-center overflow-hidden bg-ink text-paper md:min-h-[88vh]"
    >
      <style>{`
        @keyframes cold-open-breath {
          0%, 100% { opacity: 0.62; }
          50%      { opacity: 1; }
        }
        .cold-open-glow { animation: cold-open-breath 9s ease-in-out infinite; }
      `}</style>

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

        {/* The moment. "PM" is the one place the accent appears in this scene. The light sits
            in this block so it tracks the numerals at every width. */}
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
              11:40
            </span>
            <span className="text-base font-normal uppercase tracking-[0.28em] text-porchlight md:text-xl">
              pm
            </span>
          </p>
        </div>

        <div aria-hidden className="rise rise-3 mt-10 h-px w-full max-w-3xl bg-white/12 md:mt-12" />

        <h1 className="rise rise-3 mt-9 max-w-3xl text-3xl font-light leading-[1.14] tracking-[-0.01em] md:mt-10 md:text-[42px]">
          {title}
        </h1>

        {excerpt && (
          <p className="rise rise-4 mt-5 max-w-2xl text-lg leading-relaxed text-paper/70">{excerpt}</p>
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
        </div>

        <div className="rise rise-5 mt-6">
          <ShareRow url={url} title={title} tone="light" />
        </div>
      </div>

      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
    </header>
  );
}
