// Product analytics now go to Google Analytics 4 only (decision D6, 25 Oct 2026).
// Mixpanel and PostHog were removed to cut ~220 KB of compressed JavaScript from every page.
// These helpers keep the existing call sites working and forward events to GA4.
import { sendGA4Event } from '@/lib/gtag';
import { isUserExcluded } from '@/lib/exclusion';

// Sent to GA4 elsewhere already (page views by the GA provider, booking clicks by gtag.ts).
const ALREADY_SENT = new Set(['page_view', 'hotel_booking_click']);

export const trackEvent = async (eventName: string, properties?: Record<string, any>) => {
  if (typeof window === 'undefined' || isUserExcluded() || ALREADY_SENT.has(eventName)) return;
  sendGA4Event(eventName, properties);
};

// Kept as no-ops so older imports keep compiling.
export const initMixpanel = () => {};
export const registerSuperProperties = async (_properties: Record<string, any>) => {};
export const identifyUser = async (_userId: string, _profileProperties?: Record<string, any>) => {};
export const resetUser = async () => {};
