export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  role: string;
  created_at: string;
  updated_at?: string;
}

export interface Employee {
  id: string;
  full_name: string;
  employee_id: string;
  phone: string;
  email: string;
  created_at: string;
}

export type ConversionStatus = 'visitor' | 'form_started' | 'form_completed' | 'payment_started' | 'contributed';

export interface Session {
  id: string;
  visitor_id: string;
  consent_given: boolean;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  screen_width?: number;
  screen_height?: number;
  viewport_width?: number;
  viewport_height?: number;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing_page?: string;
  exit_page?: string;
  started_at: string;
  ended_at?: string;
  total_duration?: number; // in seconds
  conversion_status: ConversionStatus;
  created_at: string;
}

export type EventType =
  | 'session_start'
  | 'session_end'
  | 'page_view'
  | 'cta_click'
  | 'button_click'
  | 'navigation'
  | 'form_opened'
  | 'form_field_focus'
  | 'form_field_interaction'
  | 'form_field_completed'
  | 'form_validation_error'
  | 'form_submission'
  | 'form_abandonment'
  | 'payment_page_opened'
  | 'payment_method_selected'
  | 'payment_flow_started'
  | 'payment_success'
  | 'payment_failure'
  | 'thank_you_page_reached'
  | 'scroll_depth';

export interface TelemetryEvent {
  id: string;
  session_id: string;
  event_type: EventType;
  page: string;
  timestamp: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export type PaymentMethod = 'upi' | 'netbanking' | 'card' | 'payroll_deduction';
export type PaymentStatus = 'pending' | 'successful' | 'failed';

export interface Payment {
  id: string;
  employee_id: string;
  session_id?: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  transaction_ref: string;
  created_at: string;
  completed_at?: string;
  employee?: Employee;
}

export interface AnalyticsSummary {
  totalVisitors: number;
  uniqueSessions: number;
  totalSessions: number;
  avgSessionDuration: number; // in seconds
  totalSubmissions: number;
  formCompletionRate: number; // percentage
  formAbandonmentRate: number; // percentage
  paymentPageVisits: number;
  paymentConversionRate: number; // percentage
  totalContributions: number; // monetary sum
  successfulContributionsCount: number;
  failedContributionsCount: number;
  ctaClicksCount: number;
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  osBreakdown: Record<string, number>;
  screenSizeBreakdown: Record<string, number>;
  referrerBreakdown: Record<string, number>;
  utmBreakdown: Record<string, number>;
  scrollDepthBreakdown: Record<string, number>;
}

// --- Email Campaign Types ---
export type CampaignStatus = 'draft' | 'ready' | 'sending' | 'sent' | 'partially_sent' | 'failed';
export type RecipientStatus = 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed' | 'skipped';

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text?: string;
  from_email: string;
  reply_to?: string;
  status: CampaignStatus;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  skipped_count: number;
  selected_recipients?: string[]; // Array of employee IDs
  created_by?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface EmailCampaignRecipient {
  id: string;
  campaign_id: string;
  employee_id?: string;
  email: string;
  resend_message_id?: string;
  status: RecipientStatus;
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  created_at: string;
  employee?: Employee;
}
