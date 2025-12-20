'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  activeIcon: React.ReactNode
}

const ScaleIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97z"/>
  </svg>
)

const UserIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
  </svg>
)

const tabs: NavItem[] = [
  {
    href: '/rate',
    label: 'Калибровка',
    icon: <ScaleIcon filled={false} />,
    activeIcon: <ScaleIcon filled={true} />,
  },
  {
    href: '/profile',
    label: 'Профиль',
    icon: <UserIcon filled={false} />,
    activeIcon: <UserIcon filled={true} />,
  },
]

/**
 * Premium Bottom Navigation
 *
 * Awwwards-level features:
 * - Morphing active indicator
 * - Glassmorphism background
 * - Icon fill transition
 * - Scale/bounce animations
 * - Spring physics
 * - Glow effects
 */
export function BottomNav() {
  const pathname = usePathname()

  return (
    <motion.nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-black/60 backdrop-blur-2xl',
        'border-t border-white/[0.08]',
        'safe-bottom'
      )}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
    >
      {/* Gradient line on top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="flex items-center justify-around h-20 max-w-md mx-auto px-8">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center justify-center gap-1.5 py-3 px-6 group"
            >
              {/* Active background indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-white/[0.08]"
                    layoutId="navActiveBackground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </AnimatePresence>

              {/* Icon container */}
              <motion.div
                className={cn(
                  'relative z-10 transition-colors duration-300',
                  isActive ? 'text-white' : 'text-white/40 group-hover:text-white/60'
                )}
                whileTap={{ scale: 0.85 }}
                animate={{
                  scale: isActive ? 1 : 0.95,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {/* Glow effect for active icon */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 blur-lg bg-white/30"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1.5 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                {/* Icon with morph */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isActive ? 'active' : 'inactive'}
                    initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="relative z-10"
                  >
                    {isActive ? tab.activeIcon : tab.icon}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Label */}
              <motion.span
                className={cn(
                  'relative z-10 text-xs font-medium transition-colors duration-300',
                  isActive ? 'text-white' : 'text-white/40 group-hover:text-white/60'
                )}
                animate={{
                  opacity: isActive ? 1 : 0.7,
                  y: isActive ? 0 : 2,
                }}
              >
                {tab.label}
              </motion.span>

              {/* Active dot indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-white"
                    layoutId="navActiveDot"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </div>

      {/* Bottom safe area gradient */}
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
    </motion.nav>
  )
}

/**
 * Floating Action Button — Alternative navigation style
 */
export function FloatingNav() {
  const pathname = usePathname()

  return (
    <motion.div
      className={cn(
        'fixed bottom-8 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-2 p-2',
        'bg-black/80 backdrop-blur-2xl',
        'rounded-full border border-white/10',
        'shadow-2xl shadow-black/50'
      )}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href

        return (
          <Link key={tab.href} href={tab.href}>
            <motion.div
              className={cn(
                'relative flex items-center justify-center w-14 h-14 rounded-full',
                'transition-colors duration-300',
                isActive ? 'bg-white text-black' : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isActive ? tab.activeIcon : tab.icon}
            </motion.div>
          </Link>
        )
      })}
    </motion.div>
  )
}
