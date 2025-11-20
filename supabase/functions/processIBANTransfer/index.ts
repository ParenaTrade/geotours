// Supabase Edge Function: processIBANTransfer
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
      iban, 
      account_holder_name,
      related_booking_id, 
      related_order_id 
    } = await req.json()

    if (!amount || !user_id || !iban || !account_holder_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate IBAN format (basic check)
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/
    if (!ibanRegex.test(iban.replace(/\s/g, ''))) {
      return new Response(
        JSON.stringify({ error: 'Invalid IBAN format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create payment record with pending status
    const { data: payment, error } = await supabaseClient
      .from('payments')
      .insert({
        user_id,
        amount,
        currency: currency || 'USD',
        status: 'pending',
        payment_method: 'iban_transfer',
        related_booking_id,
        related_order_id
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // In a real implementation, you would call your bank API here
    // For now, we'll simulate the process
    const bankApiToken = Deno.env.get('BANK_API_TOKEN')
    const bankSwiftCode = Deno.env.get('BANK_SWIFT_CODE')
    const bankIbanGlobal = Deno.env.get('BANK_IBAN_GLOBAL')

    // Simulate API call (replace with actual bank API integration)
    const transferResult = {
      transaction_id: `TXN-${Date.now()}`,
      status: 'pending',
      estimated_completion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days
    }

    // Update payment with transaction ID
    await supabaseClient
      .from('payments')
      .update({
        stripe_payment_id: transferResult.transaction_id // Reusing field for transaction ID
      })
      .eq('id', payment.id)

    return new Response(
      JSON.stringify({ 
        success: true,
        payment_id: payment.id,
        transaction_id: transferResult.transaction_id,
        status: 'pending',
        message: 'IBAN transfer initiated. Payment will be processed within 2-5 business days.'
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


