/** County pages content — ORIGINAL localized copy (spec §3, brief §8 SEO improvement).
 * Voice: professional + human, plain words. Median prices are indicative 2026 figures;
 * owner can tune as the market moves. Geographic order: south → north along the Hudson. */

import type { CountySlug } from "@/lib/site";

export interface CountyContent {
  slug: CountySlug;
  name: string;
  short: string;
  tagline: string;
  heroImage: string;
  medianPrice: number;
  /** Position on the Valley Line map, percentages of the map box. */
  map: { left: number; top: number; side: "west" | "east" };
  commute: string;
  overview: string;
  lifestyle: string;
  whyBuy: string[];
  towns: string[];
}

export const COUNTY_CONTENT: CountyContent[] = [
  {
    slug: "westchester",
    name: "Westchester County",
    short: "Westchester",
    tagline: "The classic first step out of the city",
    heroImage: "/images/counties/westchester.jpg",
    medianPrice: 920_000,
    map: { left: 69, top: 86, side: "east" },
    commute:
      "Three Metro-North lines — Hudson, Harlem, and New Haven — put most of the county 30 to 55 minutes from Grand Central. Express trains from White Plains run under 40 minutes.",
    overview:
      "Westchester is the most established market we cover: strong school districts, walkable downtowns, and housing stock that runs from Yonkers lofts to Scarsdale Tudors. Inventory moves fast and pricing is competitive — homes that show well still draw multiple offers in most villages.",
    lifestyle:
      "Weekends here look like farmers markets in Tarrytown, the Rockefeller State Park trails, Long Island Sound beaches in Rye, and a restaurant scene that no longer needs the city. Every town has its own personality — part of the fun is finding yours.",
    whyBuy: [
      "The widest choice of school districts in the region",
      "True commuter towns — leave your car at the station",
      "Deep, liquid market: easier to sell when life changes",
      "Villages with real downtowns, not just strip malls",
    ],
    towns: ["Yonkers", "White Plains", "New Rochelle", "Tarrytown", "Ossining", "Peekskill", "Mount Kisco", "Katonah", "Scarsdale", "Chappaqua"],
  },
  {
    slug: "rockland",
    name: "Rockland County",
    short: "Rockland",
    tagline: "River villages and mountain parks, west of the Hudson",
    heroImage: "/images/counties/rockland.jpg",
    medianPrice: 780_000,
    map: { left: 21, top: 72, side: "west" },
    commute:
      "About 45–70 minutes to Manhattan: NJ Transit trains from Suffern, Nanuet and Pearl River into Penn Station (via Secaucus), express buses over the George Washington Bridge, and the Mario Cuomo Bridge to the Metro-North Hudson line.",
    overview:
      "Rockland is the smallest county in New York outside the boroughs — and it packs river villages, mountain parks, and solid family suburbs into that footprint. Buyers who want Westchester convenience at a friendlier price point land here.",
    lifestyle:
      "Life happens outdoors: Harriman State Park's lakes and trails, the Nyack riverfront and its Main Street, Piermont's pier and bike culture. Add strong downtowns in Nyack and Pearl River, and diverse communities that make good neighbors.",
    whyBuy: [
      "More house per dollar than across the river",
      "Harriman and Bear Mountain parks as a backyard",
      "Strong school districts in Clarkstown and Pearl River",
      "Real villages with waterfronts, marinas, and Main Streets",
    ],
    towns: ["New City", "Nyack", "Nanuet", "Suffern", "Pearl River", "Stony Point", "Piermont", "Congers", "Haverstraw"],
  },
  {
    slug: "putnam",
    name: "Putnam County",
    short: "Putnam",
    tagline: "Lake country in the Hudson Highlands",
    heroImage: "/images/counties/putnam.jpg",
    medianPrice: 610_000,
    map: { left: 66, top: 56, side: "east" },
    commute:
      "Metro-North's Hudson line serves Cold Spring and Garrison; the Harlem line serves Brewster and Southeast. Plan on 60–80 minutes to Grand Central — with some of the prettiest train views in America.",
    overview:
      "Putnam sits between Westchester's polish and Dutchess's countryside: lake communities, Highlands hiking, and villages like Cold Spring that draw weekenders from the city. Prices are gentler than its southern neighbor, and the pace is too.",
    lifestyle:
      "This is lake-and-trail living — Mahopac and Oscawana for boating, Breakneck Ridge and Bull Hill for hiking, Cold Spring's antique row for slow Saturdays. Homes range from vintage lake cottages to substantial colonials on wooded acres.",
    whyBuy: [
      "Lakes and Highlands trails without leaving the county",
      "Cold Spring and Garrison: river villages with direct trains",
      "A meaningful price step down from Westchester",
      "Small-town scale — you'll know your neighbors",
    ],
    towns: ["Carmel", "Mahopac", "Brewster", "Cold Spring", "Garrison", "Putnam Valley", "Patterson", "Kent"],
  },
  {
    slug: "orange",
    name: "Orange County",
    short: "Orange",
    tagline: "Room to grow on the Hudson's west bank",
    heroImage: "/images/counties/orange.jpg",
    medianPrice: 480_000,
    map: { left: 20, top: 50, side: "west" },
    commute:
      "NJ Transit/Metro-North's Port Jervis line runs from Middletown, Goshen and Harriman; ferry-plus-train options run from Newburgh via Beacon. Stewart International handles flights. Most commutes land in the 75–95 minute range.",
    overview:
      "Orange County is where Hudson Valley value lives: first-time buyers, growing families, and investors all find room here. Newburgh's historic architecture is being restored block by block, Warwick anchors a genuine farm-and-winery belt, and new construction actually exists.",
    lifestyle:
      "Storm King Art Center, West Point football Saturdays, pick-your-own orchards in Warwick, the Heritage Trail by bike. Towns here still feel like towns — diners, main streets, and school pride included.",
    whyBuy: [
      "The most attainable prices in our six counties",
      "Newburgh's restoration story — equity with upside",
      "Warwick and Goshen: storybook villages with land",
      "New-build inventory that's rare east of the river",
    ],
    towns: ["Newburgh", "Middletown", "Goshen", "Warwick", "Monroe", "Cornwall-on-Hudson", "Montgomery", "Chester", "Washingtonville"],
  },
  {
    slug: "dutchess",
    name: "Dutchess County",
    short: "Dutchess",
    tagline: "Our home county — river towns to horse country",
    heroImage: "/images/counties/dutchess.jpg",
    medianPrice: 520_000,
    map: { left: 68, top: 27, side: "east" },
    commute:
      "Metro-North's Hudson line ends at Poughkeepsie (about 1:45 to Grand Central; under 1:30 express), with Beacon a popular stop. Amtrak from Poughkeepsie reaches Penn Station in around 90 minutes.",
    overview:
      "Dutchess is where RealtyLT is based, and it shows the whole Hudson Valley story in one county: Beacon's art-town energy, Poughkeepsie's riverfront revival, Rhinebeck's polish, and quiet horse-country hamlets around Millbrook. Values here have room to run compared to the counties south of us.",
    lifestyle:
      "Walk the rail trail to the Walkway Over the Hudson, catch a show at the Bardavon, eat well in Beacon and Rhinebeck, and be at a farm stand in ten minutes from almost anywhere. It's the balance point between culture and countryside.",
    whyBuy: [
      "Anchor towns with direct trains: Beacon and Poughkeepsie",
      "Prices that still leave room for equity growth",
      "Vassar, Marist, and the CIA steady the local economy",
      "Your agent lives here — street-level knowledge included",
    ],
    towns: ["Poughkeepsie", "Beacon", "Fishkill", "Wappingers Falls", "Hyde Park", "Rhinebeck", "Red Hook", "Pawling", "Millbrook", "Lagrangeville"],
  },
  {
    slug: "ulster",
    name: "Ulster County",
    short: "Ulster",
    tagline: "Catskills edge, creative heart",
    heroImage: "/images/counties/ulster.jpg",
    medianPrice: 470_000,
    map: { left: 22, top: 20, side: "west" },
    commute:
      "No commuter rail west of the river — most Ulster buyers drive, take Trailways from Kingston or New Paltz (about 2 hours to Port Authority), or cross the bridge to Poughkeepsie's Metro-North. Remote-friendly is the honest label.",
    overview:
      "Ulster is the Hudson Valley at its most independent: Kingston's historic districts and food scene, New Paltz under the Shawangunk cliffs, Woodstock's arts legacy, and Catskills hamlets where the money goes further than anywhere else we work.",
    lifestyle:
      "Climb or watch the climbers at the Gunks, swim at Minnewaska, gallery-hop in Kingston's Rondout, ski Belleayre in an hour. The creative community is real, the farm-to-table label is earned, and stone houses from the 1700s are an actual housing category.",
    whyBuy: [
      "The best value per acre in our territory",
      "Kingston: a small city with big-city food and culture",
      "Remote-work paradise — space, views, fiber in the towns",
      "Four-season recreation from the Gunks to Belleayre",
    ],
    towns: ["Kingston", "New Paltz", "Woodstock", "Saugerties", "Highland", "Stone Ridge", "Marlboro", "Gardiner", "Phoenicia"],
  },
];

export function getCounty(slug: string): CountyContent | undefined {
  return COUNTY_CONTENT.find((c) => c.slug === slug);
}
