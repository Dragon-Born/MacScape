'use client'

import { Desktop } from '@/components/Desktop'
import { WindowManagerProvider } from '@/context/WindowManagerContext'
import { ContextMenuProvider } from '@/context/ContextMenuContext'
import { useEffect, useState } from 'react'

export default function Home() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const checkIsMobile = () => {
      const ua = (navigator.userAgent || navigator.vendor || (window as any).opera || '').toLowerCase()
      const mobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(ua)
      const smallScreen = window.innerWidth < 900
      // Block either known mobile UAs or when viewport is small, even on desktop when resized
      setIsMobile(mobileUA || smallScreen)
    }
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  if (isMobile) {
    return (
      <div className="min-h-screen w-screen relative overflow-hidden">
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/Desktop/bg-purple.svg)' }}
          aria-hidden
        />
        <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
          <div
            className="max-w-md w-full text-center rounded-2xl border"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(16px) saturate(140%)',
              WebkitBackdropFilter: 'blur(16px) saturate(140%)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="px-6 py-6">
              <div className="text-2xl font-semibold text-white mb-2">Best experienced on desktop</div>
              <p className="text-white/90 leading-relaxed">
                This macOS‑style desktop is not available on mobile screens yet. Please visit from a desktop browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // During first render before detection, render nothing to avoid flicker
  if (isMobile === null) return null

  return (
    <ContextMenuProvider>
      <WindowManagerProvider>
        <Desktop />
      </WindowManagerProvider>
    </ContextMenuProvider>
  )
}
