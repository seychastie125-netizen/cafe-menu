'use client'

import { useState, useRef } from 'react'
import type { Category, Item, ModifierGroup } from '@/lib/supabase'

type Props = {
  item: Item | null // null = новый
  categories: Category[]
  defaultCategoryId?: number
  onSave: (item: Item) => void
  onClose: () => void
  showToast: (msg: string, type?: string) => void
  currencySymbol: string
}

export default function ItemModal({ item, categories, defaultCategoryId, onSave, onClose, showToast, currencySymbol }: Props) {
  const [name, setName] = useState(item?.name || '')
  const [desc, setDesc] = useState(item?.description || '')
  const [price, setPrice] = useState(item?.price?.toString() || '0')
  const [sortOrder, setSortOrder] = useState(item?.sort_order?.toString() || '0')
  const [categoryId, setCategoryId] = useState(item?.category_id || defaultCategoryId || categories[0]?.id)
  const [imageUrl, setImageUrl] = useState(item?.image_url || '')
  const [available, setAvailable] = useState(item?.available ?? true)
  const [mods, setMods] = useState<ModifierGroup[]>(item?.modifier_groups || [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const adminPin = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('adminPin') || '' : ''

  async function handleImageUpload(file: File) {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', headers: { 'x-admin-pin': adminPin }, body: fd })
    if (res.ok) {
      const { url } = await res.json()
      setImageUrl(url)
    } else showToast('Ошибка загрузки фото', 'error')
    setUploading(false)
  }

  async function handleRemoveImage() {
    if (!imageUrl) return
    await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': adminPin },
      body: JSON.stringify({ url: imageUrl })
    })
    setImageUrl('')
  }

  async function handleSave() {
    if (!name.trim()) { showToast('⚠️ Введите название', 'error'); return }
    setSaving(true)
    const body = {
      name: name.trim(),
      description: desc.trim(),
      price: parseInt(price) || 0,
      sort_order: parseInt(sortOrder) || 0,
      category_id: categoryId,
      image_url: imageUrl || null,
      available,
      modifier_groups: mods,
    }
    const url = item ? `/api/items/${item.id}` : '/api/items'
    const method = item ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': adminPin },
      body: JSON.stringify(body)
    })
    setSaving(false)
    if (res.ok) {
      const saved = await res.json()
      onSave(saved)
    } else showToast('Ошибка сохранения', 'error')
  }

  // Modifier helpers
  function addMod() {
    setMods(m => [...m, { id: Date.now(), name: '', type: 'single', required: false, options: [{ id: Date.now(), name: '', price: 0 }] }])
  }
  function delMod(gi: number) { setMods(m => m.filter((_,i) => i !== gi)) }
  function updateMod(gi: number, key: string, val: unknown) { setMods(m => m.map((g,i) => i === gi ? {...g, [key]: val} : g)) }
  function addOption(gi: number) { setMods(m => m.map((g,i) => i === gi ? {...g, options: [...g.options, {id: Date.now(), name: '', price: 0}]} : g)) }
  function delOption(gi: number, oi: number) { setMods(m => m.map((g,i) => i === gi ? {...g, options: g.options.filter((_,j) => j !== oi)} : g)) }
  function updateOption(gi: number, oi: number, key: string, val: unknown) {
    setMods(m => m.map((g,i) => i === gi ? {...g, options: g.options.map((o,j) => j === oi ? {...o, [key]: val} : o)} : g))
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{item ? 'Редактировать позицию' : 'Новая позиция'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {/* Image */}
          <div className="form-group">
            <label className="form-label">Фотография</label>
            <div className={`img-upload-area${imageUrl ? ' has-img' : ''}`} onClick={() => !imageUrl && fileRef.current?.click()}>
              {imageUrl && <img src={imageUrl} alt="" />}
              <div className="upload-hint">
                {uploading ? <span className="spinner" /> : <>
                  <span className="upload-icon">🖼️</span>
                  <span className="upload-text">{imageUrl ? 'Изменить фото' : 'Нажмите для загрузки'}</span>
                </>}
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
            {imageUrl && <button className="btn btn-secondary" style={{ marginTop: 8, fontSize: 12, padding: '6px 14px' }} onClick={handleRemoveImage}>🗑 Удалить фото</button>}
          </div>

          <div className="form-group">
            <label className="form-label">Название *</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Капучино" />
          </div>

          <div className="form-group">
            <label className="form-label">Описание</label>
            <textarea className="form-textarea" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Нежный кофе с молочной пенкой" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Цена ({currencySymbol})</label>
              <input className="form-input" type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Категория</label>
              <select className="form-select form-input" value={categoryId} onChange={e => setCategoryId(Number(e.target.value))}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Порядок отображения</label>
            <input className="form-input" type="number" min="0" value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="available" checked={available} onChange={e => setAvailable(e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer' }} />
            <label htmlFor="available" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>В наличии</label>
          </div>

          {/* Modifier groups */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="form-label" style={{ margin: 0 }}>Модификаторы</span>
              <button className="btn btn-secondary" style={{ fontSize: 12, padding: '5px 12px' }} onClick={addMod}>+ Группа</button>
            </div>
            {mods.map((group, gi) => (
              <div key={gi} className="mod-editor-group">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <input
                    className="form-input"
                    style={{ flex: 1, padding: '7px 10px', fontSize: 14 }}
                    placeholder="Название группы"
                    value={group.name}
                    onChange={e => updateMod(gi, 'name', e.target.value)}
                  />
                  <div className="mod-type-btns">
                    <button className={`mod-type-btn${group.type === 'single' ? ' active' : ''}`} onClick={() => updateMod(gi, 'type', 'single')}>1</button>
                    <button className={`mod-type-btn${group.type === 'multiple' ? ' active' : ''}`} onClick={() => updateMod(gi, 'type', 'multiple')}>∞</button>
                  </div>
                  <button className={`mod-type-btn${group.required ? ' active' : ''}`} onClick={() => updateMod(gi, 'required', !group.required)}>!</button>
                  <button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 16 }} onClick={() => delMod(gi)}>✕</button>
                </div>
                {group.options.map((opt, oi) => (
                  <div key={oi} className="mod-option-row">
                    <input className="form-input" style={{ flex: 1 }} placeholder="Опция" value={opt.name} onChange={e => updateOption(gi, oi, 'name', e.target.value)} />
                    <input className="form-input price-input" type="number" placeholder="+0₽" value={opt.price} onChange={e => updateOption(gi, oi, 'price', parseInt(e.target.value) || 0)} />
                    <button className="mod-opt-del" onClick={() => delOption(gi, oi)}>✕</button>
                  </div>
                ))}
                <button className="btn btn-secondary" style={{ marginTop: 8, fontSize: 12, padding: '5px 12px' }} onClick={() => addOption(gi)}>+ Опция</button>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" /> : '💾 Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}
