/** The plan quiz's pure core (design: docs/parity/DESIGN-ROUND24.md).
 *
 * Owner's ask: "popup quiz with shapes that u can choose to help you plan your journy more
 * and for us to get more info." This module is everything about the quiz that is a FACT —
 * the steps, the honest option vocabularies, and planFor(), which turns answers into the
 * tailored plan: a price ceiling computed by priceForMonthly (the same calcMortgage as
 * /financing, so the two can never disagree), the next concrete stage, and a /search URL
 * built ONLY from whitelisted facet tokens. The takeover component renders this; it never
 * decides it. */

import { priceForMonthly } from "@/lib/mortgage";
import { SERVED_AREAS, type CountySlug } from "@/lib/site";

export type QuizPath = "buying" | "selling" | "both";
export type QuizTimeline = "now" | "soon" | "later";
export type QuizPreapproval = "yes" | "not-yet" | "cash";
/** The sale home types the quiz offers — HOME_TYPE_OPTS minus rental-only. */
export type QuizHomeType = "house" | "condo" | "coop" | "multi-family";

export interface QuizAnswers {
  path?: QuizPath;
  timeline?: QuizTimeline;
  /** Monthly payment comfort, USD. */
  monthly?: number;
  preapproval?: QuizPreapproval;
  areas?: CountySlug[];
  homeType?: QuizHomeType;
  mustHaves?: MustHaveKey[];
}

/** The same assumptions BudgetBridge starts from — one bridge, one answer. */
export const QUIZ_BRIDGE = { downPct: 20, ratePct: 6, termYears: 30 } as const;

/** Monthly comfort options. The floor clears fixed costs at the assumptions above; the
 * ceiling matches the bridge's own ladder top. */
export const MONTHLY_OPTIONS = [1500, 2000, 2500, 3200, 4000, 5000, 6500, 8000, 10000] as const;

/** Must-haves the search can genuinely obey — every key maps to a real generated column's
 * URL param (garage rides garageMin). Nothing the search cannot answer is offered. */
export const MUST_HAVES: { key: string; label: string; param: string; value: string }[] = [
  { key: "centralAir", label: "Central air", param: "centralAir", value: "1" },
  { key: "basement", label: "Basement", param: "basement", value: "1" },
  { key: "garage", label: "Garage", param: "garageMin", value: "1" },
  { key: "firstFloorBed", label: "First-floor bedroom", param: "firstFloorBed", value: "1" },
  { key: "municipalUtilities", label: "Municipal water and sewer", param: "municipalUtilities", value: "1" },
  { key: "nearTransit", label: "Near public transit", param: "nearTransit", value: "1" },
  { key: "waterfront", label: "Waterfront or water access", param: "waterfront", value: "1" },
];
export type MustHaveKey = (typeof MUST_HAVES)[number]["key"];

/** Price ceiling for a monthly budget under the bridge assumptions — floored to $5k by
 * priceForMonthly itself, so the number reads like a budget. */
export function ceilingFor(monthly: number): number {
  return priceForMonthly(monthly, QUIZ_BRIDGE);
}

/** One quiet sentence stating what the ceiling assumes. Lives here so the quiz and any
 * future surface print the identical assumptions. */
export const CEILING_ASSUMPTIONS = `${QUIZ_BRIDGE.downPct}% down · ${QUIZ_BRIDGE.ratePct}% rate · ${QUIZ_BRIDGE.termYears} years · taxes estimated`;

/** The /search URL the plan hands over. County rides only when exactly ONE area was chosen
 * (the URL speaks one county; several chosen areas each get their own link via areaLinks).
 * Every param is a token parseFilterParams accepts — tested by round-trip. */
export function searchUrlFor(a: QuizAnswers): string {
  const q = new URLSearchParams();
  if (a.areas?.length === 1) q.set("county", a.areas[0]);
  if (a.homeType) q.set("homeType", a.homeType);
  if (a.monthly) {
    const ceiling = ceilingFor(a.monthly);
    if (ceiling > 0) q.set("priceMax", String(ceiling));
  }
  for (const key of a.mustHaves ?? []) {
    const mh = MUST_HAVES.find((m) => m.key === key);
    if (mh) q.set(mh.param, mh.value);
  }
  const qs = q.toString();
  return qs ? `/search?${qs}` : "/search";
}

/** Per-area search links for a multi-area pick — same filters, one county each. */
export function areaLinks(a: QuizAnswers): { slug: CountySlug; name: string; url: string }[] {
  return (a.areas ?? []).flatMap((slug) => {
    const area = SERVED_AREAS.find((c) => c.slug === slug);
    if (!area) return [];
    return [{ slug, name: area.name, url: searchUrlFor({ ...a, areas: [slug] }) }];
  });
}

export interface PlanModel {
  /** null when no monthly was chosen (the step is skippable). */
  ceiling: { monthly: number; price: number; assumptions: string } | null;
  /** The next concrete stage, in the visitor's situation, not a generic list. */
  nextStage: { title: string; body: string; href: string; label: string };
  searchUrl: string;
  areaLinks: { slug: CountySlug; name: string; url: string }[];
  /** Sellers (and Both) get the valuation hand-off. */
  showHomeValue: boolean;
}

/** Answers → the tailored plan. Deterministic and total: every combination of skipped
 * steps still yields a usable plan. */
export function planFor(a: QuizAnswers): PlanModel {
  const buying = a.path !== "selling";
  const ceiling =
    buying && a.monthly
      ? { monthly: a.monthly, price: ceilingFor(a.monthly), assumptions: CEILING_ASSUMPTIONS }
      : null;

  let nextStage: PlanModel["nextStage"];
  if (!buying) {
    nextStage = {
      title: "Price the home you have",
      body:
        a.timeline === "later"
          ? "A year out is the right time to know your number. Start with a valuation now, and the plan for repairs, timing and listing follows from it."
          : "Selling starts with one number. Get the valuation, and the preparation, pricing and listing plan follow from it.",
      href: "/home-value",
      label: "See your home value",
    };
  } else if (a.preapproval === "yes" || a.preapproval === "cash") {
    nextStage = {
      title: "Search with the map",
      body: "Your financing is settled, so the search is the work now. Heart the homes you like and save the search; the criteria travel with you.",
      href: "/search",
      label: "Search listings",
    };
  } else if (a.timeline === "later") {
    nextStage = {
      title: "Watch the market from here",
      body: "Next year starts today at zero cost: save a search for the areas below and watch what actually sells, so when you are ready the prices already make sense to you.",
      href: "/search",
      label: "Save a search",
    };
  } else {
    nextStage = {
      title: "Get the pre-approval letter",
      body: "In this market an offer without a letter is a weaker offer, and most lenders can issue one within a day or two. It also firms up the ceiling below from an estimate into a number.",
      href: "/financing",
      label: "Financing, explained",
    };
  }

  return {
    ceiling,
    nextStage,
    searchUrl: searchUrlFor(a),
    areaLinks: areaLinks(a),
    showHomeValue: a.path === "selling" || a.path === "both",
  };
}
