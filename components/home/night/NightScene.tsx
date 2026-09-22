"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { townSearchHref } from "./lights";
import type { Look, NightSceneHandle, TownHover } from "./scene";
import type { ShotName } from "./shots";

/** The night flight's canvas (round 54). A thin React shell around ./scene.ts, which it imports
 * DYNAMICALLY after mount, so three.js and the terrain never block the first paint: until the
 * scene is ready the canvas is plain black, and if WebGL is unavailable (or anything throws while
 * building) the component renders nothing and the page behind it stands on its own.
 *
 * The parent drives the camera through the imperative handle (ref): setShot / flyTo /
 * setSequence (scroll scrub) / setVeil. The ref is null until the scene is ready; `onReady` says
 * when.
 *
 * The lantern (mouse only): the nearest town under the pointer is named with its real count, and a
 * click opens that town's search, `/search?city=<Town>`, exactly as the round 53 hero did. The
 * canvas is decoration (aria-hidden): the search box offers everything it offers to a keyboard. */

export interface NightSceneProps {
  className?: string;
  initialShot?: ShotName;
  skipIntro?: boolean;
  drift?: boolean;
  dustCount?: number;
  look?: Partial<Look>;
  onReady?: (h: NightSceneHandle) => void;
  /** Also told when the town under the pointer changes, for a page that draws its own cursor
   * affordance (the home page forwards pointer moves from over its own content). */
  onTownHover?: (t: TownHover | null) => void;
}

export const NightScene = forwardRef<NightSceneHandle | null, NightSceneProps>(function NightScene(
  { className = "", initialShot = "hero", skipIntro, drift, dustCount, look, onReady, onTownHover },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [handle, setHandle] = useState<NightSceneHandle | null>(null);
  const [failed, setFailed] = useState(false);
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const onHoverRef = useRef(onTownHover);
  onHoverRef.current = onTownHover;
  // The first props win: the scene is built once per mount.
  const initial = useRef({ initialShot, skipIntro, drift, dustCount, look });

  useImperativeHandle(ref, () => handle as NightSceneHandle, [handle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const label = labelRef.current;
    if (!canvas || !label) return;
    let disposed = false;
    let h: NightSceneHandle | null = null;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let hovered: TownHover | null = null;

    const showLabel = (t: TownHover | null) => {
      hovered = t;
      onHoverRef.current?.(t);
      if (!t) {
        label.style.opacity = "0";
        canvas.style.cursor = "";
        return;
      }
      label.firstElementChild!.textContent = t.name;
      label.lastElementChild!.textContent = `${t.count.toLocaleString("en-US")} ${t.count === 1 ? "home" : "homes"} for sale`;
      const flip = t.x > canvas.clientWidth - 240;
      label.style.transform = `translate(${Math.round(t.x + (flip ? -18 : 18))}px, ${Math.round(t.y - 16)}px) translate(${flip ? "-100%" : "0"}, -100%)`;
      label.style.opacity = "1";
      canvas.style.cursor = "pointer";
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !h) return;
      const r = canvas.getBoundingClientRect();
      h.setPointer(e.clientX - r.left, e.clientY - r.top);
    };
    const onLeave = () => h?.clearPointer();
    const onClick = () => {
      if (hovered) routerRef.current.push(townSearchHref(hovered.name));
    };

    (async () => {
      try {
        const { createNightScene } = await import("./scene");
        if (disposed) return;
        const o = initial.current;
        h = await createNightScene({
          canvas,
          reducedMotion: reduce,
          hover: mouse,
          initialShot: o.initialShot,
          skipIntro: o.skipIntro,
          drift: o.drift,
          dustCount: o.dustCount,
          look: o.look,
          onTownHover: showLabel,
        });
        if (disposed) {
          h.dispose();
          return;
        }
        if (mouse) {
          canvas.addEventListener("pointermove", onMove);
          canvas.addEventListener("pointerleave", onLeave);
          canvas.addEventListener("click", onClick);
        }
        setHandle(h);
        onReadyRef.current?.(h);
      } catch {
        // No WebGL, or a lost context while building: nothing is drawn, the page stands.
        if (!disposed) setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
      h?.dispose();
    };
  }, []);

  if (failed) return null;
  return (
    <div className={className} aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
      <div
        ref={labelRef}
        className="pointer-events-none absolute left-0 top-0 rounded-xl px-3.5 py-2 opacity-0 transition-opacity duration-150 motion-reduce:transition-none"
        style={{ background: "rgba(8,8,8,0.82)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(6px)" }}
      >
        <p className="text-[15px] font-semibold leading-tight" style={{ color: "#f6f4ef" }} />
        <p className="text-[13px] leading-tight" style={{ color: "rgba(246,244,239,0.62)" }} />
      </div>
    </div>
  );
});
