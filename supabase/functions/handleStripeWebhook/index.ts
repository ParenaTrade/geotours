// Supabase Edge Function: handleStripeWebhook
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.6.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    const signature = req.headers.get('stripe-signature')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'No signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.text()
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const paymentId = paymentIntent.metadata.payment_id

        if (paymentId) {
          // Update payment status
          await supabaseClient
            .from('payments')
            .update({
              status: 'completed',
              stripe_charge_id: paymentIntent.latest_charge as string
            })
            .eq('id', paymentId)

          // Update related booking or order
          const { data: payment } = await supabaseClient
            .from('payments')
            .select('related_booking_id, related_order_id')
            .eq('id', paymentId)
            .single()

          if (payment?.related_booking_id) {
            await supabaseClient
              .from('hotel_bookings')
              .update({ payment_status: 'completed', payment_id: paymentId })
              .eq('id', payment.related_booking_id)
          }

          if (payment?.related_order_id) {
            await supabaseClient
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
          await supabaseClient
            .from('payments')
            .update({ status: 'failed' })
            .eq('id', failedPaymentId)
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})


