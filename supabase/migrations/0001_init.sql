-- Georgia Tours Super App - Initial Migration
-- Tüm tablolar, RLS politikaları, trigger'lar ve enum'lar

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_type_enum AS ENUM ('customer', 'business_owner', 'admin');
CREATE TYPE business_type_enum AS ENUM ('hotel', 'restaurant', 'casino', 'events', 'other');
CREATE TYPE business_status_enum AS ENUM ('pending_verification', 'verified', 'suspended', 'banned', 'rejected');
CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE order_status_enum AS ENUM ('pending', 'accepted', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled', 'rejected');
CREATE TYPE dispute_status_enum AS ENUM ('open', 'resolved', 'escalated');
CREATE TYPE payout_status_enum AS ENUM ('pending', 'approved', 'processing', 'completed', 'failed');
CREATE TYPE payout_method_enum AS ENUM ('bank_transfer', 'stripe');
CREATE TYPE payment_method_type_enum AS ENUM ('iban_transfer', 'credit_card', 'crypto', 'wallet');

-- ============================================
-- EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLES
-- ============================================

-- 1. Profiles (Kullanıcı Profilleri)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    preferred_language TEXT DEFAULT 'en',
    profile_picture_url TEXT,
    bio TEXT,
    rating NUMERIC(3,2) DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    user_type user_type_enum DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Businesses (İşletmeler)
CREATE TABLE public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_type business_type_enum NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    registration_number TEXT,
    tax_id TEXT,
    address TEXT,
    city TEXT,
    website TEXT,
    description TEXT,
    logo_url TEXT,
    status business_status_enum DEFAULT 'pending_verification',
    rating NUMERIC(3,2) DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    total_revenue NUMERIC(10,2) DEFAULT 0,
    verification_documents JSONB DEFAULT '[]'::jsonb,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Hotels (Oteller)
CREATE TABLE public.hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    city TEXT,
    address TEXT,
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    images TEXT[] DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}',
    rating NUMERIC(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    check_in_time TIME DEFAULT '15:00:00',
    check_out_time TIME DEFAULT '11:00:00',
    cancellation_policy TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Hotel Rooms (Otel Odaları)
CREATE TABLE public.hotel_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    room_type TEXT NOT NULL,
    description TEXT,
    price_per_night NUMERIC(10,2) NOT NULL,
    capacity INTEGER DEFAULT 2,
    count INTEGER DEFAULT 1,
    amenities TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Hotel Bookings (Otel Rezervasyonları)
CREATE TABLE public.hotel_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    room_type TEXT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guests INTEGER DEFAULT 1,
    total_price NUMERIC(10,2) NOT NULL,
    status booking_status_enum DEFAULT 'pending',
    payment_status payment_status_enum DEFAULT 'pending',
    payment_id TEXT,
    confirmation_number TEXT,
    special_requests TEXT,
    hotel_response TEXT,
    cancellation_reason TEXT,
    cancellation_initiated_by TEXT,
    cancelled_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    rating INTEGER,
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Restaurants (Restoranlar)
CREATE TABLE public.restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cuisine_type TEXT,
    city TEXT,
    address TEXT,
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    images TEXT[] DEFAULT '{}',
    phone TEXT,
    website TEXT,
    opening_hours JSONB DEFAULT '{}'::jsonb,
    delivery_available BOOLEAN DEFAULT true,
    delivery_fee NUMERIC(10,2) DEFAULT 0,
    min_order_amount NUMERIC(10,2) DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Menu Items (Menu Ürünleri)
CREATE TABLE public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price NUMERIC(10,2) NOT NULL,
    image_url TEXT,
    vegetarian BOOLEAN DEFAULT false,
    spicy_level INTEGER DEFAULT 0,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Restaurant Orders (Restoran Siparişleri)
CREATE TABLE public.restaurant_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    delivery_type TEXT NOT NULL CHECK (delivery_type IN ('delivery', 'pickup')),
    delivery_address TEXT,
    total_price NUMERIC(10,2) NOT NULL,
    status order_status_enum DEFAULT 'pending',
    payment_status payment_status_enum DEFAULT 'pending',
    payment_id TEXT,
    special_instructions TEXT,
    business_notes TEXT,
    rejection_reason TEXT,
    rejected_at TIMESTAMPTZ,
    preparation_started_at TIMESTAMPTZ,
    estimated_ready_at TIMESTAMPTZ,
    estimated_delivery_time TIMESTAMPTZ,
    actual_delivery_time TIMESTAMPTZ,
    rating INTEGER,
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Messages (Mesajlar)
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    related_booking_id UUID REFERENCES public.hotel_bookings(id) ON DELETE SET NULL,
    related_order_id UUID REFERENCES public.restaurant_orders(id) ON DELETE SET NULL,
    read BOOLEAN DEFAULT false,
    attachment_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Disputes (Uyuşmazlıklar)
CREATE TABLE public.disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.hotel_bookings(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.restaurant_orders(id) ON DELETE SET NULL,
    issue_description TEXT NOT NULL,
    customer_claim_amount NUMERIC(10,2),
    customer_evidence TEXT[] DEFAULT '{}',
    business_response TEXT,
    business_evidence TEXT[] DEFAULT '{}',
    status dispute_status_enum DEFAULT 'open',
    resolution TEXT,
    refund_amount NUMERIC(10,2),
    compensation NUMERIC(10,2),
    admin_notes TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Payments (Ödemeler)
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status payment_status_enum DEFAULT 'pending',
    payment_method TEXT,
    stripe_payment_id TEXT,
    stripe_charge_id TEXT,
    related_booking_id UUID REFERENCES public.hotel_bookings(id) ON DELETE SET NULL,
    related_order_id UUID REFERENCES public.restaurant_orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Payouts (Çekme İşlemleri)
CREATE TABLE public.payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    status payout_status_enum DEFAULT 'pending',
    method payout_method_enum DEFAULT 'bank_transfer',
    bank_account_id UUID,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    failure_reason TEXT,
    notes TEXT
);

-- 13. Business Bank Accounts (İşletme Banka Hesapları)
CREATE TABLE public.business_bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    account_holder_name TEXT NOT NULL,
    iban TEXT NOT NULL,
    bank_code TEXT,
    country TEXT,
    verified BOOLEAN DEFAULT false,
    primary_account BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Admin Logs (Admin Logları)
CREATE TABLE public.admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET
);

-- 15. Payment Methods (Ödeme Yöntemleri)
CREATE TABLE public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type payment_method_type_enum NOT NULL,
    active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}'::jsonb,
    api_endpoint TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(type)
);

-- 16. QR Downloads (QR İndirme Sistemi)
CREATE TABLE public.qr_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL CHECK (platform IN ('android', 'ios')),
    qr_code_url TEXT,
    download_url TEXT NOT NULL,
    scan_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Reviews (Yorumlar)
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.hotel_bookings(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.restaurant_orders(id) ON DELETE SET NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    photos TEXT[] DEFAULT '{}',
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX idx_businesses_owner_id ON public.businesses(owner_id);
CREATE INDEX idx_businesses_status ON public.businesses(status);
CREATE INDEX idx_hotels_business_id ON public.hotels(business_id);
CREATE INDEX idx_hotel_rooms_hotel_id ON public.hotel_rooms(hotel_id);
CREATE INDEX idx_hotel_bookings_user_id ON public.hotel_bookings(user_id);
CREATE INDEX idx_hotel_bookings_hotel_id ON public.hotel_bookings(hotel_id);
CREATE INDEX idx_hotel_bookings_status ON public.hotel_bookings(status);
CREATE INDEX idx_restaurants_business_id ON public.restaurants(business_id);
CREATE INDEX idx_menu_items_restaurant_id ON public.menu_items(restaurant_id);
CREATE INDEX idx_restaurant_orders_user_id ON public.restaurant_orders(user_id);
CREATE INDEX idx_restaurant_orders_restaurant_id ON public.restaurant_orders(restaurant_id);
CREATE INDEX idx_restaurant_orders_status ON public.restaurant_orders(status);
CREATE INDEX idx_messages_from_user_id ON public.messages(from_user_id);
CREATE INDEX idx_messages_to_user_id ON public.messages(to_user_id);
CREATE INDEX idx_disputes_customer_id ON public.disputes(customer_id);
CREATE INDEX idx_disputes_business_id ON public.disputes(business_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payouts_business_id ON public.payouts(business_id);
CREATE INDEX idx_payouts_status ON public.payouts(status);
CREATE INDEX idx_payment_methods_type ON public.payment_methods(type);
CREATE INDEX idx_payment_methods_active ON public.payment_methods(active);

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON public.hotels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotel_rooms_updated_at BEFORE UPDATE ON public.hotel_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotel_bookings_updated_at BEFORE UPDATE ON public.hotel_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_orders_updated_at BEFORE UPDATE ON public.restaurant_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_bank_accounts_updated_at BEFORE UPDATE ON public.business_bank_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_downloads_updated_at BEFORE UPDATE ON public.qr_downloads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Profile creation trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Businesses Policies
CREATE POLICY "businesses_select_own" ON public.businesses
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "businesses_select_verified" ON public.businesses
    FOR SELECT USING (status = 'verified');

CREATE POLICY "businesses_insert_own" ON public.businesses
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "businesses_update_own" ON public.businesses
    FOR UPDATE USING (auth.uid() = owner_id);

-- Hotels Policies
CREATE POLICY "hotels_select_all" ON public.hotels
    FOR SELECT USING (true);

CREATE POLICY "hotels_select_business" ON public.hotels
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "hotels_insert_business" ON public.hotels
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT id FROM public.businesses WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "hotels_update_business" ON public.hotels
    FOR UPDATE USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE owner_id = auth.uid()
        )
    );

-- Hotel Rooms Policies
CREATE POLICY "hotel_rooms_select_all" ON public.hotel_rooms
    FOR SELECT USING (true);

CREATE POLICY "hotel_rooms_manage_business" ON public.hotel_rooms
    FOR ALL USING (
        hotel_id IN (
            SELECT h.id FROM public.hotels h
            JOIN public.businesses b ON h.business_id = b.id
            WHERE b.owner_id = auth.uid()
        )
    );

-- Hotel Bookings Policies
CREATE POLICY "bookings_select_own" ON public.hotel_bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bookings_select_business" ON public.hotel_bookings
    FOR SELECT USING (
        hotel_id IN (
            SELECT h.id FROM public.hotels h
            JOIN public.businesses b ON h.business_id = b.id
            WHERE b.owner_id = auth.uid()
        )
    );

CREATE POLICY "bookings_insert_own" ON public.hotel_bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookings_update_own" ON public.hotel_bookings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "bookings_update_business" ON public.hotel_bookings
    FOR UPDATE USING (
        hotel_id IN (
            SELECT h.id FROM public.hotels h
            JOIN public.businesses b ON h.business_id = b.id
            WHERE b.owner_id = auth.uid()
        )
    );

-- Restaurants Policies
CREATE POLICY "restaurants_select_all" ON public.restaurants
    FOR SELECT USING (true);

CREATE POLICY "restaurants_manage_business" ON public.restaurants
    FOR ALL USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE owner_id = auth.uid()
        )
    );

-- Menu Items Policies
CREATE POLICY "menu_items_select_all" ON public.menu_items
    FOR SELECT USING (true);

CREATE POLICY "menu_items_manage_business" ON public.menu_items
    FOR ALL USING (
        restaurant_id IN (
            SELECT r.id FROM public.restaurants r
            JOIN public.businesses b ON r.business_id = b.id
            WHERE b.owner_id = auth.uid()
        )
    );

-- Restaurant Orders Policies
CREATE POLICY "orders_select_own" ON public.restaurant_orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_select_business" ON public.restaurant_orders
    FOR SELECT USING (
        restaurant_id IN (
            SELECT r.id FROM public.restaurants r
            JOIN public.businesses b ON r.business_id = b.id
            WHERE b.owner_id = auth.uid()
        )
    );

CREATE POLICY "orders_insert_own" ON public.restaurant_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_update_own" ON public.restaurant_orders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "orders_update_business" ON public.restaurant_orders
    FOR UPDATE USING (
        restaurant_id IN (
            SELECT r.id FROM public.restaurants r
            JOIN public.businesses b ON r.business_id = b.id
            WHERE b.owner_id = auth.uid()
        )
    );

-- Messages Policies
CREATE POLICY "messages_select_own" ON public.messages
    FOR SELECT USING (
        auth.uid() = from_user_id OR auth.uid() = to_user_id
    );

CREATE POLICY "messages_insert_own" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "messages_update_own" ON public.messages
    FOR UPDATE USING (
        auth.uid() = from_user_id OR auth.uid() = to_user_id
    );

-- Disputes Policies
CREATE POLICY "disputes_select_own" ON public.disputes
    FOR SELECT USING (
        auth.uid() = customer_id OR
        business_id IN (
            SELECT id FROM public.businesses WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "disputes_insert_customer" ON public.disputes
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Payments Policies
CREATE POLICY "payments_select_own" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payments_insert_own" ON public.payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payouts Policies
CREATE POLICY "payouts_select_own" ON public.payouts
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "payouts_insert_own" ON public.payouts
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT id FROM public.businesses WHERE owner_id = auth.uid()
        )
    );

-- Business Bank Accounts Policies
CREATE POLICY "bank_accounts_select_own" ON public.business_bank_accounts
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "bank_accounts_manage_own" ON public.business_bank_accounts
    FOR ALL USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE owner_id = auth.uid()
        )
    );

-- Admin Logs Policies (Admin only)
CREATE POLICY "admin_logs_select_admin" ON public.admin_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "admin_logs_insert_admin" ON public.admin_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Payment Methods Policies (Public read, Admin write)
CREATE POLICY "payment_methods_select_active" ON public.payment_methods
    FOR SELECT USING (active = true);

CREATE POLICY "payment_methods_manage_admin" ON public.payment_methods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- QR Downloads Policies (Public read)
CREATE POLICY "qr_downloads_select_all" ON public.qr_downloads
    FOR SELECT USING (true);

-- Reviews Policies
CREATE POLICY "reviews_select_all" ON public.reviews
    FOR SELECT USING (approved = true);

CREATE POLICY "reviews_insert_own" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin Policies (Full access for admins)
CREATE POLICY "admin_select_all_bookings" ON public.hotel_bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "admin_select_all_orders" ON public.restaurant_orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "admin_select_all_businesses" ON public.businesses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "admin_select_all_profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "admin_update_all" ON public.businesses
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "admin_update_disputes" ON public.disputes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "admin_update_payouts" ON public.payouts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default payment methods
INSERT INTO public.payment_methods (type, active, config) VALUES
    ('credit_card', true, '{"provider": "stripe"}'::jsonb),
    ('iban_transfer', true, '{"provider": "bank"}'::jsonb),
    ('crypto', false, '{"provider": "crypto"}'::jsonb),
    ('wallet', false, '{"provider": "wallet"}'::jsonb);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to calculate average rating
CREATE OR REPLACE FUNCTION calculate_business_rating(business_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    avg_rating NUMERIC;
BEGIN
    SELECT COALESCE(AVG(rating), 0) INTO avg_rating
    FROM public.reviews
    WHERE business_id = business_uuid AND approved = true;
    
    RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update business rating
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.approved = true AND NEW.business_id IS NOT NULL THEN
        UPDATE public.businesses
        SET rating = calculate_business_rating(NEW.business_id)
        WHERE id = NEW.business_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_rating_trigger
    AFTER INSERT OR UPDATE ON public.reviews
    FOR EACH ROW
    WHEN (NEW.approved = true)
    EXECUTE FUNCTION update_business_rating();

