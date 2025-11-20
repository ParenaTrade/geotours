// Supabase Edge Function: walletAddFunds
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    const { user_id, amount, payment_method_id } = await req.json()

    if (!user_id || !amount || !payment_method_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user wallet balance (stored in profiles or separate wallet table)
    // For now, we'll use a simple approach with payments table
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single()

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create payment record for wallet top-up
    const { data: payment, error } = await supabaseClient
      .from('payments')
      .insert({
        user_id,
        amount,
        currency: 'USD',
        status: 'pending',
        payment_method: 'wallet',
        stripe_payment_id: payment_method_id
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // In a real implementation, you would:
    // 1. Process the payment
    // 2. Update wallet balance
    // 3. Create transaction record

    return new Response(
      JSON.stringify({ 
        success: true,
        payment_id: payment.id,
        amount,
        status: 'pending',
        message: 'Wallet top-up initiated. Balance will be updated once payment is confirmed.'
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

