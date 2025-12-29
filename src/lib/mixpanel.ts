import mixpanel from 'mixpanel-browser';
import { v4 as uuidv4 } from 'uuid';

// Mixpanel configuration
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || 'f5adbdf2bc810129a104620f0e7ecf07';
const isProduction = process.env.NODE_ENV === 'production';

// Global flag to track initialization
let isInitialized = false;

// Initialize Mixpanel
export const initMixpanel = () => {
  if (typeof window !== 'undefined' && !isInitialized) {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: !isProduction,
      track_pageview: false, // We'll handle page views manually
      persistence: 'localStorage',
    });
    isInitialized = true;
  }
};

// User identification and profile management
export const identifyUser = () => {
  if (typeof window === 'undefined' || !isInitialized) return null;

  let userId = localStorage.getItem('mixpanel_user_id');
  
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem('mixpanel_user_id', userId);
    
    // Set initial user properties
    mixpanel.identify(userId);
    mixpanel.people.set({
      $name: '',
      first_visit_date: new Date().toISOString(),
      user_agent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  } else {
    mixpanel.identify(userId);
  }
  
  return userId;
};

// Track page views
export const trackPageView = (pageName: string, properties?: Record<string, unknown>) => {
  if (typeof window === 'undefined' || !isInitialized) return;
  
  mixpanel.track('Page View', {
    page_name: pageName,
    url: window.location.href,
    referrer: document.referrer,
    timestamp: new Date().toISOString(),
    ...properties,
  });
};

// Track custom events
export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  if (typeof window === 'undefined' || !isInitialized) return;
  
  mixpanel.track(eventName, {
    timestamp: new Date().toISOString(),
    ...properties,
  });
};

// Update user profile with form data
export const updateUserProfile = (properties: Record<string, unknown>) => {
  if (typeof window === 'undefined' || !isInitialized) return;
  
  mixpanel.people.set({
    last_updated: new Date().toISOString(),
    ...properties,
  });
};

// Form tracking functions
export const trackFormStart = () => {
  trackEvent('Form Started', {
    form_type: 'customs_declaration',
  });
  
  updateUserProfile({
    form_started: true,
    form_start_date: new Date().toISOString(),
  });
};

export const trackFormFieldUpdate = (fieldName: string, value: string) => {
  trackEvent('Form Field Updated', {
    field_name: fieldName,
    field_value: value,
    form_type: 'customs_declaration',
  });
  
  // Update user profile with form data
  const profileUpdate: Record<string, unknown> = {
    last_form_update: new Date().toISOString(),
  };
  
  switch (fieldName) {
    case 'fullPassportName':
      profileUpdate.$name = value;
      profileUpdate.passport_name = value;
      break;
    case 'nationality':
      profileUpdate.nationality = value;
      break;
    case 'flightNumber':
      profileUpdate.flight_number = value;
      break;
    case 'arrivalDate':
      profileUpdate.arrival_date = value;
      break;
    case 'portOfArrival':
      profileUpdate.port_of_arrival = value;
      break;
  }
  
  updateUserProfile(profileUpdate);
};

export const trackFormValidationError = (fieldName: string, errorMessage: string) => {
  trackEvent('Form Validation Error', {
    field_name: fieldName,
    error_message: errorMessage,
    form_type: 'customs_declaration',
  });
};

export const  trackFormSubmission = () => {
  trackEvent('Form Submitted', {
    form_type: 'customs_declaration',
    submission_date: new Date().toISOString(),
  });
  
  updateUserProfile({
    form_completed: true,
    form_completion_date: new Date().toISOString(),
    form_completion_count: mixpanel.people.increment('form_completion_count', 1),
  });
};

export const trackFormAbandonment = (completionPercentage: number) => {
  trackEvent('Form Abandoned', {
    form_type: 'customs_declaration',
    completion_percentage: completionPercentage,
    abandonment_date: new Date().toISOString(),
  });
  
  updateUserProfile({
    form_abandoned: true,
    last_abandonment_date: new Date().toISOString(),
  });
};

export const trackAutomationFailure = (errorCode: string, errorMessage: string, errorStep?: string, errorDetails?: unknown) => {
  trackEvent('Automation Failed', {
    form_type: 'customs_declaration',
    error_code: errorCode,
    error_message: errorMessage,
    error_step: errorStep,
    failure_date: new Date().toISOString(),
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    error_details: errorDetails,
  });
  
  updateUserProfile({
    last_automation_failure: new Date().toISOString(),
    automation_failure_count: mixpanel.people.increment('automation_failure_count', 1),
    last_error_code: errorCode,
    last_error_step: errorStep,
  });
};

// Button click tracking
export const trackButtonClick = (buttonName: string, location: string, properties?: Record<string, unknown>) => {
  trackEvent('Button Click', {
    button_name: buttonName,
    location: location,
    ...properties,
  });
};

// Language change tracking
export const trackLanguageChange = (newLanguage: string, previousLanguage: string) => {
  trackEvent('Language Changed', {
    new_language: newLanguage,
    previous_language: previousLanguage,
  });
  
  updateUserProfile({
    current_language: newLanguage,
    language_change_count: mixpanel.people.increment('language_change_count', 1),
  });
};

// User journey tracking
export const trackUserJourney = (step: string, stepNumber: number) => {
  trackEvent('User Journey Step', {
    step_name: step,
    step_number: stepNumber,
    journey_type: 'customs_declaration',
  });
  
  updateUserProfile({
    current_journey_step: step,
    max_journey_step: Math.max(stepNumber, 0), // Will be incremented by Mixpanel
  });
};

// Analytics utilities
export const getMixpanelInstance = () => {
  if (typeof window !== 'undefined') {
    return mixpanel;
  }
  return null;
};

export const resetUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mixpanel_user_id');
    mixpanel.reset();
  }
};