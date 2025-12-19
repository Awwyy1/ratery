import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ratery — Узнай свой рейтинг',
  description: 'Загрузи фото и узнай, как тебя видит мир. Честная оценка от реальных людей.',
  keywords: ['рейтинг', 'оценка внешности', 'фото', 'rating'],
  authors: [{ name: 'Ratery' }],
  openGraph: {
    title: 'Ratery — Узнай свой рейтинг',
    description: 'Загрузи фото и узнай, как тебя видит мир.',
    type: 'website',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ratery',
    description: 'Узнай свой рейтинг',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A0A0B',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="ru" 
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background antialiased">
        {/* Шумовая текстура для премиального ощущения */}
        <div className="noise-overlay" aria-hidden="true" />
        
        {/* Основной контент */}
        <main className="relative">
          {children}
        </main>

        {/* Уведомления */}
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#18181B',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: '#FAFAFA',
            },
          }}
        />
      </body>
    </html>
  )
}
