'use client'
// @ts-nocheck

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BottomNav } from '@/components/ui/BottomNav'
import { ShareButton } from '@/components/ui/ShareButton'
import { toast } from 'sonner'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [photo, setPhoto] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth')
          return
        }
        
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <BottomNav />
      </div>
    )
  }
  
  const rating = stats?.current_rating
  const percentile = stats?.percentile
  const isVisible = stats?.is_rating_visible
  const ratingsCount = stats?.ratings_received_count || 0
  const minRatings = 20
  
  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <h1 className="text-xl font-semibold text-white">Профиль</h1>
        <button
          onClick={handleLogout}
          className="text-red-500 text-sm hover:text-red-400 transition-colors"
        >
          Выйти
        </button>
      </header>
      
      {/* Profile content */}
      <div className="px-6 space-y-8">
        {/* Photo & Rating */}
        <div className="text-center">
          {/* Photo */}
          <motion.div
            className="relative w-32 h-32 mx-auto mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {photo ? (
              <img
                src={photo.url}
                alt="Profile"
                className="w-full h-full object-cover rounded-full ring-4 ring-white/20"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-12 h-12 text-white/40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
          </motion.div>
          
          {/* Rating */}
          {isVisible && rating ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-7xl font-mono font-bold text-white mb-2 tabular-nums">
                {rating.toFixed(2)}
              </div>
              {percentile && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  <span className="text-lg">🏆</span>
                  <span className="text-white/80">Top {percentile.toFixed(0)}%</span>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              className="bg-white/5 rounded-3xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-4xl mb-4">⏳</div>
              <h3 className="text-lg font-medium text-white mb-2">
                Недостаточно оценок
              </h3>
              <p className="text-white/60 text-sm mb-4">
                {ratingsCount} из {minRatings}
              </p>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (ratingsCount / minRatings) * 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <p className="text-white/40 text-xs mt-4">
                Оценивай других, чтобы получать оценки быстрее
              </p>
            </motion.div>
          )}
        </div>
        
        {/* Stats */}
        <motion.div
          className="grid grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <div className="text-2xl font-mono font-bold text-white">
              {ratingsCount}
            </div>
            <div className="text-white/40 text-xs mt-1">Получено</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <div className="text-2xl font-mono font-bold text-white">
              {stats?.ratings_given_count || 0}
            </div>
            <div className="text-white/40 text-xs mt-1">Поставлено</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <div className="text-2xl font-mono font-bold text-white">
              {stats?.rating_power?.toFixed(1) || '1.0'}×
            </div>
            <div className="text-white/40 text-xs mt-1">Вес голоса</div>
          </div>
        </motion.div>
        
        {/* Share button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ShareButton rating={rating} percentile={percentile} />
        </motion.div>
        
        {/* Change photo */}
        <motion.button
          onClick={() => router.push('/upload')}
          className="w-full py-4 border border-white/20 hover:border-white/40 rounded-2xl text-white/60 hover:text-white transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Сменить фото
        </motion.button>
      </div>
      
      <BottomNav />
    </div>
  )
}
