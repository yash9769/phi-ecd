import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { fullName, employeeId, phone, email, sessionId } = await req.json();

    if (!fullName || !employeeId || !phone || !email) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const employee = await db.createEmployee({
      full_name: fullName,
      employee_id: employeeId,
      phone,
      email,
    });

    if (sessionId) {
      await db.updateSession(sessionId, { conversion_status: 'form_completed' });
    }

    return NextResponse.json({ success: true, employee });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
