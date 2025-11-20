// Supabase Edge Function: processCryptoPayment
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

    const { 
      amount, 
      currency, 
      user_id, 
      crypto_type, // USDT, ETH, BTC
      wallet_address,
      related_booking_id, 
      related_order_id 
    } = await req.json()

    if (!amount || !user_id || !crypto_type || !wallet_address) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get wallet address for the crypto type
    const walletEnvMap: Record<string, string> = {
      'USDT': Deno.env.get('CRYPTO_USDT_WALLET') ?? '',
      'ETH': Deno.env.get('CRYPTO_ETH_WALLET') ?? '',
      'BTC': Deno.env.get('CRYPTO_BTC_WALLET') ?? ''
    }

    const receivingWallet = walletEnvMap[crypto_type]
    if (!receivingWallet) {
      return new Response(
        JSON.stringify({ error: 'Unsupported crypto type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create payment record
    const { data: payment, error } = await supabaseClient
      .from('payments')
      .insert({
        user_id,
        amount,
        currency: currency || 'USD',
        status: 'pending',
        payment_method: 'crypto',
        related_booking_id,
        related_order_id
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // In a real implementation, you would integrate with a crypto payment provider
    // For now, we'll generate a payment address and transaction ID
    const transactionId = `CRYPTO-${crypto_type}-${Date.now()}`
    
    // Update payment with transaction details
    await supabaseClient
      .from('payments')
      .update({
        stripe_payment_id: transactionId // Reusing field for transaction ID
      })
      .eq('id', payment.id)

    return new Response(
      JSON.stringify({ 
        success: true,
        payment_id: payment.id,
        transaction_id: transactionId,
        receiving_wallet: receivingWallet,
        crypto_type,
        amount,
        status: 'pending',
        message: `Please send ${amount} ${crypto_type} to ${receivingWallet}. Payment will be confirmed once transaction is verified on blockchain.`
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

