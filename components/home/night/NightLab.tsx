"use client";

import { useEffect, useRef, useState } from "react";
import { NightScene } from "./NightScene";
import type { Look, NightSceneHandle } from "./scene";
import { AREA_FLIGHT, FLIGHT, MOON, type ShotName } from "./shots";

/** The night flight's lab (/lab/night, only with RLT_LAB=1): the scene alone, full screen, to be
 * judged. Buttons fly to each shot; "Scroll flight" turns page scroll into the home page's flight
 * (hero -> dutchess -> highlands -> westchester -> harbour -> region); "Areas" does the same for the
 * county-by-county chapter.
 *
 * Query parameters, for probes: ?shot=<name> start there; ?still=1 no intro and no drift;
 * ?mode=scroll|areas; ?s=<n> sequence position; ?dust=<grains>; ?look=<json>; ?guides=1 outlines
 * where the home page's words will sit; ?mock=1 draws stand-in words there (and asks the scene for
 * quiet beneath them); ?ui=0 hides the controls; ?f=px,py,pz,tx,ty,tz,fov a raw framing in world
 * km. `window.__night` is the handle. */

type Mode = "shots" | "scroll" | "areas";

export function NightLab() {
  // The lab reads its query string, which the server does not render with, so it draws nothing
  // until it is mounted in the browser (no hydration mismatch).
  const [params, setParams] = useState<URLSearchParams | null>(null);
  useEffect(() => setParams(new URLSearchParams(window.location.search)), []);
  if (!params) return <div className="fixed inset-0 z-[200]" style={{ background: "#000" }} />;
  return <Lab params={params} />;
}

function Lab({ params }: { params: URLSearchParams }) {
  const [mode, setMode] = useState<Mode>(() => (params.get("mode") as Mode) || "shots");
  const [current, setCurrent] = useState<string>(params.get("shot") || "hero");
  const [veil, setVeil] = useState(0);
  const [ready, setReady] = useState(false);
  const handle = useRef<NightSceneHandle | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const still = params.get("still") === "1";
  const showUi = params.get("ui") !== "0";
  const guides = params.get("guides") === "1";
  const look = (() => {
    try {
      return params.get("look") ? (JSON.parse(params.get("look")!) as Partial<Look>) : undefined;
    } catch {
      return undefined;
    }
  })();
  const seq: readonly ShotName[] = mode === "areas" ? AREA_FLIGHT : FLIGHT;

  // Scroll flight: the scroller's progress is the sequence position.
  useEffect(() => {
    const el = scroller.current;
    if (!el || mode === "shots") return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      const s = max > 0 ? (el.scrollTop / max) * (seq.length - 1) : 0;
      handle.current?.setSequence(seq, s);
      setCurrent(`${seq[Math.round(s)]} (${s.toFixed(2)})`);
    };
    const sParam = params.get("s");
    if (sParam !== null) {
      const max = el.scrollHeight - el.clientHeight;
      el.scrollTop = (Number(sParam) / (seq.length - 1)) * max;
    }
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [mode, ready, seq, params]);

  const fly = (name: ShotName) => {
    setMode("shots");
    setCurrent(name);
    void handle.current?.flyTo(name, 3000);
  };

  return (
    <div
      ref={scroller}
      data-lab-scroller
      className="fixed inset-0 z-[200]"
      style={{ background: "#000", overflowY: mode === "shots" ? "hidden" : "auto", color: "#f6f4ef", fontFamily: "system-ui, sans-serif" }}
    >
      <NightScene
        className="fixed inset-0"
        initialShot={(params.get("shot") as ShotName) || "hero"}
        skipIntro={still}
        drift={still ? false : undefined}
        dustCount={params.get("dust") ? Number(params.get("dust")) : undefined}
        look={look}
        onReady={(h) => {
          handle.current = h;
          const f = params.get("f")?.split(",").map(Number);
          if (f && f.length === 7) h.setFraming({ pos: [f[0], f[1], f[2]], target: [f[3], f[4], f[5]], fov: f[6], moon: MOON }, { immediate: true });
          (window as unknown as { __night?: NightSceneHandle }).__night = h;
          // The mock words ask the scene for quiet beneath them, measured from the real boxes.
          const quiet = () =>
            h.setQuiet(
              [...document.querySelectorAll<HTMLElement>("[data-quiet]")]
                .map((el) => el.getBoundingClientRect())
                .filter((r) => r.width > 0 && r.height > 0),
            );
          quiet();
          window.addEventListener("resize", quiet);
          setReady(true);
          document.documentElement.dataset.nightReady = "1";
        }}
      />
      {mode !== "shots" && <div aria-hidden style={{ height: `${seq.length * 100}vh` }} />}
      {guides && (
        <div aria-hidden className="pointer-events-none fixed inset-0">
          {/* Desktop: the headline and search sit bottom-left. Phone: a line at the top, the rest at the bottom. */}
          <div className="absolute hidden border border-dashed border-white/40 md:block" style={{ left: 72, bottom: 72, width: 560, height: 300 }} />
          <div className="absolute border border-dashed border-white/40 md:hidden" style={{ left: 20, right: 20, top: 84, height: 120 }} />
          <div className="absolute border border-dashed border-white/40 md:hidden" style={{ left: 20, right: 20, bottom: 40, height: 250 }} />
        </div>
      )}
      {params.get("mock") === "1" && (
        // A stand-in for the home hero's words, only to judge the composition (not the real copy).
        <div aria-hidden className="pointer-events-none fixed inset-0" style={{ fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", color: "#f6f4ef" }}>
          <div data-quiet className="absolute left-5 right-5 top-[88px] md:hidden">
            <p className="text-[15px] opacity-70">Hudson Valley and New York City</p>
          </div>
          <div data-quiet className="absolute bottom-10 left-5 right-5 md:bottom-[72px] md:left-[72px] md:right-auto md:w-[560px]">
            <p className="hidden text-[15px] opacity-70 md:block">Hudson Valley and New York City</p>
            <h1 className="mt-3 text-[44px] font-semibold leading-[1.02] tracking-[-0.03em] md:text-[76px]">Let&apos;s find home.</h1>
            <p className="mt-4 text-[17px] leading-snug opacity-75 md:text-[19px]">Every home for sale across six counties and five boroughs, lit where it stands.</p>
            <div className="mt-6 flex h-14 items-center rounded-xl px-4 text-[16px] opacity-90" style={{ background: "rgba(10,10,10,0.72)", border: "1px solid rgba(255,255,255,0.28)" }}>
              Town, ZIP or address
            </div>
          </div>
        </div>
      )}
      {showUi && (
        <div className="fixed bottom-4 right-4 z-10 flex max-w-[min(560px,calc(100vw-32px))] flex-col gap-2 rounded-2xl p-3 text-[13px]" style={{ background: "rgba(10,10,10,0.78)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 opacity-60">Shots</span>
            {FLIGHT.map((n) => (
              <button key={n} type="button" onClick={() => fly(n)} className="rounded-lg px-2 py-1 hover:bg-white/10" style={{ border: "1px solid rgba(255,255,255,0.16)" }}>
                {n}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 opacity-60">Areas</span>
            {AREA_FLIGHT.map((n) => (
              <button key={n} type="button" onClick={() => fly(n)} className="rounded-lg px-2 py-1 hover:bg-white/10" style={{ border: "1px solid rgba(255,255,255,0.16)" }}>
                {n}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {(["shots", "scroll", "areas"] as const).map((m) => (
              <label key={m} className="flex items-center gap-1">
                <input type="radio" name="mode" checked={mode === m} onChange={() => setMode(m)} /> {m === "shots" ? "Buttons" : m === "scroll" ? "Scroll flight" : "Scroll areas"}
              </label>
            ))}
            <label className="flex items-center gap-1">
              Veil
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={veil}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setVeil(v);
                  handle.current?.setVeil(v);
                }}
              />
            </label>
            <span className="opacity-60">{ready ? current : "loading"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
