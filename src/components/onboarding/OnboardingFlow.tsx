'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useOnboardingStore } from '@/stores'

/**
 * New Onboarding Flow - Perception Index Positioning
 *
 * 6 screens:
 * 0. Context - "This is not a judgment, it's a reaction"
 * 1. Problem - "Self-perception vs social perception"
 * 2. Solution - "How Ratery works"
 * 3. Trust - "Anonymous, weighted reactions"
 * 4. Upload - "One photo, no filters"
 * 5. Give-to-Get intro - "Help calibrate the system"
 */

const ONBOARDING_PAGES = [
  {
    id: 'context',
    title: 'Ratery — это не оценка тебя.',
    subtitle: 'Это измерение реакции.',
    description: 'Люди реагируют на образы автоматически.\nRatery помогает увидеть эти реакции в структуре.',
    cta: 'Понять своё восприятие',
  },
  {
    id: 'problem',
    title: 'Самовосприятие',
    titleAccent: ' ≠ ',
    titleEnd: 'социальное восприятие',
    points: [
      { text: 'Близкие редко дают честную обратную связь', icon: 'users' },
      { text: 'Социальные платформы показывают активность, а не реакцию', icon: 'activity' },
      { text: 'Изменения делаются без понимания эффекта', icon: 'refresh' },
    ],
    cta: 'Как это работает?',
  },
  {
    id: 'solution',
    title: 'Индекс восприятия',
    subtitle: 'Не мнение одного человека — а паттерн реакций.',
    steps: [
      { number: '01', text: 'Зафиксируй визуальный образ' },
      { number: '02', text: 'Получи анонимные реакции' },
      { number: '03', text: 'Увидь распределение восприятия' },
      { number: '04', text: 'Отслеживай динамику изменений' },
    ],
    cta: 'Продолжить',
  },
  {
    id: 'trust',
    title: 'Система работает честно',
    points: [
      { text: 'Реакции полностью анонимны', icon: 'shield' },
      { text: 'Вес реакции зависит от стабильности', icon: 'scale' },
      { text: 'Никаких комментариев — только данные', icon: 'lock' },
      { text: 'Ты контролируешь свои данные', icon: 'settings' },
    ],
    disclaimer: 'Индекс отражает социальное восприятие, а не ценность личности.',
    cta: 'Я понимаю',
  },
  {
    id: 'upload',
    title: 'Одно фото.',
    subtitle: 'Без фильтров. Без масок.',
    description: 'Это изображение будет анонимно показано\nдля фиксации реакций.',
    cta: 'Загрузить фото',
  },
  {
    id: 'give-to-get',
    title: 'Помоги откалибровать систему',
    subtitle: 'Чтобы сформировать твой индекс,\nнужно зафиксировать первые реакции.',
    description: 'Это займёт меньше минуты.\nПосле этого ты увидишь свой ранний индекс.',
    cta: 'Начать',
  },
]

export function OnboardingFlow() {
  const router = useRouter()
  const { currentStep, nextStep, completeOnboarding, hasSeenOnboarding } = useOnboardingStore()
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (hasSeenOnboarding) {
      router.push('/auth')
    }
  }, [hasSeenOnboarding, router])

  const handleNext = useCallback(() => {
    if (currentStep < ONBOARDING_PAGES.length - 1) {
      nextStep()
    } else {
      setIsExiting(true)
      completeOnboarding()
      setTimeout(() => router.push('/auth'), 500)
    }
  }, [currentStep, nextStep, completeOnboarding, router])

  const page = ONBOARDING_PAGES[currentStep]

  return (
    <motion.div
      className="min-h-screen bg-background flex flex-col"
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Progress */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-6 safe-top">
        <div className="flex gap-2">
          {ONBOARDING_PAGES.map((_, index) => (
            <div key={index} className="flex-1 h-1 rounded-full bg-surface-overlay overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                animate={{ width: index <= currentStep ? '100%' : '0%' }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-8 py-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            {/* Context page - animated perception indicator */}
            {page.id === 'context' && <PerceptionIndicator />}

            {/* Upload page - camera icon */}
            {page.id === 'upload' && <CameraIcon />}

            {/* Give-to-get page - calibration icon */}
            {page.id === 'give-to-get' && <CalibrationIcon />}

            {/* Problem page - points with icons */}
            {'points' in page && page.id === 'problem' && (
              <div className="space-y-4 mb-10 text-left max-w-sm mx-auto">
                {page.points.map((point, index) => (
                  <motion.div
                    key={point.text}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-elevated flex items-center justify-center flex-shrink-0">
                      <IconByName name={point.icon} className="w-5 h-5 text-text-secondary" />
                    </div>
                    <span className="text-body-md text-text-secondary">{point.text}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Solution page - numbered steps */}
            {'steps' in page && (
              <div className="space-y-4 mb-10 text-left max-w-sm mx-auto">
                {page.steps.map((step, index) => (
                  <motion.div
                    key={step.number}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 border border-violet-500/20">
                      <span className="text-sm font-mono text-violet-400">{step.number}</span>
                    </div>
                    <span className="text-body-md text-text-primary">{step.text}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Trust page - points with icons */}
            {'points' in page && page.id === 'trust' && (
              <div className="space-y-4 mb-8 text-left max-w-sm mx-auto">
                {page.points.map((point, index) => (
                  <motion.div
                    key={point.text}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <IconByName name={point.icon} className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="text-body-md text-text-primary">{point.text}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Title with accent (for problem page) */}
            {'titleAccent' in page ? (
              <motion.h1
                className="text-heading-xl text-text-primary mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {page.title}
                <span className="text-violet-400">{page.titleAccent}</span>
                {page.titleEnd}
              </motion.h1>
            ) : (
              <motion.h1
                className={cn(
                  "text-text-primary mb-4",
                  page.id === 'context' ? 'text-display-sm' : 'text-heading-xl'
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {page.title}
              </motion.h1>
            )}

            {/* Subtitle */}
            {'subtitle' in page && page.subtitle && (
              <motion.p
                className="text-body-lg text-text-secondary mb-6 whitespace-pre-line"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {page.subtitle}
              </motion.p>
            )}

            {/* Description */}
            {'description' in page && page.description && (
              <motion.p
                className="text-body-md text-text-tertiary whitespace-pre-line"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {page.description}
              </motion.p>
            )}

            {/* Disclaimer */}
            {'disclaimer' in page && page.disclaimer && (
              <motion.div
                className="mt-8 p-4 rounded-2xl bg-surface-elevated border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-caption text-text-tertiary">{page.disclaimer}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="px-6 pb-8 safe-bottom">
        <motion.button
          className="btn-primary w-full text-lg py-5"
          onClick={handleNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {page.cta}
        </motion.button>
      </div>
    </motion.div>
  )
}

/**
 * Animated Perception Indicator
 */
function PerceptionIndicator() {
  const [value, setValue] = useState(5.0)

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(Math.random() * 4 + 4) // 4.0 - 8.0 range
    }, 200)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="mb-12"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="inline-flex flex-col items-center justify-center bg-surface-elevated rounded-3xl px-12 py-8 border border-border">
        <span className="text-caption text-text-tertiary mb-2">Индекс восприятия</span>
        <span className="text-rating-hero font-mono tabular-nums text-text-primary">
          {value.toFixed(2)}
        </span>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-caption text-text-tertiary">обновляется</span>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Camera Icon for upload page
 */
function CameraIcon() {
  return (
    <motion.div
      className="w-32 h-32 rounded-full bg-surface-elevated border border-border flex items-center justify-center mx-auto mb-10"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' }}
    >
      <svg className="w-14 h-14 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    </motion.div>
  )
}

/**
 * Calibration Icon for give-to-get page
 */
function CalibrationIcon() {
  return (
    <motion.div
      className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center mx-auto mb-10"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring' }}
    >
      <motion.svg
        className="w-14 h-14 text-violet-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </motion.svg>
    </motion.div>
  )
}

/**
 * Icon component by name
 */
function IconByName({ name, className }: { name: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    users: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    activity: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    refresh: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
    shield: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    scale: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" />
        <path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" />
        <path d="M7 21h10" />
        <path d="M12 3v18" />
        <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
      </svg>
    ),
    lock: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    settings: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  }

  return icons[name] || null
}
