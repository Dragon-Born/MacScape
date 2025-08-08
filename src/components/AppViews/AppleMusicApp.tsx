'use client'

import React from 'react'

interface AppleMusicAppProps {
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  title?: string
}

export function AppleMusicApp({ onClose, onMinimize, onMaximize, title }: AppleMusicAppProps) {
  return (
    <div className="h-full w-full bg-[#1e1e1e] overflow-hidden rounded-b-xl">
      <iframe
        src="https://load.beastbrain.org/https://music.apple.com/us/browse"
        className="w-full h-full border-none"
        title="Apple Music"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-downloads"
        loading="lazy"
      />
    </div>
  )
} 