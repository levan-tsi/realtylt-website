import type { Service } from "@/content/services/types";

/** The H2 of each shared section of a service page, as the question an owner asks, naming the
 * service (search rules pass, round 30: RULES.md section 2, "H2s are the questions people ask,
 * in the words they use"; "every section stands alone: its heading names the service").
 * The sentence is built from `service.noun` (with its article, "an AI receptionist"), because
 * the service `name` is a label ("AI Voice Agents") and does not read in a sentence.
 * `lead` + `strong` + `tail` is the heading as the page prints it (the strong part keeps the
 * site's light-next-to-bold look); `text` is the same string joined, for tests and the export. */
export interface ServiceHeading {
  lead: string;
  strong: string;
  tail: string;
  text: string;
}

function h(lead: string, strong: string, tail = ""): ServiceHeading {
  return { lead, strong, tail, text: `${lead}${strong}${tail}` };
}

export function serviceHeadings(service: Pick<Service, "noun">) {
  const n = service.noun;
  return {
    why: h(`Why does an owner need ${n}?`, ""),
    whatItIs: h(`What is ${n}, `, "in plain terms", "?"),
    howItWorks: h(`How does ${n} work, `, "step by step", "?"),
    useCases: h(`Where does ${n} `, "pay off", "?"),
    limits: h(`What does ${n} `, "not do", "?"),
    live: h(`Can I try ${n} `, "on the live demo", "?"),
    faq: h(`What questions do owners `, "ask", ` about ${n}?`),
    related: h(`Where can I read more about ${n}`, "", "?"),
  };
}
