import { Resend } from 'resend';
import { Employee } from './types';

const resendApiKey = process.env.RESEND_API_KEY || '';
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FOUNDATION_URL = 'https://forms.gle/SEcWiM9JFVBHfDbYA';

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

export const DEFAULT_MEMORIAL_EMAIL_BODY = `<div style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.7; color: #111827; max-width: 600px;">
  <p>Dear {{full_name}},</p>

  <p>With deep sadness, we share the passing of <strong>Ahmed Huziefa Unwala</strong>, beloved son of <strong>Mr. Huziefa Unwala</strong>.</p>

  <p>In his memory, <strong>JHS Associates</strong> is introducing <strong>Foundation of Hope</strong>, an initiative through which our JHS family can come together and honour his memory.</p>

  <p>We invite you to take a moment to learn about the initiative and participate if you wish. Your support and participation would be deeply appreciated.</p>

  <p style="margin: 22px 0;">
    <a href="https://forms.gle/SEcWiM9JFVBHfDbYA" style="color: #0284c7; font-weight: bold; text-decoration: underline; font-size: 15px;">https://forms.gle/SEcWiM9JFVBHfDbYA</a>
  </p>

  <p>Thank you for your understanding, kindness, and support.</p>

  <p style="margin-top: 28px;">
    Regards,<br/>
    <strong>Human Resources</strong><br/>
    <strong>JHS Associates</strong>
  </p>
</div>`;

export async function sendTestEmail({
  to,
  subject,
  bodyHtml,
  fromEmail = 'hr@jhsossociates.in',
  replyTo = 'hr@jhsossociates.in',
}: {
  to: string;
  subject: string;
  bodyHtml: string;
  fromEmail?: string;
  replyTo?: string;
}) {
  if (!resend) {
    return {
      id: `mock_test_${Date.now()}`,
      mock: true,
      status: 'sent',
    };
  }

  const personalized = personalizeEmail(bodyHtml, {
    full_name: 'Test Recipient',
    email: to,
    employee_id: 'JHS-TEST-001',
  });

  const response = await resend.emails.send({
    from: fromEmail,
    replyTo: replyTo,
    to: [to],
    subject: subject,
    html: personalized,
    text: personalized.replace(/<[^>]+>/g, ''), // Plain text fallback
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
}

export async function sendBatchCampaign({
  fromEmail = 'hr@jhsossociates.in',
  replyTo = 'hr@jhsossociates.in',
  subject,
  bodyHtml,
  recipients,
}: {
  fromEmail?: string;
  replyTo?: string;
  subject: string;
  bodyHtml: string;
  recipients: Array<{
    id: string;
    email: string;
    employee?: Partial<Employee>;
  }>;
}) {
  if (!resend) {
    return recipients.map((r) => ({
      recipientId: r.id,
      resendMessageId: `mock_msg_${Date.now()}_${r.id}`,
      status: 'sent' as const,
    }));
  }

  const BATCH_LIMIT = 100;
  const results: Array<{
    recipientId: string;
    resendMessageId?: string;
    status: 'sent' | 'failed';
    error?: string;
  }> = [];

  for (let i = 0; i < recipients.length; i += BATCH_LIMIT) {
    const chunk = recipients.slice(i, i + BATCH_LIMIT);

    const payload = chunk.map((r) => {
      const personalized = personalizeEmail(bodyHtml, r.employee || { email: r.email });
      return {
        from: fromEmail,
        replyTo: replyTo,
        to: [r.email],
        subject: subject,
        html: personalized,
        text: personalized.replace(/<[^>]+>/g, ''),
      };
    });

    try {
      const response = await resend.batch.send(payload);

      if (response.error) {
        chunk.forEach((r) => {
          results.push({
            recipientId: r.id,
            status: 'failed',
            error: response.error?.message,
          });
        });
      } else if (response.data && Array.isArray(response.data.data)) {
        response.data.data.forEach((item: any, idx: number) => {
          const targetRec = chunk[idx];
          if (item.error) {
            results.push({
              recipientId: targetRec.id,
              status: 'failed',
              error: item.error.message || 'Resend error',
            });
          } else {
            results.push({
              recipientId: targetRec.id,
              resendMessageId: item.id,
              status: 'sent',
            });
          }
        });
      }
    } catch (err: any) {
      chunk.forEach((r) => {
        results.push({
          recipientId: r.id,
          status: 'failed',
          error: err.message || 'Batch network error',
        });
      });
    }

    if (i + BATCH_LIMIT < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  return results;
}
