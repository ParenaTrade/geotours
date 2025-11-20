import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')
    const propertyType = searchParams.get('property_type')
    const listingType = searchParams.get('listing_type')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')

    let query = supabase
      .from('properties')
      .select(`
        *,
        businesses!inner (
          id,
          business_name,
          status
        )
      `)
      .eq('businesses.status', 'verified')
      .eq('status', 'available')

    if (city) {
      query = query.ilike('city', `%${city}%`)
    }

    if (propertyType) {
      query = query.eq('property_type', propertyType)
    }

    if (listingType) {
      query = query.eq('listing_type', listingType)
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice))
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice))
    }

    const { data: properties, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(properties || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user owns a business
    const { data: business } = await supabase
      .from('businesses')
      .select('id, business_type')
      .eq('owner_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      property_type,
      listing_type,
      title,
      description,
      address,
      city,
      latitude,
      longitude,
      price,
      rent_price,
      currency,
      area,
      bedrooms,
      bathrooms,
      floors,
      year_built,
      images,
      interior_images,
      amenities,
      features,
      contact_phone,
      contact_email,
      available_from,
    } = body

    if (!property_type || !listing_type || !title || !address || !city || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: property, error } = await supabase
      .from('properties')
      .insert({
        business_id: business.id,
        property_type,
        listing_type,
        title,
        description,
        address,
        city,
        latitude,
        longitude,
        price,
        rent_price,
        currency: currency || 'USD',
        area,
        bedrooms,
        bathrooms,
        floors,
        year_built,
        images: images || [],
        interior_images: interior_images || [],
        amenities: amenities || [],
        features: features || {},
        contact_phone,
        contact_email,
        available_from,
        status: 'available',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(property)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

