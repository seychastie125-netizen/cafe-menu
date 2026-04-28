// ConfirmModal
'use client'

type ConfirmProps = { text: string; sub?: string; onOk: () => void; onClose: () => void }

export function ConfirmModal({ text, sub, onOk, onClose }: ConfirmProps) {
  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 360 }}>
        <div className="modal-header">
          <span className="modal-title">Подтверждение</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 16, color: 'var(--text)' }}>{text}</p>
          {sub && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>{sub}</p>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
          <button className="btn btn-danger" onClick={onOk}>Удалить</button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
