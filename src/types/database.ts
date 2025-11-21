// src/types/database.ts
export type UserType = 'customer' | 'business_owner' | 'admin';
export type BusinessType = 'hotel' | 'restaurant' | 'casino' | 'events' | 'real_estate' | 'other';
export type BusinessStatus = 'pending_verification' | 'verified' | 'suspended' | 'banned' | 'rejected';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled' | 'rejected';
export type PaymentMethodType = 'iban_transfer' | 'credit_card' | 'crypto' | 'wallet';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  preferred_language: string;
  profile_picture_url: string | null;
  bio: string | null;
  rating: number;
  total_bookings: number;
  total_orders: number;
  user_type: UserType;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  business_name: string;
  business_type: BusinessType;
  email: string;
  phone: string | null;
  registration_number: string | null;
  tax_id: string | null;
  address: string | null;
  city: string | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  status: BusinessStatus;
  rating: number;
  total_bookings: number;
  total_revenue: number;
  verification_documents: any;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HotelBooking {
  id: string;
  user_id: string;
  hotel_id: string;
  room_type: string;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  total_price: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_id: string | null;
  confirmation_number: string | null;
  special_requests: string | null;
  hotel_response: string | null;
  rating: number | null;
  review: string | null;
  created_at: string;
  updated_at: string;
}

export interface RestaurantOrder {
  id: string;
  user_id: string;
  restaurant_id: string;
  items: any;
  delivery_type: 'delivery' | 'pickup';
  delivery_address: string | null;
  total_price: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_id: string | null;
  special_instructions: string | null;
  business_notes: string | null;
  estimated_delivery_time: string | null;
  actual_delivery_time: string | null;
  rating: number | null;
  review: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  active: boolean;
  config: any;
  api_endpoint: string | null;
  created_at: string;
  updated_at: string;
}