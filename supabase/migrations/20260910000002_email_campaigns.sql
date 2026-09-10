-- Foundation of Hope - Email Campaigns & Delivery Tracking Schema Migration

-- 1. Email Campaigns Table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    from_email TEXT NOT NULL,
    reply_to TEXT,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'ready', 'sending', 'sent', 'partially_sent', 'failed'
    total_recipients INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    delivered_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    skipped_count INT DEFAULT 0,
    selected_recipients JSONB DEFAULT '[]'::jsonb, -- Array of employee IDs selected for drafts
    created_by TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- 2. Email Campaign Recipients Table (Tracking Resend Message IDs & Delivery Events)
CREATE TABLE IF NOT EXISTS public.email_campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    resend_message_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'bounced', 'failed', 'skipped'
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast analytics & status queries
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON public.email_campaigns(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_id ON public.email_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_resend_id ON public.email_campaign_recipients(resend_message_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON public.email_campaign_recipients(status);

-- Enable RLS Policies
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access on email_campaigns"
    ON public.email_campaigns FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on email_campaign_recipients"
    ON public.email_campaign_recipients FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
