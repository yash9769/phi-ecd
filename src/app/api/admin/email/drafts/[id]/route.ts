import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/adminAuth';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const draft = await db.getCampaignById(resolvedParams.id);
  if (!draft) {
    return NextResponse.json({ success: false, error: 'Draft not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, draft });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const body = await req.json();

  const existing = await db.getCampaignById(resolvedParams.id);
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Draft not found' }, { status: 404 });
  }

  if (existing.status !== 'draft') {
    return NextResponse.json({ success: false, error: 'Cannot edit sent or processing campaign. Duplicate to create new draft.' }, { status: 400 });
  }

  const updated = await db.updateCampaign(resolvedParams.id, {
    name: body.name ?? existing.name,
    subject: body.subject ?? existing.subject,
    body_html: body.body_html ?? body.bodyHtml ?? existing.body_html,
    body_text: body.body_text ?? body.bodyText ?? existing.body_text,
    from_email: body.from_email ?? body.fromEmail ?? existing.from_email,
    reply_to: body.reply_to ?? body.replyTo ?? existing.reply_to,
    selected_recipients: body.selected_recipients ?? body.selectedRecipients ?? existing.selected_recipients,
  });

  return NextResponse.json({ success: true, draft: updated });
}
