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

const EMAIL_SUBJECT = "In Memory of Ahmed Huziefa Unwala — Foundation of Hope Initiative";
const EMAIL_HTML_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${EMAIL_SUBJECT}</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    
    <!-- Top Branding Banner -->
    <div style="background-color: #0f172a; padding: 28px 24px; text-align: center; border-bottom: 3px solid #0284c7;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; tracking: 0.5px;">
        FOUNDATION OF HOPE
      </h1>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px; text-transform: uppercase; tracking: 1px;">
        JHS & Associates LLP Employee Initiative
      </p>
    </div>

    <!-- Main Message Content -->
    <div style="padding: 32px 28px;">
      <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">
        In Loving Memory of Ahmed Huziefa Unwala
      </h2>

      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        Dear <strong>{{full_name}}</strong>,
      </p>

      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        Foundation of Hope is a special initiative established in memory of <strong>Ahmed Huziefa Unwala</strong>, beloved son of Huziefa Unwala.
      </p>

      <div style="background-color: #f1f5f9; border-left: 4px solid #0284c7; padding: 16px; border-radius: 4px; margin: 24px 0;">
        <p style="font-size: 14px; line-height: 1.5; color: #1e293b; margin: 0; font-style: italic;">
          "Honoring Ahmed's legacy by supporting causes that bring light, dignity, and hope to lives in need."
        </p>
      </div>

      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        We invite all JHS team members to participate and view the memorial initiative details below.
      </p>

      <!-- Action CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://awareness-jhs.vercel.app" style="background-color: #0284c7; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block;">
          View Foundation of Hope Initiative
        </a>
      </div>

      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />

      <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
        With gratitude,<br/>
        <strong>JHS & Associates LLP</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">
        Sent to {{email}} • Confidential JHS Internal Employee Communication
      </p>
    </div>
  </div>
</body>
</html>
`;

async function sendEmail(recipient) {
  const personalizedHtml = EMAIL_HTML_TEMPLATE
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
      html: personalizedHtml
    })
  });

  const data = await response.json();
  return { status: response.status, data };
}

async function main() {
  console.log('🚀 Dispatching Test Emails via Resend API...\n');
  console.log(`Sender: ${FROM_EMAIL}`);

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

main().catch(err => {
  console.error('Fatal error:', err);
});
