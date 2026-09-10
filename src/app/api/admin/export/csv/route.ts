import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { stringify } from 'csv-stringify/sync';

export async function GET(req: Request) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'employees';

  if (type === 'employees') {
    const employees = await db.getAllEmployees();
    const rows = employees.map((e) => {
      const pay = e.payments?.[0];
      return {
        'Full Name': e.full_name,
        'Employee ID': e.employee_id,
        'Phone': e.phone,
        'Email': e.email,
        'Submission Timestamp': e.created_at,
        'Payment Status': pay ? pay.status : 'N/A',
        'Amount Contributed (INR)': pay ? pay.amount : 0,
        'Payment Method': pay ? pay.payment_method : 'N/A',
        'Transaction Ref': pay ? pay.transaction_ref : 'N/A',
      };
    });

    const csvOutput = stringify(rows, { header: true });
    return new NextResponse(csvOutput, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="foundation_of_hope_employees.csv"',
      },
    });
  } else {
    const events = await db.getAllTelemetryEvents();
    const rows = events.map((ev) => ({
      'Event ID': ev.id,
      'Session ID': ev.session_id,
      'Event Type': ev.event_type,
      'Page': ev.page,
      'Timestamp': ev.timestamp,
      'Metadata': JSON.stringify(ev.metadata || {}),
    }));

    const csvOutput = stringify(rows, { header: true });
    return new NextResponse(csvOutput, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="foundation_of_hope_telemetry.csv"',
      },
    });
  }
}
