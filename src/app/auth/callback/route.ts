import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Проверяем есть ли пользователь
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single()
        
        if (!existingUser) {
          // Создаём нового пользователя
          await supabase.from('users').insert([{
            id: user.id,
            email: user.email,
            language: 'ru',
            is_onboarded: false,
          }])
          
          // Создаём начальную статистику
          await supabase.from('rating_stats').insert([{
            user_id: user.id,
            rating_power: 1.0,
            ratings_received_count: 0,
            ratings_given_count: 0,
            is_rating_visible: false,
          }])
        }
        
        // Проверяем есть ли фото
        const { data: photo } = await supabase
          .from('photos')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()
        
        if (!photo) {
          return NextResponse.redirect(`${origin}/upload`)
        }
        
        return NextResponse.redirect(`${origin}/rate`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
}
