import { FavoriteListings } from "@/components/portal/FavoriteListings";
import { isFixtureMode } from "@/lib/idx";

export default function CollectionsPage() {
  return (
    <section aria-labelledby="collections-heading">
      <h2 id="collections-heading" className="font-display text-2xl text-ink">
        Saved homes
      </h2>
      <p className="mt-1 text-sm text-stone">
        Homes you&rsquo;ve hearted, synced to your account.
      </p>
      <FavoriteListings fixtureMode={isFixtureMode()} />
    </section>
  );
}
