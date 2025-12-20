'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  PanInfo
} from 'framer-motion'
import { cn, vibrate } from '@/lib/utils'

interface SwipeCardProps {
  photoUrl: string
  photoId: string
  onSwipeLeft: () => void
  onSwipeRight: () => void
  onImageError?: () => void
  children?: React.ReactNode
  disabled?: boolean
}

/**
 * Premium SwipeCard — Tinder-style с 3D эффектами
 *
 * Features:
 * - Drag gestures с rotation
 * - 3D perspective tilt
 * - Glow border effects
 * - Overlay indicators (Skip/Rate)
 * - Spring physics анимации
 * - Parallax background effect
 */
export function SwipeCard({
  photoUrl,
  photoId,
  onSwipeLeft,
  onSwipeRight,
  onImageError,
  children,
  disabled = false,
}: SwipeCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)

  // Motion values для drag
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Трансформации на основе drag
  const rotate = useTransform(x, [-300, 0, 300], [-25, 0, 25])
  const rotateY = useTransform(x, [-300, 0, 300], [15, 0, -15])
  const scale = useTransform(
    x,
    [-300, -100, 0, 100, 300],
    [0.95, 1.02, 1, 1.02, 0.95]
  )

  // Opacity для overlay индикаторов
  const skipOpacity = useTransform(x, [-150, -50, 0], [1, 0.5, 0])
  const rateOpacity = useTransform(x, [0, 50, 150], [0, 0.5, 1])

  // Glow эффекты
  const leftGlow = useTransform(x, [-200, 0], [0.8, 0])
  const rightGlow = useTransform(x, [0, 200], [0, 0.8])

  // Background parallax
  const bgX = useTransform(x, [-300, 300], [30, -30])
  const bgScale = useTransform(x, [-300, 0, 300], [1.15, 1.1, 1.15])

  const handleDragEnd = useCallback((
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (disabled) return

    const threshold = 100
    const velocity = info.velocity.x
    const offset = info.offset.x

    if (offset < -threshold || velocity < -500) {
      setExitDirection('left')
      vibrate(10)
      setTimeout(onSwipeLeft, 200)
    } else if (offset > threshold || velocity > 500) {
      setExitDirection('right')
      vibrate([10, 30, 10])
      setTimeout(onSwipeRight, 200)
    }
  }, [disabled, onSwipeLeft, onSwipeRight])

  return (
    <div className="relative w-full h-full" style={{ perspective: '1200px' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={photoId}
          className={cn(
            'relative w-full h-full rounded-[2rem] overflow-hidden',
            'shadow-2xl shadow-black/50',
            disabled && 'pointer-events-none'
          )}
          style={{
            x,
            y,
            rotate,
            rotateY,
            scale,
            transformStyle: 'preserve-3d',
          }}
          drag={!disabled}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.9}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            x: exitDirection === 'left' ? -500 : exitDirection === 'right' ? 500 : 0,
            rotate: exitDirection === 'left' ? -30 : exitDirection === 'right' ? 30 : 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
            x: exitDirection === 'left' ? -500 : exitDirection === 'right' ? 500 : 0,
            rotate: exitDirection === 'left' ? -30 : exitDirection === 'right' ? 30 : 0,
            transition: { duration: 0.3, ease: [0.32, 0, 0.67, 0] }
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
          }}
          whileTap={{ cursor: 'grabbing' }}
        >
          {/* Фоновое фото с параллаксом */}
          <motion.div
            className="absolute inset-0"
            style={{ x: bgX, scale: bgScale }}
          >
            {!imageError ? (
              <Image
                src={photoUrl}
                alt="Rate this person"
                fill
                className={cn(
                  'object-cover transition-opacity duration-700',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                priority
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true)
                  setImageLoaded(true)
                  // Auto-skip to next photo after delay
                  if (onImageError) {
                    setTimeout(onImageError, 1500)
                  }
                }}
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-violet-900/50 to-purple-900/50 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-white/30 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <p className="text-white/40 text-sm">Не удалось загрузить</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Skeleton loader */}
          <AnimatePresence>
            {!imageLoaded && !imageError && (
              <motion.div
                className="absolute inset-0 bg-surface"
                exit={{ opacity: 0 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface-elevated to-surface animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-white/50 animate-spin" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

          {/* Glow borders */}
          <motion.div
            className="absolute inset-0 rounded-[2rem] border-4 border-red-500 pointer-events-none"
            style={{ opacity: leftGlow }}
          />
          <motion.div
            className="absolute inset-0 rounded-[2rem] border-4 border-green-500 pointer-events-none"
            style={{ opacity: rightGlow }}
          />

          {/* Skip indicator (left) */}
          <motion.div
            className="absolute top-8 right-8 px-6 py-3 rounded-xl bg-red-500/90 backdrop-blur-sm border-2 border-red-400 rotate-12"
            style={{ opacity: skipOpacity }}
          >
            <span className="text-white font-bold text-xl tracking-wider">SKIP</span>
          </motion.div>

          {/* Rate indicator (right) */}
          <motion.div
            className="absolute top-8 left-8 px-6 py-3 rounded-xl bg-green-500/90 backdrop-blur-sm border-2 border-green-400 -rotate-12"
            style={{ opacity: rateOpacity }}
          >
            <span className="text-white font-bold text-xl tracking-wider">RATE</span>
          </motion.div>

          {/* Content slot */}
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Ambient glow effect */}
      <div className="absolute -inset-20 -z-10 blur-3xl opacity-30 pointer-events-none">
        <motion.div
          className="w-full h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    </div>
  )
}

/**
 * Floating Score Chip — Показывает текущую оценку над картой
 */
export function FloatingScoreChip({
  score,
  className
}: {
  score: number
  className?: string
}) {
  const getScoreColor = (s: number) => {
    if (s < 3) return 'from-red-500 to-orange-500'
    if (s < 5) return 'from-orange-500 to-yellow-500'
    if (s < 7) return 'from-yellow-500 to-lime-500'
    if (s < 9) return 'from-lime-500 to-green-500'
    return 'from-violet-500 to-purple-500'
  }

  return (
    <motion.div
      className={cn(
        'px-6 py-3 rounded-2xl backdrop-blur-xl',
        'bg-black/40 border border-white/20',
        'shadow-2xl shadow-black/50',
        className
      )}
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <motion.span
        className={cn(
          'text-4xl font-mono font-bold tabular-nums',
          'bg-gradient-to-r bg-clip-text text-transparent',
          getScoreColor(score)
        )}
        key={Math.floor(score * 10)}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {score.toFixed(2)}
      </motion.span>
    </motion.div>
  )
}

/**
 * ActionButtons — Кнопки Skip/Rate с премиальными эффектами
 */
export function ActionButtons({
  onSkip,
  onRate,
  disabled = false,
  isSubmitting = false,
}: {
  onSkip: () => void
  onRate: () => void
  disabled?: boolean
  isSubmitting?: boolean
}) {
  return (
    <div className="flex items-center justify-center gap-6">
      {/* Skip Button */}
      <motion.button
        onClick={onSkip}
        disabled={disabled || isSubmitting}
        className={cn(
          'relative w-16 h-16 rounded-full',
          'bg-surface-elevated/80 backdrop-blur-xl',
          'border border-white/10',
          'flex items-center justify-center',
          'text-red-400 hover:text-red-300',
          'transition-colors duration-200',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'group'
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-red-500/20 opacity-0 group-hover:opacity-100"
          transition={{ duration: 0.2 }}
        />
        <svg className="w-7 h-7 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </motion.button>

      {/* Rate Button */}
      <motion.button
        onClick={onRate}
        disabled={disabled || isSubmitting}
        className={cn(
          'relative px-12 h-16 rounded-full',
          'bg-white text-black',
          'font-semibold text-lg',
          'flex items-center justify-center gap-3',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'overflow-hidden',
          'group'
        )}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
        />

        {isSubmitting ? (
          <div className="w-6 h-6 border-3 border-black/20 border-t-black rounded-full animate-spin" />
        ) : (
          <>
            <span className="relative z-10">Отправить</span>
            <motion.svg
              className="w-5 h-5 relative z-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              initial={{ x: 0 }}
              whileHover={{ x: 3 }}
            >
              <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </>
        )}
      </motion.button>
    </div>
  )
}

/**
 * ParticleExplosion — Конфетти эффект при успешной оценке
 */
export function ParticleExplosion({
  trigger,
  color = 'white'
}: {
  trigger: boolean
  color?: string
}) {
  if (!trigger) return null

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    angle: (i / 20) * 360,
    distance: 100 + Math.random() * 100,
    size: 4 + Math.random() * 8,
    delay: Math.random() * 0.2,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: color,
          }}
          initial={{
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1
          }}
          animate={{
            x: Math.cos(p.angle * Math.PI / 180) * p.distance,
            y: Math.sin(p.angle * Math.PI / 180) * p.distance,
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: 0.8,
            delay: p.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      ))}
    </div>
  )
}
