// Product analytics now go through src/lib/events.ts with 10 streamlined GA4 events.
// Legacy analytics stubs kept as no-ops so older imports continue compiling without error.

export const trackEvent = async (_eventName?: string, _properties?: Record<string, unknown>) => {
  void _eventName;
  void _properties;
};
export const initMixpanel = () => {};
export const registerSuperProperties = async (_properties?: Record<string, unknown>) => {
  void _properties;
};
export const identifyUser = async (_userId?: string, _profileProperties?: Record<string, unknown>) => {
  void _userId;
  void _profileProperties;
};
export const resetUser = async () => {};
