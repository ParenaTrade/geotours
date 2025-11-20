// Supabase Edge Function: createPaymentIntent
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

    const { amount, currency, user_id, related_booking_id, related_order_id, payment_method } = await req.json()

    if (!amount || !user_id || !currency) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        user_id,
        amount,
        currency,
        status: 'pending',
        payment_method: payment_method || 'credit_card',
        related_booking_id,
        related_order_id
      })
      .select()
      .single()

    if (paymentError) {
      throw paymentError
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        payment_id: payment.id,
        user_id,
        related_booking_id: related_booking_id || '',
        related_order_id: related_order_id || ''
      }
    })

    // Update payment with Stripe ID
    await supabaseClient
      .from('payments')
      .update({ stripe_payment_id: paymentIntent.id })
      .eq('id', payment.id)

    return new Response(
      JSON.stringify({ 
        success: true,
        client_secret: paymentIntent.client_secret,
        payment_id: payment.id,
        stripe_payment_id: paymentIntent.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

