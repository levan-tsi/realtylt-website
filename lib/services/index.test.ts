import { describe, expect, it } from "vitest";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  getOtherServices,
  getService,
  getServices,
  serviceJsonLd,
  serviceStructuredData,
  serviceUrl,
  videoJsonLd,
  type Service,
} from "./index";

const SERVICES = getServices();

/** Every COPY key in realtylt-ai-page/web/src/main.js. A service page whose aiKey is not
 * in this list has a broken /ai#<key> deep link, and nothing else would catch it. */
const AI_COPY_KEYS = [
  "chat", "voice", "agents", "clone", "data", "marketing", "reactivation", "workflow",
  "consult", "plus", "book", "pay", "reviews", "crmsync", "scheduling", "docs", "qualify",
  "enrich", "localseo", "geopages",
];

/** Every string a visitor can read on a service page. */
function copyOf(s: Service): string[] {
  return [
    s.name, s.eyebrow, s.title, s.lede, s.why,
    s.seo.title, s.seo.description,
    ...s.specs,
    ...(s.stat ? [s.stat.value, s.stat.label] : []),
    ...s.whatItIs,
    ...s.howItWorks.flatMap((h) => [h.title, h.body]),
    ...s.useCases.flatMap((u) => [u.title, u.body]),
    ...s.faqs.flatMap((f) => [f.q, f.a]),
    ...figureCopy(s),
  ];
}

function figureCopy(s: Service): string[] {
  const f = s.figure;
  const base = [f.caption, f.footnote];
  if (f.kind === "transcript") return [...base, ...f.turns.map((t) => t.text)];
  if (f.kind === "timeline") return [...base, ...f.events.flatMap((e) => [e.at, e.label, e.note])];
  if (f.kind === "records")
    return [
      ...base,
      f.headers.before,
      f.headers.after,
      ...f.rows.flatMap((r) => [r.before, r.tag, ...r.after]),
    ];
  return [...base, f.trigger, ...f.nodes.flatMap((n) => [n.label, n.note])];
}

describe("service registry", () => {
  it("has all twenty services", () => {
    expect(SERVICES).toHaveLength(20);
  });

  it("has unique slugs", () => {
    const slugs = SERVICES.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has unique aiKeys that all exist in the /ai COPY object", () => {
    const keys = SERVICES.map((s) => s.aiKey);
    expect(new Set(keys).size).toBe(keys.length);
    for (const k of keys) expect(AI_COPY_KEYS).toContain(k);
  });

  it("uses url-safe slugs", () => {
    for (const s of SERVICES) expect(s.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("resolves by slug and 404s on an unknown one", () => {
    expect(getService("ai-voice-agents")?.name).toBe("AI Voice Agents");
    expect(getService("does-not-exist")).toBeUndefined();
  });

  it("excludes the current service from the cross-link rail", () => {
    const others = getOtherServices("ai-chat-assistant", 6);
    expect(others).toHaveLength(6);
    expect(others.some((s) => s.slug === "ai-chat-assistant")).toBe(false);
  });
});

describe("content quality gates", () => {
  it("has no em dashes anywhere in service copy (the loudest AI text tell)", () => {
    for (const s of SERVICES) {
      for (const line of copyOf(s)) {
        expect(line, `${s.slug}: "${line}"`).not.toMatch(/[—–]/);
      }
    }
  });

  it("has no arrow glyphs stapled to copy", () => {
    for (const s of SERVICES) {
      for (const line of copyOf(s)) {
        expect(line, `${s.slug}: "${line}"`).not.toMatch(/[→←⟶]/);
      }
    }
  });

  it("gives every service enough content to be a real page, not a doorway", () => {
    for (const s of SERVICES) {
      expect(s.whatItIs.length, s.slug).toBeGreaterThanOrEqual(2);
      expect(s.howItWorks.length, s.slug).toBeGreaterThanOrEqual(3);
      expect(s.useCases.length, s.slug).toBeGreaterThanOrEqual(3);
      expect(s.faqs.length, s.slug).toBeGreaterThanOrEqual(3);
      expect(s.keywords.length, s.slug).toBeGreaterThanOrEqual(3);
    }
  });

  it("phrases FAQs as questions and answers them substantively", () => {
    for (const s of SERVICES) {
      for (const f of s.faqs) {
        expect(f.q.endsWith("?"), `${s.slug}: "${f.q}"`).toBe(true);
        // An assistant quotes a sentence, not a fragment.
        expect(f.a.length, `${s.slug}: "${f.q}"`).toBeGreaterThan(80);
      }
    }
  });

  it("keeps meta descriptions inside the length Google will render", () => {
    for (const s of SERVICES) {
      expect(s.seo.title.length, s.slug).toBeLessThanOrEqual(65);
      expect(s.seo.description.length, s.slug).toBeGreaterThan(70);
      expect(s.seo.description.length, s.slug).toBeLessThanOrEqual(185);
    }
  });
});

describe("structured data", () => {
  const chat = getService("ai-chat-assistant")!;

  it("emits a valid Service node", () => {
    const ld = serviceJsonLd(chat) as Record<string, unknown>;
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("Service");
    expect(ld.name).toBe("AI Chat Assistant");
    expect(ld.url).toBe(serviceUrl(chat));
    expect((ld.provider as Record<string, unknown>)["@type"]).toBe("Organization");
    expect(ld.description).toBeTruthy();
  });

  it("emits a FAQPage whose questions and answers match the content", () => {
    const ld = faqJsonLd(chat) as {
      "@type": string;
      mainEntity: { "@type": string; name: string; acceptedAnswer: { text: string } }[];
    };
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity).toHaveLength(chat.faqs.length);
    for (const [i, q] of ld.mainEntity.entries()) {
      expect(q["@type"]).toBe("Question");
      expect(q.name).toBe(chat.faqs[i].q);
      expect(q.acceptedAnswer.text).toBe(chat.faqs[i].a);
    }
  });

  it("emits a three-level BreadcrumbList", () => {
    const ld = breadcrumbJsonLd(chat) as { itemListElement: { position: number }[] };
    expect(ld.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
  });

  it("emits no VideoObject until a service has a video", () => {
    for (const s of SERVICES) expect(videoJsonLd(s)).toBeNull();
    expect(serviceStructuredData(chat)).toHaveLength(3);
  });

  it("activates the VideoObject the moment a video is attached", () => {
    const withVideo: Service = {
      ...chat,
      video: {
        contentUrl: "/videos/chat-walkthrough.mp4",
        name: "The chat assistant, in 90 seconds",
        description: "A walkthrough of a live conversation.",
        thumbnailUrl: "/images/lifestyle/buying.jpg",
        uploadDate: "2026-07-14",
        duration: "PT1M30S",
      },
    };
    const ld = videoJsonLd(withVideo) as unknown as Record<string, string>;
    expect(ld["@type"]).toBe("VideoObject");
    expect(ld.contentUrl).toMatch(/^https?:\/\/.+\/videos\/chat-walkthrough\.mp4$/);
    expect(ld.thumbnailUrl).toMatch(/^https?:\/\//);
    expect(ld.duration).toBe("PT1M30S");
    expect(serviceStructuredData(withVideo)).toHaveLength(4);
  });

  it("meets Google's documented FAQPage requirements on every service", () => {
    // Note: Google restricted FAQ *rich results* to gov/health sites in 2023. The markup
    // stays because the point of it here is GEO — it is what an assistant reads and quotes.
    for (const s of SERVICES) {
      const ld = faqJsonLd(s) as {
        mainEntity: { "@type": string; name: string; acceptedAnswer: { "@type": string; text: string } }[];
      };
      expect(Array.isArray(ld.mainEntity), s.slug).toBe(true);
      for (const q of ld.mainEntity) {
        expect(q["@type"]).toBe("Question");
        expect(q.name.trim().length, s.slug).toBeGreaterThan(0);
        expect(q.acceptedAnswer["@type"]).toBe("Answer");
        expect(q.acceptedAnswer.text.trim().length, s.slug).toBeGreaterThan(0);
      }
    }
  });

  it("gives every Service node the properties a crawler needs", () => {
    for (const s of SERVICES) {
      const ld = serviceJsonLd(s) as Record<string, unknown>;
      for (const key of ["@context", "@type", "name", "description", "url", "provider", "areaServed"]) {
        expect(ld[key], `${s.slug} missing ${key}`).toBeTruthy();
      }
      expect(String(ld.url)).toMatch(/^https?:\/\/[^/]+\/services\/[a-z0-9-]+$/);
    }
  });

  it("emits absolute URLs in every breadcrumb, in ascending position order", () => {
    for (const s of SERVICES) {
      const ld = breadcrumbJsonLd(s) as {
        itemListElement: { position: number; name: string; item: string }[];
      };
      ld.itemListElement.forEach((crumb, i) => {
        expect(crumb.position).toBe(i + 1);
        expect(crumb.name.length).toBeGreaterThan(0);
        expect(crumb.item, s.slug).toMatch(/^https?:\/\//);
      });
    }
  });

  it("produces every block as a plain JSON-serialisable object", () => {
    for (const s of SERVICES) {
      for (const block of serviceStructuredData(s)) {
        expect(() => JSON.stringify(block)).not.toThrow();
        expect(JSON.parse(JSON.stringify(block))).toEqual(block);
      }
    }
  });
});
