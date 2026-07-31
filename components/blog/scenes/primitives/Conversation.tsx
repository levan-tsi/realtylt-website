import type { ConversationEvent, ConversationTurn } from "@/lib/blog/flagship";
import { Reveal } from "@/components/ui/Reveal";

/** PRIMITIVE — a staged exchange, beside the machinery that fired during it.
 *
 * Generalised out of Teardown. Two tracks side by side: what the other person EXPERIENCED,
 * and what HAPPENED behind it. Showing both at once is the argument of a whole post in one
 * graphic, which is why it is one scene rather than two and why it is usually the centrepiece.
 *
 * `themLabel` / `usLabel` are props because the nouns are per topic: a website visitor and an
 * assistant on one piece, a caller and an agent on another. `who` stays neutral ("them"/"us")
 * so the shape does not have to grow a new value every time the channel changes.
 *
 * `note` is required for the same reason StatBars requires its caveat: this is an
 * ILLUSTRATION of a pattern, not a transcript from a real client, and the scene has to say so
 * on screen. A staged conversation that does not admit it is staged is the one thing that
 * would undo a page arguing for honesty.
 *
 * `layout` is the one that matters, and it exists because the first version of this scene got
 * it wrong. Chat bubbles are a picture of a MESSAGING app: two columns, tails, alternating
 * alignment. Drawing a spoken phone call that way makes a voice piece look like a reskin of
 * the chat piece, and it quietly tells the reader the wrong thing about the channel.
 *
 *  - BUBBLES is a typed conversation. Alignment carries who is speaking.
 *  - TRANSCRIPT is a spoken one: one column, a named speaker above each line, hairlines
 *    between turns, and a timecode down the right. It is what a call log looks like, it reads
 *    at a glance as sound rather than text, and it crops far better as a still.
 *
 * Light band by default and legibility over atmosphere: this is a document. Motion is the
 * reveal only, and the resting state is the finished frame.
 */
export function Conversation({
  band,
  layout = "bubbles",
  eyebrow,
  heading,
  note,
  themLabel,
  usLabel,
  turnsHeading,
  eventsHeading,
  turns,
  events,
}: {
  band: "dark" | "light";
  layout?: "bubbles" | "transcript";
  eyebrow: string;
  heading: string;
  note: string;
  themLabel: string;
  usLabel: string;
  turnsHeading: string;
  eventsHeading: string;
  turns: ConversationTurn[];
  events: ConversationEvent[];
}) {
  const dark = band === "dark";
  const transcript = layout === "transcript";

  return (
    <section
      className={dark ? "bg-ink py-24 text-paper md:py-36" : "bg-mist py-24 md:py-36"}
      aria-label={heading}
    >
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal>
          <p
            className={`text-xs font-bold uppercase tracking-[0.2em] ${dark ? "text-paper/45" : "text-stone"}`}
          >
            {eyebrow}
          </p>
          <h2
            className={
              dark
                ? "mt-6 max-w-3xl text-2xl font-light leading-[1.25] tracking-[-0.015em] md:text-[34px]"
                : "mt-6 max-w-3xl text-2xl font-light leading-[1.25] tracking-[-0.015em] text-ink md:text-[34px]"
            }
          >
            {heading}
          </h2>
          <p className={`mt-5 max-w-xl text-sm ${dark ? "text-paper/55" : "text-stone"}`}>{note}</p>
        </Reveal>

        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* ── What they experienced */}
          <Reveal>
            <p
              className={`text-[11px] font-bold uppercase tracking-[0.18em] ${dark ? "text-paper/45" : "text-stone"}`}
            >
              {turnsHeading}
            </p>
            {transcript ? (
              <ol className="mt-6">
                {turns.map((t, i) => {
                  const them = t.who === "them";
                  return (
                    <li
                      key={i}
                      className={`border-t py-5 first:border-t-0 first:pt-0 ${
                        dark ? "border-white/12" : "border-[#dfe4ea]"
                      }`}
                    >
                      <div className="flex items-baseline gap-3">
                        {/* Who is speaking carries the only colour in the track. The caller
                            is neutral and the agent is the accent, so a reader can find our
                            side of the call without reading a word of it. */}
                        <span
                          className={`text-[11px] font-bold uppercase tracking-[0.16em] ${
                            them
                              ? dark
                                ? "text-paper/55"
                                : "text-stone"
                              : dark
                                ? "text-porchlight"
                                : "text-porchlight-deep"
                          }`}
                        >
                          {them ? themLabel : usLabel}
                        </span>
                        <span
                          className={`ml-auto shrink-0 text-[11px] uppercase tracking-[0.12em] tabular-nums ${
                            dark ? "text-paper/40" : "text-stone/80"
                          }`}
                        >
                          {t.at}
                        </span>
                      </div>
                      <p
                        className={`mt-2 max-w-[36rem] text-lg font-light leading-[1.55] ${
                          them ? (dark ? "text-paper" : "text-ink") : dark ? "text-paper/75" : "text-ink-soft"
                        }`}
                      >
                        {t.text}
                      </p>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <ol className="mt-6 space-y-3">
                {turns.map((t, i) => {
                  const them = t.who === "them";
                  return (
                    <li key={i} className={them ? "flex justify-end" : "flex justify-start"}>
                      <div className={`max-w-[86%] ${them ? "text-right" : "text-left"}`}>
                        <p
                          className={`rounded-[14px] px-5 py-3.5 leading-[1.6] ${
                            them
                              ? "bg-river text-paper"
                              : dark
                                ? "bg-white/[0.07] text-paper shadow-[inset_0_1px_0_rgb(255_255_255/0.07)]"
                                : "bg-paper text-ink-soft shadow-[0_1px_2px_rgb(16_44_84/0.06)]"
                          }`}
                        >
                          {t.text}
                        </p>
                        <p
                          className={`mt-1.5 px-1 text-[11px] uppercase tracking-[0.12em] ${dark ? "text-paper/45" : "text-stone"}`}
                        >
                          {them ? themLabel : usLabel} / {t.at}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </Reveal>

          {/* ── What fired behind it */}
          <Reveal delay={140}>
            <p
              className={`text-[11px] font-bold uppercase tracking-[0.18em] ${dark ? "text-paper/45" : "text-stone"}`}
            >
              {eventsHeading}
            </p>
            <ol className="mt-6">
              {events.map((e, i) => {
                const last = i === events.length - 1;
                return (
                  <li
                    key={e.label}
                    className={`border-t py-4 first:border-t-0 first:pt-0 ${
                      dark ? "border-white/12" : "border-[#dfe4ea]"
                    }`}
                  >
                    <div className="flex items-baseline gap-3">
                      <span
                        aria-hidden
                        className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${
                          last
                            ? "live-dot bg-porchlight"
                            : dark
                              ? "bg-white/25"
                              : "bg-[#c9d1da]"
                        }`}
                      />
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-bold ${dark ? "text-paper" : "text-ink-soft"}`}
                        >
                          {e.label}
                        </p>
                        <p
                          className={`mt-1 text-sm leading-relaxed ${dark ? "text-paper/60" : "text-stone"}`}
                        >
                          {e.detail}
                        </p>
                      </div>
                      <span
                        className={`ml-auto shrink-0 text-[11px] uppercase tracking-[0.12em] tabular-nums ${
                          dark ? "text-paper/45" : "text-stone"
                        }`}
                      >
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
