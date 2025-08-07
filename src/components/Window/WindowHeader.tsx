'use client'

import React from 'react'
import { X, Minus, Square } from 'lucide-react'

interface WindowHeaderProps {
  title: string
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
}

export function WindowHeader({ title, onClose, onMinimize, onMaximize }: WindowHeaderProps) {
  return (
    <div 
      className="flex items-center justify-between border-b px-5 py-3 select-none"
      style={{
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        borderBottomColor: 'rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Window Controls - Traffic Lights */}
      <div className="flex items-center space-x-2">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-3 h-3 rounded-full transition-all duration-150 group flex items-center justify-center"
          style={{
            background: '#ff5f57',
            border: '0.5px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          }}
        >
          <X className="w-1.5 h-1.5 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150" strokeWidth={2.5} />
        </button>
        
        {/* Minimize Button */}
        <button
          onClick={onMinimize}
          className="w-3 h-3 rounded-full transition-all duration-150 group flex items-center justify-center"
          style={{
            background: '#ffbd2e',
            border: '0.5px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Minus className="w-1.5 h-1.5 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150" strokeWidth={2.5} />
        </button>
        
        {/* Maximize Button */}
        <button
          onClick={onMaximize}
          className="w-3 h-3 rounded-full transition-all duration-150 group flex items-center justify-center"
          style={{
            background: '#28ca42',
            border: '0.5px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Square className="w-1 h-1 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150" strokeWidth={2} />
        </button>
      </div>

      {/* Window Title */}
      <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
        <h3 className="text-sm font-medium text-black/70 tracking-tight">{title}</h3>
      </div>

      {/* Right side spacer to balance layout */}
      <div className="w-16"></div>
    </div>
  )
} 