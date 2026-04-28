'use client'

import { useState, useEffect } from 'react'

type SettingsState = {
  cafeName: string
  cafeSubtitle: string
  currencySymbol: string
  showUnavailableItems: boolean
}

type Props = {
  settings: SettingsState
  onSave: (settings: SettingsState) => void
  onClose: () => void
  showToast: (msg: string, type?: string) => void
}

export default function SettingsModal({ settings, onSave, onClose, showToast }: Props) {
  const [cafeName, setCafeName] = useState(settings.cafeName)
  const [cafeSubtitle, setCafeSubtitle] = useState(settings.cafeSubtitle)
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol)
  const [showUnavailableItems, setShowUnavailableItems] = useState(settings.showUnavailableItems)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setCafeName(settings.cafeName)
    setCafeSubtitle(settings.cafeSubtitle)
    setCurrencySymbol(settings.currencySymbol)
    setShowUnavailableItems(settings.showUnavailableItems)
  }, [settings])

  function handleSave() {
    if (!cafeName.trim()) {
      showToast('⚠️ Введите название заведения', 'error')
      return
    }

    setSaving(true)
    onSave({
      cafeName: cafeName.trim(),
      cafeSubtitle: cafeSubtitle.trim() || 'Электронное меню',
      currencySymbol: currencySymbol.trim() || '₽',
      showUnavailableItems,
    })
    setSaving(false)
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Настройки сайта</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Название заведения</label>
            <input className="form-input" value={cafeName} onChange={e => setCafeName(e.target.value)} placeholder="Кофейня" />
          </div>
          <div className="form-group">
            <label className="form-label">Подзаголовок</label>
            <input className="form-input" value={cafeSubtitle} onChange={e => setCafeSubtitle(e.target.value)} placeholder="Электронное меню" />
          </div>
          <div className="form-group">
            <label className="form-label">Валюта</label>
            <input className="form-input" value={currencySymbol} onChange={e => setCurrencySymbol(e.target.value)} placeholder="₽" />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              id="show-unavailable"
              type="checkbox"
              checked={showUnavailableItems}
              onChange={e => setShowUnavailableItems(e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            <label htmlFor="show-unavailable" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
              Показывать отсутствующие блюда
            </label>
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
