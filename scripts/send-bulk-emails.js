const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load environment variables from .env.local if present
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
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Foundation of Hope <hr@jhsossociates.in>';
const GOOGLE_FORM_URL = 'https://forms.gle/SEcWiM9JFVBHfDbYA';

// Default Normal Email Subject & Body
const EMAIL_SUBJECT = "Foundation of Hope Initiative — Ahmed Huziefa Unwala";

const EMAIL_TEXT_TEMPLATE = `Dear {{full_name}},

Foundation of Hope is a special initiative established in memory of Ahmed Huziefa Unwala, beloved son of Huziefa Unwala.

We invite all JHS team members to participate and submit their details via the official Google Form link below:

${GOOGLE_FORM_URL}

Thank you for your support and participation.

Warm regards,
JHS & Associates LLP
`;

const EMAIL_HTML_TEMPLATE = `<div style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.6; color: #111827;">
  <p>Dear {{full_name}},</p>

  <p>Foundation of Hope is a special initiative established in memory of <strong>Ahmed Huziefa Unwala</strong>, beloved son of Huziefa Unwala.</p>

  <p>We invite all JHS team members to participate and submit their details via the official Google Form link below:</p>

  <p style="margin: 20px 0;">
    👉 <a href="${GOOGLE_FORM_URL}" style="color: #0284c7; font-weight: bold; text-decoration: underline;">${GOOGLE_FORM_URL}</a>
  </p>

  <p>Thank you for your support and participation.</p>

  <p style="margin-top: 28px;">
    Warm regards,<br/>
    <strong>JHS & Associates LLP</strong>
  </p>
</div>`;

async function main() {
  console.log('\n======================================================');
  console.log('🚀 FOUNDATION OF HOPE - BULK RESEND EMAIL DISPATCHER');
  console.log('======================================================\n');
  console.log(`Sender: ${RESEND_FROM_EMAIL}`);
  console.log(`Link: ${GOOGLE_FORM_URL}\n`);

  // 1. Verify API Key
  let apiKey = RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_resend_api_key')) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    apiKey = await new Promise(resolve => {
      rl.question('🔑 Enter your Resend API Key (re_...): ', answer => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  if (!apiKey || !apiKey.startsWith('re_')) {
    console.error('❌ Error: Invalid Resend API Key provided. API keys start with "re_".');
    process.exit(1);
  }

  console.log('✅ Resend API Key loaded.');

  // 2. Load Employee List (from employees.csv, employees.json, or fallback demo list)
  let employees = [];
  const csvPath = path.join(process.cwd(), 'employees.csv');
  const jsonPath = path.join(process.cwd(), 'employees.json');

  if (fs.existsSync(csvPath)) {
    console.log('📂 Reading employee data from "employees.csv"...');
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim() !== '');
    
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 2 && parts[1].includes('@')) {
        employees.push({
          full_name: parts[0] || 'Valued Colleague',
          email: parts[1],
          employee_id: parts[2] || `EMP-${1000 + i}`
        });
      }
    }
  } else if (fs.existsSync(jsonPath)) {
    console.log('📂 Reading employee data from "employees.json"...');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    employees = Array.isArray(data) ? data : data.employees || [];
  } else {
    console.log('⚠️  No "employees.csv" file found in workspace root.');
    console.log('📄 Please create an "employees.csv" file in this directory with headers: full_name,email,employee_id');
    process.exit(0);
  }

  console.log(`📊 Total Employees Loaded: ${employees.length}`);

  if (employees.length === 0) {
    console.error('❌ Error: No valid employee records found in CSV.');
    process.exit(1);
  }

  // 3. Batch Dispatching (Resend Batch API accepts up to 100 emails per payload)
  const BATCH_SIZE = 100;
  const totalBatches = Math.ceil(employees.length / BATCH_SIZE);
  console.log(`📦 Prepared ${totalBatches} batch(es) of max 100 emails per batch payload.\n`);

  let totalSent = 0;
  let totalFailed = 0;
  const deliveryLogs = [];

  for (let b = 0; b < totalBatches; b++) {
    const batchEmployees = employees.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
    console.log(`⏳ Dispatching Batch ${b + 1}/${totalBatches} (${batchEmployees.length} recipients)...`);

    const payload = batchEmployees.map(emp => {
      const personalizedHtml = EMAIL_HTML_TEMPLATE
        .replace(/{{full_name}}/g, emp.full_name || 'Valued Colleague')
        .replace(/{{email}}/g, emp.email);

      const personalizedText = EMAIL_TEXT_TEMPLATE
        .replace(/{{full_name}}/g, emp.full_name || 'Valued Colleague')
        .replace(/{{email}}/g, emp.email);

      return {
        from: RESEND_FROM_EMAIL,
        to: [emp.email],
        subject: EMAIL_SUBJECT,
        html: personalizedHtml,
        text: personalizedText
      };
    });

    try {
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();

      if (!res.ok) {
        console.error(`❌ Batch ${b + 1} Failed: HTTP ${res.status}`, resData);
        batchEmployees.forEach(emp => {
          totalFailed++;
          deliveryLogs.push({ email: emp.email, status: 'failed', error: resData.message || 'HTTP ' + res.status });
        });
      } else {
        const batchData = resData.data || resData;
        console.log(`✅ Batch ${b + 1} Dispatched Successfully!`);
        
        batchEmployees.forEach((emp, index) => {
          const resendMsgId = Array.isArray(batchData) ? batchData[index]?.id : undefined;
          totalSent++;
          deliveryLogs.push({
            email: emp.email,
            status: 'sent',
            resend_id: resendMsgId || 'sent_batch'
          });
        });
      }
    } catch (err) {
      console.error(`❌ Batch ${b + 1} Network Error: ${err.message}`);
      batchEmployees.forEach(emp => {
        totalFailed++;
        deliveryLogs.push({ email: emp.email, status: 'failed', error: err.message });
      });
    }

    if (b < totalBatches - 1) {
      await new Promise(res => setTimeout(res, 500));
    }
  }

  // 4. Final Summary & Report Export
  console.log('\n======================================================');
  console.log('🎉 BULK DISPATCH COMPLETE!');
  console.log('======================================================');
  console.log(`🟢 Total Successfully Sent: ${totalSent}`);
  console.log(`🔴 Total Failed/Bounced:   ${totalFailed}`);

  const reportPath = path.join(process.cwd(), `campaign-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    total_targeted: employees.length,
    total_sent: totalSent,
    total_failed: totalFailed,
    logs: deliveryLogs
  }, null, 2));

  console.log(`📄 Detailed Report Saved To: ${reportPath}\n`);
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
