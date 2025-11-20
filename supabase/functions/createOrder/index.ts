// Supabase Edge Function: createOrder
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
      restaurant_id, 
      items, 
      delivery_type, 
      delivery_address, 
      total_price, 
      special_instructions,
      user_id 
    } = await req.json()

    // Validate input
    if (!restaurant_id || !items || !delivery_type || !total_price || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate estimated delivery time (45 minutes from now)
    const estimatedDelivery = new Date()
    estimatedDelivery.setMinutes(estimatedDelivery.getMinutes() + 45)

    // Create order
    const { data: order, error } = await supabaseClient
      .from('restaurant_orders')
      .insert({
        user_id,
        restaurant_id,
        items: items,
        delivery_type,
        delivery_address,
        total_price,
        special_instructions,
        status: 'pending',
        payment_status: 'pending',
        estimated_delivery_time: estimatedDelivery.toISOString()
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        order 
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

