'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { cn, vibrate } from '@/lib/utils'
import { toast } from 'sonner'

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Валидация
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение')
      return
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимум 10 MB')
      return
    }
    
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
    vibrate(10)
  }, [])
  
  const handleUpload = useCallback(async () => {
    if (!selectedFile) return
    
    setIsUploading(true)
    setUploadProgress(0)
    
    const supabase = createClient()
    
    try {
      // Получаем текущего пользователя
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Не авторизован')
      
      setUploadProgress(20)
      
      // Генерируем имя файла
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      // Загружаем в Storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, selectedFile, {
          cacheControl: '31536000',
          upsert: false,
        })
      
      if (uploadError) throw uploadError
      
      setUploadProgress(60)
      
      // Получаем публичный URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName)
      
      setUploadProgress(80)
      
      // Деактивируем старые фото
      await supabase
        .from('photos')
        .update({ is_active: false })
        .eq('user_id', user.id)
      
      // Создаём запись в БД
      const { error: dbError } = await supabase.from('photos').insert({
        user_id: user.id,
        url: publicUrl,
        thumbnail_url: publicUrl,
        status: 'approved', // MVP: автоодобрение
        is_active: true,
      })
      
      if (dbError) throw dbError
      
      // Обновляем флаг onboarded
      await supabase
        .from('users')
        .update({ is_onboarded: true })
        .eq('id', user.id)
      
      setUploadProgress(100)
      vibrate([10, 50, 10])
      toast.success('Фото загружено!')
      
      // Редирект на оценку
      setTimeout(() => router.push('/rate'), 500)
      
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Ошибка загрузки')
      setIsUploading(false)
    }
  }, [selectedFile, router])
  
  const handleSelectClick = () => {
    fileInputRef.current?.click()
    vibrate(5)
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      {/* Header */}
      <motion.div
        className="text-center pt-12 pb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-display-sm text-text-primary mb-3">
          Загрузи своё фото
        </h1>
        <p className="text-body-md text-text-secondary">
          Одно лицо. Без фильтров.
        </p>
      </motion.div>
      
      {/* Photo preview / placeholder */}
      <motion.div
        className="flex-1 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div
          className={cn(
            'relative w-72 h-72 rounded-3xl overflow-hidden cursor-pointer',
            'border-2 border-dashed transition-colors duration-200',
            preview ? 'border-transparent' : 'border-border hover:border-border-strong'
          )}
          onClick={handleSelectClick}
        >
          <AnimatePresence mode="wait">
            {preview ? (
              <motion.div
                key="preview"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                className="absolute inset-0 flex flex-col items-center justify-center bg-surface"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-20 h-20 rounded-full bg-surface-elevated flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <p className="text-body-sm text-text-tertiary">
                  Нажми чтобы выбрать
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Upload progress overlay */}
          {isUploading && (
            <motion.div
              className="absolute inset-0 bg-black/60 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white animate-spin mb-4 mx-auto" />
                <p className="text-body-sm text-white">{uploadProgress}%</p>
              </div>
            </motion.div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileSelect}
          className="hidden"
        />
      </motion.div>
      
      {/* Hints */}
      <motion.div
        className="py-6 space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <HintRow icon="check" text="Чёткое фото лица" positive />
        <HintRow icon="x" text="Без солнечных очков" positive={false} />
        <HintRow icon="x" text="Только ты на фото" positive={false} />
      </motion.div>
      
      {/* Buttons */}
      <motion.div
        className="space-y-3 pb-8 safe-bottom"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          className="btn-primary w-full"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isUploading ? 'Загрузка...' : 'Загрузить фото'}
        </motion.button>
        
        {preview && !isUploading && (
          <motion.button
            className="btn-ghost w-full"
            onClick={handleSelectClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Выбрать другое
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}

function HintRow({ icon, text, positive }: { icon: 'check' | 'x'; text: string; positive: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center',
        positive ? 'bg-green-500/20' : 'bg-red-500/20'
      )}>
        {icon === 'check' ? (
          <svg className="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <path d="M5 12l5 5L20 7" />
          </svg>
        ) : (
          <svg className="w-3 h-3 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        )}
      </div>
      <span className="text-body-sm text-text-secondary">{text}</span>
    </div>
  )
}
