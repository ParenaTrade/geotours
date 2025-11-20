export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          preferred_language: string
          profile_picture_url: string | null
          bio: string | null
          rating: number
          total_bookings: number
          total_orders: number
          user_type: 'customer' | 'business_owner' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          preferred_language?: string
          profile_picture_url?: string | null
          bio?: string | null
          rating?: number
          total_bookings?: number
          total_orders?: number
          user_type?: 'customer' | 'business_owner' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          preferred_language?: string
          profile_picture_url?: string | null
          bio?: string | null
          rating?: number
          total_bookings?: number
          total_orders?: number
          user_type?: 'customer' | 'business_owner' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          owner_id: string
          business_name: string
          business_type: 'hotel' | 'restaurant' | 'casino' | 'events' | 'other'
          email: string
          phone: string | null
          registration_number: string | null
          tax_id: string | null
          address: string | null
          city: string | null
          website: string | null
          description: string | null
          logo_url: string | null
          status: 'pending_verification' | 'verified' | 'suspended' | 'banned' | 'rejected'
          rating: number
          total_bookings: number
          total_revenue: number
          verification_documents: Json
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          business_name: string
          business_type: 'hotel' | 'restaurant' | 'casino' | 'events' | 'other'
          email: string
          phone?: string | null
          registration_number?: string | null
          tax_id?: string | null
          address?: string | null
          city?: string | null
          website?: string | null
          description?: string | null
          logo_url?: string | null
          status?: 'pending_verification' | 'verified' | 'suspended' | 'banned' | 'rejected'
          rating?: number
          total_bookings?: number
          total_revenue?: number
          verification_documents?: Json
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          business_name?: string
          business_type?: 'hotel' | 'restaurant' | 'casino' | 'events' | 'other'
          email?: string
          phone?: string | null
          registration_number?: string | null
          tax_id?: string | null
          address?: string | null
          city?: string | null
          website?: string | null
          description?: string | null
          logo_url?: string | null
          status?: 'pending_verification' | 'verified' | 'suspended' | 'banned' | 'rejected'
          rating?: number
          total_bookings?: number
          total_revenue?: number
          verification_documents?: Json
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hotels: {
        Row: {
          id: string
          business_id: string
          name: string
          description: string | null
          city: string | null
          address: string | null
          latitude: number | null
          longitude: number | null
          images: string[]
          amenities: string[]
          rating: number
          review_count: number
          check_in_time: string
          check_out_time: string
          cancellation_policy: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          description?: string | null
          city?: string | null
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          images?: string[]
          amenities?: string[]
          rating?: number
          review_count?: number
          check_in_time?: string
          check_out_time?: string
          cancellation_policy?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          description?: string | null
          city?: string | null
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          images?: string[]
          amenities?: string[]
          rating?: number
          review_count?: number
          check_in_time?: string
          check_out_time?: string
          cancellation_policy?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hotel_bookings: {
        Row: {
          id: string
          user_id: string
          hotel_id: string
          room_type: string
          check_in_date: string
          check_out_date: string
          guests: number
          total_price: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_id: string | null
          confirmation_number: string | null
          special_requests: string | null
          hotel_response: string | null
          cancellation_reason: string | null
          cancellation_initiated_by: string | null
          cancelled_at: string | null
          confirmed_at: string | null
          rating: number | null
          review: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          hotel_id: string
          room_type: string
          check_in_date: string
          check_out_date: string
          guests?: number
          total_price: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_id?: string | null
          confirmation_number?: string | null
          special_requests?: string | null
          hotel_response?: string | null
          cancellation_reason?: string | null
          cancellation_initiated_by?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          rating?: number | null
          review?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          hotel_id?: string
          room_type?: string
          check_in_date?: string
          check_out_date?: string
          guests?: number
          total_price?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_id?: string | null
          confirmation_number?: string | null
          special_requests?: string | null
          hotel_response?: string | null
          cancellation_reason?: string | null
          cancellation_initiated_by?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          rating?: number | null
          review?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      restaurants: {
        Row: {
          id: string
          business_id: string
          name: string
          description: string | null
          cuisine_type: string | null
          city: string | null
          address: string | null
          latitude: number | null
          longitude: number | null
          images: string[]
          phone: string | null
          website: string | null
          opening_hours: Json
          delivery_available: boolean
          delivery_fee: number
          min_order_amount: number
          rating: number
          review_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          description?: string | null
          cuisine_type?: string | null
          city?: string | null
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          images?: string[]
          phone?: string | null
          website?: string | null
          opening_hours?: Json
          delivery_available?: boolean
          delivery_fee?: number
          min_order_amount?: number
          rating?: number
          review_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          description?: string | null
          cuisine_type?: string | null
          city?: string | null
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          images?: string[]
          phone?: string | null
          website?: string | null
          opening_hours?: Json
          delivery_available?: boolean
          delivery_fee?: number
          min_order_amount?: number
          rating?: number
          review_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      restaurant_orders: {
        Row: {
          id: string
          user_id: string
          restaurant_id: string
          items: Json
          delivery_type: 'delivery' | 'pickup'
          delivery_address: string | null
          total_price: number
          status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled' | 'rejected'
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_id: string | null
          special_instructions: string | null
          business_notes: string | null
          rejection_reason: string | null
          rejected_at: string | null
          preparation_started_at: string | null
          estimated_ready_at: string | null
          estimated_delivery_time: string | null
          actual_delivery_time: string | null
          rating: number | null
          review: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_id: string
          items: Json
          delivery_type: 'delivery' | 'pickup'
          delivery_address?: string | null
          total_price: number
          status?: 'pending' | 'accepted' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled' | 'rejected'
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_id?: string | null
          special_instructions?: string | null
          business_notes?: string | null
          rejection_reason?: string | null
          rejected_at?: string | null
          preparation_started_at?: string | null
          estimated_ready_at?: string | null
          estimated_delivery_time?: string | null
          actual_delivery_time?: string | null
          rating?: number | null
          review?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: string
          items?: Json
          delivery_type?: 'delivery' | 'pickup'
          delivery_address?: string | null
          total_price?: number
          status?: 'pending' | 'accepted' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled' | 'rejected'
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_id?: string | null
          special_instructions?: string | null
          business_notes?: string | null
          rejection_reason?: string | null
          rejected_at?: string | null
          preparation_started_at?: string | null
          estimated_ready_at?: string | null
          estimated_delivery_time?: string | null
          actual_delivery_time?: string | null
          rating?: number | null
          review?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          type: 'iban_transfer' | 'credit_card' | 'crypto' | 'wallet'
          active: boolean
          config: Json
          api_endpoint: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'iban_transfer' | 'credit_card' | 'crypto' | 'wallet'
          active?: boolean
          config?: Json
          api_endpoint?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'iban_transfer' | 'credit_card' | 'crypto' | 'wallet'
          active?: boolean
          config?: Json
          api_endpoint?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string
          message: string
          related_booking_id: string | null
          related_order_id: string | null
          read: boolean
          attachment_urls: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          from_user_id: string
          to_user_id: string
          message: string
          related_booking_id?: string | null
          related_order_id?: string | null
          read?: boolean
          attachment_urls?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string
          to_user_id?: string
          message?: string
          related_booking_id?: string | null
          related_order_id?: string | null
          read?: boolean
          attachment_urls?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method: string | null
          stripe_payment_id: string | null
          stripe_charge_id: string | null
          related_booking_id: string | null
          related_order_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency?: string
          payment_method?: string | null
          stripe_payment_id?: string | null
          stripe_charge_id?: string | null
          related_booking_id?: string | null
          related_order_id?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          payment_method?: string | null
          stripe_payment_id?: string | null
          stripe_charge_id?: string | null
          related_booking_id?: string | null
          related_order_id?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          business_id: string
          property_type: 'apartment' | 'house' | 'villa' | 'commercial' | 'land' | 'other'
          listing_type: 'rent' | 'sale' | 'both'
          title: string
          description: string | null
          address: string
          city: string
          latitude: number | null
          longitude: number | null
          price: number
          rent_price: number | null
          currency: string
          area: number | null
          bedrooms: number | null
          bathrooms: number | null
          floors: number | null
          year_built: number | null
          status: 'available' | 'rented' | 'sold' | 'pending' | 'unavailable'
          images: string[]
          interior_images: string[]
          amenities: string[]
          features: Json
          contact_phone: string | null
          contact_email: string | null
          available_from: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          property_type: 'apartment' | 'house' | 'villa' | 'commercial' | 'land' | 'other'
          listing_type: 'rent' | 'sale' | 'both'
          title: string
          description?: string | null
          address: string
          city: string
          latitude?: number | null
          longitude?: number | null
          price: number
          rent_price?: number | null
          currency?: string
          area?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          floors?: number | null
          year_built?: number | null
          status?: 'available' | 'rented' | 'sold' | 'pending' | 'unavailable'
          images?: string[]
          interior_images?: string[]
          amenities?: string[]
          features?: Json
          contact_phone?: string | null
          contact_email?: string | null
          available_from?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          property_type?: 'apartment' | 'house' | 'villa' | 'commercial' | 'land' | 'other'
          listing_type?: 'rent' | 'sale' | 'both'
          title?: string
          description?: string | null
          address?: string
          city?: string
          latitude?: number | null
          longitude?: number | null
          price?: number
          rent_price?: number | null
          currency?: string
          area?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          floors?: number | null
          year_built?: number | null
          status?: 'available' | 'rented' | 'sold' | 'pending' | 'unavailable'
          images?: string[]
          interior_images?: string[]
          amenities?: string[]
          features?: Json
          contact_phone?: string | null
          contact_email?: string | null
          available_from?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      property_inquiries: {
        Row: {
          id: string
          property_id: string
          user_id: string
          inquiry_type: 'rent' | 'sale' | 'both'
          message: string | null
          preferred_contact_method: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          user_id: string
          inquiry_type: 'rent' | 'sale' | 'both'
          message?: string | null
          preferred_contact_method?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          user_id?: string
          inquiry_type?: 'rent' | 'sale' | 'both'
          message?: string | null
          preferred_contact_method?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type_enum: 'customer' | 'business_owner' | 'admin'
      business_type_enum: 'hotel' | 'restaurant' | 'casino' | 'events' | 'real_estate' | 'other'
      business_status_enum: 'pending_verification' | 'verified' | 'suspended' | 'banned' | 'rejected'
      booking_status_enum: 'pending' | 'confirmed' | 'cancelled' | 'completed'
      payment_status_enum: 'pending' | 'completed' | 'failed' | 'refunded'
      order_status_enum: 'pending' | 'accepted' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled' | 'rejected'
      property_type_enum: 'apartment' | 'house' | 'villa' | 'commercial' | 'land' | 'other'
      property_status_enum: 'available' | 'rented' | 'sold' | 'pending' | 'unavailable'
      listing_type_enum: 'rent' | 'sale' | 'both'
    }
  }
}

