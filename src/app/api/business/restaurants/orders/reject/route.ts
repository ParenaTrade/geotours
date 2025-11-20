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
    const { order_id, reason } = body

    if (!order_id || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Update order via Edge Function
    const { data: result, error } = await supabase.functions.invoke('updateOrderStatus', {
      body: {
        order_id,
        status: 'rejected',
        business_notes: reason,
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Initiate refund if payment was completed
    if (order.payment_status === 'completed' && order.payment_id) {
      await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('id', order.payment_id)
    }

    return NextResponse.json({ success: true, order: result.order })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


