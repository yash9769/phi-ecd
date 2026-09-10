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
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Foundation of Hope <foundationofhope@jhsassociates.in>';
const BASE_URL = process.env.NEXT_PUBLIC_FOUNDATION_OF_HOPE_URL || 'https://phi-ecd.vercel.app';

// Default Email Subject & HTML Template
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
        Dear <strong>{{full_name}}</strong> (Employee ID: {{employee_id}}),
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
        <a href="{{foundation_url}}" style="background-color: #0284c7; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block;">
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

async function main() {
  console.log('\n======================================================');
  console.log('🚀 FOUNDATION OF HOPE - BULK RESEND EMAIL DISPATCHER');
  console.log('======================================================\n');

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

  console.log('✅ Resend API Key detected.');

  // 2. Load Employee List (from employees.csv, employees.json, or fallback demo list)
  let employees = [];
  const csvPath = path.join(process.cwd(), 'employees.csv');
  const jsonPath = path.join(process.cwd(), 'employees.json');

  if (fs.existsSync(csvPath)) {
    console.log('📂 Reading employee data from "employees.csv"...');
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim() !== '');
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length >= 2) {
        employees.push({
          full_name: parts[0] || 'Team Member',
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
    console.log('⚠️  No "employees.csv" or "employees.json" file found in workspace root.');
    console.log('📄 To load your 400 employees, create an "employees.csv" file in this directory with headers: full_name,email,employee_id');
    console.log('👉 Creating a sample "employees.csv" template for you now...');

    const sampleCsvContent = `full_name,email,employee_id
John Doe,john.doe@jhsassociates.in,JHS-101
Jane Smith,jane.smith@jhsassociates.in,JHS-102
Huziefa Unwala,huziefa@jhsassociates.in,JHS-100`;

    fs.writeFileSync(csvPath, sampleCsvContent, 'utf8');
    console.log('✅ Sample "employees.csv" created at: ' + csvPath);
    console.log('\n💡 Please add your 400 employee emails to "employees.csv" and run this script again!');
    process.exit(0);
  }

  console.log(`📊 Total Employees Loaded: ${employees.length}`);

  if (employees.length === 0) {
    console.error('❌ Error: No valid employee records found.');
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
      // Personalize HTML template
      const personalizedBody = EMAIL_HTML_TEMPLATE
        .replace(/{{full_name}}/g, emp.full_name || 'Valued Colleague')
        .replace(/{{employee_id}}/g, emp.employee_id || 'N/A')
        .replace(/{{email}}/g, emp.email)
        .replace(/{{foundation_url}}/g, BASE_URL);

      return {
        from: RESEND_FROM_EMAIL,
        to: [emp.email],
        subject: EMAIL_SUBJECT,
        html: personalizedBody
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

    // Rate limiting delay between batches (500ms)
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
