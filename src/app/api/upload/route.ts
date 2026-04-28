import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 30

function isAdmin(req: NextRequest) {
  return req.headers.get('x-admin-pin') === process.env.ADMIN_PIN
}

// POST /api/upload — загрузить фото, вернуть публичный URL
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  // Проверка типа
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only images allowed' }, { status: 400 })
  }

  // Максимум 5 МБ
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Max 5 MB' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const supabase = createAdminClient()
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error } = await supabase.storage
    .from('photos')
    .upload(filename, buffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filename)
  return NextResponse.json({ url: publicUrl })
}

// DELETE /api/upload — удалить фото
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'No url' }, { status: 400 })

  const path = url.split('/photos/')[1]
  if (!path) return NextResponse.json({ error: 'Bad url' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase.storage.from('photos').remove([path])
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
