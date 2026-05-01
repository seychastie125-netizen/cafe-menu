'use client'

import { useState } from 'react'
import type { Item, ModifierGroup } from '@/lib/supabase'

type Props = {
  item: Item
  catIcon: string
  currencySymbol: string
  onClose: () => void
}

export default function DetailModal({ item, catIcon, currencySymbol, onClose }: Props) {
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number[]>>({})

  const groups: ModifierGroup[] = item.modifier_groups || []

  const totalPrice = groups.reduce((acc, group, gi) => {
    const sel = selectedOptions[gi] || (group.type === 'single' ? [0] : [])
    return acc + sel.reduce((s, oi) => s + (group.options[oi]?.price || 0), 0)
  }, item.price)

  function chipToggle(gi: number, oi: number, type: string) {
    setSelectedOptions(prev => {
      const cur = prev[gi] ?? (type === 'single' ? [0] : [])
      if (type === 'single') return { ...prev, [gi]: [oi] }
      const has = cur.includes(oi)
      return { ...prev, [gi]: has ? cur.filter(x => x !== oi) : [...cur, oi] }
    })
  }

  const [zoomed, setZoomed] = useState(false)

  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 700 }}>
        <div className="modal-header">
          <span className="modal-title">{item.name}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ padding: 0 }}>
          {item.image_url
            ? <img
                src={item.image_url}
                alt={item.name}
                className={`detail-image${zoomed ? ' zoomed' : ''}`}
                onClick={() => setZoomed(prev => !prev)}
                style={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }}
              />
            : <div style={{ width: '100%', height: 200, background: 'var(--card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>{catIcon}</div>
          }
          <div style={{ padding: '20px 24px' }}>
            {item.description && <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>{item.description}</p>}
            {groups.map((group, gi) => {
              const sel = selectedOptions[gi] ?? (group.type === 'single' ? [0] : [])
              return (
                <div key={gi} className="mod-group">
                  <div className="mod-group-label">
                    {group.name}
                    {group.required && <span className="req-badge">обязательно</span>}
                  </div>
                  <div className="mod-chips">
                    {group.options.map((opt, oi) => (
                      <div
                        key={oi}
                        className={`mod-chip${sel.includes(oi) ? ' selected' : ''}`}
                        onClick={() => chipToggle(gi, oi, group.type)}
                      >
                        {opt.name}
                        {opt.price !== 0 && <span className="chip-price">{opt.price > 0 ? '+' : ''}{opt.price}{currencySymbol}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            <div className="detail-price">{totalPrice}<span>{currencySymbol}</span></div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  )
}
