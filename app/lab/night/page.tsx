import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NightLab } from "@/components/home/night/NightLab";

/** Round 54's night-flight lab: the home page's 3D scene alone, to be judged before it is
 * integrated. It exists only on a machine that sets RLT_LAB=1 (read per request, so a production
 * build without the variable answers 404), and it is never indexed. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Night flight lab",
  robots: { index: false, follow: false },
};

export default function NightLabPage() {
  if (process.env.RLT_LAB !== "1") notFound();
  return <NightLab />;
}
