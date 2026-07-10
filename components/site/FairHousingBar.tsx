import { SITE } from "@/lib/site";

/** Legal top bar — required notice, links to the NYS Fair Housing PDF (brief §1). */
export function FairHousingBar() {
  return (
    <div className="bg-ink text-paper/80 text-center text-xs tracking-wide">
      <a
        href={SITE.fairHousingPdf}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-4 py-1.5 hover:text-porchlight transition-colors"
      >
        Fair Housing Notice
      </a>
    </div>
  );
}
