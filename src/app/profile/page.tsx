'use client'
// @ts-nocheck

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, animate } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BottomNav } from '@/components/ui/BottomNav'
import { ShareButton } from '@/components/ui/ShareButton'
import { RatingDisplay } from '@/components/rating/RatingSlider'
import { toast } from 'sonner'
import { cn, getPerceptionGradient, getConfidenceLevel, formatPercentile } from '@/lib/utils'

/**
 * Profile Page — Perception Index Display
 *
 * Features:
 * - Animated progress ring around photo
 * - Confidence level indicator
 * - Reactions count display
 * - 3D flip stats cards
 * - Glowing perception index display
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

        // Trigger confetti on first index reveal
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

  const perceptionIndex = stats?.current_rating
  const percentile = stats?.percentile
  const isVisible = stats?.is_rating_visible
  const reactionsCount = stats?.ratings_received_count || 0
  const minReactions = 15
  const progress = Math.min(100, (reactionsCount / minReactions) * 100)
  const confidence = getConfidenceLevel(reactionsCount)

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
            background: perceptionIndex
              ? `radial-gradient(circle, ${getPerceptionColorHex(perceptionIndex)}20 0%, transparent 70%)`
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
            perceptionIndex={perceptionIndex}
            isVisible={isVisible}
          />
        </motion.div>

        {/* Perception Index Display */}
        <AnimatePresence mode="wait">
          {isVisible && perceptionIndex ? (
            <motion.div
              key="index"
              className="text-center"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Index Number */}
              <div className="relative inline-block">
                <RatingDisplay value={perceptionIndex} size="mega" animated showGlow />

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
                      getPerceptionGradient(perceptionIndex),
                      'text-white text-sm font-bold',
                      'shadow-lg'
                    )}>
                      {formatPercentile(percentile)}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Confidence Level */}
              <motion.div
                className="mt-4 flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <ConfidenceIndicator level={confidence.level} />
                <span className="text-white/60 text-sm">{confidence.label}</span>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                className="text-white/40 text-sm mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Индекс восприятия
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="pending"
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PendingIndexCard
                current={reactionsCount}
                required={minReactions}
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
            value={reactionsCount}
            label="Реакций"
            icon={<ReactionIcon />}
            delay={0}
          />
          <StatCard
            value={stats?.ratings_given_count || 0}
            label="Откалибровано"
            icon={<CalibrationIcon />}
            delay={0.1}
          />
          <StatCard
            value={`${stats?.rating_power?.toFixed(1) || '1.0'}x`}
            label="Вес голоса"
            icon={<WeightIcon />}
            delay={0.2}
          />
        </motion.div>

        {/* Share Button */}
        {isVisible && perceptionIndex && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ShareButton rating={perceptionIndex} percentile={percentile} />
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
 * Confidence Level Indicator
 */
function ConfidenceIndicator({ level }: { level: 'early' | 'emerging' | 'stable' }) {
  const colors = {
    early: 'bg-orange-500',
    emerging: 'bg-yellow-500',
    stable: 'bg-green-500',
  }

  const bars = {
    early: 1,
    emerging: 2,
    stable: 3,
  }

  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3].map((bar) => (
        <motion.div
          key={bar}
          className={cn(
            'w-1.5 rounded-full transition-colors',
            bar <= bars[level] ? colors[level] : 'bg-white/20'
          )}
          style={{ height: `${bar * 33}%` }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: bar * 0.1 }}
        />
      ))}
    </div>
  )
}

/**
 * SVG Icons
 */
function ReactionIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function CalibrationIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
  )
}

function WeightIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  )
}

function HourglassIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}

/**
 * Animated Profile Photo with Progress Ring
 */
function ProfilePhotoRing({
  photo,
  progress,
  perceptionIndex,
  isVisible
}: {
  photo: any
  progress: number
  perceptionIndex?: number
  isVisible?: boolean
}) {
  const circumference = 2 * Math.PI * 68 // radius = 68

  return (
    <div className="relative w-40 h-40">
      {/* Outer glow */}
      {isVisible && perceptionIndex && (
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{
            background: `radial-gradient(circle, ${getPerceptionColorHex(perceptionIndex)}40 0%, transparent 70%)`,
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
          stroke={isVisible && perceptionIndex ? getPerceptionColorHex(perceptionIndex) : '#8B5CF6'}
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
 * Pending Index Card
 */
function PendingIndexCard({
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
        className="flex justify-center mb-4 text-white/40"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <HourglassIcon />
      </motion.div>

      <h3 className="text-xl font-semibold text-white mb-2">
        Недостаточно реакций
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
        Калибруй других, чтобы получать реакции быстрее
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
  icon: React.ReactNode
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
          className="text-white/60 mb-2 flex justify-center"
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
 * Get perception index color as hex
 */
function getPerceptionColorHex(value: number): string {
  if (value < 3) return '#EF4444'
  if (value < 5) return '#F59E0B'
  if (value < 7) return '#84CC16'
  if (value < 9) return '#22C55E'
  return '#8B5CF6'
}
