const http = require('http');

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

async function request(path, method = 'GET', body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { 'Content-Type': 'application/json' };
    if (cookie) headers['Cookie'] = cookie;

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        const resCookies = res.headers['set-cookie'];
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let json;
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = data;
          }
          resolve({ status: res.statusCode, data: json, cookies: resCookies });
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runEndToEndTest() {
  console.log('🚀 Starting Comprehensive Foundation of Hope End-to-End Verification Test...\n');

  // Test 1: Start User Session (Consent Accepted)
  console.log('1️⃣ Testing Session Initialization...');
  const sessionId = `e2e-sess-${Date.now()}`;
  const visitorId = `e2e-vis-${Date.now()}`;

  const sessRes = await request('/api/session/start', 'POST', {
    sessionId,
    visitorId,
    consentGiven: true,
    deviceType: 'Desktop',
    browser: 'Chrome',
    os: 'Windows 11',
    screenWidth: 1920,
    screenHeight: 1080,
    viewportWidth: 1920,
    viewportHeight: 950,
    referrer: 'https://jhsassociates.in/',
    landingPage: '/',
  });

  if (sessRes.status !== 200 || !sessRes.data.success) {
    throw new Error(`Session start failed: ${JSON.stringify(sessRes.data)}`);
  }
  console.log('  ✅ Session initialized successfully:', sessRes.data.session.id);

  // Test 2: Telemetry Events Tracking
  console.log('\n2️⃣ Testing Consent-Gated Interaction Telemetry...');
  const telemetryEvents = [
    { eventType: 'page_view', metadata: { title: 'Foundation of Hope - Ahmed Huziefa Unwala Memorial' } },
    { eventType: 'cta_click', metadata: { elementId: 'hero_contribute_ahmed_memory_btn' } },
    { eventType: 'form_opened', metadata: { step: 'employee_info' } },
    { eventType: 'form_field_focus', metadata: { fieldName: 'full_name' } },
    { eventType: 'form_field_completed', metadata: { fieldName: 'full_name' } }, // Value NOT sent!
    { eventType: 'form_field_focus', metadata: { fieldName: 'employee_id' } },
    { eventType: 'form_field_completed', metadata: { fieldName: 'employee_id' } }, // Value NOT sent!
    { eventType: 'form_submission', metadata: { step: 'employee_info' } },
  ];

  for (const evt of telemetryEvents) {
    const telemRes = await request('/api/telemetry', 'POST', {
      sessionId,
      eventType: evt.eventType,
      page: '/',
      timestamp: new Date().toISOString(),
      metadata: evt.metadata,
    });
    if (telemRes.status !== 200 || !telemRes.data.success) {
      throw new Error(`Telemetry event ${evt.eventType} failed: ${JSON.stringify(telemRes.data)}`);
    }
  }
  console.log(`  ✅ Tracked ${telemetryEvents.length} sanitized interaction telemetry events.`);

  // Test 3: Submit Employee Details
  console.log('\n3️⃣ Testing Employee Form Submission...');
  const empDetails = {
    fullName: 'Ananya Deshmukh',
    employeeId: `JHS-E2E-${Math.floor(1000 + Math.random() * 9000)}`,
    phone: '+91 98111 22334',
    email: 'ananya.d@jhsassociates.in',
    sessionId,
  };

  const empRes = await request('/api/employee', 'POST', empDetails);
  if (empRes.status !== 200 || !empRes.data.success) {
    throw new Error(`Employee submission failed: ${JSON.stringify(empRes.data)}`);
  }
  const createdEmp = empRes.data.employee;
  console.log(`  ✅ Employee registered: ${createdEmp.full_name} (${createdEmp.employee_id})`);

  // Test 4: Initiate & Complete Mock Payment
  console.log('\n4️⃣ Testing Payment Flow & Transaction Completion...');
  const payStartRes = await request('/api/payment/start', 'POST', {
    amount: 2500,
    paymentMethod: 'upi',
    employeeId: createdEmp.id,
    sessionId,
  });

  if (payStartRes.status !== 200 || !payStartRes.data.transactionRef) {
    throw new Error(`Payment initiation failed: ${JSON.stringify(payStartRes.data)}`);
  }
  const txnRef = payStartRes.data.transactionRef;
  console.log('  ✅ Payment transaction initiated:', txnRef);

  const payVerifyRes = await request('/api/payment/status', 'POST', { transactionRef: txnRef });
  if (payVerifyRes.status !== 200 || !payVerifyRes.data.success) {
    throw new Error(`Payment verification failed: ${JSON.stringify(payVerifyRes.data)}`);
  }
  console.log('  ✅ Payment transaction completed & verified.');

  // Test 5: Admin Login
  console.log('\n5️⃣ Testing Admin Portal Authentication (/donation-admin)...');
  const loginRes = await request('/api/admin/login', 'POST', {
    username: 'admin',
    password: 'Admin@JHS2026',
  });

  if (loginRes.status !== 200 || !loginRes.data.success || !loginRes.cookies) {
    throw new Error(`Admin login failed: ${JSON.stringify(loginRes.data)}`);
  }

  const adminCookie = loginRes.cookies[0].split(';')[0];
  console.log('  ✅ Admin logged in successfully with HTTP-Only cookie.');

  // Test 6: Verify Admin Employee Records
  console.log('\n6️⃣ Audit: Verifying Employee Record in Admin Portal...');
  const adminEmpRes = await request('/api/admin/employees', 'GET', null, adminCookie);
  if (adminEmpRes.status !== 200 || !adminEmpRes.data.success) {
    throw new Error(`Admin fetch employees failed: ${JSON.stringify(adminEmpRes.data)}`);
  }

  const foundEmp = adminEmpRes.data.employees.find((e) => e.employee_id === empDetails.employeeId);
  if (!foundEmp) {
    throw new Error(`Submitted employee ${empDetails.employeeId} NOT found in Admin Employee Records!`);
  }
  console.log('  ✅ VERIFIED! Employee record found in Admin Table:');
  console.log(`     - Name: ${foundEmp.full_name}`);
  console.log(`     - Employee ID: ${foundEmp.employee_id}`);
  console.log(`     - Phone: ${foundEmp.phone}`);
  console.log(`     - Email: ${foundEmp.email}`);
  console.log(`     - Status: ${foundEmp.payments?.[0]?.status}`);
  console.log(`     - Reference: ${foundEmp.payments?.[0]?.transaction_ref}`);

  // Test 7: Verify Admin Session Explorer & Event Timeline
  console.log('\n7️⃣ Audit: Verifying Session Explorer & Event Timeline in Admin...');
  const sessionDetailRes = await request(`/api/admin/sessions/${sessionId}`, 'GET', null, adminCookie);
  if (sessionDetailRes.status !== 200 || !sessionDetailRes.data.success) {
    throw new Error(`Admin fetch session detail failed: ${JSON.stringify(sessionDetailRes.data)}`);
  }

  const eventsList = sessionDetailRes.data.events;
  console.log(`  ✅ VERIFIED! Found session with ${eventsList.length} recorded events in timeline.`);
  console.log('     Sample Timeline Entries:');
  eventsList.slice(0, 4).forEach((ev) => {
    console.log(`     - [${ev.timestamp.substring(11, 19)}] ${ev.event_type.toUpperCase()} (Page: ${ev.page})`);
  });

  // Test 8: Verify Analytics Summary
  console.log('\n8️⃣ Audit: Verifying Telemetry Analytics Summary...');
  const analyticsRes = await request('/api/admin/analytics', 'GET', null, adminCookie);
  if (analyticsRes.status !== 200 || !analyticsRes.data.success) {
    throw new Error(`Admin fetch analytics failed: ${JSON.stringify(analyticsRes.data)}`);
  }

  const summary = analyticsRes.data.summary;
  console.log('  ✅ VERIFIED! Telemetry Analytics Summary:');
  console.log(`     - Total Contributions: ₹${summary.totalContributions}`);
  console.log(`     - Total Submissions: ${summary.totalSubmissions}`);
  console.log(`     - Form Completion Rate: ${summary.formCompletionRate}%`);
  console.log(`     - Total Sessions: ${summary.totalSessions}`);

  console.log('\n🎉 ALL END-TO-END VERIFICATION TESTS PASSED SUCCESSFULLY! EVERYTHING WORKS 100%!');
}

runEndToEndTest().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err.message);
  process.exit(1);
});
