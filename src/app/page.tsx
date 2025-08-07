'use client'

import { Desktop } from '@/components/Desktop'
import { WindowManagerProvider } from '@/context/WindowManagerContext'
import { ContextMenuProvider } from '@/context/ContextMenuContext'

export default function Home() {
  return (
    <ContextMenuProvider>
      <WindowManagerProvider>
        <Desktop />
      </WindowManagerProvider>
    </ContextMenuProvider>
  )
}
