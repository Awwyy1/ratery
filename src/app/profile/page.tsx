'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ProfileHeader, StatsCard, LogoutButton } from '@/components/profile/ProfileComponents'
import { toast } from 'sonner'
import type { Photo, RatingStats } from '@/types/database'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [stats, setStats] = useState<RatingStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth')
          return
        }
        
        // Загружаем фото и статистику параллельно
        const [photoResult, statsResult] = await Promise.all([
          supabase
            .from('photos')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single(),
          supabase
            .from('rating_stats')
            .select('*')
            .eq('user_id', user.id)
            .single(),
        ])
        
        setPhoto(photoResult.data)
        setStats(statsResult.data)
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProfile()
  }, [supabase, router])
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Вы вышли из аккаунта')
    router.push('/auth')
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-white/20 border-t-white animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-lg mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-heading-md text-text-primary">Профиль</h1>
          <LogoutButton onLogout={handleLogout} />
        </div>
      </header>
      
      {/* Content */}
      <main className="max-w-lg mx-auto px-6 py-8 space-y-8">
        {/* Profile header with rating */}
        <ProfileHeader photo={photo} stats={stats} />
        
        {/* Stats card */}
        <StatsCard stats={stats} />
        
        {/* Navigation */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            href="/rate"
            className="card-interactive flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-elevated flex items-center justify-center">
                <svg className="w-6 h-6 text-text-secondary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              </div>
              <div>
                <p className="text-body-md text-text-primary">Оценить</p>
                <p className="text-caption text-text-tertiary">Оценивай других пользователей</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
          
          <Link
            href="/upload"
            className="card-interactive flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-elevated flex items-center justify-center">
                <svg className="w-6 h-6 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <div>
                <p className="text-body-md text-text-primary">Сменить фото</p>
                <p className="text-caption text-text-tertiary">Загрузить новое фото профиля</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </motion.div>
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border safe-bottom">
        <div className="max-w-lg mx-auto px-6 h-16 flex items-center justify-around">
          <Link
            href="/rate"
            className="flex flex-col items-center gap-1 text-text-tertiary hover:text-text-primary transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            <span className="text-caption">Оценить</span>
          </Link>
          
          <Link
            href="/profile"
            className="flex flex-col items-center gap-1 text-text-primary"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span className="text-caption">Профиль</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
