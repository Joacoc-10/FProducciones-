"use client";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { sanitizeSpeedInsightsEvent } from "@/lib/speed-insights";

/** Client wrapper: beforeSend es una función y no puede pasarse desde un Server Component. */
export default function SiteSpeedInsights() {
  return <SpeedInsights beforeSend={sanitizeSpeedInsightsEvent} />;
}
