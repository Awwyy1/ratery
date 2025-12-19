'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { RatingCard, NoMoreTargets, RatingLoading } from '@/components/rating/RatingCard'
import { toast } from 'sonner'

interface RatingTarget {
  queueId: string
  photoId: string
  photoUrl: string
  targetUserId: string
  ageRange: string | null
  country: string | null
}

export default function RatePage() {
  const [target, setTarget] = useState<RatingTarget | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [noMoreTargets, setNoMoreTargets] = useState(false)
  
  const supabase = createClient()
  
  // Загрузка следующего для оценки
  const loadNextTarget = useCallback(async () => {
    setIsLoading(true)
    setNoMoreTargets(false)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      // Вызываем RPC функцию или делаем запрос напрямую
      // MVP: простой запрос к очереди
      
      // Сначала проверяем есть ли в очереди
      const { data: queueItem } = await supabase
        .from('rating_queue')
        .select(`
          id,
          photo_id,
          target_user_id,
          photos!inner(url),
          users!rating_queue_target_user_id_fkey(birth_year, country)
        `)
        .eq('rater_user_id', user.id)
        .eq('is_shown', false)
        .eq('is_rated', false)
        .eq('is_skipped', false)
        .order('priority', { ascending: false })
        .limit(1)
        .single()
      
      if (queueItem) {
        // Помечаем как показанное
        await supabase
          .from('rating_queue')
          .update({ is_shown: true })
          .eq('id', queueItem.id)
        
        const photo = queueItem.photos as any
        const targetUser = queueItem.users as any
        
        setTarget({
          queueId: queueItem.id,
          photoId: queueItem.photo_id,
          photoUrl: photo?.url || '',
          targetUserId: queueItem.target_user_id,
          ageRange: targetUser?.birth_year 
            ? getAgeRange(targetUser.birth_year) 
            : null,
          country: targetUser?.country || null,
        })
      } else {
        // Пытаемся сгенерировать очередь
        await generateQueue(user.id)
        
        // Повторно проверяем
        const { data: newQueueItem } = await supabase
          .from('rating_queue')
          .select(`
            id,
            photo_id,
            target_user_id,
            photos!inner(url),
            users!rating_queue_target_user_id_fkey(birth_year, country)
          `)
          .eq('rater_user_id', user.id)
          .eq('is_shown', false)
          .eq('is_rated', false)
          .order('priority', { ascending: false })
          .limit(1)
          .single()
        
        if (newQueueItem) {
          await supabase
            .from('rating_queue')
            .update({ is_shown: true })
            .eq('id', newQueueItem.id)
          
          const photo = newQueueItem.photos as any
          const targetUser = newQueueItem.users as any
          
          setTarget({
            queueId: newQueueItem.id,
            photoId: newQueueItem.photo_id,
            photoUrl: photo?.url || '',
            targetUserId: newQueueItem.target_user_id,
            ageRange: targetUser?.birth_year 
              ? getAgeRange(targetUser.birth_year) 
              : null,
            country: targetUser?.country || null,
          })
        } else {
          setNoMoreTargets(true)
        }
      }
    } catch (error) {
      console.error('Error loading target:', error)
      toast.error('Ошибка загрузки')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])
  
  // Генерация очереди
  const generateQueue = async (userId: string) => {
    try {
      // Получаем ID уже оценённых
      const { data: existingRatings } = await supabase
        .from('ratings')
        .select('rated_id')
        .eq('rater_id', userId)
      
      const ratedIds = existingRatings?.map(r => r.rated_id) || []
      ratedIds.push(userId) // Исключаем себя
      
      // Получаем пользователей с активными фото
      const { data: candidates } = await supabase
        .from('photos')
        .select(`
          id,
          user_id,
          url
        `)
        .eq('is_active', true)
        .eq('status', 'approved')
        .not('user_id', 'in', `(${ratedIds.join(',')})`)
        .limit(10)
      
      if (!candidates || candidates.length === 0) return
      
      // Создаём записи в очереди
      const queueItems = candidates.map((photo, index) => ({
        target_user_id: photo.user_id,
        rater_user_id: userId,
        photo_id: photo.id,
        priority: 10 - index,
        is_shown: false,
        is_rated: false,
        is_skipped: false,
      }))
      
      await supabase.from('rating_queue').insert(queueItems)
    } catch (error) {
      console.error('Error generating queue:', error)
    }
  }
  
  // Отправка оценки
  const handleSubmit = useCallback(async (score: number, viewDurationMs: number) => {
    if (!target) return
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      // Получаем rating_power оценщика
      const { data: raterStats } = await supabase
        .from('rating_stats')
        .select('rating_power')
        .eq('user_id', user.id)
        .single()
      
      const raterPower = raterStats?.rating_power || 1.0
      
      // Создаём оценку
      await supabase.from('ratings').insert({
        rater_id: user.id,
        rated_id: target.targetUserId,
        photo_id: target.photoId,
        score,
        rater_power: raterPower,
        view_duration_ms: viewDurationMs,
        is_counted: true,
      })
      
      // Обновляем очередь
      await supabase
        .from('rating_queue')
        .update({ is_rated: true })
        .eq('id', target.queueId)
      
      // Обновляем счётчик оценщика
      await supabase.rpc('increment_ratings_given', { user_id: user.id })
      
      // Загружаем следующего
      setTarget(null)
      await loadNextTarget()
      
    } catch (error) {
      console.error('Error submitting rating:', error)
      toast.error('Ошибка сохранения')
      throw error
    }
  }, [target, supabase, loadNextTarget])
  
  // Пропуск
  const handleSkip = useCallback(async () => {
    if (!target) return
    
    try {
      await supabase
        .from('rating_queue')
        .update({ is_skipped: true })
        .eq('id', target.queueId)
      
      setTarget(null)
      await loadNextTarget()
    } catch (error) {
      console.error('Error skipping:', error)
    }
  }, [target, supabase, loadNextTarget])
  
  // Загрузка при монтировании
  useEffect(() => {
    loadNextTarget()
  }, [loadNextTarget])
  
  // Рендер
  if (isLoading && !target) {
    return <RatingLoading />
  }
  
  if (noMoreTargets) {
    return <NoMoreTargets onRefresh={loadNextTarget} />
  }
  
  return (
    <AnimatePresence mode="wait">
      {target && (
        <RatingCard
          key={target.queueId}
          target={target}
          onSubmit={handleSubmit}
          onSkip={handleSkip}
          isLoading={isLoading}
        />
      )}
    </AnimatePresence>
  )
}

function getAgeRange(birthYear: number): string {
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
