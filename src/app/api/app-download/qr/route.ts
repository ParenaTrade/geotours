import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import QRCode from 'qrcode'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const platform = searchParams.get('platform') || 'android'

    if (platform !== 'android' && platform !== 'ios') {
      return NextResponse.json(
        { error: 'Invalid platform. Use "android" or "ios"' },
        { status: 400 }
      )
    }

    const downloadUrl =
      platform === 'android'
        ? process.env.ANDROID_APP_URL
        : process.env.IOS_APP_URL

    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'Download URL not configured' },
        { status: 500 }
      )
    }

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(downloadUrl)

    // Save or update QR download record
    const { data: existing } = await supabase
      .from('qr_downloads')
      .select('*')
      .eq('platform', platform)
      .single()

    if (existing) {
      await supabase
        .from('qr_downloads')
        .update({
          qr_code_url: qrCodeDataUrl,
          download_url: downloadUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('qr_downloads').insert({
        platform,
        qr_code_url: qrCodeDataUrl,
        download_url: downloadUrl,
      })
    }

    return NextResponse.json({
      platform,
      qr_code: qrCodeDataUrl,
      download_url: downloadUrl,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

