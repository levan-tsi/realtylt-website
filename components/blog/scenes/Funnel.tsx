import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

/** SCENE 9 — the close.
 *
 * Carries the article's own last line, which is already the strongest close it could have, and
 * puts the two real next steps under it: talk to the live assistant, or read how it is built.
 * The porch light returns here so the piece bookends on the image it opened with.
 *
 * This scene REPLACES the generic "Ask us" band on the flagship (see app/blog/[slug]/page.tsx).
 * Two dark call-to-action blocks in a row would cancel each other out; the reader gets one
 * ending, not two.
 *
 * The primary action is deliberately the LIVE assistant rather than a contact form. The whole
 * post argues that being answered immediately is the thing that matters, so the close has to
 * offer exactly that, not a form that replies tomorrow.
 */
export function Funnel() {
  return (
    <section className="relative isolate overflow-hidden bg-ink py-28 text-paper md:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(60% 60% at 28% 46%, rgba(40,168,224,0.15), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal>
          <p className="max-w-3xl text-2xl font-light leading-[1.3] tracking-[-0.015em] md:text-[38px] md:leading-[1.24]">
            The buyer at 11:40pm is not coming back tomorrow to check whether you replied. They are
            going to be at somebody{"'"}s open house on Saturday. The only real question is whose.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 flex flex-wrap gap-3 md:mt-14">
            <Button href="/ai#chat" variant="light">
              Talk to it right now
            </Button>
            <Button href="/services/ai-chat-assistant" variant="outline-light">
              See how it is built
            </Button>
          </div>
          <p className="mt-6 text-sm text-paper/55">
            Ask it something hard. It will either answer, or tell you it cannot and offer to book a
            call.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
