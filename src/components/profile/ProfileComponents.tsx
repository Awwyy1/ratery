'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { cn, formatRating, formatPercentile, formatRatingChange, getRatingGradient, getPercentileEmoji } from '@/lib/utils'
import type { RatingStats, Photo } from '@/types/database'

interface ProfileHeaderProps {
  photo: Photo | null
  stats: RatingStats | null
}

/**
 * Профиль пользователя — шапка с рейтингом
 */
export function ProfileHeader({ photo, stats }: ProfileHeaderProps) {
  const rating = stats?.current_rating
  const percentile = stats?.percentile
  const change7d = stats?.rating_7d_ago 
    ? (rating ?? 0) - stats.rating_7d_ago 
    : null
  
  const gradient = rating ? getRatingGradient(rating) : 'from-gray-500 to-gray-600'
  const changeInfo = formatRatingChange(change7d)
  
  return (
    <div className="text-center">
      {/* Фото */}
      <motion.div
        className="relative w-40 h-40 mx-auto mb-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring' }}
      >
        {photo ? (
          <Image
            src={photo.url}
            alt="Profile"
            fill
            className="object-cover rounded-full ring-4 ring-surface-elevated"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-surface-elevated flex items-center justify-center">
            <svg className="w-16 h-16 text-text-tertiary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        )}
        
        {/* Glow effect */}
        {rating && (
          <div 
            className={cn(
              'absolute -inset-4 rounded-full blur-2xl opacity-20',
              'bg-gradient-to-r',
              gradient
            )}
          />
        )}
      </motion.div>
      
      {/* Рейтинг */}
      {stats?.is_rating_visible ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Число */}
          <div className={cn(
            'text-rating-hero font-mono tabular-nums mb-2',
            'bg-clip-text text-transparent bg-gradient-to-r',
            gradient
          )}>
            {formatRating(rating)}
          </div>
          
          {/* Изменение */}
          {!changeInfo.isNeutral && (
            <div className={cn(
              'inline-flex items-center gap-1 text-body-md mb-4',
              changeInfo.isPositive ? 'text-green-500' : 'text-red-500'
            )}>
              <svg 
                className={cn('w-4 h-4', !changeInfo.isPositive && 'rotate-180')} 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M7 14l5-5 5 5H7z"/>
              </svg>
              <span>{changeInfo.text} за 7 дней</span>
            </div>
          )}
          
          {/* Процентиль */}
          {percentile !== null && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-elevated border border-border">
              <span className="text-lg">{getPercentileEmoji(percentile)}</span>
              <span className="text-body-md text-text-primary font-medium">
                {formatPercentile(percentile)}
              </span>
            </div>
          )}
        </motion.div>
      ) : (
        <NotEnoughRatings count={stats?.ratings_received_count ?? 0} />
      )}
    </div>
  )
}

/**
 * Карточка "недостаточно оценок"
 */
function NotEnoughRatings({ count }: { count: number }) {
  const minRequired = 20
  const progress = Math.min(100, (count / minRequired) * 100)
  
  return (
    <motion.div
      className="card p-6 max-w-sm mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="text-4xl mb-4">⏳</div>
      
      <h3 className="text-heading-md text-text-primary mb-2">
        Недостаточно оценок
      </h3>
      
      <p className="text-body-sm text-text-secondary mb-4">
        {count} из {minRequired}
      </p>
      
      {/* Progress bar */}
      <div className="progress-bar mb-4">
        <motion.div
          className="progress-bar-fill bg-gradient-to-r from-orange-500 to-yellow-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
      
      <p className="text-caption text-text-tertiary">
        Оценивай других, чтобы получать оценки быстрее
      </p>
    </motion.div>
  )
}

/**
 * Карточка статистики
 */
export function StatsCard({ stats }: { stats: RatingStats | null }) {
  if (!stats) return null
  
  const items = [
    { label: 'Получено оценок', value: stats.ratings_received_count },
    { label: 'Поставлено оценок', value: stats.ratings_given_count },
    { label: 'Вес голоса', value: `${stats.rating_power.toFixed(1)}×` },
  ]
  
  return (
    <motion.div
      className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-heading-md text-text-primary mb-6">Статистика</h3>
      
      <div className="grid grid-cols-3 gap-4">
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <div className="text-display-sm font-mono text-text-primary mb-1">
              {item.value}
            </div>
            <div className="text-caption text-text-tertiary">
              {item.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/**
 * Кнопка выхода
 */
export function LogoutButton({ onLogout }: { onLogout: () => void }) {
  return (
    <motion.button
      className="text-body-sm text-red-500 hover:text-red-400 transition-colors"
      onClick={onLogout}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      Выйти
    </motion.button>
  )
}
