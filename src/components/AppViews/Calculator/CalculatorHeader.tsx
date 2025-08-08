'use client'

import React from 'react'
import { X, Minus, Square } from 'lucide-react'

interface CalculatorHeaderProps {
  title?: string
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
}

export function CalculatorHeader({ title = 'Calculator', onClose, onMinimize, onMaximize }: CalculatorHeaderProps) {
  return (
    <div 
      className="window-drag-handle flex items-center justify-between px-4 py-3 select-none"
    >
      <div className="flex items-center space-x-2">
        <button onClick={onClose} className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }}>
          <X className="w-3 h-3 text-black/60 opacity-0" aria-hidden />
        </button>
        <button onClick={onMinimize} className="w-3 h-3 rounded-full" style={{ background: '#ffbd2e' }}>
          <Minus className="w-2 h-2 text-black/60 opacity-0" aria-hidden />
        </button>
        <button onClick={onMaximize} className="w-3 h-3 rounded-full" style={{ background: '#28ca42' }}>
          <Square className="w-2 h-2 text-black/60 opacity-0" aria-hidden />
        </button>
      </div>


    </div>
  )
} 