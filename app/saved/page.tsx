import type { Metadata } from "next";
import { SavedClient } from "@/components/search/SavedClient";
import { SavedHeroNote } from "@/components/search/SavedHeroNote";
import { getDataLastUpdated, isFixtureMode } from "@/lib/idx";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Saved | Your Homes & Searches",
  description:
    "Homes you've hearted and searches you've saved, kept on this device. Save a search and turn on email alerts to hear about new matches first.",
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
          {/* Auth-aware: "on this device" is false for a signed-in visitor, whose saves are
              account-bound. SavedHeroNote carries both truthful versions. */}
          <SavedHeroNote />
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
          <p className="mt-2 t-small text-stone">
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
