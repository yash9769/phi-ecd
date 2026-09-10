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
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Foundation of Hope <hr@jhsossociates.in>';

const recipients = [
  { full_name: 'Yashodhan Rajapkar', email: 'yashodhan.rajapkar@envistacyberdefence.com', employee_id: 'ECD-YR' },
  { full_name: 'Amit Kumar More', email: 'amitkumar.more@jhsconsulting.in', employee_id: 'JHS-AMP' }
];

const EMAIL_SUBJECT = "Foundation of Hope Initiative — Ahmed Huziefa Unwala";
const EMAIL_TEXT_TEMPLATE = `Dear {{full_name}},

Foundation of Hope is a special initiative established in memory of Ahmed Huziefa Unwala, beloved son of Huziefa Unwala.

We invite all JHS team members to participate and submit their details via the official Google Form link below:

https://forms.gle/SEcWiM9JFVBHfDbYA

Thank you for your support and participation.

Warm regards,
JHS & Associates LLP
`;

const EMAIL_HTML_TEMPLATE = `<div style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #111827;">
  <p>Dear {{full_name}},</p>

  <p>Foundation of Hope is a special initiative established in memory of <strong>Ahmed Huziefa Unwala</strong>, beloved son of Huziefa Unwala.</p>

  <p>We invite all JHS team members to participate and submit their details via the official Google Form link below:</p>

  <p style="margin: 20px 0;">
    👉 <a href="https://forms.gle/SEcWiM9JFVBHfDbYA" style="color: #0284c7; font-weight: bold; text-decoration: underline;">https://forms.gle/SEcWiM9JFVBHfDbYA</a>
  </p>

  <p>Thank you for your support and participation.</p>

  <p style="margin-top: 28px;">
    Warm regards,<br/>
    <strong>JHS & Associates LLP</strong>
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
  console.log('🚀 Dispatching Normal Text Email with Google Form Link...\n');
  console.log(`Sender: ${FROM_EMAIL}`);
  console.log(`Google Form Link: https://forms.gle/SEcWiM9JFVBHfDbYA\n`);

  for (const r of recipients) {
    console.log(`⏳ Sending normal email to ${r.full_name} (${r.email})...`);
    const result = await sendEmail(r);

    if (result.status === 200) {
      console.log(`✅ SUCCESS! Sent to ${r.email}. Resend Message ID: ${result.data.id}`);
    } else {
      console.log(`❌ Failed sending to ${r.email}: HTTP ${result.status}`, result.data);
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
});
