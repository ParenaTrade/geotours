import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const paymentId = paymentIntent.metadata.payment_id

        if (paymentId) {
          await supabase
            .from('payments')
            .update({
              status: 'completed',
              stripe_charge_id: paymentIntent.latest_charge as string,
            })
            .eq('id', paymentId)

          // Update related booking or order
          const { data: payment } = await supabase
            .from('payments')
            .select('related_booking_id, related_order_id')
            .eq('id', paymentId)
            .single()

          if (payment?.related_booking_id) {
            await supabase
              .from('hotel_bookings')
              .update({ payment_status: 'completed', payment_id: paymentId })
              .eq('id', payment.related_booking_id)
          }

          if (payment?.related_order_id) {
            await supabase
              .from('restaurant_orders')
              .update({ payment_status: 'completed', payment_id: paymentId })
              .eq('id', payment.related_order_id)
          }
        }
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        const failedPaymentId = failedPayment.metadata.payment_id

        if (failedPaymentId) {
          await supabase
            .from('payments')
            .update({ status: 'failed' })
            .eq('id', failedPaymentId)
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


