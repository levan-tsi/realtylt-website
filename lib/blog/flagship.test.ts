import { describe, expect, it } from "vitest";
import { AI_CHAT_FLAGSHIP } from "@/content/blog/ai-chat-scenes";
import { AI_VOICE_FLAGSHIP } from "@/content/blog/voice-agent-scenes";
import { REACTIVATION_FLAGSHIP } from "@/content/blog/reactivation-scenes";
import { QUALIFY_FLAGSHIP } from "@/content/blog/qualify-scenes";
import { WORKFLOW_FLAGSHIP } from "@/content/blog/workflow-scenes";
import { REVIEW_FLAGSHIP } from "@/content/blog/review-scenes";
import { BOOKING_FLAGSHIP } from "@/content/blog/booking-scenes";
import { LOCAL_SEO_FLAGSHIP } from "@/content/blog/local-seo-scenes";
import { GEO_PAGES_FLAGSHIP } from "@/content/blog/geo-pages-scenes";
import { CRM_SYNC_FLAGSHIP } from "@/content/blog/crm-sync-scenes";
import { AGENT_WORKFORCE_FLAGSHIP } from "@/content/blog/agent-workforce-scenes";
import { SKIP_TRACING_FLAGSHIP } from "@/content/blog/skip-tracing-scenes";
import { MARKETING_AUTOMATION_FLAGSHIP } from "@/content/blog/marketing-automation-scenes";
import { DOCUMENT_PROCESSING_FLAGSHIP } from "@/content/blog/document-scenes";
import { DATA_ENRICHMENT_FLAGSHIP } from "@/content/blog/enrichment-scenes";
import { SCHEDULING_FLAGSHIP } from "@/content/blog/scheduling-scenes";
import { INVOICING_FLAGSHIP } from "@/content/blog/invoicing-scenes";
import { CLONE_FLAGSHIP } from "@/content/blog/clone-scenes";
import { AUDIT_FLAGSHIP } from "@/content/blog/audit-scenes";
import { CUSTOM_FLAGSHIP } from "@/content/blog/custom-scenes";
import { SINGULARITY_FLAGSHIP } from "@/content/blog/singularity-scenes";
import {
  AI_AGENT_WORKFORCE_POST,
  AI_APPOINTMENT_BOOKING_POST,
  AI_CHAT_ASSISTANT_POST,
  AI_VOICE_AGENTS_POST,
  CRM_SYNC_POST,
  DATABASE_REACTIVATION_POST,
  DATA_ENRICHMENT_POST,
  AI_SCHEDULING_POST,
  INVOICING_POST,
  AI_AUDIT_POST,
  CUSTOM_AUTOMATION_POST,
  AI_CLONE_POST,
  DOCUMENT_PROCESSING_POST,
  GEO_LANDING_PAGES_POST,
  LEAD_QUALIFICATION_POST,
  LOCAL_SEO_POST,
  MARKETING_AUTOMATION_POST,
  REVIEW_AUTOMATION_POST,
  SINGULARITY_POST,
  SKIP_TRACING_POST,
  WORKFLOW_AUTOMATION_POST,
} from "@/content/blog/ai-posts";
import { flagshipToc, type FlagshipContent } from "./flagship";
import { parseOutline } from "./markdown";
import { parseHeadings } from "./toc";

const outline = parseOutline(AI_CHAT_ASSISTANT_POST);

describe("parseOutline", () => {
  it("interleaves scenes and headings in document order", () => {
    const kinds = new Set(outline.map((e) => e.kind));
    expect(kinds).toEqual(new Set(["scene", "heading"]));
    // The reel is placed before the first prose heading in the body.
    const firstScene = outline.findIndex((e) => e.kind === "scene");
    const firstHeading = outline.findIndex((e) => e.kind === "heading");
    expect(firstScene).toBeLessThan(firstHeading);
  });

  it("gives every heading the same id the page renders", () => {
    const fromOutline = outline.filter((e) => e.kind === "heading").map((e) => e.id);
    const fromHeadings = parseHeadings(AI_CHAT_ASSISTANT_POST)
      .filter((h) => h.level <= 2)
      .map((h) => h.id);
    expect(fromOutline).toEqual(fromHeadings);
  });
});

describe("flagshipToc", () => {
  /** The rail this reproduces was hand-curated until the template landed. Freezing the exact
   * list here is what proves deriving it changed nothing, and it stays as the guard: a scene
   * that loses its label, or a heading that is renamed, shows up here rather than as a rail
   * row that jumps nowhere. */
  it("derives exactly the rail the flagship shipped with", () => {
    // Every row is either a labelled scene or an H2, in document order. Asserting the whole rail
    // rather than its length is what catches a renamed heading whose short label was not renamed
    // with it: that leaves the row pointing at a live anchor with the full 58-character heading
    // as its label, which is not a rail, and it is exactly what happened when this post was
    // raised to the standard on 2026-08-02.
    expect(flagshipToc(outline, AI_CHAT_FLAGSHIP)).toEqual([
      { id: "scene-reel", label: "Watch it", scene: true },
      { id: "the-number-everyone-quotes-and-where-it-actually-comes-from", label: "The number" },
      { id: "scene-response-gap", label: "The gap", scene: true },
      { id: "scene-leads-calculator", label: "Your numbers", scene: true },
      { id: "what-an-ai-chat-assistant-actually-does", label: "What it does" },
      { id: "scene-four-moves", label: "Four moves", scene: true },
      { id: "what-makes-an-answer-true-which-is-the-whole-job", label: "True answers" },
      { id: "the-part-nobody-selling-you-a-chat-widget-mentions", label: "The fine print" },
      { id: "what-it-costs-and-how-long-it-takes", label: "What it costs" },
      { id: "how-to-test-one-before-you-buy-it", label: "How to test one" },
      { id: "what-it-does-not-do-and-should-not-pretend-to", label: "What it will not do" },
      { id: "scene-teardown", label: "The teardown", scene: true },
      { id: "common-questions-answered-honestly", label: "Common questions" },
      { id: "where-it-goes-wrong", label: "Where it goes wrong" },
      { id: "scene-system-diagram", label: "What it connects to", scene: true },
      { id: "what-to-do-about-it", label: "What to do" },
    ]);
  });

  /** The same freeze for topic 6. One frozen rail proved its worth on 2026-08-02, when a
   * renamed heading left its short label pointing at a dead anchor and the rail printed the
   * full 58-character heading instead of "The number". That failure mode is per-post, so the
   * guard has to be per-post: the table-driven contract below checks that every label points
   * at a heading that EXISTS, and only a freeze like this one checks that the rail a reader
   * actually sees is the rail somebody intended. */
  it("derives exactly the rail the review automation post shipped with", () => {
    const reviewOutline = parseOutline(REVIEW_AUTOMATION_POST);
    expect(flagshipToc(reviewOutline, REVIEW_FLAGSHIP)).toEqual([
      { id: "the-number-this-is-usually-sold-on-and-why-it-is-not-in-here", label: "The number" },
      { id: "scene-thresholds", label: "What they need", scene: true },
      { id: "what-a-stranger-actually-does-with-your-profile", label: "The scan" },
      { id: "what-one-extra-star-was-worth-in-the-only-study-that-measured-money", label: "The one study" },
      { id: "scene-yelp-lift", label: "The money", scene: true },
      { id: "why-the-ask-does-not-happen", label: "Why nobody asks" },
      { id: "what-review-automation-actually-does", label: "What it does" },
      { id: "scene-the-ask", label: "The four", scene: true },
      { id: "the-line-you-may-not-cross-and-exactly-where-it-is", label: "The line" },
      { id: "scene-gating-line", label: "Both sides", scene: true },
      { id: "the-federal-half-which-is-about-your-own-website", label: "Your own site" },
      { id: "scene-review-calculator", label: "Your numbers", scene: true },
      { id: "what-to-do-when-the-review-is-genuinely-bad", label: "The bad one" },
      { id: "how-to-test-one-before-you-buy-it", label: "How to test one" },
      { id: "what-it-costs-and-how-long-it-takes", label: "Cost and time" },
      { id: "what-it-does-not-do-and-should-not-pretend-to", label: "What it will not do" },
      { id: "common-questions-answered-honestly", label: "Common questions" },
      { id: "what-to-do-about-it", label: "What to do" },
    ]);
  });

  /** And the same freeze for topic 7. */
  it("derives exactly the rail the appointment booking post shipped with", () => {
    const bookingOutline = parseOutline(AI_APPOINTMENT_BOOKING_POST);
    expect(flagshipToc(bookingOutline, BOOKING_FLAGSHIP)).toEqual([
      { id: "the-gap-nobody-measures-because-it-does-not-look-like-a-loss", label: "The gap" },
      { id: "scene-lead-time", label: "The lead time", scene: true },
      { id: "why-distance-kills-an-appointment", label: "Why it dies" },
      { id: "the-second-half-which-is-the-reminder", label: "The second half" },
      { id: "scene-reminders", label: "The trial", scene: true },
      { id: "what-ai-appointment-booking-actually-does", label: "What it does" },
      { id: "scene-the-booking", label: "The booking", scene: true },
      { id: "what-reading-your-calendar-should-actually-mean", label: "Your calendar" },
      { id: "what-a-booking-is-technically-and-why-most-of-them-are-not-one", label: "What a booking is" },
      { id: "scene-booking-path", label: "The path", scene: true },
      { id: "scene-booking-calculator", label: "Your numbers", scene: true },
      { id: "what-to-do-about-the-ones-who-still-do-not-turn-up", label: "When they miss" },
      { id: "how-to-test-one-before-you-buy-it", label: "How to test one" },
      { id: "what-it-costs-and-how-long-it-takes", label: "Cost and time" },
      { id: "what-it-does-not-do-and-should-not-pretend-to", label: "What it will not do" },
      { id: "common-questions-answered-honestly", label: "Common questions" },
      { id: "what-to-do-about-it", label: "What to do" },
    ]);
  });

  /** And the same freeze for topic 8. */
  it("derives exactly the rail the local SEO post shipped with", () => {
    const localOutline = parseOutline(LOCAL_SEO_POST);
    expect(flagshipToc(localOutline, LOCAL_SEO_FLAGSHIP)).toEqual([
      { id: "the-search-that-already-happened-and-why-you-cannot-see-it", label: "The search" },
      { id: "what-google-actually-publishes-about-this", label: "What Google says" },
      { id: "scene-ranking-factors", label: "The three", scene: true },
      { id: "the-input-you-cannot-do-anything-about", label: "Distance" },
      { id: "why-the-top-of-a-very-short-list-is-worth-more-than-it-should-be", label: "The top slot" },
      { id: "scene-trust-bias", label: "The top slot", scene: true },
      { id: "what-prominence-is-made-of-and-what-it-is-not", label: "Prominence" },
      { id: "the-profile-rules-that-decide-whether-you-can-have-one-at-all", label: "The rules" },
      { id: "scene-profile-rules", label: "The rules", scene: true },
      { id: "what-local-seo-actually-does-week-to-week", label: "What it does" },
      { id: "scene-the-work", label: "The work", scene: true },
      { id: "scene-local-calculator", label: "Your numbers", scene: true },
      { id: "what-renting-the-same-attention-costs", label: "Renting it" },
      { id: "scene-paid-search", label: "The experiment", scene: true },
      { id: "what-it-costs-and-how-long-it-takes", label: "Cost and time" },
      { id: "what-it-does-not-do-and-should-not-pretend-to", label: "What it will not do" },
      { id: "how-to-find-out-where-you-actually-stand-in-ten-minutes", label: "How to check" },
      { id: "common-questions-answered-honestly", label: "Common questions" },
      { id: "what-to-do-about-it", label: "What to do" },
    ]);
  });

  /** And the same freeze for topic 9. */
  it("derives exactly the rail the area pages post shipped with", () => {
    const geoOutline = parseOutline(GEO_LANDING_PAGES_POST);
    expect(flagshipToc(geoOutline, GEO_PAGES_FLAGSHIP)).toEqual([
      { id: "why-a-page-and-not-a-profile", label: "Why a page" },
      { id: "what-googles-spam-policy-actually-names", label: "The policy" },
      { id: "scene-two-names", label: "The policy", scene: true },
      { id: "the-example-that-is-about-the-thing-we-sell", label: "About us" },
      { id: "what-separates-a-real-area-page-from-a-doorway", label: "The line" },
      { id: "scene-the-test", label: "The questions", scene: true },
      { id: "repetition-is-measurable-and-somebody-measured-it", label: "Sameness" },
      { id: "scene-redundancy", label: "Sameness", scene: true },
      { id: "what-actually-goes-on-a-page-that-is-about-somewhere", label: "What goes on it" },
      { id: "scene-page-path", label: "The page", scene: true },
      { id: "scene-geo-calculator", label: "Your numbers", scene: true },
      { id: "the-part-that-is-regulated-and-it-is-not-the-search-engine", label: "The regulation" },
      { id: "scene-complaints", label: "The complaints", scene: true },
      { id: "what-an-area-page-may-and-may-not-say", label: "May and may not" },
      { id: "what-it-costs-and-how-long-it-takes", label: "Cost and time" },
      { id: "what-it-does-not-do-and-should-not-pretend-to", label: "What it will not do" },
      { id: "how-to-test-whether-a-page-is-about-anywhere-in-twenty-minutes", label: "How to test one" },
      { id: "common-questions-answered-honestly", label: "Common questions" },
      { id: "what-to-do-about-it", label: "What to do" },
    ]);
  });

  /** And the same freeze for topic 10. A rail that silently loses a row is the defect this
   * exists to catch, and it can only be caught by writing down what shipped. */
  it("derives exactly the rail the CRM sync post shipped with", () => {
    const crmOutline = parseOutline(CRM_SYNC_POST);
    expect(flagshipToc(crmOutline, CRM_SYNC_FLAGSHIP)).toEqual([
      { id: "why-there-are-two-of-her-and-it-is-not-carelessness", label: "Why two" },
      { id: "scene-two-of-her", label: "The two records", scene: true },
      { id: "what-the-same-person-means-to-a-computer", label: "The same person" },
      { id: "scene-surnames", label: "The surname", scene: true },
      { id: "a-name-is-not-an-identifier-and-this-is-how-far-from-one-it-is", label: "Names" },
      { id: "somebody-solved-this-properly-and-the-answer-has-three-outcomes", label: "The model" },
      { id: "scene-three-answers", label: "Three answers", scene: true },
      { id: "the-third-answer-is-a-person-and-it-is-the-one-nobody-sells-you", label: "The third answer" },
      { id: "scene-census-clerks", label: "What is left", scene: true },
      { id: "what-a-sync-is-actually-made-of", label: "What a sync is" },
      { id: "scene-sync-path", label: "The path", scene: true },
      { id: "the-field-that-gets-erased", label: "The erased field" },
      { id: "the-same-update-arriving-twice", label: "Arriving twice" },
      { id: "when-both-sides-changed-at-once", label: "Both sides" },
      { id: "scene-crm-calculator", label: "Your numbers", scene: true },
      { id: "which-side-is-right-and-why-somebody-has-to-say-it-out-loud", label: "Which side wins" },
      { id: "what-the-identity-field-actually-is-in-your-crm", label: "The identity field" },
      { id: "what-it-costs-and-how-long-it-takes", label: "Cost and time" },
      { id: "what-it-does-not-do-and-should-not-pretend-to", label: "What it will not do" },
      { id: "how-to-find-out-how-bad-yours-is-in-twenty-minutes", label: "How to check yours" },
      { id: "common-questions-answered-honestly", label: "Common questions" },
      { id: "what-to-do-about-it", label: "What to do" },
    ]);
  });

  /** And the same freeze for topic 11. */
  it("derives exactly the rail the agent workforce post shipped with", () => {
    const agentOutline = parseOutline(AI_AGENT_WORKFORCE_POST);
    expect(flagshipToc(agentOutline, AGENT_WORKFORCE_FLAGSHIP)).toEqual([
      { id: "scene-tenth-morning", label: "The tenth morning", scene: true },
      { id: "what-an-agent-workforce-actually-is-and-what-it-is-not", label: "What it is" },
      { id: "scene-not-a-chatbot", label: "What it is", scene: true },
      { id: "right-once-and-right-every-time-are-different-products", label: "Right every time" },
      { id: "what-happens-when-you-run-the-same-job-twenty-times", label: "Running it again" },
      { id: "where-these-systems-actually-go-wrong-and-it-is-mostly-not-the-model", label: "Where it fails" },
      { id: "scene-where-fail", label: "Where it fails", scene: true },
      { id: "the-brief-is-the-product", label: "The brief" },
      { id: "scene-rules-removed", label: "The brief", scene: true },
      { id: "why-the-second-assistant-costs-more-than-the-first", label: "The second one" },
      { id: "scene-agent-path", label: "One assistant", scene: true },
      { id: "where-the-money-actually-goes-when-you-run-several", label: "Where money goes" },
      { id: "scene-agent-calculator", label: "Your numbers", scene: true },
      { id: "what-a-person-costs-and-why-you-cannot-divide-by-it", label: "What a person costs" },
      { id: "who-is-responsible-when-an-assistant-is-wrong", label: "Who is responsible" },
      {
        id: "what-supervision-looks-like-when-the-thing-you-are-supervising-is-software",
        label: "Supervision",
      },
      { id: "what-it-costs-and-how-long-it-takes", label: "Cost and time" },
      { id: "what-it-does-not-do-and-should-not-pretend-to", label: "What it will not do" },
      { id: "how-to-test-one-assistant-before-you-run-four", label: "How to test one" },
      { id: "common-questions-answered-honestly", label: "Common questions" },
      { id: "what-to-do-about-it", label: "What to do" },
    ]);
  });

  it("skips scenes that declare no label, because not every scene is a destination", () => {
    const rows = flagshipToc(outline, AI_CHAT_FLAGSHIP);
    for (const key of ["pull-quote", "funnel", "in-short", "response-curve", "failure-modes"]) {
      expect(rows.some((r) => r.id === `scene-${key}`)).toBe(false);
    }
  });

  it("falls back to the heading's own text when no short label is given", () => {
    expect(AI_CHAT_FLAGSHIP.headingLabels).not.toHaveProperty("where-it-goes-wrong");
    expect(flagshipToc(outline, AI_CHAT_FLAGSHIP)).toContainEqual({
      id: "where-it-goes-wrong",
      label: "Where it goes wrong",
    });
  });

  it("emits nothing but headings when a post has no scene content", () => {
    const rows = flagshipToc(outline, undefined);
    expect(rows.every((r) => !r.scene)).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
  });
});

/** These are the checks EVERY topic has to pass. They are about the wiring, not about any one
 * post: every marker resolves, every payload is used, and no short label points at a heading
 * that no longer exists.
 *
 * TABLE-DRIVEN ON PURPOSE. The handoff told the next agent to copy this block per topic, and
 * copying a guard nineteen times is how a guard rots: one copy gets a weaker assertion and
 * nobody notices. Adding a topic is a row here, so a new topic is covered by construction
 * rather than by whoever wrote it remembering to duplicate the file. */
const TOPICS: [string, string, FlagshipContent][] = [
  ["ai chat assistant", AI_CHAT_ASSISTANT_POST, AI_CHAT_FLAGSHIP],
  ["ai voice agents", AI_VOICE_AGENTS_POST, AI_VOICE_FLAGSHIP],
  ["database reactivation", DATABASE_REACTIVATION_POST, REACTIVATION_FLAGSHIP],
  ["lead qualification", LEAD_QUALIFICATION_POST, QUALIFY_FLAGSHIP],
  ["workflow automation", WORKFLOW_AUTOMATION_POST, WORKFLOW_FLAGSHIP],
  ["review automation", REVIEW_AUTOMATION_POST, REVIEW_FLAGSHIP],
  ["ai appointment booking", AI_APPOINTMENT_BOOKING_POST, BOOKING_FLAGSHIP],
  ["local seo", LOCAL_SEO_POST, LOCAL_SEO_FLAGSHIP],
  ["geo landing pages", GEO_LANDING_PAGES_POST, GEO_PAGES_FLAGSHIP],
  ["crm sync", CRM_SYNC_POST, CRM_SYNC_FLAGSHIP],
  ["ai agent workforce", AI_AGENT_WORKFORCE_POST, AGENT_WORKFORCE_FLAGSHIP],
  ["skip tracing", SKIP_TRACING_POST, SKIP_TRACING_FLAGSHIP],
  ["marketing automation", MARKETING_AUTOMATION_POST, MARKETING_AUTOMATION_FLAGSHIP],
  ["document processing", DOCUMENT_PROCESSING_POST, DOCUMENT_PROCESSING_FLAGSHIP],
  ["data enrichment", DATA_ENRICHMENT_POST, DATA_ENRICHMENT_FLAGSHIP],
  ["ai scheduling", AI_SCHEDULING_POST, SCHEDULING_FLAGSHIP],
  ["invoicing and payments", INVOICING_POST, INVOICING_FLAGSHIP],
  ["ai clone", AI_CLONE_POST, CLONE_FLAGSHIP],
  ["ai audit", AI_AUDIT_POST, AUDIT_FLAGSHIP],
  ["custom automation", CUSTOM_AUTOMATION_POST, CUSTOM_FLAGSHIP],
  // Topic 21, 2026-08-27. The first flagship whose scenes are ALL primitives: no `component`
  // escape hatch anywhere in its payload, which is what the template was generalised for.
  ["the singularity", SINGULARITY_POST, SINGULARITY_FLAGSHIP],
];

describe.each(TOPICS)("the topic content contract: %s", (_name, body, content) => {
  const topicOutline = parseOutline(body);
  const markers = topicOutline.filter((e) => e.kind === "scene").map((e) => e.key);

  it("has a payload for every [[scene:key]] the body places", () => {
    expect(markers.filter((k) => !content.scenes[k])).toEqual([]);
  });

  it("has no payload the body never places", () => {
    expect(Object.keys(content.scenes).filter((k) => !markers.includes(k))).toEqual([]);
  });

  it("has no short label pointing at a heading that is not in the body", () => {
    const ids = new Set(parseHeadings(body).map((h) => h.id));
    expect(Object.keys(content.headingLabels ?? {}).filter((id) => !ids.has(id))).toEqual([]);
  });

  it("gives every scene a band, so the floating rail can always flip its contrast", () => {
    for (const [key, scene] of Object.entries(content.scenes)) {
      expect(["dark", "light"], `scene ${key}`).toContain(scene.band);
    }
  });

  it("places enough scenes to clear the readiness gate", () => {
    expect(markers.length).toBeGreaterThanOrEqual(5);
  });

  /** The honesty invariants. TypeScript forces the FIELDS to exist; these force them to say
   * something. A cited chart whose source is a blank string, or whose caveat is empty, passes
   * the compiler and fails the reader. */
  it("gives every cited data graphic a live source and a real caveat", () => {
    for (const [key, scene] of Object.entries(content.scenes)) {
      if (scene.kind !== "statbars") continue;
      expect(scene.sourceHref, `scene ${key}`).toMatch(/^https:\/\//);
      expect(scene.note.trim().length, `scene ${key} caveat`).toBeGreaterThan(20);
      expect(scene.bars.length, `scene ${key} bars`).toBeGreaterThan(1);
    }
  });

  it("makes every staged conversation admit that it is staged", () => {
    for (const [key, scene] of Object.entries(content.scenes)) {
      if (scene.kind !== "conversation") continue;
      expect(scene.note.trim().length, `scene ${key} note`).toBeGreaterThan(10);
      expect(scene.turns.length, `scene ${key} turns`).toBeGreaterThan(1);
    }
  });

  /** A film scene with no film renders nothing, which is a silent hole in the page rather
   * than an error. Catch it here instead of in a screenshot. */
  it("only places a film scene when the topic actually has a film", () => {
    const placesFilm = Object.values(content.scenes).some((s) => s.kind === "film");
    if (placesFilm) expect(content.film).toBeDefined();
  });

  /** A scene REPLACES the prose it stages; it never echoes it. The rule is written down in
   * STANDARD.md and in the Grid primitive's own docstring, and until 2026-08-03 one scene in
   * the cohort broke it: the voice post's pull quote opened with "A phone call has no typing
   * indicator", word for word the first sentence of a body paragraph two screens above.
   *
   * A pull quote that lifts a nearby sentence is a copy and paste rather than a distillation,
   * and the reader meets the same words twice on a page whose whole standard is that nothing
   * is said twice. Nine of the ten statements were already original; this catches the tenth.
   *
   * Held to whole sentences of five words or more, so a shared phrase that is just the
   * topic's own vocabulary cannot trip it. That distinction is the same one the sibling
   * overlap metric had to learn: repeating a SENTENCE is the failure, repeating a NOUN is not. */
  it("never puts a body sentence into a held statement scene", () => {
    const flat = body.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ");
    for (const [key, scene] of Object.entries(content.scenes)) {
      if (scene.kind !== "statement") continue;
      const echoes = scene.text
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.split(/\s+/).length >= 5)
        .filter((s) => flat.includes(s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim()));
      expect(echoes, `scene ${key} repeats the body verbatim`).toEqual([]);
    }
  });

  /** The same rule, everywhere the copy actually lives.
   *
   * The check above has guarded `statement` scenes since 2026-08-03, and only their `text`.
   * Rounds F, G and H then found TWENTY-THREE echoes it could not see, every one of them in a
   * chart `note`, a grid card `body`, a caption or a footnote — and each round's log recommended
   * building this and moved on, four times. Round H's log put it plainly: "the test to catch
   * them has been recommended four times and never built."
   *
   * So it walks every string in every scene rather than one field of one kind. Identifiers and
   * asset fields are skipped (see SKIP): a `src` or a licence name is not prose about the
   * subject and can legitimately repeat anything.
   *
   * The threshold is EIGHT words, not the five above. A grid card's label is short and shares
   * the topic's vocabulary by design, so five words produces false positives on exactly the
   * fields this is meant to cover; eight words is a sentence somebody wrote twice. That is the
   * same distinction the sibling-overlap metric had to learn: repeating a SENTENCE is the
   * failure, repeating a NOUN is not.
   *
   * Proved on the real cohort before it was trusted: it found 4 surviving echoes across the
   * twenty posts (chat's funnel footnote, two workflow card bodies, one clone summary claim),
   * all four were genuine, and all four were rewritten rather than excluded. */
  it("never repeats a body sentence anywhere inside a scene payload", () => {
    const SKIP = new Set(["kind", "src", "href", "id", "key", "icon", "slug", "alt",
      "photographer", "licence", "license", "sourceUrl", "ariaLabel", "credit", "sourceHref"]);
    const flat = body.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ");
    const walk = (node: unknown, path: string, out: [string, string][]) => {
      if (typeof node === "string") return void out.push([path, node]);
      if (Array.isArray(node)) return void node.forEach((v, i) => walk(v, `${path}[${i}]`, out));
      if (node && typeof node === "object") {
        for (const [k, v] of Object.entries(node)) {
          if (SKIP.has(k)) continue;
          walk(v, path ? `${path}.${k}` : k, out);
        }
      }
    };
    for (const [key, scene] of Object.entries(content.scenes)) {
      const strs: [string, string][] = [];
      walk(scene, "", strs);
      const echoes = strs.flatMap(([path, str]) =>
        str
          .split(/(?<=[.!?])\s+/)
          .map((s) => s.trim())
          .filter((s) => s.split(/\s+/).length >= 8)
          .filter((s) => flat.includes(s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim()))
          .map((s) => `${key}.${path}: ${s.slice(0, 80)}`),
      );
      expect(echoes, `scene ${key} repeats a body sentence`).toEqual([]);
    }
  });
});
