import Image from "next/image";

// Google's own brand logo (color), self-hosted from
// https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_74x24dp.png
// (never hotlinked). Native aspect 148x48 (= 74x24 @2x).
const NATIVE_W = 148;
const NATIVE_H = 48;

/** The Google wordmark at a given rendered height, used to attribute Google reviews
 * (trust bar + review-card headers). Decorative next to the "Rated 5.0" star label, so the
 * alt is the bare brand name. */
export function GoogleLogo({ height = 24, className = "" }: { height?: number; className?: string }) {
  const width = Math.round((NATIVE_W / NATIVE_H) * height);
  return (
    <Image
      src="/images/google-logo.png"
      alt="Google"
      width={width}
      height={height}
      className={className}
      style={{ height, width }}
    />
  );
}
