import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select(`
        *,
        businesses!inner (
          id,
          owner_id
        )
      `)
      .eq('id', params.id)
      .single()

    if (!restaurant || restaurant.businesses.owner_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { images } = await request.json()

    const { data: updatedRestaurant, error } = await supabase
      .from('restaurants')
      .update({ images: images || [] })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updatedRestaurant)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


