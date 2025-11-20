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
    const { data: hotel } = await supabase
      .from('hotels')
      .select(`
        *,
        businesses!inner (
          id,
          owner_id
        )
      `)
      .eq('id', params.id)
      .single()

    if (!hotel || hotel.businesses.owner_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { data: updatedHotel, error } = await supabase
      .from('hotels')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updatedHotel)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


