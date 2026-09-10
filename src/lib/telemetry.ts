import { EventType } from './types';

const CONSENT_KEY = 'foh_telemetry_consent';
const VISITOR_KEY = 'foh_visitor_id';
const SESSION_KEY = 'foh_session_id';

export interface TelemetryConfig {
  consentGiven: boolean;
  visitorId: string;
  sessionId: string;
}

class TelemetryEngine {
  private consent: 'accepted' | 'declined' | 'pending' = 'pending';
  private visitorId: string = '';
  private sessionId: string = '';
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (this.isInitialized) return;

    // Load consent
    const storedConsent = localStorage.getItem(CONSENT_KEY) as 'accepted' | 'declined' | null;
    this.consent = storedConsent || 'pending';

    // Visitor ID
    let vId = localStorage.getItem(VISITOR_KEY);
    if (!vId) {
      vId = `vis-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
      localStorage.setItem(VISITOR_KEY, vId);
    }
    this.visitorId = vId;

    // Session ID
    let sId = sessionStorage.getItem(SESSION_KEY);
    if (!sId) {
      sId = `sess-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
      sessionStorage.setItem(SESSION_KEY, sId);
    }
    this.sessionId = sId;

    this.isInitialized = true;
  }

  public setConsent(status: 'accepted' | 'declined') {
    this.consent = status;
    if (typeof window !== 'undefined') {
      localStorage.setItem(CONSENT_KEY, status);
    }

    if (status === 'accepted') {
      // Start session on server
      this.startSessionOnServer();
    }
  }

  public getConsentStatus(): 'accepted' | 'declined' | 'pending' {
    if (typeof window !== 'undefined' && !this.isInitialized) {
      this.init();
    }
    return this.consent;
  }

  public getSessionId(): string {
    if (typeof window !== 'undefined' && !this.isInitialized) {
      this.init();
    }
    return this.sessionId;
  }

  public getVisitorId(): string {
    if (typeof window !== 'undefined' && !this.isInitialized) {
      this.init();
    }
    return this.visitorId;
  }

  private getDeviceMetadata() {
    if (typeof window === 'undefined') return {};

    const ua = navigator.userAgent;
    let deviceType = 'Desktop';
    if (/tablet|ipad|playbook|silk/i.test(ua)) deviceType = 'Tablet';
    else if (/Mobile|Android|iP(hone|od)/i.test(ua)) deviceType = 'Mobile';

    let browser = 'Unknown';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    else if (ua.includes('Trident')) browser = 'Internet Explorer';
    else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';

    let os = 'Unknown';
    if (ua.includes('Win')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('X11') || ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iP(hone|od|ad)')) os = 'iOS';

    const urlParams = new URLSearchParams(window.location.search);

    return {
      deviceType,
      browser,
      os,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      referrer: document.referrer || 'Direct',
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined,
      landingPage: window.location.pathname,
    };
  }

  public async startSessionOnServer() {
    if (this.consent !== 'accepted') return;

    try {
      const meta = this.getDeviceMetadata();
      await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          visitorId: this.visitorId,
          consentGiven: true,
          ...meta,
        }),
      });

      // Track initial session_start event
      this.trackEvent('session_start', { page: window.location.pathname });
    } catch (e) {
      console.warn('Telemetry session start failed:', e);
    }
  }

  public async trackEvent(eventType: EventType, metadata: Record<string, any> = {}) {
    // STRICT RULE: Do not collect telemetry if consent is not explicitly accepted
    if (this.consent !== 'accepted') {
      return;
    }

    if (typeof window === 'undefined') return;

    // SANITIZATION GUARANTEE: Filter out sensitive field names or inputs if any slipped in
    const safeMetadata = { ...metadata };
    delete safeMetadata.password;
    delete safeMetadata.creditCard;
    delete safeMetadata.cvv;
    delete safeMetadata.upiPin;
    delete safeMetadata.otp;
    delete safeMetadata.phone; // Do not log raw phone in telemetry!
    delete safeMetadata.email; // Do not log raw email in telemetry!
    delete safeMetadata.fullName; // Do not log raw name in telemetry!

    try {
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          eventType,
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
          metadata: safeMetadata,
        }),
      });
    } catch (err) {
      // Silent telemetry failure
    }
  }

  // --- Specific Convenient Helpers ---
  public trackPageView(title?: string) {
    this.trackEvent('page_view', { title: title || document.title });
  }

  public trackCtaClick(elementId: string, label: string) {
    this.trackEvent('cta_click', { elementId, label });
  }

  public trackFormOpened(step: string) {
    this.trackEvent('form_opened', { step });
  }

  public trackFormFieldFocus(fieldName: string) {
    this.trackEvent('form_field_focus', { fieldName });
  }

  public trackFormFieldInteraction(fieldName: string) {
    this.trackEvent('form_field_interaction', { fieldName });
  }

  public trackFormFieldCompleted(fieldName: string) {
    // Track that field was completed WITHOUT sending its value
    this.trackEvent('form_field_completed', { fieldName });
  }

  public trackFormSubmission(step: string) {
    this.trackEvent('form_submission', { step });
  }

  public trackPaymentPageOpened() {
    this.trackEvent('payment_page_opened');
  }

  public trackPaymentMethodSelected(method: string) {
    this.trackEvent('payment_method_selected', { method });
  }

  public trackPaymentFlowStarted(method: string, amount: number) {
    this.trackEvent('payment_flow_started', { method, amount });
  }

  public trackPaymentSuccess(transactionRef: string) {
    this.trackEvent('payment_success', { transactionRef });
  }

  public trackThankYouReached() {
    this.trackEvent('thank_you_page_reached');
  }

  public trackScrollDepth(depth: 25 | 50 | 75 | 100) {
    this.trackEvent('scroll_depth', { depth });
  }
}

export const telemetry = new TelemetryEngine();
