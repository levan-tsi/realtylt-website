/** Placeholder home — proves tokens/fonts/shell render. Replaced by the full page in Phase B. */
export default function Home() {
  return (
    <section className="bg-ink text-paper">
      <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-start justify-center px-4 py-24 lg:px-8">
        <p className="font-mono text-sm tracking-[0.3em] text-porchlight uppercase">
          Hudson Valley · New York
        </p>
        <h1 className="mt-4 font-display text-6xl font-medium md:text-8xl">
          Let&rsquo;s Find <span className="text-porchlight">Home</span>
        </h1>
        <p className="mt-6 max-w-xl text-paper/70">
          Site under construction — full experience arrives in Phase B.
        </p>
      </div>
    </section>
  );
}
