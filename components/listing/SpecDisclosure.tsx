/** A spec section that is COLLAPSED on a phone and plain open text on a desktop.
 *
 * At 390 our listing page ran 9,035px against live's 6,806 because every spec list renders in full,
 * so a visitor scrolls thousands of pixels of appliance names before reaching the payment
 * calculator. Live collapses these into accordions on mobile only.
 *
 * Built from a hidden checkbox and a label rather than <details>, for one reason: the open state
 * has to differ by viewport width, and nothing can set a <details open> attribute per breakpoint
 * without JavaScript. This is pure CSS — it works with scripting off, needs no hydration, and
 * therefore cannot shift the layout after first paint. Above `md` the toggle is inert and the
 * content is simply visible.
 *
 * The control is a real focusable input with a real label, so it is keyboard-operable (Tab, then
 * Space) and announced with its section name. */
export function SpecDisclosure({
  id,
  title,
  note,
  children,
}: {
  /** Anchor id for the heading (the sticky sub-nav links to `#schools`). */
  id?: string;
  title: string;
  /** Small print under the heading, shown with the section. */
  note?: string;
  children: React.ReactNode;
}) {
  const inputId = `rlt-spec-${id ?? title.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div className="mt-6 md:mt-10">
      {/* Hidden at md+ so desktop keyboard users do not tab through toggles that do nothing —
          the content there is visible unconditionally. */}
      <input id={inputId} type="checkbox" className="peer sr-only md:hidden" />
      <h2
        id={id}
        className="scroll-mt-16 font-display text-2xl text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-river peer-checked:[&_svg]:rotate-180"
      >
        <label
          htmlFor={inputId}
          className="flex w-full cursor-pointer items-center justify-between gap-3 border-b border-ink/10 pb-2 md:cursor-default md:border-b-0 md:pb-0"
        >
          {title}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-5 w-5 shrink-0 text-stone transition-transform md:hidden"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </label>
      </h2>
      <div className="hidden peer-checked:block md:block">
        {note && <p className="mt-1 text-xs text-stone">{note}</p>}
        {children}
      </div>
    </div>
  );
}

/** The listing description: clamped on a phone with a "Read more" that needs no JavaScript,
 * full text on a desktop. Live clamps at roughly ten lines and so do we. */
export function ClampedDescription({ text }: { text: string }) {
  const inputId = "rlt-desc-more";
  return (
    <div className="mt-3">
      <input id={inputId} type="checkbox" className="peer sr-only md:hidden" />
      <p className="max-w-2xl leading-relaxed text-stone line-clamp-[10] peer-checked:line-clamp-none md:line-clamp-none">
        {text}
      </p>
      <label
        htmlFor={inputId}
        className="mt-2 inline-flex min-h-6 cursor-pointer items-center text-sm font-medium text-ink underline decoration-ink/25 underline-offset-4 peer-checked:hidden peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-river md:hidden"
      >
        Read more
      </label>
    </div>
  );
}
