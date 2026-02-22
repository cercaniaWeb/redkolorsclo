-- 1. Create table for system settings
CREATE TABLE IF NOT EXISTS public.store_settings (
    key text PRIMARY KEY,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Insert initial Live state
INSERT INTO public.store_settings (key, value)
VALUES ('is_live', 'false')
ON CONFLICT (key) DO NOTHING;

-- 3. Set up RLS to allow reading for everyone, and writing only for authenticated users (or admins)
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.store_settings
    FOR SELECT USING (true);

CREATE POLICY "Enable update for authenticated users only" ON public.store_settings
    FOR UPDATE USING (auth.role() = 'authenticated');
