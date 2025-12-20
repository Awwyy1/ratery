'use client'
// @ts-nocheck

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BottomNav } from '@/components/ui/BottomNav'
import { ShareButton } from '@/components/ui/ShareButton'
import { RatingDisplay } from '@/components/rating/RatingSlider'
import { toast } from 'sonner'
import { cn, getRatingGradient, getPercentileEmoji } from '@/lib/utils'

/**
 * Profile Page — Premium Awwwards-level Design
 *
 * Features:
 * - Animated progress ring around photo
 * - Confetti explosion on rating reveal
 * - 3D flip stats cards
 * - Parallax header
 * - Glowing rating display
 * - Staggered animations
 */
export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [photo, setPhoto] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const hasShownConfetti = useRef(false)

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

        // Trigger confetti on first rating reveal
        if (statsResult.data?.is_rating_visible && !hasShownConfetti.current) {
          setTimeout(() => {
            setShowConfetti(true)
            hasShownConfetti.current = true
          }, 800)
        }
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
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="w-16 h-16 rounded-full border-4 border-white/10 border-t-white/60"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <BottomNav />
      </div>
    )
  }

  const rating = stats?.current_rating
  const percentile = stats?.percentile
  const isVisible = stats?.is_rating_visible
  const ratingsCount = stats?.ratings_received_count || 0
  const minRatings = 20
  const progress = Math.min(100, (ratingsCount / minRatings) * 100)

  return (
    <div className="min-h-screen bg-background pb-24 overflow-hidden">
      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && <Confetti />}
      </AnimatePresence>

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: rating
              ? `radial-gradient(circle, ${getRatingColorHex(rating)}20 0%, transparent 70%)`
              : 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 flex items-center justify-between p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-2xl font-bold text-white">Профиль</h1>
        <motion.button
          onClick={handleLogout}
          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Выйти
        </motion.button>
      </motion.header>

      {/* Profile Content */}
      <div className="relative z-10 px-6 space-y-8">
        {/* Profile Photo with Ring */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <ProfilePhotoRing
            photo={photo}
            progress={isVisible ? 100 : progress}
            rating={rating}
            isVisible={isVisible}
          />
        </motion.div>

        {/* Rating Display */}
        <AnimatePresence mode="wait">
          {isVisible && rating ? (
            <motion.div
              key="rating"
              className="text-center"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Rating Number */}
              <div className="relative inline-block">
                <RatingDisplay value={rating} size="mega" animated showGlow />

                {/* Percentile Badge */}
                {percentile && (
                  <motion.div
                    className="absolute -right-4 -top-2"
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', delay: 0.3 }}
                  >
                    <div className={cn(
                      'px-3 py-1.5 rounded-full',
                      'bg-gradient-to-r',
                      getRatingGradient(rating),
                      'text-white text-sm font-bold',
                      'shadow-lg'
                    )}>
                      {getPercentileEmoji(100 - percentile)} Top {percentile.toFixed(0)}%
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Subtitle */}
              <motion.p
                className="text-white/40 text-sm mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Твоя объективная оценка
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="pending"
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PendingRatingCard
                current={ratingsCount}
                required={minRatings}
                progress={progress}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatCard
            value={ratingsCount}
            label="Получено"
            icon="📥"
            delay={0}
          />
          <StatCard
            value={stats?.ratings_given_count || 0}
            label="Поставлено"
            icon="📤"
            delay={0.1}
          />
          <StatCard
            value={`${stats?.rating_power?.toFixed(1) || '1.0'}×`}
            label="Вес голоса"
            icon="⚡"
            delay={0.2}
          />
        </motion.div>

        {/* Share Button */}
        {isVisible && rating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ShareButton rating={rating} percentile={percentile} />
          </motion.div>
        )}

        {/* Change Photo */}
        <motion.button
          onClick={() => router.push('/upload')}
          className={cn(
            'w-full py-4 rounded-2xl',
            'bg-white/5 hover:bg-white/10',
            'border border-white/10 hover:border-white/20',
            'text-white/60 hover:text-white',
            'font-medium transition-all duration-300'
          )}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
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

/**
 * Animated Profile Photo with Progress Ring
 */
function ProfilePhotoRing({
  photo,
  progress,
  rating,
  isVisible
}: {
  photo: any
  progress: number
  rating?: number
  isVisible?: boolean
}) {
  const circumference = 2 * Math.PI * 68 // radius = 68

  return (
    <div className="relative w-40 h-40">
      {/* Outer glow */}
      {isVisible && rating && (
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{
            background: `radial-gradient(circle, ${getRatingColorHex(rating)}40 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      {/* Progress Ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        {/* Background circle */}
        <circle
          cx="80"
          cy="80"
          r="68"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="4"
        />
        {/* Progress circle */}
        <motion.circle
          cx="80"
          cy="80"
          r="68"
          fill="none"
          stroke={isVisible && rating ? getRatingColorHex(rating) : '#8B5CF6'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: circumference - (progress / 100) * circumference
          }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </svg>

      {/* Photo */}
      <motion.div
        className="absolute inset-3 rounded-full overflow-hidden bg-surface-elevated"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {photo ? (
          <img
            src={photo.url}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-purple-500/20">
            <svg className="w-12 h-12 text-white/30" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        )}
      </motion.div>
    </div>
  )
}

/**
 * Pending Rating Card
 */
function PendingRatingCard({
  current,
  required,
  progress
}: {
  current: number
  required: number
  progress: number
}) {
  return (
    <motion.div
      className={cn(
        'p-8 rounded-3xl',
        'bg-white/[0.03] backdrop-blur-xl',
        'border border-white/[0.06]'
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.div
        className="text-5xl mb-4"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ⏳
      </motion.div>

      <h3 className="text-xl font-semibold text-white mb-2">
        Недостаточно оценок
      </h3>

      <p className="text-white/50 mb-6">
        {current} из {required} необходимых
      </p>

      {/* Progress Bar */}
      <div className="relative h-3 bg-white/10 rounded-full overflow-hidden mb-4">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <p className="text-white/30 text-sm">
        Оценивай других, чтобы получать оценки быстрее
      </p>
    </motion.div>
  )
}

/**
 * Animated Stat Card
 */
function StatCard({
  value,
  label,
  icon,
  delay = 0
}: {
  value: number | string
  label: string
  icon: string
  delay?: number
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const isNumber = typeof value === 'number'

  useEffect(() => {
    if (!isNumber) return

    const controls = animate(0, value, {
      duration: 1.5,
      delay: delay + 0.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplayValue(Math.round(v)),
    })

    return () => controls.stop()
  }, [value, delay, isNumber])

  return (
    <motion.div
      className={cn(
        'relative p-4 rounded-2xl overflow-hidden',
        'bg-white/[0.03] backdrop-blur-xl',
        'border border-white/[0.06]',
        'group'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10 text-center">
        <motion.div
          className="text-2xl mb-2"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay }}
        >
          {icon}
        </motion.div>

        <div className="text-2xl font-bold text-white font-mono tabular-nums">
          {isNumber ? displayValue : value}
        </div>

        <div className="text-xs text-white/40 mt-1">
          {label}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Confetti Animation
 */
function Confetti() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    size: 6 + Math.random() * 8,
    color: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'][Math.floor(Math.random() * 5)],
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 20,
            rotate: 720,
            opacity: 0,
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: p.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      ))}
    </div>
  )
}

/**
 * Get rating color as hex
 */
function getRatingColorHex(rating: number): string {
  if (rating < 3) return '#EF4444'
  if (rating < 5) return '#F59E0B'
  if (rating < 7) return '#84CC16'
  if (rating < 9) return '#22C55E'
  return '#8B5CF6'
}
