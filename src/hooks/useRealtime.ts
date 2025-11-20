'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtimeSubscription<T>(
  table: string,
  filter?: string,
  callback?: (payload: any) => void
) {
  const [data, setData] = useState<T[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Set up realtime subscription
    const newChannel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter,
        },
        (payload) => {
          if (callback) {
            callback(payload)
          }
          // Refetch data or update state based on payload
        }
      )
      .subscribe()

    setChannel(newChannel)

    return () => {
      supabase.removeChannel(newChannel)
    }
  }, [table, filter, callback])

  return { data, channel }
}

// Hook for booking status updates
export function useBookingStatus(bookingId: string) {
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!bookingId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`booking_${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'hotel_bookings',
          filter: `id=eq.${bookingId}`,
        },
        (payload) => {
          setStatus((payload.new as any).status)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [bookingId])

  return status
}

// Hook for order status updates
export function useOrderStatus(orderId: string) {
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`order_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'restaurant_orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setStatus((payload.new as any).status)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId])

  return status
}


