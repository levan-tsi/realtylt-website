import Link from "next/link";
import { Button } from "@/components/ui/Button";

/** CMA + market reports, client-facing (owner spec 5b). The agent generates/sends reports
 * from the CRM; a logged-in client will see, run, and recalculate them here, plus "raise their
 * hand" to the agent and open a chat. Report generation is built on the CRM side — this is the
 * client-portal surface, scaffolded until the CRM CMA feature is wired through. */
export default function ReportsPage() {
  return (
    <section aria-labelledby="reports-heading">
      <h2 id="reports-heading" className="font-display text-2xl text-ink">
        My reports
      </h2>
      <p className="mt-1 text-sm text-stone">
        Your home-value estimates, comparable-market analyses (CMA), and monthly market reports.
      </p>

      <div className="mt-8 rounded-[4px] border border-dashed border-ink/20 p-10 text-center">
        <p className="font-display text-xl text-ink">No reports yet.</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-stone">
          Request a free home-value report and we&rsquo;ll prepare a comparable-market analysis for
          your property. New reports your agent shares will show up here, where you can review,
          recalculate, and reach out directly.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button href="/home-value" size="lg">
            Get my home value
          </Button>
          <Button href="/connect" variant="outline" size="lg">
            Talk to an agent
          </Button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-stone">
        Looking for market trends?{" "}
        <Link href="/top-areas" className="font-bold text-river underline underline-offset-2">
          Explore Hudson Valley areas
        </Link>
        .
      </p>
    </section>
  );
}
