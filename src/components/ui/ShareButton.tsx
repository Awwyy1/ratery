'use client'

import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface ShareButtonProps {
  rating: number | null
  percentile: number | null
}

export function ShareButton({ rating, percentile }: ShareButtonProps) {
  const handleShare = async () => {
    const text = rating 
      ? `Мой рейтинг на Ratery: ${rating.toFixed(2)} (Top ${percentile?.toFixed(0) || '?'}%) 🔥\n\nУзнай свой: https://ratery-delta.vercel.app`
      : `Узнай свой рейтинг на Ratery! 🔥\n\nhttps://ratery-delta.vercel.app`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ratery — Узнай свой рейтинг',
          text: text,
          url: 'https://ratery-delta.vercel.app',
        })
      } catch (err) {
        // Пользователь отменил
      }
    } else {
      // Fallback — копируем в буфер
      await navigator.clipboard.writeText(text)
      toast.success('Скопировано в буфер обмена!')
    }
  }
  
  return (
    <motion.button
      onClick={handleShare}
      className="flex items-center justify-center gap-2 w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white font-medium transition-colors"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
      Поделиться
    </motion.button>
  )
}
