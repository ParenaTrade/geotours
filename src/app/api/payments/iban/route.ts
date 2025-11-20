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
      iban,
      account_holder_name,
      related_booking_id,
      related_order_id,
    } = body

    if (!amount || !iban || !account_holder_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Process IBAN transfer via Edge Function
    const { data: result, error } = await supabase.functions.invoke('processIBANTransfer', {
      body: {
        amount,
        currency: currency || 'USD',
        user_id: user.id,
        iban,
        account_holder_name,
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



