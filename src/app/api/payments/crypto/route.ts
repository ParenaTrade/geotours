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
    const {
      amount,
      currency,
      crypto_type,
      wallet_address,
      related_booking_id,
      related_order_id,
    } = body

    if (!amount || !crypto_type || !wallet_address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Process crypto payment via Edge Function
    const { data: result, error } = await supabase.functions.invoke('processCryptoPayment', {
      body: {
        amount,
        currency: currency || 'USD',
        user_id: user.id,
        crypto_type,
        wallet_address,
        related_booking_id,
        related_order_id,
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


