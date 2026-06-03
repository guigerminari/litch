import "./env";
import { PostHog } from "posthog-node";

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY?.trim();
const POSTHOG_HOST = process.env.POSTHOG_HOST?.trim() || "https://us.i.posthog.com";
const POSTHOG_DISABLED = ["1", "true", "yes"].includes((process.env.POSTHOG_DISABLED ?? "").toLowerCase());

const client = POSTHOG_API_KEY && !POSTHOG_DISABLED
  ? new PostHog(POSTHOG_API_KEY, {
      host: POSTHOG_HOST,
      privacyMode: true,
      enableExceptionAutocapture: false
    })
  : null;

export function analyticsEnabled() {
  return Boolean(client);
}

export function trackEvent(playerId: string | undefined, event: string, properties: AnalyticsProperties = {}) {
  if (!client || !playerId) {
    return;
  }

  try {
    client.capture({
      distinctId: playerId,
      event,
      properties: {
        app: "litch",
        environment: process.env.NODE_ENV ?? "development",
        ...properties
      }
    });
  } catch (error) {
    console.warn("[analytics] failed to capture event", event, error);
  }
}

export async function shutdownAnalytics() {
  if (!client) {
    return;
  }

  try {
    await client._shutdown(2000);
  } catch (error) {
    console.warn("[analytics] failed to flush events", error);
  }
}
