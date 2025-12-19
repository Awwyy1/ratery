'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { RatingSlider, RatingDisplay } from './RatingSlider'
import { cn, countryCodeToFlag, vibrate } from '@/lib/utils'
import { useRatingStore } from '@/stores'

interface RatingTarget {
  queueId: string
  photoId: string
  photoUrl: string
  targetUserId: string
  ageRange: string | null
  country: string | null
}

interface RatingCardProps {
  target: RatingTarget
  onSubmit: (score: number, viewDurationMs: number) => Promise<void>
  onSkip: () => void
  isLoading?: boolean
}

/**
 * Rating Card — Карточка для оценки пользователя
 * 
 * Премиальный дизайн:
 * - Полноэкранное фото с наложением градиента
 * - Плавающий слайдер с haptic feedback
 * - Анимации переходов между карточками
 * - Gesture-based взаимодействие
 */
export function RatingCard({ 
  target, 
  onSubmit, 
  onSkip,
  isLoading = false 
}: RatingCardProps) {
  const { currentScore, setScore, startViewing, getViewDuration, setSubmitting, reset } = useRatingStore()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Начинаем отсчёт времени просмотра
  useEffect(() => {
    startViewing()
    return () => reset()
  }, [target.queueId, startViewing, reset])
  
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setSubmitting(true)
    vibrate([10, 50, 10])
    
    try {
      const viewDuration = getViewDuration()
      await onSubmit(currentScore, viewDuration)
    } finally {
      setIsSubmitting(false)
      setSubmitting(false)
    }
  }, [currentScore, getViewDuration, onSubmit, isSubmitting, setSubmitting])
  
  const handleSkip = useCallback(() => {
    vibrate(5)
    onSkip()
  }, [onSkip])
  
  return (
    <motion.div
      className="relative w-full h-full min-h-screen flex flex-col"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02, x: -50 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Фото на весь экран */}
      <div className="relative flex-1 overflow-hidden">
        {/* Skeleton пока грузится */}
        <AnimatePresence>
          {!imageLoaded && (
            <motion.div
              className="absolute inset-0 bg-surface animate-pulse"
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
        
        {/* Фото */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: imageLoaded ? 1 : 0, 
            scale: imageLoaded ? 1 : 1.1 
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Image
            src={target.photoUrl}
            alt="Profile photo"
            fill
            className="object-cover"
            priority
            onLoad={() => setImageLoaded(true)}
            sizes="100vw"
          />
        </motion.div>
        
        {/* Градиент снизу */}
        <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
        
        {/* Метаданные (возраст, страна) */}
        {(target.ageRange || target.country) && (
          <motion.div
            className="absolute top-6 left-6 flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {target.country && (
              <span className="text-2xl">
                {countryCodeToFlag(target.country)}
              </span>
            )}
            {target.ageRange && (
              <span className="text-body-sm text-white/60 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                {target.ageRange}
              </span>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Нижняя панель управления */}
      <motion.div
        className="relative z-10 px-6 pb-8 pt-4 safe-bottom"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Отображение текущей оценки */}
        <div className="flex justify-center mb-6">
          <RatingDisplay value={currentScore} size="hero" animated />
        </div>
        
        {/* Слайдер */}
        <div className="mb-8">
          <RatingSlider
            value={currentScore}
            onChange={setScore}
            min={1}
            max={10}
            step={0.01}
            disabled={isSubmitting}
          />
        </div>
        
        {/* Кнопки действий */}
        <div className="flex items-center justify-center gap-4">
          {/* Пропустить */}
          <motion.button
            className={cn(
              'w-16 h-16 rounded-full',
              'bg-surface-elevated border border-border',
              'flex items-center justify-center',
              'text-text-secondary',
              'transition-colors duration-200',
              'hover:bg-surface-overlay hover:text-text-primary',
              'disabled:opacity-50'
            )}
            onClick={handleSkip}
            disabled={isSubmitting || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SkipIcon className="w-6 h-6" />
          </motion.button>
          
          {/* Оценить */}
          <motion.button
            className={cn(
              'flex-1 max-w-xs h-16 rounded-full',
              'bg-white text-black',
              'font-semibold text-lg',
              'flex items-center justify-center gap-2',
              'disabled:opacity-50'
            )}
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <LoadingSpinner className="w-5 h-5" />
            ) : (
              <>
                <span>Оценить</span>
                <CheckIcon className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/**
 * Состояние когда некого оценивать
 */
export function NoMoreTargets({ onRefresh }: { onRefresh: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen p-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        className="w-24 h-24 rounded-full bg-surface-elevated flex items-center justify-center mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
      >
        <span className="text-4xl">✨</span>
      </motion.div>
      
      <h2 className="text-display-sm text-text-primary mb-2">
        На сегодня всё!
      </h2>
      
      <p className="text-body-md text-text-secondary mb-8 max-w-sm">
        Ты оценил всех доступных пользователей. Возвращайся позже — появятся новые.
      </p>
      
      <motion.button
        className="btn-secondary"
        onClick={onRefresh}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Обновить
      </motion.button>
    </motion.div>
  )
}

/**
 * Состояние загрузки
 */
export function RatingLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LoadingSpinner className="w-10 h-10 text-text-secondary" />
      <p className="text-body-sm text-text-tertiary mt-4">Загрузка...</p>
    </div>
  )
}

// Icons
function SkipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  )
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={cn('animate-spin', className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
