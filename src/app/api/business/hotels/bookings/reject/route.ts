import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { booking_id, reason } = body

    if (!booking_id || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify business ownership
    const { data: booking } = await supabase
      .from('hotel_bookings')
      .select(`
        *,
        hotels!inner (
          id,
          business_id,
          businesses!inner (
            id,
            owner_id
          )
        )
      `)
      .eq('id', booking_id)
      .single()

    if (!booking || booking.hotels.businesses.owner_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update booking
    const { data: updatedBooking, error } = await supabase
      .from('hotel_bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancellation_initiated_by: 'business',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', booking_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Initiate refund if payment was completed
    if (booking.payment_status === 'completed' && booking.payment_id) {
      // Refund would be processed here
      await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('id', booking.payment_id)
    }

    return NextResponse.json({ success: true, booking: updatedBooking })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}



