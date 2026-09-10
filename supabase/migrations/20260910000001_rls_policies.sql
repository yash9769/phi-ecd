-- Foundation of Hope - Supabase Row Level Security (RLS) Policies

-- Enable RLS on all core tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 1. admin_users RLS Policies
CREATE POLICY "Allow service role full access on admin_users"
    ON public.admin_users
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 2. employees RLS Policies
CREATE POLICY "Deny public direct read on employees"
    ON public.employees
    FOR SELECT
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow service role insert on employees"
    ON public.employees
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- 3. sessions RLS Policies
CREATE POLICY "Deny public direct select on sessions"
    ON public.sessions
    FOR SELECT
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on sessions"
    ON public.sessions
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 4. telemetry_events RLS Policies
CREATE POLICY "Deny public direct select on telemetry_events"
    ON public.telemetry_events
    FOR SELECT
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on telemetry_events"
    ON public.telemetry_events
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- 5. payments RLS Policies
CREATE POLICY "Deny public direct select on payments"
    ON public.payments
    FOR SELECT
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on payments"
    ON public.payments
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
