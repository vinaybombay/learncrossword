import posthog from 'posthog-js';

/**
 * Initialise PostHog analytics.
 * No-op when VITE_POSTHOG_KEY is absent (local dev / staging without key).
 */
export function initAnalytics(): void {
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (!key) return;

  posthog.init(key, {
    api_host: (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://us.i.posthog.com',
    capture_pageview: true,   // auto-tracks page navigation
    autocapture: false,       // manual events only — keep data clean
    persistence: 'localStorage',
  });
}

/**
 * Track a custom event.
 * Silently skips when analytics not initialised.
 */
export function trackEvent(event: string, props?: Record<string, unknown>): void {
  if (!import.meta.env.VITE_POSTHOG_KEY) return;
  posthog.capture(event, props);
}

/**
 * Associate future events with a logged-in user.
 * Call after login or registration.
 */
export function identifyUser(userId: string, props?: Record<string, unknown>): void {
  if (!import.meta.env.VITE_POSTHOG_KEY) return;
  posthog.identify(userId, props);
}

/**
 * Disassociate the user from future events (call on logout).
 */
export function resetAnalyticsUser(): void {
  if (!import.meta.env.VITE_POSTHOG_KEY) return;
  posthog.reset();
}
