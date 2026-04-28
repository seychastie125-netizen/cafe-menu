import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

function isAdmin(req: NextRequest) {
  return req.headers.get('x-admin-pin') === process.env.ADMIN_PIN
}

// GET /api/categories
export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('categories').select('*').order('sort_order', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/categories — создать категорию
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createAdminClient()
  const body = await req.json()
  const { data, error } = await supabase.from('categories').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// PUT /api/categories — массовое обновление (пересохранить все)
export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createAdminClient()
  const categories: { id?: number; name: string; icon: string; sort_order: number }[] = await req.json()

  const results = await Promise.all(
    categories.map((cat) =>
      cat.id
        ? supabase.from('categories').update({ name: cat.name, icon: cat.icon, sort_order: cat.sort_order }).eq('id', cat.id)
        : supabase.from('categories').insert({ name: cat.name, icon: cat.icon, sort_order: cat.sort_order })
    )
  )

  const err = results.find((r) => r.error)
  if (err?.error) return NextResponse.json({ error: err.error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/categories/[id]
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  const supabase = createAdminClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
