import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')
    const checkIn = searchParams.get('check_in')
    const checkOut = searchParams.get('check_out')

    let query = supabase
      .from('hotels')
      .select(`
        *,
        businesses!inner (
          id,
          business_name,
          status
        )
      `)
      .eq('businesses.status', 'verified')

    if (city) {
      query = query.ilike('city', `%${city}%`)
    }

    const { data: hotels, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter by availability if dates provided
    if (checkIn && checkOut) {
      const { data: bookings } = await supabase
        .from('hotel_bookings')
        .select('hotel_id, check_in_date, check_out_date, status')
        .in('status', ['pending', 'confirmed'])

      const availableHotels = hotels?.filter(hotel => {
        const conflictingBookings = bookings?.filter(
          booking =>
            booking.hotel_id === hotel.id &&
            !(
              new Date(checkOut) <= new Date(booking.check_in_date) ||
              new Date(checkIn) >= new Date(booking.check_out_date)
            )
        )
        return !conflictingBookings || conflictingBookings.length === 0
      })

      return NextResponse.json(availableHotels || [])
    }

    return NextResponse.json(hotels || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

