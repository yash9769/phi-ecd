import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (!type || !data || !data.email_id) {
      return NextResponse.json({ success: true, message: 'Ignored unhandled payload format' });
    }

    const resendMessageId = data.email_id;

    if (type === 'email.sent') {
      await db.updateRecipientDeliveryStatus(resendMessageId, 'sent');
    } else if (type === 'email.delivered') {
      await db.updateRecipientDeliveryStatus(resendMessageId, 'delivered');
    } else if (type === 'email.bounced') {
      await db.updateRecipientDeliveryStatus(resendMessageId, 'bounced', 'Email bounced by server');
    } else if (type === 'email.failed') {
      await db.updateRecipientDeliveryStatus(resendMessageId, 'failed', data.reason || 'Delivery failed');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
