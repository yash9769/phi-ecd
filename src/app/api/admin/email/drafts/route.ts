import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/adminAuth';
import { db } from '@/lib/db';

export async function GET() {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const drafts = await db.getDrafts();
  return NextResponse.json({ success: true, drafts });
}

export async function POST(req: Request) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const draft = await db.createCampaign({
      name: body.name || 'Untitled Draft',
      subject: body.subject || '',
      body_html: body.body_html || body.bodyHtml || '',
      body_text: body.body_text || body.bodyText || '',
      from_email: body.from_email || body.fromEmail || 'Foundation of Hope <foundationofhope@jhsassociates.in>',
      reply_to: body.reply_to || body.replyTo || '',
      selected_recipients: body.selected_recipients || body.selectedRecipients || [],
      status: 'draft',
    });

    return NextResponse.json({ success: true, draft });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
