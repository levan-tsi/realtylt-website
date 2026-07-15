import type { Service } from "@/content/services/types";

/** One row in a service page's table of contents. Unlike the blog (headings parsed out of
 * markdown), the service sections are known and fixed, so this is a curated list. The `id`
 * matches the `id` on the corresponding <section>; the `label` is the short nav word. */
export interface ServiceTocItem {
  id: string;
  label: string;
}

/** The on-page table of contents for a service, in document order.
 *
 * Hero, the outcome band, the lead form and "more services" do not earn a row — they are not
 * sections a reader navigates back to. "Watch it" only appears once a walkthrough is attached
 * (the same field that renders <VideoBlock> and emits the VideoObject JSON-LD), so the ToC can
 * never link to a section that is not on the page. Keep the ids in sync with the `id=` on each
 * service section component. */
export function serviceTocItems(service: Service): ServiceTocItem[] {
  const items: ServiceTocItem[] = [
    { id: "what-it-is", label: "What it is" },
    { id: "how-it-works", label: "How it works" },
    { id: "use-cases", label: "Use cases" },
    { id: "see-it-live", label: "See it live" },
  ];
  if (service.video) items.push({ id: "watch-it", label: "Watch it" });
  items.push({ id: "faq", label: "FAQ" });
  return items;
}
