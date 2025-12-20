import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Объединение классов Tailwind без конфликтов
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Форматирование индекса восприятия с двумя знаками после запятой
 */
export function formatPerceptionIndex(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return value.toFixed(2)
}

/**
 * Получение цвета для индекса восприятия
 */
export function getPerceptionColor(value: number): string {
  if (value < 3) return 'text-red-500'
  if (value < 5) return 'text-orange-500'
  if (value < 7) return 'text-yellow-500'
  if (value < 9) return 'text-green-500'
  return 'text-violet-500'
}

/**
 * Получение градиента для индекса восприятия
 */
export function getPerceptionGradient(value: number): string {
  if (value < 3) return 'from-red-500 to-orange-500'
  if (value < 5) return 'from-orange-500 to-yellow-500'
  if (value < 7) return 'from-yellow-500 to-lime-500'
  if (value < 9) return 'from-green-500 to-emerald-500'
  return 'from-violet-500 to-purple-500'
}

// Alias for backwards compatibility
export const getRatingGradient = getPerceptionGradient

/**
 * Уровни уверенности индекса
 */
export type ConfidenceLevel = 'early' | 'emerging' | 'stable'

export interface ConfidenceInfo {
  level: ConfidenceLevel
  label: string
  description: string
  minReactions: number
}

export function getConfidenceLevel(reactionsCount: number): ConfidenceInfo {
  if (reactionsCount < 15) {
    return {
      level: 'early',
      label: 'Ранний сигнал',
      description: 'Недостаточно реакций для стабильного индекса',
      minReactions: 15,
    }
  }
  if (reactionsCount < 70) {
    return {
      level: 'emerging',
      label: 'Формируется',
      description: 'Индекс становится стабильнее',
      minReactions: 70,
    }
  }
  return {
    level: 'stable',
    label: 'Стабильный',
    description: 'Высокая уверенность в индексе',
    minReactions: 150,
  }
}

/**
 * Форматирование процентиля в текст
 */
export function formatPercentile(percentile: number | null): string {
  if (percentile === null) return ''
  const topPercent = Math.round(100 - percentile)
  if (topPercent <= 1) return 'Top 1%'
  return `Top ${topPercent}%`
}

/**
 * Форматирование изменения индекса
 */
export function formatIndexChange(change: number | null): {
  text: string
  isPositive: boolean
  isNeutral: boolean
} {
  if (change === null || change === 0) {
    return { text: '—', isPositive: false, isNeutral: true }
  }

  const isPositive = change > 0
  const text = `${isPositive ? '+' : ''}${change.toFixed(2)}`

  return { text, isPositive, isNeutral: false }
}

/**
 * Получение возрастного диапазона по году рождения
 */
export function getAgeRange(birthYear: number | null): string | null {
  if (!birthYear) return null

  const currentYear = new Date().getFullYear()
  const age = currentYear - birthYear

  if (age < 20) return '18-19'
  if (age < 25) return '20-24'
  if (age < 30) return '25-29'
  if (age < 35) return '30-34'
  if (age < 40) return '35-39'
  if (age < 50) return '40-49'
  return '50+'
}

/**
 * Debounce функция
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Throttle функция
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Генерация случайного ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Задержка выполнения
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Проверка мобильного устройства
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

/**
 * Вибрация на мобильных (если поддерживается)
 */
export function vibrate(pattern: number | number[] = 10): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}
