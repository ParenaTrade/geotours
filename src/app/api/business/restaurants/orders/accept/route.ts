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
    const { order_id, estimated_preparation_time, notes } = body

    if (!order_id) {
      return NextResponse.json(
        { error: 'Missing order_id' },
        { status: 400 }
      )
    }

    // Verify business ownership
    const { data: order } = await supabase
      .from('restaurant_orders')
      .select(`
        *,
        restaurants!inner (
          id,
          business_id,
          businesses!inner (
            id,
            owner_id
          )
        )
      `)
      .eq('id', order_id)
      .single()

    if (!order || order.restaurants.businesses.owner_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updateData: any = {
      status: 'accepted',
      business_notes: notes,
    }

    if (estimated_preparation_time) {
      const preparationStart = new Date()
      const readyAt = new Date(
        preparationStart.getTime() + estimated_preparation_time * 60000
      )
      updateData.preparation_started_at = preparationStart.toISOString()
      updateData.estimated_ready_at = readyAt.toISOString()
    }

    // Update order via Edge Function
    const { data: result, error } = await supabase.functions.invoke('updateOrderStatus', {
      body: {
        order_id,
        status: 'accepted',
        business_notes: notes,
        estimated_preparation_time,
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, order: result.order })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}



