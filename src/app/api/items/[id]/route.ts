import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

function isAdmin(req: NextRequest) {
  return req.headers.get('x-admin-pin') === process.env.ADMIN_PIN
}

// PATCH /api/items/[id] — обновить позицию
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const body = await req.json()
  const { data, error } = await supabase
    .from('items').update(body).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/items/[id] — удалить позицию
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  // Удалить фото из Storage если есть
  const { data: item } = await supabase.from('items').select('image_url').eq('id', params.id).single()
  if (item?.image_url) {
    const path = item.image_url.split('/photos/')[1]
    if (path) await supabase.storage.from('photos').remove([path])
  }

  const { error } = await supabase.from('items').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
