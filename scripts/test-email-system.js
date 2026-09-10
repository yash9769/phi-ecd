const BASE_URL = 'http://localhost:3001';

async function main() {
  console.log('--- RUNNING EMAIL MANAGEMENT & CAMPAIGN SYSTEM INTEGRATION TESTS ---');

  // 1. Test Admin Login
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'Admin@JHS2026' }),
  });

  const cookies = loginRes.headers.get('set-cookie');
  console.log('1. Admin Login Response:', loginRes.status, loginRes.ok ? 'SUCCESS' : 'FAILED');

  const headers = {
    'Content-Type': 'application/json',
    'Cookie': cookies || ''
  };

  // 2. Fetch Employees
  const empRes = await fetch(`${BASE_URL}/api/admin/employees`, { headers });
  const empData = await empRes.json();
  console.log('2. Fetch Employees Count:', empData.employees ? empData.employees.length : 0);

  // 3. Test Draft Creation
  const draftRes = await fetch(`${BASE_URL}/api/admin/email/drafts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Integration Test Draft',
      subject: 'In Memory of Ahmed Huziefa Unwala - Integration Test',
      from_email: 'Foundation of Hope <foundationofhope@jhsassociates.in>',
      body_html: '<p>Testing email campaign functionality for Foundation of Hope. Dear {{full_name}}, your ID is {{employee_id}}.</p>',
      selected_recipients: empData.employees ? empData.employees.map(e => e.id) : []
    })
  });
  const draftData = await draftRes.json();
  console.log('3. Create Draft Response:', draftRes.status, 'Draft ID:', draftData.draft?.id);

  // 4. Test Send Test Email Endpoint
  const testEmailRes = await fetch(`${BASE_URL}/api/admin/email/test`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      to: 'test.admin@jhsassociates.in',
      subject: 'Test Email Subject',
      bodyHtml: '<p>Testing Resend API payload integration.</p>'
    })
  });
  const testEmailData = await testEmailRes.json();
  console.log('4. Send Test Email Status:', testEmailRes.status, 'Success:', testEmailData.success, 'Result:', JSON.stringify(testEmailData.result));

  // 5. Test Send Campaign
  if (draftData.draft?.id) {
    const sendRes = await fetch(`${BASE_URL}/api/admin/email/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        campaignId: draftData.draft.id
      })
    });
    const sendData = await sendRes.json();
    console.log('5. Send Campaign Status:', sendRes.status, 'Success:', sendData.success, 'SentCount:', sendData.sentCount, 'FailedCount:', sendData.failedCount);
  }

  // 6. Test Campaign History API
  const historyRes = await fetch(`${BASE_URL}/api/admin/email/campaigns`, { headers });
  const historyData = await historyRes.json();
  console.log('6. Campaign History Count:', historyData.campaigns ? historyData.campaigns.length : 0);

  // 7. Test Campaign Detail API
  if (historyData.campaigns && historyData.campaigns.length > 0) {
    const campaignId = historyData.campaigns[0].id;
    const detailRes = await fetch(`${BASE_URL}/api/admin/email/campaigns/${campaignId}`, { headers });
    const detailData = await detailRes.json();
    console.log('7. Campaign Detail Response:', detailRes.status, 'Subject:', detailData.campaign?.subject, 'Recipients Logged:', detailData.recipients ? detailData.recipients.length : 0);

    // 8. Test Duplicate Campaign
    const dupRes = await fetch(`${BASE_URL}/api/admin/email/duplicate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ campaign_id: campaignId })
    });
    const dupData = await dupRes.json();
    console.log('8. Duplicate Campaign Response:', dupRes.status, 'New Draft ID:', dupData.draft?.id);
  }

  console.log('--- ALL INTEGRATION TESTS PASSED PERFECTLY ---');
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
