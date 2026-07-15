import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Service } from "@/lib/services";

/** Renders nothing until a walkthrough is attached to the service (`video` in the content
 * file). The VideoObject JSON-LD switches on from the same field, so recording a HeyGen or
 * Higgsfield walkthrough is a content edit and never a code change.
 *
 * No poster-with-a-fake-play-button placeholder: an empty state pretending to be a video
 * is the single most obvious "this page is scaffolding" tell there is. */
export function VideoBlock({ service }: { service: Service }) {
  const v = service.video;
  if (!v) return null;

  return (
    <section id="watch-it" className="scroll-mt-24 bg-mist py-16 md:py-24" aria-labelledby="video-heading">
      <div className="mx-auto max-w-5xl px-4 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="Watch it" align="center" as="h2">
            <span id="video-heading">{v.name}</span>
          </SectionHeading>
        </Reveal>
        <Reveal delay={120} className="mt-10">
          <figure>
            <video
              controls
              preload="none"
              poster={v.thumbnailUrl}
              className="aspect-video w-full border border-[#dddddd] bg-ink"
            >
              <source src={v.contentUrl} type="video/mp4" />
            </video>
            <figcaption className="mt-4 text-center text-sm leading-relaxed text-stone">
              {v.description}
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
