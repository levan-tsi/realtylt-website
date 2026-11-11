import type { Service } from "./types";

/** COPY key `data` on realtylt.com/ai. Deep link: /ai#data
 *
 * "at a fraction of vendor pricing" (Round B) and the invented owners at real Hudson Valley
 * addresses (Round E) are gone and stay gone.
 *
 * Round 28 (2026-11-11): re-aimed at local business owners (a commercial cleaner listing offices
 * in its towns, a roofer after a storm, a property manager finding building owners, a real estate
 * office's farm as ONE example). Two rules changed with it:
 *   - The handoff no longer sends a cold list to an AI voice. BRAND section 7 and the AI plan: an
 *     AI voice calls only after a yes; a cold list goes to a person's own calls, the business's own
 *     contact form or one email, under the do-not-call and consent rules.
 *   - No dollar figure (the brand check fails one on an AI page): the stat is the DPPA's five-year
 *     record rule, and the DPPA's minimum award is said in words.
 * Vendor names out of the copy. Re-read 2026-11-11 and saved in realtylt-agents
 * company/agents/seo/runs/r28-services/sources/skiptrace/: 18 U.S.C. 2721 (permitted purposes;
 * (b)(8) "for any purpose permitted under this subsection"; (c) "must keep for a period of 5 years
 * records identifying each person or entity that receives information and the permitted purpose"),
 * 18 U.S.C. 2724 (liquidated damages), 15 U.S.C. 1681a(d) (a consumer report is defined by the
 * purpose it is used or expected to be used for). The circulating 70 to 90 percent match-rate bands
 * are no longer repeated. */
export const skipTracingLeadGeneration: Service = {
  slug: "skip-tracing-lead-generation",
  aiKey: "data",
  name: "Skip Tracing & Lead Generation",
  tier: "flagship",

  eyebrow: "Prospecting · Lists and skip tracing",
  title: "Lead lists built fresh for the area a business works",
  lede: "Bought lead lists are old, shared with everyone who paid, and full of numbers that no longer work. We build a fresh list for the exact area and kind of customer a business wants: businesses on the map for a company that sells to offices, or property owners on chosen streets for one that works on homes. Each row gets a contact where the record has one, its source and date, and a do-not-call check, and a person decides how it is worked.",
  specs: ["built for your area", "owner and business lookups", "source and date on every row", "do-not-call checked"],
  why: "Prospecting means reaching out to find new customers, and it runs on lists. Bought lists cost a lot and go stale fast. This builds a fresh list of the businesses or owners themselves, whenever it is needed, for the area being worked, on the day it is worked, with the rules about how each row may be contacted written beside it.",
  keywords: [
    "lead generation for small business",
    "how to build a lead list",
    "skip tracing",
    "find property owner contact info",
    "real estate skip tracing software",
  ],

  seo: {
    title: "Lead generation for small business: fresh lists, skip tracing",
    description:
      "Fresh lead lists for a small business: businesses on the map or owners on chosen streets, each with a contact, its source and date, and the do-not-call check done.",
  },

  /** Round 28: a rule, not a sum (the brand check refuses a dollar figure on an AI page). It is
   * the reason every row carries its source and the account's permitted purpose is set in writing. */
  stat: {
    value: "5 years",
    label: "how long a reseller of motor vehicle record data must keep a record of who received it and for what permitted purpose",
    source: {
      text: "18 U.S.C. 2721(c), Driver's Privacy Protection Act",
      href: "https://www.law.cornell.edu/uscode/text/18/2721",
    },
  },

  figure: {
    kind: "records",
    caption: "What the pipeline does to a row, illustrated",
    headers: { before: "What the business starts with", after: "What comes back" },
    rows: [
      {
        before: "An office on the map, for a commercial cleaner",
        after: ["Business name and phone", "the contact form on its site", "an email if published", "source recorded"],
        tag: "resolved",
      },
      {
        before: "A house on a street a roofer is working",
        after: ["Owner on the deed", "one landline", "on the do-not-call list", "mail only"],
        tag: "partial",
      },
      {
        before: "A building held in a company's name",
        after: ["The company, not a person", "no number matched", "nothing appended", "flagged"],
        tag: "partial",
      },
    ],
    footnote:
      "An illustration rather than a real record. No business, no address and no telephone number here belongs to anybody. What it is showing is the last two rows: a number on the do-not-call list is marked for mail, and a result that cannot be resolved is flagged as unresolved rather than filled in with the likeliest guess.",
  },

  whatItIs: [
    "It is a pipeline that turns an area into a list a business can work. The owner names the area and the kind of customer: offices, restaurants or shops on the map for a company that sells to businesses, or the owners of homes or buildings on chosen streets for one that works on property. The system pulls the businesses or properties, then looks up a contact for each from public records and licensed data sources: a business phone and the contact form for a business, an owner name and a phone or email for a property, wherever one exists.",
    "The difference that matters is fresh versus bought. A purchased list is a snapshot of someone else's data from some point in the past, sold to everyone who paid for it. This builds the list on demand, from current sources, for the exact area being worked.",
    "It runs the same way for ten rows or ten thousand: pull, look up, check, collapse duplicates, run against the do-not-call registry and the business's own suppression list, and flag what is unreachable. Then it hands over a clean file, or writes it into the CRM, with the way each row may be contacted written beside it.",
    "It fits a business that finds customers by going out to them: a commercial cleaner, a landscaper or a bookkeeper selling to other businesses in its towns, a roofer or a solar installer working streets after a storm, a property manager looking for owners of rental buildings, a real estate office farming a neighborhood.",
  ],

  howItWorks: [
    {
      title: "We agree the area, the customer and the purpose",
      body: "Which towns or streets, which kind of business or property, and the purpose the list is for, written down once. The purpose decides which data sources may be used at all, so it comes first.",
    },
    {
      title: "Pull the businesses or properties",
      body: "Businesses come from the public map listings for that area and category; properties from the public records for the chosen streets. Most people do this part by hand with a spreadsheet and an afternoon, and it is the part that scales the worst.",
    },
    {
      title: "Look up a contact for every row",
      body: "A business resolves to its published phone, its website's contact form and any email it publishes. A property resolves to the owner on the record, with a phone or email where the file has one. A trust or a company resolves to whatever the record actually names, which is often not a person anybody can ring, and it comes back flagged rather than smoothed over.",
    },
    {
      title: "Record where every value came from",
      body: "Every row carries its source and the date it was looked up. The permitted purpose the data account operates under is agreed in writing at the start. Resellers of motor vehicle record data must keep the purpose on file for five years, so the answer exists, and it is a fair question to ask before signing anything.",
    },
    {
      title: "Check, suppress and clean before anyone reaches out",
      body: "Numbers are checked, duplicates collapsed and thin rows flagged rather than padded out. Then the list is run against the business's own suppression list and the national do-not-call registry, and each row is marked with how it may be contacted: a call by a person, the business's contact form, one email, or mail only.",
    },
    {
      title: "Hand it to a person, not to a robot dialer",
      body: "The finished list lands in the CRM for the team to work: the business's own calls, its contact forms, one email. An AI voice calls only people who have said yes to that kind of call. A cold list never goes to an automatic dialer.",
    },
  ],

  handoff: {
    provides: [
      "The area and the kind of customer the business wants to reach.",
      "The purpose of the list, in writing, for the data account.",
      "The business's own suppression list: people and businesses who asked not to be contacted.",
      "The person or people who will work the list.",
    ],
    approves: [
      "The list before anyone is contacted, row counts and all.",
      "Every first message, call script or letter.",
      "How each row may be contacted, by a person, before it is used.",
      "Every removal request, honored the same day.",
    ],
  },

  useCases: [
    {
      title: "A commercial cleaner listing the offices in its towns",
      body: "Pick the towns and the kinds of office. The pipeline returns each business with its phone, its contact form and any published email, so the owner can write through the form or call, one business at a time, this week.",
    },
    {
      title: "A roofer working the streets after a storm",
      body: "Pick the streets. The pipeline returns the owners on the record with whatever contact the file has, marked by what the rules allow: a call by a person, or mail where the number is on the do-not-call list.",
    },
    {
      title: "A property manager finding owners of rental buildings",
      body: "An owner who does not live at the property is the case where the mailing address on the roll is most likely to be out of date, and exactly the case a trace is for. It gives a way to reach them. It says nothing about whether they want a manager.",
    },
    {
      title: "A real estate office farming a neighborhood",
      body: "The streets an office wants to work become a list of owners it can actually reach, so a farm becomes something to work this week, not a mailer sent in hope. Whether anyone wants to move is the first thing to find out, not something to assume.",
    },
    {
      title: "Filling a call list without buying one",
      body: "A vendor's list is stale and was sold to everyone else who paid for it. Instead, a fresh list covers the exact area being worked, on the day it is going to be worked.",
    },
  ],

  limits: [
    "It does not promise a match rate. Rates vary by area and by how much public record sits behind each row. No honest provider quotes 100 percent. Ask for a measured rate on a sample of the business's own area before signing anything.",
    "It does not resolve everything cleanly. Trusts, companies and recently transferred properties come back flagged, marked partial or unreachable, not padded out with a guess.",
    "It does not give permission to call or text. Do-not-call registrations, consent rules and opt-out requests apply to these results exactly as they apply to any other list.",
    "It does not hand a cold list to an AI voice. An AI voice calls only people who said yes to that kind of call; everyone else is a person's call, a contact form, one email or mail.",
    "It does not answer the legal question about the business's own use. The federal rules attach to the person who obtains and uses the information: where it may come from and what it may be used for. A provider's terms allocate risk between the provider and the business. They do not settle that.",
    "It does not guarantee a number still reaches that person. A lookup reports the best answer in the file at the moment it is asked, and telephone numbers get disconnected and reassigned to other people all the time.",
    "It does not stay current. A list is true on the day it is built, so a list used weeks later is checked against the do-not-call registry and the suppression list again before anyone reaches out.",
    "It does not give anybody a reason to buy. A fresh list is a starting position. What the business says when someone answers is still the whole job.",
  ],

  faqs: [
    {
      q: "How do I build a lead list for a small business?",
      a: "Decide the area and the exact kind of customer first, then pull them from public sources: map listings for businesses, public records for property owners. Look up a contact for each, record where each value came from, and run the list against the do-not-call registry and your own suppression list before anyone reaches out. A short list of the right customers beats a long list of everyone.",
    },
    {
      q: "What is skip tracing?",
      a: "Skip tracing means taking a property address and finding the current owner's contact details: their name, a working phone number and, where one exists, an email address. It turns a list of properties into a list of people, which is useful for any business that works on homes or buildings, not only for real estate.",
    },
    {
      q: "How accurate is automated skip tracing?",
      a: "Match rates vary by area and by how much public record exists behind the property, and no honest provider promises 100 percent. The figures that circulate come from companies that sell skip tracing, or pages ranking them, and none we opened states a sample, so there is no independent measurement to quote. Two things matter more than any headline rate: a phone hit rate and a connect rate are different quantities, and the second is lower; and what happens to the misses, which here are flagged as partial or unreachable rather than handed over as leads.",
    },
    {
      q: "Can I find a property owner's phone number from just the address?",
      a: "Often, and the rate depends entirely on the area. Public records tie the address to an owner on the record, and licensed data sources then resolve that owner to a phone number and, where one exists, an email. Trusts, companies and recently transferred properties resolve less cleanly and come back flagged. The figure worth having is a measured one, on a sample of your own area.",
    },
    {
      q: "Is skip tracing legal?",
      a: "It is not one act, so it does not have one answer. Reading a deed or a tax roll is plainly fine, because those records are public by law. The appended contact details are the part that carries rules. The Driver's Privacy Protection Act covers anything derived from a state motor vehicle record and permits release only for a listed set of purposes, with a minimum award per person set in the statute when it is broken. The Fair Credit Reporting Act defines a consumer report by the purpose it is used or expected to be used for. Both attach to the person obtaining and using the data rather than to the tool. This is not legal advice. Two questions are worth putting to any provider in writing: which permitted purpose the account is established under, and whether anything supplied derives from a consumer reporting agency.",
    },
    {
      q: "Does using a licensed provider make it safe?",
      a: "It makes it accountable, which is worth having, and is not the same thing. A licence means there is a regulator, a record and something to lose. What it does not do is create a permitted purpose the statute does not list: the clause granting licensed investigators access grants it only for purposes already permitted elsewhere in the same subsection. Ask the licensing question, then ask separately what purpose the account sits under.",
    },
    {
      q: "Can an AI call the list for me?",
      a: "Not a cold list. An AI voice calls only people who have given consent for that kind of call, which a list built from records does not carry. The list is worked by a person: the business's own calls within the do-not-call rules, its contact form, one email, or mail. An AI assistant can take over after someone says yes, to set a time.",
    },
    {
      q: "How is this different from buying a lead list?",
      a: "A bought list is old and shared: compiled at some point in the past and sold to everyone who paid, so the same people get the same calls from several businesses in the same week. This builds the list on demand, for the area being worked, on the day it is worked, and the business pays for the lookups rather than for a middleman's margin on a file that was already resold.",
    },
    {
      q: "What happens to the list after it is built?",
      a: "It lands wherever the team works it: the CRM, a short email sequence for the rows that may be emailed, or a call list for a person. Each row carries how it may be contacted, so nobody has to remember the rules while working it. Building the list only pays if someone works it well, so the handoff is part of the build, not an afterthought.",
    },
    {
      q: "How many records can it process?",
      a: "It runs the same path for ten rows or ten thousand. The practical limit is the lookup budget and how many people the team can actually reach out to well, not the pipeline.",
    },
  ],

  /** Its own post was removed on 2026-10-31 at the owner's word ("skip tracing should not be a
   * blog"), so the list starts with the post about what a business may do with a list once it has
   * one. Two cards: RelatedPosts is a two-column grid. */
  relatedPosts: [
    "marketing-automation-real-estate-email-deliverability",
    "workflow-automation-real-estate-business",
  ],
};
