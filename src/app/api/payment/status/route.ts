import { NextResponse } from 'next/server';
import { paymentService } from '@/services/paymentService';

export async function POST(req: Request) {
  try {
    const { transactionRef } = await req.json();

    if (!transactionRef) {
      return NextResponse.json({ success: false, error: 'Transaction reference required' }, { status: 400 });
    }

    const verification = await paymentService.verifyPayment(transactionRef);
    return NextResponse.json(verification);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
