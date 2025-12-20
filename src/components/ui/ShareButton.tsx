'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn, getPerceptionGradient } from '@/lib/utils'

interface ShareButtonProps {
  rating: number | null
  percentile: number | null
}

/**
 * Premium Share Button
 *
 * Features:
 * - Animated icon morphing
 * - Gradient background on hover
 * - Success state animation
 * - Haptic feedback
 */
export function ShareButton({ rating, percentile }: ShareButtonProps) {
  const [isShared, setIsShared] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleShare = async () => {
    const text = rating
      ? `Мой индекс восприятия на Ratery: ${rating.toFixed(2)} (Top ${percentile?.toFixed(0) || '?'}%)\n\nУзнай свой: https://ratery-delta.vercel.app`
      : `Узнай свой индекс восприятия на Ratery!\n\nhttps://ratery-delta.vercel.app`

    // Vibrate
    if (navigator.vibrate) navigator.vibrate(10)

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ratery — Индекс восприятия',
          text: text,
          url: 'https://ratery-delta.vercel.app',
        })
        setIsShared(true)
        setTimeout(() => setIsShared(false), 2000)
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text)
      toast.success('Скопировано в буфер обмена!')
      setIsShared(true)
      setTimeout(() => setIsShared(false), 2000)
    }
  }

  const gradient = rating ? getPerceptionGradient(rating) : 'from-violet-500 to-purple-500'

  return (
    <motion.button
      onClick={handleShare}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        'relative flex items-center justify-center gap-3',
        'w-full py-4 rounded-2xl',
        'font-semibold text-white',
        'overflow-hidden',
        'transition-shadow duration-300',
        'group'
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background */}
      <motion.div
        className={cn(
          'absolute inset-0 bg-gradient-to-r',
          gradient
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0.15 }}
        transition={{ duration: 0.3 }}
      />

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '100%' : '-100%' }}
        transition={{ duration: 0.6 }}
      />

      {/* Border */}
      <div className="absolute inset-0 rounded-2xl border border-white/20" />

      {/* Icon */}
      <AnimatePresence mode="wait">
        {isShared ? (
          <motion.div
            key="check"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className="relative z-10"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <motion.path
                d="M5 12l5 5L20 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3 }}
              />
            </svg>
          </motion.div>
        ) : (
          <motion.div
            key="share"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="relative z-10"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" strokeLinecap="round" strokeLinejoin="round" />
              <motion.polyline
                points="16 6 12 2 8 6"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{ y: isHovered ? -2 : 0 }}
              />
              <motion.line
                x1="12" y1="2" x2="12" y2="15"
                strokeLinecap="round"
                animate={{ y: isHovered ? -2 : 0 }}
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text */}
      <span className="relative z-10">
        {isShared ? 'Готово!' : 'Поделиться'}
      </span>

      {/* Glow effect on hover */}
      <motion.div
        className={cn(
          'absolute inset-0 rounded-2xl blur-xl -z-10',
          'bg-gradient-to-r',
          gradient
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.5 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  )
}

/**
 * Compact Share Icon Button
 */
export function ShareIconButton({
  rating,
  percentile,
  className
}: ShareButtonProps & { className?: string }) {
  const handleShare = async () => {
    const text = rating
      ? `Мой индекс восприятия на Ratery: ${rating.toFixed(2)} (Top ${percentile?.toFixed(0) || '?'}%)`
      : `Узнай свой индекс восприятия на Ratery!`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Ratery', text, url: 'https://ratery-delta.vercel.app' })
      } catch {}
    } else {
      await navigator.clipboard.writeText(text + '\n\nhttps://ratery-delta.vercel.app')
      toast.success('Скопировано!')
    }
  }

  return (
    <motion.button
      onClick={handleShare}
      className={cn(
        'w-12 h-12 rounded-full',
        'bg-white/10 hover:bg-white/20',
        'flex items-center justify-center',
        'text-white/70 hover:text-white',
        'transition-colors duration-200',
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" strokeLinecap="round" />
        <polyline points="16 6 12 2 8 6" strokeLinecap="round" />
        <line x1="12" y1="2" x2="12" y2="15" strokeLinecap="round" />
      </svg>
    </motion.button>
  )
}
