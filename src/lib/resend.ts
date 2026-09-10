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

  <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 13px; color: #1e293b; line-height: 1.5;">
    <p style="margin: 0 0 4px 0; font-weight: bold; color: #0f172a;">Thanks and Regards</p>
    <p style="margin: 0 0 2px 0; font-weight: bold; color: #0f172a;">HR Team</p>
    <p style="margin: 0 0 2px 0;"><strong>M:</strong> India (+91) 8097093034</p>
    <p style="margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:hr@jhsossociates.in" style="color: #0284c7; text-decoration: none;">hr@jhsossociates.in</a></p>
    
    <div style="margin: 10px 0;">
      <img src="https://awareness-jhs.vercel.app/jhs-logo.png" alt="JHS & Associates LLP" style="max-height: 55px; width: auto; display: block;" />
    </div>

    <p style="margin: 4px 0 2px 0; font-size: 12px; color: #475569;">(A peer reviewed firm)</p>
    <p style="margin: 0 0 8px 0; font-size: 12px; color: #475569;"><strong>Linkedin Id:</strong></p>

    <p style="margin: 0 0 10px 0; font-size: 12px; color: #334155;">
      <strong>MUMBAI:</strong> Exit No.3, Marol Naka, Metro Station, B Wing 4th Floor, Navkar Chambers, Marol, Andheri East, Mumbai, Maharashtra 400059.
    </p>

    <p style="margin: 0 0 10px 0; font-size: 12px; color: #b91c1c; font-weight: bold;">
      India Presence: <span style="color: #334155; font-weight: normal;">Ahmedabad | Bengaluru | Chennai | Gurugram | Kolkata | Mumbai | New Delhi | Rajkot | Surat | Vadodara | Vapi</span>
    </p>

    <p style="margin: 0 0 14px 0; font-size: 12px;">
      <strong>Visit us on</strong> <a href="http://www.jhsassociates.in" style="color: #0284c7; text-decoration: underline;">www.jhsassociates.in</a>
    </p>

    <p style="margin: 12px 0 0 0; font-size: 10px; color: #64748b; line-height: 1.4; border-top: 1px solid #f1f5f9; padding-top: 8px;">
      <strong>Disclaimer:</strong> This message may contain privileged and confidential information intended only for the use of the addressee named above. If you are not the intended recipient of this message, you are hereby notified that any use, dissemination, distribution, or reproduction of this message is prohibited. If you have received this message in error, please notify JHS & Associates LLP immediately. Any views expressed in this message are those of the individual sender and may not necessarily reflect the views of JHS & Associates LLP.
    </p>
  </div>
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
