/**
 * Типы базы данных Supabase
 * 
 * Сгенерировать автоматически:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
 * 
 * Пока используем ручные типы
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          birth_year: number | null
          gender: 'male' | 'female' | 'other' | null
          country: string | null
          language: string
          is_onboarded: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email?: string | null
          birth_year?: number | null
          gender?: 'male' | 'female' | 'other' | null
          country?: string | null
          language?: string
          is_onboarded?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          birth_year?: number | null
          gender?: 'male' | 'female' | 'other' | null
          country?: string | null
          language?: string
          is_onboarded?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          user_id: string
          url: string
          thumbnail_url: string | null
          status: 'pending' | 'approved' | 'rejected'
          rejection_reason: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          thumbnail_url?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          thumbnail_url?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          rater_id: string
          rated_id: string
          photo_id: string
          score: number
          rater_power: number
          view_duration_ms: number | null
          is_counted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          rater_id: string
          rated_id: string
          photo_id: string
          score: number
          rater_power?: number
          view_duration_ms?: number | null
          is_counted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          rater_id?: string
          rated_id?: string
          photo_id?: string
          score?: number
          rater_power?: number
          view_duration_ms?: number | null
          is_counted?: boolean
          created_at?: string
        }
      }
      rating_stats: {
        Row: {
          id: string
          user_id: string
          current_rating: number | null
          rating_7d_ago: number | null
          rating_30d_ago: number | null
          percentile: number | null
          ratings_received_count: number
          ratings_given_count: number
          rating_power: number
          is_rating_visible: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_rating?: number | null
          rating_7d_ago?: number | null
          rating_30d_ago?: number | null
          percentile?: number | null
          ratings_received_count?: number
          ratings_given_count?: number
          rating_power?: number
          is_rating_visible?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_rating?: number | null
          rating_7d_ago?: number | null
          rating_30d_ago?: number | null
          percentile?: number | null
          ratings_received_count?: number
          ratings_given_count?: number
          rating_power?: number
          is_rating_visible?: boolean
          updated_at?: string
        }
      }
      rating_queue: {
        Row: {
          id: string
          target_user_id: string
          rater_user_id: string
          photo_id: string
          priority: number
          is_shown: boolean
          is_rated: boolean
          is_skipped: boolean
          created_at: string
        }
        Insert: {
          id?: string
          target_user_id: string
          rater_user_id: string
          photo_id: string
          priority?: number
          is_shown?: boolean
          is_rated?: boolean
          is_skipped?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          target_user_id?: string
          rater_user_id?: string
          photo_id?: string
          priority?: number
          is_shown?: boolean
          is_rated?: boolean
          is_skipped?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_next_to_rate: {
        Args: { rater_id: string }
        Returns: {
          queue_id: string
          photo_id: string
          photo_url: string
          target_user_id: string
          age_range: string | null
          country: string | null
        } | null
      }
      submit_rating: {
        Args: {
          p_queue_id: string
          p_rater_id: string
          p_score: number
          p_view_duration_ms: number | null
        }
        Returns: boolean
      }
      recalculate_user_rating: {
        Args: { p_user_id: string }
        Returns: void
      }
    }
    Enums: {
      gender: 'male' | 'female' | 'other'
      photo_status: 'pending' | 'approved' | 'rejected'
    }
  }
}

// Удобные типы для использования
export type User = Database['public']['Tables']['users']['Row']
export type Photo = Database['public']['Tables']['photos']['Row']
export type Rating = Database['public']['Tables']['ratings']['Row']
export type RatingStats = Database['public']['Tables']['rating_stats']['Row']
export type RatingQueue = Database['public']['Tables']['rating_queue']['Row']
