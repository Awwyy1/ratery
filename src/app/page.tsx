import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Главная страница — редирект в зависимости от состояния
 * 
 * - Не авторизован → /onboarding
 * - Авторизован, нет фото → /upload
 * - Авторизован, есть фото → /rate
 */
export default async function HomePage() {
  const supabase = createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/onboarding')
  }
  
  // Проверяем есть ли фото
  const { data: photo } = await supabase
    .from('photos')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()
  
  if (!photo) {
    redirect('/upload')
  }
  
  redirect('/rate')
}
