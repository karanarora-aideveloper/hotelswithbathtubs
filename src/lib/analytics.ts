import type mixpanel from 'mixpanel-browser';

type MixpanelInstance = typeof mixpanel;

let mixpanelInstance: MixpanelInstance | null = null;
let mixpanelPromise: Promise<MixpanelInstance> | null = null;

async function getMixpanel(): Promise<MixpanelInstance> {
  if (mixpanelInstance) return mixpanelInstance;
  if (!mixpanelPromise) {
    mixpanelPromise = import('mixpanel-browser').then((m) => {
      mixpanelInstance = (m.default || m) as MixpanelInstance;
      return mixpanelInstance;
    });
  }
  return mixpanelPromise;
}

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || 'c19e5d48a1097faea5ce6f9a0fc44e3d';
let isMixpanelInitialized = false;
let isMixpanelReady = false;
const pendingSuperProps: Record<string, unknown>[] = [];

export const initMixpanel = () => {
  if (typeof window !== 'undefined' && !isMixpanelInitialized) {
    isMixpanelInitialized = true;
    const runInit = async () => {
      try {
        const mp = await getMixpanel();
        mp.init(MIXPANEL_TOKEN, {
          debug: process.env.NODE_ENV !== 'production',
          track_pageview: false,
          persistence: 'localStorage',
          batch_requests: false,
          loaded: () => {
            isMixpanelReady = true;
            if (pendingSuperProps.length > 0) {
              const merged = Object.assign({}, ...pendingSuperProps);
              mp.register(merged);
              pendingSuperProps.length = 0;
            }
          },
        });
      } catch (err) {
        console.warn('[Mixpanel] Init deferred failed:', err);
      }
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => runInit());
    } else {
      setTimeout(runInit, 150);
    }
  }
};

export const trackEvent = async (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    const ignoreTracking = localStorage.getItem('ignore_ga');
    if (ignoreTracking === 'true') {
      console.log(`[Mixpanel Blocked] Event: ${eventName}`, properties);
      return;
    }
    initMixpanel();
    try {
      const mp = await getMixpanel();
      if (!isMixpanelReady) {
        setTimeout(() => {
          try { mp.track(eventName, properties); } catch (_) {}
        }, 300);
        return;
      }
      mp.track(eventName, properties);
    } catch (e) {
      console.warn('[Mixpanel] track failed:', e);
    }
  }
};

export const registerSuperProperties = async (properties: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    initMixpanel();
    if (isMixpanelReady && mixpanelInstance) {
      try {
        mixpanelInstance.register(properties);
      } catch (e) {
        console.warn('[Mixpanel] register failed:', e);
      }
    } else {
      pendingSuperProps.push(properties);
    }
  }
};

export const identifyUser = async (userId: string, profileProperties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    initMixpanel();
    try {
      const mp = await getMixpanel();
      mp.identify(userId);
      if (profileProperties) {
        mp.people.set(profileProperties);
      }
    } catch (_) {}
  }
};

export const resetUser = async () => {
  if (typeof window !== 'undefined') {
    initMixpanel();
    try {
      const mp = await getMixpanel();
      mp.reset();
    } catch (_) {}
  }
};
