import { SITE } from "@/lib/site";

/** Legal bar — matches live: centered "Fair Housing Notice" on the #d3d6d9 strip.
 * Text darkened from live's #808080 for WCAG AA contrast on the gray bg. */
export function FairHousingBar() {
  return (
    <div className="bg-[#d3d6d9] text-center">
      <a
        href={SITE.fairHousingPdf}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-4 py-3 text-sm tracking-wide text-[#3f4952] transition-colors hover:text-ink"
      >
        Fair Housing Notice
      </a>
    </div>
  );
}
