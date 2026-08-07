import type { Metadata } from "next";
import Link from "next/link";
import { BudgetBridge } from "@/components/plan/BudgetBridge";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Plan Your Purchase | Budget to Keys",
  description:
    "Turn a comfortable monthly payment into a price range you can shop today, then see the four stages of buying in New York, from budget to closing.",
};

/** /plan — the honest answer to Zillow's Plan tab (research in docs/parity/DESIGN-ROUND23.md).
 * Theirs collects your finances and routes you to their lender; this one answers immediately
 * and asks for nothing. The budget → price bridge is the signature; the rest is the process
 * told straight and a human who answers. */

/** The four stages ARE a sequence, so the numbering carries real information. Copy stays
 * specific to buying in New York: attorney closings, pre-approval before offers. */
const STAGES: { title: string; body: string; href: string; label: string }[] = [
  {
    title: "Set the budget",
    body: "Decide the monthly number first, then get a pre-approval letter to back it. In this market an offer without one is a weaker offer, and most lenders can issue a letter within a day or two.",
    href: "/financing",
    label: "Financing, explained",
  },
  {
    title: "Search with the map",
    body: "Every OneKey listing across the Hudson Valley and NYC, updated hourly. Heart the homes you like, save the search, and the criteria travel with you.",
    href: "/search",
    label: "Search listings",
  },
  {
    title: "Make the offer",
    body: "Price is one lever of several: closing timeline, contingencies, and deposit all carry weight. We write the offer with you and negotiate it for you.",
    href: "/buying",
    label: "How buying works",
  },
  {
    title: "Close",
    body: "New York closes through attorneys. From accepted offer to keys typically runs 60 to 90 days: inspection, contract signing, mortgage commitment, then the closing table.",
    href: "/buying",
    label: "What to expect",
  },
];

export default function PlanPage() {
  return (
    <>
      <header className="bg-ink py-10 text-paper">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-paper/60">Plan</p>
          <h1 className="t-h1 mt-2">
            Start from the payment, <strong>not the price</strong>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-paper/70">
            A plan you can use in two minutes: what your monthly budget buys, the four stages
            between here and keys, and a person who answers seven days a week.
          </p>
        </div>
      </header>

      <section aria-labelledby="bridge-heading" className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <h2 id="bridge-heading" className="sr-only">
          Turn a monthly budget into a price range
        </h2>
        <BudgetBridge />
      </section>

      <section aria-labelledby="stages-heading" className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
        <h2 id="stages-heading" className="t-h2 text-ink">
          Four stages, <strong>no mystery</strong>
        </h2>
        <ol className="mt-8 grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {STAGES.map((s, i) => (
            <li key={s.title} className="border-t border-line-strong pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone">Stage {i + 1}</p>
              <h3 className="t-h3 mt-2 text-ink">{s.title}</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">{s.body}</p>
              <Link
                href={s.href}
                className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.14em] text-ink underline underline-offset-4 transition-colors hover:text-stone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="talk-heading" className="bg-mist">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
          <h2 id="talk-heading" className="t-h2 text-ink">
            Or just <strong>talk it through</strong>
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
            No portal, no marketplace, no hand-off. Call or text and you get us, seven days a
            week, whether you are two years out or two weeks out.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={SITE.phoneHref}
              className="rounded-xl bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
            >
              Call {SITE.phone}
            </a>
            <a
              href={`sms:${SITE.phoneE164}`}
              className="rounded-xl border-2 border-ink bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
            >
              Text us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
