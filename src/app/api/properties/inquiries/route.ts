import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { property_id, inquiry_type, message, preferred_contact_method } = body

    if (!property_id || !inquiry_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: inquiry, error } = await supabase
      .from('property_inquiries')
      .insert({
        property_id,
        user_id: user.id,
        inquiry_type,
        message,
        preferred_contact_method,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(inquiry)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const propertyId = searchParams.get('property_id')

    let query = supabase
      .from('property_inquiries')
      .select(`
        *,
        properties (
          id,
          title,
          address
        ),
        profiles!property_inquiries_user_id_fkey (
          id,
          full_name,
          email,
          phone
        )
      `)

    // Check if user is business owner
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (business) {
      // Business owner can see inquiries for their properties
      query = query.in('property_id', 
        supabase
          .from('properties')
          .select('id')
          .eq('business_id', business.id)
      )
    } else {
      // Regular user can only see their own inquiries
      query = query.eq('user_id', user.id)
    }

    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }

    const { data: inquiries, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(inquiries || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}



