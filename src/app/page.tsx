'use client'

import { Desktop } from '@/components/Desktop'
import { WindowManagerProvider } from '@/context/WindowManagerContext'

export default function Home() {
  return (
    <WindowManagerProvider>
      <Desktop />
    </WindowManagerProvider>
  )
}
