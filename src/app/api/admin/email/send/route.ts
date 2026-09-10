import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { sendBatchCampaign } from '@/lib/resend';

export async function POST(req: Request) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const campaignId = body.campaignId || body.campaign_id;
    if (!campaignId) {
      return NextResponse.json({ success: false, error: 'Campaign ID required' }, { status: 400 });
    }

    // 1. Fetch Campaign & Idempotency Check
    const campaign = await db.getCampaignById(campaignId);
    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status === 'sending') {
      return NextResponse.json({ success: false, error: 'Campaign is already currently sending. Duplicate send blocked.' }, { status: 409 });
    }

    if (['sent', 'completed'].includes(campaign.status)) {
      return NextResponse.json({ success: false, error: 'Campaign has already been sent. Sent campaigns are immutable.' }, { status: 400 });
    }

    const selectedEmployeeIds = campaign.selected_recipients || [];
    if (selectedEmployeeIds.length === 0) {
      return NextResponse.json({ success: false, error: 'No recipients selected for this campaign' }, { status: 400 });
    }

    // 2. Lock Campaign to 'sending' state
    await db.updateCampaign(campaignId, {
      status: 'sending',
      started_at: new Date().toISOString(),
      total_recipients: selectedEmployeeIds.length,
    });

    // 3. Fetch Selected Employee Records
    const allEmployees = await db.getAllEmployees();
    const targetEmployees = allEmployees.filter((e) => selectedEmployeeIds.includes(e.id));

    const recipientPayload = targetEmployees.map((emp) => ({
      id: emp.id,
      email: emp.email,
      employee: emp,
    }));

    // 4. Batch Send via Resend
    const batchResults = await sendBatchCampaign({
      fromEmail: campaign.from_email,
      replyTo: campaign.reply_to,
      subject: campaign.subject,
      bodyHtml: campaign.body_html,
      recipients: recipientPayload,
    });

    // 5. Store Recipient Delivery Logs
    let sentCount = 0;
    let failedCount = 0;

    const recipientLogs = batchResults.map((res) => {
      const isSent = res.status === 'sent';
      if (isSent) sentCount++;
      else failedCount++;

      return {
        campaign_id: campaignId,
        employee_id: res.recipientId,
        email: targetEmployees.find((e) => e.id === res.recipientId)?.email || '',
        resend_message_id: res.resendMessageId,
        status: isSent ? ('sent' as const) : ('failed' as const),
        error_message: 'error' in res ? res.error : undefined,
        sent_at: new Date().toISOString(),
      };
    });

    await db.createBatchCampaignRecipients(recipientLogs);

    // 6. Update Final Campaign Status & Counters
    const finalStatus = failedCount === 0 ? 'sent' : sentCount > 0 ? 'partially_sent' : 'failed';
    const updatedCampaign = await db.updateCampaign(campaignId, {
      status: finalStatus,
      sent_count: sentCount,
      failed_count: failedCount,
      completed_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
      sentCount,
      failedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
