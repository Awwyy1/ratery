'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate, useSpring } from 'framer-motion'
import { cn, vibrate, getRatingGradient } from '@/lib/utils'

interface RatingSliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
  showFloatingScore?: boolean
}

/**
 * Premium Rating Slider v2
 *
 * Awwwards-level features:
 * - Floating score chip с spring анимацией
 * - Glow trail эффект
 * - Tick marks на целых числах
 * - Haptic feedback с интенсивностью
 * - Dynamic color temperature
 * - Touch & mouse support
 */
export function RatingSlider({
  value,
  onChange,
  min = 1,
  max = 10,
  step = 0.01,
  disabled = false,
  className,
  showFloatingScore = true,
}: RatingSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const lastHapticValue = useRef(value)

  // Spring-based motion values для плавности
  const springConfig = { stiffness: 400, damping: 35 }
  const thumbX = useSpring(0, springConfig)
  const glowOpacity = useSpring(0, { stiffness: 300, damping: 30 })

  // Синхронизация с внешним value
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Обновляем позицию thumb
  useEffect(() => {
    const percentage = ((localValue - min) / (max - min)) * 100
    thumbX.set(percentage)
  }, [localValue, min, max, thumbX])

  // Конвертация позиции в значение
  const positionToValue = useCallback((clientX: number) => {
    if (!trackRef.current) return value

    const rect = trackRef.current.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const rawValue = min + percentage * (max - min)
    const steppedValue = Math.round(rawValue / step) * step
    return Math.max(min, Math.min(max, steppedValue))
  }, [min, max, step, value])

  // Обработка изменения с haptic feedback
  const handleChange = useCallback((clientX: number) => {
    const newValue = positionToValue(clientX)

    // Haptic на каждые 0.5 с переменной интенсивностью
    const diff = Math.abs(newValue - lastHapticValue.current)
    if (diff >= 0.5) {
      const intensity = Math.min(20, Math.floor(diff * 10))
      vibrate(intensity)
      lastHapticValue.current = Math.round(newValue * 2) / 2
    }

    // Stronger haptic на целых числах
    if (Math.abs(newValue - Math.round(newValue)) < 0.02 &&
        Math.abs(localValue - Math.round(localValue)) >= 0.02) {
      vibrate([10, 20, 10])
    }

    setLocalValue(newValue)
    onChange(newValue)
  }, [positionToValue, localValue, onChange])

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(true)
    glowOpacity.set(1)
    handleChange(e.clientX)

    const handleMouseMove = (e: MouseEvent) => handleChange(e.clientX)
    const handleMouseUp = () => {
      setIsDragging(false)
      glowOpacity.set(0)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [disabled, handleChange, glowOpacity])

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return
    setIsDragging(true)
    glowOpacity.set(1)
    handleChange(e.touches[0].clientX)
  }, [disabled, handleChange, glowOpacity])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || disabled) return
    handleChange(e.touches[0].clientX)
  }, [isDragging, disabled, handleChange])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    glowOpacity.set(0)
  }, [glowOpacity])

  const percentage = ((localValue - min) / (max - min)) * 100
  const gradient = getRatingGradient(localValue)

  // Tick marks для целых чисел
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  return (
    <div className={cn('relative select-none touch-none py-8', className)}>
      {/* Floating Score Chip */}
      {showFloatingScore && (
        <motion.div
          className="absolute -top-2 pointer-events-none"
          style={{
            left: `${percentage}%`,
            x: '-50%',
          }}
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{
            opacity: isDragging ? 1 : 0,
            y: isDragging ? 0 : 10,
            scale: isDragging ? 1 : 0.8,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <div className={cn(
            'px-4 py-2 rounded-xl',
            'bg-black/80 backdrop-blur-xl',
            'border border-white/20',
            'shadow-xl shadow-black/50'
          )}>
            <span className={cn(
              'text-2xl font-mono font-bold tabular-nums',
              'bg-gradient-to-r bg-clip-text text-transparent',
              gradient
            )}>
              {localValue.toFixed(2)}
            </span>
          </div>
          {/* Arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-black/80 rotate-45 border-r border-b border-white/20" />
        </motion.div>
      )}

      {/* Main Slider */}
      <div
        ref={trackRef}
        className={cn(
          'relative h-14 cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Track Background */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 rounded-full bg-surface-overlay" />

        {/* Tick marks */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 flex justify-between px-0.5">
          {ticks.map((tick) => (
            <div
              key={tick}
              className={cn(
                'w-0.5 h-full rounded-full transition-colors duration-200',
                tick <= localValue ? 'bg-white/30' : 'bg-white/10'
              )}
            />
          ))}
        </div>

        {/* Filled Track with Gradient */}
        <motion.div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 h-2 rounded-full',
            'bg-gradient-to-r',
            gradient
          )}
          style={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        />

        {/* Glow Trail */}
        <motion.div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 h-6 rounded-full blur-lg',
            'bg-gradient-to-r',
            gradient
          )}
          style={{
            width: `${percentage}%`,
            opacity: glowOpacity,
          }}
        />

        {/* Ambient Glow at Thumb */}
        <motion.div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-24 h-24 -ml-12 rounded-full blur-2xl pointer-events-none',
            'bg-gradient-to-r',
            gradient
          )}
          style={{
            left: `${percentage}%`,
            opacity: useTransform(glowOpacity, [0, 1], [0, 0.4]),
          }}
        />

        {/* Thumb */}
        <motion.div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -ml-5',
            'w-10 h-10 rounded-full',
            'bg-white',
            'shadow-xl shadow-black/40',
            'flex items-center justify-center',
            'cursor-grab',
            isDragging && 'cursor-grabbing'
          )}
          style={{ left: `${percentage}%` }}
          animate={{
            scale: isDragging ? 1.2 : 1,
            boxShadow: isDragging
              ? '0 10px 40px rgba(0,0,0,0.5), 0 0 0 4px rgba(255,255,255,0.1)'
              : '0 4px 20px rgba(0,0,0,0.4)'
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          whileHover={{ scale: 1.1 }}
        >
          {/* Inner color indicator */}
          <motion.div
            className={cn(
              'w-5 h-5 rounded-full',
              'bg-gradient-to-br',
              gradient
            )}
            animate={{ scale: isDragging ? 1.1 : 1 }}
          />
        </motion.div>
      </div>

      {/* Scale Labels */}
      <div className="flex justify-between mt-3 px-0.5">
        {[1, 5.5, 10].map((num) => (
          <motion.span
            key={num}
            className={cn(
              'text-sm font-mono transition-colors duration-200',
              Math.abs(localValue - num) < 0.5 ? 'text-white' : 'text-white/30'
            )}
            animate={{
              scale: Math.abs(localValue - num) < 0.5 ? 1.1 : 1,
            }}
          >
            {num === 5.5 ? '5.5' : num}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

/**
 * Animated Rating Display
 * С морфинг-анимацией цифр
 */
export function RatingDisplay({
  value,
  size = 'lg',
  animated = true,
  showGlow = false,
  className,
}: {
  value: number
  size?: 'sm' | 'md' | 'lg' | 'hero' | 'mega'
  animated?: boolean
  showGlow?: boolean
  className?: string
}) {
  const [displayValue, setDisplayValue] = useState(value)
  const prevValueRef = useRef(value)

  useEffect(() => {
    if (!animated) {
      setDisplayValue(value)
      return
    }

    const controls = animate(prevValueRef.current, value, {
      duration: 0.4,
      ease: [0.32, 0, 0.67, 0],
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest * 100) / 100)
      },
    })

    prevValueRef.current = value
    return () => controls.stop()
  }, [value, animated])

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    hero: 'text-7xl',
    mega: 'text-8xl md:text-9xl',
  }

  const gradient = getRatingGradient(displayValue)

  return (
    <motion.div
      className={cn(
        'relative font-mono tracking-tighter tabular-nums font-bold',
        sizeClasses[size],
        className
      )}
      initial={animated ? { opacity: 0, scale: 0.9 } : false}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Glow effect */}
      {showGlow && (
        <motion.div
          className={cn(
            'absolute inset-0 blur-2xl opacity-50',
            'bg-gradient-to-r bg-clip-text',
            gradient
          )}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {displayValue.toFixed(2)}
        </motion.div>
      )}

      {/* Main number */}
      <span className={cn('bg-gradient-to-r bg-clip-text text-transparent relative', gradient)}>
        {displayValue.toFixed(2)}
      </span>
    </motion.div>
  )
}

/**
 * Mini Rating Badge
 * Компактная версия для списков
 */
export function RatingBadge({
  value,
  size = 'md',
  className,
}: {
  value: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const gradient = getRatingGradient(value)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  return (
    <motion.div
      className={cn(
        'inline-flex items-center rounded-full',
        'bg-gradient-to-r',
        gradient,
        'font-mono font-semibold text-white',
        sizeClasses[size],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {value.toFixed(2)}
    </motion.div>
  )
}
