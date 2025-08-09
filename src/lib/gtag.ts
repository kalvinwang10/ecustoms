export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-16915832546';

declare global {
  interface Window {
    gtag: (
      option: string,
      trackingId: string,
      options?: {
        [key: string]: unknown;
      }
    ) => void;
    dataLayer: unknown[];
  }
}

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track conversion events
export const trackConversion = (conversionLabel?: string, value?: number, currency?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: conversionLabel ? `${GA_TRACKING_ID}/${conversionLabel}` : GA_TRACKING_ID,
      value: value || 1,
      currency: currency || 'USD',
    });
  }
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track form submission conversion with specific conversion label
export const trackFormSubmission = (url?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const callback = () => {
      if (typeof url !== 'undefined') {
        window.location.href = url;
      }
    };

    window.gtag('event', 'conversion', {
      send_to: 'AW-16915832546/9e4yCMDfj4AbEOK9jII_',
      event_callback: callback
    });
  }
};