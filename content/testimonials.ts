/** Client testimonials — the exact Google reviews from the live site's selling page
 * (owner-pasted source). Shown on /selling, /reviews and the home testimonial band.
 * The "See all our Google reviews" link points at the business's Google Maps place. */

export const GOOGLE_REVIEWS_URL =
  "https://www.google.com/maps/place/RealtyLT/@41.6725364,-73.8050651,17z/data=!3m2!4b1!5s0x89dd40542c718a3d:0xfc4a12945f0a9f4e!4m6!3m5!1s0x61ae04ec52a94131:0xdee8122eaf8cc00a!8m2!3d41.6725324!4d-73.8024902!16s%2Fg%2F11xcjcss56?entry=ttu";

export interface Testimonial {
  name: string;
  /** The full, verbatim Google review text. */
  quote: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Giorgi Sokhadze",
    quote:
      "He sold our house for the exact price we wanted without even listing it on the MLS. The process was unbelievably fast and easy. We are beyond happy and can't recommend him enough.",
  },
  {
    name: "Grace Nyambura",
    quote:
      "Working with Levan was a fantastic experience. He really understands the market, and helped me navigate a tricky negotiation. I highly recommend him!",
  },
  {
    name: "Mariam Kereselidze",
    quote:
      "We had so many questions, and Levan patiently answered every single one. His responsiveness is incredible, and it made us feel confident and secure. Highly recommend!",
  },
];
