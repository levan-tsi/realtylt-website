"use client";

import { useCallback, useEffect, useState } from "react";
import { HeroDepth } from "@/components/lab/HeroDepth";
import { HeroOpening } from "@/components/lab/HeroOpening";
import { HeroValley, type ValleyPoint } from "@/components/lab/HeroValley";
import { HeroTraverse, type TraverseHome } from "@/components/lab/HeroTraverse";

/** THE LAB, rebuilt as a place to JUDGE from rather than a page to read.
 *
 * Owner, 2026-08-02, pointing at the deployed lab: "this pages still look like shit the demo
 * pages." He was right, and the fault was mine rather than the heroes'. The old lab was a white
 * document with a paragraph of my argument stacked above each hero, the site's own header,
 * footer and chat launcher sitting on top of them, and four heroes you had to SCROLL between.
 * Every one of those things works against the only job the page has:
 *
 *   · a dark, atmospheric hero on a bright white page reads as a screenshot pasted into a memo,
 *     not as the top of a website;
 *   · the site chrome overlays the very frame you are trying to judge (the chat launcher sits
 *     exactly where the hero's bottom-right is);
 *   · an essay above each one tells you what to think before you have looked;
 *   · and scrolling between candidates is the wrong comparison — by the time the next one is on
 *     screen you are remembering the last, not seeing it.
 *
 * So: one full-bleed stage at the real size, dark surround, no chrome, and the variants SWAP IN
 * PLACE. Same frame, same position, instant A/B — which is the only way a difference this
 * subtle is judgeable. The argument still exists, behind a toggle, where it belongs: after you
 * have made up your own mind.
 *
 * Keys: 1-4 switch, R replays the entrance, W toggles the argument. */

export interface Variant {
  key: string;
  letter: string;
  name: string;
  thesis: string;
  cost: string;
  weakness: string;
}

export const VARIANTS: Variant[] = [
  {
    key: "opening",
    letter: "D",
    name: "The Opening",
    thesis:
      "A title sequence, then light that follows you. The photograph settles out of an over-scale, a warm light blooms out of the valley, a hairline draws across the frame, and the three lines of copy rise in sequence — 1.9 seconds, once. After that a large, very soft warm pool follows the pointer and the valley WARMS where you look.",
    cost: "No new asset, no data, no canvas, no dependency. The photograph is painted immediately and only ever transformed, so the LCP element is untouched.",
    weakness:
      "It is a mood, not a fact about RealtyLT — B is the only variant a competitor could not copy. And the warm pool is strongest over vegetation; a faint additive core is what keeps it alive over sky, and that core has to stay faint or it reads as a torch.",
  },
  {
    key: "depth",
    letter: "A",
    name: "Depth",
    thesis:
      "The photograph we already own, stopped being flat. The picture, the valley haze and the type sit on three planes that answer the pointer at different rates. Nothing else changes.",
    cost: "Cheapest and safest: no new data, no canvas, no dependency.",
    weakness: "It is nice, not memorable. Any good agency site could have it, and it says nothing about RealtyLT.",
  },
  {
    key: "valley",
    letter: "B",
    name: "The Valley",
    thesis:
      "Every active listing we hold, at its real coordinates — thousands of points of light over the Hudson Valley. The field parallaxes with the pointer and the nearest home names itself with its price and town.",
    cost: "Canvas 2D, no Three.js, no dependency. One extra query at revalidate time.",
    weakness:
      "The riskiest to get exactly right — a field like this becomes a screensaver the moment the motion is too visible — and it moves the hero away from photography, which is a real trade for a property business.",
  },
  {
    key: "traverse",
    letter: "C",
    name: "Traverse",
    thesis:
      "One house, and the mouse changes it. Moving across the frame travels through real homes we are selling, each cross-fading into the next with its address and price.",
    cost: "Low, with one hard rule: only homes whose photos are already mirrored into our own Storage, preloaded once, never on pointer move.",
    weakness:
      "Listing-agent photography varies wildly. Curating eight good ones is easy; keeping them good automatically, for ever, is not.",
  },
];

function Copy({ tone = "light", rule = false }: { tone?: "light" | "dark"; rule?: boolean }) {
  return (
    <div className="flex h-full flex-col justify-end px-8 pb-14 lg:px-14 lg:pb-16">
      {/* The hairline belongs to variant D. It sits IN the stack, directly above the eyebrow,
          rather than at a fixed offset from the bottom — it was `bottom-[210px]`, which was fine
          in a 620px demo frame and drew straight through "Let's Find Home" the moment the stage
          became a real full-height hero. Anything positioned by a magic number against a viewport
          it has never been tested at is a bug waiting for a bigger screen. */}
      {rule && <div aria-hidden className="rlt-rule mb-6 h-px w-full origin-left bg-paper/25" />}
      <p className={`t-eyebrow ${tone === "dark" ? "text-paper/60" : "text-paper/70"}`}>
        Hudson Valley &amp; New York City
      </p>
      <h2 className="t-display mt-4 text-paper">
        Let&rsquo;s Find <strong>Home</strong>
      </h2>
      <div className="mt-7 flex w-full max-w-[520px] items-center gap-2 rounded-xl border border-paper/30 bg-black/45 p-1.5 backdrop-blur-[2px]">
        <span className="w-full px-4 py-2.5 text-sm text-paper/60">Search for Homes</span>
        <span className="shrink-0 rounded-lg bg-paper px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-ink">
          Search
        </span>
      </div>
    </div>
  );
}

export function HeroStage({ points, homes }: { points: ValleyPoint[]; homes: TraverseHome[] }) {
  const [active, setActive] = useState(0);
  const [run, setRun] = useState(0); // bumping this re-mounts the hero, which replays its entrance
  const [why, setWhy] = useState(false);
  const v = VARIANTS[active];

  const pick = useCallback((i: number) => {
    setActive(i);
    setRun((r) => r + 1);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= VARIANTS.length) pick(n - 1);
      else if (e.key.toLowerCase() === "r") setRun((r) => r + 1);
      else if (e.key.toLowerCase() === "w") setWhy((w) => !w);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pick]);

  const hero =
    v.key === "opening" ? (
      <HeroOpening src="/images/hero/valley-aerial.jpg">
        <Copy tone="dark" rule />
      </HeroOpening>
    ) : v.key === "depth" ? (
      <HeroDepth src="/images/hero/valley-aerial.jpg">
        <Copy />
      </HeroDepth>
    ) : v.key === "valley" ? (
      <HeroValley points={points}>
        <Copy tone="dark" />
      </HeroValley>
    ) : (
      <HeroTraverse homes={homes}>
        <Copy tone="dark" />
      </HeroTraverse>
    );

  return (
    <div className="relative min-h-[100svh] w-full bg-[#08080a]">
      {/* Hide the real site's chrome: on a page whose only job is to judge a hero, the header,
          the footer and the chat launcher are all sitting ON the thing being judged. */}
      <style>{`
        header, footer { display: none !important }
        [aria-label="Open RealtyLT chat"], #rlt-chat-widget, .rlt-chat-launcher { display: none !important }
        body { background: #08080a }
      `}</style>

      {/* THE STAGE — the hero at the size it will really be, and nothing else in the frame. */}
      <div className="relative h-[100svh] w-full overflow-hidden">
        <div key={`${v.key}-${run}`} className="h-full w-full">
          {hero}
        </div>

        {/* Identity, quiet, top-left — so you always know which one you are looking at without
            it competing with the hero's own type. */}
        <div className="pointer-events-none absolute left-8 top-7 z-20 lg:left-14">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-paper/45">Hero lab</p>
          <p className="mt-1.5 font-display text-lg text-paper/90">
            <span className="text-paper/45">{v.letter}</span> &nbsp;{v.name}
          </p>
        </div>

        {/* THE SWITCHER. Bottom-right, out of the hero copy's way (which lives bottom-left), and
            z-40 so it floats ABOVE the argument panel — at z-20 the panel covered its own Hide
            button, so opening the argument trapped you there with no way back except the keyboard. */}
        <div className="absolute bottom-7 right-8 z-40 flex flex-wrap items-center justify-end gap-1.5 lg:right-14">
          {VARIANTS.map((x, i) => (
            <button
              key={x.key}
              type="button"
              onClick={() => pick(i)}
              aria-pressed={i === active}
              className={`rounded-full border px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] backdrop-blur-[2px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper ${
                i === active
                  ? "border-paper/0 bg-paper text-ink"
                  : "border-paper/25 bg-black/35 text-paper/75 hover:border-paper/50 hover:text-paper"
              }`}
            >
              <span className="opacity-50">{x.letter}</span> {x.name}
            </button>
          ))}
          <span aria-hidden className="mx-1 h-5 w-px bg-paper/20" />
          <button
            type="button"
            onClick={() => setRun((r) => r + 1)}
            title="Replay the entrance (R)"
            className="rounded-full border border-paper/25 bg-black/35 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-paper/75 backdrop-blur-[2px] transition-colors hover:border-paper/50 hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
          >
            Replay
          </button>
          <button
            type="button"
            onClick={() => setWhy((w) => !w)}
            aria-expanded={why}
            title="The argument (W)"
            className="rounded-full border border-paper/25 bg-black/35 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-paper/75 backdrop-blur-[2px] transition-colors hover:border-paper/50 hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
          >
            {why ? "Hide" : "Why"}
          </button>
        </div>

        {/* THE ARGUMENT, behind a toggle — available after you have made up your own mind, never
            before. Honest weakness gets equal billing with the pitch, deliberately. */}
        <div
          className={`absolute inset-x-0 bottom-0 z-30 border-t border-paper/10 bg-black/85 backdrop-blur-md transition-transform duration-500 ${
            why ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto grid max-w-[1250px] gap-8 px-8 pb-24 pt-9 md:grid-cols-3 lg:px-14">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-paper/40">What it is</p>
              <p className="mt-3 text-sm leading-relaxed text-paper/85">{v.thesis}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-paper/40">What it costs</p>
              <p className="mt-3 text-sm leading-relaxed text-paper/70">{v.cost}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-paper/40">Where it is weak</p>
              <p className="mt-3 text-sm leading-relaxed text-paper/70">{v.weakness}</p>
            </div>
          </div>
        </div>
      </div>

      {/* One quiet line under the fold. Nothing here is live, and that should be impossible to
          misread on a page that looks exactly like the real site. */}
      <div className="mx-auto max-w-[1250px] px-8 py-10 lg:px-14">
        <p className="text-xs leading-relaxed text-paper/40">
          Nothing on this page is live — the site still plays the Vimeo clip. Move the mouse across
          the frame; press <b className="text-paper/70">1&ndash;4</b> to switch,{" "}
          <b className="text-paper/70">R</b> to replay the entrance, <b className="text-paper/70">W</b> for the
          argument.
        </p>
      </div>
    </div>
  );
}
