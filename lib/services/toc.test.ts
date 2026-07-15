import { describe, expect, it } from "vitest";
import { getServices, type Service, type ServiceVideo } from "./index";
import { serviceTocItems } from "./toc";

const SERVICES = getServices();
const base = SERVICES[0];

const fakeVideo: ServiceVideo = {
  contentUrl: "/x.mp4",
  name: "Walkthrough",
  description: "A walkthrough.",
  thumbnailUrl: "/x.jpg",
  uploadDate: "2026-01-01",
  duration: "PT1M",
};

describe("serviceTocItems", () => {
  it("lists the five fixed sections, in document order, when there is no video", () => {
    const noVideo: Service = { ...base, video: undefined };
    expect(serviceTocItems(noVideo).map((i) => i.id)).toEqual([
      "what-it-is",
      "how-it-works",
      "use-cases",
      "see-it-live",
      "faq",
    ]);
  });

  it("inserts 'Watch it' before the FAQ once a walkthrough is attached", () => {
    const withVideo: Service = { ...base, video: fakeVideo };
    expect(serviceTocItems(withVideo).map((i) => i.id)).toEqual([
      "what-it-is",
      "how-it-works",
      "use-cases",
      "see-it-live",
      "watch-it",
      "faq",
    ]);
  });

  it("gives every row a non-empty label and a unique id", () => {
    const items = serviceTocItems({ ...base, video: fakeVideo });
    expect(items.every((i) => i.label.trim().length > 0)).toBe(true);
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  });

  it("holds for every real service in the registry (no video today = five rows)", () => {
    for (const s of SERVICES) {
      const ids = serviceTocItems(s).map((i) => i.id);
      expect(ids[0]).toBe("what-it-is");
      expect(ids[ids.length - 1]).toBe("faq");
      expect(ids).toContain("see-it-live");
    }
  });
});
