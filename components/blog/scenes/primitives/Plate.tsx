import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";

/** PRIMITIVE — one photograph, held.
 *
 * WHY THIS EXISTS. The first flagship shipped with two images in a 1,900 word piece, both of
 * them furniture: an atmospheric wash behind the cold open and a portrait in the author block.
 * Its own scorecard called that out and left points on the table for it, with the middle third
 * of the article carrying no picture at all. This is the fix, as a primitive rather than as a
 * one-off, so every topic gets the same option for the price of a payload.
 *
 * A photograph alone would be decoration, and a scene that is decoration does not deserve a
 * band. So `caption` is required and is expected to do real work: name the place, ground the
 * abstraction, say the thing the prose cannot say without slowing down. The picture is the
 * pause; the caption is why the pause was worth taking.
 *
 * `alt` is real alt text, not the empty string the cold open uses. That image is atmosphere
 * behind type and is correctly hidden; this one IS content, and hiding content from a screen
 * reader to save a sentence is not a saving.
 *
 * The frame matches the Film primitive deliberately (same radius, same light-catch inset), so
 * the two media bands read as the same object at different durations rather than as two
 * different design systems on one page.
 */
export function Plate({
  band,
  src,
  alt,
  caption,
  credit,
  ariaLabel,
}: {
  band: "dark" | "light";
  src: string;
  alt: string;
  caption: string;
  credit: string;
  ariaLabel: string;
}) {
  const dark = band === "dark";

  return (
    <section
      className={dark ? "bg-ink py-20 text-paper md:py-28" : "bg-mist py-20 md:py-28"}
      aria-label={ariaLabel}
    >
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal>
          <figure>
            <div
              className={`relative aspect-[16/9] overflow-hidden rounded-[14px] md:aspect-[21/9] ${
                dark
                  ? "bg-[#0a0a0a] shadow-[inset_0_1px_0_rgb(255_255_255/0.07)]"
                  : "bg-[#dfe4ea]"
              }`}
            >
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 1152px) 100vw, 1152px"
                className="object-cover"
              />
            </div>
            <figcaption
              className={`mt-5 max-w-2xl text-sm leading-relaxed ${dark ? "text-paper/60" : "text-stone"}`}
            >
              {caption}{" "}
              <span className={dark ? "text-paper/35" : "text-stone/70"}>{credit}</span>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
