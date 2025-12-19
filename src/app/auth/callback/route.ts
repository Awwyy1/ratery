import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Auth Callback — обработка редиректа после OAuth
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Проверяем есть ли пользователь в нашей таблице users
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Проверяем/создаём запись в users
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single()
        
        if (!existingUser) {
          // Создаём нового пользователя
          await supabase.from('users').insert({
            id: user.id,
            email: user.email,
            language: 'ru',
            is_onboarded: false,
          })
          
          // Создаём начальную статистику
          await supabase.from('rating_stats').insert({
            user_id: user.id,
            rating_power: 1.0,
            ratings_received_count: 0,
            ratings_given_count: 0,
            is_rating_visible: false,
          })
        }
        
        // Проверяем есть ли фото
        const { data: photo } = await supabase
          .from('photos')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()
        
        // Редирект в зависимости от состояния
        if (!photo) {
          return NextResponse.redirect(`${origin}/upload`)
        }
        
        return NextResponse.redirect(`${origin}/rate`)
      }
    }
  }

  // Ошибка — редирект на auth
  return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
}
