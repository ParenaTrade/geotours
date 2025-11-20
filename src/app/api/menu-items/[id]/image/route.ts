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
    const { data: menuItem } = await supabase
      .from('menu_items')
      .select(`
        *,
        restaurants!inner (
          id,
          business_id,
          businesses!inner (
            id,
            owner_id
          )
        )
      `)
      .eq('id', params.id)
      .single()

    if (!menuItem || menuItem.restaurants.businesses.owner_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { image_url } = await request.json()

    const { data: updatedItem, error } = await supabase
      .from('menu_items')
      .update({ image_url })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updatedItem)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


