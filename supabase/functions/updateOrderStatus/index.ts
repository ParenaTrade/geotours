// Supabase Edge Function: updateOrderStatus
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

    const { order_id, status, business_notes, estimated_preparation_time } = await req.json()

    if (!order_id || !status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    // Add status-specific fields
    if (status === 'accepted' && estimated_preparation_time) {
      const preparationStart = new Date()
      const readyAt = new Date(preparationStart.getTime() + estimated_preparation_time * 60000)
      updateData.preparation_started_at = preparationStart.toISOString()
      updateData.estimated_ready_at = readyAt.toISOString()
    }

    if (business_notes) {
      updateData.business_notes = business_notes
    }

    if (status === 'delivered') {
      updateData.actual_delivery_time = new Date().toISOString()
    }

    if (status === 'rejected') {
      updateData.rejected_at = new Date().toISOString()
    }

    // Update order
    const { data: order, error } = await supabaseClient
      .from('restaurant_orders')
      .update(updateData)
      .eq('id', order_id)
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

