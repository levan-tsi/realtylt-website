import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ValleyDivider } from "@/components/valley-line/ValleyLine";
import { LeadForm } from "@/components/leads/LeadForm";
import { MortgageCalculator } from "@/components/financing/MortgageCalculator";

export const metadata: Metadata = {
  title: "Financing — The Home Loan Process, Demystified",
  description:
    "Understand the home loan process from pre-approval to closing, estimate your monthly payment with our mortgage calculator, and get connected with trusted local lenders.",
};

export default function FinancingPage() {
  return (
    <>
      {/* ── Hero */}
      <section className="relative isolate overflow-hidden bg-ink" aria-labelledby="financing-hero">
        <div className="absolute inset-0">
          <Image
            src="/images/lifestyle/financing.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/50" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-porchlight">Financing</p>
          <h1 id="financing-hero" className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-paper md:text-6xl">
            The home loan process, <span className="text-porchlight">demystified</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-paper/80">
            If you haven&rsquo;t experienced it before, a mortgage can feel overwhelming. Our agents
            keep you informed from pre-approval to closing — and if you don&rsquo;t already have a
            mortgage specialist, we&rsquo;ll introduce you to some of the best lenders in the
            business.
          </p>
        </div>
      </section>

      {/* ── Get pre-approval */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="preapproval-heading">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="Step one" as="h2">
              <span id="preapproval-heading">Get pre-approval</span>
            </SectionHeading>
            <p className="mt-5 max-w-lg leading-relaxed text-stone">
              Before you start looking for a home, meet with your loan officer and get pre-approved.
              The lender reviews your income, assets, and debts to determine how much house you can
              afford — a credit report, W-2 forms, pay stubs, federal tax returns, and recent bank
              statements.
            </p>
            <p className="mt-4 max-w-lg leading-relaxed text-stone">
              There are a variety of loan programs, so make sure to get pre-qualification for the
              specific programs that best suit your needs.
            </p>
          </Reveal>
          <Reveal delay={140}>
            {/* Pre-approval letter card */}
            <figure className="mx-auto max-w-sm rounded-[2px] border border-ink/10 bg-white p-8 shadow-[0_24px_60px_-30px_rgb(16_24_32/0.3)]" aria-label="Sample pre-approval letter">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-stone">Loan pre-approval letter</p>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-stone">Loan amount</p>
              <p className="font-mono text-3xl font-semibold text-ink">$455,000</p>
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-ink/10 pt-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-stone">Monthly payment</p>
                  <p className="font-mono text-lg text-ink">$3,500</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-stone">Term</p>
                  <p className="font-mono text-lg text-ink">30 years</p>
                </div>
              </div>
              <p className="mt-6 inline-block -rotate-3 rounded-[2px] border-2 border-porchlight-deep px-3 py-1 font-mono text-sm font-bold uppercase tracking-[0.18em] text-porchlight-deep">
                Approved
              </p>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ── Calculator */}
      <section className="bg-ink py-16 text-paper md:py-24" aria-labelledby="calc-heading">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="Do the math" dark as="h2">
              <span id="calc-heading">Estimate your monthly payment</span>
            </SectionHeading>
            <p className="mt-4 max-w-xl text-paper/70">
              Principal and interest, taxes, HOA, and private mortgage insurance — the whole
              monthly picture, not just the loan.
            </p>
          </Reveal>
          <Reveal delay={120} className="mt-10">
            <MortgageCalculator />
          </Reveal>
        </div>
      </section>

      {/* ── Best loan / lender connect */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="loan-heading">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="Start the process" as="h2">
              <span id="loan-heading">Helping you get the best loan</span>
            </SectionHeading>
            <p className="mt-5 max-w-lg leading-relaxed text-stone">
              We&rsquo;ll help you find the best local loan officer to get you competitive rates and
              the programs that fit your individual needs. Fill out this form and we&rsquo;ll
              connect you with a lender today — no cost, no commitment.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-ink">
              {[
                "Local lenders who know Hudson Valley closings",
                "Rate and program comparison, explained plainly",
                "First-time buyer and renovation programs included",
              ].map((li) => (
                <li key={li} className="flex items-start gap-2">
                  <span aria-hidden className="mt-0.5 text-porchlight-deep">✓</span> {li}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={140}>
            <div className="rounded-[2px] border border-ink/10 bg-white p-6 shadow-[0_24px_60px_-30px_rgb(16_24_32/0.25)] md:p-8">
              <h3 className="font-display text-2xl text-ink">Let&rsquo;s get started</h3>
              <p className="mb-5 mt-1 text-sm text-stone">We&rsquo;ll introduce you to a lender within one business day.</p>
              <LeadForm
                defaultReason="I'm interested in buying a home"
                submitLabel="Let's Get Started"
                successTitle="On it."
                successBody="We'll reach out shortly to connect you with the right lender."
              />
            </div>
          </Reveal>
        </div>
      </section>

      <ValleyDivider />

      {/* ── Application & processing / closing */}
      <section className="bg-paper pb-16 pt-10 md:pb-24" aria-labelledby="process-heading">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 id="process-heading" className="sr-only">
            What happens after you apply
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal>
              <article className="h-full rounded-[2px] border border-ink/10 bg-mist p-7 md:p-9">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-river">When a loan goes live</p>
                <h3 className="mt-2 font-display text-2xl text-ink">Application &amp; processing</h3>
                <p className="mt-4 leading-relaxed text-stone">
                  When you find a property you&rsquo;re ready to buy, your lender helps you complete
                  a full mortgage application and talks you through fees and down-payment options.
                  The application goes to processing — documents are reviewed, appraisals and title
                  examination are ordered — then to an underwriter, who reviews and approves the
                  loan if it meets compliance.
                </p>
              </article>
            </Reveal>
            <Reveal delay={120}>
              <article className="h-full rounded-[2px] border border-ink/15 bg-ink p-7 text-paper md:p-9">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-porchlight">Signing &amp; finalizing</p>
                <h3 className="mt-2 font-display text-2xl">Closing</h3>
                <p className="mt-4 leading-relaxed text-paper/75">
                  Don&rsquo;t be surprised if you&rsquo;re asked for additional documentation along
                  the way — it&rsquo;s normal. Once your loan is approved, set up homeowners
                  insurance; your documents go to the title company, you sign for the new home and
                  pay any remaining costs, and the loan is recorded. You get the keys.{" "}
                  <strong className="text-porchlight">Congratulations, happy homeowner.</strong>
                </p>
                <div className="mt-6">
                  <Button href="/buying" variant="outline-light">See the full buying process</Button>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
