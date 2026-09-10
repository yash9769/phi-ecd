import { Resend } from 'resend';
import { Employee } from './types';

const resendApiKey = process.env.RESEND_API_KEY || '';
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FOUNDATION_URL = process.env.NEXT_PUBLIC_FOUNDATION_OF_HOPE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://awareness-jhs.vercel.app';

export function personalizeEmail(
  templateHtml: string,
  employee: Partial<Employee>
): string {
  const fullName = employee.full_name || 'Valued Team Member';
  const employeeId = employee.employee_id || 'JHS-MEMBER';
  const email = employee.email || '';

  return templateHtml
    .replace(/\{\{\s*full_name\s*\}\}/g, fullName)
    .replace(/\{\{\s*employee_id\s*\}\}/g, employeeId)
    .replace(/\{\{\s*email\s*\}\}/g, email)
    .replace(/\{\{\s*foundation_url\s*\}\}/g, FOUNDATION_URL);
}

export const DEFAULT_MEMORIAL_EMAIL_SUBJECT = 'An Initiative in Memory of Ahmed Huziefa Unwala';

export const DEFAULT_MEMORIAL_EMAIL_BODY = `<p>Dear {{full_name}},</p>

<p>With a heavy heart, I share that my beloved son, <strong>Ahmed Huziefa Unwala</strong>, passed away yesterday.</p>

<p>In his memory, we are starting an initiative and would like to invite members of the JHS family to support it.</p>

<p>If you would like to contribute, you can do so through the link below. Please contribute any amount you feel comfortable with.</p>

<p style="text-align: center; margin: 36px 0;">
  <a href="{{foundation_url}}" style="background-color: #d62049; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 100px; font-weight: bold; font-family: 'DM Sans', sans-serif; font-size: 14px; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 14px rgba(214, 32, 73, 0.4);">
    CONTRIBUTE IN AHMED'S MEMORY
  </a>
</p>

<p>Thank you for your support and kindness during this difficult time.</p>

<p>Regards,<br><strong>Huziefa Unwala</strong><br>CEO, JHS & Associates LLP</p>`;

export async function sendTestEmail(params: {
  to: string;
  subject: string;
  bodyHtml: string;
  fromEmail: string;
  replyTo?: string;
  sampleEmployee?: Partial<Employee>;
}) {
  const sample = params.sampleEmployee || {
    full_name: 'Test Recipient',
    employee_id: 'JHS-TEST-001',
    email: params.to,
  };

  const personalizedHtml = personalizeEmail(params.bodyHtml, sample);
  const from = params.fromEmail || process.env.RESEND_FROM_EMAIL || 'Foundation of Hope <foundationofhope@jhsassociates.in>';

  if (!resend) {
    console.log('[MOCK RESEND TEST EMAIL SENT]', {
      to: params.to,
      from,
      subject: params.subject,
    });
    return {
      id: `mock_test_${Date.now()}`,
      mock: true,
    };
  }

  const { data, error } = await resend.emails.send({
    from,
    to: [params.to],
    replyTo: params.replyTo || undefined,
    subject: params.subject,
    html: personalizedHtml,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function sendBatchCampaign(params: {
  fromEmail: string;
  replyTo?: string;
  subject: string;
  bodyHtml: string;
  recipients: Array<{ id: string; email: string; employee?: Employee }>;
}): Promise<Array<{ recipientId: string; resendMessageId?: string; status: 'sent' | 'failed'; error?: string }>> {
  const from = params.fromEmail || process.env.RESEND_FROM_EMAIL || 'Foundation of Hope <foundationofhope@jhsassociates.in>';
  const results: Array<{ recipientId: string; resendMessageId?: string; status: 'sent' | 'failed'; error?: string }> = [];

  // Resend API allows max 100 emails per batch payload
  const BATCH_SIZE = 100;
  for (let i = 0; i < params.recipients.length; i += BATCH_SIZE) {
    const batch = params.recipients.slice(i, i + BATCH_SIZE);

    if (!resend) {
      // Mock mode for local testing without key
      batch.forEach((r) => {
        results.push({
          recipientId: r.id,
          resendMessageId: `msg_mock_${Math.random().toString(36).substring(2, 10)}`,
          status: 'sent',
        });
      });
      continue;
    }

    const payload = batch.map((r) => ({
      from,
      to: [r.email],
      replyTo: params.replyTo || undefined,
      subject: params.subject,
      html: personalizeEmail(params.bodyHtml, r.employee || { email: r.email }),
    }));

    try {
      const response = await resend.batch.send(payload);
      if (response.data && response.data.data) {
        response.data.data.forEach((item: any, idx: number) => {
          results.push({
            recipientId: batch[idx].id,
            resendMessageId: item.id,
            status: 'sent',
          });
        });
      } else if (response.error) {
        batch.forEach((r) => {
          results.push({
            recipientId: r.id,
            status: 'failed',
            error: response.error?.message || 'Batch send failed',
          });
        });
      }
    } catch (err: any) {
      batch.forEach((r) => {
        results.push({
          recipientId: r.id,
          status: 'failed',
          error: err.message || 'Network error during batch send',
        });
      });
    }
  }

  return results;
}
