const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match && !process.env[match[1]]) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[match[1]] = value;
    }
  });
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'hr@jhsossociates.in';

// Only Yashodhan Rajapkar (Amit Kumar removed as per request)
const recipients = [
  { full_name: 'Yashodhan Rajapkar', email: 'yashodhan.rajapkar@envistacyberdefence.com', employee_id: 'ECD-YR' }
];

const EMAIL_SUBJECT = "An Initiative in Memory of Ahmed Huziefa Unwala";

const EMAIL_TEXT_TEMPLATE = `Dear {{full_name}},

With deep sadness, we share the passing of Ahmed Huziefa Unwala, beloved son of Mr. Huziefa Unwala.

In his memory, JHS Associates is introducing Foundation of Hope, an initiative through which our JHS family can come together and honour his memory.

We invite you to take a moment to learn about the initiative and participate if you wish. Your support and participation would be deeply appreciated.

https://forms.gle/SEcWiM9JFVBHfDbYA

Thank you for your understanding, kindness, and support.

Regards,
Human Resources
JHS Associates
`;

const EMAIL_HTML_TEMPLATE = `<div style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.7; color: #111827; max-width: 600px;">
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

async function sendEmail(recipient) {
  const personalizedHtml = EMAIL_HTML_TEMPLATE
    .replace(/{{full_name}}/g, recipient.full_name)
    .replace(/{{email}}/g, recipient.email);

  const personalizedText = EMAIL_TEXT_TEMPLATE
    .replace(/{{full_name}}/g, recipient.full_name)
    .replace(/{{email}}/g, recipient.email);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [recipient.email],
      subject: EMAIL_SUBJECT,
      html: personalizedHtml,
      text: personalizedText
    })
  });

  const data = await response.json();
  return { status: response.status, data };
}

async function main() {
  console.log('🚀 Ready to dispatch test email...\n');
  console.log(`Sender: ${FROM_EMAIL}`);
  console.log(`Subject: ${EMAIL_SUBJECT}`);
  console.log(`Recipients: ${recipients.map(r => r.email).join(', ')}\n`);

  for (const r of recipients) {
    console.log(`⏳ Sending email to ${r.full_name} (${r.email})...`);
    const result = await sendEmail(r);

    if (result.status === 200) {
      console.log(`✅ SUCCESS! Sent to ${r.email}. Resend Message ID: ${result.data.id}`);
    } else {
      console.log(`❌ Failed sending to ${r.email}: HTTP ${result.status}`, result.data);
    }
  }
}

// Only execute when invoked explicitly
main().catch(err => {
  console.error('Fatal error:', err);
});
