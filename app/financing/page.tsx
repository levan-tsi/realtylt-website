import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
      {/* ── Hero — live: light photo, centered "The Home Loan Process" */}
      <section className="relative isolate overflow-hidden bg-ink" aria-labelledby="financing-hero">
        <div className="absolute inset-0">
          <Image
            src="/images/lifestyle/financing.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/40" />
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
            {/* Pre-approval letter card */}
            <figure className="mx-auto max-w-sm bg-white p-8 shadow-2xl" aria-label="Sample pre-approval letter">
              <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-stone">
                Loan Pre-Approval Letter
              </p>
              <p className="mt-5 text-center text-xs uppercase tracking-[0.14em] text-stone">Loan amount</p>
              <p className="text-center text-3xl font-bold text-ink">$455,000</p>
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#dddddd] pt-4 text-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-stone">Monthly payment</p>
                  <p className="text-lg text-ink">$3,500</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-stone">Term</p>
                  <p className="text-lg text-ink">30 years</p>
                </div>
              </div>
              <p className="mx-auto mt-6 w-fit -rotate-3 border-2 border-red-600 px-3 py-1 text-sm font-bold uppercase tracking-[0.18em] text-red-600">
                Approved
              </p>
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

      {/* ── Best loan / lender connect */}
      <section className="bg-paper pb-16 md:pb-24" aria-labelledby="loan-heading">
        <div className="mx-auto grid max-w-[1250px] gap-12 px-4 lg:grid-cols-2 lg:px-8">
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
                  <span aria-hidden className="mt-0.5 font-bold">✓</span> {li}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={140}>
            <LeadForm
              defaultReason="I'm interested in buying a home"
              submitLabel="Let's Get Started"
              successTitle="On it."
              successBody="We'll reach out shortly to connect you with the right lender."
            />
          </Reveal>
        </div>
      </section>

      {/* ── Application & processing — live: light gray section */}
      <section className="bg-mist py-16 md:py-24" aria-labelledby="apply-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <Reveal>
            <h2 id="apply-heading" className="text-3xl font-light text-ink md:text-4xl">
              Application &amp; <strong className="font-bold">Processing</strong>
            </h2>
            <p className="mt-3 text-sm font-bold uppercase tracking-[0.12em] text-ink-soft">
              What happens when a loan goes &ldquo;live&rdquo;
            </p>
            <p className="mt-4 max-w-2xl leading-relaxed text-stone">
              When you find a property you&rsquo;re ready to buy, your lender will help you
              complete a full mortgage loan application, and talk you through the various fees and
              down payment options. The application is submitted to processing, where the
              documents are reviewed and appraisals and title examination is ordered. Then, the
              loan is sent to an underwriter, who reviews and approves the entire loan if it meets
              compliance.
            </p>
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
