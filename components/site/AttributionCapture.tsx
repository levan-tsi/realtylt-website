"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/leads/attribution-client";

/** Remembers how this device arrived (lib/leads/attribution-client.ts). Renders nothing. */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
