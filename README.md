# RATERY Web

> Узнай, сколько ты стоишь в глазах мира.

Веб-версия приложения Ratery — системы рейтинга внешности.

## 🚀 Стек

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Hosting**: Vercel
- **State**: Zustand

## ⚡ Быстрый старт

### 1. Клонируйте репозиторий

```bash
git clone https://github.com/your-username/ratery-web.git
cd ratery-web
```

### 2. Создайте проект в Supabase

1. Перейдите на [supabase.com](https://supabase.com) и создайте новый проект
2. Дождитесь инициализации (~2 минуты)
3. Скопируйте **Project URL** и **anon public key** из Settings → API

### 3. Настройте базу данных

1. В Supabase откройте **SQL Editor**
2. Скопируйте содержимое `supabase/schema.sql`
3. Выполните SQL

### 4. Настройте Storage

1. В Supabase откройте **Storage**
2. Создайте bucket с именем `photos`
3. Сделайте его публичным (Public bucket)

### 5. Настройте OAuth

1. В Supabase откройте **Authentication → Providers**
2. Включите **Google** provider
3. Следуйте инструкциям для настройки Google OAuth

### 6. Настройте переменные окружения

```bash
cp .env.example .env.local
```

Заполните `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 7. Запустите локально

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## 🌐 Деплой на Vercel

### Автоматический (рекомендуется)

1. Push в GitHub
2. Импортируйте проект в [Vercel](https://vercel.com/new)
3. Добавьте переменные окружения
4. Deploy!

### Ручной

```bash
npm install -g vercel
vercel
```

## 📁 Структура проекта

```
ratery-web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Главная (редирект)
│   │   ├── onboarding/        # Онбординг
│   │   ├── auth/              # Авторизация
│   │   ├── upload/            # Загрузка фото
│   │   ├── rate/              # Оценка пользователей
│   │   └── profile/           # Профиль
│   │
│   ├── components/            # React компоненты
│   │   ├── ui/               # Базовые UI компоненты
│   │   ├── rating/           # Компоненты оценки
│   │   ├── profile/          # Компоненты профиля
│   │   └── onboarding/       # Компоненты онбординга
│   │
│   ├── lib/                   # Утилиты и клиенты
│   │   ├── supabase/         # Supabase клиенты
│   │   └── utils.ts          # Хелперы
│   │
│   ├── stores/               # Zustand stores
│   └── types/                # TypeScript типы
│
├── supabase/
│   └── schema.sql            # SQL схема базы данных
│
├── public/                   # Статические файлы
└── tailwind.config.ts       # Конфигурация Tailwind
```

## 🎨 Дизайн-система

### Цвета

```css
background: #0A0A0B     /* Основной фон */
surface: #111113        /* Поверхности */
surface-elevated: #18181B
text-primary: #FAFAFA
text-secondary: #A1A1AA
text-tertiary: #52525B
```

### Типографика

- **Display**: 3rem - 4.5rem, weight 600
- **Heading**: 1.125rem - 1.5rem, weight 500
- **Body**: 0.875rem - 1.125rem
- **Rating**: 2.5rem - 7rem, monospace

### Анимации

Используем Framer Motion с настройками:
- **Ease**: `[0.16, 1, 0.3, 1]` (ease-out-expo)
- **Duration**: 300-500ms для переходов
- **Spring**: stiffness 300, damping 30

## 📊 Формулы

### Рейтинг пользователя

```
rating = Σ(score × raterPower) / Σ(raterPower)
```

### Rating Power

```
RP = consistency × activity × credibility × anti_bias
```

## 🔒 Безопасность

- Row Level Security (RLS) в Supabase
- OAuth авторизация через Google
- Валидация на клиенте и сервере
- HTTPS everywhere

## 📱 Адаптивность

- Mobile-first дизайн
- PWA-ready
- Safe area insets для iPhone
- Touch-оптимизированные элементы

## 🚧 TODO

- [ ] Push уведомления
- [ ] PWA manifest
- [ ] Темная/светлая тема
- [ ] Локализация (en/es)
- [ ] Rate limiting
- [ ] Модерация фото (ML)

## 📄 Лицензия

MIT
