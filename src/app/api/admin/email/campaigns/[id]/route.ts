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
  const campaignId = resolvedParams?.id || (params as any)?.id;

  if (!campaignId) {
    return NextResponse.json({ success: false, error: 'Campaign ID parameter required' }, { status: 400 });
  }

  const campaign = await db.getCampaignById(campaignId);
  if (!campaign) {
    return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
  }

  const recipients = await db.getRecipientsByCampaignId(campaignId);

  return NextResponse.json({
    success: true,
    campaign,
    recipients,
  });
}
