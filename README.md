# ☕ Кофейное меню

Электронное меню для кофейни на **Next.js 14** + **Supabase** + **Vercel**.

## Стек

| Слой | Технология |
|------|-----------|
| Frontend | Next.js 14 (App Router, React) |
| Backend | Next.js API Routes |
| База данных | Supabase (PostgreSQL) |
| Хранилище фото | Supabase Storage |
| Деплой | Vercel |

---

## Быстрый старт

### 1. Supabase

1. Зайти на [supabase.com](https://supabase.com) → создать проект
2. В SQL Editor выполнить файл `supabase-migration.sql`
3. Storage → New bucket → `photos` → **Public**
4. Скопировать из Settings → API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (secret!)

### 2. Локальный запуск

```bash
# Клонировать / распаковать проект
cd cafe-menu

# Установить зависимости
npm install

# Создать файл .env.local
cp .env.example .env.local
# Заполнить переменные

# Запустить
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000)

### 3. Деплой на Vercel

```bash
npm i -g vercel
vercel
```

Или через GitHub:
1. Загрузить проект на GitHub
2. Vercel → Import Project → выбрать репозиторий
3. В разделе Environment Variables добавить все переменные из `.env.example`
4. Deploy!

---

## Переменные окружения

| Переменная | Описание |
|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL проекта Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Публичный ключ Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Секретный ключ (только сервер) |
| `ADMIN_PIN` | 4-значный PIN для режима редактора |

---

## Структура проекта

```
cafe-menu/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── items/route.ts          # GET, POST
│   │   │   ├── items/[id]/route.ts     # PATCH, DELETE
│   │   │   ├── categories/route.ts     # GET, POST, PUT
│   │   │   ├── upload/route.ts         # POST (фото), DELETE
│   │   │   └── check-pin/route.ts      # POST (авторизация)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                    # Главная страница меню
│   ├── components/
│   │   ├── DetailModal.tsx             # Просмотр позиции + модификаторы
│   │   ├── ItemModal.tsx               # Редактор позиции
│   │   ├── CategoryModal.tsx           # Управление категориями
│   │   ├── PinModal.tsx                # PIN-авторизация
│   │   ├── ConfirmModal.tsx            # Подтверждение удаления
│   │   └── Toast.tsx                   # Уведомления
│   └── lib/
│       └── supabase.ts                 # Клиент + типы
├── public/
│   ├── manifest.json                   # PWA манифест
│   └── sw.js                           # Service Worker
├── supabase-migration.sql              # SQL миграция
├── .env.example
└── next.config.js
```

---

## Использование

### Режим просмотра (гости)
- Видят меню по категориям
- Открывают позицию, выбирают модификаторы
- Видят итоговую цену

### Режим редактора (персонал)
1. Нажать кнопку **✏️ Редактор**
2. Ввести PIN-код (по умолчанию `1234`)
3. Добавлять/редактировать/удалять позиции
4. Загружать фото (до 5 МБ)
5. Управлять категориями (⚙ в табах)

---

## Безопасность

- Все write-операции проверяют `x-admin-pin` заголовок
- Supabase RLS: публичное чтение, запись только через service_role
- Service Role Key никогда не попадает в браузер
- Фото хранятся в Supabase Storage с публичным чтением

---

## Дополнительно

- **PWA** — устанавливается на телефон как приложение
- **Оффлайн** — базовая страница доступна без интернета (Service Worker)
- **Next.js Image** — оптимизация фото через CDN Vercel
