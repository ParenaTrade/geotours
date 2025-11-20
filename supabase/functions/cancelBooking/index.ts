// Supabase Edge Function: cancelBooking
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

    const { booking_id, cancellation_reason, cancelled_by } = await req.json()

    if (!booking_id) {
      return new Response(
        JSON.stringify({ error: 'Missing booking_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get booking
    const { data: booking, error: fetchError } = await supabaseClient
      .from('hotel_bookings')
      .select('*')
      .eq('id', booking_id)
      .single()

    if (fetchError || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update booking status
    const { data: updatedBooking, error: updateError } = await supabaseClient
      .from('hotel_bookings')
      .update({
        status: 'cancelled',
        cancellation_reason,
        cancellation_initiated_by: cancelled_by,
        cancelled_at: new Date().toISOString()
      })
      .eq('id', booking_id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // If payment was completed, initiate refund
    if (booking.payment_status === 'completed' && booking.payment_id) {
      // Refund logic would be handled by payment processing function
      await supabaseClient
        .from('payments')
        .update({ status: 'refunded' })
        .eq('id', booking.payment_id)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        booking: updatedBooking 
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

