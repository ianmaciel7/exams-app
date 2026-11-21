"use client";

import { useReportWebVitals } from "next/web-vitals";
import { env } from "@/lib/env";

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (env.NODE_ENV === "development") {
      console.info(`[Web Vital] ${metric.name}:`, metric.value);
    }
  });

  return null;
}
