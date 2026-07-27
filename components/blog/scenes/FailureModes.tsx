import { FAILURE_MODES } from "@/content/blog/ai-chat-scenes";
import { Reveal } from "@/components/ui/Reveal";

/** SCENE 6 — where it goes wrong.
 *
 * REPLACES the bullet list that used to sit under "Where it goes wrong", same rule as the
 * four moves: the scene carries the text, so it is never read twice.
 *
 * This exists to break the one long stretch left in the piece: the objections / failure
 * modes / what-to-do run was 1350px of unbroken prose, the only place a reader could drift.
 *
 * NOT the storyboard's flow diagram, which was the original plan for this stretch. That
 * diagram would have drawn visitor -> chat -> MLS -> text -> CRM -> booked, which is exactly
 * the chain the teardown's "what happened behind it" column already shows. Building it would
 * have been the same content twice with different graphics.
 *
 * Deliberately three columns on mist, so it cannot be mistaken for the four moves (2x2 on
 * ink). Failure modes are a checklist you scan, not a spec you study.
 */
export function FailureModes() {
  return (
    <section className="bg-mist py-24 md:py-32" aria-label="Where it goes wrong">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone">
            Three ways it fails
          </p>
          <h2 className="mt-6 max-w-2xl text-2xl font-light leading-[1.25] tracking-[-0.015em] text-ink md:text-[34px]">
            All avoidable, all common.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-x-12 gap-y-10 md:mt-20 md:grid-cols-3">
          {FAILURE_MODES.map((m, i) => (
            <Reveal key={m.lead} delay={90 * i}>
              <div className="border-t border-[#d5dbe2] pt-6">
                <p className="text-lg font-light leading-snug tracking-[-0.01em] text-ink md:text-xl">
                  {m.lead}
                </p>
                <p className="mt-3.5 text-sm leading-[1.75] text-stone">{m.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
