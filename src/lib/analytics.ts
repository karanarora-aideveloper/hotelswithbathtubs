import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!;
let isMixpanelInitialized = false;
// True only after the SDK's `loaded` callback fires — persistence is ready at this point
let isMixpanelReady = false;
// Super-property queue: register() calls that arrive before `loaded` fires are buffered
const pendingSuperProps: Record<string, any>[] = [];

export const initMixpanel = () => {
  if (typeof window !== 'undefined' && !isMixpanelInitialized) {
    isMixpanelInitialized = true; // set before init so re-entrant calls don't double-init
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: process.env.NODE_ENV !== 'production',
      track_pageview: false,
      persistence: 'localStorage',
      batch_requests: false, // Deliver immediately
      loaded: () => {
        isMixpanelReady = true;
        // Flush any register() calls that arrived before the SDK was ready
        if (pendingSuperProps.length > 0) {
          const merged = Object.assign({}, ...pendingSuperProps);
          mixpanel.register(merged);
          pendingSuperProps.length = 0;
        }
      },
    });
  }
};

export const sendGAEvent = (action: string, category: string, label: string, value?: number) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    const ignoreGa = localStorage.getItem('ignore_ga');
    if (ignoreGa === 'true') {
      console.log(`[GA4 Blocked] Event: ${action}`, { category, label, value });
      return;
    }

    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    initMixpanel();
    const ignoreTracking = localStorage.getItem('ignore_ga');
    if (ignoreTracking === 'true') {
      console.log(`[Mixpanel Blocked] Event: ${eventName}`, properties);
      return;
    }
    if (!isMixpanelReady) return; // don't fire track before SDK is fully ready
    try {
      mixpanel.track(eventName, properties);
    } catch (e) {
      console.warn('[Mixpanel] track failed:', e);
    }
  }
};

export const registerSuperProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    initMixpanel();
    if (isMixpanelReady) {
      try {
        mixpanel.register(properties);
      } catch (e) {
        console.warn('[Mixpanel] register failed:', e);
      }
    } else {
      // Buffer until the loaded callback fires
      pendingSuperProps.push(properties);
    }
  }
};

export const identifyUser = (userId: string, profileProperties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    initMixpanel();
    mixpanel.identify(userId);
    if (profileProperties) {
      mixpanel.people.set(profileProperties);
    }
  }
};

export const resetUser = () => {
  if (typeof window !== 'undefined') {
    initMixpanel();
    mixpanel.reset();
  }
};
