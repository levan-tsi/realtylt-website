import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LeadForm } from "@/components/leads/LeadForm";
import { MortgageCalculator } from "@/components/financing/MortgageCalculator";

export const metadata: Metadata = {
  title: "Financing | The Home Loan Process, Demystified",
  description:
    "Understand the home loan process from pre-approval to closing, estimate your monthly payment with our mortgage calculator, and get connected with trusted local lenders.",
};

export default function FinancingPage() {
  return (
    <>
      {/* ── Hero — live: light photo, centered "The Home Loan Process" */}
      <section className="relative isolate overflow-hidden bg-ink" aria-labelledby="financing-hero">
        <div className="absolute inset-0">
          {/* Live financing hero's OWN asset (uploads/104674/blogmanpaperwork.jpg —
              signing paperwork). Scrim tuned so the centered white title clears the
              bright window behind the subject. */}
          <Image
            src="/images/hero/financing-paperwork.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative mx-auto max-w-[1250px] px-4 py-24 text-center md:py-[192px] lg:px-8">
          <h1 id="financing-hero" className="text-3xl font-light text-paper md:text-[46px]">
            The Home Loan <strong className="font-bold">Process</strong>
          </h1>
        </div>
      </section>

      {/* ── Demystifying intro */}
      <section className="bg-paper py-16 md:py-20" aria-labelledby="demystify-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <Reveal>
            <SectionHeading align="center" as="h2">
              <span id="demystify-heading">Demystifying Home Loans</span>
            </SectionHeading>
            <p className="mx-auto mt-6 max-w-3xl text-center leading-relaxed text-stone">
              If you haven&rsquo;t experienced it before, the home loan process can feel
              overwhelming, but our agents will help you stay informed throughout the process, from
              pre-approval to closing. The first thing to do is consult with a mortgage specialist
              (or two). If you don&rsquo;t already have someone in mind, we partner with some of
              the best lenders in the industry, and we&rsquo;d be happy to introduce you, so
              you&rsquo;ll be taken care of.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Get pre-approval — live: black section, white letter card */}
      <section className="bg-ink py-16 text-paper md:py-24" aria-labelledby="preapproval-heading">
        <div className="mx-auto grid max-w-[1250px] items-center gap-12 px-4 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <h2 id="preapproval-heading" className="text-3xl font-light md:text-4xl">
              Get <strong className="font-bold">Pre-Approval</strong>
            </h2>
            <p className="mt-5 max-w-lg leading-relaxed text-paper/75">
              Before you start looking for a home to buy, it&rsquo;s a good idea to meet with your
              Loan Officer to get pre-approved for a loan amount. At this stage, the lender gathers
              information about income, assets and debts of the borrower (you) to determine how
              much house you may be able to afford. This includes a credit report, W-2 forms, pay
              stubs, Federal Tax Returns and recent bank statements.
            </p>
            <p className="mt-4 max-w-lg leading-relaxed text-paper/75">
              There are a variety of different loan programs, so make sure to get
              pre-qualification for the specific programs that best suit your needs.
            </p>
          </Reveal>
          <Reveal delay={140}>
            {/* Pre-approval letter card — circled check, accented amount, signature, stamp, dots */}
            <figure className="mx-auto max-w-sm bg-white p-6 shadow-2xl sm:p-8" aria-label="Illustrative pre-approval letter">
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-full border-2 border-porchlight text-porchlight-deep" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12.5 4.5 4.5L19 7" />
                </svg>
              </span>
              <p className="mt-4 text-center text-xs font-bold uppercase tracking-[0.18em] text-stone">
                Loan Pre-Approval Letter
              </p>
              <p className="mt-5 text-center text-[11px] uppercase tracking-[0.14em] text-stone">Loan amount</p>
              <p className="text-center text-3xl font-bold text-porchlight-deep">$455,000</p>
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#dddddd] pt-4 text-center">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-stone">Monthly payment</p>
                  <p className="text-lg text-ink">$3,500</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-stone">Repayment term</p>
                  <p className="text-lg text-ink">30 years</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-x-3 gap-y-3 border-t border-[#dddddd] pt-5">
                <div>
                  <svg width="118" height="30" viewBox="0 0 118 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="max-w-full text-ink-soft" aria-hidden>
                    <path d="M3 20c5 0 7-13 10-13s1 18 4 18 5-22 8-22 2 20 5 20 4-9 7-9 3 5 6 5 5-7 9-7 6 3 10 3 8-4 12-3.5" />
                    <path d="M92 24c6-1 12-1 23-2" />
                  </svg>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-stone">Authorized signature</p>
                </div>
                <p className="w-fit -rotate-3 border-2 border-red-600 px-3 py-1 text-sm font-bold uppercase tracking-[0.18em] text-red-600">
                  Approved
                </p>
              </div>
              <div className="mt-6 flex items-center justify-center gap-1.5" aria-hidden>
                <span className="h-1.5 w-1.5 rounded-full bg-ink" />
                <span className="h-1.5 w-1.5 rounded-full bg-ink" />
                <span className="h-1.5 w-1.5 rounded-full bg-ink" />
                <span className="h-1.5 w-6 rounded-full bg-porchlight" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#d9dde2]" />
              </div>
              <figcaption className="mt-4 text-center text-[10px] text-stone">Illustrative example, not a real offer.</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ── Calculator — live: black inputs panel + light results panel */}
      <section className="bg-paper py-16 md:py-20" aria-labelledby="calc-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <Reveal>
            <MortgageCalculator />
          </Reveal>
        </div>
      </section>

      {/* ── Best loan / lender connect — live: text+form LEFT, phone mockup RIGHT */}
      <section className="bg-paper pb-16 md:pb-24" aria-labelledby="loan-heading">
        <div className="mx-auto grid max-w-[1250px] items-start gap-12 px-4 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <h2 id="loan-heading" className="text-3xl font-light text-ink md:text-4xl">
              Helping You Get The Best <strong className="font-bold">Loan</strong>
            </h2>
            <p className="mt-3 text-sm font-bold uppercase tracking-[0.12em] text-ink-soft">
              Start the process
            </p>
            <p className="mt-4 max-w-lg leading-relaxed text-stone">
              We&rsquo;ll help you find the best local loan officer to get you competitive rates
              and the programs that best fit your individual needs. Fill out this form and
              we&rsquo;ll connect you with a lender today!
            </p>
            <ul className="mt-6 space-y-2 text-sm text-ink-soft">
              {[
                "Local lenders who know Hudson Valley closings",
                "Rate and program comparison, explained plainly",
                "First-time buyer and renovation programs included",
              ].map((li) => (
                <li key={li} className="flex items-start gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-porchlight-deep" aria-hidden>
                    <path d="m5 12.5 4.5 4.5L19 7" />
                  </svg>
                  {li}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <LeadForm
                splitName
                hideReason
                defaultReason="I'm interested in buying a home"
                submitLabel="Let's Get Started"
                successTitle="On it."
                successBody="We'll reach out shortly to connect you with the right lender."
              />
            </div>
          </Reveal>
          <Reveal delay={140} className="lg:pt-2">
            <HomeownershipPhoneMock />
          </Reveal>
        </div>
      </section>

      {/* ── Application & processing — live: light gray, text LEFT + browser mockup RIGHT */}
      <section className="bg-mist py-16 md:py-24" aria-labelledby="apply-heading">
        <div className="mx-auto grid max-w-[1250px] items-center gap-12 px-4 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <h2 id="apply-heading" className="text-3xl font-light text-ink md:text-4xl">
              Application &amp; <strong className="font-bold">Processing</strong>
            </h2>
            <p className="mt-3 text-sm font-bold uppercase tracking-[0.12em] text-ink-soft">
              What happens when a loan goes &ldquo;live&rdquo;
            </p>
            <p className="mt-4 max-w-lg leading-relaxed text-stone">
              When you find a property you&rsquo;re ready to buy, your lender will help you
              complete a full mortgage loan application, and talk you through the various fees and
              down payment options. The application is submitted to processing, where the
              documents are reviewed and appraisals and title examination is ordered. Then, the
              loan is sent to an underwriter, who reviews and approves the entire loan if it meets
              compliance.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <ApplicationBrowserMock />
          </Reveal>
        </div>
      </section>

      {/* ── Closing — live: black section */}
      <section className="bg-ink py-16 text-paper md:py-24" aria-labelledby="closing-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <Reveal>
            <h2 id="closing-heading" className="text-3xl font-light md:text-4xl">
              <strong className="font-bold">Closing</strong>
            </h2>
            <p className="mt-3 text-sm font-bold uppercase tracking-[0.12em] text-paper">
              Signing and finalizing the deal
            </p>
            <p className="mt-4 max-w-2xl leading-relaxed text-paper/75">
              Don&rsquo;t be surprised if you&rsquo;re asked for additional documentation or
              clarification throughout the process. Once your loan is approved, don&rsquo;t forget
              to set up homeowners insurance. Your documents will be sent to the title company,
              where you&rsquo;ll sign for the new home and pay any remaining costs. Then, the loan
              is recorded and you get the keys.{" "}
              <strong className="font-bold text-paper">Congratulations, happy homeowner!</strong>
            </p>
            <div className="mt-7">
              <Button href="/buying" variant="outline-light">See The Full Buying Process</Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/** Phone mockup for the "best loan" section — our own take on the live page's Brivity
 * "Estimated Value of Homeownership" screen. Numbers are illustrative and labeled as such;
 * styled in the Hudson Twilight palette (no third-party teal). */
function HomeownershipPhoneMock() {
  const rows = [
    { label: "Appreciation", note: "5-year estimate", value: "$21,920" },
    { label: "Principal reduction", note: "loan paid down", value: "$8,340" },
    { label: "Tax savings", note: "annual, estimated", value: "$2,818" },
  ];
  return (
    <figure
      className="mx-auto w-full max-w-[300px]"
      aria-label="Illustrative estimate of the value of homeownership over five years"
    >
      <div className="rounded-[34px] border-[10px] border-[#20262e] bg-[#20262e] shadow-[0_30px_60px_-28px_rgba(0,0,0,0.55)]">
        <div className="overflow-hidden rounded-[24px] bg-white">
          <div className="flex h-7 items-center justify-center bg-white">
            <span className="h-1.5 w-16 rounded-full bg-[#e5e7eb]" aria-hidden />
          </div>
          <div className="px-5 pb-6 pt-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone">Estimated value of</p>
            <p className="text-lg font-bold text-ink">Homeownership</p>
            <dl className="mt-5 space-y-3">
              {rows.map((r) => (
                <div key={r.label} className="flex items-baseline justify-between border-b border-[#eef1f4] pb-3">
                  <div>
                    <dt className="text-sm font-medium text-ink">{r.label}</dt>
                    <dd className="text-[11px] text-stone">{r.note}</dd>
                  </div>
                  <span className="text-sm font-bold text-porchlight-deep">{r.value}</span>
                </div>
              ))}
            </dl>
            <div className="mt-5 rounded-[6px] bg-ink px-4 py-3 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-paper/70">5-year total</p>
              <p className="text-2xl font-bold text-paper">+$33,078</p>
            </div>
            <figcaption className="mt-3 text-center text-[10px] text-stone">
              Illustrative estimate, not a guarantee.
            </figcaption>
          </div>
        </div>
      </div>
    </figure>
  );
}

/** Browser-window mockup for "Application & Processing" — a loan application moving through
 * the processing checklist. CSS-only frame (like the selling page's laptop frames), our own
 * content, illustrative status. */
function ApplicationBrowserMock() {
  const steps = [
    { label: "Application submitted", done: true },
    { label: "Documents reviewed", done: true },
    { label: "Appraisal ordered", done: true },
    { label: "Title examination", done: false },
    { label: "Underwriting review", done: false },
  ];
  return (
    <figure
      className="mx-auto w-full max-w-xl"
      aria-label="Illustration of a loan application moving through processing"
    >
      <div className="overflow-hidden rounded-[10px] border border-[#d8dce1] bg-white shadow-[0_30px_60px_-28px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2 border-b border-[#e5e7eb] bg-mist px-3 py-2.5">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#e0533d]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#e8b13a]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#4caf67]" />
          </span>
          <span className="ml-1 flex h-5 flex-1 items-center rounded bg-white px-2 text-[10px] text-stone">
            realtylt.com/loan-status
          </span>
        </div>
        <div className="p-5 sm:p-7">
          <div className="flex items-baseline justify-between">
            <p className="text-lg font-bold text-ink">Application</p>
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-porchlight-deep">In review</span>
          </div>
          <ol className="mt-5 space-y-2.5">
            {steps.map((s) => (
              <li key={s.label} className="flex items-center gap-3 rounded-[4px] border border-[#eceff2] px-3.5 py-2.5">
                <span
                  aria-hidden
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                    s.done ? "bg-ink text-paper" : "border border-[#cfd4da] text-transparent"
                  }`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12.5 4.5 4.5L19 7" />
                  </svg>
                </span>
                <span className={`text-sm ${s.done ? "font-medium text-ink" : "text-stone"}`}>{s.label}</span>
                <span
                  className={`ml-auto text-[11px] font-bold uppercase tracking-wide ${
                    s.done ? "text-stone" : "text-porchlight-deep"
                  }`}
                >
                  {s.done ? "Done" : "Pending"}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </figure>
  );
}
