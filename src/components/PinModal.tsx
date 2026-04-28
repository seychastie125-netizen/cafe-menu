'use client'

import { useState } from 'react'

type Props = { onSuccess: () => void; onClose: () => void }

export default function PinModal({ onSuccess, onClose }: Props) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  async function handleDigit(d: string) {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    setError('')
    if (next.length === 4) {
      setTimeout(async () => {
        const res = await fetch('/api/check-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: next })
        })
        if (res.ok) {
          sessionStorage.setItem('adminPin', next)
          onSuccess()
        } else {
          setError('Неверный PIN-код')
          setPin('')
        }
      }, 100)
    }
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 340 }}>
        <div className="modal-header">
          <span className="modal-title">🔐 Введите PIN</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="pin-dots">
            {[0,1,2,3].map(i => <div key={i} className={`pin-dot${i < pin.length ? ' filled' : ''}`} />)}
          </div>
          <div className="pin-error">{error}</div>
          <div className="pin-grid" style={{ marginTop: 16 }}>
            {['1','2','3','4','5','6','7','8','9'].map(d => (
              <button key={d} className="pin-btn" onClick={() => handleDigit(d)}>{d}</button>
            ))}
            <button className="pin-btn" onClick={() => setPin(p => p.slice(0,-1))} style={{ fontSize: 16 }}>⌫</button>
            <button className="pin-btn" onClick={() => handleDigit('0')}>0</button>
            <button className="pin-btn" onClick={onClose} style={{ fontSize: 13, color: 'var(--text-dim)' }}>Отмена</button>
          </div>
        </div>
      </div>
    </div>
  )
}
