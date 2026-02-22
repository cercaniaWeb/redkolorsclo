-- SQL for Online Orders and Profiles extension

-- 1. Ensure profiles table has necessary fields (might already exist)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS favorite_branch text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points integer DEFAULT 0;

-- 2. Create online_orders table
CREATE TABLE IF NOT EXISTS public.online_orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    total numeric NOT NULL,
    payment_method text NOT NULL, -- 'transferencia', 'tarjeta', 'whatsapp'
    delivery_method text NOT NULL, -- 'envio', 'tienda'
    status text DEFAULT 'pending_verification' NOT NULL, -- 'pending_verification', 'payment_approved', 'payment_rejected', 'shipped', 'completed'
    receipt_url text, -- URL to the uploaded voucher image
    shipping_address jsonb, -- {calle, numero, colonia, cp, ciudad, estado, referencias}
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create online_order_items table
CREATE TABLE IF NOT EXISTS public.online_order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.online_orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id),
    quantity integer NOT NULL,
    price_at_time numeric NOT NULL
);

-- 4. Enable RLS
ALTER TABLE public.online_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.online_order_items ENABLE ROW LEVEL SECURITY;

-- 5. Policies for online_orders
CREATE POLICY "Users can view their own orders" ON public.online_orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON public.online_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.online_orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 6. Policies for online_order_items
CREATE POLICY "Users can view their own order items" ON public.online_order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.online_orders
            WHERE online_orders.id = online_order_items.order_id AND online_orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own order items" ON public.online_order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.online_orders
            WHERE online_orders.id = online_order_items.order_id AND online_orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all order items" ON public.online_order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
