import { FavoriteListings } from "@/components/portal/FavoriteListings";
import { getDataLastUpdated, isFixtureMode } from "@/lib/idx";

export default async function CollectionsPage() {
  // The grid is client-rendered from saved ids, so the feed's refresh time has to come from
  // here — the attribution must not date itself off whichever homes happen to be hearted.
  const dataLastUpdated = await getDataLastUpdated(new Date().toISOString());
  return (
    <section aria-labelledby="collections-heading">
      <h2 id="collections-heading" className="font-display text-2xl text-ink">
        Saved homes
      </h2>
      <p className="mt-1 text-sm text-stone">
        Homes you&rsquo;ve hearted, synced to your account.
      </p>
      <FavoriteListings fixtureMode={isFixtureMode()} dataLastUpdated={dataLastUpdated} />
    </section>
  );
}
