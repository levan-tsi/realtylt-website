/** Blog content collection — seeded with the 10 live post titles (docs/reference/page-inventory.json).
 * BODIES ARE PLACEHOLDERS: owner supplies final articles from Drive (CHECKPOINT.md).
 * Adding a post = add an entry here; pages generate automatically. */

export interface BlogPost {
  slug: string;
  title: string;
  date: string; // ISO
  excerpt: string;
  cover: string;
  /** Paragraphs. Placeholder until owner's Drive copy lands. */
  body: string[];
  placeholder: boolean;
}

const PLACEHOLDER_BODY = (topic: string): string[] => [
  `[Placeholder draft — the owner's final article replaces this text.]`,
  `This post will cover ${topic} for Hudson Valley homeowners and buyers — written from local experience across Dutchess, Westchester, Putnam, Rockland, Ulster and Orange counties.`,
  `In the meantime, if this topic is on your mind, call us at (917) 905-7923 or send a message from any page — we're happy to talk it through, seven days a week.`,
];

export const POSTS: BlogPost[] = [
  {
    slug: "top-5-renovations-increase-home-value-ny",
    title: "The Top 5 Renovations That Actually Increase Your Homes Value in New York",
    date: "2025-10-24",
    excerpt:
      "You watch the home improvement shows, you see the stunning transformations — but which projects actually pay you back at the closing table in New York?",
    cover: "/images/listings/house-16.jpg",
    body: PLACEHOLDER_BODY("the five renovations with the best resale return in New York — and the popular ones that don't pay back"),
    placeholder: true,
  },
  {
    slug: "first-time-home-buyer-ny-10-step-checklist",
    title: "First-Time Home Buyer in NY? Here's Your 10-Step Checklist from Start to Finish",
    date: "2025-10-24",
    excerpt:
      "From the first budget conversation to getting the keys — the ten steps every first-time New York buyer walks through, in order, with no jargon.",
    cover: "/images/listings/house-03.jpg",
    body: PLACEHOLDER_BODY("a step-by-step checklist for first-time buyers in New York, from pre-approval to closing day"),
    placeholder: true,
  },
  {
    slug: "moving-to-hudson-valley-rental-vs-buying",
    title: "Moving to the Hudson Valley: Rental vs. Buying – What Makes the Most Sense?",
    date: "2025-09-13",
    excerpt:
      "Rents keep climbing, but so do rates. Here's an honest framework for deciding whether your first Hudson Valley address should be rented or owned.",
    cover: "/images/listings/house-12.jpg",
    body: PLACEHOLDER_BODY("the rent-versus-buy math for the Hudson Valley market, including the break-even timeline"),
    placeholder: true,
  },
  {
    slug: "relocating-to-hudson-valley-newcomers-guide",
    title: "Relocating to the Hudson Valley: What Newcomers Need to Know About Small-Town Charm Meets Big-City Access",
    date: "2025-09-13",
    excerpt:
      "Metro-North lines, school districts, winters, and the difference between river towns — the honest orientation we give every family relocating from the city.",
    cover: "/images/counties/dutchess.jpg",
    body: PLACEHOLDER_BODY("what newcomers should know before relocating to the Hudson Valley — commutes, towns, and trade-offs"),
    placeholder: true,
  },
  {
    slug: "how-to-hire-best-local-movers-7-questions",
    title: "How to Hire the Best Local Movers: 7 Questions You Must Ask Before Signing",
    date: "2025-09-13",
    excerpt:
      "Not all moving companies are equal, and the cheap quote is rarely the cheap move. Seven questions that separate the pros from the problems.",
    cover: "/images/listings/house-09.jpg",
    body: PLACEHOLDER_BODY("the seven questions that protect you when hiring a local moving company"),
    placeholder: true,
  },
  {
    slug: "packing-101-pro-tips-organized-move",
    title: "Packing 101: Pro Tips and Hacks for a Faster, More Organized Move",
    date: "2025-09-12",
    excerpt:
      "Label systems, box strategy, and the one room you should pack last — practical packing habits that make unpacking almost pleasant.",
    cover: "/images/listings/house-15.jpg",
    body: PLACEHOLDER_BODY("packing strategies that save time and prevent broken-box regrets on moving day"),
    placeholder: true,
  },
  {
    slug: "ultimate-moving-checklist-8-week-guide",
    title: "The Ultimate Moving Checklist: Your 8-Week Guide to a Stress-Free Move",
    date: "2025-09-12",
    excerpt:
      "Eight weeks out to moving day, week by week — utilities, schools, address changes, and everything people remember too late.",
    cover: "/images/listings/house-18.jpg",
    body: PLACEHOLDER_BODY("an eight-week countdown checklist that keeps a move on schedule"),
    placeholder: true,
  },
  {
    slug: "lower-energy-bills-9-efficiency-tips-ny",
    title: "Lower Your Energy Bills: 9 Efficiency Tips for New York Homeowners",
    date: "2025-09-12",
    excerpt:
      "Hudson Valley winters are no joke. Nine upgrades — from free habits to smart investments — that cut heating and cooling costs in New York homes.",
    cover: "/images/listings/house-07.jpg",
    body: PLACEHOLDER_BODY("nine energy-efficiency moves for New York homeowners, ranked by cost and payback"),
    placeholder: true,
  },
  {
    slug: "new-homeowners-toolkit-9-essentials",
    title: "The Ultimate New Homeowner's Toolkit: 9 Essentials Every Owner Needs",
    date: "2025-09-12",
    excerpt:
      "The nine tools that handle ninety percent of first-year homeowner jobs — and none of them are a table saw.",
    cover: "/images/listings/house-14.jpg",
    body: PLACEHOLDER_BODY("the starter toolkit every new homeowner should own before the first squeaky hinge"),
    placeholder: true,
  },
  {
    slug: "finishing-your-basement-cost-and-value",
    title: "Thinking of Finishing Your Basement? What to Know About Cost and Value",
    date: "2025-09-12",
    excerpt:
      "Costs per square foot, permits, moisture first, and what a finished basement really adds at resale in the Hudson Valley.",
    cover: "/images/listings/house-17.jpg",
    body: PLACEHOLDER_BODY("what finishing a basement costs in our market and how much value it actually returns"),
    placeholder: true,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
