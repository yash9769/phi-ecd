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
  const campaign = await db.getCampaignById(resolvedParams.id);
  if (!campaign) {
    return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
  }

  const recipients = await db.getRecipientsByCampaignId(resolvedParams.id);

  return NextResponse.json({
    success: true,
    campaign,
    recipients,
  });
}
