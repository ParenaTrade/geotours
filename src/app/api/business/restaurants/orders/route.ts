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

    // Get restaurants owned by this business
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id')
      .eq('business_id', business.id)

    const restaurantIds = restaurants?.map((r) => r.id) || []

    if (restaurantIds.length === 0) {
      return NextResponse.json([])
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    let query = supabase
      .from('restaurant_orders')
      .select(`
        *,
        restaurants (
          id,
          name,
          address
        ),
        profiles!restaurant_orders_user_id_fkey (
          id,
          full_name,
          email,
          phone
        )
      `)
      .in('restaurant_id', restaurantIds)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: orders, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(orders || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

