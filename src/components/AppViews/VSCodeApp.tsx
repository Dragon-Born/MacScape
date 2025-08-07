'use client'

import React from 'react'

interface VSCodeAppProps {
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  title?: string
}

export function VSCodeApp({ onClose, onMinimize, onMaximize, title }: VSCodeAppProps) {
  return (
    <div className="h-full w-full bg-[#1e1e1e] overflow-hidden">
      <iframe
        src="https://coder.beastbrain.org"
        className="w-full h-full border-none"
        title="VSCode Online Editor"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-downloads"
        loading="lazy"
      />
    </div>
  )
} 