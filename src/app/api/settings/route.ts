import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

function isAdmin(req: NextRequest) {
  return req.headers.get('x-admin-pin') === process.env.ADMIN_PIN
}

// GET /api/settings — получить настройки сайта
export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .single()
  
  if (error || !data) {
    return NextResponse.json({
      cafe_name: 'Кофейня',
      cafe_subtitle: 'Электронное меню',
      currency_symbol: '₽',
      show_unavailable_items: true
    })
  }
  
  return NextResponse.json({
    cafeName: data.cafe_name,
    cafeSubtitle: data.cafe_subtitle,
    currencySymbol: data.currency_symbol,
    showUnavailableItems: data.show_unavailable_items
  })
}

// PATCH /api/settings — обновить настройки (только админ)
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('site_settings')
    .update({
      cafe_name: body.cafeName,
      cafe_subtitle: body.cafeSubtitle,
      currency_symbol: body.currencySymbol,
      show_unavailable_items: body.showUnavailableItems,
      updated_at: new Date().toISOString()
    })
    .eq('id', 1)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    cafeName: data.cafe_name,
    cafeSubtitle: data.cafe_subtitle,
    currencySymbol: data.currency_symbol,
    showUnavailableItems: data.show_unavailable_items
  })
}
