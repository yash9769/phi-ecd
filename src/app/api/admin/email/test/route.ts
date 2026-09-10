import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/adminAuth';
import { sendTestEmail } from '@/lib/resend';

export async function POST(req: Request) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { to, subject, bodyHtml, fromEmail, replyTo } = await req.json();

    if (!to || !subject || !bodyHtml) {
      return NextResponse.json({ success: false, error: 'Test recipient email, subject, and body are required' }, { status: 400 });
    }

    const result = await sendTestEmail({
      to,
      subject,
      bodyHtml,
      fromEmail,
      replyTo,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
