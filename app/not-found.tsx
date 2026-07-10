import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/site";

export default function NotFound() {
  return (
    <section className="bg-ink py-24 text-paper md:py-36">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-porchlight">404</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          This address isn&rsquo;t on the map.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-paper/70">
          The page you&rsquo;re looking for moved, sold, or never existed. The homes, however, are
          all still here.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/search" size="lg">Search homes</Button>
          <Button href="/" variant="outline-light" size="lg">Back to home</Button>
        </div>
        <p className="mt-8 text-sm text-paper/50">
          Or just call us: <Link href={SITE.phoneHref} className="text-porchlight hover:underline">{SITE.phone}</Link>
        </p>
      </div>
    </section>
  );
}
