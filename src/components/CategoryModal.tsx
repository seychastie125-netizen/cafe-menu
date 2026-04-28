'use client'

import { useState } from 'react'
import type { Category } from '@/lib/supabase'

type Props = {
  categories: Category[]
  onSave: (cats: Category[]) => void
  onClose: () => void
  showToast: (msg: string, type?: string) => void
}

type EditCat = { id?: number; name: string; icon: string; sort_order: number }

export default function CategoryModal({ categories, onSave, onClose, showToast }: Props) {
  const [cats, setCats] = useState<EditCat[]>(categories.map(c => ({ id: c.id, name: c.name, icon: c.icon, sort_order: c.sort_order })))
  const [saving, setSaving] = useState(false)

  const adminPin = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('adminPin') || '' : ''

  function addCat() {
    setCats(c => [...c, { name: '', icon: '📋', sort_order: c.length + 1 }])
  }

  function update(i: number, key: string, val: string) {
    setCats(c => c.map((cat, j) => j === i ? { ...cat, [key]: val } : cat))
  }

  function remove(i: number) {
    setCats(c => c.filter((_, j) => j !== i))
  }

  async function handleSave() {
    if (!cats.some(c => c.name.trim())) { showToast('⚠️ Добавьте хотя бы одну категорию', 'error'); return }
    const valid = cats.filter(c => c.name.trim()).map((c, i) => ({ ...c, name: c.name.trim(), sort_order: i + 1 }))
    setSaving(true)
    const res = await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': adminPin },
      body: JSON.stringify(valid)
    })
    setSaving(false)
    if (res.ok) {
      // Re-fetch saved categories
      const r2 = await fetch('/api/categories')
      const saved: Category[] = await r2.json()
      onSave(saved)
    } else showToast('Ошибка сохранения', 'error')
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">⚙ Категории</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div id="cat-list">
            {cats.map((cat, i) => (
              <div key={i} className="cat-item">
                <input
                  style={{ width: 40, textAlign: 'center', padding: 0, background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, fontSize: 18, color: 'var(--text)' }}
                  value={cat.icon}
                  onChange={e => update(i, 'icon', e.target.value)}
                  placeholder="📋"
                />
                <input
                  className="cat-name-input"
                  value={cat.name}
                  onChange={e => update(i, 'name', e.target.value)}
                  placeholder="Название категории"
                />
                <button className="cat-del" onClick={() => remove(i)}>✕</button>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={addCat}>+ Добавить категорию</button>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" /> : '✅ Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}
