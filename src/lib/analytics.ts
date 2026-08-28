type AnalyticsEvent = {
  name: string;
  props?: Record<string, string | number | boolean | null | undefined>;
};

export function track(event: AnalyticsEvent) {
  if (process.env.NODE_ENV === "development") {
    console.info("[analytics]", event.name, event.props ?? {});
  }
}

export function trackClient(name: string, props?: AnalyticsEvent["props"]) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("aurevia-analytics", { detail: { name, props } }));
}
