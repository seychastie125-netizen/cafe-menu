import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

function isAdmin(req: NextRequest) {
  const pin = req.headers.get('x-admin-pin')
  return pin === process.env.ADMIN_PIN
}

// GET /api/items — все позиции (или по категории)
export async function GET(req: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get('category_id')

  let query = supabase
    .from('items')
    .select('*, categories(name, icon)')
    .order('sort_order', { ascending: true })

  if (categoryId) query = query.eq('category_id', categoryId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/items — создать позицию
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const body = await req.json()
  const { data, error } = await supabase.from('items').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
