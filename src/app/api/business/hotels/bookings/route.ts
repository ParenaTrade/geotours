import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user owns a business
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Get hotels owned by this business
    const { data: hotels } = await supabase
      .from('hotels')
      .select('id')
      .eq('business_id', business.id)

    const hotelIds = hotels?.map((h) => h.id) || []

    if (hotelIds.length === 0) {
      return NextResponse.json([])
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    let query = supabase
      .from('hotel_bookings')
      .select(`
        *,
        hotels (
          id,
          name,
          address
        ),
        profiles!hotel_bookings_user_id_fkey (
          id,
          full_name,
          email,
          phone
        )
      `)
      .in('hotel_id', hotelIds)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: bookings, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(bookings || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


