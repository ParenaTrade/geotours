// Supabase Edge Function: walletWithdraw
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

    const { user_id, amount, withdrawal_method, account_details } = await req.json()

    if (!user_id || !amount || !withdrawal_method) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user wallet balance
    // In a real implementation, you would check actual wallet balance
    // For now, we'll check total payments vs total spent

    const { data: payments } = await supabaseClient
      .from('payments')
      .select('amount')
      .eq('user_id', user_id)
      .eq('status', 'completed')
      .eq('payment_method', 'wallet')

    const totalWalletFunds = payments?.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0

    // Check if user has sufficient balance
    if (amount > totalWalletFunds) {
      return new Response(
        JSON.stringify({ error: 'Insufficient wallet balance' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create withdrawal record
    const { data: withdrawal, error } = await supabaseClient
      .from('payments')
      .insert({
        user_id,
        amount: -amount, // Negative for withdrawal
        currency: 'USD',
        status: 'pending',
        payment_method: 'wallet',
        stripe_payment_id: `WITHDRAW-${Date.now()}`
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        withdrawal_id: withdrawal.id,
        amount,
        status: 'pending',
        message: 'Withdrawal request submitted. Funds will be transferred within 2-5 business days.'
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

