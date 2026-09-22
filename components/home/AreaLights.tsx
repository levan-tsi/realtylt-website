"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PRESS } from "@/components/ui/Button";
import { loadLights } from "@/lib/idx/lights-client";
import type { LightPoints } from "@/lib/idx/lights";

/** WHERE WE WORK (round 53): one tile per county and borough, each drawing THAT area's own
 * homes for sale as lights, from the same data as the hero map, with its real count.
 *
 * It replaces a row of uppercase pills that said the same eleven names and nothing else. The
 * hero shows the whole territory at night; these tiles are the same night, one place at a time,
 * so the idea the page opens with carries down it instead of stopping at the first fold. A tile
 * is still just a link to the area's page, and without JavaScript it is a named dark tile.
 *
 * Still by default. Hovering (or focusing) a tile brightens its lights: a response to the
 * visitor, the only motion here. */

export type AreaTile = { slug: string; name: string; href: string };
export type AreaGroup = { id: string; label: string; items: AreaTile[] };

const LAT_SCALE = Math.cos((41.3 * Math.PI) / 180);

function sprite(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = 24;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(12, 12, 0, 12, 12, 12);
  grad.addColorStop(0, "rgba(255,246,228,1)");
  grad.addColorStop(0.18, "rgba(252,221,160,0.9)");
  grad.addColorStop(0.45, "rgba(246,199,129,0.22)");
  grad.addColorStop(1, "rgba(246,199,129,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 24, 24);
  return c;
}

/** Draw one area's lights, fitted to the tile. The frame is the area's own 2nd-98th percentile
 * extent, so a stray mis-assigned home cannot shrink the picture to a dot. */
function draw(canvas: HTMLCanvasElement, pts: LightPoints, slug: string, dot: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 2) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const g = canvas.getContext("2d");
  if (!g) return;
  const idx: number[] = [];
  for (let i = 0; i < pts.x.length; i++) if (pts.townCounty[pts.town[i]] === slug) idx.push(i);
  if (!idx.length) return;
  const bw = (pts.box.east - pts.box.west) * LAT_SCALE;
  const bh = pts.box.north - pts.box.south;
  const xs = idx.map((i) => pts.x[i] * bw).sort((a, b) => a - b);
  const ys = idx.map((i) => pts.y[i] * bh).sort((a, b) => a - b);
  const q = (a: number[], f: number) => a[Math.min(a.length - 1, Math.max(0, Math.floor(f * (a.length - 1))))];
  const x0 = q(xs, 0.02), x1 = q(xs, 0.98), y0 = q(ys, 0.02), y1 = q(ys, 0.98);
  // The tile's own words sit in its lower third, so the picture is fitted to the upper part.
  const W = rect.width, H = rect.height * 0.7, pad = Math.min(W, H) * 0.1;
  const s = Math.min((W - 2 * pad) / Math.max(x1 - x0, 1e-4), (H - 2 * pad) / Math.max(y1 - y0, 1e-4));
  const ox = (W - (x1 - x0) * s) / 2 - x0 * s;
  const oy = pad + (H - 2 * pad - (y1 - y0) * s) / 2 - y0 * s;
  // A small area drawn at a large scale spreads its homes apart; keep each light a light.
  const size = Math.max(3.2, Math.min(5.5, 40 / Math.sqrt(idx.length)));
  const a = Math.min(0.95, 0.35 + 18 / Math.sqrt(idx.length));
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, W, rect.height);
  g.globalCompositeOperation = "lighter";
  for (const i of idx) {
    g.globalAlpha = a * (0.55 + 0.45 * ((i * 0.618) % 1));
    g.drawImage(dot, ox + pts.x[i] * bw * s - size / 2, oy + pts.y[i] * bh * s - size / 2, size, size);
  }
}

export function AreaLights({ groups }: { groups: AreaGroup[] }) {
  const [pts, setPts] = useState<LightPoints | null>(null);
  const refs = useRef(new Map<string, HTMLCanvasElement>());

  useEffect(() => {
    let alive = true;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const go = () => loadLights().then((p) => alive && setPts(p));
    if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 2500 });
    else setTimeout(go, 600);
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!pts) return;
    const dot = sprite();
    const paint = () => refs.current.forEach((c, slug) => draw(c, pts, slug, dot));
    paint();
    const ro = new ResizeObserver(paint);
    refs.current.forEach((c) => ro.observe(c));
    return () => ro.disconnect();
  }, [pts]);

  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <div key={group.id}>
          <h3 className="t-eyebrow text-stone">{group.label}</h3>
          <ul className={`mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 ${group.items.length > 5 ? "lg:grid-cols-6" : "lg:grid-cols-5"}`}>
            {group.items.map((item) => {
              const n = pts?.countyCounts[item.slug];
              return (
                <li key={item.slug}>
                  <Link
                    href={item.href}
                    className={`group relative block aspect-square overflow-hidden rounded-2xl border border-line bg-night-deep/60 sm:aspect-[4/5] ${PRESS} hover:border-line-strong`}
                  >
                    <canvas
                      ref={(el) => {
                        if (el) refs.current.set(item.slug, el);
                        else refs.current.delete(item.slug);
                      }}
                      aria-hidden
                      className="absolute inset-0 h-full w-full transition-[filter] duration-300 ease-out group-hover:brightness-150 group-focus-visible:brightness-150 motion-reduce:transition-none"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night-deep via-night-deep/70 to-transparent p-4 pt-10">
                      <span className="t-title block text-ink">{item.name}</span>
                      {/* Reserved line, so the tile does not change height when the number lands. */}
                      <span className="mt-0.5 block text-[14px] tabular-nums text-stone">
                        {n ? `${n.toLocaleString("en-US")} ${n === 1 ? "home" : "homes"} for sale` : " "}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
