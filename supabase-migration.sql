-- =============================================
-- Кофейное меню — SQL миграция для Supabase
-- Выполнить в Supabase SQL Editor
-- =============================================

-- Таблица категорий
create table if not exists categories (
  id          serial primary key,
  name        text not null unique,
  icon        text not null default '📋',
  sort_order  int  not null default 0,
  created_at  timestamptz default now()
);

-- Таблица позиций меню
create table if not exists items (
  id               serial primary key,
  name             text    not null,
  description      text    not null default '',
  price            int     not null default 0,
  category_id      int     not null references categories(id) on delete cascade,
  image_url        text,
  available        boolean not null default true,
  sort_order       int     not null default 0,
  modifier_groups  jsonb   not null default '[]'::jsonb,
  created_at       timestamptz default now()
);

-- Индексы для быстрой фильтрации
create index if not exists idx_items_category on items(category_id);
create index if not exists idx_items_available on items(available);

-- Row Level Security
alter table categories enable row level security;
alter table items enable row level security;

-- Публичное чтение (гости видят меню)
create policy "Public can read categories"
  on categories for select using (true);

create policy "Public can read available items"
  on items for select using (available = true);

-- Запись только через Service Role (API Routes)
-- Service Role обходит RLS автоматически

-- =============================================
-- Storage bucket для фотографий
-- =============================================

-- Создать bucket (или через Dashboard: Storage → New bucket → photos → Public)
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Публичное чтение файлов
create policy "Public can view photos"
  on storage.objects for select
  using (bucket_id = 'photos');

-- Загрузка только через API (service role)
-- Настроить в Dashboard: Storage → photos → Policies

-- =============================================
-- Начальные данные
-- =============================================

insert into categories (name, icon, sort_order) values
  ('Кофе',     '☕', 1),
  ('Чай',      '🍵', 2),
  ('Напитки',  '🥤', 3),
  ('Выпечка',  '🥐', 4),
  ('Десерты',  '🍰', 5)
on conflict (name) do nothing;
