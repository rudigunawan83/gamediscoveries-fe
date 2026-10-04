import type { AnalyticsEventName, AnalyticsPayload } from "@/lib/analytics/types";

function emit(event: AnalyticsEventName, payload?: AnalyticsPayload) {
  if (process.env.NODE_ENV === "development") {
    console.info("[analytics]", event, payload ?? {});
  }

  // Vendor adapters (Plausible, GA, custom ingest) can be plugged here later.
}

export const analytics = {
  track(event: AnalyticsEventName, payload?: AnalyticsPayload) {
    emit(event, payload);
  },
  pageView(path: string) {
    emit("page_view", { path });
  },
};
