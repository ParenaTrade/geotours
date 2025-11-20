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
    const { amount, currency, related_booking_id, related_order_id, payment_method } = body

    if (!amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create payment intent via Edge Function
    const { data: paymentIntent, error } = await supabase.functions.invoke('createPaymentIntent', {
      body: {
        amount,
        currency: currency || 'USD',
        user_id: user.id,
        related_booking_id,
        related_order_id,
        payment_method: payment_method || 'credit_card',
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(paymentIntent)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}



