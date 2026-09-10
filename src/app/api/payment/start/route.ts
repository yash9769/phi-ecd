import { NextResponse } from 'next/server';
import { paymentService } from '@/services/paymentService';

export async function POST(req: Request) {
  try {
    const { amount, paymentMethod, employeeId, sessionId } = await req.json();

    if (!amount || !paymentMethod || !employeeId) {
      return NextResponse.json({ success: false, error: 'Amount, method, and employee ID required' }, { status: 400 });
    }

    const initiation = await paymentService.initiatePayment(amount, paymentMethod, employeeId, sessionId);
    return NextResponse.json(initiation);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
