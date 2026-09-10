import { createAdminClient } from './supabase/server';
import {
  Employee,
  Session,
  TelemetryEvent,
  Payment,
  AdminUser,
  AnalyticsSummary,
  EmailCampaign,
  EmailCampaignRecipient,
} from './types';
import bcrypt from 'bcryptjs';
import { cryptoNative } from './cryptoNative';
import { DEFAULT_MEMORIAL_EMAIL_SUBJECT, DEFAULT_MEMORIAL_EMAIL_BODY } from './resend';

// --- Local In-Memory Fallback Store ---
interface MemoryStore {
  adminUsers: AdminUser[];
  employees: Employee[];
  sessions: Session[];
  telemetryEvents: TelemetryEvent[];
  payments: Payment[];
  emailCampaigns: EmailCampaign[];
  emailCampaignRecipients: EmailCampaignRecipient[];
}

const memoryStore: MemoryStore = {
  adminUsers: [
    {
      id: 'admin-001',
      username: 'admin',
      // Hash for "Admin@JHS2026"
      password_hash: bcrypt.hashSync('Admin@JHS2026', 10),
      role: 'admin',
      created_at: new Date().toISOString(),
    },
  ],
  employees: [
    {
      id: 'emp-101',
      full_name: 'Rajesh Sharma',
      employee_id: 'JHS-2024-089',
      phone: '+91 98765 43210',
      email: 'rajesh.sharma@jhsassociates.in',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'emp-102',
      full_name: 'Priya Mehta',
      employee_id: 'JHS-2023-142',
      phone: '+91 98200 11223',
      email: 'priya.mehta@jhsassociates.in',
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ],
  sessions: [
    {
      id: 'sess-001',
      visitor_id: 'vis-8923-abc',
      consent_given: true,
      ip_address: '103.22.45.12',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36',
      device_type: 'Desktop',
      browser: 'Chrome',
      os: 'Windows',
      screen_width: 1920,
      screen_height: 1080,
      viewport_width: 1920,
      viewport_height: 940,
      referrer: 'https://jhsassociates.in/',
      utm_source: 'internal_portal',
      utm_medium: 'email',
      utm_campaign: 'employee_launch',
      landing_page: '/',
      exit_page: '/thank-you',
      started_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      ended_at: new Date(Date.now() - 86400000 * 2 + 168000).toISOString(),
      total_duration: 168,
      conversion_status: 'contributed',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'sess-002',
      visitor_id: 'vis-7721-xyz',
      consent_given: true,
      ip_address: '115.110.12.5',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
      device_type: 'Mobile',
      browser: 'Safari',
      os: 'iOS',
      screen_width: 393,
      screen_height: 852,
      viewport_width: 393,
      viewport_height: 750,
      referrer: 'Direct',
      landing_page: '/',
      exit_page: '/thank-you',
      started_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      ended_at: new Date(Date.now() - 86400000 * 1 + 130000).toISOString(),
      total_duration: 130,
      conversion_status: 'contributed',
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ],
  telemetryEvents: [
    {
      id: 'evt-001',
      session_id: 'sess-001',
      event_type: 'session_start',
      page: '/',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      metadata: { referrer: 'https://jhsassociates.in/' },
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  payments: [
    {
      id: 'pay-001',
      employee_id: 'emp-101',
      session_id: 'sess-001',
      amount: 2500,
      currency: 'INR',
      payment_method: 'upi',
      status: 'successful',
      transaction_ref: 'TXN-893412-FOH',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      completed_at: new Date(Date.now() - 86400000 * 2 + 165000).toISOString(),
    },
  ],
  emailCampaigns: [
    {
      id: 'draft-001',
      name: 'Initial Ahmed Memorial Announcement',
      subject: DEFAULT_MEMORIAL_EMAIL_SUBJECT,
      body_html: DEFAULT_MEMORIAL_EMAIL_BODY,
      from_email: 'hr@jhsossociates.in',
      reply_to: 'hr@jhsossociates.in',
      status: 'draft',
      total_recipients: 2,
      sent_count: 0,
      delivered_count: 0,
      failed_count: 0,
      skipped_count: 0,
      selected_recipients: ['emp-101', 'emp-102'],
      created_by: 'admin',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ],
  emailCampaignRecipients: [],
};

// Database Service Implementation
export const db = {
  // --- Admin Users ---
  async getAdminByUsername(username: string): Promise<AdminUser | null> {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('username', username)
          .single();
        if (!error && data) return data as AdminUser;
      } catch (err) {}
    }
    return memoryStore.adminUsers.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
  },

  // --- Sessions ---
  async createSession(sessionData: Partial<Session>): Promise<Session> {
    const newSession: Session = {
      id: sessionData.id || cryptoNative.randomUUID(),
      visitor_id: sessionData.visitor_id || `vis-${Math.random().toString(36).substring(2, 9)}`,
      consent_given: sessionData.consent_given ?? false,
      ip_address: sessionData.ip_address || '127.0.0.1',
      user_agent: sessionData.user_agent || '',
      device_type: sessionData.device_type || 'Desktop',
      browser: sessionData.browser || 'Unknown',
      os: sessionData.os || 'Unknown',
      screen_width: sessionData.screen_width || 1920,
      screen_height: sessionData.screen_height || 1080,
      viewport_width: sessionData.viewport_width || 1920,
      viewport_height: sessionData.viewport_height || 1080,
      referrer: sessionData.referrer || 'Direct',
      utm_source: sessionData.utm_source || undefined,
      utm_medium: sessionData.utm_medium || undefined,
      utm_campaign: sessionData.utm_campaign || undefined,
      landing_page: sessionData.landing_page || '/',
      exit_page: sessionData.exit_page || '/',
      started_at: new Date().toISOString(),
      total_duration: 0,
      conversion_status: 'visitor',
      created_at: new Date().toISOString(),
    };

    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('sessions').insert(newSession).select('*').single();
        if (!error && data) return data as Session;
      } catch (e) {}
    }

    memoryStore.sessions.push(newSession);
    return newSession;
  },

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | null> {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('sessions').update(updates).eq('id', id).select('*').single();
        if (!error && data) return data as Session;
      } catch (e) {}
    }

    const idx = memoryStore.sessions.findIndex((s) => s.id === id);
    if (idx !== -1) {
      memoryStore.sessions[idx] = { ...memoryStore.sessions[idx], ...updates };
      return memoryStore.sessions[idx];
    }
    return null;
  },

  async getSessionById(id: string): Promise<Session | null> {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('sessions').select('*').eq('id', id).single();
        if (!error && data) return data as Session;
      } catch (e) {}
    }
    return memoryStore.sessions.find((s) => s.id === id) || null;
  },

  async getAllSessions(): Promise<Session[]> {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('sessions').select('*').order('started_at', { ascending: false });
        if (!error && data && data.length > 0) return data as Session[];
      } catch (e) {}
    }
    return [...memoryStore.sessions].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  },

  // --- Telemetry Events ---
  async addTelemetryEvent(eventData: Omit<TelemetryEvent, 'id' | 'created_at'>): Promise<TelemetryEvent> {
    const newEvent: TelemetryEvent = {
      id: cryptoNative.randomUUID(),
      session_id: eventData.session_id,
      event_type: eventData.event_type,
      page: eventData.page || '/',
      timestamp: eventData.timestamp || new Date().toISOString(),
      metadata: eventData.metadata || {},
      created_at: new Date().toISOString(),
    };

    const supabase = createAdminClient();
    if (supabase) {
      try {
        await supabase.from('telemetry_events').insert(newEvent);
      } catch (e) {}
    }

    memoryStore.telemetryEvents.push(newEvent);

    if (eventData.session_id) {
      let conversion: Session['conversion_status'] | null = null;
      if (eventData.event_type === 'form_opened') conversion = 'form_started';
      if (eventData.event_type === 'form_submission') conversion = 'form_completed';
      if (eventData.event_type === 'payment_flow_started') conversion = 'payment_started';
      if (eventData.event_type === 'payment_success') conversion = 'contributed';

      if (conversion) {
        await this.updateSession(eventData.session_id, { conversion_status: conversion });
      }
    }

    return newEvent;
  },

  async getEventsBySessionId(sessionId: string): Promise<TelemetryEvent[]> {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('telemetry_events')
          .select('*')
          .eq('session_id', sessionId)
          .order('timestamp', { ascending: true });
        if (!error && data && data.length > 0) return data as TelemetryEvent[];
      } catch (e) {}
    }
    return memoryStore.telemetryEvents
      .filter((e) => e.session_id === sessionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  async getAllTelemetryEvents(): Promise<TelemetryEvent[]> {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('telemetry_events')
          .select('*')
          .order('timestamp', { ascending: false });
        if (!error && data && data.length > 0) return data as TelemetryEvent[];
      } catch (e) {}
    }
    return [...memoryStore.telemetryEvents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  // --- Employees ---
  async createEmployee(empData: Omit<Employee, 'id' | 'created_at'>): Promise<Employee> {
    const existing = await this.getEmployeeByEmployeeId(empData.employee_id);
    if (existing) {
      return existing;
    }

    const newEmp: Employee = {
      id: cryptoNative.randomUUID(),
      full_name: empData.full_name,
      employee_id: empData.employee_id,
      phone: empData.phone,
      email: empData.email,
      created_at: new Date().toISOString(),
    };

    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('employees').insert(newEmp).select('*').single();
        if (!error && data) {
          memoryStore.employees.push(newEmp);
          return data as Employee;
        }
      } catch (e) {}
    }

    memoryStore.employees.push(newEmp);
    return newEmp;
  },

  async getEmployeeByEmployeeId(empId: string): Promise<Employee | null> {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('employee_id', empId)
          .single();
        if (!error && data) return data as Employee;
      } catch (e) {}
    }
    return memoryStore.employees.find((e) => e.employee_id.toLowerCase() === empId.toLowerCase()) || null;
  },

  async getAllEmployees(): Promise<(Employee & { payments?: Payment[] })[]> {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data: empData, error: empErr } = await supabase
          .from('employees')
          .select('*')
          .order('created_at', { ascending: false });
        
        const { data: payData } = await supabase.from('payments').select('*');

        if (!empErr && empData && empData.length > 0) {
          return empData.map((emp) => ({
            ...emp,
            payments: (payData || []).filter((p) => p.employee_id === emp.id),
          }));
        }
      } catch (e) {}
    }

    return memoryStore.employees.map((emp) => ({
      ...emp,
      payments: memoryStore.payments.filter((p) => p.employee_id === emp.id),
    }));
  },

  // --- Payments ---
  async createPayment(payData: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
    const newPayment: Payment = {
      id: cryptoNative.randomUUID(),
      employee_id: payData.employee_id,
      session_id: payData.session_id,
      amount: payData.amount,
      currency: payData.currency || 'INR',
      payment_method: payData.payment_method,
      status: payData.status || 'pending',
      transaction_ref: payData.transaction_ref,
      created_at: new Date().toISOString(),
      completed_at: payData.completed_at || new Date().toISOString(),
    };

    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('payments').insert(newPayment).select('*').single();
        if (!error && data) {
          memoryStore.payments.push(newPayment);
          return data as Payment;
        }
      } catch (e) {}
    }

    memoryStore.payments.push(newPayment);
    return newPayment;
  },

  async updatePaymentStatus(id: string, status: Payment['status']): Promise<Payment | null> {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .update({ status, completed_at: new Date().toISOString() })
          .eq('id', id)
          .select('*')
          .single();
        if (!error && data) {
          const idx = memoryStore.payments.findIndex((p) => p.id === id);
          if (idx !== -1) memoryStore.payments[idx].status = status;
          return data as Payment;
        }
      } catch (e) {}
    }

    const idx = memoryStore.payments.findIndex((p) => p.id === id);
    if (idx !== -1) {
      memoryStore.payments[idx].status = status;
      memoryStore.payments[idx].completed_at = new Date().toISOString();
      return memoryStore.payments[idx];
    }
    return null;
  },

  async getPaymentByRef(ref: string): Promise<Payment | null> {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('payments').select('*').eq('transaction_ref', ref).single();
        if (!error && data) return data as Payment;
      } catch (e) {}
    }
    return memoryStore.payments.find((p) => p.transaction_ref === ref) || null;
  },

  async getAllPayments(): Promise<Payment[]> {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as Payment[];
      } catch (e) {}
    }
    return [...memoryStore.payments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // --- Email Campaigns & Drafts ---
  async createCampaign(campaignData: Partial<EmailCampaign>): Promise<EmailCampaign> {
    const campaign: EmailCampaign = {
      id: campaignData.id || cryptoNative.randomUUID(),
      name: campaignData.name || 'Untitled Campaign',
      subject: campaignData.subject || DEFAULT_MEMORIAL_EMAIL_SUBJECT,
      body_html: campaignData.body_html || DEFAULT_MEMORIAL_EMAIL_BODY,
      body_text: campaignData.body_text || '',
      from_email: campaignData.from_email || 'hr@jhsossociates.in',
      reply_to: campaignData.reply_to || 'hr@jhsossociates.in',
      status: campaignData.status || 'draft',
      total_recipients: campaignData.total_recipients || 0,
      sent_count: campaignData.sent_count || 0,
      delivered_count: campaignData.delivered_count || 0,
      failed_count: campaignData.failed_count || 0,
      skipped_count: campaignData.skipped_count || 0,
      selected_recipients: campaignData.selected_recipients || [],
      created_by: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('email_campaigns').insert(campaign).select('*').single();
        if (!error && data) {
          memoryStore.emailCampaigns.push(campaign);
          return data as EmailCampaign;
        }
      } catch (e) {}
    }

    memoryStore.emailCampaigns.push(campaign);
    return campaign;
  },

  async updateCampaign(id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign | null> {
    const updatedData = { ...updates, updated_at: new Date().toISOString() };
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('email_campaigns').update(updatedData).eq('id', id).select('*').single();
        if (!error && data) {
          const idx = memoryStore.emailCampaigns.findIndex((c) => c.id === id);
          if (idx !== -1) memoryStore.emailCampaigns[idx] = { ...memoryStore.emailCampaigns[idx], ...updatedData };
          return data as EmailCampaign;
        }
      } catch (e) {}
    }

    const idx = memoryStore.emailCampaigns.findIndex((c) => c.id === id);
    if (idx !== -1) {
      memoryStore.emailCampaigns[idx] = { ...memoryStore.emailCampaigns[idx], ...updatedData };
      return memoryStore.emailCampaigns[idx];
    }
    return null;
  },

  async getCampaignById(id: string): Promise<EmailCampaign | null> {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('email_campaigns').select('*').eq('id', id).single();
        if (!error && data) return data as EmailCampaign;
      } catch (e) {}
    }
    return memoryStore.emailCampaigns.find((c) => c.id === id) || null;
  },

  async getAllCampaigns(): Promise<EmailCampaign[]> {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('email_campaigns').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as EmailCampaign[];
      } catch (e) {}
    }
    return [...memoryStore.emailCampaigns].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getDrafts(): Promise<EmailCampaign[]> {
    const all = await this.getAllCampaigns();
    return all.filter((c) => c.status === 'draft');
  },

  async getSentCampaigns(): Promise<EmailCampaign[]> {
    const all = await this.getAllCampaigns();
    return all.filter((c) => c.status !== 'draft');
  },

  async createBatchCampaignRecipients(recipients: Omit<EmailCampaignRecipient, 'id' | 'created_at'>[]): Promise<EmailCampaignRecipient[]> {
    const records: EmailCampaignRecipient[] = recipients.map((r) => ({
      id: cryptoNative.randomUUID(),
      campaign_id: r.campaign_id,
      employee_id: r.employee_id,
      email: r.email,
      resend_message_id: r.resend_message_id,
      status: r.status || 'pending',
      error_message: r.error_message,
      sent_at: r.sent_at || new Date().toISOString(),
      delivered_at: r.delivered_at,
      created_at: new Date().toISOString(),
    }));

    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('email_campaign_recipients').insert(records).select('*');
        if (!error && data) {
          memoryStore.emailCampaignRecipients.push(...records);
          return data as EmailCampaignRecipient[];
        }
      } catch (e) {}
    }

    memoryStore.emailCampaignRecipients.push(...records);
    return records;
  },

  async getRecipientsByCampaignId(campaignId: string): Promise<EmailCampaignRecipient[]> {
    const employees = await this.getAllEmployees();
    const supabase = createAdminClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('email_campaign_recipients').select('*').eq('campaign_id', campaignId);
        if (!error && data && data.length > 0) {
          return data.map((r: EmailCampaignRecipient) => ({
            ...r,
            employee: employees.find((e) => e.id === r.employee_id || e.email === r.email),
          }));
        }
      } catch (e) {}
    }

    return memoryStore.emailCampaignRecipients
      .filter((r) => r.campaign_id === campaignId)
      .map((r) => ({
        ...r,
        employee: employees.find((e) => e.id === r.employee_id || e.email === r.email),
      }));
  },

  async updateRecipientDeliveryStatus(resendMessageId: string, status: EmailCampaignRecipient['status'], errorMessage?: string) {
    const supabase = createAdminClient();
    if (supabase) {
      try {
        await supabase
          .from('email_campaign_recipients')
          .update({
            status,
            error_message: errorMessage,
            delivered_at: status === 'delivered' ? new Date().toISOString() : undefined,
          })
          .eq('resend_message_id', resendMessageId);
      } catch (e) {}
    }

    const idx = memoryStore.emailCampaignRecipients.findIndex((r) => r.resend_message_id === resendMessageId);
    if (idx !== -1) {
      memoryStore.emailCampaignRecipients[idx].status = status;
      if (errorMessage) memoryStore.emailCampaignRecipients[idx].error_message = errorMessage;
      if (status === 'delivered') memoryStore.emailCampaignRecipients[idx].delivered_at = new Date().toISOString();
    }
  },

  async duplicateCampaignToDraft(campaignId: string): Promise<EmailCampaign | null> {
    const existing = await this.getCampaignById(campaignId);
    if (!existing) return null;

    return await this.createCampaign({
      name: `Copy of ${existing.name}`,
      subject: existing.subject,
      body_html: existing.body_html,
      body_text: existing.body_text,
      from_email: existing.from_email,
      reply_to: existing.reply_to,
      selected_recipients: existing.selected_recipients || [],
      status: 'draft',
    });
  },

  // --- Analytics & Aggregations ---
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const sessions = await this.getAllSessions();
    const events = await this.getAllTelemetryEvents();
    const payments = await this.getAllPayments();
    const employees = await this.getAllEmployees();

    const totalSessions = sessions.length;
    const uniqueVisitors = new Set(sessions.map((s) => s.visitor_id)).size;
    const totalDuration = sessions.reduce((acc, s) => acc + (s.total_duration || 0), 0);
    const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

    const formStarted = sessions.filter((s) => ['form_started', 'form_completed', 'payment_started', 'contributed'].includes(s.conversion_status)).length;
    const formCompleted = sessions.filter((s) => ['form_completed', 'payment_started', 'contributed'].includes(s.conversion_status)).length;
    const paymentPageVisits = sessions.filter((s) => ['payment_started', 'contributed'].includes(s.conversion_status)).length;
    const contributedSessions = sessions.filter((s) => s.conversion_status === 'contributed').length;

    const formCompletionRate = formStarted > 0 ? Math.round((formCompleted / formStarted) * 100) : 0;
    const formAbandonmentRate = formStarted > 0 ? Math.round(((formStarted - formCompleted) / formStarted) * 100) : 0;
    const paymentConversionRate = paymentPageVisits > 0 ? Math.round((contributedSessions / paymentPageVisits) * 100) : 0;

    const successfulPayments = payments.filter((p) => p.status === 'successful');
    const failedPayments = payments.filter((p) => p.status === 'failed');
    const totalContributionsSum = successfulPayments.reduce((acc, p) => acc + Number(p.amount), 0);

    const ctaClicks = events.filter((e) => e.event_type === 'cta_click').length;

    const getBreakdown = (key: keyof Session) => {
      const res: Record<string, number> = {};
      sessions.forEach((s) => {
        const val = (s[key] as string) || 'Unknown';
        res[val] = (res[val] || 0) + 1;
      });
      return res;
    };

    return {
      totalVisitors: uniqueVisitors,
      uniqueSessions: uniqueVisitors,
      totalSessions,
      avgSessionDuration: avgDuration,
      totalSubmissions: employees.length,
      formCompletionRate,
      formAbandonmentRate,
      paymentPageVisits,
      paymentConversionRate,
      totalContributions: totalContributionsSum,
      successfulContributionsCount: successfulPayments.length,
      failedContributionsCount: failedPayments.length,
      ctaClicksCount: ctaClicks,
      deviceBreakdown: getBreakdown('device_type'),
      browserBreakdown: getBreakdown('browser'),
      osBreakdown: getBreakdown('os'),
      screenSizeBreakdown: getBreakdown('screen_width'),
      referrerBreakdown: getBreakdown('referrer'),
      utmBreakdown: getBreakdown('utm_source'),
      scrollDepthBreakdown: {
        '25%': events.filter((e) => e.event_type === 'scroll_depth' && e.metadata?.depth === 25).length,
        '50%': events.filter((e) => e.event_type === 'scroll_depth' && e.metadata?.depth === 50).length,
        '75%': events.filter((e) => e.event_type === 'scroll_depth' && e.metadata?.depth === 75).length,
        '100%': events.filter((e) => e.event_type === 'scroll_depth' && e.metadata?.depth === 100).length,
      },
    };
  },
};
