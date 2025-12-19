import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, RatingStats, Photo } from '@/types/database'

/**
 * Состояние пользователя
 */
interface UserState {
  user: User | null
  stats: RatingStats | null
  photo: Photo | null
  isLoading: boolean
  
  setUser: (user: User | null) => void
  setStats: (stats: RatingStats | null) => void
  setPhoto: (photo: Photo | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      stats: null,
      photo: null,
      isLoading: true,
      
      setUser: (user) => set({ user }),
      setStats: (stats) => set({ stats }),
      setPhoto: (photo) => set({ photo }),
      setLoading: (isLoading) => set({ isLoading }),
      reset: () => set({ user: null, stats: null, photo: null }),
    }),
    {
      name: 'ratery-user',
      partialize: (state) => ({ user: state.user }),
    }
  )
)

/**
 * Состояние оценки
 */
interface RatingState {
  currentScore: number
  viewStartTime: number | null
  isSubmitting: boolean
  
  setScore: (score: number) => void
  startViewing: () => void
  getViewDuration: () => number
  setSubmitting: (submitting: boolean) => void
  reset: () => void
}

export const useRatingStore = create<RatingState>((set, get) => ({
  currentScore: 5.50,
  viewStartTime: null,
  isSubmitting: false,
  
  setScore: (currentScore) => set({ currentScore }),
  startViewing: () => set({ viewStartTime: Date.now() }),
  getViewDuration: () => {
    const { viewStartTime } = get()
    return viewStartTime ? Date.now() - viewStartTime : 0
  },
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  reset: () => set({ currentScore: 5.50, viewStartTime: null }),
}))

/**
 * Состояние онбординга
 */
interface OnboardingState {
  currentStep: number
  hasSeenOnboarding: boolean
  
  nextStep: () => void
  prevStep: () => void
  setStep: (step: number) => void
  completeOnboarding: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      hasSeenOnboarding: false,
      
      nextStep: () => set({ currentStep: get().currentStep + 1 }),
      prevStep: () => set({ currentStep: Math.max(0, get().currentStep - 1) }),
      setStep: (currentStep) => set({ currentStep }),
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
    }),
    {
      name: 'ratery-onboarding',
    }
  )
)

/**
 * UI состояние
 */
interface UIState {
  isMobileMenuOpen: boolean
  isPhotoUploading: boolean
  uploadProgress: number
  
  toggleMobileMenu: () => void
  setPhotoUploading: (uploading: boolean) => void
  setUploadProgress: (progress: number) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  isMobileMenuOpen: false,
  isPhotoUploading: false,
  uploadProgress: 0,
  
  toggleMobileMenu: () => set({ isMobileMenuOpen: !get().isMobileMenuOpen }),
  setPhotoUploading: (isPhotoUploading) => set({ isPhotoUploading }),
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),
}))
