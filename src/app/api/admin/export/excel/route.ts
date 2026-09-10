import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET(req: Request) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'employees';

  const wb = XLSX.utils.book_new();

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

    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Employee Records');
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

    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Telemetry Events');
  }

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

  return new NextResponse(excelBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="foundation_of_hope_${type}.xlsx"`,
    },
  });
}
