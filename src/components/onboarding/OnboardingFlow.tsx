'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useOnboardingStore } from '@/stores'

const ONBOARDING_PAGES = [
  {
    id: 'hook',
    title: 'Тебя уже оценивают.',
    subtitle: 'Каждый день. Молча.',
    description: 'Ratery просто показывает цифру.',
    cta: 'Показать',
  },
  {
    id: 'reality',
    title: 'У большинства людей самооценка выше реальности.',
    subtitle: 'Иногда — на 2–3 балла.',
    description: null,
    cta: 'Проверить себя',
  },
  {
    id: 'consensus',
    title: 'Это не мнение одного человека.',
    subtitle: 'Это консенсус.',
    stats: [
      { value: '1,284,391', label: 'оценок сегодня' },
      { value: '47', label: 'стран' },
      { value: '1.6', label: 'среднее расхождение' },
    ],
    cta: 'Продолжить',
  },
  {
    id: 'rules',
    title: 'Правила игры',
    description: 'Ты можешь не согласиться.\nНо ты не можешь это игнорировать.',
    rules: [
      'Оценивают реальные люди',
      'Шкала 1–10 с шагом 0.01',
      'Никаких лайков',
      'Никаких комментариев',
      'Только итоговое число',
    ],
    cta: 'Я готов',
  },
  {
    id: 'upload',
    title: 'Одно фото.',
    subtitle: 'Без фильтров. Без оправданий.',
    description: 'Это фото увидят люди,\nкоторые ничего тебе не должны.',
    cta: 'Показать себя миру',
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
            {/* Animated number for reality page */}
            {page.id === 'reality' && <AnimatedRating />}
            
            {/* Camera icon for upload page */}
            {page.id === 'upload' && <CameraIcon />}
            
            {/* Stats for consensus page */}
            {'stats' in page && page.stats && (
              <div className="mb-12 space-y-6">
                {page.stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="flex items-baseline gap-4 justify-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="text-display-md font-mono text-text-primary">{stat.value}</span>
                    <span className="text-body-md text-text-tertiary">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* Rules for rules page */}
            {'rules' in page && page.rules && (
              <div className="space-y-4 mb-10 text-left max-w-sm mx-auto">
                {page.rules.map((rule, index) => (
                  <motion.div
                    key={rule}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    </div>
                    <span className="text-body-lg text-text-primary">{rule}</span>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* Title */}
            <motion.h1
              className={cn(
                "text-text-primary mb-4",
                page.id === 'hook' ? 'text-display-lg' : 'text-heading-xl'
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {page.title}
            </motion.h1>
            
            {/* Subtitle */}
            {'subtitle' in page && page.subtitle && (
              <motion.p
                className="text-display-sm text-text-secondary mb-6 whitespace-pre-line"
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
                className="text-body-lg text-text-tertiary whitespace-pre-line"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {page.description}
              </motion.p>
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

function AnimatedRating() {
  const [value, setValue] = useState(5.0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setValue(Math.random() * 6 + 3)
    }, 150)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <motion.div
      className="mb-12"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="inline-flex items-center justify-center bg-surface-elevated rounded-3xl px-12 py-8 border border-border">
        <span className="text-rating-hero font-mono tabular-nums text-text-primary">
          {value.toFixed(2)}
        </span>
      </div>
    </motion.div>
  )
}

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
