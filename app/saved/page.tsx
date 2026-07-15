import type { Metadata } from "next";
import { SavedClient } from "@/components/search/SavedClient";
import { isFixtureMode } from "@/lib/idx";

export const metadata: Metadata = {
  title: "Saved | Your Homes & Searches",
  description:
    "Homes you've hearted and searches you've saved, kept on this device. Turn on email alerts to hear about new matches first.",
};

export default function SavedPage() {
  return (
    <>
      <header className="bg-ink py-10 text-paper">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-paper/60">Saved</p>
          <h1 className="mt-2 text-3xl font-light md:text-4xl">
            Your <strong className="font-bold">Homes &amp; Searches</strong>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-paper/70">
            Saved on this device, no account needed. Turn on email alerts below and we&rsquo;ll
            watch the market for you.
          </p>
        </div>
      </header>
      <SavedClient fixtureMode={isFixtureMode()} />
    </>
  );
}
