import type { CSSProperties, ReactNode } from "react";

/**
 * THE DEVICES, DRAWN ONCE.
 *
 * `@design-artwork` — this file draws real objects, so the five-step UI corner scale does not
 * govern it. A laptop screen genuinely has a small corner inside a big bezel, and a 132px phone
 * genuinely has a smaller corner than a 300px one. Forcing either onto 8/12/16/24 makes the
 * drawing wrong. The colour and shadow rules still apply: a drawing is lit by the same sun as
 * the rest of the page.
 *
 * WHY IT EXISTS: `LaptopFrame` was living verbatim in app/buying and app/selling, with the
 * browser chrome copy-pasted alongside it, and the phone had been drawn three separate times:
 *
 *     buying     218px outer   30px radius   9px bezel   22px screen
 *     selling    144px outer   20px radius   6px bezel   14px screen
 *     financing  300px outer   34px radius  10px bezel   24px screen
 *
 * Those look like three arbitrary choices, but they are not — every one is close to 13% of the
 * device's width, because that is what a phone looks like. The numbers were never the problem;
 * copying them by hand was. So the geometry is DERIVED here and the drift cannot come back.
 */

/** A phone's corner is ~13% of its width and its bezel ~4%, measured off the three hand-drawn
 * phones this replaces. The screen's corner then falls out of the geometry: a uniform bezel
 * means the inner radius is exactly the outer radius minus the bezel. */
function phoneGeometry(width: number) {
  const radius = Math.round(width * 0.13);
  const bezel = Math.round(width * 0.04);
  return { radius, bezel, screenRadius: Math.max(2, radius - bezel) };
}

export function Phone({
  width,
  children,
  className = "",
  style,
  speaker = true,
}: {
  /** Rendered outer width in px. Drives the bezel and both radii. */
  width: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** The earpiece slot at the top of the screen. Off for a phone showing a full-bleed photo. */
  speaker?: boolean;
}) {
  const { radius, bezel, screenRadius } = phoneGeometry(width);
  return (
    <div
      className={`bg-graphite shadow-float ${className}`}
      style={{ width, borderRadius: radius, borderWidth: bezel, borderStyle: "solid", borderColor: "var(--color-graphite)", ...style }}
    >
      <div className="overflow-hidden bg-white" style={{ borderRadius: screenRadius }}>
        {speaker && (
          <div className="flex items-center justify-center bg-white" style={{ height: Math.round(width * 0.09) }}>
            <span className="h-1.5 rounded-full bg-line" style={{ width: Math.round(width * 0.24) }} aria-hidden />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/** The laptop is always drawn at the same size (a `max-w-xl` figure), so unlike the phone its
 * geometry is fixed: a 10px bezel with a 14px outer corner, which leaves the screen 4px. */
const LAPTOP = { bezel: 10, radius: 14, screenRadius: 4 };

export function Laptop({
  children,
  tone = "dark",
  className = "",
}: {
  children: ReactNode;
  /** `dark` is the graphite body. `light` is the silver one, for photo content that would
   *  disappear against graphite. */
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-xl ${className}`}>
      <div
        className="shadow-float"
        style={{
          borderRadius: LAPTOP.radius,
          borderWidth: LAPTOP.bezel,
          borderStyle: "solid",
          borderColor: tone === "dark" ? "var(--color-graphite)" : "var(--color-line-strong)",
        }}
      >
        <div
          className="relative aspect-[16/10] overflow-hidden bg-black"
          style={{ borderRadius: LAPTOP.screenRadius }}
        >
          {children}
        </div>
      </div>
      {/* hinge / base */}
      <div className="mx-auto h-3 w-[94%] rounded-b-[10px] bg-gradient-to-b from-[#cfd3d9] to-[#a7adb6]" />
      <div className="mx-auto h-1.5 w-[22%] rounded-b-[8px] bg-[#9aa1ab]" />
    </div>
  );
}

/** The browser's top bar inside a laptop screen: three lights and the address. Was duplicated
 * in buying and selling, down to the same three hex traffic-light colours. */
export function BrowserChrome({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-line bg-mist px-3 py-2">
      <span className="flex gap-1.5" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-[#e0533d]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#e8b13a]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#4caf67]" />
      </span>
      <span className="ml-1 flex h-5 flex-1 items-center rounded-[4px] bg-white px-2 text-[10px] text-stone">
        {url}
      </span>
    </div>
  );
}

/** A listing card seen inside a mock screen, at roughly a quarter of its real size — so its
 * corner is a quarter of the real card's 16px, not 16px. Same reason the phone's corner scales:
 * a miniature that keeps full-size details reads as a sticker, not a screen. */
export function MockCard({
  children,
  className = "",
  hairline = true,
}: {
  children: ReactNode;
  className?: string;
  /** Off for a bare photo thumbnail in a mock feed row, which has no card around it. */
  hairline?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[3px] bg-mist ${hairline ? "border border-line" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/** The price chip burned into a mock listing photo. Same miniature logic: the real card's chip
 * is an 8px pill at full size, so at a quarter scale it is 2px. */
export function MockChip({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`absolute bottom-1 left-1 rounded-[2px] px-1.5 py-0.5 font-bold text-paper ${className}`}>
      {children}
    </span>
  );
}
