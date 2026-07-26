import { TEARDOWN_EVENTS, TEARDOWN_TURNS } from "@/content/blog/ai-chat-scenes";
import { Reveal } from "@/components/ui/Reveal";

/** SCENE 5 — the teardown. The centrepiece.
 *
 * Two tracks side by side: what the visitor SAW (the conversation) and what FIRED behind it
 * (the machinery). Showing both at once is the argument of the whole post in one graphic, and
 * it is the segment the video is built around.
 *
 * It sits directly after the pull quote on purpose. The quote sets the standard (correct,
 * immediate, and a real person showed up); this scene shows that standard being met, including
 * the assistant refusing to invent an answer it cannot verify. That refusal is the most
 * persuasive thing on the page, so it is not buried.
 *
 * Light band by design: it follows the navy quote and it is a document, so legibility beats
 * atmosphere here. Motion is the reveal only, and the resting state is the finished frame.
 */
export function Teardown() {
  return (
    <section className="bg-mist py-24 md:py-36" aria-label="Watch it handle a real question">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone">The teardown</p>
          <h2 className="mt-6 max-w-3xl text-2xl font-light leading-[1.25] tracking-[-0.015em] text-ink md:text-[34px]">
            Watch it handle the 11:40pm question.
          </h2>
          <p className="mt-5 max-w-xl text-sm text-stone">
            The pattern, not a transcript from a real client.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* ── What the visitor saw */}
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone">
              What the visitor saw
            </p>
            <ol className="mt-6 space-y-3">
              {TEARDOWN_TURNS.map((t, i) => {
                const visitor = t.who === "visitor";
                return (
                  <li key={i} className={visitor ? "flex justify-end" : "flex justify-start"}>
                    <div className={`max-w-[86%] ${visitor ? "text-right" : "text-left"}`}>
                      <p
                        className={`rounded-[14px] px-5 py-3.5 leading-[1.6] ${
                          visitor
                            ? "bg-river text-paper"
                            : "bg-paper text-ink-soft shadow-[0_1px_2px_rgb(16_44_84/0.06)]"
                        }`}
                      >
                        {t.text}
                      </p>
                      <p className="mt-1.5 px-1 text-[11px] uppercase tracking-[0.12em] text-stone">
                        {visitor ? "Visitor" : "Assistant"} / {t.at}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Reveal>

          {/* ── What fired behind it */}
          <Reveal delay={140}>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone">
              What happened behind it
            </p>
            <ol className="mt-6">
              {TEARDOWN_EVENTS.map((e, i) => {
                const last = i === TEARDOWN_EVENTS.length - 1;
                return (
                  <li key={e.label} className="border-t border-[#dfe4ea] py-4 first:border-t-0 first:pt-0">
                    <div className="flex items-baseline gap-3">
                      <span
                        aria-hidden
                        className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${
                          last ? "live-dot bg-porchlight" : "bg-[#c9d1da]"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-ink-soft">{e.label}</p>
                        <p className="mt-1 text-sm leading-relaxed text-stone">{e.detail}</p>
                      </div>
                      <span className="ml-auto shrink-0 text-[11px] uppercase tracking-[0.12em] tabular-nums text-stone">
                        {e.at}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
