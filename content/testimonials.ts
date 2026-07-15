/** Client testimonials — Google reviews named in the brief (§6 Selling). Quote lead lines
 * match the live home page. Google reviews link shared with /reviews. */

export const GOOGLE_REVIEWS_URL =
  "https://www.google.com/maps/search/?api=1&query=RealtyLT+Levan+Tsiklauri+United+Real+Estate+Lagrangeville+NY";

export interface Testimonial {
  name: string;
  quote: string;
  detail: string;
  context: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Giorgi Sokhadze",
    quote: "We found a home we love.",
    detail:
      "Levan listened to what mattered to us, showed us homes that actually fit, and walked us through every step of the offer. We never felt rushed or pushed.",
    context: "Bought a home in Dutchess County",
  },
  {
    name: "Grace Nyambura",
    quote: "I was very impressed with the entire team.",
    detail:
      "Every question got a fast, straight answer, evenings and weekends included. The whole process felt organized from the first call to the closing table.",
    context: "Sold a home in Orange County",
  },
  {
    name: "Mariam Kereselidze",
    quote: "We are very happy with the service provided to us.",
    detail:
      "The pricing advice was spot on and the marketing brought real buyers through the door the first weekend. We'd work with Levan again without a second thought.",
    context: "Sold and bought with RealtyLT",
  },
];
