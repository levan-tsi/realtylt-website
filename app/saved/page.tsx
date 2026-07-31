import type { Metadata } from "next";
import { SavedClient } from "@/components/search/SavedClient";
import { getDataLastUpdated, isFixtureMode } from "@/lib/idx";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Saved | Your Homes & Searches",
  description:
    "Homes you've hearted and searches you've saved, kept on this device. Turn on email alerts to hear about new matches first.",
  // Someone else's saved list is empty by definition — there is no page here for a search
  // result to lead to. /portal declares the same for the same reason.
  robots: { index: false, follow: false },
};

export default async function SavedPage() {
  // The saved grid is client-rendered from device/account ids, so the feed refresh time the
  // MLS attribution prints has to be resolved here rather than guessed from the saved set.
  const dataLastUpdated = await getDataLastUpdated(new Date().toISOString());
  return (
    <>
      <header className="bg-ink py-10 text-paper">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-paper/60">Saved</p>
          <h1 className="t-h1 mt-2">
            Your <strong>Homes &amp; Searches</strong>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-paper/70">
            Saved on this device, no account needed. Turn on email alerts below and we&rsquo;ll
            watch the market for you.
          </p>
        </div>
      </header>
      {/* Saved homes live in this device's storage, so there is nothing to render without
          JavaScript. Say so and give a way forward instead of a permanent "Loading…" — the
          same treatment /search already gets. */}
      <noscript>
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <p className="text-xl font-light text-ink">
            Your saved homes are kept in this browser, which needs JavaScript turned on.
          </p>
          <p className="mt-2 text-sm text-stone">
            Turn it on to see them again, or call us at{" "}
            <a href={SITE.phoneHref} className="font-bold text-ink underline underline-offset-2">
              {SITE.phone}
            </a>{" "}
            and we&rsquo;ll pull the homes you were looking at.
          </p>
        </div>
      </noscript>
      <SavedClient fixtureMode={isFixtureMode()} dataLastUpdated={dataLastUpdated} />
    </>
  );
}
