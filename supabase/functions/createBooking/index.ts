// Supabase Edge Function: createBooking
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

    const { hotel_id, check_in_date, check_out_date, room_type, guests, total_price, notes, user_id } = await req.json()

    // Validate input
    if (!hotel_id || !check_in_date || !check_out_date || !room_type || !guests || !total_price || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create booking
    const { data: booking, error } = await supabaseClient
      .from('hotel_bookings')
      .insert({
        user_id,
        hotel_id,
        check_in_date,
        check_out_date,
        room_type,
        guests,
        total_price,
        special_requests: notes,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Generate confirmation number
    const confirmationNumber = `HB-${booking.id.substring(0, 8).toUpperCase()}-${new Date().getFullYear()}`

    // Update booking with confirmation number
    await supabaseClient
      .from('hotel_bookings')
      .update({ confirmation_number: confirmationNumber })
      .eq('id', booking.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        booking: { ...booking, confirmation_number: confirmationNumber } 
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

