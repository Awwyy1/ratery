'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export function BottomNav() {
  const pathname = usePathname()
  
  const tabs = [
    {
      href: '/rate',
      label: 'Оценить',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      ),
    },
    {
      href: '/profile',
      label: 'Профиль',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      ),
    },
  ]
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-6 pb-safe">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 py-2 px-4"
            >
              <motion.div
                className={isActive ? 'text-white' : 'text-white/50'}
                whileTap={{ scale: 0.9 }}
              >
                {tab.icon}
              </motion.div>
              <span className={`text-xs ${isActive ? 'text-white' : 'text-white/50'}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  className="absolute bottom-1 w-1 h-1 bg-white rounded-full"
                  layoutId="activeTab"
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
