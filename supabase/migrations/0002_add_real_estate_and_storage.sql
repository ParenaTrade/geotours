-- Migration: Add Real Estate Tables and Storage Setup

-- ============================================
-- REAL ESTATE ENUMS
-- ============================================

CREATE TYPE property_type_enum AS ENUM ('apartment', 'house', 'villa', 'commercial', 'land', 'other');
CREATE TYPE property_status_enum AS ENUM ('available', 'rented', 'sold', 'pending', 'unavailable');
CREATE TYPE listing_type_enum AS ENUM ('rent', 'sale', 'both');

-- ============================================
-- REAL ESTATE TABLES
-- ============================================

-- Properties (Emlak İlanları)
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    property_type property_type_enum NOT NULL,
    listing_type listing_type_enum NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    price NUMERIC(12,2) NOT NULL,
    rent_price NUMERIC(12,2), -- Aylık kira fiyatı
    currency TEXT DEFAULT 'USD',
    area NUMERIC(10,2), -- m²
    bedrooms INTEGER,
    bathrooms INTEGER,
    floors INTEGER,
    year_built INTEGER,
    status property_status_enum DEFAULT 'available',
    images TEXT[] DEFAULT '{}', -- Exterior images
    interior_images TEXT[] DEFAULT '{}', -- Interior images
    amenities TEXT[] DEFAULT '{}',
    features JSONB DEFAULT '{}'::jsonb, -- Additional features
    contact_phone TEXT,
    contact_email TEXT,
    available_from DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Inquiries (Emlak Talepleri)
CREATE TABLE public.property_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    inquiry_type listing_type_enum NOT NULL,
    message TEXT,
    preferred_contact_method TEXT,
    status TEXT DEFAULT 'pending', -- pending, contacted, viewed, closed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- UPDATE BUSINESS TYPE ENUM
-- ============================================

-- Add real_estate to business_type_enum
ALTER TYPE business_type_enum ADD VALUE IF NOT EXISTS 'real_estate';

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_properties_business_id ON public.properties(business_id);
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_property_type ON public.properties(property_type);
CREATE INDEX idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_price ON public.properties(price);
CREATE INDEX idx_property_inquiries_property_id ON public.property_inquiries(property_id);
CREATE INDEX idx_property_inquiries_user_id ON public.property_inquiries(user_id);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_inquiries_updated_at BEFORE UPDATE ON public.property_inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_inquiries ENABLE ROW LEVEL SECURITY;

-- Properties Policies
CREATE POLICY "properties_select_all" ON public.properties
    FOR SELECT USING (status = 'available');

CREATE POLICY "properties_select_business" ON public.properties
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "properties_insert_business" ON public.properties
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT id FROM public.businesses WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "properties_update_business" ON public.properties
    FOR UPDATE USING (
        business_id IN (
            SELECT id FROM public.businesses WHERE owner_id = auth.uid()
        )
    );

-- Property Inquiries Policies
CREATE POLICY "inquiries_select_own" ON public.property_inquiries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "inquiries_select_business" ON public.property_inquiries
    FOR SELECT USING (
        property_id IN (
            SELECT p.id FROM public.properties p
            JOIN public.businesses b ON p.business_id = b.id
            WHERE b.owner_id = auth.uid()
        )
    );

CREATE POLICY "inquiries_insert_own" ON public.property_inquiries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin Policies
CREATE POLICY "admin_select_all_properties" ON public.properties
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "admin_select_all_inquiries" ON public.property_inquiries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- ============================================
-- STORAGE BUCKETS (Supabase Storage)
-- ============================================

-- Note: Storage buckets are created via Supabase Dashboard or API
-- This is a reference for bucket names:

-- Buckets to create:
-- 1. hotel-exterior - Hotel dış görüntüleri
-- 2. hotel-interior - Hotel oda iç görüntüleri
-- 3. restaurant-images - Restoran görüntüleri
-- 4. menu-items - Menü ürün görselleri
-- 5. property-exterior - Emlak dış görüntüleri
-- 6. property-interior - Emlak iç görüntüleri
-- 7. user-avatars - Kullanıcı profil fotoğrafları
-- 8. business-logos - İşletme logoları
-- 9. documents - Belge dosyaları

-- Storage policies will be set via Supabase Dashboard:
-- - Public read for images
-- - Authenticated write for owners
-- - Admin full access


