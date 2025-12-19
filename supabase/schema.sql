-- ============================================
-- RATERY — Supabase Database Schema
-- ============================================
-- Запустите этот SQL в Supabase SQL Editor
-- ============================================

-- Включаем необходимые расширения
create extension if not exists "uuid-ossp";

-- ============================================
-- ТАБЛИЦЫ
-- ============================================

-- Пользователи
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text,
  birth_year int,
  gender text check (gender in ('male', 'female', 'other')),
  country text,
  language text default 'ru',
  is_onboarded boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Фотографии
create table if not exists public.photos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  url text not null,
  thumbnail_url text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  is_active boolean default false,
  created_at timestamp with time zone default now()
);

-- Оценки
create table if not exists public.ratings (
  id uuid primary key default uuid_generate_v4(),
  rater_id uuid references public.users(id) on delete cascade not null,
  rated_id uuid references public.users(id) on delete cascade not null,
  photo_id uuid references public.photos(id) on delete cascade not null,
  score decimal(4,2) not null check (score >= 1 and score <= 10),
  rater_power decimal(4,2) default 1.0,
  view_duration_ms int,
  is_counted boolean default true,
  created_at timestamp with time zone default now(),
  
  -- Один пользователь может оценить одно фото один раз
  unique(rater_id, photo_id)
);

-- Статистика рейтинга (агрегированные данные)
create table if not exists public.rating_stats (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade unique not null,
  current_rating decimal(4,2),
  rating_7d_ago decimal(4,2),
  rating_30d_ago decimal(4,2),
  percentile decimal(5,2),
  ratings_received_count int default 0,
  ratings_given_count int default 0,
  rating_power decimal(4,2) default 1.0,
  is_rating_visible boolean default false,
  updated_at timestamp with time zone default now()
);

-- Очередь на оценку
create table if not exists public.rating_queue (
  id uuid primary key default uuid_generate_v4(),
  target_user_id uuid references public.users(id) on delete cascade not null,
  rater_user_id uuid references public.users(id) on delete cascade not null,
  photo_id uuid references public.photos(id) on delete cascade not null,
  priority int default 0,
  is_shown boolean default false,
  is_rated boolean default false,
  is_skipped boolean default false,
  created_at timestamp with time zone default now(),
  
  -- Уникальная пара target-rater
  unique(target_user_id, rater_user_id)
);

-- История рейтинга (для графиков)
create table if not exists public.rating_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  rating decimal(4,2),
  percentile decimal(5,2),
  ratings_count int default 0,
  recorded_date date not null,
  created_at timestamp with time zone default now(),
  
  unique(user_id, recorded_date)
);

-- ============================================
-- ИНДЕКСЫ
-- ============================================

create index if not exists idx_photos_user_id on public.photos(user_id);
create index if not exists idx_photos_active on public.photos(user_id, is_active) where is_active = true;
create index if not exists idx_ratings_rater on public.ratings(rater_id);
create index if not exists idx_ratings_rated on public.ratings(rated_id);
create index if not exists idx_rating_queue_rater on public.rating_queue(rater_user_id, is_shown, is_rated);
create index if not exists idx_rating_stats_user on public.rating_stats(user_id);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

-- Включаем RLS
alter table public.users enable row level security;
alter table public.photos enable row level security;
alter table public.ratings enable row level security;
alter table public.rating_stats enable row level security;
alter table public.rating_queue enable row level security;
alter table public.rating_history enable row level security;

-- Политики для users
create policy "Users can view own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own data" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert own data" on public.users
  for insert with check (auth.uid() = id);

-- Политики для photos
create policy "Anyone can view approved photos" on public.photos
  for select using (status = 'approved' or user_id = auth.uid());

create policy "Users can insert own photos" on public.photos
  for insert with check (auth.uid() = user_id);

create policy "Users can update own photos" on public.photos
  for update using (auth.uid() = user_id);

-- Политики для ratings
create policy "Users can view ratings they gave or received" on public.ratings
  for select using (auth.uid() = rater_id or auth.uid() = rated_id);

create policy "Users can insert ratings" on public.ratings
  for insert with check (auth.uid() = rater_id);

-- Политики для rating_stats
create policy "Users can view own stats" on public.rating_stats
  for select using (auth.uid() = user_id);

create policy "Service can manage stats" on public.rating_stats
  for all using (true);

-- Политики для rating_queue
create policy "Users can view own queue" on public.rating_queue
  for select using (auth.uid() = rater_user_id);

create policy "Service can manage queue" on public.rating_queue
  for all using (true);

-- Политики для rating_history
create policy "Users can view own history" on public.rating_history
  for select using (auth.uid() = user_id);

-- ============================================
-- ФУНКЦИИ
-- ============================================

-- Функция инкремента поставленных оценок
create or replace function public.increment_ratings_given(user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.rating_stats
  set 
    ratings_given_count = ratings_given_count + 1,
    updated_at = now()
  where rating_stats.user_id = increment_ratings_given.user_id;
end;
$$;

-- Функция пересчёта рейтинга пользователя
create or replace function public.recalculate_user_rating(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_weighted_sum decimal;
  v_weight_sum decimal;
  v_new_rating decimal;
  v_count int;
begin
  -- Считаем взвешенное среднее
  select 
    sum(score * rater_power),
    sum(rater_power),
    count(*)
  into v_weighted_sum, v_weight_sum, v_count
  from public.ratings
  where rated_id = p_user_id and is_counted = true;
  
  -- Рассчитываем рейтинг
  if v_weight_sum > 0 then
    v_new_rating := round((v_weighted_sum / v_weight_sum)::numeric, 2);
  else
    v_new_rating := null;
  end if;
  
  -- Обновляем статистику
  update public.rating_stats
  set 
    current_rating = v_new_rating,
    ratings_received_count = v_count,
    is_rating_visible = (v_count >= 20),
    updated_at = now()
  where user_id = p_user_id;
end;
$$;

-- Триггер автоматического пересчёта рейтинга
create or replace function public.trigger_recalculate_rating()
returns trigger
language plpgsql
security definer
as $$
begin
  perform public.recalculate_user_rating(NEW.rated_id);
  return NEW;
end;
$$;

create trigger on_rating_insert
  after insert on public.ratings
  for each row
  execute function public.trigger_recalculate_rating();

-- Триггер создания rating_stats для нового пользователя
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.rating_stats (user_id, rating_power)
  values (NEW.id, 1.0);
  return NEW;
end;
$$;

create trigger on_user_created
  after insert on public.users
  for each row
  execute function public.handle_new_user();

-- ============================================
-- STORAGE
-- ============================================

-- Создаём bucket для фото (выполнить в Supabase Dashboard → Storage)
-- insert into storage.buckets (id, name, public) values ('photos', 'photos', true);

-- Политика для storage
-- create policy "Anyone can view photos" on storage.objects for select using (bucket_id = 'photos');
-- create policy "Authenticated users can upload photos" on storage.objects for insert with check (bucket_id = 'photos' and auth.role() = 'authenticated');
-- create policy "Users can delete own photos" on storage.objects for delete using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);
