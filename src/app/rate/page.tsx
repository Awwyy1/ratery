'use client'
// @ts-nocheck

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { BottomNav } from '@/components/ui/BottomNav'
import { toast } from 'sonner'

interface RatingTarget {
  queueId: string
  photoId: string
  photoUrl: string
  targetUserId: string
}

export default function RatePage() {
  const [target, setTarget] = useState<RatingTarget | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [noMoreTargets, setNoMoreTargets] = useState(false)
  const [score, setScore] = useState(5.5)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const viewStartTime = useRef(Date.now())
  
  const supabase = createClient()
  
  const loadNextTarget = useCallback(async () => {
    setIsLoading(true)
    setNoMoreTargets(false)
    setScore(5.5)
    viewStartTime.current = Date.now()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      // Получаем фото для оценки (исключая своё)
      const { data: photos } = await supabase
        .from('photos')
        .select('id, user_id, url')
        .eq('is_active', true)
        .eq('status', 'approved')
        .neq('user_id', user.id)
        .limit(20)
      
      if (!photos || photos.length === 0) {
        setNoMoreTargets(true)
        setIsLoading(false)
        return
      }
      
      // Получаем уже оценённые
      const { data: rated } = await supabase
        .from('ratings')
        .select('photo_id')
        .eq('rater_id', user.id)
      
      const ratedIds = rated?.map(r => r.photo_id) || []
      
      // Фильтруем
      const available = photos.filter(p => !ratedIds.includes(p.id))
      
      if (available.length === 0) {
        setNoMoreTargets(true)
        setIsLoading(false)
        return
      }
      
      const photo = available[0]
      setTarget({
        queueId: photo.id,
        photoId: photo.id,
        photoUrl: photo.url,
        targetUserId: photo.user_id,
      })
    } catch (error) {
      console.error('Error:', error)
      setNoMoreTargets(true)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])
  
  const handleSubmit = async () => {
    if (!target || isSubmitting) return
    setIsSubmitting(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const viewDuration = Date.now() - viewStartTime.current
      
      await supabase.from('ratings').insert([{
        rater_id: user.id,
        rated_id: target.targetUserId,
        photo_id: target.photoId,
        score: score,
        rater_power: 1.0,
        view_duration_ms: viewDuration,
        is_counted: true,
      }])
      
      setTarget(null)
      await loadNextTarget()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Ошибка сохранения')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleSkip = async () => {
    setTarget(null)
    await loadNextTarget()
  }
  
  useEffect(() => {
    loadNextTarget()
  }, [loadNextTarget])
  
  // Loading
  if (isLoading && !target) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <BottomNav />
      </div>
    )
  }
  
  // No more targets
  if (noMoreTargets) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 pb-24">
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">✨</span>
        </div>
        <h1 className="text-2xl font-semibold text-white mb-3">На сегодня всё!</h1>
        <p className="text-white/60 text-center mb-8">
          Ты оценил всех доступных пользователей.<br/>
          Возвращайся позже — появятся новые.
        </p>
        <button
          onClick={loadNextTarget}
          className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
        >
          Обновить
        </button>
        <BottomNav />
      </div>
    )
  }
  
  // Rating screen
  return (
    <div className="min-h-screen bg-black flex flex-col pb-20">
      {/* Photo */}
      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {target && (
            <motion.div
              key={target.photoId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden bg-white/10"
            >
              <img
                src={target.photoUrl}
                alt="Rate this"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x500?text=Photo'
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Rating controls */}
      <div className="px-6 pb-6 space-y-6">
        {/* Score display */}
        <div className="text-center">
          <span className="text-6xl font-mono font-bold text-white tabular-nums">
            {score.toFixed(2)}
          </span>
        </div>
        
        {/* Slider */}
        <div className="relative">
          <input
            type="range"
            min="1"
            max="10"
            step="0.01"
            value={score}
            onChange={(e) => setScore(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-8
                       [&::-webkit-slider-thumb]:h-8
                       [&::-webkit-slider-thumb]:bg-white
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:shadow-lg
                       [&::-webkit-slider-thumb]:cursor-grab
                       [&::-webkit-slider-thumb]:active:cursor-grabbing"
          />
          <div className="flex justify-between mt-2 text-white/40 text-sm">
            <span>1</span>
            <span>10</span>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white font-medium transition-colors"
          >
            Пропустить
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-[2] py-4 bg-white hover:bg-white/90 rounded-2xl text-black font-semibold transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Сохранение...' : 'Оценить'}
          </button>
        </div>
      </div>
      
      <BottomNav />
    </div>
  )
}
