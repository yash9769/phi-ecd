-- Foundation of Hope - Core PostgreSQL Database Migration Schema

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    employee_id TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Sessions Table
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id TEXT NOT NULL,
    consent_given BOOLEAN NOT NULL DEFAULT FALSE,
    ip_address TEXT,
    user_agent TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    screen_width INT,
    screen_height INT,
    viewport_width INT,
    viewport_height INT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    landing_page TEXT DEFAULT '/',
    exit_page TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    total_duration INT DEFAULT 0, -- Duration in seconds
    conversion_status TEXT NOT NULL DEFAULT 'visitor', -- 'visitor', 'form_started', 'form_completed', 'payment_started', 'contributed'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Telemetry Events Table (Metadata stored as JSONB)
CREATE TABLE IF NOT EXISTS public.telemetry_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    page TEXT NOT NULL DEFAULT '/',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    payment_method TEXT NOT NULL, -- 'upi', 'netbanking', 'card', 'payroll_deduction'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'successful', 'failed'
    transaction_ref TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON public.employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_created_at ON public.employees(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_visitor_id ON public.sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON public.sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_conversion_status ON public.sessions(conversion_status);

CREATE INDEX IF NOT EXISTS idx_telemetry_events_session_id ON public.telemetry_events(session_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_event_type ON public.telemetry_events(event_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_timestamp ON public.telemetry_events(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_payments_employee_id ON public.payments(employee_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);
