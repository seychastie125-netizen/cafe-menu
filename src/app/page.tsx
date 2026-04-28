'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase, type Category, type Item } from '@/lib/supabase'
import DetailModal from '@/components/DetailModal'
import PinModal from '@/components/PinModal'
import ItemModal from '@/components/ItemModal'
import CategoryModal from '@/components/CategoryModal'
import SettingsModal from '@/components/SettingsModal'
import ConfirmModal from '@/components/ConfirmModal'
import Toast from '@/components/Toast'

const FOOD_EMOJIS = ['☕','🍵','🥤','🍰','🥐','🍳','🍽️','🧁','🍹','🍴','🍕','🍔','🍟','🌭','🥗','🍩','🍪','🍦','🥪','🌮']

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [currentCategory, setCurrentCategory] = useState<number | null>(null)
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [detailItem, setDetailItem] = useState<Item | null>(null)
  const [editItem, setEditItem] = useState<Item | null | undefined>(undefined) // undefined = closed
  const [showPin, setShowPin] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Item | null>(null)
  const [toast, setToast] = useState<{msg: string; type?: string} | null>(null)
  const [scrollTop, setScrollTop] = useState(false)
  const [settings, setSettings] = useState({
    cafeName: 'Кофейня',
    cafeSubtitle: 'Электронное меню',
    currencySymbol: '₽',
    showUnavailableItems: true,
  })
  const [cupEmoji, setCupEmoji] = useState('☕')
  const [cupAnimating, setCupAnimating] = useState(false)
  const [loading, setLoading] = useState(true)
  const mainRef = useRef<HTMLDivElement>(null)

  const showToast = useCallback((msg: string, type?: string) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }, [])

  // Загрузка данных
  const loadData = useCallback(async () => {
    const [{ data: cats }, { data: its }] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('items').select('*').order('sort_order'),
    ])
    setCategories(cats || [])
    setItems(its || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('siteSettings') : null
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch {
        // ignore invalid data
      }
    }
  }, [])

  const saveSettings = (next: typeof settings) => {
    setSettings(next)
    window.localStorage.setItem('siteSettings', JSON.stringify(next))
    setShowSettings(false)
    showToast('✅ Настройки сайта сохранены', 'success')
  }

  // Анимация эмодзи в хедере
  useEffect(() => {
    let idx = 0
    const interval = setInterval(() => {
      setCupAnimating(true)
      setTimeout(() => {
        idx = (idx + 1) % FOOD_EMOJIS.length
        setCupEmoji(FOOD_EMOJIS[idx])
        setCupAnimating(false)
      }, 300)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const filteredItems = items
    .filter(i => currentCategory === null || i.category_id === currentCategory)
    .filter(i => settings.showUnavailableItems || i.available)

  const handleDeleteItem = async () => {
    if (!confirmDelete) return
    const res = await fetch(`/api/items/${confirmDelete.id}`, {
      method: 'DELETE',
      headers: { 'x-admin-pin': sessionStorage.getItem('adminPin') || '' }
    })
    if (res.ok) {
      setItems(prev => prev.filter(i => i.id !== confirmDelete.id))
      showToast('🗑️ Позиция удалена')
    } else showToast('Ошибка удаления', 'error')
    setConfirmDelete(null)
  }

  const handleSaveItem = (item: Item) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === item.id)
      const next = idx >= 0 ? [...prev.slice(0, idx), item, ...prev.slice(idx + 1)] : [...prev, item]
      return next.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    })
    setEditItem(undefined)
    showToast('✅ Сохранено')
  }

  const handleSaveCategories = (cats: Category[]) => {
    setCategories(cats)
    setShowCatModal(false)
    showToast('✅ Категории сохранены')
  }

  function requestEditMode() {
    if (mode === 'edit') { setMode('view'); return }
    setShowPin(true)
  }

  function onPinSuccess() {
    setShowPin(false)
    setMode('edit')
    showToast('✏️ Режим редактирования включён', 'success')
  }

  const catIcon = (id: number) => categories.find(c => c.id === id)?.icon || '🍽️'

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="header-logo">
          <span id="header-cup" className={`cup${cupAnimating ? ' animating' : ''}`}>{cupEmoji}</span>
          <div>
            <div className="name">{settings.cafeName}</div>
            <div className="sub">{settings.cafeSubtitle}</div>
          </div>
        </div>
        <div className="header-actions">
          <span className={`mode-badge ${mode}`}>{mode === 'edit' ? 'Редактор' : 'Просмотр'}</span>
          <button className={`btn-mode${mode === 'view' ? ' active' : ''}`} onClick={() => mode !== 'view' && setMode('view')}>
            <span>👁</span> Меню
          </button>
          <button className={`btn-mode${mode === 'edit' ? ' active' : ''}`} onClick={requestEditMode}>
            <span>✏️</span> Редактор
          </button>
          {mode === 'edit' && (
            <button className="btn-mode" onClick={() => setShowSettings(true)}>
              <span>⚙</span> Настройки
            </button>
          )}
        </div>
      </header>

      {/* TABS */}
      <div className="tabs-wrap">
        <div className="tabs">
          <button className={`tab${currentCategory === null ? ' active' : ''}`} onClick={() => setCurrentCategory(null)}>
            ✨ Всё меню
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`tab${currentCategory === cat.id ? ' active' : ''}`}
              onClick={() => setCurrentCategory(cat.id)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
          {mode === 'edit' && (
            <button className="tab-add-btn" onClick={() => setShowCatModal(true)} title="Управление категориями">⚙</button>
          )}
        </div>
      </div>

      {/* MAIN */}
      <main
        className="main"
        ref={mainRef}
        id="main-content"
        onScroll={e => setScrollTop((e.target as HTMLDivElement).scrollTop > 200)}
      >
        {loading ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : (
          <div className={`menu-grid${mode === 'edit' ? '' : ''}`}>
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`menu-card${mode === 'edit' ? ' edit-mode' : ''}`}
                onClick={() => mode !== 'edit' && setDetailItem(item)}
              >
                {item.image_url
                  ? <img className="card-img" src={item.image_url} alt={item.name} loading="lazy" />
                  : <div className="card-img-placeholder">{catIcon(item.category_id)}</div>
                }
                {!item.available && <span className="unavailable-badge">Нет в наличии</span>}
                {mode === 'edit' && (
                  <div className="card-edit-actions">
                    <button className="card-edit-btn btn-edit-item" onClick={e => { e.stopPropagation(); setEditItem(item) }}>✏</button>
                    <button className="card-edit-btn btn-delete-item" onClick={e => { e.stopPropagation(); setConfirmDelete(item) }}>✕</button>
                  </div>
                )}
                <div className="card-body">
                  <div className="card-title">{item.name}</div>
                  <div className="card-desc">{item.description}</div>
                  <div className="card-price">{item.price}<span>{settings.currencySymbol}</span></div>
                </div>
              </div>
            ))}

            {mode === 'edit' && (
              <div className="card-add" onClick={() => setEditItem(null)}>
                <span className="plus">+</span>
                <span className="label">Добавить позицию</span>
              </div>
            )}

            {filteredItems.length === 0 && mode !== 'edit' && (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <div className="emoji">☕</div>
                <p>В этой категории пока нет позиций</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* SCROLL TO TOP */}
      <button className={`scroll-top-btn${scrollTop ? ' visible' : ''}`} onClick={() => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>

      {/* MODALS */}
      {detailItem && <DetailModal item={detailItem} catIcon={catIcon(detailItem.category_id)} currencySymbol={settings.currencySymbol} onClose={() => setDetailItem(null)} />}
      {showPin && <PinModal onSuccess={onPinSuccess} onClose={() => setShowPin(false)} />}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={saveSettings}
          onClose={() => setShowSettings(false)}
          showToast={showToast}
        />
      )}
      {editItem !== undefined && (
        <ItemModal
          item={editItem}
          categories={categories}
          defaultCategoryId={currentCategory ?? undefined}
          onSave={handleSaveItem}
          onClose={() => setEditItem(undefined)}
          showToast={showToast}
          currencySymbol={settings.currencySymbol}
        />
      )}
      {showCatModal && (
        <CategoryModal
          categories={categories}
          onSave={handleSaveCategories}
          onClose={() => setShowCatModal(false)}
          showToast={showToast}
        />
      )}
      {confirmDelete && (
        <ConfirmModal
          text={`Удалить «${confirmDelete.name}»?`}
          sub="Это действие нельзя отменить"
          onOk={handleDeleteItem}
          onClose={() => setConfirmDelete(null)}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  )
}
