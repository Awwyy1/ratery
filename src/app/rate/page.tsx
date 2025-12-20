'use client'
// @ts-nocheck

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { BottomNav } from '@/components/ui/BottomNav'
import { SwipeCard, FloatingScoreChip, ActionButtons, ParticleExplosion } from '@/components/rating/SwipeCard'
import { RatingSlider, RatingDisplay } from '@/components/rating/RatingSlider'
import { toast } from 'sonner'
import { cn, vibrate } from '@/lib/utils'

interface RatingTarget {
  queueId: string
  photoId: string
  photoUrl: string
  targetUserId: string
}

/**
 * Rate Page — Premium Awwwards-level Experience
 *
 * Features:
 * - Tinder-style swipe gestures
 * - 3D card transformations
 * - Premium slider with glow effects
 * - Particle explosions on submit
 * - Skeleton loading states
 * - Haptic feedback
 */
export default function RatePage() {
  const [target, setTarget] = useState<RatingTarget | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [noMoreTargets, setNoMoreTargets] = useState(false)
  const [score, setScore] = useState(5.5)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [swipeMode, setSwipeMode] = useState(false)
  const viewStartTime = useRef(Date.now())

  const supabase = createClient()

  const loadNextTarget = useCallback(async () => {
    setIsLoading(true)
    setNoMoreTargets(false)
    setScore(5.5)
    setShowParticles(false)
    viewStartTime.current = Date.now()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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

      const { data: rated } = await supabase
        .from('ratings')
        .select('photo_id')
        .eq('rater_id', user.id)

      const ratedIds = rated?.map(r => r.photo_id) || []
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
    setShowParticles(true)
    vibrate([10, 50, 10])

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

      // Delay for particle animation
      setTimeout(() => {
        setTarget(null)
        loadNextTarget()
      }, 300)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Ошибка сохранения')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = async () => {
    vibrate(5)
    setTarget(null)
    await loadNextTarget()
  }

  useEffect(() => {
    loadNextTarget()
  }, [loadNextTarget])

  // Premium Skeleton Loading
  if (isLoading && !target) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm aspect-[3/4] rounded-[2rem] overflow-hidden">
            {/* Skeleton shimmer */}
            <div className="absolute inset-0 bg-surface" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            {/* Centered loader */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-16 h-16 rounded-full border-4 border-white/10 border-t-white/60"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  // No More Targets - Premium Empty State
  if (noMoreTargets) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Animated rings */}
            <motion.div
              className="absolute inset-0 w-28 h-28 rounded-full border-2 border-white/10"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 w-28 h-28 rounded-full border-2 border-white/10"
              animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 backdrop-blur-xl flex items-center justify-center border border-white/10">
              <motion.span
                className="text-5xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨
              </motion.span>
            </div>
          </motion.div>

          <motion.h1
            className="text-3xl font-bold text-white mt-8 mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            На сегодня всё!
          </motion.h1>

          <motion.p
            className="text-white/50 text-center mb-10 max-w-xs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Ты оценил всех доступных пользователей. Возвращайся позже — появятся новые.
          </motion.p>

          <motion.button
            onClick={loadNextTarget}
            className={cn(
              'px-8 py-4 rounded-full',
              'bg-white/5 hover:bg-white/10',
              'border border-white/10 hover:border-white/20',
              'text-white font-medium',
              'transition-all duration-300'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Обновить
          </motion.button>
        </div>
        <BottomNav />
      </div>
    )
  }

  // Main Rating Screen
  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Photo Card */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <AnimatePresence mode="wait">
          {target && (
            <motion.div
              key={target.photoId}
              className="relative w-full max-w-sm aspect-[3/4]"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <SwipeCard
                photoUrl={target.photoUrl}
                photoId={target.photoId}
                onSwipeLeft={handleSkip}
                onSwipeRight={handleSubmit}
                disabled={isSubmitting}
              >
                {/* Particles */}
                <ParticleExplosion trigger={showParticles} color="#fff" />
              </SwipeCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rating Controls */}
      <motion.div
        className="relative z-10 px-6 pb-6 space-y-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Score Display */}
        <div className="flex justify-center">
          <motion.div
            className="px-6 py-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10"
            whileHover={{ scale: 1.02 }}
          >
            <RatingDisplay value={score} size="hero" animated showGlow />
          </motion.div>
        </div>

        {/* Slider */}
        <RatingSlider
          value={score}
          onChange={setScore}
          min={1}
          max={10}
          step={0.01}
          disabled={isSubmitting}
          showFloatingScore={true}
        />

        {/* Action Buttons */}
        <ActionButtons
          onSkip={handleSkip}
          onRate={handleSubmit}
          disabled={!target}
          isSubmitting={isSubmitting}
        />

        {/* Swipe Hint */}
        <motion.p
          className="text-center text-white/30 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Свайпни карточку ← или →
        </motion.p>
      </motion.div>

      <BottomNav />
    </div>
  )
}
