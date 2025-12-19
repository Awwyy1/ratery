'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { cn, vibrate, getRatingGradient } from '@/lib/utils'

interface RatingSliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
}

/**
 * Premium Rating Slider
 * 
 * Особенности:
 * - Плавная анимация с Framer Motion
 * - Haptic feedback на мобильных
 * - Динамический градиент в зависимости от значения
 * - Шаг 0.01 для точной оценки
 * - Поддержка touch и mouse events
 */
export function RatingSlider({
  value,
  onChange,
  min = 1,
  max = 10,
  step = 0.01,
  disabled = false,
  className,
}: RatingSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  
  // Motion values для плавной анимации
  const x = useMotionValue(0)
  const scale = useTransform(x, [-10, 0, 10], [0.95, 1, 0.95])
  
  // Синхронизация с внешним value
  useEffect(() => {
    setLocalValue(value)
  }, [value])
  
  // Конвертация позиции в значение
  const positionToValue = useCallback((clientX: number) => {
    if (!trackRef.current) return value
    
    const rect = trackRef.current.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const rawValue = min + percentage * (max - min)
    
    // Округление до шага 0.01
    const steppedValue = Math.round(rawValue / step) * step
    return Math.max(min, Math.min(max, steppedValue))
  }, [min, max, step, value])
  
  // Обработка изменения
  const handleChange = useCallback((clientX: number) => {
    const newValue = positionToValue(clientX)
    
    // Vibration feedback на каждые 0.5
    if (Math.abs(newValue - localValue) >= 0.5) {
      vibrate(5)
    }
    
    setLocalValue(newValue)
    onChange(newValue)
  }, [positionToValue, localValue, onChange])
  
  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return
    
    e.preventDefault()
    setIsDragging(true)
    handleChange(e.clientX)
    
    const handleMouseMove = (e: MouseEvent) => {
      handleChange(e.clientX)
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [disabled, handleChange])
  
  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return
    
    setIsDragging(true)
    handleChange(e.touches[0].clientX)
  }, [disabled, handleChange])
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || disabled) return
    handleChange(e.touches[0].clientX)
  }, [isDragging, disabled, handleChange])
  
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])
  
  // Позиция ползунка в процентах
  const percentage = ((localValue - min) / (max - min)) * 100
  
  // Динамический градиент
  const gradient = getRatingGradient(localValue)
  
  return (
    <div className={cn('relative select-none touch-none', className)}>
      {/* Основной слайдер */}
      <div
        ref={trackRef}
        className={cn(
          'relative h-16 cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Трек (фон) */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 rounded-full bg-surface-overlay" />
        
        {/* Заполненная часть с градиентом */}
        <motion.div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 h-2 rounded-full',
            'bg-gradient-to-r',
            gradient
          )}
          style={{ width: `${percentage}%` }}
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
        
        {/* Glow эффект */}
        <motion.div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 h-4 rounded-full blur-md opacity-50',
            'bg-gradient-to-r',
            gradient
          )}
          style={{ width: `${percentage}%` }}
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
        
        {/* Ползунок */}
        <motion.div
          className={cn(
            'absolute top-1/2 -translate-y-1/2',
            'w-10 h-10 -ml-5',
            'bg-white rounded-full',
            'shadow-lg shadow-black/30',
            'flex items-center justify-center',
            'cursor-grab',
            isDragging && 'cursor-grabbing'
          )}
          style={{
            left: `${percentage}%`,
            scale,
          }}
          initial={false}
          animate={{
            left: `${percentage}%`,
            scale: isDragging ? 1.15 : 1,
          }}
          transition={{
            left: { type: 'spring', stiffness: 300, damping: 30 },
            scale: { type: 'spring', stiffness: 500, damping: 30 },
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Внутренний индикатор */}
          <div 
            className={cn(
              'w-4 h-4 rounded-full',
              'bg-gradient-to-br',
              gradient
            )}
          />
        </motion.div>
      </div>
      
      {/* Шкала */}
      <div className="flex justify-between mt-2 px-1">
        <span className="text-caption text-text-tertiary">1</span>
        <span className="text-caption text-text-tertiary">5.5</span>
        <span className="text-caption text-text-tertiary">10</span>
      </div>
    </div>
  )
}

/**
 * Компонент отображения текущего значения рейтинга
 * С анимацией смены цифр
 */
export function RatingDisplay({ 
  value, 
  size = 'lg',
  animated = true,
  className,
}: { 
  value: number
  size?: 'sm' | 'md' | 'lg' | 'hero'
  animated?: boolean
  className?: string
}) {
  const [displayValue, setDisplayValue] = useState(value)
  const prevValueRef = useRef(value)
  
  useEffect(() => {
    if (!animated) {
      setDisplayValue(value)
      return
    }
    
    // Анимация смены значения
    const controls = animate(prevValueRef.current, value, {
      duration: 0.3,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest * 100) / 100)
      },
    })
    
    prevValueRef.current = value
    
    return () => controls.stop()
  }, [value, animated])
  
  const sizeClasses = {
    sm: 'text-rating-md',
    md: 'text-rating-lg',
    lg: 'text-display-xl',
    hero: 'text-rating-hero',
  }
  
  const gradient = getRatingGradient(displayValue)
  
  return (
    <motion.div
      className={cn(
        'font-mono tracking-tight tabular-nums',
        sizeClasses[size],
        className
      )}
      initial={animated ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      key={Math.floor(displayValue)} // Re-render на целых числах для анимации
    >
      <span className={cn('bg-clip-text text-transparent bg-gradient-to-r', gradient)}>
        {displayValue.toFixed(2)}
      </span>
    </motion.div>
  )
}
