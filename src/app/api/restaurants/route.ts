import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const location = searchParams.get('location')
    const cuisine = searchParams.get('cuisine')

    let query = supabase
      .from('restaurants')
      .select(`
        *,
        businesses!inner (
          id,
          business_name,
          status
        )
      `)
      .eq('businesses.status', 'verified')

    if (location) {
      query = query.ilike('city', `%${location}%`)
    }

    if (cuisine) {
      query = query.ilike('cuisine_type', `%${cuisine}%`)
    }

    const { data: restaurants, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(restaurants || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


