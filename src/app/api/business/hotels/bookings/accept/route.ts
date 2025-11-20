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
    const { booking_id, notes } = body

    if (!booking_id) {
      return NextResponse.json(
        { error: 'Missing booking_id' },
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

    // Generate confirmation number
    const confirmationNumber = `HB-${booking_id.substring(0, 8).toUpperCase()}-${new Date().getFullYear()}`

    // Update booking
    const { data: updatedBooking, error } = await supabase
      .from('hotel_bookings')
      .update({
        status: 'confirmed',
        hotel_response: notes,
        confirmed_at: new Date().toISOString(),
        confirmation_number: confirmationNumber,
      })
      .eq('id', booking_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, booking: updatedBooking })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


