import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Объединение классов Tailwind без конфликтов
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Форматирование рейтинга с двумя знаками после запятой
 */
export function formatRating(rating: number | null | undefined): string {
  if (rating === null || rating === undefined) return '—'
  return rating.toFixed(2)
}

/**
 * Получение цвета для рейтинга
 */
export function getRatingColor(rating: number): string {
  if (rating < 3) return 'text-red-500'
  if (rating < 5) return 'text-orange-500'
  if (rating < 7) return 'text-yellow-500'
  if (rating < 9) return 'text-green-500'
  return 'text-violet-500'
}

/**
 * Получение градиента для рейтинга
 */
export function getRatingGradient(rating: number): string {
  if (rating < 3) return 'from-red-500 to-orange-500'
  if (rating < 5) return 'from-orange-500 to-yellow-500'
  if (rating < 7) return 'from-yellow-500 to-lime-500'
  if (rating < 9) return 'from-green-500 to-emerald-500'
  return 'from-violet-500 to-purple-500'
}

/**
 * Получение эмодзи для процентиля
 */
export function getPercentileEmoji(percentile: number): string {
  if (percentile >= 99) return '👑'
  if (percentile >= 95) return '🔥'
  if (percentile >= 90) return '⭐'
  if (percentile >= 80) return '✨'
  if (percentile >= 70) return '💫'
  return ''
}

/**
 * Форматирование процентиля в текст
 */
export function formatPercentile(percentile: number | null): string {
  if (percentile === null) return ''
  const topPercent = Math.round(100 - percentile)
  if (topPercent <= 1) return 'Топ 1%'
  return `Топ ${topPercent}%`
}

/**
 * Форматирование изменения рейтинга
 */
export function formatRatingChange(change: number | null): {
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
 * Конвертация кода страны в флаг эмодзи
 */
export function countryCodeToFlag(countryCode: string | null): string {
  if (!countryCode) return ''
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  
  return String.fromCodePoint(...codePoints)
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
